// screens-kids.jsx — Login, Channel Grid, Channel Detail, Video Player, Time's Up

// ─────────────────────────────────────────────────────────────
// 1. Login / hero
// ─────────────────────────────────────────────────────────────
function LoginScreen() {
  return (
    <div style={{ background: T.bg, minHeight: '100%', padding: '64px 28px 40px', display: 'flex', flexDirection: 'column' }}>
      {/* tiny mono brand line */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Wordmark size={20} />
        <MonoLabel>v1 · 2026</MonoLabel>
      </div>

      {/* hero */}
      <div style={{ marginTop: 96, flex: 1 }}>
        <MonoLabel color={T.green}>A focused viewer for YouTube</MonoLabel>
        <h1 style={{
          margin: '20px 0 0', fontFamily: F.serif, fontWeight: 400,
          fontSize: 56, lineHeight: 1.02, letterSpacing: '-0.025em', color: T.ink,
        }}>
          A calmer<br/>way to <em style={{ fontStyle: 'italic' }}>watch.</em>
        </h1>
        <p style={{
          margin: '24px 0 0', fontFamily: F.sans, fontSize: 17, lineHeight: 1.5,
          color: T.inkSoft, maxWidth: 320,
        }}>
          CalmTube shows kids only the channels you subscribe to. No algorithm.
          No autoplay. No rabbit holes.
        </p>

        {/* feature list as numbered editorial */}
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column' }}>
          {[
            ['01', 'Subscribed channels, nothing else'],
            ['02', 'No autoplay or recommendations'],
            ['03', 'A timer that nudges kids outside'],
          ].map(([n, t], i) => (
            <div key={n}>
              <Rule />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, padding: '16px 0' }}>
                <span style={{ fontFamily: F.mono, fontSize: 11, color: T.green, letterSpacing: '0.14em' }}>{n}</span>
                <span style={{ fontFamily: F.sans, fontSize: 15, color: T.ink, fontWeight: 500 }}>{t}</span>
              </div>
              {i === 2 && <Rule />}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ paddingTop: 28 }}>
        <button style={{
          width: '100%', height: 60, borderRadius: 16,
          background: T.ink, color: '#fff', border: 'none',
          fontFamily: F.sans, fontSize: 17, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          cursor: 'pointer', letterSpacing: '-0.01em',
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.4"/><path d="M6.5 10l2.5 2.5L14 7.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          Continue with Google
        </button>
        <div style={{ marginTop: 16, textAlign: 'center', fontFamily: F.mono, fontSize: 10,
          letterSpacing: '0.14em', color: T.inkMuted, textTransform: 'uppercase' }}>
          Uses your existing YouTube subscriptions
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. Channel grid (kid home)
// ─────────────────────────────────────────────────────────────
function ChannelGridScreen() {
  const channels = [
    { name: 'Wild Kratts', sub: '3.2M' },
    { name: 'Mark Rober', sub: '64M' },
    { name: 'Storytime', sub: '1.1M' },
    { name: 'Lego Build', sub: '440K' },
    { name: 'SciShow Kids', sub: '1.8M' },
    { name: 'Art Hub', sub: '7.1M' },
    { name: 'Cosmic Kids', sub: '2.4M' },
    { name: 'Maddie Moate', sub: '320K' },
  ];
  return (
    <div style={{ background: T.bg, minHeight: '100%' }}>
      {/* Header */}
      <div style={{ padding: '60px 24px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Wordmark size={22} />
        <TimerPill minutes={20} />
      </div>
      <Rule style={{ marginLeft: 24, marginRight: 24 }} />

      {/* Section header — editorial */}
      <div style={{ padding: '24px 24px 6px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <MonoLabel>Your channels</MonoLabel>
          <h2 style={{
            margin: '6px 0 0', fontFamily: F.serif, fontWeight: 400, fontStyle: 'italic',
            fontSize: 34, lineHeight: 1, letterSpacing: '-0.02em', color: T.ink,
          }}>Pick one.</h2>
        </div>
        <span style={{ fontFamily: F.mono, fontSize: 11, color: T.inkMuted, letterSpacing: '0.14em' }}>8 / 8</span>
      </div>

      {/* Grid */}
      <div style={{
        padding: '20px 18px 100px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
      }}>
        {channels.map(c => (
          <button key={c.name} style={{
            background: T.cream, border: `1px solid ${T.hairline}`, borderRadius: 22,
            padding: '22px 16px 18px', cursor: 'pointer', textAlign: 'left',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
            boxShadow: T.shadow, minHeight: 184,
          }}>
            <ChannelAvatar label={c.name} size={92} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 600, color: T.ink, letterSpacing: '-0.01em' }}>{c.name}</div>
              <div style={{ marginTop: 4, fontFamily: F.mono, fontSize: 10, color: T.inkMuted, letterSpacing: '0.12em' }}>
                {c.sub} SUBS
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. Channel detail
// ─────────────────────────────────────────────────────────────
function ChannelDetailScreen() {
  const videos = [
    { t: 'How a 3D printer builds a whole house in 24 hours', d: '12:04', when: '2 days ago', views: '420K', hue: 30 },
    { t: 'Why do octopuses change colour? An underwater dive', d: '08:31', when: '1 week ago', views: '1.2M', hue: 200 },
    { t: 'The science behind the perfect paper airplane', d: '06:45', when: '2 weeks ago', views: '780K', hue: 120 },
  ];
  return (
    <div style={{ background: T.bg, minHeight: '100%' }}>
      {/* Sticky header */}
      <div style={{ padding: '52px 20px 14px', background: T.bg, position: 'sticky', top: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button style={{
            width: 44, height: 44, borderRadius: 999, background: T.cream,
            border: `1px solid ${T.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M7 1L1 7l6 6M1 7h16" stroke={T.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <TimerPill minutes={20} />
        </div>
        {/* Channel identity */}
        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 14 }}>
          <ChannelAvatar label="Mark Rober" size={56} />
          <div>
            <MonoLabel>Channel</MonoLabel>
            <div style={{ fontFamily: F.serif, fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.02em', color: T.ink, marginTop: 2 }}>
              Mark <em style={{ fontStyle: 'italic' }}>Rober</em>
            </div>
          </div>
        </div>
        {/* Sort tabs */}
        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 6 }}>
          {['New', 'Popular'].map((s, i) => (
            <button key={s} style={{
              height: 38, padding: '0 18px', borderRadius: 999,
              background: i === 0 ? T.ink : 'transparent', color: i === 0 ? '#fff' : T.inkSoft,
              border: i === 0 ? 'none' : `1px solid ${T.hairline}`,
              fontFamily: F.sans, fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
            }}>{s}</button>
          ))}
          <div style={{ flex: 1 }}/>
          <MonoLabel>24 videos</MonoLabel>
        </div>
      </div>

      <Rule style={{ marginLeft: 20, marginRight: 20 }} />

      {/* Video list */}
      <div style={{ padding: '0 20px 60px' }}>
        {videos.map((v, i) => (
          <div key={i} style={{ padding: '20px 0', borderBottom: `1px solid ${T.hairline}` }}>
            <div style={{ position: 'relative' }}>
              <VideoThumb label={`VID ${String(i+1).padStart(2,'0')}`} hue={v.hue} />
              <div style={{
                position: 'absolute', right: 10, bottom: 10,
                background: 'rgba(11,11,10,0.82)', color: '#fff',
                padding: '4px 8px', borderRadius: 6,
                fontFamily: F.mono, fontSize: 11, fontWeight: 500, letterSpacing: '0.04em',
              }}>{v.d}</div>
            </div>
            <h3 style={{
              margin: '14px 0 6px', fontFamily: F.sans, fontSize: 17, lineHeight: 1.3,
              fontWeight: 600, color: T.ink, letterSpacing: '-0.01em',
            }}>{v.t}</h3>
            <div style={{ fontFamily: F.mono, fontSize: 11, color: T.inkMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {v.views} views · {v.when}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. Video player (dark)
// ─────────────────────────────────────────────────────────────
function VideoPlayerScreen() {
  return (
    <div style={{ background: T.black, minHeight: '100%', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '52px 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button style={{
          height: 44, padding: '0 16px 0 12px', borderRadius: 999,
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
          color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 8,
          fontFamily: F.sans, fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M6 1L1 6l5 5M1 6h14" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/></svg>
          Back
        </button>
        <TimerPill minutes={20} dark />
      </div>

      {/* Video frame */}
      <div style={{ padding: '40px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '100%', aspectRatio: '16/9', background: '#0F0F0E',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* placeholder stripes */}
          <svg width="100%" height="100%" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, opacity: 0.18 }}>
            <defs>
              <pattern id="plr" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
                <line x1="0" y1="0" x2="0" y2="20" stroke="#fff" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#plr)"/>
          </svg>
          {/* play button */}
          <div style={{
            position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
            width: 76, height: 76, borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(255,255,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="26" viewBox="0 0 22 26"><path d="M0 0 L22 13 L0 26 Z" fill="#fff"/></svg>
          </div>
          {/* corner label */}
          <div style={{ position: 'absolute', left: 14, top: 14, fontFamily: F.mono, fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.14em' }}>VIDEO · 1080P</div>
        </div>
      </div>

      {/* Scrubber */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.15)', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: '34%', height: '100%', borderRadius: 999, background: T.green }}/>
          <div style={{ position: 'absolute', left: '34%', top: '50%', transform: 'translate(-50%,-50%)', width: 14, height: 14, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}/>
        </div>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em' }}>
          <span>04:08</span><span>12:04</span>
        </div>
      </div>

      {/* Meta */}
      <div style={{ padding: '28px 20px 0' }}>
        <MonoLabel color="rgba(255,255,255,0.5)">Now playing</MonoLabel>
        <h2 style={{
          margin: '10px 0 0', fontFamily: F.serif, fontSize: 28, lineHeight: 1.1,
          letterSpacing: '-0.02em', color: '#fff', fontWeight: 400,
        }}>
          How a 3D printer builds a whole <em style={{ fontStyle: 'italic' }}>house</em> in 24 hours
        </h2>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <ChannelAvatar label="Mark Rober" size={32} />
          <div style={{ fontFamily: F.sans, fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>Mark Rober</div>
          <div style={{ width: 3, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.25)' }}/>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em' }}>2 DAYS AGO</div>
        </div>
      </div>

      {/* Player controls row */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', padding: '0 20px 60px' }}>
        <div style={{ width: '100%', marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          {[
            <svg width="22" height="22" viewBox="0 0 22 22"><path d="M11 4L4 11l7 7M18 11H4" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>,
            <svg width="22" height="22" viewBox="0 0 22 22"><polygon points="3,3 17,11 3,19" fill="#fff"/></svg>,
            <svg width="22" height="22" viewBox="0 0 22 22"><path d="M3 5h16M3 11h16M3 17h10" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/></svg>,
          ].map((ic, i) => (
            <button key={i} style={{
              width: 56, height: 56, borderRadius: '50%',
              background: i === 1 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.06)',
              border: i === 1 ? 'none' : '1px solid rgba(255,255,255,0.14)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              {i === 1 ? <svg width="22" height="22" viewBox="0 0 22 22"><polygon points="3,3 17,11 3,19" fill={T.ink}/></svg> : ic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. Time's Up — ink-line landscape illustration
// ─────────────────────────────────────────────────────────────
function TimesUpScreen() {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #F7F2E5 0%, #EFE6D0 100%)',
      minHeight: '100%', padding: '60px 28px 60px',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Wordmark size={18} />
        <MonoLabel>0:00 remaining</MonoLabel>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        {/* Original ink-line landscape — sun, hills, two trees, birds */}
        <button style={{
          background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
          width: 260, height: 260, position: 'relative',
        }}>
          {/* parchment circle frame */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(255,255,255,0.35)',
            border: `1px solid ${T.hairline}`,
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), 0 30px 50px -20px rgba(80,60,20,0.18)',
          }}/>
          <svg viewBox="0 0 260 260" width="260" height="260" style={{ position: 'relative' }}>
            <defs>
              <clipPath id="circle-clip"><circle cx="130" cy="130" r="129"/></clipPath>
            </defs>
            <g clipPath="url(#circle-clip)" stroke="#2A2620" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* Sun */}
              <circle cx="180" cy="95" r="22" />
              {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => {
                const r1 = 28, r2 = 38;
                const x1 = 180 + r1*Math.cos(a*Math.PI/180);
                const y1 = 95 + r1*Math.sin(a*Math.PI/180);
                const x2 = 180 + r2*Math.cos(a*Math.PI/180);
                const y2 = 95 + r2*Math.sin(a*Math.PI/180);
                return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2}/>;
              })}
              {/* Birds */}
              <path d="M70 70 q5 -6 10 0 q5 -6 10 0"/>
              <path d="M110 50 q4 -4 8 0 q4 -4 8 0"/>
              {/* Distant hills */}
              <path d="M-10 175 Q 40 140 90 165 T 200 158 T 280 170"/>
              <path d="M-10 195 Q 60 165 130 188 T 280 185"/>
              {/* Ground */}
              <path d="M-10 220 L 280 220"/>
              {/* Path */}
              <path d="M130 260 Q 132 245 128 230 Q 122 215 130 200"/>
              {/* Big tree left */}
              <path d="M60 220 L 60 175"/>
              <ellipse cx="60" cy="160" rx="22" ry="20"/>
              <path d="M48 165 q4 -8 12 -10 m-8 16 q10 -2 14 -10 m-18 -2 q4 8 14 6"/>
              {/* Smaller tree right */}
              <path d="M210 220 L 210 195"/>
              <circle cx="210" cy="185" r="13"/>
              {/* Tiny grass tufts */}
              <path d="M95 225 l2 -6 M99 226 l1 -5 M155 226 l2 -6 M170 224 l1 -5 M185 226 l2 -6"/>
              {/* Hatching shade */}
              <g stroke="#2A2620" strokeWidth="0.6" opacity="0.55">
                {Array.from({length: 8}).map((_, i) => (
                  <line key={i} x1={40 + i*4} y1={180 + i*1} x2={48 + i*4} y2={172 + i*1}/>
                ))}
              </g>
            </g>
          </svg>
        </button>

        <MonoLabel color={T.green} style={{ marginTop: 44 }}>The timer has run out</MonoLabel>
        <h1 style={{
          margin: '14px 0 0', fontFamily: F.serif, fontWeight: 400,
          fontSize: 52, lineHeight: 1, letterSpacing: '-0.025em', color: T.ink,
        }}>
          Time to go<br/><em style={{ fontStyle: 'italic' }}>outside.</em>
        </h1>
        <p style={{
          margin: '20px 0 0', fontFamily: F.sans, fontSize: 15, lineHeight: 1.5,
          color: T.inkSoft, maxWidth: 280,
        }}>
          See you tomorrow. Tap the sun if a grown-up needs to add more time.
        </p>
      </div>

      <div style={{ textAlign: 'center' }}>
        <MonoLabel color={T.inkFaint}>Tap illustration · parent only</MonoLabel>
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen, ChannelGridScreen, ChannelDetailScreen, VideoPlayerScreen, TimesUpScreen });
