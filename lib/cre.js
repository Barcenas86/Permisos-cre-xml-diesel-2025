import pRetry from "p-retry";
import pTimeout from "p-timeout";
import { withBrowser, consultarPermiso } from "./puppeteer-utils";

const REQUEST_TIMEOUT_MS = Number.parseInt(process.env.REQUEST_TIMEOUT_MS ?? "45000", 10);
const RETRY_ATTEMPTS = Math.max(Number.parseInt(process.env.RETRY_ATTEMPTS ?? "2", 10), 0);

export async function consultarPermisoUnico(permiso) {
  return withBrowser(page =>
    pRetry(() => pTimeout(consultarPermiso(page, permiso), REQUEST_TIMEOUT_MS), {
      retries: RETRY_ATTEMPTS,
      minTimeout: 1000
    })
  );
}

export async function consultarPermisosLote(permisos) {
  return withBrowser(async page => {
    const results = [];
    for (const permiso of permisos) {
      const result = await pRetry(
        () => pTimeout(consultarPermiso(page, permiso), REQUEST_TIMEOUT_MS),
        { retries: RETRY_ATTEMPTS, minTimeout: 1000 }
      );
      results.push(result);
    }
    return results;
  });
}
