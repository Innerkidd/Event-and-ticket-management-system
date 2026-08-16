import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  Ticket,
  ShoppingBag,
  Users,
  UserCheck,
  BarChart3,
  LogOut,
  Music,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/organizer/dashboard', icon: LayoutDashboard },
  { label: 'My Events', path: '/organizer/events', icon: Calendar },
  { label: 'Create Event', path: '/organizer/events/create', icon: PlusCircle },
  { label: 'Tickets', path: '/organizer/tickets', icon: Ticket },
  { label: 'Bookings', path: '/organizer/bookings', icon: ShoppingBag },
  { label: 'Staff Management', path: '/organizer/staff', icon: Users },
  { label: 'Attendance', path: '/organizer/attendance', icon: UserCheck },
  { label: 'Event Analytics', path: '/organizer/analytics', icon: BarChart3 },
];

const OrganizerSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`admin-sidebar organizer-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      {/* Sidebar Header / Brand */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon-box" style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)' }}>
            <Music size={20} color="#ffffff" />
          </div>
          <span className="brand-title">
            Event<span className="brand-highlight">Hub</span> <span className="brand-organizer-tag">ORGANIZER</span>
          </span>
        </div>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
          <X size={20} />
        </button>
      </div>

      {/* Navigation Menu Links */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">EVENT MANAGEMENT</div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              end={item.path === '/organizer/events'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active-organizer' : ''}`}
            >
              <Icon size={18} className="link-icon" />
              <span className="link-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer — User Profile & Logout */}
      <div className="sidebar-footer">
        <div className="admin-user-profile">
          <div className="admin-avatar" style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)' }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
          </div>
          <div className="admin-user-details">
            <span className="admin-name">{user?.name || user?.email || 'Organizer'}</span>
            <span className="admin-role-badge" style={{ color: '#fbbf24' }}>ORGANIZER</span>
          </div>
        </div>

        <button onClick={handleLogout} className="btn-sidebar-logout" title="Log out">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default OrganizerSidebar;
