import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import {
  AuthProvider,
  useAuth,
} from './context/AuthContext';

import LoadingSpinner from './components/common/LoadingSpinner';

import Login from './components/resident/Login';
import Register from './components/resident/Register';
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

import ResponderLogin from './components/responder/ResponderLogin';
import ResponderLayout from './components/responder/ResponderLayout';
import ResponderDashboard from './components/responder/ResponderDashboard';
import ResponderTrack from './components/responder/ResponderTrack';
import ResponderFullMap from './components/responder/ResponderFullMap';
import ResponderIncidentDetail from './components/responder/ResponderIncidentDetail';
import ResponderContacts from './components/responder/ResponderContacts';
import ResponderUpdates from './components/responder/ResponderUpdates';
import ResponderProfile from './components/responder/ResponderProfile';

function homeForRole(role) {
  if (role === 'responder') {
    return '/responder/dashboard';
  }

  return '/dashboard';
}

function ProtectedRoute({
  children,
  roles,
  loginPath = '/login',
}) {
  const {
    isLoggedIn,
    isLoading,
    user,
  } = useAuth();

  if (isLoading) {
    return (
      <LoadingSpinner message="Checking secure session..." />
    );
  }

  if (!isLoggedIn) {
    return (
      <Navigate
        to={loginPath}
        replace
      />
    );
  }

  if (
    roles?.length &&
    !roles.includes(user?.role)
  ) {
    return (
      <Navigate
        to={homeForRole(user?.role)}
        replace
      />
    );
  }

  return children;
}

function PublicRoute({
  children,
}) {
  const {
    isLoggedIn,
    isLoading,
    user,
  } = useAuth();

  if (isLoading) {
    return (
      <LoadingSpinner message="Checking session..." />
    );
  }

  if (isLoggedIn) {
    return (
      <Navigate
        to={homeForRole(user?.role)}
        replace
      />
    );
  }

  return children;
}

function UnknownRoute() {
  const {
    isLoggedIn,
    isLoading,
    user,
  } = useAuth();

  if (isLoading) {
    return (
      <LoadingSpinner message="Checking session..." />
    );
  }

  return (
    <Navigate
      to={
        isLoggedIn
          ? homeForRole(user?.role)
          : '/login'
      }
      replace
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ============ PUBLIC ============ */}

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
            path="/responder/login"
            element={
              <PublicRoute>
                <ResponderLogin />
              </PublicRoute>
            }
          />


          {/* ============ RESIDENT ============ */}

          <Route
            element={
              <ProtectedRoute
                roles={['resident']}
              >
                <ResidentLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/submit"
              element={<SubmitReportChoice />}
            />

            <Route
              path="/submit/emergency"
              element={<EmergencyReport />}
            />

            <Route
              path="/submit/non-emergency"
              element={<NonEmergencyReport />}
            />

            <Route
              path="/track"
              element={<TrackReports />}
            />

            <Route
              path="/track/:reportId"
              element={<ReportDetail />}
            />

            <Route
              path="/contacts"
              element={<EmergencyContacts />}
            />

            <Route
              path="/updates"
              element={<Updates />}
            />

            <Route
              path="/updates/:updateId"
              element={<UpdateDetail />}
            />

            <Route
              path="/notifications"
              element={<Notifications />}
            />

            <Route
              path="/profile"
              element={<Settings />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />

            <Route
              path="/safety-tips"
              element={<SafetyTips />}
            />
          </Route>


          {/* ============ RESPONDER ============ */}

          <Route
            path="/responder"
            element={<Navigate to="/responder/dashboard" replace />}
          />

          <Route
            element={
              <ProtectedRoute
                roles={['responder']}
                loginPath="/responder/login"
              >
                <ResponderLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/responder/dashboard" element={<ResponderDashboard />} />

            <Route path="/responder/missions" element={<ResponderTrack />} />
            <Route path="/responder/missions/map" element={<ResponderFullMap />} />
            <Route path="/responder/missions/:reportId" element={<ResponderIncidentDetail />} />

            <Route path="/responder/contacts" element={<ResponderContacts />} />
            <Route path="/responder/updates" element={<ResponderUpdates />} />
            <Route path="/responder/profile" element={<ResponderProfile />} />

            {/* Legacy URLs kept as safe redirects / compatibility routes. */}
            <Route path="/responder/incidents" element={<Navigate to="/responder/missions" replace />} />
            <Route path="/responder/track" element={<Navigate to="/responder/missions" replace />} />
            <Route path="/responder/incidents/map" element={<Navigate to="/responder/missions/map" replace />} />
            <Route path="/responder/incidents/:reportId" element={<ResponderIncidentDetail />} />
            <Route path="/responder/settings" element={<Navigate to="/responder/profile" replace />} />
            <Route path="/responder/safety-tips" element={<Navigate to="/responder/dashboard" replace />} />
            <Route path="/responder/map" element={<Navigate to="/responder/missions" replace />} />
          </Route>


          {/* ============ FALLBACK ============ */}

          <Route
            path="*"
            element={<UnknownRoute />}
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}