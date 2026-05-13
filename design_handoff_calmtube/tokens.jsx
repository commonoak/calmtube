// tokens.jsx — Design tokens + shared bits for CalmTube
// Editorial-warm direction. Keep green, evolve everything else.

const T = {
  // Surfaces
  bg:        '#F4EFE4',  // parchment (kid app body)
  bgDeep:    '#EBE4D2',  // slightly deeper for parent-mode header strips
  cream:     '#FBF7EC',  // card cream
  white:     '#FFFFFF',
  // Ink
  ink:       '#15140F',  // primary text
  inkSoft:   '#3C3A33',
  inkMuted:  '#6B665A',
  inkFaint:  '#9A9485',
  hairline:  '#D6CFBE',  // hairline rules
  // Brand greens (driven by CSS var so Tweaks can swap live)
  green:     'var(--ct-green)',
  greenInk:  'var(--ct-green-ink)',
  greenSoft: 'var(--ct-green-soft)',
  greenFaint:'var(--ct-green-faint)',
  // Accents
  sand:      '#E8DCC0',
  sandSoft:  '#F1E8D3',
  // Player
  black:     '#0B0B0A',
  blackSoft: '#1A1A17',
  // Shadow
  shadow:    '0 1px 2px rgba(20,18,12,0.04), 0 8px 24px -10px rgba(20,18,12,0.08)',
  shadowLg:  '0 2px 4px rgba(20,18,12,0.05), 0 18px 40px -16px rgba(20,18,12,0.14)',
};

// Font stacks
const F = {
  serif: 'var(--ct-serif)',
  sans:  '"DM Sans", -apple-system, system-ui, sans-serif',
  mono:  '"JetBrains Mono", ui-monospace, monospace',
};

// Tiny mono small-caps label used throughout parent screens
function MonoLabel({ children, color, style }) {
  return (
    <div style={{
      fontFamily: F.mono, fontSize: 11, fontWeight: 500,
      letterSpacing: '0.16em', textTransform: 'uppercase',
      color: color || T.inkMuted, ...style,
    }}>{children}</div>
  );
}

// Hairline rule
function Rule({ color, style }) {
  return <div style={{ height: 1, background: color || T.hairline, ...style }} />;
}

// CalmTube wordmark — serif "Calm" + sans "Tube" + smile dot
function Wordmark({ size = 22, dark = false, mono = false }) {
  const c = dark ? '#fff' : T.ink;
  const accent = mono ? c : T.green;
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: 0,
      fontSize: size, lineHeight: 1, letterSpacing: '-0.01em',
    }}>
      <span style={{ fontFamily: F.serif, fontStyle: 'italic', color: c, fontWeight: 400 }}>Calm</span>
      <span style={{ fontFamily: F.sans, fontWeight: 600, color: accent, marginLeft: 2 }}>tube</span>
    </div>
  );
}

// Pill button (kid-facing)
function PillBtn({ children, primary, dark, style, onClick }) {
  const bg = primary ? T.green : (dark ? 'rgba(255,255,255,0.10)' : T.cream);
  const fg = primary ? '#fff' : (dark ? '#fff' : T.ink);
  const bd = primary ? 'transparent' : (dark ? 'rgba(255,255,255,0.18)' : T.hairline);
  return (
    <button onClick={onClick} style={{
      height: 52, padding: '0 24px', borderRadius: 999,
      background: bg, color: fg, border: `1px solid ${bd}`,
      fontFamily: F.sans, fontSize: 16, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      gap: 8, cursor: 'pointer', letterSpacing: '-0.01em',
      ...style,
    }}>{children}</button>
  );
}

// Channel avatar placeholder — striped SVG with monogram (no AI-slop illustrations)
function ChannelAvatar({ label, hue = 140, size = 92 }) {
  // deterministic warm tone per label
  const h = Array.from(label).reduce((a,c)=>a+c.charCodeAt(0),0) % 360;
  const bg = `oklch(78% 0.06 ${h})`;
  const ink = `oklch(28% 0.08 ${h})`;
  const initials = label.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: ink, position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: F.serif, fontStyle: 'italic', fontSize: size * 0.42, fontWeight: 400,
      boxShadow: `inset 0 0 0 1px rgba(0,0,0,0.05)`,
      flexShrink: 0,
    }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100"
        style={{ position: 'absolute', inset: 0, opacity: 0.18 }}>
        <defs>
          <pattern id={`stp-${label.replace(/\W/g,'')}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="8" stroke={ink} strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill={`url(#stp-${label.replace(/\W/g,'')})`}/>
      </svg>
      <span style={{ position: 'relative' }}>{initials}</span>
    </div>
  );
}

// Video thumbnail placeholder — striped, with mono caption
function VideoThumb({ label, hue = 200, ratio = '16/9', style }) {
  const h = Array.from(label).reduce((a,c)=>a+c.charCodeAt(0),0) % 360;
  return (
    <div style={{
      aspectRatio: ratio, width: '100%', borderRadius: 14,
      background: `oklch(82% 0.04 ${h})`,
      position: 'relative', overflow: 'hidden',
      ...style,
    }}>
      <svg width="100%" height="100%" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, opacity: 0.22 }}>
        <defs>
          <pattern id={`vstp-${label.replace(/\W/g,'')}`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
            <line x1="0" y1="0" x2="0" y2="14" stroke={`oklch(35% 0.05 ${h})`} strokeWidth="1.2"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#vstp-${label.replace(/\W/g,'')})`}/>
      </svg>
      <div style={{
        position: 'absolute', left: 14, top: 14,
        fontFamily: F.mono, fontSize: 10, letterSpacing: '0.14em',
        color: `oklch(28% 0.06 ${h})`, textTransform: 'uppercase',
      }}>{label}</div>
    </div>
  );
}

// Timer pill — visible on most kid screens
function TimerPill({ minutes = 20, dark = false }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      height: 44, padding: '0 8px 0 16px', borderRadius: 999,
      background: dark ? 'rgba(255,255,255,0.10)' : 'var(--ct-green-10)',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.16)' : 'var(--ct-green-20)'}`,
      color: dark ? '#fff' : T.green,
      fontFamily: F.sans, fontWeight: 600, fontSize: 14,
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7.5" r="5.2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M7 4.5V7.5L9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <rect x="5.5" y="1.2" width="3" height="1.6" rx="0.6" fill="currentColor"/>
      </svg>
      <span>{minutes} min left</span>
      <div style={{
        width: 28, height: 28, borderRadius: 999,
        background: dark ? 'rgba(255,255,255,0.14)' : 'var(--ct-green-20)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
          <rect x="1" y="5.5" width="9" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M3 5.5V3.5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.3"/>
        </svg>
      </div>
    </div>
  );
}

Object.assign(window, { T, F, MonoLabel, Rule, Wordmark, PillBtn, ChannelAvatar, VideoThumb, TimerPill });
