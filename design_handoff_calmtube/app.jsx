// app.jsx — Compose all 8 screens inside iPhone frames within a design canvas

const PHONE_W = 393;
const PHONE_H = 852;
const ART_W = 432;
const ART_H = 892;

function Frame({ children }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
      <IOSDevice width={PHONE_W} height={PHONE_H}>
        {children}
      </IOSDevice>
    </div>
  );
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "greenHue": "#2D6A4F",
  "serif": "Lora (soft serif)"
}/*EDITMODE-END*/;

const SERIF_STACKS = {
  'DM Serif Display':    "'DM Serif Display', Georgia, serif",
  'Instrument Serif':    "'Instrument Serif', Georgia, serif",
  'Newsreader':          "'Newsreader', Georgia, serif",
  'EB Garamond':         "'EB Garamond', Georgia, serif",
  'Lora (soft serif)':   "'Lora', Georgia, serif",
  'Bricolage (semi)':    "'Bricolage Grotesque', 'DM Sans', sans-serif",
  'DM Sans (no serif)':  "'DM Sans', -apple-system, sans-serif",
};

function ApplyTweaks({ t }) {
  React.useEffect(() => {
    document.documentElement.style.setProperty('--ct-green', t.greenHue);
    document.documentElement.style.setProperty('--ct-serif', SERIF_STACKS[t.serif] || SERIF_STACKS['DM Serif Display']);
  }, [t.greenHue, t.serif]);
  return null;
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  return (
    <>
      <ApplyTweaks t={t}/>
      <TweaksPanel title="CalmTube · Tweaks" noDeckControls>
        <TweakSection label="Brand color">
          <TweakColor
            label="Green"
            value={t.greenHue}
            options={['#2D6A4F', '#059669', '#1E5F4E', '#5B7C3A', '#3A7D7B']}
            onChange={v => setTweak('greenHue', v)}
          />
        </TweakSection>
        <TweakSection label="Display serif">
          <TweakSelect
            label="Family"
            value={t.serif}
            options={Object.keys(SERIF_STACKS)}
            onChange={v => setTweak('serif', v)}
          />
        </TweakSection>
      </TweaksPanel>
      <DesignCanvas
      title="CalmTube — Mobile Screens"
      subtitle="Editorial-warm direction · iPhone primary · 2026"
      defaultZoom={0.7}
    >
      <DCSection id="kids" title="Kids surfaces" subtitle="Big taps, generous whitespace, soft chrome.">
        <DCArtboard id="login"   label="01 — Login / hero"      width={ART_W} height={ART_H}>
          <Frame><LoginScreen /></Frame>
        </DCArtboard>
        <DCArtboard id="grid"    label="02 — Channel grid"      width={ART_W} height={ART_H}>
          <Frame><ChannelGridScreen /></Frame>
        </DCArtboard>
        <DCArtboard id="channel" label="03 — Channel detail"    width={ART_W} height={ART_H}>
          <Frame><ChannelDetailScreen /></Frame>
        </DCArtboard>
        <DCArtboard id="player"  label="04 — Video player"      width={ART_W} height={ART_H}>
          <Frame><VideoPlayerScreen /></Frame>
        </DCArtboard>
        <DCArtboard id="timesup" label="05 — Time's up"         width={ART_W} height={ART_H}>
          <Frame><TimesUpScreen /></Frame>
        </DCArtboard>
      </DCSection>

      <DCSection id="parent" title="Parent surfaces" subtitle="Editorial precision, mono micro-labels, hairline rules.">
        <DCArtboard id="modal"    label="06 — Parent reset modal"  width={ART_W} height={ART_H}>
          <Frame><ParentModalScreen /></Frame>
        </DCArtboard>
        <DCArtboard id="selector" label="07 — Channel selector"    width={ART_W} height={ART_H}>
          <Frame><ChannelSelectorScreen /></Frame>
        </DCArtboard>
        <DCArtboard id="settings" label="08 — Settings"            width={ART_W} height={ART_H}>
          <Frame><SettingsScreen /></Frame>
        </DCArtboard>
      </DCSection>

      <DCSection id="system" title="System & iPad adaptation" subtitle="The vocabulary that holds the whole thing together.">
        <DCArtboard id="tokens" label="System — tokens" width={760} height={520}>
          <SystemBoard />
        </DCArtboard>
        <DCArtboard id="ipad" label="iPad — channel grid (notes)" width={1024} height={768}>
          <IPadGridBoard />
        </DCArtboard>
      </DCSection>
      </DesignCanvas>
    </>
  );
}

