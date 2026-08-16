import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Award,
  Calendar,
  Ticket,
  CreditCard,
  BarChart3,
  LogOut,
  Shield,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Organizers', path: '/admin/organizers', icon: Award },
  { label: 'Events', path: '/admin/events', icon: Calendar },
  { label: 'Bookings', path: '/admin/bookings', icon: Ticket },
  { label: 'Payments', path: '/admin/payments', icon: CreditCard },
  { label: 'Reports & Statistics', path: '/admin/reports', icon: BarChart3 },
];

const AdminSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      {/* Sidebar Header / Brand */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon-box">
            <Shield size={20} color="#ffffff" />
          </div>
          <span className="brand-title">
            Event<span className="brand-highlight">Hub</span> <span className="brand-admin-tag">ADMIN</span>
          </span>
        </div>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
          <X size={20} />
        </button>
      </div>

      {/* Navigation Menu Links */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">MANAGEMENT</div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
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
          <div className="admin-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="admin-user-details">
            <span className="admin-name">{user?.name || user?.email || 'Admin User'}</span>
            <span className="admin-role-badge">ADMIN</span>
          </div>
        </div>

        <button onClick={handleLogout} className="btn-sidebar-logout" title="Log out">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
