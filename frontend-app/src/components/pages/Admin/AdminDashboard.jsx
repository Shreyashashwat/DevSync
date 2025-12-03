import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const COLORS = {
  violetDark: "#2e1834",
  violetMid: "#4B0082",
  gold: "#CC9901",
  white: "#ffffff",
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [assignData, setAssignData] = useState({ complaintId: "", staffId: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      try {
        const dashboardRes = await axiosInstance.get("/api/dashboard/admin");
        setUsername(dashboardRes.data.msg.replace("Welcome admin ", ""));

        const complaintRes = await axiosInstance.get("/api/complaints", {
          headers: { "x-auth-token": token },
        });
        setComplaints(Array.isArray(complaintRes.data) ? complaintRes.data : []);

        const staffRes = await axiosInstance.get("/api/users/staff", {
          headers: { "x-auth-token": token },
        });
        setStaffList(staffRes.data || []);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        alert("Authorization failed. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchData();
  }, [navigate]);

  const handleAssign = async () => {
    const token = localStorage.getItem("token");
    if (!assignData.complaintId || !assignData.staffId)
      return alert("Select complaint & staff");

    try {
      const res = await axiosInstance.patch(
        "/api/complaints/assign",
        { complaintId: assignData.complaintId, staffId: assignData.staffId },
        { headers: { "x-auth-token": token } }
      );
      alert(res.data.message);
      setComplaints((prev) =>
        prev.map((c) =>
          c._id === res.data.complaint._id ? res.data.complaint : c
        )
      );
      setAssignData({ complaintId: "", staffId: "" });
    } catch (err) {
      console.error("Assign error:", err);
      alert("Failed to assign complaint");
    }
  };

  if (loading)
    return (
      <div style={{ color: COLORS.gold, textAlign: "center", marginTop: "5rem" }}>
        Loading Admin Dashboard...
      </div>
    );

  return (
    <div
      style={{
        backgroundColor: COLORS.violetDark,
        color: COLORS.white,
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h1 style={{ color: COLORS.gold, textAlign: "center" }}>
        👑 Welcome, {username}
      </h1>
      <p style={{ textAlign: "center", color: COLORS.gold }}>
        Manage and assign complaints to staff
      </p>

      <div
        style={{
          backgroundColor: COLORS.violetMid,
          borderRadius: "12px",
          padding: "1.5rem",
          marginTop: "2rem",
          boxShadow: "0 0 20px rgba(0,0,0,0.3)",
        }}
      >
        <h2 style={{ color: COLORS.gold, marginBottom: "1rem" }}>Assign Complaint</h2>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <select
            value={assignData.complaintId}
            onChange={(e) =>
              setAssignData({ ...assignData, complaintId: e.target.value })
            }
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              background: "#fff",
              color: "#333",
            }}
          >
            <option value="">Select Complaint</option>
            {complaints.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title} — ({c.status})
              </option>
            ))}
          </select>

          <select
            value={assignData.staffId}
            onChange={(e) =>
              setAssignData({ ...assignData, staffId: e.target.value })
            }
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              background: "#fff",
              color: "#333",
            }}
          >
            <option value="">Select Staff</option>
            {staffList.map((s) => (
              <option key={s._id} value={s._id}>
                {s.username}
              </option>
            ))}
          </select>

          <button
            onClick={handleAssign}
            style={{
              backgroundColor: COLORS.gold,
              color: COLORS.violetDark,
              fontWeight: "bold",
              border: "none",
              borderRadius: "8px",
              padding: "0.6rem 1.5rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) =>
              (e.target.style.backgroundColor = "#FFD700")
            }
            onMouseOut={(e) =>
              (e.target.style.backgroundColor = COLORS.gold)
            }
          >
            Assign
          </button>
        </div>
      </div>

      {/* Complaints Table */}
      <div style={{ marginTop: "3rem" }}>
        <h2 style={{ color: COLORS.gold, marginBottom: "1rem" }}>
          All Complaints
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#3a1a48",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: COLORS.gold, color: COLORS.violetDark }}>
                <th style={tableHeader}>Title</th>
                <th style={tableHeader}>Status</th>
                <th style={tableHeader}>Assigned To</th>
                <th style={tableHeader}>Category</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id} style={{ textAlign: "center" }}>
                  <td style={tableCell}>{c.title}</td>
                  <td style={tableCell}>{c.status || "OPEN"}</td>
                  <td style={tableCell}>{c.assigned_to?.username || "Unassigned"}</td>
                  <td style={tableCell}>{c.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const tableHeader = {
  padding: "0.75rem",
  textAlign: "center",
  fontWeight: "bold",
};

const tableCell = {
  padding: "0.75rem",
  borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
};

export default AdminDashboard;








