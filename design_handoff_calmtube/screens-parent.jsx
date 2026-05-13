// screens-parent.jsx — Parent Modal (PIN), Channel Selector, Settings

// ─────────────────────────────────────────────────────────────
// 6. Parent Modal — PIN + Timer Reset
// Shown overlaying a dimmed channel detail page
// ─────────────────────────────────────────────────────────────
function ParentModalScreen() {
  return (
    <div style={{ position: 'relative', minHeight: '100%', background: T.bg }}>
      {/* Dim background (mini channel detail behind) */}
      <div style={{ padding: '52px 20px 14px', opacity: 0.35, filter: 'blur(1.5px)', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Wordmark size={20} />
          <TimerPill minutes={20} />
        </div>
        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 14 }}>
          <ChannelAvatar label="Mark Rober" size={56} />
          <div>
            <MonoLabel>Channel</MonoLabel>
            <div style={{ fontFamily: F.serif, fontSize: 30, color: T.ink, marginTop: 2 }}>
              Mark <em style={{ fontStyle: 'italic' }}>Rober</em>
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,18,12,0.42)', backdropFilter: 'blur(6px)' }}/>

      {/* Modal */}
      <div style={{
        position: 'absolute', left: 16, right: 16, bottom: 50,
        background: T.cream, borderRadius: 28, padding: '28px 24px 24px',
        boxShadow: T.shadowLg, border: `1px solid ${T.hairline}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <MonoLabel>Parent controls</MonoLabel>
          <button style={{
            width: 32, height: 32, borderRadius: 999, border: `1px solid ${T.hairline}`,
            background: T.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke={T.ink} strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <h2 style={{
          margin: '16px 0 0', fontFamily: F.serif, fontSize: 36, lineHeight: 1, letterSpacing: '-0.02em', color: T.ink, fontWeight: 400,
        }}>Enter <em style={{ fontStyle: 'italic' }}>PIN</em></h2>

        {/* PIN inputs */}
        <div style={{ marginTop: 22, display: 'flex', gap: 12, justifyContent: 'space-between' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{
              flex: 1, height: 64, borderRadius: 14,
              background: i <= 2 ? T.greenFaint : T.bg,
              border: `1.5px solid ${i === 2 ? T.green : T.hairline}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: F.serif, fontSize: 32, color: T.ink, fontWeight: 400,
            }}>
              {i <= 2 ? <div style={{ width: 12, height: 12, borderRadius: '50%', background: T.ink }}/> : null}
            </div>
          ))}
        </div>

        <Rule style={{ margin: '26px 0' }} />

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <MonoLabel>Set timer to</MonoLabel>
          <span style={{ fontFamily: F.mono, fontSize: 10, color: T.green, letterSpacing: '0.14em' }}>30 MIN SELECTED</span>
        </div>

        {/* Time presets */}
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[5, 10, 15, 20, 30, 45].map(m => (
            <button key={m} style={{
              height: 56, borderRadius: 14, cursor: 'pointer',
              background: m === 30 ? T.green : T.bg,
              border: m === 30 ? 'none' : `1px solid ${T.hairline}`,
              color: m === 30 ? '#fff' : T.ink,
              fontFamily: F.sans, fontSize: 17, fontWeight: 600,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 2,
            }}>
              <span>{m}</span>
              <span style={{
                fontFamily: F.mono, fontSize: 9, fontWeight: 500, letterSpacing: '0.14em',
                color: m === 30 ? 'rgba(255,255,255,0.6)' : T.inkMuted,
              }}>MIN</span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
          <button style={{
            flex: 1, height: 56, borderRadius: 14, cursor: 'pointer',
            background: 'transparent', border: `1px solid ${T.hairline}`, color: T.ink,
            fontFamily: F.sans, fontSize: 15, fontWeight: 600,
          }}>Cancel</button>
          <button style={{
            flex: 2, height: 56, borderRadius: 14, cursor: 'pointer',
            background: T.ink, border: 'none', color: '#fff',
            fontFamily: F.sans, fontSize: 15, fontWeight: 600,
          }}>Confirm · 30 min</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. Channel Selector
// ─────────────────────────────────────────────────────────────
function ChannelSelectorScreen() {
  const list = [
    { n: 'Wild Kratts', s: '3.2M subs', tag: 'Animals · Science', on: true },
    { n: 'Mark Rober', s: '64M subs', tag: 'Engineering · Maker', on: true },
    { n: 'Storytime', s: '1.1M subs', tag: 'Read aloud', on: true },
    { n: 'Lego Build', s: '440K subs', tag: 'Building · Crafts', on: false },
    { n: 'SciShow Kids', s: '1.8M subs', tag: 'Science', on: true },
    { n: 'Art Hub', s: '7.1M subs', tag: 'Drawing', on: true },
    { n: 'Cosmic Kids', s: '2.4M subs', tag: 'Yoga · Movement', on: false },
    { n: 'Maddie Moate', s: '320K subs', tag: 'Nature', on: true },
    { n: 'Game Theory', s: '18M subs', tag: 'Gaming', on: false },
  ];
  const selected = list.filter(c => c.on).length;
  return (
    <div style={{ background: T.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '52px 24px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button style={{
            width: 44, height: 44, borderRadius: 999, background: T.cream,
            border: `1px solid ${T.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 1l12 12M13 1L1 13" stroke={T.ink} strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
          <MonoLabel>First-time setup · step 1 / 2</MonoLabel>
        </div>
        <div style={{ marginTop: 18 }}>
          <MonoLabel color={T.green}>Choose your channels</MonoLabel>
          <h1 style={{
            margin: '8px 0 0', fontFamily: F.serif, fontSize: 38, lineHeight: 1, letterSpacing: '-0.025em', color: T.ink, fontWeight: 400,
          }}>
            What can <em style={{ fontStyle: 'italic' }}>your kids</em><br/>watch today?
          </h1>
          <p style={{ margin: '14px 0 0', fontFamily: F.sans, fontSize: 14, lineHeight: 1.5, color: T.inkSoft, maxWidth: 320 }}>
            Only what you check here appears on the kid home screen. You can change this anytime in settings.
          </p>
        </div>
        {/* Search */}
        <div style={{ marginTop: 22, height: 48, borderRadius: 14, background: T.cream, border: `1px solid ${T.hairline}`,
          display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5.2" stroke={T.inkMuted} strokeWidth="1.4"/><path d="M11 11l4 4" stroke={T.inkMuted} strokeWidth="1.4" strokeLinecap="round"/></svg>
          <span style={{ fontFamily: F.sans, fontSize: 15, color: T.inkMuted }}>Search your 41 subscriptions</span>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, padding: '0 24px 120px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '10px 0' }}>
          <MonoLabel>Subscriptions</MonoLabel>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: F.mono, fontSize: 11, color: T.green, letterSpacing: '0.14em' }}>
            SELECT ALL
          </button>
        </div>
        <Rule />
        {list.map((c, i) => (
          <div key={c.n}>
            <div style={{
              padding: '14px 0', display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer',
            }}>
              {/* Checkbox */}
              <div style={{
                width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                background: c.on ? T.green : 'transparent',
                border: c.on ? 'none' : `1.5px solid ${T.hairline}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {c.on && <svg width="14" height="11" viewBox="0 0 14 11"><path d="M1 6l4 4L13 1" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <ChannelAvatar label={c.n} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 600, color: T.ink, letterSpacing: '-0.01em' }}>{c.n}</div>
                <div style={{ marginTop: 2, fontFamily: F.mono, fontSize: 10, color: T.inkMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {c.tag} · {c.s}
                </div>
              </div>
            </div>
            {i < list.length - 1 && <Rule />}
          </div>
        ))}
      </div>

      {/* Sticky save */}
      <div style={{
        position: 'sticky', bottom: 0, padding: '14px 20px 40px',
        background: `linear-gradient(180deg, rgba(244,239,228,0) 0%, ${T.bg} 30%)`,
      }}>
        <button style={{
          width: '100%', height: 60, borderRadius: 16, cursor: 'pointer',
          background: T.green, color: '#fff', border: 'none',
          fontFamily: F.sans, fontSize: 16, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <span>Save {selected} channels</span>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.14em' }}>→</span>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 8. Settings — parent
// ─────────────────────────────────────────────────────────────
function SettingsScreen() {
  const SettingsRow = ({ label, value, meta, last }) => (
    <>
      <div style={{ padding: '20px 0', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: F.sans, fontSize: 16, fontWeight: 600, color: T.ink, letterSpacing: '-0.01em' }}>{label}</div>
          {meta && <div style={{ marginTop: 4, fontFamily: F.mono, fontSize: 10, color: T.inkMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{meta}</div>}
        </div>
        <div style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 17, color: T.inkSoft }}>{value}</div>
        <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke={T.inkMuted} strokeWidth="1.5" strokeLinecap="round"/></svg>
      </div>
      {!last && <Rule />}
    </>
  );

  return (
    <div style={{ background: T.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '52px 24px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button style={{
          width: 44, height: 44, borderRadius: 999, background: T.cream,
          border: `1px solid ${T.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M7 1L1 7l6 6M1 7h16" stroke={T.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <MonoLabel>Parent settings</MonoLabel>
      </div>

      {/* Title */}
      <div style={{ padding: '24px 24px 8px' }}>
        <h1 style={{
          margin: 0, fontFamily: F.serif, fontSize: 48, lineHeight: 1,
          letterSpacing: '-0.025em', color: T.ink, fontWeight: 400,
        }}>
          <em style={{ fontStyle: 'italic' }}>Settings.</em>
        </h1>
        <p style={{ margin: '10px 0 0', fontFamily: F.sans, fontSize: 14, color: T.inkSoft, maxWidth: 280 }}>
          Signed in as <span style={{ color: T.ink, fontWeight: 500 }}>parent@example.com</span>
        </p>
      </div>

      {/* Account card */}
      <div style={{ margin: '20px 24px 0', padding: '18px 18px', background: T.cream, border: `1px solid ${T.hairline}`, borderRadius: 18,
        display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 999, background: T.sand,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: F.serif, fontStyle: 'italic', fontSize: 18, color: T.ink }}>PE</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: F.sans, fontSize: 14, fontWeight: 600, color: T.ink }}>Family plan</div>
          <div style={{ marginTop: 2, fontFamily: F.mono, fontSize: 10, color: T.inkMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>2 children · 1 device</div>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: 999, background: T.green }} />
      </div>

      {/* Sections */}
      <div style={{ padding: '28px 24px 0' }}>
        <MonoLabel>Content</MonoLabel>
        <div style={{ marginTop: 10 }}>
          <Rule />
          <SettingsRow label="Channels" value="6 active" meta="Tap to add or remove" />
          <SettingsRow label="Default timer" value="30 min" meta="Resets each new session" />
          <SettingsRow label="Day cap" value="2 hrs" meta="Total daily watch time" last />
          <Rule />
        </div>

        <MonoLabel style={{ marginTop: 32 }}>Security</MonoLabel>
        <div style={{ marginTop: 10 }}>
          <Rule />
          <SettingsRow label="Parent PIN" value="• • • •" meta="Tap to change" />
          <SettingsRow label="Time's-up screen" value="Outdoors" meta="Illustration · 3 styles" last />
          <Rule />
        </div>
      </div>

      <div style={{ flex: 1 }}/>

      {/* Footer */}
      <div style={{ padding: '32px 24px 50px' }}>
        <button style={{
          width: '100%', height: 52, borderRadius: 14, cursor: 'pointer',
          background: 'transparent', border: `1px solid ${T.hairline}`, color: T.ink,
          fontFamily: F.sans, fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em',
        }}>
          Sign out
        </button>
        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <MonoLabel color={T.inkFaint}>CalmTube · v1.0 · made for families</MonoLabel>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ParentModalScreen, ChannelSelectorScreen, SettingsScreen });
