import React from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { getStoredUser } from "./api/client";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Analytics from "./pages/Analytics";
import Booking from "./pages/Booking";
import CrowdMap from "./pages/CrowdMap";
import Dashboard from "./pages/Dashboard";
import EmergencyCommandCentre from "./pages/EmergencyCommandCentre";
import EmergencySos from "./pages/EmergencySos";
import MyQueue from "./pages/MyQueue";
import Notifications from "./pages/Notifications";
import SmartParking from "./pages/SmartParking";
import Placeholder from "./pages/Placeholder";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminSection from "./pages/AdminSection";

function LoadingScreen() {
  return (
    <main aria-live="polite" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <strong>DarshanSetu</strong>
        <p>Loading...</p>
      </div>
    </main>
  );
}

function NotFound() {
  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px", textAlign: "center" }}><div><h1>404 — Page Not Found</h1><p>The page you requested does not exist.</p><a href="/">Return home</a></div></main>;
}

function useAuthStatus() {
  const [status, setStatus] = React.useState({ isChecking: true, isAuthenticated: false });

  React.useEffect(() => {
    const checkAuth = () => setStatus({
      isChecking: false,
      isAuthenticated: Boolean(localStorage.getItem("darshansetu_token"))
    });

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  return status;
}

function RequireAuth({ children }) {
  const location = useLocation();
  const { isChecking, isAuthenticated } = useAuthStatus();

  if (isChecking) return <LoadingScreen />;

  return isAuthenticated
    ? children
    : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

function RedirectIfAuthenticated({ children }) {
  const { isChecking, isAuthenticated } = useAuthStatus();

  if (isChecking) return <LoadingScreen />;

  return isAuthenticated
    ? <Navigate to="/admin/dashboard" replace />
    : children;
}

function AuthenticatedEntry() {
  const { isChecking, isAuthenticated } = useAuthStatus();

  if (isChecking) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Admin />;
}

function RequireAdmin({ children }) {
  const { isChecking, isAuthenticated } = useAuthStatus();
  const user = getStoredUser();

  if (isChecking) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return user?.role === "admin" ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthenticatedEntry />} />
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
        <Route path="/admin/bookings" element={<RequireAdmin><Booking /></RequireAdmin>} />
        <Route path="/admin/dashboard/bookings" element={<RequireAdmin><Booking /></RequireAdmin>} />
        <Route path="/admin/crowd-prediction" element={<RequireAdmin><AdminSection /></RequireAdmin>} />
        <Route path="/admin/crowd" element={<RequireAdmin><AdminSection /></RequireAdmin>} />
        <Route path="/admin/gates-zones" element={<RequireAdmin><AdminSection /></RequireAdmin>} />
        <Route path="/admin/queue-management" element={<RequireAdmin><AdminSection /></RequireAdmin>} />
        <Route path="/admin/queue" element={<RequireAdmin><AdminSection /></RequireAdmin>} />
        <Route path="/admin/analytics" element={<RequireAdmin><AdminSection /></RequireAdmin>} />
        <Route path="/admin/simulations" element={<RequireAdmin><AdminSection /></RequireAdmin>} />
        <Route path="/admin/parking" element={<RequireAdmin><AdminSection /></RequireAdmin>} />
        <Route path="/admin/emergencies" element={<RequireAdmin><AdminSection /></RequireAdmin>} />
        <Route path="/admin/staff-security" element={<RequireAdmin><AdminSection /></RequireAdmin>} />
        <Route path="/admin/staff" element={<RequireAdmin><AdminSection /></RequireAdmin>} />
        <Route path="/admin/announcements" element={<RequireAdmin><AdminSection /></RequireAdmin>} />
        <Route path="/admin/settings" element={<RequireAdmin><AdminSection /></RequireAdmin>} />
        <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
        <Route path="/booking" element={<RequireAuth><Booking /></RequireAuth>} />
        <Route path="/darshan-booking" element={<RequireAuth><Booking /></RequireAuth>} />
        <Route path="/temples" element={<RequireAuth><Placeholder title="Temples" /></RequireAuth>} />
        <Route path="/my-bookings" element={<RequireAuth><MyQueue /></RequireAuth>} />
        <Route path="/qr-pass" element={<RequireAuth><MyQueue /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Placeholder title="Profile" /></RequireAuth>} />
        <Route path="/help" element={<RequireAuth><Placeholder title="Help & Support" /></RequireAuth>} />
        <Route path="/crowd-map" element={<RequireAuth><CrowdMap /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
        <Route path="/emergency-command-centre" element={<RequireAuth><EmergencyCommandCentre /></RequireAuth>} />
        <Route path="/emergency-sos" element={<RequireAuth><EmergencySos /></RequireAuth>} />
        <Route path="/my-queue" element={<RequireAuth><MyQueue /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAdmin><Notifications /></RequireAdmin>} />
        <Route path="/smart-parking" element={<RequireAuth><SmartParking /></RequireAuth>} />
        <Route path="/live-crowd" element={<RequireAuth><CrowdMap /></RequireAuth>} />
        <Route path="/virtual-darshan" element={<RequireAuth><Placeholder title="Virtual Darshan" /></RequireAuth>} />
        <Route path="/services" element={<RequireAuth><Placeholder title="Services" /></RequireAuth>} />
        <Route path="/login" element={<RedirectIfAuthenticated><Login /></RedirectIfAuthenticated>} />
        <Route path="/signup" element={<RedirectIfAuthenticated><Signup /></RedirectIfAuthenticated>} />
        <Route path="/emergency" element={<RequireAuth><EmergencySos /></RequireAuth>} />
        <Route path="/parking" element={<RequireAuth><SmartParking /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}