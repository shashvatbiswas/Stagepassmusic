import React, { useState, useEffect } from 'react';
import { adminAPI, assetsAPI } from '../api/db';
import { getSecurityLogs, addSecurityLog, clearSecurityLogs } from '../utils/security';
import { getAllLedgerTransactions } from '../utils/ledger';
import { 
  ShieldCheck, 
  Users, 
  Disc, 
  Wallet, 
  AlertTriangle, 
  CheckCircle, 
  Ban, 
  Trash2, 
  Search, 
  Terminal, 
  X, 
  Lock,
  DollarSign
} from 'lucide-react';

export default function AdminPanel({ isOpen, onClose, addToast, currentUser }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'assets', 'ledger', 'logs'
  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [balanceAdjustUserId, setBalanceAdjustUserId] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('500');
  const [tick, setTick] = useState(0);

  const loadAdminData = async () => {
    try {
      const allUsers = await adminAPI.getAllUsers();
      const allAssets = await assetsAPI.getAllAssets();
      const allLogs = getSecurityLogs();
      const allLedger = getAllLedgerTransactions();

      setUsers([...allUsers]);
      setAssets([...allAssets]);
      setLogs([...allLogs]);
      setLedger([...allLedger]);
      setTick(t => t + 1);
    } catch (err) {
      // Silent catch on poll to avoid toast spam
    }
  };

  useEffect(() => {
    let intervalId = null;
    if (isOpen) {
      loadAdminData();
      
      // 1-second live real-time auto-polling
      intervalId = setInterval(loadAdminData, 1000);

      // Instant 0ms event listeners for multi-tab and real-time app action updates
      window.addEventListener('storage', loadAdminData);
      window.addEventListener('stagepass_db_update', loadAdminData);

      return () => {
        if (intervalId) clearInterval(intervalId);
        window.removeEventListener('storage', loadAdminData);
        window.removeEventListener('stagepass_db_update', loadAdminData);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Security Gatekeeper Check
  if (!currentUser || !currentUser.isAdmin) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(5,4,12,0.95)', backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}>
        <div className="glass-panel glow-pink" style={{ maxWidth: '440px', textAlign: 'center', padding: '32px' }}>
          <AlertTriangle size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '8px' }}>ACCESS DENIED</h2>
          <p style={{ color: '#aaa4b7', fontSize: '0.9rem', marginBottom: '24px' }}>
            Administrative privileges required. This incident has been logged.
          </p>
          <button className="btn btn-burgundy" onClick={onClose}>Close Warning</button>
        </div>
      </div>
    );
  }

  const handleToggleVerification = async (userId, name) => {
    try {
      const updated = await adminAPI.toggleVerification(userId);
      addSecurityLog('ADMIN_TOGGLE_VERIFY', `Toggled verification for ${name}`, currentUser.username);
      addToast(`Verification updated for ${name}`, 'success');
      loadAdminData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleToggleSuspension = async (userId, name) => {
    try {
      const updated = await adminAPI.toggleSuspension(userId);
      addSecurityLog('ADMIN_TOGGLE_SUSPEND', `Updated status for ${name}`, currentUser.username);
      addToast(`Account status updated for ${name}`, 'info');
      loadAdminData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    if (!balanceAdjustUserId || !adjustAmount) return;
    try {
      const user = users.find(u => u.id === balanceAdjustUserId);
      await adminAPI.adjustUserBalance(balanceAdjustUserId, adjustAmount);
      addSecurityLog('ADMIN_BALANCE_ADJUST', `Adjusted balance by ₹${adjustAmount} for ${user?.username}`, currentUser.username);
      addToast(`Wallet balance adjusted for ${user?.username}`, 'success');
      setBalanceAdjustUserId(null);
      loadAdminData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteAsset = async (assetId, title) => {
    if (!window.confirm(`Are you sure you want to delete track "${title}" as admin?`)) return;
    try {
      await adminAPI.deleteAsset(assetId);
      addSecurityLog('ADMIN_DELETE_ASSET', `Deleted asset "${title}" (ID: ${assetId})`, currentUser.username);
      addToast(`Asset "${title}" deleted by Admin`, 'info');
      loadAdminData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleClearLogs = () => {
    clearSecurityLogs();
    setLogs([]);
    addToast('Security logs cleared', 'info');
  };

  const filteredUsers = users.filter(u => {
    const q = (searchUser || '').toLowerCase();
    const uname = (u.username || '').toLowerCase();
    const aname = (u.artistName || '').toLowerCase();
    const uemail = (u.email || '').toLowerCase();
    return uname.includes(q) || aname.includes(q) || uemail.includes(q);
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(5, 4, 12, 0.92)', backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="panel" style={{
        width: '100%', maxWidth: '980px', maxHeight: '90vh', overflowY: 'auto',
        border: '1.5px solid rgba(189, 121, 237, 0.4)', padding: '28px'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--line)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #bd79ed, #83e9f4)', padding: '8px', borderRadius: '8px', color: '#100e19' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 style={{ font: '18px Unbounded, sans-serif', margin: 0, textTransform: 'uppercase', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                Master Admin Security Console
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(110, 229, 187, 0.15)', border: '1px solid #6fe5bb', color: '#6fe5bb', padding: '2px 8px', borderRadius: '12px', fontSize: '8px', letterSpacing: '1px' }}>
                  <i className="dot green"></i> LIVE 1s AUTO-SYNC
                </span>
              </h2>
              <small className="mono" style={{ color: '#83e9f4', fontSize: '9px', letterSpacing: '1.5px' }}>
                RESTRICTED ACCESS · LEVEL 5 PROTOCOL · OPERATOR: {currentUser.artistName}
              </small>
            </div>
          </div>
          
          <button className="modal-close" onClick={onClose} aria-label="Close admin modal">
            <X size={18} />
          </button>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="tabs" style={{ marginBottom: '24px' }}>
          <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            SYSTEM OVERVIEW
          </button>
          <button className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            USER MANAGEMENT ({users.length})
          </button>
          <button className={`tab ${activeTab === 'assets' ? 'active' : ''}`} onClick={() => setActiveTab('assets')}>
            TRACK MODERATION ({assets.length})
          </button>
          <button className={`tab ${activeTab === 'ledger' ? 'active' : ''}`} onClick={() => setActiveTab('ledger')}>
            DOUBLE-ENTRY LEDGER ({ledger.length})
          </button>
          <button className={`tab ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
            SECURITY AUDIT LOGS
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <div className="stats" style={{ padding: 0, marginBottom: '28px' }}>
              <div>
                <strong>{users.length}</strong>
                <small>REGISTERED CREATORS</small>
              </div>
              <div>
                <strong>{assets.length}</strong>
                <small>HOSTED TRACKS / STEMS</small>
              </div>
              <div>
                <strong>₹{users.reduce((sum, u) => sum + (parseFloat(u.balance) || 0), 0).toFixed(0)}</strong>
                <small>TOTAL PLATFORM WALLET DEPOSITS</small>
              </div>
              <div>
                <strong>{logs.length}</strong>
                <small>SECURITY AUDIT EVENTS</small>
              </div>
            </div>

            <div style={{ background: 'rgba(15, 14, 28, 0.6)', border: '1px solid var(--line)', borderRadius: '10px', padding: '20px' }}>
              <div className="eyebrow" style={{ marginBottom: '12px' }}><i></i> SYSTEM INTEGRITY STATUS</div>
              <h3 style={{ font: '14px Unbounded, sans-serif', color: '#fff', margin: '0 0 10px' }}>Encryption & Access Rules Active</h3>
              <p style={{ color: '#aaa4b7', fontSize: '12px', lineHeight: '1.6', margin: 0 }}>
                All user transactions, audio licensing stems, and profile updates are verified with role-based checks. As Master Admin, your actions are logged to the security audit ledger.
              </p>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <div className="input-wrap" style={{ flex: 1 }}>
                <b style={{ paddingLeft: '12px' }}>⌕</b>
                <input 
                  type="text"
                  placeholder="Filter users by name, username, or email..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={loadAdminData}
                className="btn btn-secondary"
                style={{ height: '38px', fontSize: '11px', padding: '0 14px', borderRadius: '8px', gap: '6px' }}
              >
                🔄 Refresh List
              </button>
              <button
                type="button"
                onClick={async () => {
                  const uname = window.prompt('Enter new user/creator username (e.g. shravani):');
                  if (!uname) return;
                  const uemail = window.prompt(`Enter email for @${uname}:`, `${uname.toLowerCase()}@stagepass.com`);
                  const upass = window.prompt(`Enter password for @${uname}:`, 'password123');
                  try {
                    await authAPI.signup({
                      username: uname,
                      email: uemail || `${uname.toLowerCase()}@stagepass.com`,
                      password: upass || 'password123',
                      artistName: uname,
                      roles: ['Singer']
                    });
                    addToast(`Creator @${uname} registered & added to Admin Console!`, 'success');
                    loadAdminData();
                  } catch (err) {
                    addToast(err.message, 'error');
                  }
                }}
                className="btn btn-cyan"
                style={{ height: '38px', fontSize: '11px', padding: '0 14px', borderRadius: '8px', gap: '6px' }}
              >
                ➕ Add Creator
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm('⚠️ Reset all user accounts EXCEPT Master Admin?\nThis will clear all non-admin user data.')) return;
                  try {
                    await adminAPI.resetAllNonAdminUsers();
                    addToast('All non-admin user data reset successfully!', 'info');
                    loadAdminData();
                  } catch (err) {
                    addToast(err.message, 'error');
                  }
                }}
                className="btn btn-burgundy"
                style={{ height: '38px', fontSize: '11px', padding: '0 14px', borderRadius: '8px', gap: '6px' }}
              >
                🧹 Reset Users (Except Admin)
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', font: '11px "DM Mono", monospace', color: '#ece5f2' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)', textAlign: 'left', color: '#7dd9e6' }}>
                    <th style={{ padding: '10px' }}>CREATOR</th>
                    <th style={{ padding: '10px' }}>EMAIL</th>
                    <th style={{ padding: '10px' }}>ROLE</th>
                    <th style={{ padding: '10px' }}>WALLET</th>
                    <th style={{ padding: '10px' }}>STATUS</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#aaa4b7' }}>
                        No creators match search query. Try registering a new creator on the portal!
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(209,183,247,0.08)' }}>
                      <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {u.artistName} {u.verified && <CheckCircle size={12} style={{ color: '#83e9f4' }} />}
                        {u.isAdmin && <span className="badge badge-gold" style={{ fontSize: '7px' }}>ADMIN</span>}
                      </td>
                      <td style={{ padding: '10px', color: '#aaa4b7' }}>{u.email}</td>
                      <td style={{ padding: '10px' }}>{u.roles ? u.roles.join(', ') : 'User'}</td>
                      <td style={{ padding: '10px', color: '#f4cf72' }}>₹{parseFloat(u.balance || 0).toFixed(0)}</td>
                      <td style={{ padding: '10px' }}>
                        {u.isSuspended ? (
                          <span style={{ color: '#ef4444' }}>SUSPENDED</span>
                        ) : (
                          <span style={{ color: '#6fe5bb' }}>ACTIVE</span>
                        )}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleVerification(u.id, u.artistName)}
                            className="btn btn-cyan"
                            style={{ height: '24px', padding: '0 8px', fontSize: '9px' }}
                          >
                            {u.verified ? 'Unverify' : 'Verify'}
                          </button>
                          
                          {!u.isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleToggleSuspension(u.id, u.artistName)}
                              className={`btn ${u.isSuspended ? 'btn-primary' : 'btn-burgundy'}`}
                              style={{ height: '24px', padding: '0 8px', fontSize: '9px' }}
                            >
                              {u.isSuspended ? 'Activate' : 'Suspend'}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setBalanceAdjustUserId(balanceAdjustUserId === u.id ? null : u.id)}
                            className="btn btn-amber"
                            style={{ height: '24px', padding: '0 8px', fontSize: '9px' }}
                          >
                            ± Wallet
                          </button>
                        </div>

                        {balanceAdjustUserId === u.id && (
                          <form onSubmit={handleAdjustBalance} style={{ marginTop: '8px', display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <input 
                              type="number" 
                              value={adjustAmount}
                              onChange={(e) => setAdjustAmount(e.target.value)}
                              placeholder="Amount (+/-)"
                              style={{ width: '80px', height: '26px', fontSize: '10px', padding: '2px 6px', background: '#000', border: '1px solid var(--line)', color: '#fff', borderRadius: '4px' }}
                            />
                            <button type="submit" className="btn btn-primary" style={{ height: '26px', fontSize: '9px', padding: '0 8px' }}>Apply</button>
                          </form>
                        )}
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ASSETS TAB */}
        {activeTab === 'assets' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', font: '11px "DM Mono", monospace', color: '#ece5f2' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', textAlign: 'left', color: '#7dd9e6' }}>
                  <th style={{ padding: '10px' }}>TITLE</th>
                  <th style={{ padding: '10px' }}>CREATOR</th>
                  <th style={{ padding: '10px' }}>TYPE</th>
                  <th style={{ padding: '10px' }}>PRICE</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>MODERATE</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid rgba(209,183,247,0.08)' }}>
                    <td style={{ padding: '10px', fontWeight: 700 }}>{a.title}</td>
                    <td style={{ padding: '10px', color: '#aaa4b7' }}>{a.creatorName}</td>
                    <td style={{ padding: '10px' }}>{a.type}</td>
                    <td style={{ padding: '10px', color: '#f4cf72' }}>₹{a.price}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteAsset(a.id, a.title)}
                        className="btn btn-burgundy"
                        style={{ height: '24px', padding: '0 8px', fontSize: '9px' }}
                      >
                        <Trash2 size={10} style={{ marginRight: '4px' }} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DOUBLE-ENTRY LEDGER TAB */}
        {activeTab === 'ledger' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', font: '11px "DM Mono", monospace', color: '#ece5f2' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', color: '#83e9f4', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>TX ID</th>
                  <th style={{ padding: '10px' }}>TYPE</th>
                  <th style={{ padding: '10px' }}>PAYER</th>
                  <th style={{ padding: '10px' }}>PAYEE</th>
                  <th style={{ padding: '10px' }}>GROSS AMOUNT</th>
                  <th style={{ padding: '10px' }}>90% CREATOR</th>
                  <th style={{ padding: '10px' }}>10% PLATFORM</th>
                  <th style={{ padding: '10px' }}>HASH</th>
                </tr>
              </thead>
              <tbody>
                {ledger.length === 0 ? (
                  <tr><td colSpan="8" style={{ padding: '16px', textAlign: 'center', color: '#aaa4b7' }}>No ledger transactions recorded yet.</td></tr>
                ) : ledger.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid rgba(209,183,247,0.08)' }}>
                    <td style={{ padding: '10px', color: '#bd79ed', fontWeight: 700 }}>{tx.id}</td>
                    <td style={{ padding: '10px' }}>{tx.type}</td>
                    <td style={{ padding: '10px', color: '#aaa4b7' }}>@{tx.payerUsername}</td>
                    <td style={{ padding: '10px', color: '#aaa4b7' }}>@{tx.payeeUsername}</td>
                    <td style={{ padding: '10px', color: '#f4cf72', fontWeight: 700 }}>₹{tx.amount}</td>
                    <td style={{ padding: '10px', color: '#6fe5bb' }}>₹{tx.creatorRoyalty.toFixed(2)}</td>
                    <td style={{ padding: '10px', color: '#83e9f4' }}>₹{tx.platformFee.toFixed(2)}</td>
                    <td style={{ padding: '10px', fontSize: '8px', color: 'rgba(255,255,255,0.4)' }}>{tx.txHash.slice(0, 16)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* LOGS TAB */}
        {activeTab === 'logs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div className="console-log-title" style={{ margin: 0 }}>&gt;_ SECURITY AUDIT TRAIL</div>
              <button className="btn btn-secondary" onClick={handleClearLogs} style={{ height: '26px', fontSize: '9px', padding: '0 10px' }}>Clear Logs</button>
            </div>
            
            <pre className="terminal" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {logs.length === 0 ? 'No security audit logs recorded.' : logs.map(l => (
                `[${l.timestamp.slice(11, 19)}] > ACTION: ${l.action} | OPERATOR: ${l.username} | DETAILS: ${l.details}\n`
              ))}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}
