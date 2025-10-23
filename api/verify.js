import { consultarPermisoUnico } from '../lib/cre';

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

  const permiso = req.query?.permiso ?? req.body?.permiso;
  if (!permiso) {
    res.status(400).json({ error: 'Falta el número de permiso' });
    return;
  }

  try {
    const resultado = await consultarPermisoUnico(permiso);
    res.status(200).json(resultado);
  } catch (error) {
    console.error('[verify]', error);
    res.status(500).json({ error: 'Error en la verificación', detail: error.message });
  }
}
