// src/services/authService.js

import {
  apiRequest,
  getCsrfCookie,
} from './api';

// ============ RESPONSE HELPER ============
// Laravel resources may be returned directly
// or inside a data wrapper.
function getUserFromResponse(data) {
  return (
    data?.user?.data ||
    data?.user ||
    data?.data ||
    data ||
    null
  );
}

// ============ REGISTER ============

export async function registerResident(
  residentData
) {
  await getCsrfCookie();

  return apiRequest(
    '/api/register',
    {
      method: 'POST',

      body:
        JSON.stringify(
          residentData
        ),
    }
  );
}

// ============ LOGIN ============

export async function loginResident(
  credentials
) {
  await getCsrfCookie();

  const data =
    await apiRequest(
      '/api/login',
      {
        method: 'POST',

        body:
          JSON.stringify(
            credentials
          ),
      }
    );

  return getUserFromResponse(
    data
  );
}

// ============ CURRENT USER ============

export async function getCurrentUser() {
  const data =
    await apiRequest(
      '/api/user'
    );

  return getUserFromResponse(
    data
  );
}

// ============ UPDATE PROFILE ============

export async function updateResidentProfile(
  profileData
) {
  await getCsrfCookie();

  const data =
    await apiRequest(
      '/api/profile',
      {
        method: 'PUT',

        body:
          JSON.stringify(
            profileData
          ),
      }
    );

  return getUserFromResponse(
    data
  );
}

// ============ LOGOUT ============

export async function logoutResident() {
  await getCsrfCookie();

  return apiRequest(
    '/api/logout',
    {
      method: 'POST',
    }
  );
}