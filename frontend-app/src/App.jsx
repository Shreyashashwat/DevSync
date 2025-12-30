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
// import StaffPerformance from "./page/Admin/StaffPerformance.jsx";
import ProtectedRoute from "./routes/protectedRoute.jsx";


//Notification
// import Messaging from "./Firebase/Messaging.jsx";
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
   🎨 UI Constants (Updated for Sci-Fi Theme)
================================ */
const THEME = {
  cyan: "#00f3ff",
  blue: "#0066ff",
  red: "#D4181F",
  white: "#FFFFFF",
  glassBorder: "rgba(0, 243, 255, 0.3)",
};

export function AuthButtons() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const baseBtn = {
    padding: "8px 24px",
    borderRadius: "4px", // More angular for sci-fi feel
    fontWeight: 600,
    textDecoration: "none",
    backdropFilter: "blur(4px)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    fontFamily: '"Orbitron", sans-serif', // Use theme font
    letterSpacing: "1px",
    textTransform: "uppercase",
    fontSize: "0.9rem",
  };

  return (
    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      {!token ? (
        <>
          {/* Register - Cyan Theme */}
          <Link
            to="/register"
            style={{
              ...baseBtn,
              background: "rgba(0, 243, 255, 0.1)",
              border: `1px solid ${THEME.cyan}`,
              color: THEME.cyan,
              boxShadow: "0 0 10px rgba(0, 243, 255, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(0, 243, 255, 0.2)";
              e.target.style.boxShadow = "0 0 20px rgba(0, 243, 255, 0.4)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(0, 243, 255, 0.1)";
              e.target.style.boxShadow = "0 0 10px rgba(0, 243, 255, 0.1)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Register
          </Link>

          {/* Login - Blue Theme */}
          <Link
            to="/login"
            style={{
              ...baseBtn,
              background: "rgba(0, 102, 255, 0.1)",
              border: `1px solid ${THEME.blue}`,
              color: "#4db8ff",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(0, 102, 255, 0.25)";
              e.target.style.boxShadow = "0 0 20px rgba(0, 102, 255, 0.5)";
              e.target.style.color = "white";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(0, 102, 255, 0.1)";
              e.target.style.boxShadow = "none";
              e.target.style.color = "#4db8ff";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Login
          </Link>
        </>
      ) : (
        /* Logout */
        <button
          onClick={handleLogout}
          style={{
            ...baseBtn,
            background: "rgba(212,24,31,0.15)",
            border: "1px solid rgba(212,24,31,0.5)",
            color: "#ff4d4d",
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = "0 0 15px rgba(212,24,31,0.6)";
            e.target.style.background = "rgba(212,24,31,0.25)";
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = "none";
            e.target.style.background = "rgba(212,24,31,0.15)";
          }}
        >
          Logout
        </button>
      )}
    </div>
  );
}


function Navbar() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        height: "80px",
        display: "flex",
        justifyContent: "flex-end", // Align buttons to the right
        alignItems: "center",
        padding: "0 40px",
        background: "rgba(2, 11, 28, 0.6)", // Darker semi-transparent bg
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${THEME.glassBorder}`,
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
        zIndex: 999,
      }}
    >

      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{
            height: "80px", // Slightly larger
            width: "auto",
            objectFit: "contain",
            filter: "drop-shadow(0 0 8px rgba(0, 243, 255, 0.3))", // Cyan glow
          }}
        />
      </div>
      <AuthButtons />


    </nav>
  );
}

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
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
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
            path="/dashboard/admin/staff-performance"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
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
