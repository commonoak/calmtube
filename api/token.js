// Validates the session cookie and returns the user ID.
// No longer calls Google — the cookie IS the session (1-year expiry).
const { createDecipheriv } = require("crypto");

function getKey() {
  return Buffer.from(process.env.ENCRYPTION_KEY, "hex");
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

function decrypt(data) {
  const buf      = Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  const iv       = buf.slice(0, 12);
  const tag      = buf.slice(12, 28);
  const encrypted = buf.slice(28);
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted, null, "utf8") + decipher.final("utf8");
}

module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const cookies = parseCookies(req.headers.cookie);
  if (!cookies.ct_session) return res.status(401).json({ error: "no_session" });
  try {
    const session = JSON.parse(decrypt(cookies.ct_session));
    return res.json({ user_id: session.uid });
  } catch {
    res.setHeader("Set-Cookie", "ct_session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/");
    return res.status(401).json({ error: "invalid_session" });
  }
};
