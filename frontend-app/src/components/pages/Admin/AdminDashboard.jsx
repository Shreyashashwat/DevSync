
import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import CommentSection from "../Citizen/CommentSection";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [assignData, setAssignData] = useState({ complaintId: "", staffId: "" });
  const [expandedRow, setExpandedRow] = useState(null);

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

        const complaintRes = await axiosInstance.get("/api/complaints");
        setComplaints(Array.isArray(complaintRes.data) ? complaintRes.data : []);

        const staffRes = await axiosInstance.get("/api/users/staff");
        setStaffList(staffRes.data || []);

        setLoading(false);
      } catch (err) {
        alert("Authorization failed");
        navigate("/login");
      }
    };

    fetchData();
  }, [navigate]);

  const handleAssign = async () => {
    if (!assignData.complaintId || !assignData.staffId)
      return alert("Select complaint & staff");

    try {
      const res = await axiosInstance.patch("/api/complaints/assign", assignData);
      alert(res.data.message);

      setComplaints((prev) =>
        prev.map((c) =>
          c._id === res.data.complaint._id ? res.data.complaint : c
        )
      );

      setAssignData({ complaintId: "", staffId: "" });
    } catch {
      alert("Assign failed");
    }
  };

  if (loading)
    return (
      <div className="text-yellow-400 text-center mt-20 text-xl font-semibold">
        Loading Admin Dashboard...
      </div>
    );

  return (
    <div className="flex min-h-screen bg-[#0B0D10] text-white relative font-inter overflow-hidden">

      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 opacity-[0.12] pointer-events-none bg-[url('https://i.ibb.co/bvBWG0B/grid.png')]"></div>

      {/* GLOW EFFECTS */}
      <div className="absolute w-[380px] h-[380px] bg-green-500 blur-[150px] opacity-30 top-[-100px] left-[-100px]"></div>
      <div className="absolute w-[400px] h-[400px] bg-yellow-400 blur-[150px] opacity-25 bottom-[-120px] right-[-150px]"></div>

      {/* SIDEBAR */}
      <aside className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6 z-20">
        <h1 className="font-orbitron text-2xl text-yellow-400 text-center tracking-wider">
          Admin Panel
        </h1>

        <p className="mt-3 text-center text-white/80">👑 {username}</p>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 z-10">

        {/* ASSIGN COMPLAINT CARD */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 mb-10">
          <h2 className="font-orbitron text-xl mb-4 text-yellow-400">Assign Complaints</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={assignData.complaintId}
              onChange={(e) =>
                setAssignData({ ...assignData, complaintId: e.target.value })
              }
              className="p-3 rounded-lg bg-white/20 border border-white/30 text-white focus:ring-2 focus:ring-green-400"
            >
              <option value="">Select Complaint</option>
              {complaints.map((c) => (
                <option key={c._id} value={c._id} className="text-black">
                  {c.title} — ({c.status})
                </option>
              ))}
            </select>

            <select
              value={assignData.staffId}
              onChange={(e) =>
                setAssignData({ ...assignData, staffId: e.target.value })
              }
              className="p-3 rounded-lg bg-white/20 border border-white/30 text-white focus:ring-2 focus:ring-green-400"
            >
              <option value="">Select Staff</option>
              {staffList.map((s) => (
                <option key={s._id} value={s._id} className="text-black">
                  {s.username}
                </option>
              ))}
            </select>

            <button
              onClick={handleAssign}
              className="bg-green-400 text-black font-bold rounded-lg px-6 py-3 shadow-lg hover:bg-green-300 transition"
            >
              Assign
            </button>
          </div>
        </div>

        {/* COMPLAINT SECTION */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6">
          <h2 className="font-orbitron text-xl mb-4 text-yellow-400">
            All Complaints
          </h2>

          <div className="space-y-4">
            {complaints.map((c) => (
              <div
                key={c._id}
                className="bg-white/10 border border-white/20 rounded-xl p-4 shadow-md"
              >
                <div
                  className="flex justify-between cursor-pointer"
                  onClick={() => setExpandedRow(expandedRow === c._id ? null : c._id)}
                >
                  <div>
                    <h3 className="font-semibold text-green-300">{c.title}</h3>
                    <p className="text-sm text-white/70">
                      Status: {c.status} | Priority: {c.priority}
                    </p>
                  </div>

                  <span className="text-yellow-400">
                    {expandedRow === c._id ? "▼" : "►"}
                  </span>
                </div>

                {/* EXPANDED COMMENT UI */}
                {expandedRow === c._id && (
                  <div className="mt-4 bg-[rgba(0,40,0,0.35)] border border-[rgba(0,255,0,0.25)] rounded-lg p-4 shadow">
                    {/* ADMIN COMMENT SECTION */}
                    <CommentSection complaintId={c._id} />
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;