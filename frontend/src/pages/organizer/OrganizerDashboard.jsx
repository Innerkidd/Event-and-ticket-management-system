import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Ticket, ShoppingBag, ArrowRight, UserCheck, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import organizerService from '../../services/organizerService';
import StatCard from '../../components/admin/StatCard';
import StatusBadge from '../../components/admin/StatusBadge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { formatDate, formatEventDateTime } from '../../utils/formatDate';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboardData = await organizerService.getDashboard();
      setData(dashboardData);
    } catch (err) {
      console.error('Failed to load organizer dashboard data:', err);
      setError('Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = data?.stats;
  const upcomingEvent = data?.upcomingEvent || null;
  const recentBookings = data?.recentBookings || [];
  const attendance = data?.attendance;

  return (
    <div className="admin-page-container">
      {/* Welcome Banner */}
      <div className="admin-welcome-banner">
        <h2>Welcome back, {user?.name || 'Organizer'}</h2>
        <p>Here's what's happening with your events.</p>
      </div>

      {/* Summary Cards Row */}
      <div className="stats-grid">
        <StatCard
          label="My Events"
          value={stats ? stats.myEvents : loading ? null : '—'}
          icon={Calendar}
          color="#fbbf24"
        />
        <StatCard
          label="Total Tickets Sold"
          value={stats ? stats.totalTicketsSold : loading ? null : '—'}
          icon={Ticket}
          color="#34d399"
        />
        <StatCard
          label="Tickets Available"
          value={stats ? stats.ticketsAvailable : loading ? null : '—'}
          icon={Ticket}
          color="#818cf8"
        />
        <StatCard
          label="Total Bookings"
          value={stats ? stats.totalBookings : loading ? null : '—'}
          icon={ShoppingBag}
          color="#ec4899"
        />
      </div>

      {/* Featured Upcoming Event Section */}
      {loading ? (
        <div className="admin-section-card" style={{ marginBottom: '1.75rem', padding: '1.5rem' }}>
          <Skeleton height="40px" style={{ marginBottom: '1rem' }} />
          <Skeleton height="80px" />
        </div>
      ) : error ? null : upcomingEvent ? (
        <div className="admin-section-card" style={{ marginBottom: '1.75rem', padding: '1.5rem' }}>
          <div className="section-card-header" style={{ padding: '0 0 1rem 0', borderBottom: '1px solid var(--border-color)' }}>
            <h3>Upcoming Featured Event</h3>
            <StatusBadge status={upcomingEvent.status} />
          </div>

          <div className="upcoming-event-banner-content" style={{ marginTop: '1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {upcomingEvent.image && (
              <div style={{ width: '140px', height: '90px', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0 }}>
                <img src={upcomingEvent.image} alt={upcomingEvent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: '240px' }}>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>{upcomingEvent.name}</h4>
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} /> {formatEventDateTime(upcomingEvent.startDate)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} /> {upcomingEvent.venue}
                </span>
                <span style={{ fontWeight: 700, color: '#34d399' }}>
                  {Number(upcomingEvent.ticketPrice) === 0 ? 'Free' : `₹${Number(upcomingEvent.ticketPrice)}`}
                </span>
              </div>
            </div>
            <Link to="/organizer/events" className="btn btn-primary">
              Manage Event <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="admin-section-card" style={{ marginBottom: '1.75rem', padding: '1.5rem' }}>
          <EmptyState
            message="No upcoming published events yet."
            action={
              <Link to="/organizer/events/create" className="btn btn-primary">
                Create Your First Event
              </Link>
            }
          />
        </div>
      )}

      {/* Grid Sections: Recent Bookings & Attendance Overview */}
      <div className="dashboard-sections-grid">
        {/* Recent Bookings Preview */}
        <div className="admin-section-card">
          <div className="section-card-header">
            <h3>Recent Event Bookings</h3>
            <Link to="/organizer/bookings" className="section-link">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '1rem' }}>
              <Skeleton height="40px" style={{ marginBottom: '0.5rem' }} />
              <Skeleton height="40px" />
            </div>
          ) : error ? (
            <ErrorState message="Unable to load recent bookings." onRetry={loadData} />
          ) : recentBookings.length === 0 ? (
            <EmptyState message="No bookings yet for your events." />
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Attendee</th>
                    <th>Event</th>
                    <th>Qty</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b.bookingId}>
                      <td style={{ fontWeight: 600 }}>{b.attendee || b.attendeeEmail || 'Attendee'}</td>
                      <td>{b.event}</td>
                      <td>{b.quantity}</td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Attendance Quick Status Overview */}
        <div className="admin-section-card">
          <div className="section-card-header">
            <h3>Attendance Check-in Overview</h3>
            <Link to="/organizer/attendance" className="section-link">
              Full View <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered</span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>
                  {loading ? '—' : attendance ? attendance.registered : 0}
                </h4>
              </div>
              <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Checked In</span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem', color: '#34d399' }}>
                  {loading ? '—' : attendance ? attendance.checkedIn : 0}
                </h4>
              </div>
            </div>

            <Link to="/organizer/attendance" className="btn btn-secondary" style={{ width: '100%' }}>
              <UserCheck size={16} /> Open Attendance Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;