const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { apiKey, messages, systemPrompt } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'API key required' });
  }

  const payload = JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const apiReq = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', chunk => data += chunk);
      apiRes.on('end', () => {
        res.status(apiRes.statusCode).json(JSON.parse(data));
        resolve();
      });
    });

    apiReq.on('error', (e) => {
      res.status(500).json({ error: e.message });
      resolve();
    });

    apiReq.write(payload);
    apiReq.end();
  });
};
