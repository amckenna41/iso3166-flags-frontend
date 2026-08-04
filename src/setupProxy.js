// Intercepts /api/country-info during local CRA dev (npm start).
// The API key lives in process.env (Node.js server side) — never bundled into the browser.
// Set REST_COUNTRIES_API_KEY in .env.local for local development.
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  // ponytail: dev-only workaround for the ISO 3166-2 API not sending
  // Access-Control-Allow-Origin. Same-origin here, so the browser never runs a
  // CORS check. Delete this block (and REACT_APP_ISO3166_2_API in .env.local)
  // once the API's after_request CORS hook is deployed.
  app.use(
    '/api/iso3166-2',
    createProxyMiddleware({
      target: 'https://iso3166-2-api.vercel.app',
      changeOrigin: true,
      pathRewrite: { '^/api/iso3166-2': '/api' },
    })
  );

  app.get('/api/country-info', async (req, res) => {
    const { code } = req.query;
    const apiKey = process.env.REST_COUNTRIES_API_KEY;

    // Mirror the validation in api/country-info.js so dev and prod behave alike
    if (typeof code !== 'string' || !/^[A-Za-z]{2}$/.test(code)) {
      return res.status(400).json({ error: 'code must be a 2-letter ISO 3166-1 alpha-2 country code' });
    }

    if (!apiKey) {
      console.warn('[setupProxy] REST_COUNTRIES_API_KEY is not set in .env.local');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
      const { data } = await axios.get(
        `https://api.restcountries.com/countries/v5/codes.alpha_2/${encodeURIComponent(code.toUpperCase())}`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );
      return res.json(data);
    } catch (err) {
      const status = err.response?.status ?? 500;
      return res.status(status).json({ error: 'Failed to fetch country data' });
    }
  });
};
