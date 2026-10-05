// src/context/AuthContext.jsx

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  useLocation,
} from 'react-router-dom';

import {
  clearAuthToken,
  getAuthToken,
  setActiveAuthRole,
  setAuthToken,
} from '../services/api';

import {
  getCurrentUser,
  loginResident,
  logoutResident,
  registerResident,
  updateResidentProfile,
} from '../services/authService';

const APP_ROLES = [
  'resident',
  'responder',
];

const AuthContext =
  createContext(null);

function portalRoleFromPath(pathname) {
  return pathname.startsWith(
    '/responder'
  )
    ? 'responder'
    : 'resident';
}

export function AuthProvider({
  children,
}) {
  const location =
    useLocation();

  const portalRole =
    portalRoleFromPath(
      location.pathname
    );

  const [
    user,
    setUser,
  ] = useState(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  // ============ RESTORE SESSION ============

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      setIsLoading(true);

      setActiveAuthRole(
        portalRole
      );

      try {
        // Remove keys from the old shared-session implementation.
        localStorage.removeItem(
          'resqnow_token'
        );

        localStorage.removeItem(
          'resqnow_resident'
        );
      } catch {
        // Ignore unavailable browser storage.
      }

      const token =
        getAuthToken(
          portalRole
        );

      if (!token) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }

        return;
      }

      try {
        const currentUser =
          await getCurrentUser();

        if (!isMounted) {
          return;
        }

        if (
          APP_ROLES.includes(
            currentUser?.role
          ) &&
          currentUser?.role ===
            portalRole
        ) {
          setUser(
            currentUser
          );
        } else {
          clearAuthToken(
            portalRole
          );

          setUser(null);
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);
        }

        if (
          error.status !== 401 &&
          import.meta.env.DEV
        ) {
          console.error(
            'Session restore failed:',
            error
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [portalRole]);

  // ============ LOGIN ============

  const login = async (
    credentials,
    expectedRole = portalRole
  ) => {
    setActiveAuthRole(
      expectedRole
    );

    const result =
      await loginResident(
        credentials,
        expectedRole
      );

    const loggedInUser =
      result?.user;

    const token =
      result?.token;

    if (
      !APP_ROLES.includes(
        loggedInUser?.role
      ) ||
      loggedInUser?.role !==
        expectedRole ||
      !token
    ) {
      clearAuthToken(
        expectedRole
      );

      const rejected =
        new Error(
          'The email or password you entered is incorrect.'
        );

      rejected.status = 422;

      throw rejected;
    }

    setAuthToken(
      token,
      expectedRole
    );

    setUser(
      loggedInUser
    );

    return loggedInUser;
  };

  // ============ REGISTER ============

  const register = async (
    residentData
  ) => {
    return registerResident(
      residentData
    );
  };

  // ============ LOGOUT ============

  const logout = async () => {
    setActiveAuthRole(
      portalRole
    );

    // Start the authenticated revoke request before removing
    // the local token. apiRequest captures the bearer token
    // immediately when this function is called.
    const logoutRequest =
      logoutResident(
        portalRole
      );

    // Do not keep the user staring at the old dashboard while
    // the server finishes revoking the token.
    clearAuthToken(
      portalRole
    );

    setUser(null);

    try {
      await logoutRequest;
    } catch (error) {
      // Local sign-out must still succeed when the network is slow
      // or unavailable. The token has already been removed locally.
      if (import.meta.env.DEV) {
        console.warn(
          'Server logout could not be confirmed:',
          error
        );
      }
    } finally {
      try {
        localStorage.removeItem(
          'resqnow_resident'
        );
      } catch {
        // Ignore unavailable browser storage.
      }
    }
  };
  // ============ REFRESH USER ============

  const refreshUser = async () => {
    setActiveAuthRole(
      portalRole
    );

    const currentUser =
      await getCurrentUser();

    if (
      currentUser?.role !==
        portalRole
    ) {
      clearAuthToken(
        portalRole
      );

      setUser(null);

      throw new Error(
        'The current account does not belong to this portal.'
      );
    }

    setUser(
      currentUser
    );

    return currentUser;
  };

  // ============ UPDATE PROFILE ============

  const updateProfile = async (
    updates
  ) => {
    setActiveAuthRole(
      portalRole
    );

    const updatedUser =
      await updateResidentProfile(
        updates
      );

    setUser(
      updatedUser
    );

    return updatedUser;
  };

  // Never expose a resident session to responder routes,
  // or a responder session to resident routes, even during
  // the brief render before session restoration completes.
  const portalUser =
    user?.role === portalRole
      ? user
      : null;

  const portalIsLoading =
    isLoading ||
    (
      user !== null &&
      user?.role !== portalRole
    );

  return (
    <AuthContext.Provider
      value={{
        user: portalUser,
        isLoading: portalIsLoading,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        isLoggedIn:
          !!portalUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx =
    useContext(
      AuthContext
    );

  if (!ctx) {
    throw new Error(
      'useAuth must be inside AuthProvider'
    );
  }

  return ctx;
}