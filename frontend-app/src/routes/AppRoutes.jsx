import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../components/pages/auth/Login";
import Register from "../components/pages/auth/Register";
import CitizenDashboard from "../components/pages/Citizen/CitizenDashboard";
import StaffDashboard from "../components/pages/Staff/StaffDashboard";
import AdminDashboard from "../components/pages/Admin/AdminDashboard";
import ProtectedRoute from "../components/protectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Citizen Dashboard */}
      <Routes>
  <Route path="/dashboard/citizen" element={
    <ProtectedRoute allowedRoles={["citizen"]}>
      <CitizenDashboard />
    </ProtectedRoute>
  } />

  <Route path="/dashboard/staff" element={
    <ProtectedRoute allowedRoles={["staff", "admin"]}>
      <StaffDashboard />
    </ProtectedRoute>
  } />

  <Route path="/dashboard/admin" element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  } />
</Routes>

      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

