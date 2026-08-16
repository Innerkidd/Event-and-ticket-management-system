import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROUTE_INFO = {
  '/organizer/dashboard': { title: 'Organizer Dashboard', subtitle: 'How your concert & party events are performing' },
  '/organizer/events': { title: 'My Events', subtitle: 'Manage your hosted events, status, and tickets' },
  '/organizer/events/create': { title: 'Create New Event', subtitle: 'Set up concert info, pricing, and ticket capacity' },
  '/organizer/tickets': { title: 'Ticket Inventory', subtitle: 'Monitor total sales, remaining capacity, and progress' },
  '/organizer/bookings': { title: 'Event Bookings', subtitle: 'Manage attendee ticket purchases for your events' },
  '/organizer/staff': { title: 'Staff Management', subtitle: 'Assign and manage check-in staff & event coordinators' },
  '/organizer/attendance': { title: 'Event Attendance', subtitle: 'Live event-day attendee check-ins and capacity tracking' },
  '/organizer/analytics': { title: 'Event Analytics', subtitle: 'Detailed sales trends, attendance ratios, and performance' },
};

const OrganizerHeader = ({ onToggleSidebar }) => {
  const location = useLocation();
  const { user } = useAuth();

  const currentRoute = ROUTE_INFO[location.pathname] || {
    title: 'Organizer Portal',
    subtitle: 'Event management control center',
  };

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button className="mobile-toggle-btn" onClick={onToggleSidebar} aria-label="Toggle Navigation">
          <Menu size={20} />
        </button>
        <div>
          <h1 className="header-page-title">{currentRoute.title}</h1>
          <p className="header-page-subtitle">{currentRoute.subtitle}</p>
        </div>
      </div>

      <div className="admin-header-right">
        <div className="header-admin-badge">
          <Award size={14} color="#fbbf24" />
          <span>{user?.name || user?.email || 'Organizer'}</span>
          <span className="badge-organizer-tag">ORGANIZER</span>
        </div>
      </div>
    </header>
  );
};

export default OrganizerHeader;
