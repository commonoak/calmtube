# Handoff: CalmTube — Mobile UI Redesign

## Overview

CalmTube is a kid-safe YouTube viewer for families. Parents sign in with Google, kids see a clean grid of subscribed channels — no algorithm, no autoplay, no recommendations. A built-in timer (default 30 min) nudges kids outside; a PIN-protected modal lets parents reset it.

This handoff redesigns all 8 screens of the existing v1 build (green / DM Sans / white) toward a more **editorial-warm** direction inspired by ai-pilled.com and di.gg/ai — premium feel, generous whitespace, confident typography, while staying warm enough for a kid-facing app.

## About the design files

The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior. They are **not production code to copy directly.** Recreate them in the existing CalmTube codebase using its established React patterns, styling solution, and component primitives. If the codebase doesn't yet have a strong pattern for any of these screens, use the prototype as the source of truth for visual design and adapt the implementation to your stack.

The prototypes use plain inline-style React + a small token module. Your codebase likely uses Tailwind, CSS modules, or styled-components — translate the tokens (below) to your idiom rather than porting inline styles.

## Fidelity

**High-fidelity.** All colors, typography, spacing, border radii, and shadows are final. Implement pixel-accurate to the prototypes. Channel avatars and video thumbnails are striped SVG placeholders — your implementation will pull real YouTube imagery.

---

## Design Tokens

### Colors

| Token | Value | Use |
|---|---|---|
| `bg` | `#F4EFE4` | Page background (parchment) |
| `bgDeep` | `#EBE4D2` | Slightly deeper parchment, parent strips |
| `cream` | `#FBF7EC` | Card background |
| `white` | `#FFFFFF` | Pure white surfaces (rare) |
| `ink` | `#15140F` | Primary text, primary button bg |
| `inkSoft` | `#3C3A33` | Secondary text |
| `inkMuted` | `#6B665A` | Tertiary text, mono labels |
| `inkFaint` | `#9A9485` | Faint micro-copy |
| `hairline` | `#D6CFBE` | Hairline rules, card borders |
| `green` | `#2D6A4F` | **Brand primary** (evolved from old `#059669`) |
| `greenInk` | derived | Hover/pressed primary |
| `greenSoft` | derived | Tinted surface (PIN active, timer pill bg) |
| `greenFaint` | derived | Very faint tint |
| `sand` | `#E8DCC0` | Avatar accents, account chip |
| `sandSoft` | `#F1E8D3` | Secondary cream |
| `black` | `#0B0B0A` | Video player background |
| `blackSoft` | `#1A1A17` | Video player chrome |

The four green variants are derived live in CSS via `color-mix(in oklch, ...)`:
```css
:root {
  --ct-green: #2D6A4F;
  --ct-green-ink:   color-mix(in oklch, var(--ct-green) 78%, #000 22%);
  --ct-green-soft:  color-mix(in oklch, var(--ct-green) 22%, #F4EFE4 78%);
  --ct-green-faint: color-mix(in oklch, var(--ct-green) 10%, #F4EFE4 90%);
  --ct-green-10:    color-mix(in oklch, var(--ct-green) 12%, transparent);
  --ct-green-20:    color-mix(in oklch, var(--ct-green) 22%, transparent);
}
```
You can hardcode the resolved values if your build target doesn't support `color-mix`.

### Typography

