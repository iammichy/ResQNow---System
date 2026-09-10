// src/services/api.js

// ============ API CONFIG ============
const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000';

// ============ COOKIE HELPER ============
// Get a browser cookie by name
function getCookie(name) {
  const cookies = document.cookie.split('; ');

  const cookie = cookies.find((item) =>
    item.startsWith(`${name}=`)
  );

  if (!cookie) return null;

  return cookie.substring(
    cookie.indexOf('=') + 1
  );
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
// Sanctum requires this before login,
// registration, logout, and other
// session-based POST requests.
export async function getCsrfCookie() {
  const response = await fetch(
    `${API_URL}/sanctum/csrf-cookie`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      'Unable to initialize the secure session.'
    );
  }
}

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

  // Laravel CSRF header
  if (
    ![
      'GET',
      'HEAD',
      'OPTIONS',
    ].includes(method)
  ) {
    const xsrfToken =
      getCookie('XSRF-TOKEN');

    if (xsrfToken) {
      headers.set(
        'X-XSRF-TOKEN',
        decodeURIComponent(xsrfToken)
      );
    }
  }

  let response;

  try {
    response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        method,
        headers,
        credentials: 'include',
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