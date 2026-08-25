import React, { useState, useEffect, useRef } from 'react';
import Login from './components/Login';
import Discover from './components/Discover';
import CreatorStudio from './components/CreatorStudio';
import CollaborationHub from './components/CollaborationHub';
import Profile from './components/Profile';
import AudioPlayer from './components/AudioPlayer';
import VerificationModal from './components/VerificationModal';
import AdminPanel from './components/AdminPanel';
import { authAPI, initDB } from './api/db';
import { 
  Music, 
  Compass, 
  Sliders, 
  Users, 
  User, 
  Wallet, 
  LogOut, 
  Plus, 
  PlusCircle, 
  X, 
  Award, 
  Sparkles,
  Disc,
  ShieldCheck
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('discover');
  const [viewProfileUsername, setViewProfileUsername] = useState(null);
  
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('1000');
  
  const [toasts, setToasts] = useState([]);
  
  const [playingAsset, setPlayingAsset] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerTrigger, setPlayerTrigger] = useState(0);
  
  const [activeCertificate, setActiveCertificate] = useState(null);
  const [purchaseTrigger, setPurchaseTrigger] = useState(0);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    initDB();
    const session = authAPI.getCurrentSession();
    if (session) setCurrentUser(session);
  }, []);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 7000);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveTab('discover');
  };

  const handleLogout = () => {
    authAPI.logout();
    setCurrentUser(null);
    setPlayingAsset(null);
    setIsPlaying(false);
    addToast('Logged out from StagePass', 'info');
  };

  const handleRechargeSubmit = async (e) => {
    e.preventDefault();
    if (parseFloat(rechargeAmount) <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }
    try {
      const newBalance = await authAPI.rechargeWallet(currentUser.username, rechargeAmount);
      setCurrentUser({ ...currentUser, balance: newBalance });
      addToast(`Recharged! Added ₹${rechargeAmount}. Balance: ₹${newBalance.toFixed(2)}`, 'success');
      setIsRechargeOpen(false);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const navigateToProfile = (username) => {
    setViewProfileUsername(username);
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayAsset = (asset) => {
    if (playingAsset && playingAsset.id === asset.id) {
      setIsPlaying(prev => !prev);
    } else {
      setPlayingAsset(asset);
      setIsPlaying(true);
      setPlayerTrigger(t => t + 1);
    }
  };

  const handlePurchaseSuccess = (assetId) => {
    setPurchaseTrigger(t => t + 1);
  };

  // Login Screen
  if (!currentUser) {
    return (
      <>
        <div className="particle-container">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * -20}s`
            }} />
          ))}
        </div>

        {/* Toast */}
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast toast-${t.type}`}>
              {t.message}
            </div>
          ))}
        </div>

        <Login onLoginSuccess={handleLoginSuccess} addToast={addToast} />
      </>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '70px' }}>

      {/* Background particles */}
      <div className="particle-container">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * -20}s`,
            transform: `scale(${0.6 + Math.random() * 0.8})`
          }} />
        ))}
      </div>

      {/* ── TOP HEADER ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'rgba(5,4,9,0.92)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border-glass)'
      }}>
        {/* Logo */}
        <div onClick={() => { setActiveTab('discover'); setViewProfileUsername(null); }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            padding: '7px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(236,72,153,0.4)'
          }}>
            <Disc size={18} color="#fff" />
          </div>
          <span className="font-orbitron" style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '1px', background: 'linear-gradient(90deg, #ffffff, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            STAGEPASS
          </span>
        </div>

        {/* Desktop Nav — hidden on mobile */}
        <nav className="desktop-nav">
          {[
            { id: 'discover', icon: <Compass size={15}/>, label: 'Discover' },
            { id: 'studio',   icon: <Sliders size={15}/>,  label: 'Studio' },
            { id: 'collabs',  icon: <Users size={15}/>,    label: 'Collabs' },
          ].map(tab => (
            <button key={tab.id}
              onClick={() => { setActiveTab(tab.id); setViewProfileUsername(null); }}
              className={`btn ${activeTab === tab.id ? 'btn-cyan' : 'btn-secondary'}`}
              style={{ borderRadius: '12px', padding: '8px 16px', fontSize: '0.85rem' }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        {/* Right: Wallet + Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Admin Shield Button */}
          {currentUser.isAdmin && (
            <button
              onClick={() => setIsAdminOpen(true)}
              className="btn btn-amber"
              style={{ borderRadius: '10px', padding: '5px 12px', fontSize: '11px', gap: '6px' }}
            >
              <ShieldCheck size={14} /> ADMIN CONSOLE
            </button>
          )}

          {/* Wallet */}
          <div onClick={() => setIsRechargeOpen(true)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px', borderRadius: '10px', cursor: 'pointer',
            background: 'rgba(255,255,255,0.04)', border: '1.5px solid var(--border-glass)'
          }}>
            <Wallet size={14} style={{ color: 'var(--accent-purple)' }} />
            <span className="mono" style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>
              ₹{currentUser.balance.toFixed(0)}
            </span>
          </div>

          {/* Avatar */}
          <img
            src={currentUser.profilePhoto}
            alt={currentUser.artistName}
            onClick={() => navigateToProfile(currentUser.username)}
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover',
              border: '1.5px solid var(--accent-cyan)', cursor: 'pointer' }}
          />

          {/* Logout — visible on all screens */}
          <button onClick={handleLogout} className="btn btn-secondary"
            style={{ padding: '7px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.07)' }} title="Logout">
            <LogOut size={15} style={{ color: '#ef4444' }} />
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, zIndex: 1, position: 'relative', width: '100%', overflowX: 'hidden' }}>
        {activeTab === 'discover' && !viewProfileUsername && (
          <Discover
            onPlayAsset={handlePlayAsset} playingAsset={playingAsset} isPlaying={isPlaying}
            onNavigateProfile={navigateToProfile} onPurchaseSuccess={handlePurchaseSuccess}
            onShowCertificate={setActiveCertificate} addToast={addToast}
            currentUser={currentUser} purchaseTrigger={purchaseTrigger}
          />
        )}
        {activeTab === 'studio' && !viewProfileUsername && (
          <CreatorStudio
            currentUser={currentUser} onPlayAsset={handlePlayAsset}
            playingAsset={playingAsset} isPlaying={isPlaying} addToast={addToast}
          />
        )}
        {activeTab === 'collabs' && !viewProfileUsername && (
          <CollaborationHub
            currentUser={currentUser} onNavigateProfile={navigateToProfile}
            onPlayAsset={handlePlayAsset} addToast={addToast}
          />
        )}
        {(activeTab === 'profile' || viewProfileUsername) && (
          <Profile
            currentUser={currentUser}
            profileUsername={viewProfileUsername || currentUser.username}
            onPlayAsset={handlePlayAsset} playingAsset={playingAsset} isPlaying={isPlaying}
            onNavigateProfile={navigateToProfile} onPurchaseSuccess={handlePurchaseSuccess}
            onShowCertificate={setActiveCertificate} addToast={addToast}
            purchaseTrigger={purchaseTrigger}
          />
        )}
      </main>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <nav className="mobile-bottom-nav">
        {[
          { id: 'discover', icon: <Compass size={22}/>, label: 'Discover' },
          { id: 'studio',   icon: <Sliders size={22}/>,  label: 'Studio' },
          { id: 'collabs',  icon: <Users size={22}/>,    label: 'Collabs' },
          { id: 'profile',  icon: <User size={22}/>,     label: 'Profile' },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id}
              onClick={() => {
                if (tab.id === 'profile') {
                  navigateToProfile(currentUser.username);
                } else {
                  setActiveTab(tab.id);
                  setViewProfileUsername(null);
                }
              }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '3px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '8px 0',
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                transition: 'color 0.2s'
              }}
            >
              <div style={{
                padding: isActive ? '6px 14px' : '6px 10px',
                borderRadius: '12px',
                background: isActive ? 'rgba(0,240,255,0.1)' : 'transparent',
                transition: 'all 0.2s'
              }}>
                {tab.icon}
              </div>
              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.3px' }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── AUDIO PLAYER ── */}
      {playingAsset && (
        <div style={{ position: 'fixed', bottom: '60px', left: 0, right: 0, zIndex: 400 }}>
          <AudioPlayer
            asset={playingAsset} isPlaying={isPlaying}
            onPlayPause={setIsPlaying}
            onClose={() => { setPlayingAsset(null); setIsPlaying(false); }}
          />
        </div>
      )}

      {/* ── RECHARGE MODAL ── */}
      {isRechargeOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(5,4,9,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 999, padding: '20px'
        }}>
          <div className="glass-panel glow-cyan" style={{ width: '100%', maxWidth: '400px', padding: '28px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={20} style={{ color: 'var(--accent-cyan)' }} /> Recharge Wallet
              </h3>
              <button onClick={() => setIsRechargeOpen(false)} className="modal-close"><X size={14}/></button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Current Balance: <strong style={{ color: '#fff' }}>₹{currentUser.balance.toFixed(2)}</strong>
            </p>
            <form onSubmit={handleRechargeSubmit}>
              <div className="form-group">
                <label className="form-label">Amount (₹ INR)</label>
                <input type="number" className="form-control" value={rechargeAmount}
                  onChange={e => setRechargeAmount(e.target.value)} min="1" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '20px' }}>
                {['500','1000','2000','5000'].map(amt => (
                  <button key={amt} type="button"
                    onClick={() => setRechargeAmount(amt)}
                    className={`btn ${rechargeAmount === amt ? 'btn-cyan' : 'btn-secondary'}`}
                    style={{ fontSize: '12px', height: '34px', borderRadius: '8px', padding: 0 }}>
                    ₹{amt}
                  </button>
                ))}
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '42px', borderRadius: '10px', fontSize: '14px' }}>
                Add ₹{rechargeAmount} to Wallet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── CERTIFICATE MODAL ── */}
      {activeCertificate && (
        <VerificationModal purchase={activeCertificate} onClose={() => setActiveCertificate(null)} />
      )}

      {/* ── MASTER ADMIN SECURITY PANEL ── */}
      <AdminPanel 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        addToast={addToast} 
        currentUser={currentUser} 
      />

      {/* ── TOAST NOTIFICATIONS ── */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>
        ))}
      </div>

    </div>
  );
}
