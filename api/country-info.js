// Vercel serverless function — keeps REST_COUNTRIES_API_KEY server-side only.
// Set REST_COUNTRIES_API_KEY in Vercel project environment variables.
module.exports = async function handler(req, res) {
  const { code } = req.query;
  const apiKey = process.env.REST_COUNTRIES_API_KEY;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'code query parameter is required' });
  }

  if (!apiKey) {
    console.error('REST_COUNTRIES_API_KEY environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const url = `https://api.restcountries.com/countries/v5/codes.alpha_2/${encodeURIComponent(code.toUpperCase())}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Upstream error: ${response.status}` });
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (err) {
    console.error('country-info handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
