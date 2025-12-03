import React, { useState, useEffect } from "react";
import axios from "axios";

const ComplaintsList = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [staffList, setStaffList] = useState([]); // For Admin assign
  const [userRole, setUserRole] = useState(""); // citizen/staff/admin

  const token = localStorage.getItem("token");

  // Fetch user info to know role
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { "x-auth-token": token },
        });
        setUserRole(data.user.role);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [token]);

  // Fetch complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get("http://localhost:5000/api/complaints", {
          headers: { "x-auth-token": token },
        });
        setComplaints(data.complaints);
      } catch (err) {
        console.error(err);
        setError("Failed to load complaints");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [token]);

  // Fetch staff list for admin
  useEffect(() => {
    const fetchStaff = async () => {
      if (userRole !== "admin") return;
      try {
        const { data } = await axios.get("http://localhost:5000/api/users/staff", {
          headers: { "x-auth-token": token },
        });
        setStaffList(data.staff);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStaff();
  }, [userRole, token]);

  // Assign complaint to staff
  const handleAssign = async (complaintId, staffId) => {
    try {
      await axios.patch(
        "http://localhost:5000/api/complaints/assign",
        { complaintId, staffId },
        { headers: { "x-auth-token": token } }
      );
      alert("Complaint assigned successfully!");
      // Refresh complaints list
      setComplaints((prev) =>
        prev.map((c) =>
          c._id === complaintId ? { ...c, assigned_to: staffList.find(s => s._id === staffId), status: "ASSIGNED" } : c
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to assign complaint");
    }
  };

  // Update complaint status
  const handleStatusChange = async (complaintId, status) => {
    try {
      await axios.patch(
        "http://localhost:5000/api/complaints/status",
        { complaintId, status },
        { headers: { "x-auth-token": token } }
      );
      alert("Status updated!");
      setComplaints((prev) =>
        prev.map((c) => (c._id === complaintId ? { ...c, status } : c))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  if (loading) return <p>Loading complaints...</p>;
  if (error) return <p>{error}</p>;
  if (complaints.length === 0) return <p>No complaints found.</p>;

  return (
    <div style={{ padding: "2rem", fontFamily: "Poppins, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
        Complaints List
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {complaints.map((c) => (
          <div
            key={c._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "1rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h3>{c.title}</h3>
            <p>{c.description}</p>
            <p>
              <strong>Category:</strong> {c.category} | <strong>Priority:</strong>{" "}
              {c.priority} | <strong>Status:</strong> {c.status}
            </p>
            {c.assigned_to ? (
              <p>
                <strong>Assigned to:</strong> {c.assigned_to.name} ({c.assigned_to.email})
              </p>
            ) : (
              <p><em>Not assigned yet</em></p>
            )}
            {c.location?.latitude && c.location?.longitude && (
              <p>
                <strong>Location:</strong> Lat {c.location.latitude.toFixed(5)}, Lng{" "}
                {c.location.longitude.toFixed(5)}
              </p>
            )}
            {c.photo_url && (
              <img
                src={c.photo_url}
                alt="Complaint"
                style={{ width: "100%", marginTop: "0.5rem", borderRadius: "8px" }}
              />
            )}

            {/* Admin Assign Dropdown */}
            {userRole === "admin" && !c.assigned_to && (
              <div style={{ marginTop: "1rem" }}>
                <label>Assign to Staff:</label>
                <select
                  onChange={(e) => handleAssign(c._id, e.target.value)}
                  defaultValue=""
                  style={{ marginLeft: "0.5rem" }}
                >
                  <option value="" disabled>Select staff</option>
                  {staffList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Update Dropdown (Staff/Admin) */}
            {(userRole === "staff" || userRole === "admin") && c.assigned_to && (
              <div style={{ marginTop: "1rem" }}>
                <label>Update Status:</label>
                <select
                  value={c.status}
                  onChange={(e) => handleStatusChange(c._id, e.target.value)}
                  style={{ marginLeft: "0.5rem" }}
                >
                  {["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplaintsList;

