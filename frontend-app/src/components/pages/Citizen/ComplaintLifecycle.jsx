import React, { useEffect, useState } from "react";
import axios from "axios";

const COLORS = {
  violetDark: "#2e1834",
  violetMid: "#4B0082",
  gold: "#CC9901",
  white: "#ffffff",
};

export default function ComplaintLifecycle() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchComplaints = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to view complaints.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/api/complaints", {
        headers: { "x-auth-token": token },
      });

      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch complaints");
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  if (loading) return <p style={{ color: COLORS.gold, fontWeight: "bold" }}>Loading complaints...</p>;

  if (error)
    return (
      <div style={{ color: COLORS.gold, fontFamily: "Poppins, sans-serif" }}>
        <p>Error: {error}</p>
        <button
          onClick={fetchComplaints}
          style={{
            backgroundColor: COLORS.violetDark,
            color: COLORS.white,
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            cursor: "pointer",
            border: "none",
          }}
        >
          Retry
        </button>
      </div>
    );

  return (
    <div style={{ fontFamily: "Poppins, sans-serif", padding: "1rem" }}>
      {complaints.length === 0 ? (
        <p style={{ color: COLORS.gold }}>No complaints submitted yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {complaints.map((c) => (
            <li
              key={c._id}
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                borderRadius: "10px",
                border: `1px solid ${COLORS.gold}`,
                backgroundColor: COLORS.violetDark,
                color: COLORS.white,
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <h3 style={{ margin: "0 0 0.5rem 0", color: COLORS.gold }}>{c.title}</h3>
              <p style={{ margin: "0.5rem 0" }}>{c.description}</p>
              <p style={{ fontSize: "0.9rem", color: COLORS.gold }}>
                Status: {c.status || "OPEN"}
              </p>
              {c.submitted_by && (
                <p style={{ fontSize: "0.8rem" }}>
                  Submitted by: {c.submitted_by.username} ({c.submitted_by.email})
                </p>
              )}
              {c.createdAt && (
                <p style={{ fontSize: "0.8rem" }}>
                  Date: {new Date(c.createdAt).toLocaleString()}
                </p>
              )}
              {c.photo_url && (
                <img
                  src={c.photo_url}
                  alt="Complaint"
                  style={{
                    maxWidth: "100%",
                    marginTop: "0.5rem",
                    borderRadius: "6px",
                    border: `1px solid ${COLORS.gold}`,
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


