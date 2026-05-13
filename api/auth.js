// OAuth callback — exchanges Google auth code for tokens, sets session cookie
const { createCipheriv, randomBytes } = require("crypto");

const CLIENT_ID     = "1062331234884-p9ql2mlv8m0ufhuhl126tt73j2s4uosp.apps.googleusercontent.com";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI  = "https://calmtube.vercel.app/api/auth";

function getKey() {
  return Buffer.from(process.env.ENCRYPTION_KEY, "hex");
}

function encrypt(text) {
  const iv       = randomBytes(12);
  const cipher   = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag      = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted])
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

module.exports = async function handler(req, res) {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect("/?auth_error=1");
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri:  REDIRECT_URI,
        grant_type:    "authorization_code",
      }).toString(),
    });

    const tokens = await tokenRes.json();

    if (tokens.error || !tokens.refresh_token) {
      console.error("Token exchange error:", tokens.error || "no refresh_token");
      return res.redirect("/?auth_error=1");
    }

    // Decode user ID from the ID token (JWT — no signature verification needed here,
    // the token came directly from Google over HTTPS)
    const idPayload = JSON.parse(
      Buffer.from(tokens.id_token.split(".")[1], "base64").toString()
    );

    const payload   = JSON.stringify({ rt: tokens.refresh_token, uid: idPayload.sub });
    const encrypted = encrypt(payload);

    res.setHeader(
      "Set-Cookie",
      `ct_session=${encrypted}; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000; Path=/`
    );
    res.redirect("/?fresh=1");
  } catch (err) {
    console.error("Auth handler error:", err);
    res.redirect("/?auth_error=1");
  }
};
