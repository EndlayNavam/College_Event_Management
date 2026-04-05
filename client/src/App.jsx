import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Loader from "./components/Loader";
import { getDefaultRoute } from "./config/navigation";
import { useAuth } from "./context/AuthContext";
import AdminActivePage from "./pages/admin/AdminActivePage";
import AdminPendingPage from "./pages/admin/AdminPendingPage";
import AdminRejectedPage from "./pages/admin/AdminRejectedPage";
import OrganizerCreatePage from "./pages/organizer/OrganizerCreatePage";
import OrganizerInsightsPage from "./pages/organizer/OrganizerInsightsPage";
import OrganizerSubmissionsPage from "./pages/organizer/OrganizerSubmissionsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentCalendarPage from "./pages/student/StudentCalendarPage";
import StudentEventsPage from "./pages/student/StudentEventsPage";
import StudentRegistrationsPage from "./pages/student/StudentRegistrationsPage";

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getDefaultRoute(user.role)} replace />;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullScreen label="Loading..." />;
  if (user) return <RoleRedirect />;
  return children;
}

function ProtectedLayout({ roles, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen label="Loading workspace..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <RoleRedirect />;
  }

  return <Layout role={role} />;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/student"
        element={<ProtectedLayout roles={["student"]} role="student" />}
      >
        <Route index element={<Navigate to="events" replace />} />
        <Route path="events" element={<StudentEventsPage />} />
        <Route path="registrations" element={<StudentRegistrationsPage />} />
        <Route path="calendar" element={<StudentCalendarPage />} />
      </Route>

      <Route
        path="/organizer"
        element={<ProtectedLayout roles={["organizer"]} role="organizer" />}
      >
        <Route index element={<Navigate to="create" replace />} />
        <Route path="create" element={<OrganizerCreatePage />} />
        <Route path="submissions" element={<OrganizerSubmissionsPage />} />
        <Route path="insights" element={<OrganizerInsightsPage />} />
      </Route>

      <Route path="/admin" element={<ProtectedLayout roles={["admin"]} role="admin" />}>
        <Route index element={<Navigate to="pending" replace />} />
        <Route path="pending" element={<AdminPendingPage />} />
        <Route path="active" element={<AdminActivePage />} />
        <Route path="rejected" element={<AdminRejectedPage />} />
      </Route>

      <Route path="/" element={<RoleRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
