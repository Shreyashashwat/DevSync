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
   🎨 UI Constants
================================ */
const COLORS = {
  red: "#D4181F",
  blue: "#2B4CB3",
  yellow: "#F4D000",
  black: "#0A0A0A",
  white: "#FFFFFF",
};

export function AuthButtons() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const baseBtn = {
    padding: "8px 18px",
    borderRadius: "999px",
    fontWeight: 600,
    textDecoration: "none",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.25)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      {!token ? (
        <>
          {/* Register */}
          <Link
            to="/register"
            style={{
              ...baseBtn,
              background: "rgba(244,208,0,0.15)",
              color: COLORS.yellow,
            }}
            onMouseEnter={(e) =>
              (e.target.style.boxShadow = "0 0 12px rgba(244,208,0,0.8)")
            }
            onMouseLeave={(e) => (e.target.style.boxShadow = "none")}
          >
            Register
          </Link>

          {/* Login */}
          <Link
            to="/login"
            style={{
              ...baseBtn,
              background: "rgba(43,76,179,0.2)",
              color: COLORS.white,
            }}
            onMouseEnter={(e) =>
              (e.target.style.boxShadow = "0 0 12px rgba(43,76,179,0.9)")
            }
            onMouseLeave={(e) => (e.target.style.boxShadow = "none")}
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
            background: "rgba(212,24,31,0.25)",
            color: COLORS.white,
          }}
          onMouseEnter={(e) =>
            (e.target.style.boxShadow = "0 0 14px rgba(212,24,31,0.9)")
          }
          onMouseLeave={(e) => (e.target.style.boxShadow = "none")}
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

      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{
            height: "70px",
            width:"800px",
            objectFit: "contain",
            filter: "drop-shadow(0 0 4px rgba(255,255,255,0.6))",
          }}
        />
      </div>
      <AuthButtons/>

   
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
