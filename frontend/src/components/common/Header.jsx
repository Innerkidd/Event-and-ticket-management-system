import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, LogIn, UserPlus, LogOut, ShieldCheck, LayoutDashboard, User, ChevronDown, ShoppingBag, Award, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside or pressing Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
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
            <div className="user-nav-group" ref={dropdownRef} style={{ position: 'relative' }}>
              {/* Profile Avatar Button Trigger */}
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="user-profile-badge"
                style={{ cursor: 'pointer', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', outline: 'none' }}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="admin-avatar" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
                  {getInitials(user.name)}
                </div>
                <span className="user-name" style={{ fontWeight: 600 }}>{user.name || user.email}</span>
                <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                  {user.role}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>

              {/* User Profile Dropdown Menu Popup */}
              {dropdownOpen && (
                <div className="user-dropdown-menu" style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.5rem)',
                  right: 0,
                  width: '240px',
                  background: '#0f172a',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-glass)',
                  zIndex: 250,
                  overflow: 'hidden',
                  padding: '0.5rem 0'
                }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{user.name || 'User'}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                  </div>

                  <div style={{ padding: '0.35rem 0' }}>
                    <Link
                      to="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="sidebar-link"
                      style={{ borderRadius: 0, padding: '0.6rem 1rem' }}
                    >
                      <User size={16} /> <span>My Account</span>
                    </Link>

                    <Link
                      to="/account?tab=tickets"
                      onClick={() => setDropdownOpen(false)}
                      className="sidebar-link"
                      style={{ borderRadius: 0, padding: '0.6rem 1rem' }}
                    >
                      <Ticket size={16} /> <span>My Tickets</span>
                    </Link>

                    <Link
                      to="/account?tab=bookings"
                      onClick={() => setDropdownOpen(false)}
                      className="sidebar-link"
                      style={{ borderRadius: 0, padding: '0.6rem 1rem' }}
                    >
                      <Clock size={16} /> <span>Booking History</span>
                    </Link>

                    <Link
                      to="/account?tab=application"
                      onClick={() => setDropdownOpen(false)}
                      className="sidebar-link"
                      style={{ borderRadius: 0, padding: '0.6rem 1rem' }}
                    >
                      <Award size={16} /> <span>Organizer Application</span>
                    </Link>

                    {user.role === 'ORGANIZER' && (
                      <Link
                        to="/organizer/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="sidebar-link"
                        style={{ borderRadius: 0, padding: '0.6rem 1rem', color: '#fbbf24' }}
                      >
                        <LayoutDashboard size={16} /> <span>Organizer Dashboard</span>
                      </Link>
                    )}

                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="sidebar-link"
                        style={{ borderRadius: 0, padding: '0.6rem 1rem', color: '#fb7185' }}
                      >
                        <ShieldCheck size={16} /> <span>Admin Portal</span>
                      </Link>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.35rem' }}>
                    <button
                      onClick={handleLogout}
                      className="sidebar-link"
                      style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 0, padding: '0.6rem 1rem', color: '#fb7185', textAlign: 'left' }}
                    >
                      <LogOut size={16} /> <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
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
