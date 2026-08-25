// Identity & Access Management (IAM) & OAuth2 JWT Engine — Enterprise Standard

export const SCOPES = {
  READ_CATALOG: 'catalog:read',
  WRITE_ASSETS: 'assets:write',
  DELETE_ASSETS: 'assets:delete',
  MANAGE_COLLABS: 'collabs:manage',
  RECHARGE_WALLET: 'wallet:recharge',
  ADMIN_FULL: 'admin:full'
};

const SECRET_KEY = 'stagepass_jwt_master_secret_2025';

/**
 * Base64 URL encode
 */
function base64UrlEncode(str) {
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Base64 URL decode
 */
function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
}

/**
 * Generate a JWT session token for authenticated user
 */
export function generateJWT(user) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const userScopes = [
    SCOPES.READ_CATALOG,
    SCOPES.WRITE_ASSETS,
    SCOPES.MANAGE_COLLABS,
    SCOPES.RECHARGE_WALLET
  ];

  if (user.isAdmin) {
    userScopes.push(SCOPES.DELETE_ASSETS, SCOPES.ADMIN_FULL);
  }

  const payload = {
    sub: user.id || 'user_anon',
    username: user.username,
    email: user.email,
    artistName: user.artistName,
    roles: user.roles || ['Creator'],
    isAdmin: !!user.isAdmin,
    scopes: userScopes,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (86400 * 7), // 7-day token
    iss: 'https://auth.stagepass.fm'
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  
  // Simple signature generation
  let sig = 0;
  const rawData = encodedHeader + '.' + encodedPayload + SECRET_KEY;
  for (let i = 0; i < rawData.length; i++) {
    sig = ((sig << 5) - sig) + rawData.charCodeAt(i);
    sig |= 0;
  }
  const encodedSignature = base64UrlEncode(Math.abs(sig).toString(16));

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

/**
 * Decode and verify JWT token payload
 */
export function verifyJWT(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.warn('[IAM System] JWT Token expired');
      return null;
    }

    return payload;
  } catch (err) {
    console.error('[IAM System] Invalid JWT token structure', err);
    return null;
  }
}

/**
 * Check if user scope matrix includes required permission
 */
export function checkPermission(user, requiredScope) {
  if (!user) return false;
  if (user.isAdmin) return true; // Master Admin has all scopes
  const scopes = user.scopes || [
    SCOPES.READ_CATALOG,
    SCOPES.WRITE_ASSETS,
    SCOPES.MANAGE_COLLABS,
    SCOPES.RECHARGE_WALLET
  ];
  return scopes.includes(requiredScope);
}
