// src/page/Citizen/ComplaintLifecycle.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "../../api/axiosInstance";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";

export default function ComplaintLifecycle() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editComplaint, setEditComplaint] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);

  const [timeLefts, setTimeLefts] = useState({});
  const [ratings, setRatings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("complaintRatings")) || {};
    } catch {
      return {};
    }
  });

  /* ---------------- FETCH COMPLAINTS ---------------- */

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

      const data = Array.isArray(res.data) ? res.data : [];
      setComplaints(data);

      // SLA timer
      const initialTimes = {};
      // SLA timers
      const timers = {};
      data.forEach((c) => {
        timers[c._id] = calculateTimeLeft(c.deadline);
      });



      setTimeLefts(initialTimes);

      const backendRatings = {};
      data.forEach((c) => {
        const myRatingObj = c.assigned_to?.ratings?.find(
          (r) => r.rater === localStorage.getItem("userId")
        );
        if (myRatingObj) {
          backendRatings[c._id] = myRatingObj.rating;
        }
      });

      const stored = (() => {
        try {
          return JSON.parse(localStorage.getItem("complaintRatings") || "{}");
        } catch {
          return {};
        }
      })();

      const merged = { ...stored, ...backendRatings };
      setRatings(merged);
      try {
        localStorage.setItem("complaintRatings", JSON.stringify(merged));
      } catch {  }



      
      setTimeLefts(timers);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  /* ---------------- SLA COUNTDOWN ---------------- */

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = {};
      complaints.forEach((c) => {
        updated[c._id] = calculateTimeLeft(c.deadline);
      });
      setTimeLefts(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [complaints]);

  /* ---------------- CRUD ---------------- */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this complaint?")) return;
    await axiosInstance.delete(`/api/complaints/${id}`);
    setComplaints((prev) => prev.filter((c) => c._id !== id));
  };

  const saveEdit = async () => {
    const formData = new FormData();
    formData.append("title", editComplaint.title);
    formData.append("description", editComplaint.description);
    formData.append("category", editComplaint.category);
    formData.append("priority", editComplaint.priority);

    if (editImageFile) {
      formData.append("photo", editImageFile);
    }

    const res = await axiosInstance.patch(
      `/api/complaints/${editComplaint._id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    setComplaints((prev) =>
      prev.map((c) => (c._id === res.data.complaint._id ? res.data.complaint : c))
    );

    setEditComplaint(null);
    setEditImageFile(null);
    setEditImagePreview(null);
  };

  /* ---------------- RATINGS ---------------- */

  // const submitRating = async (complaintId, rating) => {
  //   const token = localStorage.getItem("token");
  //   const complaint = complaints.find((c) => c._id === complaintId);

  //   if (!token || !complaint?.assigned_to?._id) return;

  //   try {
  //     await axios.post(
  //       `http://localhost:5000/api/users/${staffId}/rate`,
  //       { rating: ratingToSubmit },
  //       { headers: { "x-auth-token": token } }
  //     );
  //     alert("Rating submitted successfully!");
  //     await fetchComplaints(); 
  //   } catch (err) {
  //     console.error("Error submitting rating:", err);
  //     alert(err.response?.data?.message || "Failed to submit rating");
  //   }
  //   // await axios.post(
  //   //   `http://localhost:5000/api/users/${complaint.assigned_to._id}/rate`,
  //   //   { rating },
  //   //   { headers: { "x-auth-token": token } }
  //   // );

  //   setRatings((prev) => ({ ...prev, [complaintId]: rating }));
  // };

  const handleRatingChange = (complaintId, newRating) => {
    setRatings((prev) => {
      const updated = { ...prev, [complaintId]: newRating };
      try {
        localStorage.setItem("complaintRatings", JSON.stringify(updated));
      } catch { }
      return updated;
    });
  };

  const submitRating = async (complaintId, ratingValue) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to rate");
      return;
    }

    const ratingToSubmit = ratingValue ?? ratings[complaintId];
    if (!ratingToSubmit) {
      alert("Please select a rating first");
      return;
    }

    const complaint = complaints.find((c) => c._id === complaintId);
    if (!complaint || !complaint.assigned_to?._id) {
      alert("No staff assigned to this complaint");
      return;
    }

    const staffId = complaint.assigned_to._id;

    try {
      await axios.post(
        `http://localhost:5000/api/users/${staffId}/rate`,
        { rating: ratingToSubmit },
        { headers: { "x-auth-token": token } }
      );
      // alert("Rating submitted successfully!");
      await fetchComplaints(); 
    } catch (err) {
      console.error("Error submitting rating:", err);
      // alert(err.response?.data?.message || "Failed to submit rating");
    }
  };

  /* ---------------- LOADING / ERROR ---------------- */

  if (loading)
    return <p className="text-[#B4FF5A]">Loading complaints...</p>;

  if (error)
    return (
      <div className="text-[#B4FF5A]">
        <p>{error}</p>
        <button onClick={fetchComplaints}>Retry</button>
      </div>
    );

  /* ---------------- UI ---------------- */

  return (
    <>
      <div className="space-y-5 mt-4">
        {complaints.map((c) => {
          const timeLeft = timeLefts[c._id];

          return (
            <div
  key={c._id}
  className="
    bg-white/10 p-6 rounded-xl
    transition-all duration-300 ease-out
    hover:scale-[1.03]
    hover:shadow-[0_0_25px_#00ff8c55]
    hover:border hover:border-[#00ff8c]/40
  "
>

              <h3 className="text-xl font-bold">{c.title}</h3>
              <p>{c.description}</p>

              <p>Status: {c.status}</p>

              {timeLeft && (
                <p className={timeLeft.total <= 0 ? "text-red-500" : "text-yellow-400"}>
                  {timeLeft.total > 0
                    ? `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`
                    : "Deadline passed"}
                </p>
              )}

              {c.status === "OPEN" && (
                <div className="flex gap-3 mt-4">
  <button
    onClick={() => setEditComplaint(c)}
    className="
      px-4 py-1.5 rounded-md text-sm font-semibold
      text-[#B4FF5A]
      border border-[#00ff8c]/40
      bg-black/30
      transition-all duration-200
      hover:bg-[#1b543a]
      hover:text-black
      hover:shadow-[0_0_12px_#00ff8c]
      hover:scale-105 mb-2
    "
  >
    Edit
  </button>

  <button
    onClick={() => handleDelete(c._id)}
    className="
      px-4 py-1.5 rounded-md text-sm font-semibold
      text-red-400
      border border-red-400/40
      bg-black/30
      transition-all duration-200
      hover:bg-red-300
      hover:text-black
      hover:shadow-[0_0_12px_#ff4d4d]
      hover:scale-105 mb-2
    "
  >
    Delete
  </button>
</div>

              )}

              <Rating
                style={{ maxWidth: 120 }}
                value={ratings[c._id] || 0}
                onChange={
                  (r) => {submitRating(c._id, r);
                    handleRatingChange(c._id,r)
                  }

                }
              />
            </div>
          );
        })}
      </div>

      {/* EDIT MODAL */}
     {editComplaint && (
  <div className="fixed inset-0 z-50 bg-black/70 flex  justify-center">
    <div
      className="
        bg-[#00160D]
        border border-[#00ff8c]/30
        p-6 rounded-xl
        w-[450px]
        max-h-[85vh]
        overflow-y-auto
        shadow-[0_0_30px_#00ff8c33]
      "
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-[#00ff8c] text-xl font-semibold mb-4">
        Edit Complaint
      </h2>

      <input
        className="
          w-full mb-3 p-2 rounded
          bg-black/40 text-[#B4FF5A]
          border border-[#00ff8c]/30
          focus:outline-none focus:ring-1 focus:ring-[#00ff8c]
        "
        value={editComplaint.title}
        onChange={(e) =>
          setEditComplaint({ ...editComplaint, title: e.target.value })
        }
      />

      <textarea
        rows="4"
        className="
          w-full mb-3 p-2 rounded
          bg-black/40 text-[#B4FF5A]
          border border-[#00ff8c]/30
          focus:outline-none focus:ring-1 focus:ring-[#00ff8c]
        "
        value={editComplaint.description}
        onChange={(e) =>
          setEditComplaint({
            ...editComplaint,
            description: e.target.value,
          })
        }
      />

      <select
        className="
          w-full mb-3 p-2 rounded
          bg-black/40 text-[#B4FF5A]
          border border-[#00ff8c]/30
        "
        value={editComplaint.category}
        onChange={(e) =>
          setEditComplaint({
            ...editComplaint,
            category: e.target.value,
          })
        }
      >
        <option>Other</option>
        <option>Water</option>
        <option>Electricity</option>
        <option>Road</option>
      </select>

      <select
        className="
          w-full mb-3 p-2 rounded
          bg-black/40 text-[#B4FF5A]
          border border-[#00ff8c]/30
        "
        value={editComplaint.priority}
        onChange={(e) =>
          setEditComplaint({
            ...editComplaint,
            priority: e.target.value,
          })
        }
      >
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>

      <input
        type="file"
        className="mb-3 text-[#B4FF5A]"
        onChange={(e) => {
          const file = e.target.files[0];
          setEditImageFile(file);
          setEditImagePreview(URL.createObjectURL(file));
        }}
      />

      {editImagePreview && (
        <img
          src={editImagePreview}
          className="w-full h-40 object-cover rounded mb-3 border border-[#00ff8c]/30"
        />
      )}

      <div className="flex justify-end gap-3 mt-4">
        <button
          className="
            px-4 py-2 rounded
            bg-[#002b1c]
            text-[#B4FF5A]
            border border-[#00ff8c]/30
          "
          onClick={() => setEditComplaint(null)}
        >
          Cancel
        </button>

        <button
          className="
            px-4 py-2 rounded
            bg-[#00ff8c]
            text-black font-semibold
          "
          onClick={saveEdit}
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}


    </>
  );
}

/* ---------------- UTIL ---------------- */

function calculateTimeLeft(deadline) {
  if (!deadline) return { total: 0 };
  const diff = new Date(deadline) - Date.now();
  return {
    total: diff,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}
