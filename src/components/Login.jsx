import React, { useState } from 'react';
import { authAPI } from '../api/db';

export default function Login({ onLoginSuccess, addToast }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  
  // Login Form States (Default to Master Admin)
  const [loginUser, setLoginUser] = useState('admin@stagepass.com');
  const [loginPass, setLoginPass] = useState('admin-sideb-2025');
  
  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  
  // Signup Form States
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupArtistName, setSignupArtistName] = useState('');
  const [signupBio, setSignupBio] = useState('');
  const [signupLocation, setSignupLocation] = useState('');
  const [signupRoles, setSignupRoles] = useState(['Beatmaker']);
  
  const [loading, setLoading] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const rolesOptions = ['Lyricist', 'Beatmaker', 'Vocalist'];

  const handleRoleToggle = (role) => {
    if (signupRoles.includes(role)) {
      setSignupRoles(signupRoles.filter(r => r !== role));
    } else {
      setSignupRoles([...signupRoles, role]);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginUser || !loginPass) {
      addToast('Please enter both email/username and passcode', 'error');
      return;
    }

    setLoading(true);
    try {
      const user = await authAPI.login(loginUser, loginPass);
      addToast('Studio Console unlocked', 'Welcome back, producer.');
      onLoginSuccess(user);
    } catch (err) {
      addToast(err.message || 'Access denied. Check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!signupUsername || !signupEmail || !signupPassword || !signupArtistName) {
      addToast('Required fields are missing', 'error');
      return;
    }
    setLoading(true);
    try {
      const user = await authAPI.signup({
        username: signupUsername,
        email: signupEmail,
        password: signupPassword,
        artistName: signupArtistName,
        bio: signupBio,
        location: signupLocation,
        roles: signupRoles
      });
      addToast('Creator Vault created successfully!', 'Welcome to StagePass.');
      onLoginSuccess(user);
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      addToast('Enter registered email address', 'error');
      return;
    }
    addToast('Passcode reset queued', 'Check your creator inbox shortly.');
    setShowForgot(false);
  };

  const handleQuickLogin = async (username) => {
    setLoading(true);
    try {
      const user = await authAPI.login(username, 'password123');
      addToast('Sandbox Console Unlocked', `Welcome, ${user.artistName}`);
      onLoginSuccess(user);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const scrollToPlayer = () => {
    const el = document.getElementById('playerPanel');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => setIsPlayingPreview(prev => !prev), 500);
    }
  };

  return (
    <div className="site-shell">
      <div className="grain"></div>

      {/* TOPBAR */}
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Side A home">
          <span className="brand-mark"><span></span><span></span><span></span></span>
          <span className="brand-copy"><strong>SID<span>E</span> A</strong><small>side a is free · flip it · own side b</small></span>
        </a>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#catalog">Catalog</a>
          <a href="#how-it-works">How it works</a>
          <a href="#artists">Artists</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="top-actions">
          <button className="air-pill" type="button"><i></i> ON AIR</button>
          <button className="preview-button" type="button" onClick={scrollToPlayer}><span>◉</span> Preview mixtape</button>
        </div>
      </header>

      <main id="top">

        {/* HERO */}
        <section className="hero" id="catalog">
          <div className="eyebrow"><i></i> NOW SPINNING · V2.4 · SANDBOX MODE</div>
          <h1>Side A is <em>free.</em><br />Flip it. Own <em>Side B.</em></h1>
          <p className="hero-intro">A cassette-era paywall for a streaming world. Preview the hook,<br />then unlock the full track and keep the rights.</p>

          <div className="console-grid">

            {/* LEFT PANEL: VAULT PANEL */}
            <section className="panel vault-panel">
              <div className="tape-label label-left">SIDE A</div>
              <div className="panel-kicker"><span>⌁</span> MUSICFLOW PORTAL</div>

              <div className="tabs" role="tablist">
                <button
                  className={`tab ${!isSignUp ? 'active' : ''}`}
                  type="button"
                  onClick={() => setIsSignUp(false)}
                >
                  VAULT SIGN IN
                </button>
                <button
                  className={`tab ${isSignUp ? 'active' : ''}`}
                  type="button"
                  onClick={() => setIsSignUp(true)}
                >
                  REGISTER
                </button>
              </div>

              {showForgot ? (
                <form className="vault-form" onSubmit={handleForgotPassword}>
                  <label>
                    RESET CREATOR EMAIL
                    <span className="input-wrap">
                      <b>✉</b>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="producer@resonance.fm"
                        required
                      />
                    </span>
                  </label>
                  <button className="unlock-button" type="submit">
                    <span>♙</span> SEND PASSCODE RESET <b>›</b>
                  </button>
                  <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setShowForgot(false); }} style={{ color: '#7de3f1', fontSize: '11px' }}>
                      Back to sign in
                    </a>
                  </div>
                </form>
              ) : !isSignUp ? (
                <form className="vault-form" onSubmit={handleLoginSubmit}>
                  <label>
                    CREATOR EMAIL
                    <span className="input-wrap">
                      <b>✉</b>
                      <input
                        type="text"
                        value={loginUser}
                        onChange={(e) => setLoginUser(e.target.value)}
                        placeholder="producer@resonance.fm"
                        required
                      />
                    </span>
                  </label>
                  <label>
                    VAULT PASSCODE <a href="#" onClick={(e) => { e.preventDefault(); setShowForgot(true); }}>Forgot?</a>
                    <span className="input-wrap">
                      <b>⌕</b>
                      <input
                        type="password"
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                        placeholder="sideb-secret"
                        required
                      />
                    </span>
                  </label>
                  <button className="unlock-button" type="submit" disabled={loading}>
                    <span>♙</span> {loading ? 'UNLOCKING...' : 'UNLOCK STUDIO CONSOLE'} <b>›</b>
                  </button>
                </form>
              ) : (
                <form className="vault-form" onSubmit={handleSignUpSubmit} style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  <label>
                    USERNAME *
                    <span className="input-wrap">
                      <input
                        type="text"
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        placeholder="e.g. novareyes"
                        required
                      />
                    </span>
                  </label>
                  <label>
                    ARTIST NAME *
                    <span className="input-wrap">
                      <input
                        type="text"
                        value={signupArtistName}
                        onChange={(e) => setSignupArtistName(e.target.value)}
                        placeholder="e.g. Nova Reyes"
                        required
                      />
                    </span>
                  </label>
                  <label>
                    CREATOR EMAIL *
                    <span className="input-wrap">
                      <b>✉</b>
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="name@stagepass.com"
                        required
                      />
                    </span>
                  </label>
                  <label>
                    PASSCODE *
                    <span className="input-wrap">
                      <b>⌕</b>
                      <input
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        required
                      />
                    </span>
                  </label>
                  <button className="unlock-button" type="submit" disabled={loading}>
                    <span>♙</span> {loading ? 'CREATING...' : 'CREATE CREATOR VAULT'} <b>›</b>
                  </button>
                </form>
              )}

              <pre className="terminal" style={{ marginTop: '24px' }}>
