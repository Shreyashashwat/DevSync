import React, { useState, useEffect } from "react";
import axios from "axios";

const COLORS = {
  violetDark: "#2e1834",
  violetMid: "#4B0082",
  gold: "#CC9901",
  white: "#ffffff",
};

const ComplaintForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Other",
    priority: "Low",
    address: "",
    latitude: null,
    longitude: null,
    photo: null,
  });
  const [preview, setPreview] = useState(null);

  // Automatically get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData((prev) => ({ ...prev, latitude, longitude }));
      },
      (err) => {
        console.error("Location access denied", err);
        alert("Please allow location access to submit a complaint.");
      }
    );
  }, []);

  // Handle text input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle photo upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, photo: file });
    setPreview(URL.createObjectURL(file));
  };

  // Handle location refresh
  const refreshLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData((prev) => ({ ...prev, latitude, longitude }));
        alert("Location updated!");
      },
      (err) => alert("Unable to get location. Please allow access.")
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.latitude || !formData.longitude) {
      alert("Unable to fetch your location. Please allow location access.");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("priority", formData.priority);
    data.append("address", formData.address);
    data.append("latitude", formData.latitude);
    data.append("longitude", formData.longitude);
    if (formData.photo) data.append("photo", formData.photo);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in!");
        return;
      }
      const res = await axios.post(
         "http://localhost:5000/api/complaints",
           data,
        {
        headers: {
      Authorization: `Bearer ${token}`}}
);

      alert(res.data.message || "Complaint submitted successfully!");
      setFormData({
        title: "",
        description: "",
        category: "Other",
        priority: "Low",
        address: "",
        latitude: formData.latitude,
        longitude: formData.longitude,
        photo: null,
      });
      setPreview(null);
    } catch (err) {
       console.error("Complaint submission error:", err.response?.data || err.message);
      alert("Error submitting complaint"+ (err.response?.data?.message || err.message));
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: `linear-gradient(135deg, ${COLORS.violetDark}, ${COLORS.violetMid})`,
        padding: "1rem",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div
        style={{
          background: COLORS.white,
          borderRadius: "1rem",
          padding: "2rem",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 0 25px rgba(0,0,0,0.4)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: COLORS.violetDark,
            marginBottom: "1.5rem",
          }}
        >
          Submit a Complaint
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <label style={{ color: COLORS.violetDark }}>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Complaint Title"
            required
            style={{
              width: "100%",
              padding: "0.8rem",
              marginBottom: "1rem",
              borderRadius: "8px",
              border: `1px solid ${COLORS.violetDark}`,
            }}
          />

          {/* Description */}
          <label style={{ color: COLORS.violetDark }}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Complaint Description"
            rows={5}
            required
            style={{
              width: "100%",
              padding: "0.8rem",
              marginBottom: "1rem",
              borderRadius: "8px",
              border: `1px solid ${COLORS.violetDark}`,
            }}
          />

          {/* Category */}
          <label style={{ color: COLORS.violetDark }}>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "0.8rem",
              marginBottom: "1rem",
              borderRadius: "8px",
              border: `1px solid ${COLORS.violetDark}`,
            }}
          >
            <option value="Infrastructure">Infrastructure</option>
            <option value="Sanitation">Sanitation</option>
            <option value="Water">Water</option>
            <option value="Electricity">Electricity</option>
            <option value="Other">Other</option>
          </select>

          {/* Priority */}
          <label style={{ color: COLORS.violetDark }}>Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "0.8rem",
              marginBottom: "1rem",
              borderRadius: "8px",
              border: `1px solid ${COLORS.violetDark}`,
            }}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          {/* Address */}
          <label style={{ color: COLORS.violetDark }}>Address (optional)</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Your Address"
            style={{
              width: "100%",
              padding: "0.8rem",
              marginBottom: "1rem",
              borderRadius: "8px",
              border: `1px solid ${COLORS.violetDark}`,
            }}
          />

          {/* Photo Upload */}
          <label style={{ color: COLORS.violetDark }}>Photo (optional)</label>
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              style={{ width: "100%", marginTop: "0.5rem", borderRadius: "8px" }}
            />
          )}

          {/* Location */}
          {formData.latitude && formData.longitude && (
            <p style={{ marginTop: "1rem", color: COLORS.violetDark }}>
              Your location: Latitude {formData.latitude.toFixed(5)}, Longitude{" "}
              {formData.longitude.toFixed(5)}
            </p>
          )}

          <button
            type="button"
            onClick={refreshLocation}
            style={{
              margin: "0.5rem 0 1rem 0",
              padding: "0.5rem 1rem",
              backgroundColor: COLORS.gold,
              color: COLORS.violetDark,
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Confirm/Update Location
          </button>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.8rem",
              backgroundColor: COLORS.violetDark,
              color: COLORS.white,
              fontWeight: "bold",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Submit Complaint
          </button>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;



