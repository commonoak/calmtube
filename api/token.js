// Returns a fresh YouTube access token using the stored session cookie
const { createDecipheriv } = require("crypto");

const CLIENT_ID     = "1062331234884-p9ql2mlv8m0ufhuhl126tt73j2s4uosp.apps.googleusercontent.com";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

function getKey() {
  return Buffer.from(process.env.ENCRYPTION_KEY, "hex");
}

function decrypt(data) {
  const buf       = Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  const iv        = buf.slice(0, 12);
  const tag       = buf.slice(12, 28);
  const encrypted = buf.slice(28);
  const decipher  = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted, null, "utf8") + decipher.final("utf8");
}

function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  header.split(";").forEach(c => {
    const [k, ...v] = c.trim().split("=");
    if (k) cookies[k.trim()] = v.join("=");
  });
  return cookies;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const cookies = parseCookies(req.headers.cookie);
  if (!cookies.ct_session) {
    return res.status(401).json({ error: "no_session" });
  }

  let session;
  try {
    session = JSON.parse(decrypt(cookies.ct_session));
  } catch {
    res.setHeader("Set-Cookie", "ct_session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/");
    return res.status(401).json({ error: "invalid_session" });
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: session.rt,
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type:    "refresh_token",
    }).toString(),
  });

  const tokens = await tokenRes.json();

  if (tokens.error) {
    res.setHeader("Set-Cookie", "ct_session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/");
    return res.status(401).json({ error: "session_expired" });
  }

  res.json({
    access_token: tokens.access_token,
    expires_in:   tokens.expires_in,
    user_id:      session.uid,
  });
};
