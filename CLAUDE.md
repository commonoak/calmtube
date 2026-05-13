# CalmTube project context

CalmTube is a kid-safe YouTube web app. Plain HTML/CSS/JS, no framework. Deployed on Vercel at calmtube.vercel.app.

Key non-obvious decisions:
- Auth is handled by Google Identity Services (GIS) directly in the browser — no backend, no Firebase. This is intentional for now to keep it simple.
- No database yet. localStorage only. Cross-device persistence (so parents can manage channels from any device) is the next big infrastructure decision — Firebase Firestore is the planned path when we get there.
- Channel filtering (letting parents pick which channels kids can see) is the most important missing feature. Not built yet.
- Parent PIN is hardcoded as "1234" in config.js — making it user-settable is a known gap.
- The preview panel in Claude Code looks broken/unstyled — this is expected, it doesn't load external files. The real site is the source of truth.
- Timer is 30 minutes by default. Parents can adjust via the modal (5/10/15/20/30/45 min presets).
