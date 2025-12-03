import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";

const COLORS = {
  violetDark: "#2e1834",
  violetMid: "#4B0082",
  gold: "#CC9901",
  white: "#ffffff",
};

const StaffDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filters, setFilters] = useState({ status: "All", priority: "All" });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/complaints", {
          headers: { "x-auth-token": token },
        });
        setComplaints(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        alert("Failed to fetch complaints. Please login again.");
      }
    };
    fetchComplaints();
  }, []);

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      setUpdating(complaintId);
      const token = localStorage.getItem("token");
      await axiosInstance.patch(
        "/api/complaints/status",
        { complaintId, status: newStatus },
        { headers: { "x-auth-token": token } }
      );
      setComplaints((prev) =>
        prev.map((c) =>
          c._id === complaintId ? { ...c, status: newStatus } : c
        )
      );
      setUpdating(null);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
      setUpdating(null);
    }
  };

  // Filter, search, and sort complaints
  const filteredComplaints = complaints
    .filter((c) => 
      (filters.status === "All" || c.status === filters.status) &&
      (filters.priority === "All" || c.priority === filters.priority) &&
      (c.title.toLowerCase().includes(search.toLowerCase()) ||
       c.category.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "latest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "priority") {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });

  if (loading)
    return <p style={{ color: COLORS.gold }}>Loading complaints...</p>;

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Poppins, sans-serif",
        background: COLORS.violetDark,
        minHeight: "100vh",
        color: COLORS.white,
      }}
    >
      <h2 style={{ color: COLORS.gold, marginBottom: "1rem" }}>
        Staff Dashboard
      </h2>

      {/* Search and Filters */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search by title or category"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "0.5rem",
            borderRadius: "6px",
            border: "none",
            flex: "1",
            minWidth: "200px",
          }}
        />

        <div>
          <label>Status: </label>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            style={{
              padding: "0.4rem 0.6rem",
              borderRadius: "6px",
              border: "none",
              background: COLORS.gold,
              color: COLORS.violetDark,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {["All", "OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"].map(
              (status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label>Priority: </label>
          <select
            value={filters.priority}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, priority: e.target.value }))
            }
            style={{
              padding: "0.4rem 0.6rem",
              borderRadius: "6px",
              border: "none",
              background: COLORS.gold,
              color: COLORS.violetDark,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {["All", "Low", "Medium", "High"].map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Sort: </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "0.4rem 0.6rem",
              borderRadius: "6px",
              border: "none",
              background: COLORS.gold,
              color: COLORS.violetDark,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      {/* Complaint Cards */}
      {filteredComplaints.length === 0 && <p>No complaints match your search or filters.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {filteredComplaints.map((c) => (
          <div
            key={c._id}
            style={{
              background: COLORS.violetMid,
              padding: "1rem",
              borderRadius: "12px",
              boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem 0", color: COLORS.gold }}>
              {c.title} - <span style={{ fontWeight: "normal" }}>{c.status}</span>
            </h3>
            <p>{c.description}</p>
            <p>
              <strong>Category:</strong> {c.category} | <strong>Priority:</strong>{" "}
              {c.priority}
            </p>
            {c.location?.latitude && c.location?.longitude && (
              <p>
                <strong>Location:</strong> {c.location.address || "N/A"} (
                {c.location.latitude.toFixed(4)}, {c.location.longitude.toFixed(4)})
              </p>
            )}
            {c.photo_url && (
              <img
                src={c.photo_url}
                alt="Complaint"
                style={{ maxWidth: "100%", borderRadius: "8px", marginTop: "0.5rem" }}
              />
            )}

            <div style={{ marginTop: "0.5rem" }}>
              <label style={{ marginRight: "0.5rem" }}>Update Status:</label>
              <select
                value={c.status}
                onChange={(e) => handleStatusChange(c._id, e.target.value)}
                disabled={updating === c._id}
                style={{
                  padding: "0.4rem 0.6rem",
                  borderRadius: "6px",
                  border: "none",
                  background: COLORS.gold,
                  color: COLORS.violetDark,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"].map(
                  (status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  )
                )}
              </select>
              {updating === c._id && <span style={{ marginLeft: "0.5rem" }}>Updating...</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffDashboard;




