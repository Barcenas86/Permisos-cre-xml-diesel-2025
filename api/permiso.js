import { consultarPermisoUnico, consultarPermisosLote } from '../lib/cre';

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'http://192.168.100.20:3000';

function applyCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export default async function handler(req, res) {
  applyCors(res);
  const method = req.method?.toUpperCase() ?? 'GET';

  if (method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    if (method === 'GET') {
      const permiso = req.query?.permiso;
      if (!permiso) {
        res.status(400).json({ error: 'Falta el número de permiso' });
        return;
      }

      const resultado = await consultarPermisoUnico(permiso);
      res.status(200).json(resultado);
      return;
    }

    if (method === 'POST') {
      const permisos = req.body?.permisos;
      if (!Array.isArray(permisos) || permisos.length === 0) {
        res.status(400).json({ error: 'Se requiere un arreglo "permisos" con al menos un valor' });
        return;
      }

      const resultados = await consultarPermisosLote(permisos);
      res.status(200).json(resultados);
      return;
    }

    res.status(405).json({ error: 'Método no permitido. Usa GET o POST.' });
  } catch (error) {
    console.error('[permiso]', error);
    res.status(500).json({ error: 'Error inesperado', detail: error.message });
  }
}
