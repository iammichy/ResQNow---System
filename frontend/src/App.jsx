// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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


function ProtectedRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner message="Checking session..." />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner message="Checking session..." />;
  if (isLoggedIn) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route element={<ProtectedRoute><ResidentLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/submit" element={<SubmitReportChoice />} />
            <Route path="/submit/emergency" element={<EmergencyReport />} />
            <Route path="/submit/non-emergency" element={<NonEmergencyReport />} />
            <Route path="/track" element={<TrackReports />} />
            <Route path="/track/:reportId" element={<ReportDetail />} />
            <Route path="/contacts" element={<EmergencyContacts />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Settings />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/safety-tips" element={<SafetyTips />} />
            <Route path="/updates" element={<Updates />} />

          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
