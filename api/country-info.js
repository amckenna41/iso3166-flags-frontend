// Vercel serverless function — keeps REST_COUNTRIES_API_KEY server-side only.
// Set REST_COUNTRIES_API_KEY in Vercel project environment variables.
module.exports = async function handler(req, res) {
  const { code } = req.query;
  const apiKey = process.env.REST_COUNTRIES_API_KEY;

  // Strict shape check — this endpoint fronts a metered, keyed upstream API, so
  // anything that is not an ISO 3166-1 alpha-2 code is rejected before we spend
  // a request on it. Note req.query values can be arrays (?code=a&code=b).
  if (typeof code !== 'string' || !/^[A-Za-z]{2}$/.test(code)) {
    return res.status(400).json({ error: 'code must be a 2-letter ISO 3166-1 alpha-2 country code' });
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
      // Do not forward upstream auth failures — a 401/403 here advertises that
      // our key is missing or revoked. Collapse everything except 404 to 502.
      console.error(`Upstream REST Countries error for ${code}: ${response.status}`);
      if (response.status === 404) {
        return res.status(404).json({ error: 'Country not found' });
      }
      return res.status(502).json({ error: 'Upstream data source unavailable' });
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (err) {
    console.error('country-info handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
