const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? '*';

function applyCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export default function handler(req, res) {
  applyCors(res);
  const method = (req.method ?? 'GET').toUpperCase();

  if (method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  res.status(200).json({
    ok: true,
    message: 'Servicio backend verificador CRE operativo.',
    endpoints: {
      get: '/api/permiso?permiso=XXXX',
      post: '/api/permiso'
    },
    documentation: 'Envie numero de permiso mediante GET o lista de permisos en JSON via POST.'
  });
}
