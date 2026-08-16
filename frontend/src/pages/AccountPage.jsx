import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { User, Ticket, Clock, Award, LayoutDashboard, Calendar, MapPin, CheckCircle, AlertCircle, Edit, Save, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import StatusBadge from '../components/admin/StatusBadge';
import Skeleton from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import OrganizerApplicationForm from '../components/account/OrganizerApplicationForm';
import { formatDate } from '../utils/formatDate';

const AccountPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || 'profile';

  // Profile Edit Form State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Bookings / Tickets State
  const [userBookings, setUserBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Organizer Application State
  const [showAppForm, setShowAppForm] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(
    user?.role === 'ORGANIZER' ? 'APPROVED' : 'NONE'
  );

  const loadUserBookings = async () => {
    setLoadingBookings(true);
    try {
      const data = await bookingService.getUserBookings();
      setUserBookings(data || []);
    } catch (err) {
      console.warn('Error fetching user bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    loadUserBookings();
  }, []);

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileSuccess('Profile details saved.');
    setIsEditing(false);
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  const handleFormSubmitSuccess = (payload) => {
    console.log('Organizer Application Submitted Payload:', payload);
    setApplicationStatus('PENDING');
    setShowAppForm(false);
  };

  const getInitials = (userName) => {
    if (!userName) return 'U';
    const parts = userName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase();
  };

  return (
    <div className="discover-page-container" style={{ maxWidth: '1080px', paddingTop: '2rem' }}>
      {/* Account Header Banner Card */}
      <div className="admin-section-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className="admin-avatar" style={{ width: '72px', height: '72px', fontSize: '1.75rem', border: '2px solid var(--accent-primary)' }}>
            {getInitials(user?.name)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{user?.name || 'My Account'}</h1>
              <span className={`role-badge ${user?.role === 'ADMIN' ? 'badge-admin' : user?.role === 'ORGANIZER' ? 'badge-organizer' : 'badge-attendee'}`}>
                {user?.role || 'ATTENDEE'}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{user?.email}</p>
          </div>

          {user?.role === 'ORGANIZER' && (
            <Link to="/organizer/dashboard" className="btn btn-primary">
              <LayoutDashboard size={16} /> Organizer Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="tab-navigation">
        <button
          onClick={() => handleTabChange('profile')}
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
        >
          <User size={16} /> Profile
        </button>

        <button
          onClick={() => handleTabChange('tickets')}
          className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
        >
          <Ticket size={16} /> My Tickets
        </button>

        <button
          onClick={() => handleTabChange('bookings')}
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
        >
          <Clock size={16} /> Booking History
        </button>

        <button
          onClick={() => handleTabChange('application')}
          className={`tab-btn ${activeTab === 'application' ? 'active' : ''}`}
        >
          <Award size={16} /> Organizer Application
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div className="admin-section-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3>Personal Information</h3>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn btn-secondary btn-sm">
                <Edit size={14} /> Edit Profile
              </button>
            )}
          </div>

          {profileSuccess && (
            <div className="auth-info-banner" style={{ marginBottom: '1.25rem' }}>
              <CheckCircle size={18} />
              <span>{profileSuccess}</span>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="auth-form" style={{ maxWidth: '500px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="editName">Full Name</label>
                <input
                  type="text"
                  id="editName"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="editPhone">Phone Number</label>
                <input
                  type="tel"
                  id="editPhone"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Save Changes
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              <div className="detail-group">
                <label>Full Name</label>
                <p>{user?.name || 'User'}</p>
              </div>

              <div className="detail-group">
                <label>Email Address</label>
                <p>{user?.email}</p>
              </div>

              <div className="detail-group">
                <label>Phone Number</label>
                <p>{phone || 'Not provided'}</p>
              </div>

              <div className="detail-group">
                <label>Account Role</label>
                <p>{user?.role || 'ATTENDEE'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY TICKETS */}
      {activeTab === 'tickets' && (
        <div className="admin-section-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            My Booked Event Tickets
          </h3>

          {loadingBookings ? (
            <div style={{ padding: '1rem' }}>
              <Skeleton height="60px" style={{ marginBottom: '0.75rem' }} />
              <Skeleton height="60px" />
            </div>
          ) : userBookings.length === 0 ? (
            <EmptyState
              message="You haven't booked any events yet."
              action={
                <Link to="/events" className="btn btn-primary">
                  <Ticket size={16} /> Explore Concerts & Events
                </Link>
              }
            />
          ) : (
            <div className="events-grid">
              {userBookings.map((b) => (
                <div key={b.id} className="event-card" style={{ cursor: 'default' }}>
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Pass ID: {b.id}</span>
                      <StatusBadge status={b.status || 'CONFIRMED'} />
                    </div>
                    <h4 className="event-title" style={{ fontSize: '1.1rem' }}>{b.eventName || b.eventTitle}</h4>
                    <div className="event-meta-row">
                      <Calendar size={14} color="#818cf8" />
                      <span>{formatDate(b.eventDate || b.createdAt)}</span>
                    </div>
                    <div className="card-footer" style={{ marginTop: '1rem' }}>
                      <span style={{ fontWeight: 700, color: '#34d399' }}>{b.quantity || 1} Ticket Pass(es)</span>
                      <Link to={`/events/${b.eventId || ''}`} className="btn btn-secondary btn-sm">
                        View Event
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BOOKING HISTORY */}
      {activeTab === 'bookings' && (
        <div className="admin-section-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            Booking & Transaction History
          </h3>

          {loadingBookings ? (
            <div style={{ padding: '1rem' }}>
              <Skeleton height="50px" style={{ marginBottom: '0.75rem' }} />
              <Skeleton height="50px" />
            </div>
          ) : userBookings.length === 0 ? (
            <EmptyState
              message="No booking history found."
              action={
                <Link to="/events" className="btn btn-primary">
                  <Ticket size={16} /> Discover Events
                </Link>
              }
            />
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userBookings.map((b) => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 700 }}>{b.id}</td>
                      <td>{b.eventName || b.eventTitle}</td>
                      <td>{formatDate(b.createdAt || b.bookingDate)}</td>
                      <td>{b.quantity || 1} Pass(es)</td>
                      <td style={{ fontWeight: 600, color: '#34d399' }}>₹{b.totalPrice || b.amount || 0}</td>
                      <td><StatusBadge status={b.status || 'CONFIRMED'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ORGANIZER APPLICATION */}
      {activeTab === 'application' && (
        <div className="admin-section-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            Organizer Application Portal
          </h3>

          {applicationStatus === 'APPROVED' ? (
            <div style={{ background: 'var(--bg-glass)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center' }}>
              <Award size={48} color="#34d399" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>Congratulations! Your Organizer Application is Approved</h4>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 1.5rem auto' }}>
                Your organizer account is active. You can create events, manage ticket capacity, view bookings, and monitor live attendance.
              </p>
              <Link to="/organizer/dashboard" className="btn btn-primary">
                <LayoutDashboard size={18} /> Open Organizer Dashboard
              </Link>
            </div>
          ) : applicationStatus === 'PENDING' ? (
            <div style={{ background: 'var(--bg-glass)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center' }}>
              <Award size={48} color="#fbbf24" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>Status: Pending Review</h4>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto' }}>
                Your organizer application has been submitted and is awaiting administrator review.
              </p>
            </div>
          ) : applicationStatus === 'REJECTED' ? (
            <div style={{ background: 'var(--bg-glass)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center' }}>
              <Award size={48} color="#fb7185" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>Application Rejected</h4>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto' }}>
                Your organizer application was not approved.
              </p>
            </div>
          ) : showAppForm ? (
            <div>
              <button onClick={() => setShowAppForm(false)} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
                Cancel Application
              </button>
              <OrganizerApplicationForm onSubmitSuccess={handleFormSubmitSuccess} />
            </div>
          ) : (
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Host Concerts & Music Festivals</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                Become a verified Organizer to host music concerts, parties, set ticket prices, assign gate staff, and monitor live attendance.
              </p>

              <button onClick={() => setShowAppForm(true)} className="btn btn-primary">
                <Award size={18} /> Apply to Become an Organizer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountPage;