[00:12] &gt; booting MuseFlow kernel v2.4...{"\n"}
[00:13] &gt; connecting to vault.sideA...{"\n"}
[00:14] &gt; handshake ok · encryption AES-CASSETTE{"\n"}
[00:15] &gt; waveform decoder ready
              </pre>
            </section>

            {/* RIGHT PANEL: PREVIEW PANEL */}
            <section className="panel preview-panel" id="playerPanel">
              <div className="tape-label label-right">MIXTAPE 01</div>
              <div className="panel-kicker"><span>✧</span> DESIGNER PREVIEW <small>SONG 01</small></div>
              <div className="track-heading">
                <div className="cover-art">
                  <span className="sun"></span>
                  <span className="mountain m1"></span>
                  <span className="mountain m2"></span>
                  <b>AFTER<br />DARK</b>
                </div>
                <div>
                  <h2>Midnight Eclipse</h2>
                  <p>by Aarav × Maya</p>
                  <div className="tags">
                    <span>92 BPM</span>
                    <span>F♯ MINOR</span>
                    <span className="tag-hot">SYNTHWAVE</span>
                  </div>
                </div>
              </div>
              <p className="helper-text">Configure paywall boundaries in waveform console below.</p>
              <div className="lyrics">
                <span>01</span> [intro — free preview]<br />
                <span>02</span> [verse 1 teaser — 8 bars]<br />
                <span>03</span> [pre-chorus melody demo]<br />
                <span>04</span> <b>··· flip to Side B to unlock ···</b><br />
                <span>05</span> <b>··· hook + full verse locked ···</b><br />
                <span>06</span> <b>··· bridge + outro locked ···</b>
              </div>
              <div className="waveform" aria-label="Audio waveform">
                <div className="wave-bars"></div>
                <div className="wave-label"><span>SIDE A · FREE</span><span>SIDE B · PAID</span></div>
              </div>
              <button
                className={`play-button ${isPlayingPreview ? 'playing' : ''}`}
                id="playButton"
                type="button"
                aria-label="Play preview"
                onClick={() => {
                  setIsPlayingPreview(!isPlayingPreview);
                  addToast(
                    !isPlayingPreview ? 'Now previewing Side A' : 'Preview paused',
                    !isPlayingPreview ? 'Midnight Eclipse · 92 BPM' : 'Your tape is waiting.'
                  );
                }}
              >
                <span className="play-icon">{isPlayingPreview ? 'Ⅱ' : '▶'}</span>
                <span className="play-copy">
                  <b>{isPlayingPreview ? 'PLAYING SIDE A' : 'PREVIEWING SIDE A'}</b>
                  <small>00:32 / 02:48</small>
                </span>
                <span className="play-status">{isPlayingPreview ? '◉ PLAYING' : '◉'}</span>
              </button>
            </section>

          </div>
        </section>

        {/* TICKER */}
        <div className="ticker" aria-label="Side A benefits">
          <span>SIDE A FREE</span><b>◆</b>
          <span>SIDE B PAID</span><b>◆</b>
          <span>FAIR PAYOUTS</span><b>◆</b>
          <span>INDIE FIRST</span><b>◆</b>
          <span>CASSETTE ECONOMY</span><b>◆</b>
          <span>REMIX-READY STEMS</span><b>◆</b>
          <span>INSTANT LICENSING</span>
        </div>

        {/* STATS */}
        <section className="stats" id="pricing">
          <div><strong>12.4K</strong><small>TRACKS LICENSED</small></div>
          <div><strong>2.1K</strong><small>INDIE ARTISTS</small></div>
          <div><strong>48.7K</strong><small>SIDE B UNLOCKS</small></div>
          <div><strong>₹1,240</strong><small>AVG PAYOUT</small></div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how-section" id="how-it-works">
          <div className="section-heading">
            <div>
              <span className="mini-kicker">THE MIXTAPE ECONOMY</span>
              <h2>Flip the cassette. <em>Own<br />Side B.</em></h2>
              <p>Every track starts with a free taste. The full experience stays in your vault.</p>
            </div>
            <div className="cassette-icon">
              <div className="reel reel-one"></div>
              <div className="reel reel-two"></div>
              <span>SIDE A<br />SIDE B</span>
            </div>
          </div>
          <h3>How the vault works</h3>
          <div className="steps">
            <article>
              <span className="step-num">01</span>
              <i>✧</i>
              <h4>Upload your track</h4>
              <p>Drop a WAV, tag the vibe, credit collaborators. Auto-BPM detection included.</p>
            </article>
            <article>
              <span className="step-num">02</span>
              <i>✧</i>
              <h4>Set Side A / Side B</h4>
              <p>Drag the paywall on the waveform. Free teaser stays public — the rest goes in the vault.</p>
            </article>
            <article>
              <span className="step-num">03</span>
              <i>✧</i>
              <h4>Get paid, keep rights</h4>
              <p>Fans, brands, and creators license Side B. You keep 90% and full ownership.</p>
            </article>
          </div>
        </section>

        {/* ARTISTS */}
        <section className="artists-section" id="artists">
          <span className="mini-kicker">LOUD IN THE STUDIO</span>
          <h2>Artists on rotation</h2>
          <div className="quotes">
            <article>
              <b className="quote-mark">“</b>
              <p>Side A hooked my listeners, Side B pays my rent. This is the mixtape economy I dreamed of.</p>
              <div className="person">
                <span>IS</span>
                <div><b>Ishaan Verma</b><small>PRODUCER · MUMBAI</small></div>
              </div>
            </article>
            <article>
              <b className="quote-mark">“</b>
              <p>Finally a platform that respects the craft — half nostalgia, half future, all fair.</p>
              <div className="person">
                <span>NK</span>
                <div><b>Nikita Rao</b><small>LYRICIST · BENGALURU</small></div>
              </div>
            </article>
            <article>
              <b className="quote-mark">“</b>
              <p>The paywall waveform tool is stupid clever. I set boundaries in seconds.</p>
              <div className="person">
                <span>DK</span>
                <div><b>DJ Kohl</b><small>BEATMAKER · DELHI</small></div>
              </div>
            </article>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer>
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark"><span></span><span></span><span></span></span>
          <span className="brand-copy"><strong>SID<span>E</span> A</strong><small>side a is free · flip it · own side b</small></span>
        </a>
        <span>© 2025 · Made for indie ears</span>
        <div>
          <a href="#top">Terms</a>
          <a href="#top">Privacy</a>
          <a href="#top">Licensing</a>
          <a href="#top">Contact</a>
        </div>
      </footer>
    </div>
  );
}
