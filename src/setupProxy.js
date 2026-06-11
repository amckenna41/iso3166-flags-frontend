// Intercepts /api/country-info during local CRA dev (npm start).
// The API key lives in process.env (Node.js server side) — never bundled into the browser.
// Set REST_COUNTRIES_API_KEY in .env.local for local development.
const axios = require('axios');

module.exports = function setupProxy(app) {
  app.get('/api/country-info', async (req, res) => {
    const { code } = req.query;
    const apiKey = process.env.REST_COUNTRIES_API_KEY;

    if (!code) {
      return res.status(400).json({ error: 'code query parameter is required' });
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
