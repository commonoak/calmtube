// Server-side YouTube Data API v3 proxy — keeps the API key off the client
module.exports = async function handler(req, res) {
  const { endpoint, ...params } = req.query;
  if (!endpoint) return res.status(400).json({ error: "missing endpoint" });

  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  url.searchParams.set("key", process.env.YOUTUBE_API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const ytRes = await fetch(url.toString());
  const data  = await ytRes.json();

  if (endpoint !== "search") {
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  }
  res.json(data);
};
