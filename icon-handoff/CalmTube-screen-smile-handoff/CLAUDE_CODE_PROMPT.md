# Prompt for Claude Code

Copy-paste this into Claude Code along with the `export/` folder.

---

I'm adding a new logomark to CalmTube. The design is finalized — your job is to wire it into the codebase, not redesign it.

**Assets in `export/`:**
- `mark-teal-on-parchment.svg` — primary mark (use everywhere by default)
- `mark-parchment-on-teal.svg` — reversed, for dark/teal surfaces
- `app-icon-1024.svg` — master for iOS / Android / PWA app icons
- `favicon.svg` — simplified 32×32 (base notch removed for legibility)
- `header-lockup.svg` — mark + wordmark together
- `HANDOFF.md` — full spec including React component, color tokens, sizing rules, don'ts

**What to do:**

1. **Add a `CalmTubeMark` React component** matching the spec in `HANDOFF.md`. Put it next to the existing `Wordmark` component (same file or sibling).

2. **Update the web app header** — top-left of every authenticated screen — to show the mark before the wordmark. Use `size={28}` mark + `size={22}` wordmark with a 10px gap. Match the lockup in `header-lockup.svg`.

3. **Wire up the favicon** — drop `favicon.svg` into the public root and update `<link rel="icon">` in the document head. Also add `<link rel="apple-touch-icon">` pointing at the 180×180 export of `app-icon-1024.svg`.

4. **Generate the iOS app-icon set** — convert `app-icon-1024.svg` to PNGs at the sizes listed in `HANDOFF.md` (1024, 180, 167, 152, 120, 87, 80, 60, 58, 40). If we have an Xcode project, build the `AppIcon.appiconset`. If it's a PWA, add them to `manifest.json` with appropriate `purpose` values.

5. **PWA manifest** — set `theme_color: "#3A7D7B"` and `background_color: "#F4EFE4"`.

6. **Update the loading / splash screen** if one exists — show the mark at 96–120px on a parchment background, no wordmark.

**Don't:**
- Don't redesign the mark or "improve" the SVG. Use the SVG paths exactly as provided.
- Don't add a third color. The mark is two-tone (`--ct-green` + `--ct-bg`).
- Don't apply rounded corners to exported PNG app icons — iOS masks them itself.
- Don't use the full mark below 24px — switch to `favicon.svg` at favicon sizes.

When done, show me a diff of the touched files and a screenshot of the new header on the channel grid screen.
