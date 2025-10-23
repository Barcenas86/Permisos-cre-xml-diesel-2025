import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

const CRE_URL = process.env.CRE_URL ?? "https://www.cre.gob.mx/Permisos/index.html";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function resolveExecutablePath() {
  const lambdaPath = await chromium.executablePath;
  if (lambdaPath) return lambdaPath;
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  throw new Error("Chromium executable path not found.");
}

export async function launchBrowser() {
  const executablePath = await resolveExecutablePath();
  const isLambda = Boolean(process.env.AWS_REGION || process.env.AWS_EXECUTION_ENV);

  const launchOptions = {
    args: isLambda ? chromium.args : ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath,
    headless: isLambda && typeof chromium.headless !== "undefined" ? chromium.headless : "new",
    defaultViewport: { width: 1366, height: 900 }
  };

  return puppeteer.launch(launchOptions);
}

export async function withBrowser(work) {
  let browser;
  let page;
  try {
    browser = await launchBrowser();
    page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    return await work(page);
  } finally {
    if (page) await page.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
}

export async function consultarPermiso(page, permiso) {
  if (!permiso) return { permiso, mensaje: "Parametro 'permiso' invalido" };

  await page.goto(CRE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector("#dtFilterNumero", { timeout: 15000 });

  await page.evaluate(() => {
    const el = document.querySelector("#dtFilterNumero");
    if (el) {
      el.value = "";
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });

  await page.type("#dtFilterNumero", permiso, { delay: 10 });
  await page.keyboard.press("Tab");
  await page.waitForSelector("table.dataTable tbody", { timeout: 15000 });
  await page.waitForTimeout(500);

  const filas = await page.$$eval("table.dataTable tbody tr", rows =>
    rows
      .filter(r => r.offsetParent !== null)
      .map(r => Array.from(r.querySelectorAll("td")).map(td => td.innerText.trim()))
  );

  if (!Array.isArray(filas) || filas.length === 0) {
    return { permiso, mensaje: "Permiso no encontrado o no vigente" };
  }

  const normalized = permiso.toLowerCase();
  const exactMatch = filas.find(cols => (cols[0] || "").toLowerCase() === normalized);
  const [perm, statusText, holder, alias] = exactMatch ?? filas[0];
  const vigente = (statusText || "").toLowerCase().includes("vigente");

  return {
    permiso: perm || permiso,
    estatus: statusText || null,
    permisionario: holder || null,
    alias_proyecto: alias || null,
    mensaje: vigente
      ? "Permiso vigente ante la CRE. Factura deducible ante SAT."
      : "Permiso no vigente o no encontrado ante la CRE. Factura no deducible ante SAT."
  };
}
