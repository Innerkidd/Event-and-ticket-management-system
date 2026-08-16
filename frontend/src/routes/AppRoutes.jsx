import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '../components/common/PublicLayout';
import DiscoverPage from '../pages/DiscoverPage';
import EventDetailsPage from '../pages/EventDetailsPage';
import BookingPage from '../pages/BookingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AccountPage from '../pages/AccountPage';
import OrganizerApplicationPage from '../pages/OrganizerApplicationPage';
import ProtectedRoute from './ProtectedRoute';

// Admin Shell & Views
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminOrganizers from '../pages/admin/AdminOrganizers';
import AdminEvents from '../pages/admin/AdminEvents';
import AdminBookings from '../pages/admin/AdminBookings';
import AdminPayments from '../pages/admin/AdminPayments';
import AdminReports from '../pages/admin/AdminReports';

// Organizer Shell & Views
import OrganizerLayout from '../components/organizer/OrganizerLayout';
import OrganizerDashboard from '../pages/organizer/OrganizerDashboard';
import OrganizerEvents from '../pages/organizer/OrganizerEvents';
import OrganizerCreateEvent from '../pages/organizer/OrganizerCreateEvent';
import OrganizerTickets from '../pages/organizer/OrganizerTickets';
import OrganizerBookings from '../pages/organizer/OrganizerBookings';
import OrganizerStaff from '../pages/organizer/OrganizerStaff';
import OrganizerAttendance from '../pages/organizer/OrganizerAttendance';
import OrganizerAnalytics from '../pages/organizer/OrganizerAnalytics';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public & Attendee Shell Layout (Single Header + Footer) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<DiscoverPage />} />
        <Route path="/events" element={<DiscoverPage />} />
        <Route path="/events/:id" element={<EventDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Authenticated Booking & Account Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/events/:id/book" element={<BookingPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/organizer-application" element={<OrganizerApplicationPage />} />
          <Route path="/attendee/dashboard" element={<Navigate to="/account" replace />} />
        </Route>
      </Route>

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

      {/* Protected Organizer Shell Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ORGANIZER']} />}>
        <Route element={<OrganizerLayout />}>
          <Route path="/organizer" element={<Navigate to="/organizer/dashboard" replace />} />
          <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
          <Route path="/organizer/events" element={<OrganizerEvents />} />
          <Route path="/organizer/events/create" element={<OrganizerCreateEvent />} />
          <Route path="/organizer/tickets" element={<OrganizerTickets />} />
          <Route path="/organizer/bookings" element={<OrganizerBookings />} />
          <Route path="/organizer/staff" element={<OrganizerStaff />} />
          <Route path="/organizer/attendance" element={<OrganizerAttendance />} />
          <Route path="/organizer/analytics" element={<OrganizerAnalytics />} />
        </Route>
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
