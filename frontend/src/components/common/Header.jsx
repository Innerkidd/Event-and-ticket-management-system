import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, User, LogIn, UserPlus, LogOut, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'badge-admin';
      case 'ORGANIZER':
        return 'badge-organizer';
      default:
        return 'badge-attendee';
    }
  };

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Brand Logo & Title */}
        <Link to="/" className="brand-logo">
          <div className="logo-icon">
            <Ticket size={22} color="#ffffff" />
          </div>
          <span className="brand-title">
            Event<span className="brand-highlight">Hub</span>
          </span>
        </Link>

        {/* Header Action Section */}
        <div className="header-actions">
          {isAuthenticated && user ? (
            <div className="user-nav-group">
              {/* Role Dashboard Quick Link */}
              {user.role === 'ADMIN' && (
                <Link to="/admin/dashboard" className="btn btn-secondary btn-sm">
                  <ShieldCheck size={16} /> Admin Portal
                </Link>
              )}
              {user.role === 'ORGANIZER' && (
                <Link to="/organizer/dashboard" className="btn btn-secondary btn-sm">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
              )}

              {/* Profile Badge */}
              <div className="user-profile-badge">
                <User size={16} />
                <span className="user-name">{user.name || user.email}</span>
                <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                  {user.role}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-icon"
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary">
                <LogIn size={16} /> Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                <UserPlus size={16} /> Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
