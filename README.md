# Verificador de Permisos CRE - Backend (Vercel)

API serverless que consulta el catalogo de permisos de la CRE usando Puppeteer Core junto con chrome-aws-lambda, lista para desplegarse en Vercel.

## Endpoints

- **GET `/api/permiso?permiso=PL/XXXX/EXP/ES/AAAA`**  
  Devuelve un objeto con los campos `permiso`, `estatus`, `permisionario`, `alias_proyecto` y `mensaje`.
- **POST `/api/permiso`**  
  Acepta un cuerpo JSON con la forma `{"permisos": ["PL/...","PL/..."]}` y responde con un arreglo de objetos como el del endpoint GET.

La ruta raiz `/` entrega un mensaje JSON con instrucciones rapidas gracias a un rewrite definido en `vercel.json`.

## Variables de entorno

- `ALLOWED_ORIGIN` (opcional): origen permitido para CORS. Por defecto `*`.
- `CRE_URL` (opcional): URL de la pagina oficial de permisos.
- `REQUEST_TIMEOUT_MS` y `RETRY_ATTEMPTS` (opcionales): controlan timeout y reintentos del scraping.
- `CHROMIUM_PATH` o `PUPPETEER_EXECUTABLE_PATH` (solo desarrollo local): ruta del ejecutable de Chrome/Chromium si no estas en Vercel.

## Desarrollo local

```bash
npm install
CHROMIUM_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe" npm run dev
# GET  -> http://localhost:3000/?permiso=CNE/PL/516/EXP/ES/2025
# POST -> curl -X POST http://localhost:3000 ^
#           -H "content-type: application/json" ^
#           -d "{\"permisos\":[\"CNE/PL/516/EXP/ES/2025\"]}"
```

El servidor local agrega CORS y responde igual que la funcion de Vercel.

## Despliegue en Vercel

1. Publica este repositorio en GitHub.
2. Importa el repo en Vercel y elige Node.js 18 o superior.
3. Define las variables de entorno necesarias (si aplica) y despliega.  
   Vercel creara la funcion `api/permiso` con los limites configurados en `vercel.json`.

## Notas para produccion

- Respeta limites de peticiones en tu frontend; la pagina de la CRE puede bloquear accesos.
- Mantente atento a posibles cambios en la estructura HTML de la pagina oficial.
- Implementa cache en tu proyecto si necesitas reducir llamadas de scraping.
