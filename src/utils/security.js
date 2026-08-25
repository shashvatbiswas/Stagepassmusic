// SHA-256 Password Hashing & Security Audit Logging Utility

const LOGS_KEY = 'stagepass_security_logs';

/**
 * Hash password string using Web Crypto SHA-256
 */
export async function hashPassword(password) {
  if (!password) return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'stagepass_salt_2025');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    // Fallback simple hash string if crypto unavailable
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      hash = ((hash << 5) - hash) + password.charCodeAt(i);
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(16);
  }
}

/**
 * Verify password against stored hash
 */
export async function verifyPassword(inputPassword, storedHash) {
  if (!storedHash) return false;
  // Support legacy unhashed passwords or hash match
  if (inputPassword === storedHash) return true;
  const hash = await hashPassword(inputPassword);
  return hash === storedHash;
}

/**
 * Log administrative or security events
 */
export function addSecurityLog(action, details, username = 'System') {
  const logs = getSecurityLogs();
  const newLog = {
    id: Date.now() + Math.random(),
    timestamp: new Date().toISOString(),
    action,
    details,
    username
  };
  logs.unshift(newLog);
  // Keep last 100 security logs
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 100)));
  return newLog;
}

/**
 * Get all security audit logs
 */
export function getSecurityLogs() {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    return raw ? JSON.parse(raw) : [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        action: 'SECURITY_KERNEL_BOOT',
        details: 'Admin Security System & RBAC Protocol initialized',
        username: 'MasterAdmin'
      }
    ];
  } catch (err) {
    return [];
  }
}

/**
 * Clear security logs
 */
export function clearSecurityLogs() {
  localStorage.removeItem(LOGS_KEY);
}
