import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROUTE_INFO = {
  '/admin/dashboard': { title: 'Dashboard', subtitle: 'Platform overview and activity' },
  '/admin/users': { title: 'Users', subtitle: 'Manage platform user accounts and permissions' },
  '/admin/organizers': { title: 'Organizers', subtitle: 'Review pending applications and active organizer accounts' },
  '/admin/events': { title: 'Events', subtitle: 'Platform-wide event monitoring and oversight' },
  '/admin/bookings': { title: 'Bookings', subtitle: 'Platform-wide ticket booking transactions' },
  '/admin/payments': { title: 'Payments', subtitle: 'Platform fee structure and ticket payment logs' },
  '/admin/reports': { title: 'Reports & Statistics', subtitle: 'Platform performance metrics and analytics' },
};

const AdminHeader = ({ onToggleSidebar }) => {
  const location = useLocation();
  const { user } = useAuth();

  const currentRoute = ROUTE_INFO[location.pathname] || {
    title: 'Admin Portal',
    subtitle: 'System management center',
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
          <Shield size={14} />
          <span>{user?.name || user?.email || 'Admin'}</span>
          <span className="badge-admin-tag">ADMIN</span>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
