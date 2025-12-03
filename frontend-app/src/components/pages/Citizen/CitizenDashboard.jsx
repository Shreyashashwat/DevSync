import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance"; // use central axios
import ComplaintForm from "./ComplaintForm";
import ComplaintLifecycle from "./ComplaintLifecycle";
import { useNavigate } from "react-router-dom";

const COLORS = {
  violetDark: "#2e1834",
  violetMid: "#4B0082",
  gold: "#CC9901",
  paleGold: "#e6c676",
  white: "#ffffff",
};

const CitizenDashboard = () => {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      try {
        const res = await axiosInstance.get("/api/dashboard/citizen");
        setUsername(res.data.msg.replace("Welcome citizen ", "")); // extract username from backend msg
        setLoading(false);
      } catch (err) {
        console.error("❌ Authorization failed:", err);
        alert("You are not authorized to access this page!");
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    verifyUser();
  }, [navigate]);

  if (loading) return <p>Checking authorization...</p>;

  // Sidebar styles
  const sidebarStyle = {
    width: "220px",
    minHeight: "100vh",
    backgroundColor: COLORS.violetDark,
    color: COLORS.white,
    display: "flex",
    flexDirection: "column",
    padding: "1rem",
  };

  const sidebarItemStyle = (active) => ({
    padding: "0.8rem 1rem",
    marginBottom: "0.5rem",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: active ? COLORS.violetMid : "transparent",
    fontWeight: active ? "600" : "400",
    color: COLORS.white,
    transition: "0.2s",
  });

  const mainStyle = {
    flex: 1,
    padding: "2rem",
    background: "#f5f5f5",
    minHeight: "100vh",
    color: COLORS.violetDark,
  };

  const cardStyle = {
    background: COLORS.white,
    padding: "1.5rem",
    borderRadius: "12px",
    marginBottom: "1rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  };

  return (
    <div style={{ display: "flex", fontFamily: "Poppins, sans-serif" }}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>Citizen Dashboard</h2>
        <div
          style={sidebarItemStyle(activeMenu === "dashboard")}
          onClick={() => setActiveMenu("dashboard")}
        >
          Dashboard
        </div>
        <div
          style={sidebarItemStyle(activeMenu === "complaint-form")}
          onClick={() => setActiveMenu("complaint-form")}
        >
          Submit Complaint
        </div>
        <div
          style={sidebarItemStyle(activeMenu === "lifecycle")}
          onClick={() => setActiveMenu("lifecycle")}
        >
          My Complaints
        </div>
      </div>

      {/* Main content */}
      <div style={mainStyle}>
        {activeMenu === "dashboard" && (
          <div style={cardStyle}>
            <h2>Welcome, {username}! 🌟</h2>
            <p>Use the sidebar to submit a complaint or check its status.</p>
          </div>
        )}

        {activeMenu === "complaint-form" && <ComplaintForm />}

        {activeMenu === "lifecycle" && <ComplaintLifecycle />}
      </div>
    </div>
  );
};

export default CitizenDashboard;
