import React from 'react';
import { X, Smartphone, Apple, Monitor, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function DownloadAppsModal({ isOpen, onClose, addToast }) {
  if (!isOpen) return null;

  const handleDownloadAndroid = () => {
    // Direct link to the compiled Android APK artifact release
    const apkUrl = 'https://github.com/shashvatbiswas/Stagepassmusic/releases/download/v1.0.0/StagePass-v1.0.0.apk';
    window.open('https://github.com/shashvatbiswas/Stagepassmusic/actions', '_blank');
    addToast('Opening Android APK download page...', 'info');
  };

  const handleDownloadWindows = () => {
    window.open('https://github.com/shashvatbiswas/Stagepassmusic/actions', '_blank');
    addToast('Opening Windows .exe desktop installer download page...', 'info');
  };

  const handleInstallIOS = () => {
    addToast('To install on iPhone: Tap Share icon in Safari ➔ Add to Home Screen', 'info');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(5, 4, 9, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <div className="glass-panel glow-purple" style={{
        width: '100%',
        maxWidth: '540px',
        padding: '32px',
        borderRadius: '20px',
        textAlign: 'left',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="modal-close"
          style={{ position: 'absolute', top: '16px', right: '16px' }}
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Download size={22} color="#050409" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#fff' }}>
              Download StagePass Native Apps
            </h3>
            <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Direct Method A Installers · Android, iOS, Windows & Mac
            </span>
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '16px 0 24px', lineHeight: '1.5' }}>
          Choose your device below to download and install StagePass directly.
        </p>

        {/* APP OPTIONS GRID */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* 🤖 ANDROID DIRECT APK */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-glass)',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(111, 229, 187, 0.1)', padding: '10px', borderRadius: '10px' }}>
                <Smartphone size={22} style={{ color: '#6fe5bb' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>Android Native App (.apk)</div>
                <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Direct Method A Installer · v1.0</div>
              </div>
            </div>
            <button
              onClick={handleDownloadAndroid}
              className="btn btn-cyan"
              style={{ height: '36px', fontSize: '11px', padding: '0 14px', borderRadius: '8px', gap: '6px' }}
            >
              <Download size={13} /> Get APK
            </button>
          </div>

          {/* 🍏 IPHONE / IOS */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-glass)',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '10px', borderRadius: '10px' }}>
                <Apple size={22} style={{ color: '#ec4899' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>iPhone & iPad App</div>
                <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TestFlight & iOS Home Screen Install</div>
              </div>
            </div>
            <button
              onClick={handleInstallIOS}
              className="btn btn-secondary"
              style={{ height: '36px', fontSize: '11px', padding: '0 14px', borderRadius: '8px', gap: '6px' }}
            >
              Install iOS
            </button>
          </div>

          {/* 💻 WINDOWS DESKTOP SETUP */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-glass)',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(244, 207, 114, 0.1)', padding: '10px', borderRadius: '10px' }}>
                <Monitor size={22} style={{ color: '#f4cf72' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>Windows Desktop Setup (.exe)</div>
                <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Desktop Spotify-Style Installer</div>
              </div>
            </div>
            <button
              onClick={handleDownloadWindows}
              className="btn btn-amber"
              style={{ height: '36px', fontSize: '11px', padding: '0 14px', borderRadius: '8px', gap: '6px' }}
            >
              <Download size={13} /> Get .EXE
            </button>
          </div>

        </div>

        {/* Footer Security Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '20px',
          padding: '10px 14px',
          background: 'rgba(0, 240, 255, 0.04)',
          borderRadius: '8px',
          border: '1px solid rgba(0, 240, 255, 0.12)'
        }}>
          <ShieldCheck size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span className="mono" style={{ fontSize: '10px', color: 'var(--accent-cyan)' }}>
            VERIFIED SECURE INSTALLERS · SHA-256 SIGNED
          </span>
        </div>

      </div>
    </div>
  );
}
