import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0c0a14',
          color: '#fff',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'Space Grotesk, sans-serif'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px', color: '#ec4899' }}>
            StagePass Session Recovery
          </h2>
          <p style={{ color: '#aaa4b7', fontSize: '14px', maxWidth: '480px', marginBottom: '12px', lineHeight: '1.6' }}>
            An unexpected session or cache conflict occurred in your browser:
          </p>
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '12px 16px',
            borderRadius: '8px',
            fontFamily: 'DM Mono, monospace',
            fontSize: '11px',
            marginBottom: '20px',
            maxWidth: '520px',
            wordBreak: 'break-all'
          }}>
            {this.state.error?.toString() || 'Session conflict'}
          </div>
          <button 
            onClick={this.handleReset}
            style={{
              padding: '12px 28px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00f0ff, #8b5cf6)',
              color: '#050409',
              border: 'none',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              letterSpacing: '1px'
            }}
          >
            ↺ CLEAR CACHE & RELOAD PLATFORM
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
