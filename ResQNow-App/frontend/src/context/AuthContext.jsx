// src/context/AuthContext.jsx

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { getAuthToken } from '../services/api';
import {
  getCurrentUser,
  loginResident,
  logoutResident,
  registerResident,
  updateResidentProfile,
} from '../services/authService';

const AuthContext =
  createContext(null);

// ============ AUTH PROVIDER ============

export function AuthProvider({
  children,
}) {
  const [
    user,
    setUser,
  ] = useState(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  // ============ RESTORE SESSION ============
  // Check Laravel when the app first opens.

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      // Remove old mock authentication.
      localStorage.removeItem(
        'resqnow_resident'
      );

      // Signed out: skip the network round-trip entirely.
      if (!getAuthToken()) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }

        return;
      }

      try {
        const currentUser =
          await getCurrentUser();

        if (isMounted) {
          setUser(
            currentUser
          );
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);
        }

        // 401 simply means the resident
        // is not currently signed in.
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
          setIsLoading(
            false
          );
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // ============ LOGIN ============

  const login = async (
    credentials
  ) => {
    const loggedInUser =
      await loginResident(
        credentials
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
    try {
      await logoutResident();
    } finally {
      // Clear frontend state even when
      // the server session already expired.
      setUser(null);

      localStorage.removeItem(
        'resqnow_resident'
      );
    }
  };

  // ============ REFRESH USER ============

  const refreshUser = async () => {
    const currentUser =
      await getCurrentUser();

    setUser(
      currentUser
    );

    return currentUser;
  };

  // ============ UPDATE PROFILE ============
  // Persist profile changes to Laravel/MySQL,
  // then replace the current user with the
  // fresh user returned by the backend.

  const updateProfile = async (
    updates
  ) => {
    const updatedUser =
      await updateResidentProfile(
        updates
      );

    setUser(
      updatedUser
    );

    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        isLoggedIn:
          !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============ AUTH HOOK ============

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