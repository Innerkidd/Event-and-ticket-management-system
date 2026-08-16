import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DiscoverPage from '../pages/DiscoverPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProtectedRoute from './ProtectedRoute';

// Admin Application Shell & Views
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminOrganizers from '../pages/admin/AdminOrganizers';
import AdminEvents from '../pages/admin/AdminEvents';
import AdminBookings from '../pages/admin/AdminBookings';
import AdminPayments from '../pages/admin/AdminPayments';
import AdminReports from '../pages/admin/AdminReports';

// Dashboard View Placeholders for non-admin roles
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

      {/* Protected Admin Shell Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/organizers" element={<AdminOrganizers />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>
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
