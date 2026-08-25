import React from 'react';
import { Award, Download, X, Shield, Music } from 'lucide-react';

export default function VerificationModal({ purchase, onClose }) {
  if (!purchase) return null;

  const formattedDate = new Date(purchase.timestamp).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(5, 4, 9, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel glow-amber" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '36px',
        textAlign: 'center',
        position: 'relative'
      }}>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="modal-close"
          style={{ position: 'absolute', top: '16px', right: '16px' }}
        >
          <X size={14} />
        </button>

        {/* Certificate Header Seal */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '28px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-amber), var(--accent-purple))',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 0 20px rgba(255, 153, 0, 0.4), 0 0 40px rgba(255, 153, 0, 0.15)',
            marginBottom: '4px'
          }}>
            <Award size={28} color="#fff" />
          </div>

          <span className="mono" style={{
            fontSize: '10px',
            letterSpacing: '3px',
            color: 'var(--accent-amber)',
            fontWeight: 700
          }}>
            STAGEPASS REGISTRY
          </span>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.02em'
          }}>
            Rights Certificate
          </h2>

          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Verified intellectual property ownership record
          </p>
        </div>

        {/* Certificate Body */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1.5px solid var(--border-glass)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          {/* Track Title Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            background: 'rgba(255, 153, 0, 0.08)',
            border: '1.5px solid rgba(255, 153, 0, 0.2)',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <Music size={18} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#fff' }}>{purchase.assetTitle}</div>
              <div className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {purchase.assetType?.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Registry Rows */}
          {[
            { label: 'ORIGINAL CREATOR', value: purchase.creatorName, highlight: true },
            { label: 'LICENSED TO', value: purchase.buyerName, highlight: true },
            { label: 'LICENSE TYPE', value: purchase.licenseType?.toUpperCase() || 'PERSONAL USE' },
            { label: 'ISSUE DATE', value: formattedDate },
            { label: 'CERTIFICATE CODE', value: purchase.licenseCertCode, mono: true }
          ].map(row => (
            <div
              key={row.label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid var(--border-glass)'
              }}
            >
              <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                {row.label}
              </span>
              <span
                className={row.mono ? 'mono' : ''}
                style={{
                  fontSize: row.mono ? '11px' : '13px',
                  fontWeight: row.highlight ? 700 : 500,
                  color: row.highlight ? '#fff' : 'var(--text-main)',
                  letterSpacing: row.mono ? '1px' : 'normal'
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Verified Seal Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '24px',
          padding: '10px',
          background: 'rgba(0, 240, 255, 0.05)',
          border: '1px solid rgba(0, 240, 255, 0.15)',
          borderRadius: '10px'
        }}>
          <Shield size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span className="mono" style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '1px' }}>
            BLOCKCHAIN-ANCHORED REGISTRY · IMMUTABLE RECORD
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handlePrint}
            className="btn btn-amber"
            style={{ flex: 1, height: '40px', borderRadius: '10px', fontSize: '12px' }}
          >
            <Download size={14} /> Download Certificate
          </button>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ flex: 1, height: '40px', borderRadius: '10px', fontSize: '12px' }}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
