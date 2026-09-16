// src/App.jsx

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import {
  AuthProvider,
  useAuth,
} from './context/AuthContext';

import LoadingSpinner from './components/common/LoadingSpinner';

import Login from './components/resident/Login';
import Register from './components/resident/Register';
import ResetPassword from './components/resident/ResetPassword';

import ResidentLayout from './components/resident/ResidentLayout';
import Dashboard from './components/resident/Dashboard';
import SubmitReportChoice from './components/resident/SubmitReportChoice';
import EmergencyReport from './components/resident/EmergencyReport';
import NonEmergencyReport from './components/resident/NonEmergencyReport';
import TrackReports from './components/resident/TrackReports';
import ReportDetail from './components/resident/ReportDetail';
import EmergencyContacts from './components/resident/EmergencyContacts';
import Notifications from './components/resident/Notifications';
import Settings from './components/resident/Settings';
import SafetyTips from './components/resident/SafetyTips';
import Updates from './components/resident/Updates';
import UpdateDetail from './components/resident/UpdateDetail';
import ForgotPassword from './components/resident/ForgotPassword';

// ============ PROTECTED ROUTE ============
// Resident must be logged in.
function ProtectedRoute({
  children,
}) {
  const {
    isLoggedIn,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return (
      <LoadingSpinner message="Checking session..." />
    );
  }

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

// ============ PUBLIC ROUTE ============
// Logged-in resident should not return to
// normal guest-only pages such as Login/Register.
function PublicRoute({
  children,
}) {
  const {
    isLoggedIn,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return (
      <LoadingSpinner message="Checking session..." />
    );
  }

  if (isLoggedIn) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}

// ============ APP ROUTES ============

export default function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <Routes>

          {/* ============ PUBLIC AUTH ROUTES ============ */}

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
            }
          />
          {/*
            Password reset links must remain directly accessible.

            We intentionally do NOT wrap this route in:
            - ProtectedRoute
            - PublicRoute
            - ResidentLayout

            A resident must be able to open the reset link
            from their email even when they are logged out.
          */}
          <Route
            path="/reset-password"
            element={
              <ResetPassword />
            }
          />

          {/* ============ RESIDENT PROTECTED ROUTES ============ */}

          <Route
            element={
              <ProtectedRoute>
                <ResidentLayout />
              </ProtectedRoute>
            }
          >

            <Route
              path="/dashboard"
              element={
                <Dashboard />
              }
            />

            <Route
              path="/submit"
              element={
                <SubmitReportChoice />
              }
            />

            <Route
              path="/submit/emergency"
              element={
                <EmergencyReport />
              }
            />

            <Route
              path="/submit/non-emergency"
              element={
                <NonEmergencyReport />
              }
            />

            <Route
              path="/track"
              element={
                <TrackReports />
              }
            />

            <Route
              path="/track/:reportId"
              element={
                <ReportDetail />
              }
            />

            <Route
              path="/contacts"
              element={
                <EmergencyContacts />
              }
            />

            {/* Updates */}
            <Route
              path="/updates"
              element={
                <Updates />
              }
            />

            {/* Specific announcement / alert */}
            <Route
              path="/updates/:updateId"
              element={
                <UpdateDetail />
              }
            />

            {/* Existing alias */}
            <Route
              path="/notifications"
              element={
                <Notifications />
              }
            />

            <Route
              path="/profile"
              element={
                <Settings />
              }
            />

            <Route
              path="/settings"
              element={
                <Settings />
              }
            />

            <Route
              path="/safety-tips"
              element={
                <SafetyTips />
              }
            />
          </Route>

          {/* ============ UNKNOWN ROUTE ============ */}

          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

        </Routes>

      </AuthProvider>

    </BrowserRouter>
  );
}