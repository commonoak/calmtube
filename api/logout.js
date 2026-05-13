// Clears the session cookie
module.exports = function handler(req, res) {
  res.setHeader("Set-Cookie", "ct_session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/");
  res.json({ ok: true });
};