Three families, loaded from Google Fonts:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Lora:ital,wght@0,400;0,500;1,400;1,500&family=JetBrains+Mono:wght@400;500&display=swap"/>
```

| Family | Use |
|---|---|
| **Lora** (italic for emphasis) | Display headlines — hero "A calmer way to *watch.*", section titles, modal titles, settings page |
| **DM Sans** | All UI text — buttons, body copy, video titles, channel names |
| **JetBrains Mono** | Micro-labels — small-caps overline labels ("PARENT CONTROLS", "SET TIMER TO", "5K VIEWS · 2 DAYS AGO"), metadata, version stamps |

**Type scale** (px / line-height / letter-spacing):

| Role | Family | Size | LH | LS | Weight |
|---|---|---|---|---|---|
| Hero display | Lora | 56 | 1.02 | -0.025em | 400 |
| Display | Lora | 48 | 1 | -0.025em | 400 |
| Section title | Lora italic | 34–38 | 1 | -0.02em | 400 |
| Modal title | Lora | 36 | 1 | -0.02em | 400 |
| Channel name (detail) | Lora | 30 | 1.05 | -0.02em | 400 |
| Video title | DM Sans | 17 | 1.3 | -0.01em | 600 |
| Button label | DM Sans | 16–17 | 1 | -0.01em | 600 |
| Channel name (card) | DM Sans | 15 | 1 | -0.01em | 600 |
| Body | DM Sans | 14–15 | 1.5 | normal | 400 |
| Mono label | JetBrains Mono | 10–11 | 1 | 0.14em | 500 (UPPERCASE) |

Italic usage: Lora italic is reserved for **emphasized words inside a headline**, e.g. "Mark *Rober*", "Time to go *outside.*", "*Settings.*", "What can *your kids* watch today?" — never italicize the full headline.

### Spacing & radii

- Base unit: **4px**. Common spacings: 4, 8, 10, 12, 14, 16, 20, 22, 24, 28, 32, 40, 60.
- **Border radius**: 8 (small chips), 12–14 (input rows, secondary buttons), 16 (primary CTAs), 22 (channel cards), 28 (modal sheet), 999 (pills, avatars, circular buttons).
- **Shadows**:
  - `shadow`: `0 1px 2px rgba(20,18,12,0.04), 0 8px 24px -10px rgba(20,18,12,0.08)` — card lift
  - `shadowLg`: `0 2px 4px rgba(20,18,12,0.05), 0 18px 40px -16px rgba(20,18,12,0.14)` — modal lift

### Hit targets

All interactive elements ≥ **48 × 48 px** (channel card 184px tall, PIN box 64px, primary CTA 60px, secondary CTA 52px, header back button 44px). Designed primarily for iPad finger-tap; iPhone-tested.

---

## Screens

iPhone reference width = **393 px**, height = **852 px** (iPhone 14 Pro). Safe area top ≈ 47, bottom ≈ 34.

### 01 — Login / Hero

- **Purpose**: Parent's first impression. Make them want to sign in.
- **Layout**: Full-bleed parchment. Top: small wordmark + mono version label, edge-to-edge. Vertical stack from ~96px down: green mono overline → 56px Lora hero "A calmer way to *watch.*" → 17px DM Sans subtitle. Below subtitle: a numbered editorial feature list (3 items, mono numbers `01/02/03` in green, hairline rules above and below the block). Bottom: 60px black primary CTA "Continue with Google" with a tiny circled-check icon, mono helper text below.
- **CTA**: `bg: ink (#15140F)`, white text, radius 16, 60px tall, gap 12 between icon and label.
- **Copy**:
  > A FOCUSED VIEWER FOR YOUTUBE  
  > A calmer way to *watch.*  
  > CalmTube shows kids only the channels you subscribe to. No algorithm. No autoplay. No rabbit holes.  
  > 01 — Subscribed channels, nothing else  
  > 02 — No autoplay or recommendations  
  > 03 — A timer that nudges kids outside  
  > [Continue with Google]  
  > USES YOUR EXISTING YOUTUBE SUBSCRIPTIONS

### 02 — Channel Grid (kid home)

- **Purpose**: The most-used screen. A child taps to enter a channel.
- **Layout**: Header row (wordmark left, timer pill right) → hairline rule → editorial section header ("YOUR CHANNELS" mono + "Pick *one.*" Lora italic 34px, with `8 / 8` count on the right) → 2-column grid of channel cards, 14px gap.
- **Channel card**: cream bg, hairline border, radius 22, padding `22 16 18`, min-height 184. Vertical stack: circular avatar 92px → channel name (DM Sans 15, centered) → mono sub-count (10px, 0.12em tracking).
- **Avatar treatment**: Circular, deterministically tinted oklch swatch per channel name with a 35°-rotated stripe pattern overlay at 18% opacity, italic Lora monogram (initials) centered. Real implementation: use the channel's YouTube thumbnail with `border-radius: 50%; border: 1px solid hairline;`.
- **Timer pill**: green tint surface, mono 14px "20 min left", lock icon in inner pill on the right. See "Components" below.

### 03 — Channel Detail

- **Purpose**: Kid has tapped a channel; sees their videos.
- **Layout**: Sticky header zone (sits above scroll), then scrollable video list.
  - **Header**:
    1. Row: circular 44px back button (cream, hairline, left-arrow icon) — timer pill (right)
    2. Channel identity: 56px circular avatar — left-stacked "CHANNEL" mono label and channel name in Lora 30px (with italic emphasis on a word)
    3. Sort tabs row: pill segmented control "New" / "Popular" (active = ink bg, white text; inactive = transparent + hairline border) — right side shows mono "24 VIDEOS"
- **Video card**: 16:9 thumbnail with a `1:13:45` duration chip bottom-right (rgba(11,11,10,0.82) bg, mono 11, radius 6, padding `4 8`). Below thumb: 17px DM Sans 600 title (2-line clamp), then a mono meta row `420K VIEWS · 2 DAYS AGO`.
- **Divider**: 1px hairline between cards.

### 04 — Video Player

- **Purpose**: Watch one video, distraction-free. Dark mode.
- **Layout**: Black (`#0B0B0A`) bg, white text.
  1. Header: "Back" rounded pill (rgba white 0.08 bg, white border 0.14), timer pill in dark variant.
  2. Video frame: 16:9 area, slightly darker `#0F0F0E`, striped placeholder pattern at 18% opacity (rotated 25°), 76px circular liquid-glass play button center, mono "VIDEO · 1080P" label top-left.
  3. Scrubber: 3px track (rgba white 0.15) with 34% green fill and a 14px white circle handle. Mono time labels "04:08 / 12:04".
  4. Meta block: mono "NOW PLAYING" → 28px Lora title with italic emphasis → channel row (32px avatar, channel name in DM Sans 14 white-75, separator dot, mono "2 DAYS AGO").
  5. Bottom controls: three 56px circles — back-skip (outline), play (filled white, ink play triangle), queue/list (outline). Distributed `space-around`.

### 05 — Time's Up

- **Purpose**: Soft, friendly stop. Kid taps illustration to get a parent.
- **Layout**: Vertical gradient `#F7F2E5 → #EFE6D0`. Header row (wordmark + mono "0:00 REMAINING"). Centered illustration. Below: green mono overline "THE TIMER HAS RUN OUT", 52px Lora "Time to go *outside.*", body sentence. Footer: mono hint "TAP ILLUSTRATION · PARENT ONLY".
- **Illustration**: 260×260 circular badge with hairline border, soft white-35% fill, large warm drop shadow `0 30px 50px -20px rgba(80,60,20,0.18)`. Inside (clip-path circle): an **original ink-line landscape** drawn from SVG primitives — sun with rays top-right, two birds top-left, two distant hill curves, a ground line, a path snaking up, a leafy tree left, a smaller round tree right, tiny grass tufts, light hatching shade. Stroke `#2A2620`, 1.3px width, rounded line caps. **Do not** use external illustration assets — re-implement these primitives in SVG (or commission a similar illustration in the same ink-line style on parchment if you want a richer asset later).
- **Tap target**: The whole illustration is the tap target → opens the Parent Modal (Screen 06).

### 06 — Parent Modal (PIN + Timer Reset)

- **Purpose**: Parent enters PIN, picks a new timer.
- **Layout**: Modal as a bottom-anchored sheet (left/right margin 16, bottom 50, radius 28). Behind it: the previous screen dimmed and slightly blurred (rgba(20,18,12,0.42) overlay + 6px backdrop blur).
- **Modal contents** (top → bottom):
  1. Mono "PARENT CONTROLS" label + a 32px circular close button (cream bg, hairline, X icon).
  2. Lora 36px "Enter *PIN*".
  3. PIN row: 4 boxes, equal width, 64px tall, radius 14. Filled state = `greenFaint` bg with 1.5px green border and a 12px ink dot centered. Empty state = parchment bg with hairline border.
  4. Hairline rule (margin 26 0).
  5. Mono "SET TIMER TO" label on left, mono "30 MIN SELECTED" in green on right.
  6. Time presets — 3-column grid (gap 10), 6 buttons: 5 / 10 / 15 / 20 / 30 / 45. 56px tall, radius 14. Active (`30`) = green bg, white label, mono "MIN" in white-60. Inactive = parchment bg, hairline border, ink label.
  7. Actions row: secondary "Cancel" (flex 1, transparent, hairline border) + primary "Confirm · 30 min" (flex 2, ink bg, white text). Both 56 tall, radius 14.

### 07 — Channel Selector

- **Purpose**: First-time setup + ongoing edit. Parent picks which subscribed channels are visible.
- **Layout**:
  - **Header zone**: close X (44px circle) — mono "FIRST-TIME SETUP · STEP 1 / 2" → green mono overline "CHOOSE YOUR CHANNELS" → 38px Lora "What can *your kids* watch today?" → body subtitle → 48px search row (cream bg, hairline, search icon + placeholder "Search your 41 subscriptions").
  - **List**: mono "SUBSCRIPTIONS" overline with right-aligned "SELECT ALL" mono link in green. Each row: 26×26 checkbox (active = green fill with white check; inactive = hairline outline) — 44px avatar — text stack: name (DM Sans 15 600) and mono tag-line (e.g. "ENGINEERING · MAKER · 64M SUBS"). Hairline divider between rows.
  - **Sticky save**: gradient-faded bottom area (240px from page bg) with full-width 60px green CTA "Save N channels →" (mono arrow at right).

### 08 — Settings (Parent)

- **Purpose**: Adult-facing config. PIN-gated entry.
- **Layout**:
  - **Header**: back button (44px circle) + mono "PARENT SETTINGS" right.
  - **Title block**: 48px Lora italic "*Settings.*" + body "Signed in as parent@example.com" (email in ink-600).
  - **Account chip**: cream card, hairline, radius 18, padding 18. Row: 44px sand-bg circle with italic Lora monogram "PE" + text stack (DM Sans 14 600 "Family plan" + mono "2 CHILDREN · 1 DEVICE") + 8px green dot on the right.
  - **Two sections** ("CONTENT" + "SECURITY" mono overlines, hairline above first row of each):
    - Content: Channels (6 active) · Default timer (30 min) · Day cap (2 hrs)
    - Security: Parent PIN (• • • •) · Time's-up screen (Outdoors)
    - Each row: 20px vertical padding, label (DM Sans 16 600) over optional mono meta line, right-aligned value in Lora italic 17, then a small chevron-right.
  - **Footer**: full-width "Sign out" 52px secondary button (transparent + hairline), then mono "CALMTUBE · V1.0 · MADE FOR FAMILIES" centered.

---

## Reusable Components

These appear on multiple screens. Build once.

### `<Wordmark size />`
"Calm" in Lora italic + "tube" in DM Sans 600 green, baseline-aligned, 2px gap. Color of "Calm" follows `ink` (or white on dark).

### `<TimerPill minutes dark />`
44px tall pill, rounded 999, padded `0 8 0 16`. Light variant: `greenSoft` tinted bg, green ink, hairline-style green border (`--ct-green-20`). Dark variant: rgba white surface. Layout: clock SVG icon → "20 min left" (DM Sans 600 14) → 28px inner round pill with a padlock icon.

### `<MonoLabel>` (small-caps overline)
JetBrains Mono 11px / 500 / 0.16em letter-spacing / UPPERCASE. Default color `inkMuted`. Used **everywhere** for category, status, and helper text.

### `<Rule />`
1px high `hairline`-colored line.

### `<ChannelAvatar label size />`
Placeholder for now: hashed oklch swatch + 35°-rotated stripe pattern at 18% opacity + italic Lora monogram. **Production**: use the real channel thumbnail in a `border-radius: 50%; border: 1px solid hairline;` wrapper.

### `<VideoThumb label hue ratio />`
Placeholder: similar to avatar but rectangular, 14-pattern. **Production**: real YouTube thumbnail URL, `aspect-ratio: 16/9`, radius 14.

### Primary CTA
- **Hero CTA** (Login): 60px tall, radius 16, `ink` bg, white text, DM Sans 17 600.
- **Confirm CTAs** (Modal, Save): 56–60 tall, radius 14–16, `green` bg, white text, DM Sans 16–17 600.

### Secondary CTA
56px / radius 14, transparent bg, hairline border, ink text. DM Sans 15 600.

### Pill tab (segmented control)
38px tall, radius 999, padding `0 18`. Active: ink bg, white text. Inactive: transparent, hairline border, inkSoft text.

---

## Interactions & Behavior

### Navigation flow

```
Login ──(sign in)──► Channel Selector (if first time)
                ──► Channel Grid (returning)
                
Channel Grid ──(tap channel)──► Channel Detail ──(tap video)──► Video Player
             ──(tap timer)──► Parent Modal (PIN required)
             ──(tap gear, future)──► Settings (PIN required)

Video Player ──(back)──► Channel Detail
             ──(timer = 0)──► Time's Up

Time's Up ──(tap illustration)──► Parent Modal
          ──(PIN + new time)──► Channel Grid (timer reset)

Settings ──(channels)──► Channel Selector
         ──(back)──► Channel Grid
```

### Timer

- Default: **30 minutes**.
- Counts down only while watching a video (not while browsing).
- At 0:00, transitions to the Time's Up screen (cross-fade, ~400ms).
- Pill copy: "20 min left" → "9 min left" → "Less than 1 min".
- Reset flow: Parent Modal → PIN → choose preset → "Confirm" updates timer and returns to whatever screen was behind.

### PIN entry

- 4 digits. Numeric keyboard.
- As the parent types, boxes fill left-to-right (greenFaint bg + green border).
- Incorrect: shake (~250ms, 4px amplitude, 3 oscillations), clear boxes.
- Correct: enable the rest of the modal (presets + Confirm).

### Channel selector

- Tapping a row toggles its checkbox; smooth bg-color transition (~150ms).
- "Select all" toggles all visible (filtered) channels.
- Save button copy updates live: "Save 6 channels".

### Sort tabs

- Tapping "New" or "Popular" re-sorts the video list (no transition needed; instant).
- Active state: ink bg + white. Single source of truth in component state.

### Modal dismiss

- X button, Cancel button, or backdrop tap all dismiss.
- Slide-down + fade animation (~300ms, ease-out).

### Animations & transitions

- **Page transitions**: 200–300ms ease-out cross-fade or slide. Keep them quick.
- **Tap feedback**: scale to 0.97 + 0.92 opacity (150ms ease-out) on press-down, restore on release. Apply to all card-class targets (channel cards, video cards, preset buttons).
- **Hover** (desktop): cards lift via shadow upgrade `shadow → shadowLg`, 200ms ease-out.
- **Time's Up entry**: fade in over 600ms, illustration scales from 0.92 → 1 with subtle bounce.

### Responsive behavior

| Screen | iPhone (≤ 480) | iPad portrait (480–900) | iPad landscape (≥ 900) |
|---|---|---|---|
| Channel grid | 2 cols, 92px avatars | 4 cols, 96px avatars | 5 cols, 112px avatars |
| Channel detail | 1 col video list | 2 col video list | 2–3 col video list, centered max-width 980 |
| Video player | full-bleed | 16:9 centered, capped at 760 wide | capped at 980 wide |
| Modal | 16px side margins | 80px side margins | 480px fixed width, centered |
| Settings | full-width sections | 2-col layout (sections + account chip side-by-side) | same as iPad portrait, max-width 720 |
| Display sizes | scale at 100% | +10–15% on hero/section titles | same |

---

## State Management

A minimal set of state variables to drive the UI:

```ts
type AppState = {
  user: { email: string; name: string } | null;
  selectedChannelIds: string[];          // from selector
  pin: string;                           // 4 digits, hashed in real impl
  timerSecondsRemaining: number;         // ticks down while watching
  defaultTimerMinutes: number;           // user-set, default 30
  dayCapMinutes: number;                 // future
  activeChannelId: string | null;        // currently viewing
  activeVideoId: string | null;          // currently playing
  modal: 'none' | 'pin-reset' | 'pin-settings';
};
```

Data fetching: YouTube Data API v3 (`subscriptions.list`, `channels.list`, `playlistItems.list`). Cache subscription list per session; refresh on selector open.

---

## Assets

- **No external image assets in the prototype** — channel avatars and video thumbs are striped SVG placeholders. Production: pull real YouTube thumbnails.
- **Time's Up illustration** is drawn with SVG primitives (sun, hills, trees, birds). Re-implement in-code or commission a hand-illustrated version in the same ink-line style on parchment.
- **Wordmark** is pure type; no logo asset needed.
- **Icons** are inline SVG; replace with your icon library (Lucide / Phosphor / custom) at the same stroke weight (~1.4–1.6px on a 16–22px viewBox).
- **Fonts**: Google Fonts — Lora, DM Sans, JetBrains Mono. Free, OFL-licensed.

---

## Files in this bundle

| File | What it is |
|---|---|
| `CalmTube.html` | Entry point — open in a browser to view the prototype |
| `app.jsx` | Composes all 8 screens in a design canvas, hosts the Tweaks panel |
| `tokens.jsx` | Design tokens (colors, fonts) + shared atoms (`Wordmark`, `TimerPill`, `MonoLabel`, `Rule`, `ChannelAvatar`, `VideoThumb`, `PillBtn`) |
| `screens-kids.jsx` | LoginScreen, ChannelGridScreen, ChannelDetailScreen, VideoPlayerScreen, TimesUpScreen |
| `screens-parent.jsx` | ParentModalScreen, ChannelSelectorScreen, SettingsScreen |
| `design-canvas.jsx` | Pan/zoom presentation shell (review tool only — not part of production) |
| `ios-frame.jsx` | iPhone bezel + status bar (review tool only) |
| `tweaks-panel.jsx` | Live color/font swap UI (review tool only) |

**Production scope**: only `tokens.jsx` + `screens-kids.jsx` + `screens-parent.jsx` are reference for the real implementation. The other files are scaffolding for the design review experience.

---

## Migration notes (from current v1)

Your current implementation uses `#059669` green, pure white card backgrounds, and DM Sans throughout. The migration:

1. **Replace** `#059669` with `#2D6A4F` everywhere. The new green is more sophisticated/forest, less neon.
2. **Replace** `#FFFFFF` page backgrounds with `#F4EFE4` (parchment). White stays only for the rare pure-surface (none in this design).
3. **Add** Lora (display) and JetBrains Mono (micro-labels) to your font loading. Keep DM Sans for body.
4. **Replace** the frosted-glass green header bar with the new header pattern: small wordmark + timer pill, hairline rule beneath (see Screen 02 / 03).
5. **Rewrite** the channel grid card from "icon + label" to the new pattern: bigger 92px circular avatar, centered name + mono sub-count, cream bg with hairline border.
6. **Redraw** the Time's Up illustration as documented in Screen 05.

The screens map 1:1 with your existing routes — no new screens, no removed screens.
