import React, { useState } from 'react';
import { authAPI } from '../api/db';
import { Shield, Mail, Lock, User, Music, Sparkles, Radio, Disc, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Login({ onLoginSuccess, addToast }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  
  // Login Form States
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
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
      addToast(`Studio Unlocked. Welcome, ${user.artistName}`, 'success');
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
      addToast('Studio Profile Registered successfully!', 'success');
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
    addToast('Vault reset passcode dispatched!', 'success');
    setShowForgot(false);
  };

  const handleQuickLogin = async (username) => {
    setLoading(true);
    try {
      const user = await authAPI.login(username, 'password123');
      addToast(`Sandbox access: ${user.artistName}`, 'success');
      onLoginSuccess(user);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg-dark)', color: '#fff', overflowX: 'hidden' }}>
      
      {/* ── TOP NAV HEADER ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px',
        background: 'rgba(7, 3, 14, 0.88)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(168, 85, 247, 0.15)'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            padding: '8px', borderRadius: '10px', display: 'flex',
            boxShadow: '0 0 20px rgba(236, 72, 153, 0.4)'
          }}>
            <Disc size={22} color="#fff" />
          </div>
          <div>
            <div className="font-orbitron" style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '1px', background: 'linear-gradient(90deg, #ffffff, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              STAGEPASS
            </div>
            <div className="font-mono" style={{ fontSize: '10px', color: '#a1a1aa', letterSpacing: '0.5px', marginTop: '-2px' }}>
              side a is free • flip it to own side b
            </div>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }} className="desktop-nav">
          {['Catalog', 'How it works', 'Artists', 'Pricing'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '')}`} style={{
              color: '#d4d4d8', textDecoration: 'none', fontSize: '13px', fontWeight: 600,
              letterSpacing: '0.5px', transition: 'color 0.2s'
            }} onMouseOver={(e) => e.target.style.color = '#00f0ff'} onMouseOut={(e) => e.target.style.color = '#d4d4d8'}>
              {item}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '20px',
            background: 'rgba(236, 72, 153, 0.08)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            fontSize: '11px', fontWeight: 700, color: '#f472b6',
            letterSpacing: '1px'
          }}>
            <Radio size={13} style={{ color: '#22c55e', animation: 'pulse 1.5s infinite' }} /> ON AIR •
          </div>
          <button type="button" className="btn btn-secondary" style={{ borderRadius: '12px', fontSize: '12px', padding: '8px 16px', background: 'rgba(255,255,255,0.06)' }}>
            <Music size={14} /> Preview mixtape
          </button>
        </div>
      </header>


      {/* ── HERO SECTION ── */}
      <section style={{ textAlign: 'center', padding: '60px 20px 40px', maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Version Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 18px', borderRadius: '20px',
          background: 'rgba(147, 51, 234, 0.12)',
          border: '1px solid rgba(147, 51, 234, 0.35)',
          fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: '#c084fc',
          marginBottom: '28px', boxShadow: '0 0 20px rgba(147, 51, 234, 0.2)'
        }}>
          ✦ NOW SPINNING • V2.4 • SANDBOX MODE
        </div>

        {/* Main Headline */}
        <h1 className="font-orbitron" style={{
          fontSize: 'clamp(2.2rem, 5.5vw, 4.2rem)',
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: '1px',
          marginBottom: '20px',
          textTransform: 'uppercase'
        }}>
          <span style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 60%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 25px rgba(255, 255, 255, 0.3))'
          }}>
            SIDE A IS FREE.
          </span>
          <br />
          <span style={{
            background: 'linear-gradient(90deg, #f43f5e 0%, #ec4899 50%, #d946ef 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 35px rgba(236, 72, 153, 0.4))'
          }}>
            FLIP IT. OWN SIDE B.
          </span>
        </h1>

        {/* Hero Paragraph */}
        <p style={{
          fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
          color: '#94a3b8',
          maxWidth: '680px',
          margin: '0 auto 48px',
          lineHeight: 1.6,
          fontWeight: 400
        }}>
          A cassette-era paywall for a streaming world. Sign In to your MuseFlow vault and paint the boundary between free listeners and licensed fans.
        </p>

      </section>


      {/* ── SPLIT CONSOLE PANEL GRID ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 80px', padding: '0 20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '32px',
          alignItems: 'stretch'
        }}>
          
          {/* LEFT PANEL: MUSEFLOW PORTAL */}
          <div className="glass-panel glow-purple" style={{
            position: 'relative',
            borderRadius: '24px',
            background: 'rgba(14, 10, 24, 0.92)',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1.5px solid rgba(147, 51, 234, 0.25)'
          }}>
            {/* Cassette Tape Sticker Accent */}
            <div className="tape-accent tape-accent-left"></div>

            <div>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <Music size={18} style={{ color: '#00f0ff' }} />
                <span className="font-mono" style={{ fontSize: '11px', letterSpacing: '2px', color: '#94a3b8', textTransform: 'uppercase' }}>
                  MUSEFLOW PORTAL
                </span>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '24px' }}>
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="font-chakra"
                  style={{
                    flex: 1, paddingBottom: '12px', border: 'none', background: 'transparent',
                    color: !isSignUp ? '#fff' : '#71717a',
                    borderBottom: !isSignUp ? '2px solid #00f0ff' : '2px solid transparent',
                    cursor: 'pointer', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase'
                  }}
                >
                  VAULT SIGN IN
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="font-chakra"
                  style={{
                    flex: 1, paddingBottom: '12px', border: 'none', background: 'transparent',
                    color: isSignUp ? '#fff' : '#71717a',
                    borderBottom: isSignUp ? '2px solid #00f0ff' : '2px solid transparent',
                    cursor: 'pointer', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase'
                  }}
                >
                  REGISTER
                </button>
              </div>

              {/* Forgot Password View */}
              {showForgot ? (
                <form onSubmit={handleForgotPassword}>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <h3 className="font-chakra" style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>Reset Vault Access</h3>
                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>Recover your studio console access passcode.</p>
                  </div>
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label font-mono" style={{ fontSize: '11px', letterSpacing: '1px' }}>CREATOR EMAIL</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#71717a' }} />
                      <input type="email" className="form-control" style={{ paddingLeft: '42px' }} placeholder="producer@resonance.fm" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
                    </div>
                  </div>
                  <button type="submit" className="btn" style={{ width: '100%', background: 'linear-gradient(90deg, #ec4899, #f59e0b)', color: '#fff', fontWeight: 800, height: '44px', borderRadius: '12px' }}>
                    SEND PASSCODE
                  </button>
                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setShowForgot(false); }} style={{ color: '#00f0ff', textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}>
                      Back to sign in
                    </a>
                  </div>
                </form>
              ) : !isSignUp ? (
                /* Login Form */
                <form onSubmit={handleLoginSubmit}>
                  <div className="form-group" style={{ marginBottom: '18px' }}>
                    <label className="form-label font-mono" style={{ fontSize: '11px', letterSpacing: '1px', color: '#a1a1aa' }}>CREATOR EMAIL</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#71717a' }} />
                      <input
                        type="text"
                        className="form-control"
                        style={{ paddingLeft: '42px', background: 'rgba(5, 4, 10, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', height: '44px', color: '#fff' }}
                        placeholder="producer@resonance.fm"
                        value={loginUser}
                        onChange={(e) => setLoginUser(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="form-label font-mono" style={{ fontSize: '11px', letterSpacing: '1px', color: '#a1a1aa', marginBottom: 0 }}>VAULT PASSCODE</label>
                      <a href="#" onClick={(e) => { e.preventDefault(); setShowForgot(true); }} style={{ fontSize: '11px', color: '#00f0ff', textDecoration: 'none' }}>
                        Forgot?
                      </a>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#71717a' }} />
                      <input
                        type="password"
                        className="form-control"
                        style={{ paddingLeft: '42px', background: 'rgba(5, 4, 10, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', height: '44px', color: '#fff' }}
                        placeholder="••••••••••••"
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn font-chakra"
                    style={{
                      width: '100%',
                      background: 'linear-gradient(90deg, #ec4899 0%, #f43f5e 50%, #f59e0b 100%)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '13px',
                      height: '46px',
                      borderRadius: '12px',
                      letterSpacing: '1px',
                      boxShadow: '0 4px 25px rgba(236, 72, 153, 0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                    disabled={loading}
                  >
                    <Lock size={15} /> {loading ? 'UNLOCKING...' : 'UNLOCK STUDIO CONSOLE >'}
                  </button>
                </form>
              ) : (
                /* Registration Form */
                <form onSubmit={handleSignUpSubmit} style={{ maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label className="form-label font-mono" style={{ fontSize: '11px' }}>USERNAME *</label>
                    <input type="text" className="form-control" placeholder="e.g. novareyes" value={signupUsername} onChange={(e) => setSignupUsername(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label className="form-label font-mono" style={{ fontSize: '11px' }}>ARTIST / DISPLAY NAME *</label>
                    <input type="text" className="form-control" placeholder="e.g. Nova Reyes" value={signupArtistName} onChange={(e) => setSignupArtistName(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label className="form-label font-mono" style={{ fontSize: '11px' }}>CREATOR EMAIL *</label>
                    <input type="email" className="form-control" placeholder="name@stagepass.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label className="form-label font-mono" style={{ fontSize: '11px' }}>VAULT PASSCODE *</label>
                    <input type="password" className="form-control" placeholder="Min 6 characters" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label font-mono" style={{ fontSize: '11px' }}>CREATOR ROLES</label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {rolesOptions.map(role => {
                        const active = signupRoles.includes(role);
                        return (
                          <button key={role} type="button" onClick={() => handleRoleToggle(role)} className={`btn ${active ? 'btn-cyan' : 'btn-secondary'}`} style={{ flex: 1, fontSize: '11px', height: '30px', borderRadius: '8px' }}>
                            {role}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary font-chakra" style={{ width: '100%', height: '44px', fontWeight: 800 }}>
                    {loading ? 'CREATING...' : 'REGISTER PROFILE'}
                  </button>
                </form>
              )}
            </div>

            {/* Quick Sandbox Login & Terminal Logs */}
            <div style={{ marginTop: '28px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '18px' }}>
              <div className="font-mono" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
                <Shield size={12} style={{ color: '#00f0ff' }} /> &gt;_ SANDBOX CONSOLE LOGS
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                <button type="button" onClick={() => handleQuickLogin('aarav_sharma')} className="btn btn-secondary font-mono" style={{ fontSize: '10px', height: '30px', padding: '4px', borderRadius: '8px' }}>• AARAV (SINGER)</button>
                <button type="button" onClick={() => handleQuickLogin('maya_lyricist')} className="btn btn-secondary font-mono" style={{ fontSize: '10px', height: '30px', padding: '4px', borderRadius: '8px' }}>• MAYA (LYRICIST)</button>
                <button type="button" onClick={() => handleQuickLogin('rohan_beats')} className="btn btn-secondary font-mono" style={{ fontSize: '10px', height: '30px', padding: '4px', borderRadius: '8px' }}>• ROHAN (BEATMAKER)</button>
                <button type="button" onClick={() => handleQuickLogin('dev_guitarist')} className="btn btn-secondary font-mono" style={{ fontSize: '10px', height: '30px', padding: '4px', borderRadius: '8px' }}>• DEV (VOCALIST)</button>
              </div>

              {/* Dark Terminal Output */}
              <div className="font-mono" style={{
                background: '#040208',
                border: '1px solid rgba(147, 51, 234, 0.2)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '10px',
                color: '#a855f7',
                lineHeight: 1.5
              }}>
                <div><span style={{ color: '#64748b' }}>[00:12]</span> &gt; booting MuseFlow kernel v2.4..</div>
                <div><span style={{ color: '#64748b' }}>[00:13]</span> &gt; connecting to vault.sideA..</div>
                <div><span style={{ color: '#64748b' }}>[00:14]</span> &gt; handshake OK - encryption AES-CASSETTE</div>
                <div><span style={{ color: '#64748b' }}>[00:15]</span> &gt; waveform decoder ready</div>
                <div style={{ color: '#f59e0b' }}><span style={{ color: '#64748b' }}>[00:16]</span> &gt; awaiting creator credentials..</div>
              </div>
            </div>

          </div>


          {/* RIGHT PANEL: DESIGNER PREVIEW */}
          <div className="glass-panel glow-pink" style={{
            position: 'relative',
            borderRadius: '24px',
            background: 'rgba(14, 10, 24, 0.92)',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1.5px solid rgba(236, 72, 153, 0.25)',
            overflow: 'hidden'
          }}>
            {/* Cassette Tape Sticker Accent */}
            <div className="tape-accent tape-accent-right"></div>

            <div>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} style={{ color: '#00f0ff' }} />
                  <span className="font-mono" style={{ fontSize: '11px', letterSpacing: '2px', color: '#94a3b8' }}>DESIGNER PREVIEW</span>
                </div>
                <span className="font-mono" style={{ fontSize: '10px', background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)', padding: '2px 8px', borderRadius: '4px', color: '#f472b6' }}>SONG</span>
              </div>

              {/* Title & Metadata */}
              <h3 className="font-pixel" style={{ fontSize: '1.3rem', color: '#ffffff', letterSpacing: '1px', marginBottom: '8px' }}>
                MIDNIGHT ECLIPSE
              </h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
                by Aarav × Maya
              </p>

              {/* Tags */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <span className="font-mono" style={{ fontSize: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '3px 8px', borderRadius: '4px', color: '#e2e8f0' }}>92 BPM</span>
                <span className="font-mono" style={{ fontSize: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '3px 8px', borderRadius: '4px', color: '#e2e8f0' }}>F# MINOR</span>
                <span className="font-mono" style={{ fontSize: '10px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', padding: '3px 8px', borderRadius: '4px', color: '#f59e0b' }}>SYNTHWAVE</span>
              </div>

              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
                Configure paywall boundaries in waveform console below.
              </p>

              {/* Verse Code Block Breakdown */}
              <div className="font-mono" style={{
                background: '#040208',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '14px',
                fontSize: '11px',
                lineHeight: 1.7,
                marginBottom: '20px'
              }}>
                <div style={{ color: '#64748b' }}>01 <span style={{ color: '#00f0ff' }}>[intro - free preview]</span></div>
                <div style={{ color: '#64748b' }}>02 <span style={{ color: '#00f0ff' }}>[verse 1 teaser - 8 bars]</span></div>
                <div style={{ color: '#64748b' }}>03 <span style={{ color: '#00f0ff' }}>[pre-chorus melody demo]</span></div>
                <div style={{ color: '#ec4899', fontWeight: 700 }}>04 *** flip to Side B to unlock ***</div>
                <div style={{ color: '#64748b' }}>05 <span style={{ color: '#71717a' }}>*** hook + full verse locked ***</span></div>
                <div style={{ color: '#64748b' }}>06 <span style={{ color: '#71717a' }}>*** bridge + outro locked ***</span></div>
              </div>

              {/* Waveform Equalizer Preview */}
              <div style={{
                background: 'rgba(4, 2, 8, 0.8)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '10px' }} className="font-mono">
                  <span style={{ color: '#00f0ff' }}>SIDE A • FREE</span>
                  <span style={{ color: '#ec4899' }}>SIDE B • PAID</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '48px', position: 'relative' }}>
                  {[...Array(32)].map((_, i) => {
                    const isSideA = i < 14;
                    return (
                      <div key={i} style={{
                        flex: 1,
                        height: `${30 + Math.abs(Math.sin(i * 0.5) * 65)}%`,
                        background: isSideA
                          ? 'linear-gradient(180deg, #00f0ff, #ec4899)'
                          : 'rgba(168, 85, 247, 0.25)',
                        borderRadius: '2px'
                      }} />
                    );
                  })}
                  {/* Pin paywall boundary marker */}
                  <div style={{
                    position: 'absolute', left: '44%', top: '-8px', bottom: '-4px', width: '2px',
                    background: '#ec4899', boxShadow: '0 0 10px #ec4899'
                  }}>
                    <div style={{ position: 'absolute', top: '-6px', left: '-5px', width: '12px', height: '12px', borderRadius: '50%', background: '#ec4899', border: '2px solid #fff' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Toast Notification Mockup */}
            <div style={{
              marginTop: '20px',
              background: 'rgba(20, 14, 34, 0.95)',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              <div>
                <div className="font-chakra" style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>Studio Console unlocked</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Welcome back, producer.</div>
              </div>
              <CheckCircle2 size={18} style={{ color: '#22c55e' }} />
            </div>

          </div>

        </div>
      </section>


      {/* ── CONTINUOUS TICKER MARQUEE RIBBON ── */}
      <section className="ticker-ribbon" style={{ margin: '40px 0 70px' }}>
        <div className="ticker-track font-pixel" style={{ fontSize: '11px', color: '#e9d5ff', letterSpacing: '2px' }}>
          {[...Array(3)].map((_, idx) => (
            <React.Fragment key={idx}>
              <span>SIDE B PAID</span> <span style={{ color: '#ec4899' }}>◆</span>
              <span>FAIR PAYOUTS</span> <span style={{ color: '#00f0ff' }}>◆</span>
              <span>INDIE FIRST</span> <span style={{ color: '#ec4899' }}>◆</span>
              <span>CASSETTE ECONOMY</span> <span style={{ color: '#f59e0b' }}>◆</span>
              <span>REMIX-READY STEMS</span> <span style={{ color: '#00f0ff' }}>◆</span>
              <span>INSTANT LICENSING</span> <span style={{ color: '#ec4899' }}>◆</span>
              <span>SIDE A IS FREE</span> <span style={{ color: '#22c55e' }}>◆</span>
            </React.Fragment>
          ))}
        </div>
      </section>


      {/* ── METRICS DASHBOARD ROW ── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 90px', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {[
            { num: '12.4K', label: 'TRACKS LICENSED' },
            { num: '2.1K', label: 'INDIE ARTISTS' },
            { num: '48.7K', label: 'SIDE B UNLOCKS' },
            { num: '₹1,240', label: 'AVG PAYOUT' }
          ].map((stat, i) => (
            <div key={i} className="glass-panel" style={{
              background: 'rgba(14, 10, 24, 0.8)',
              border: '1px solid rgba(168, 85, 247, 0.18)',
              borderRadius: '18px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div className="font-pixel" style={{
                fontSize: '1.6rem',
                color: i % 2 === 0 ? '#f472b6' : '#00f0ff',
                marginBottom: '8px',
                filter: `drop-shadow(0 0 12px ${i % 2 === 0 ? 'rgba(244,114,182,0.4)' : 'rgba(0,240,255,0.4)'})`
              }}>
                {stat.num}
              </div>
              <div className="font-mono" style={{ fontSize: '10px', letterSpacing: '1.5px', color: '#94a3b8' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ── THE MIXTAPE ECONOMY SECTION ── */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 100px', padding: '0 20px', textAlign: 'center' }}>
        <div style={{
          background: 'rgba(14, 10, 24, 0.75)',
          border: '1.5px solid rgba(168, 85, 247, 0.25)',
          borderRadius: '28px',
          padding: '48px 32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}>
          <span className="font-mono" style={{ fontSize: '11px', letterSpacing: '2px', color: '#ec4899', textTransform: 'uppercase' }}>
            THE MIXTAPE ECONOMY
          </span>
          <h2 className="font-pixel" style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
            color: '#fff',
            marginTop: '16px',
            marginBottom: '20px',
            lineHeight: 1.2
          }}>
            FLIP THE CASSETTE. <span style={{ color: '#f472b6' }}>OWN SIDE B.</span>
          </h2>
          <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
            StagePass splits every track into a free teaser and a licensable premium half. Free preview stays public for fans — Side B is locked until licensed.
          </p>
        </div>
      </section>


      {/* ── HOW THE VAULT WORKS SECTION ── */}
      <section id="howitworks" style={{ maxWidth: '1100px', margin: '0 auto 110px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span className="font-mono" style={{ fontSize: '11px', letterSpacing: '2px', color: '#00f0ff' }}>
            LOUD &amp; CLEAR
          </span>
          <h2 className="font-pixel" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', color: '#fff', marginTop: '10px' }}>
            HOW THE VAULT WORKS
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {[
            { step: '01', title: 'UPLOAD YOUR TRACK', text: 'Drop a WAV, tag the vibe, credit collaborators. Auto-BPM and key detection included.' },
            { step: '02', title: 'SET SIDE A / SIDE B', text: 'Drag the paywall on the waveform. Free teaser stays public — the rest goes in the vault.' },
            { step: '03', title: 'GET PAID, KEEP RIGHTS', text: 'Fans, brands, and creators license Side B. You keep 90% and full ownership.' }
          ].map((card, idx) => (
            <div key={idx} className="glass-panel" style={{
              background: 'rgba(14, 10, 24, 0.85)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              borderRadius: '20px',
              padding: '32px 24px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background Step Number Watermark */}
              <div className="font-pixel" style={{
                position: 'absolute', top: '10px', right: '16px',
                fontSize: '4.5rem', color: 'rgba(168, 85, 247, 0.06)',
                pointerEvents: 'none', select: 'none'
              }}>
                {card.step}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ec4899', marginBottom: '14px' }}>
                <Sparkles size={16} />
              </div>

              <h4 className="font-chakra" style={{ fontSize: '16px', fontWeight: 800, color: '#fff', letterSpacing: '1px', marginBottom: '10px' }}>
                {card.title}
              </h4>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </section>


      {/* ── ARTISTS ON ROTATION SECTION ── */}
      <section id="artists" style={{ maxWidth: '1100px', margin: '0 auto 100px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span className="font-mono" style={{ fontSize: '11px', letterSpacing: '2px', color: '#00f0ff' }}>
            LOUD IN THE STUDIO
          </span>
          <h2 className="font-pixel" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', color: '#fff', marginTop: '10px' }}>
            ARTISTS ON ROTATION
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {[
            {
              quote: 'Side A hooked my listeners, Side B pays my rent. StagePass is the mixtape economy I dreamed of.',
              name: 'Ishaan Verma', role: 'PRODUCER • MUMBAI', avatar: 'I'
            },
            {
              quote: 'Finally a platform that respects the craft — half nostalgia, half future, all fair.',
              name: 'Nikita Rao', role: 'LYRICIST • BENGALURU', avatar: 'N'
            },
            {
              quote: 'The paywall waveform tool is stupid clever. I set boundaries in seconds.',
              name: 'DJ Kohl', role: 'BEATMAKER • DELHI', avatar: 'D'
            }
          ].map((item, i) => (
            <div key={i} className="glass-panel" style={{
              background: 'rgba(14, 10, 24, 0.85)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              borderRadius: '20px',
              padding: '28px',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
            }}>
              <p style={{ fontSize: '13.5px', color: '#e2e8f0', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '24px' }}>
                "{item.quote}"
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '14px', color: '#fff'
                }}>
                  {item.avatar}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{item.name}</div>
                  <div className="font-mono" style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.5px' }}>{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid rgba(168, 85, 247, 0.15)',
        background: 'rgba(4, 2, 8, 0.95)',
        padding: '36px 32px'
      }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px'
        }}>
          <div>
            <div className="font-orbitron" style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', letterSpacing: '1px', marginBottom: '4px' }}>
              STAGEPASS
            </div>
            <div className="font-mono" style={{ fontSize: '11px', color: '#64748b' }}>
              © 2026 • Made for indie ears • side a free • side b paid
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px' }} className="font-mono">
            {['Terms', 'Privacy', 'Licensing', 'Contact'].map(link => (
              <a key={link} href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#00f0ff'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}>
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
