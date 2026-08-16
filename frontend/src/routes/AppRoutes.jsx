import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DiscoverPage from '../pages/DiscoverPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProtectedRoute from './ProtectedRoute';

// Dashboard View Placeholders
const AdminDashboard = () => (
  <div style={{ padding: '3rem 1.5rem', maxWidth: '1000px', margin: '0 auto', color: '#f8fafc' }}>
    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
    <p style={{ color: '#94a3b8' }}>Platform oversight, organizer applications, and user directory management.</p>
  </div>
);

const OrganizerDashboard = () => (
  <div style={{ padding: '3rem 1.5rem', maxWidth: '1000px', margin: '0 auto', color: '#f8fafc' }}>
    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Organizer Dashboard</h1>
    <p style={{ color: '#94a3b8' }}>Manage hosted concert/party events, staff assignments, and venue check-ins.</p>
  </div>
);

const AttendeeDashboard = () => (
  <div style={{ padding: '3rem 1.5rem', maxWidth: '1000px', margin: '0 auto', color: '#f8fafc' }}>
    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Attendee Dashboard</h1>
    <p style={{ color: '#94a3b8' }}>My booked concert passes and digital ticket wallet.</p>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<DiscoverPage />} />
      <Route path="/events" element={<DiscoverPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      {/* Protected Organizer Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ORGANIZER']} />}>
        <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
      </Route>

      {/* Protected Attendee Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ATTENDEE']} />}>
        <Route path="/attendee/dashboard" element={<AttendeeDashboard />} />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