// ─── System tokens reference board ─────────────────────────────
function SystemBoard() {
  const swatches = [
    ['Parchment', T.bg],
    ['Cream', T.cream],
    ['Ink', T.ink],
    ['Green', T.green],
    ['Green soft', T.greenSoft],
    ['Sand', T.sand],
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: T.bg, padding: 36, boxSizing: 'border-box', fontFamily: F.sans }}>
      <MonoLabel>Design system · CalmTube</MonoLabel>
      <h1 style={{ margin: '8px 0 0', fontFamily: F.serif, fontSize: 44, lineHeight: 1, letterSpacing: '-0.02em', color: T.ink, fontWeight: 400 }}>
        Warmth, with <em style={{ fontStyle: 'italic' }}>discipline.</em>
      </h1>

      <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 28 }}>
        {/* Type */}
        <div>
          <MonoLabel>Type</MonoLabel>
          <Rule style={{ marginTop: 8 }}/>
          <div style={{ padding: '14px 0' }}>
            <span style={{ fontFamily: F.serif, fontSize: 40, lineHeight: 1, color: T.ink }}>
              A calmer <em style={{ fontStyle: 'italic' }}>way</em>
            </span>
            <div style={{ marginTop: 6, fontFamily: F.mono, fontSize: 10, color: T.inkMuted, letterSpacing: '0.14em' }}>INSTRUMENT SERIF · DISPLAY</div>
          </div>
          <Rule />
          <div style={{ padding: '14px 0' }}>
            <span style={{ fontFamily: F.sans, fontSize: 18, fontWeight: 600, color: T.ink, letterSpacing: '-0.01em' }}>
              Pick a channel, tap to watch.
            </span>
            <div style={{ marginTop: 6, fontFamily: F.mono, fontSize: 10, color: T.inkMuted, letterSpacing: '0.14em' }}>DM SANS · BODY</div>
          </div>
          <Rule />
          <div style={{ padding: '14px 0' }}>
            <span style={{ fontFamily: F.mono, fontSize: 12, color: T.inkMuted, letterSpacing: '0.16em', textTransform: 'uppercase' }}>SET TIMER TO · CHANNEL · DAY CAP</span>
            <div style={{ marginTop: 6, fontFamily: F.mono, fontSize: 10, color: T.inkMuted, letterSpacing: '0.14em' }}>JETBRAINS MONO · MICRO-LABELS</div>
          </div>
          <Rule />
        </div>

        {/* Color */}
        <div>
          <MonoLabel>Color</MonoLabel>
          <Rule style={{ marginTop: 8 }} />
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {swatches.map(([n, c]) => (
              <div key={n}>
                <div style={{ aspectRatio: '1', borderRadius: 12, background: c, border: `1px solid ${T.hairline}` }}/>
                <div style={{ marginTop: 8, fontFamily: F.sans, fontSize: 12, color: T.ink, fontWeight: 600 }}>{n}</div>
                <div style={{ fontFamily: F.mono, fontSize: 10, color: T.inkMuted, letterSpacing: '0.08em' }}>{c.toUpperCase()}</div>
              </div>
            ))}
          </div>

          <MonoLabel style={{ marginTop: 20 }}>Principles</MonoLabel>
          <Rule style={{ marginTop: 8 }} />
          {[
            ['Kid surfaces', 'cream cards, big radii, no mono'],
            ['Parent surfaces', 'editorial layout, mono labels, hairlines'],
            ['Green', 'reserved for affirmative actions only'],
          ].map(([k, v], i) => (
            <div key={k}>
              <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'space-between', gap: 14 }}>
                <span style={{ fontFamily: F.sans, fontSize: 13, fontWeight: 600, color: T.ink }}>{k}</span>
                <span style={{ fontFamily: F.sans, fontSize: 13, color: T.inkSoft, textAlign: 'right' }}>{v}</span>
              </div>
              <Rule />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── iPad adaptation note ─────────────────────────────────────
function IPadGridBoard() {
  const channels = ['Wild Kratts', 'Mark Rober', 'Storytime', 'Lego Build', 'SciShow Kids', 'Art Hub', 'Cosmic Kids', 'Maddie Moate', 'Nature Bites', 'Build School'];
  return (
    <div style={{ width: '100%', height: '100%', background: T.bg, position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      {/* iPad bezel mimic */}
      <div style={{ position: 'absolute', inset: 14, borderRadius: 36, background: T.bg, boxShadow: 'inset 0 0 0 8px #1a1a17, inset 0 0 0 10px #333', overflow: 'hidden' }}>
        {/* Status */}
        <div style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', fontFamily: F.sans, fontSize: 12, fontWeight: 600, color: T.ink }}>
          <span>9:41</span>
          <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.14em' }}>iPad · landscape</span>
        </div>
        {/* Top bar */}
        <div style={{ padding: '14px 36px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Wordmark size={26} />
          <TimerPill minutes={20} />
        </div>
        <Rule style={{ marginLeft: 36, marginRight: 36 }} />
        <div style={{ padding: '24px 36px 6px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <MonoLabel>Your channels</MonoLabel>
            <h2 style={{ margin: '6px 0 0', fontFamily: F.serif, fontSize: 44, lineHeight: 1, letterSpacing: '-0.02em', color: T.ink, fontWeight: 400 }}>
              Pick <em style={{ fontStyle: 'italic' }}>one.</em>
            </h2>
          </div>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.inkMuted, letterSpacing: '0.14em' }}>10 / 10</span>
        </div>
        <div style={{ padding: '22px 30px 0', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {channels.map(n => (
            <div key={n} style={{ background: T.cream, border: `1px solid ${T.hairline}`, borderRadius: 22, padding: '22px 14px 16px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <ChannelAvatar label={n} size={96}/>
              <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 14, color: T.ink, letterSpacing: '-0.01em', textAlign: 'center' }}>{n}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Margin annotation */}
      <div style={{ position: 'absolute', right: 30, bottom: 22, maxWidth: 260, background: T.cream, border: `1px solid ${T.hairline}`, borderRadius: 14, padding: '14px 16px' }}>
        <MonoLabel color={T.green}>iPad adapts via</MonoLabel>
        <div style={{ marginTop: 8, fontFamily: F.sans, fontSize: 12, lineHeight: 1.5, color: T.ink }}>
          <strong>Grid:</strong> 2→5 columns · <strong>Display:</strong> 38→48px · <strong>Avatars:</strong> 92→112px · <strong>Player:</strong> centered, 16:9 capped at 980px wide.
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
