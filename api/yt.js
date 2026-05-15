// Server-side YouTube Data API v3 proxy — keeps the API key off the client
module.exports = async function handler(req, res) {
  const { endpoint, ...params } = req.query;
  if (!endpoint) return res.status(400).json({ error: "missing_endpoint" });
  if (!process.env.YOUTUBE_API_KEY) return res.status(500).json({ error: "api_key_not_configured" });

  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  url.searchParams.set("key", process.env.YOUTUBE_API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const ytRes = await fetch(url.toString());
  const data  = await ytRes.json();

  // Forward YouTube errors with the correct status so the client can handle them
  if (!ytRes.ok) return res.status(ytRes.status).json(data);

  if (endpoint !== "search") {
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  }
  res.json(data);
};
