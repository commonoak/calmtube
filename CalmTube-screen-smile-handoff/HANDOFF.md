# CalmTube — Logomark Handoff

The "Screen-smile" mark. A tiny television with a horizon-smile cut into it — borrows the wordmark's smile-dot vocabulary, says "video" without saying "play triangle."

---

## Files in this folder

| File | Use |
|---|---|
| `mark-teal-on-parchment.svg`  | **Primary mark** — teal on parchment. Use everywhere by default. |
| `mark-ink-on-parchment.svg`   | Monochrome ink on parchment. Use when teal is unavailable / on press. |
| `mark-parchment-on-teal.svg`  | Reversed — parchment on teal. Use on teal surfaces. |
| `mark-monochrome-ink.svg`     | Pure ink on white. Use for stamps, print, embossing. |
| `app-icon-1024.svg`           | iOS / Android app icon at 1024×1024 — parchment squircle bg + mark centered. Export PNG @ 1024, 512, 180, 167, 152, 120, 87, 80, 60, 58, 40. |
| `favicon.svg`                 | Simplified 32×32 — base notch dropped because it disappears at this size. Use for favicon, browser tab. |
| `header-lockup.svg`           | Mark + wordmark together, baseline aligned, 280×56. Use in the web app's top-left. |

---

## Inline SVG (paste-ready)

The full 64×64 mark — substitute `var(--ct-green)` / `var(--ct-bg)` for your token names:

```html
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CalmTube">
  <rect x="8" y="14" width="48" height="36" rx="7" fill="var(--ct-green, #3A7D7B)"/>
  <rect x="13" y="19" width="38" height="26" rx="3.2" fill="var(--ct-bg, #F4EFE4)"/>
  <path d="M21 33 Q 32 39, 43 33"
        stroke="var(--ct-green, #3A7D7B)" stroke-width="2.6"
        stroke-linecap="round" fill="none"/>
  <rect x="27" y="50" width="10" height="2.4" rx="1.2" fill="var(--ct-green, #3A7D7B)"/>
</svg>
```

Size it with CSS — `width: 32px; height: 32px;` etc. The mark holds down to 24px; below that, use `favicon.svg` instead.

---

## React component

```jsx
// CalmTubeMark.tsx
type MarkProps = { size?: number; tone?: 'light' | 'dark'; className?: string };

export function CalmTubeMark({ size = 32, tone = 'light', className }: MarkProps) {
  const fg = tone === 'dark' ? '#F4EFE4' : '#3A7D7B';
  const bg = tone === 'dark' ? '#3A7D7B' : '#F4EFE4';
  return (
    <svg
      width={size} height={size} viewBox="0 0 64 64"
      role="img" aria-label="CalmTube"
      className={className}
    >
      <rect x="8" y="14" width="48" height="36" rx="7" fill={fg}/>
      <rect x="13" y="19" width="38" height="26" rx="3.2" fill={bg}/>
      <path d="M21 33 Q 32 39, 43 33"
            stroke={fg} strokeWidth="2.6" strokeLinecap="round" fill="none"/>
      <rect x="27" y="50" width="10" height="2.4" rx="1.2" fill={fg}/>
    </svg>
  );
}
```

---

## Header lockup (the web app's top-left)

The existing `<Wordmark>` from `tokens.jsx` already renders "Calm" (serif italic) + "tube" (sans bold). Drop the mark in front of it:

```jsx
<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
  <CalmTubeMark size={28} />
  <Wordmark size={22} />
</div>
```

**Spacing rules**
- Gap between mark and wordmark: `0.36 × mark-size` (≈ 10px at 28px mark).
- Mark height ≈ 1.27× wordmark cap-height (so at `size={22}` wordmark, use `size={28}` mark).
- On compact viewports / collapsed nav, drop the wordmark and show the mark alone.

---

## App icon

The `app-icon-1024.svg` is the master. Export PNGs at every iOS-required size:

| Size | Use |
|---|---|
| 1024² | App Store |
| 180² | iPhone @3× home screen |
| 167² | iPad Pro @2× |
| 152² | iPad @2× |
| 120² | iPhone @2× home |
| 87² · 80² · 60² | Settings / Spotlight |
| 58² · 40² | Notifications |

Then either generate an `AppIcon.appiconset` (Xcode) or stick all of them in `public/icons/` for a PWA `manifest.json`.

**Don't** apply your own corner radius to the PNGs — iOS masks them with its own superellipse. The `app-icon-1024.svg` includes a rounded clip for **non-iOS contexts** (Android adaptive icons, PWA splash, marketing).

---

## Color tokens (reminder)

```css
--ct-green:     #3A7D7B;  /* primary teal */
--ct-bg:        #F4EFE4;  /* parchment */
--ct-cream:     #FBF7EC;
--ct-ink:       #15140F;
```

The mark uses **only** `--ct-green` (foreground) and `--ct-bg` (well). Don't introduce a third color — the mark is intentionally two-tone.

---

## Don'ts

- ❌ Don't add a stroke around the outer rect — the silhouette is the stroke.
- ❌ Don't add shadows / gradients to the mark itself. Shadow belongs on the app-icon tile, not the glyph.
- ❌ Don't recolor the smile separately from the screen body — they share one ink.
- ❌ Don't use below 24px. Switch to `favicon.svg` (no base notch).
- ❌ Don't rotate, tilt, or animate the smile into a frown. The smile is the brand.

---

## Sizing reference

| Context | Mark size |
|---|---|
| Favicon | 16–32px (use `favicon.svg`) |
| Header nav | 28–32px |
| Login hero (alongside wordmark) | 40–48px |
| Loading / splash | 96–120px |
| App icon master | 1024px (use `app-icon-1024.svg`) |
