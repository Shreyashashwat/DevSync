import "@smastrom/react-rating/style.css";

import React, { useEffect, useContext } from "react";
import logo from "./assets/logo.png";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

import Register from "./page/auth/Register.jsx";
import Login from "./page/auth/Login.jsx";
import HomePage from "./page/HomePage.jsx";
import ComplaintForm from "./page/Citizen/ComplaintForm.jsx";
import AdminDashboard from "./page/Admin/AdminDashboard.jsx";
import StaffDashboard from "./page/Staff/StaffDashboard.jsx";
import CitizenDashboard from "./page/Citizen/CitizenDashboard.jsx";
import ProtectedRoute from "./routes/protectedRoute.jsx";

// Firebase
import { onMessage } from "firebase/messaging";
import { messaging } from "./Firebase/firebase";


// Auth context
import AuthProvider, { UserContext } from "./context/AuthContext.jsx";

/* ===============================
   🔔 Notification Handler
================================ */
function NotificationHandler() {
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user?.id) return;

    console.log("✅ NotificationHandler ACTIVE");

    // ask permission + save token


    // foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("🔔 Foreground notification:", payload);
      if (payload.notification) {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
        });
      }
    });

    return () => unsubscribe();
  }, [user]);

  return null;
}

/* ===============================
   🎨 UI Constants
================================ */
const COLORS = {
  red: "#D4181F",
  blue: "#2B4CB3",
  yellow: "#F4D000",
  black: "#0A0A0A",
  white: "#FFFFFF",
};

/* ===============================
   🔐 Auth Buttons
================================ */
function AuthButtons() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.clear();
    alert("Logged out");
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      {!token ? (
        <>
          <Link to="/register" style={{ color: COLORS.yellow }}>Register</Link>
          <Link to="/login" style={{ color: COLORS.yellow }}>Login</Link>
        </>
      ) : (
        <button onClick={handleLogout} style={{ color: COLORS.white }}>
          Logout
        </button>
      )}
    </div>
  );
}

/* ===============================
   🧭 Navbar
================================ */
function Navbar() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        height: "72px",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0 24px",
        backdropFilter: "blur(10px)",
        borderBottom: `2px solid ${COLORS.yellow}`,
        zIndex: 999,
      }}
    >
      <img src={logo} alt="Logo" style={{ height: 50, marginRight: 20 }} />
      <AuthButtons />
    </nav>
  );
}

/* ===============================
   🚀 MAIN APP
================================ */
export default function App() {

  // ✅ SERVICE WORKER REGISTRATION (ONCE)
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((reg) => {
          console.log("✅ Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.error("❌ Service Worker failed:", err);
        });
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <NotificationHandler />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard/citizen"
            element={
              <ProtectedRoute allowedRoles={["citizen"]}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/staff"
            element={
              <ProtectedRoute allowedRoles={["staff", "officer"]}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/complaint/new"
            element={
              <ProtectedRoute allowedRoles={["citizen"]}>
                <ComplaintForm />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<h1>404 Page Not Found</h1>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
