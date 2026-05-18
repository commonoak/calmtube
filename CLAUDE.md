# CalmTube project context

CalmTube is a kid-safe YouTube web app. Plain HTML/CSS/JS, no framework. Deployed on Vercel at calmtube.vercel.app.

Key non-obvious decisions:
- Auth is a custom server-side OAuth flow on Vercel functions (`api/auth.js`, `api/token.js`, `api/logout.js`). Google `code` is exchanged for tokens, then `{refresh_token, uid}` is AES-256-GCM encrypted and stored in an HttpOnly `ct_session` cookie with `Max-Age=31536000` (1 year). `api/token.js` decrypts the cookie to recover the user id — Google is NOT called on every session check.
- Firebase Firestore is in use for cross-device channel persistence. `users/{uid}.channels` holds the parent's channel list; localStorage (`calmtube_channels`) is the fast cache. See `loadChannelList` / `saveChannelList` in app.js.
- Channel selection (parents pick which channels kids can see) is implemented — search + recommended (NatGeo, BBC Earth) + add/remove in the selector screen.
- Parent PIN is hardcoded as "1234" in config.js — making it user-settable is a known gap.
- The preview panel in Claude Code looks broken/unstyled — this is expected, it doesn't load external files. The real site is the source of truth.
- Timer is 30 minutes by default. Parents can adjust via the modal (5/10/15/20/30/45 min presets).
- Deployed on Vercel at calmtube.vercel.app, auto-deploys from `main` on github.com/commonoak/calmtube.
- Player uses `youtube-nocookie.com` embeds (not standard `youtube.com/embed`). Two consequences worth knowing: (1) no tracking cookies are set until the user clicks play, and ads are never personalized — this is a hard guarantee; (2) viewers see noticeably fewer ads than on youtube.com, because YouTube serves fewer ad slots on embeds AND because the cookie-free context starves the ad-targeting auction (low bids → often no ad served). Often = ad-free in practice, but never claim "ad-free" — pre-rolls do still occur. Marketing copy may say "fewer ads, never personalized." Do NOT recommend ad-blocker extensions on the site: it violates YouTube ToS, risks the Data API key being revoked, and hurts the creators we recommend.
