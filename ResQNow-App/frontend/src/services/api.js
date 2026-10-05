// src/services/api.js

// ============ API CONFIG ============
const API_URL = (
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000'
).replace(/\/+$/, '');

// Callers use '/api/...'; the shared backend serves the app at '/api/app/...'.
function toAppEndpoint(endpoint) {
  return endpoint.startsWith('/api/') && !endpoint.startsWith('/api/app/')
    ? `/api/app${endpoint.slice(4)}`
    : endpoint;
}

// ============ AUTH TOKEN ============
// The app (Vercel) and the API (Render) are different sites, so a cookie
// session would be blocked as third-party. Sanctum bearer tokens are used.
const TOKEN_KEYS = {
  resident: 'resqnow_resident_token',
  responder: 'resqnow_responder_token',
};

const ACTIVE_ROLE_KEY = 'resqnow_active_role';

function roleFromPath() {
  if (
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/responder')
  ) {
    return 'responder';
  }

  return 'resident';
}

export function setActiveAuthRole(role) {
  if (!TOKEN_KEYS[role]) {
    return;
  }

  try {
    sessionStorage.setItem(
      ACTIVE_ROLE_KEY,
      role
    );
  } catch {
    // Route detection remains available as a fallback.
  }
}

export function getActiveAuthRole() {
  try {
    const storedRole =
      sessionStorage.getItem(
        ACTIVE_ROLE_KEY
      );

    if (TOKEN_KEYS[storedRole]) {
      return storedRole;
    }
  } catch {
    // Fall through to route detection.
  }

  return roleFromPath();
}

export function getAuthToken(
  role = getActiveAuthRole()
) {
  const key = TOKEN_KEYS[role];

  if (!key) {
    return null;
  }

  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setAuthToken(
  token,
  role = getActiveAuthRole()
) {
  const key = TOKEN_KEYS[role];

  if (!key) {
    return;
  }

  try {
    if (token) {
      localStorage.setItem(
        key,
        token
      );
    } else {
      localStorage.removeItem(
        key
      );
    }
  } catch {
    // Storage unavailable.
  }
}

export function clearAuthToken(
  role = getActiveAuthRole()
) {
  setAuthToken(
    null,
    role
  );
}
// ============ WAKE SERVER ============
// Render's free tier sleeps when idle. Ping the health check on app open so
// the server is already awake by the time the user logs in or submits.
export function wakeServer() {
  fetch(`${API_URL}/up`, { mode: 'no-cors' }).catch(() => {});
}

// ============ RESPONSE HELPER ============
// Read JSON response when available
async function readResponse(response) {
  const contentType =
    response.headers.get('content-type') || '';

  if (
    contentType.includes(
      'application/json'
    )
  ) {
    return response.json();
  }

  return null;
}

// ============ CSRF COOKIE ============
// Not needed with bearer-token auth. Kept so existing callers still work.
export async function getCsrfCookie() {}

// ============ API REQUEST ============
// Shared request helper for Laravel
export async function apiRequest(
  endpoint,
  options = {}
) {
  const method = (
    options.method || 'GET'
  ).toUpperCase();

  const headers =
    new Headers(
      options.headers || {}
    );

  headers.set(
    'Accept',
    'application/json'
  );

  // JSON body
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set(
      'Content-Type',
      'application/json'
    );
  }

  const token = getAuthToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response;

  try {
    response = await fetch(
      `${API_URL}${toAppEndpoint(endpoint)}`,
      {
        ...options,
        method,
        headers,
        credentials: 'omit',
      }
    );
  } catch {
    const error =
      new Error(
        'Unable to connect to the ResQNow server. Please check your connection and try again.'
      );

    error.status = 0;

    throw error;
  }

  const data =
    await readResponse(response);

  if (response.status === 401 && token) {
    clearAuthToken();
  }

  if (!response.ok) {
    const error =
      new Error(
        data?.message ||
        'Something went wrong. Please try again.'
      );

    error.status =
      response.status;

    error.errors =
      data?.errors || {};

    error.data =
      data || null;

    throw error;
  }

  return data;
}

export { API_URL };