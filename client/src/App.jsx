import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import LandingPage      from './pages/LandingPage';
import AuthPage         from './pages/AuthPage';
import OnboardingPage   from './pages/OnboardingPage';
import Dashboard        from './pages/Dashboard';
import GoalsPage        from './pages/GoalsPage';
import GoalDetailPage   from './pages/GoalDetailPage';
import CreateGoalPage   from './pages/CreateGoalPage';
import TasksPage        from './pages/TasksPage';
import JournalPage      from './pages/JournalPage';
import InsightsPage     from './pages/InsightsPage';
import NudgesPage       from './pages/NudgesPage';
import SettingsPage     from './pages/SettingsPage';

// ── Protected route: redirects to /login if not authenticated ─────────────────
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" style={{ width: 48, height: 48 }} />
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading StepsBuilder...</p>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

// ── Public route: redirects authenticated users to dashboard ──────────────────
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />

      {/* Onboarding — requires auth, but doesn't require completed onboarding */}
      <Route path="/onboarding" element={<PrivateRoute><OnboardingPage /></PrivateRoute>} />

      {/* App */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/goals" element={<PrivateRoute><GoalsPage /></PrivateRoute>} />
      <Route path="/goals/new" element={<PrivateRoute><CreateGoalPage /></PrivateRoute>} />
      <Route path="/goals/:id" element={<PrivateRoute><GoalDetailPage /></PrivateRoute>} />
      <Route path="/tasks" element={<PrivateRoute><TasksPage /></PrivateRoute>} />
      <Route path="/journal" element={<PrivateRoute><JournalPage /></PrivateRoute>} />
      <Route path="/insights" element={<PrivateRoute><InsightsPage /></PrivateRoute>} />
      <Route path="/nudges" element={<PrivateRoute><NudgesPage /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
