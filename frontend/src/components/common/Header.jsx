import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, User, LogIn, UserPlus } from 'lucide-react';

const Header = () => {
  // Check auth user state if saved in localStorage
  const savedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = savedUser ? JSON.parse(savedUser) : null;

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

        {/* Navigation / User Action Header Section */}
        <div className="header-actions">
          {user ? (
            <div className="user-profile-badge">
              <User size={16} />
              <span className="user-name">{user.name || user.email || 'User'}</span>
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
