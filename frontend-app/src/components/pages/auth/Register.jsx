import React, { useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const COLORS = {
  violetDark: "#2e1834",
  violetMid: "#4B0082",
  gold: "#CC9901",
  paleGold: "#e6c676",
  glass: "rgba(255, 255, 255, 0.1)",
};

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "citizen",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      setError("⚠️ Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axiosInstance.post("/api/auth/register", formData);

      if (res.data.token) {
         localStorage.setItem("token", res.data.token); // ← missing
         localStorage.setItem("user", JSON.stringify(res.data.user));

        const role = res.data.user?.role;
        if (role === "admin") navigate("/dashboard/admin");
        else if (role === "staff") navigate("/dashboard/staff");
        else navigate("/dashboard/citizen");
      } else {
        setError("Registration successful, please log in.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      setError(err.response?.data?.msg || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${COLORS.violetDark}, ${COLORS.violetMid})`,
        color: COLORS.gold,
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div
        style={{
          background: COLORS.glass,
          border: `1px solid ${COLORS.gold}`,
          borderRadius: "1rem",
          padding: "2.5rem 2rem",
          maxWidth: "420px",
          width: "100%",
          boxShadow: `0 0 25px rgba(0,0,0,0.5)`,
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "1.9rem",
            color: COLORS.gold,
            marginBottom: "1.5rem",
            textShadow: `0 0 8px ${COLORS.gold}`,
          }}
        >
          ✨ Create Account
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
            style={{ width: "100%", marginBottom: "1rem", padding: "0.8rem", borderRadius: "8px" }}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            style={{ width: "100%", marginBottom: "1rem", padding: "0.8rem", borderRadius: "8px" }}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            minLength={6}
            style={{ width: "100%", marginBottom: "1rem", padding: "0.8rem", borderRadius: "8px" }}
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={{
              width: "100%",
              marginBottom: "1.5rem",
              padding: "0.8rem",
              borderRadius: "8px",
              border: `1px solid ${COLORS.paleGold}`,
              backgroundColor: "rgba(255,255,255,0.15)",
              color: COLORS.gold,
            }}
          >
            <option value="citizen">Citizen</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>

          {error && <p style={{ color: "red", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "0.9rem",
              background: COLORS.gold,
              color: COLORS.violetDark,
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem" }}>
          Already have an account?{" "}
          <span
            style={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

