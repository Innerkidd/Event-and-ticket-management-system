import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DiscoverPage from '../pages/DiscoverPage';

const EventDetailsPlaceholder = () => (
  <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#f8fafc' }}>
    <h2>Event Details Page</h2>
    <p style={{ color: '#94a3b8' }}>Event booking details view will be implemented in the next feature plan.</p>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DiscoverPage />} />
      <Route path="/events" element={<DiscoverPage />} />
      <Route path="/events/:id" element={<EventDetailsPlaceholder />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
