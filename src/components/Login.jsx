import React, { useState } from 'react';
import { authAPI } from '../api/db';
import { Shield, Mail, Lock, User, Music, Sparkles } from 'lucide-react';

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
    <div style={{
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      zIndex: 1,
      position: 'relative'
    }}>
      
      {/* Side-by-Side Locked Split Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '30px',
        width: '100%',
        maxWidth: '1100px',
        alignItems: 'stretch'
      }}>
        
        {/* Left Side: Vault Access */}
        <div className="glass-panel glow-purple" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '36px',
          textAlign: 'left'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <Music size={22} style={{ color: 'var(--accent-cyan)' }} />
              <span className="mono" style={{ fontSize: '12px', letterSpacing: '2px', color: 'var(--text-muted)' }}>MUSEFLOW PORTAL</span>
            </div>

            {showForgot ? (
              <form onSubmit={handleForgotPassword}>
                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>Reset Vault Access</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>Recover your profile console access code.</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="producer@resonance.fm" 
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                  Send Passcode
                </button>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); setShowForgot(false); }}
                    style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}
                  >
                    Back to log in
                  </a>
                </div>
              </form>
            ) : (
              <>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', marginBottom: '24px' }}>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    style={{
                      flex: 1,
                      paddingBottom: '12px',
                      border: 'none',
                      background: 'transparent',
                      color: !isSignUp ? 'var(--text-main)' : 'var(--text-muted)',
                      borderBottom: !isSignUp ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Vault Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    style={{
                      flex: 1,
                      paddingBottom: '12px',
                      border: 'none',
                      background: 'transparent',
                      color: isSignUp ? 'var(--text-main)' : 'var(--text-muted)',
                      borderBottom: isSignUp ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Register
                  </button>
                </div>

                {!isSignUp ? (
                  <form onSubmit={handleLoginSubmit}>
                    <div className="form-group">
                      <label className="form-label">Creator Email</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="producer@resonance.fm" 
                        value={loginUser}
                        onChange={(e) => setLoginUser(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label className="form-label" style={{ marginBottom: 0 }}>Vault Passcode</label>
                        <a 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); setShowForgot(true); }}
                          style={{ fontSize: '11px', color: 'var(--accent-cyan)', textDecoration: 'none' }}
                        >
                          Forgot?
                        </a>
                      </div>
                      <input 
                        type="password" 
                        className="form-control" 
                        placeholder="••••••••••••" 
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
                      {loading ? 'Unlocking Studio...' : 'Unlock Studio Console'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignUpSubmit} style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                    <div className="form-group">
                      <label className="form-label">Username *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. novareyes" 
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Artist / Display Name *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Nova Reyes" 
                        value={signupArtistName}
                        onChange={(e) => setSignupArtistName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        placeholder="name@stagepass.com" 
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Vault Passcode *</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        placeholder="Min 6 characters" 
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label">Creator Roles *</label>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {rolesOptions.map(role => {
                          const active = signupRoles.includes(role);
                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => handleRoleToggle(role)}
                              className={`btn ${active ? 'btn-cyan' : 'btn-secondary'}`}
                              style={{ flex: 1, fontSize: '11px', height: '30px', padding: '0', borderRadius: '8px' }}
                            >
                              {role}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                      {loading ? 'Creating...' : 'Register Profile'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          {/* Sandbox quick access */}
          <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
            <div className="subhead" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <Shield size={12} style={{ color: 'var(--accent-cyan)' }} /> Sandbox Console Logs
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button type="button" onClick={() => handleQuickLogin('aarav_sharma')} className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px', height: '32px', borderRadius: '8px' }}>Aarav (Singer)</button>
              <button type="button" onClick={() => handleQuickLogin('maya_lyricist')} className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px', height: '32px', borderRadius: '8px' }}>Maya (Lyricist)</button>
              <button type="button" onClick={() => handleQuickLogin('rohan_beats')} className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px', height: '32px', borderRadius: '8px' }}>Rohan (Beatmaker)</button>
              <button type="button" onClick={() => handleQuickLogin('dev_guitarist')} className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px', height: '32px', borderRadius: '8px' }}>Dev (Vocalist)</button>
            </div>
          </div>
        </div>

        {/* Right Side: Unlocked Designer Mockup under Lock Overlay */}
        <div className="glass-panel glow-cyan" style={{
          position: 'relative',
          padding: '36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          textAlign: 'left'
        }}>
          
          {/* Vault Lock Overlay */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(5, 4, 9, 0.85)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
            color: '#fff',
            gap: '12px'
          }}>
            <Lock size={32} style={{ color: 'var(--accent-cyan)', marginBottom: '8px' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Vault Console Locked</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Unlock Studio Console on the left to edit paywalls.</p>
          </div>

          {/* DUMMY PAYWALL DESIGNER INTERFACE */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>DESIGNER PREVIEW</span>
              <span className="badge badge-gold">Song</span>
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>Midnight Eclipse</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Configure paywall boundaries in waveform console below.</p>

            {/* Waveform visualizer mock */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1.5px solid var(--border-glass)',
              borderRadius: '12px',
              padding: '16px',
              margin: '20px 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '40px' }}>
                {[...Array(24)].map((_, i) => (
                  <div 
                    key={i} 
                    style={{
                      flex: 1,
                      height: `${25 + Math.abs(Math.sin(i * 0.4) * 70)}%`,
                      background: i > 4 && i < 15 ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.08)',
                      borderRadius: '2px'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Locked lyrics preview */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1.5px solid var(--border-glass)' }}>
              <p style={{ fontSize: '12px', margin: '4px 0' }}>Midnight Eclipse in the soundstage tonight,</p>
              <p style={{ fontSize: '12px', margin: '4px 0' }}>Running waveforms straight through the light...</p>
              <p style={{ fontSize: '12px', margin: '4px 0', filter: 'blur(4px)', opacity: 0.4 }}>Hold into the rhythm until sunrise glow...</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-glass)', paddingTop: '16px', marginTop: '20px' }}>
            <span className="mono" style={{ fontSize: '12px', alignSelf: 'center' }}>₹299 Price Tag</span>
            <button type="button" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '11px', height: '30px' }}>Save Settings</button>
          </div>

        </div>

      </div>

    </div>
  );
}
