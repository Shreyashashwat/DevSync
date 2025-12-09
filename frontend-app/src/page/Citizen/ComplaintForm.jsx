import React, { useState, useEffect } from "react";
import axios from "axios";
import { classifyComplaintAI } from "../../api/ai";

const ComplaintForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    latitude: null,
    longitude: null,
    photo: null,
  });

  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ✅ GEOLOCATION
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData((prev) => ({ ...prev, latitude, longitude }));
      },
      () => alert("Please enable location access.")
    );
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, photo: file });
    setPreview(URL.createObjectURL(file));
  };

  const refreshLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData((prev) => ({ ...prev, latitude, longitude }));
        alert("Location updated!");
      },
      () => alert("Unable to refresh location")
    );
  };

  // ✅ SUBMIT WITH AI
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.latitude || !formData.longitude) {
      alert("Location needed");
      return;
    }

    if (!formData.description.trim()) {
      alert("Description required");
      return;
    }

    setSubmitting(true);

    try {
      // ✅ AUTO AI CATEGORY & PRIORITY
      const ai = await classifyComplaintAI(formData.description);

      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", ai.category);
      data.append("priority", ai.priority);
      data.append("address", formData.address || "");
      data.append("latitude", formData.latitude);
      data.append("longitude", formData.longitude);
      if (formData.photo) data.append("photo", formData.photo);

      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/complaints",
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Complaint Submitted");

      setFormData((prev) => ({
        title: "",
        description: "",
        address: "",
        latitude: prev.latitude,
        longitude: prev.longitude,
        photo: null,
      }));
      setPreview(null);
    } catch (err) {
      alert("❌ Error submitting complaint");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-4 font-poppins">
      <div className="bg-white rounded-xl p-8 shadow-2xl w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold text-green-900 mb-6">
          Submit a Complaint
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* TITLE */}
          <div>
            <label className="text-green-900 font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-3 border border-green-700 rounded-lg text-black
              focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-green-900 font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
              className="w-full p-3 border border-green-700 rounded-lg text-black
              focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* ADDRESS */}
          <div>
            <label className="text-green-900 font-medium">Address (optional)</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-3 border border-green-700 rounded-lg text-black"
            />
          </div>

          {/* PHOTO */}
          <div>
            <label className="text-green-900 font-medium">Photo (optional)</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
            {preview && (
              <img src={preview} alt="Preview" className="w-full mt-2 rounded-lg" />
            )}
          </div>

          {/* LOCATION */}
          {formData.latitude && (
            <p className="text-green-900 text-sm">
              Location: {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
            </p>
          )}

          <button
            type="button"
            onClick={refreshLocation}
            className="w-full bg-green-300 text-green-900 py-2 rounded-lg
            font-semibold hover:bg-green-400"
          >
            Confirm / Update Location
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-800 text-white py-3 rounded-lg
            font-bold hover:bg-green-600 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Complaint"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;
