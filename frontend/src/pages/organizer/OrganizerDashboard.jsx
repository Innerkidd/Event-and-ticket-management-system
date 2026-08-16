import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Ticket, ShoppingBag, ArrowRight, UserCheck, PlusCircle, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import organizerService from '../../services/organizerService';
import eventService from '../../services/eventService';
import StatCard from '../../components/admin/StatCard';
import StatusBadge from '../../components/admin/StatusBadge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { formatDate } from '../../utils/formatDate';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, eventsData, bookingsData] = await Promise.all([
        organizerService.getDashboardStats(),
        organizerService.getMyEvents(),
        organizerService.getBookings(),
      ]);

      setStats(statsData);
      setEvents(eventsData && eventsData.length > 0 ? eventsData : await eventService.getPublishedEvents());
      setRecentBookings(bookingsData || []);
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

  const upcomingEvent = events && events.length > 0 ? events[0] : null;

  return (
    <div className="admin-page-container">
      {/* Welcome Banner */}
      <div className="admin-welcome-banner">
        <h2>Welcome back, {user?.name || 'Organizer'}</h2>
        <p>Here's what's happening with your concert & party events.</p>
      </div>

      {/* Summary Cards Row */}
      <div className="stats-grid">
        <StatCard
          label="My Events"
          value={events ? events.length : loading ? null : '—'}
          icon={Calendar}
          color="#fbbf24"
        />
        <StatCard
          label="Total Tickets Sold"
          value={stats?.ticketsSold !== undefined ? stats.ticketsSold : loading ? null : '—'}
          icon={Ticket}
          color="#34d399"
        />
        <StatCard
          label="Tickets Available"
          value={stats?.ticketsAvailable !== undefined ? stats.ticketsAvailable : loading ? null : '—'}
          icon={Ticket}
          color="#818cf8"
        />
        <StatCard
          label="Total Bookings"
          value={recentBookings ? recentBookings.length : loading ? null : '—'}
          icon={ShoppingBag}
          color="#ec4899"
        />
      </div>

      {/* Featured Upcoming Event Section */}
      {upcomingEvent && (
        <div className="admin-section-card" style={{ marginBottom: '1.75rem', padding: '1.5rem' }}>
          <div className="section-card-header" style={{ padding: '0 0 1rem 0', borderBottom: '1px solid var(--border-color)' }}>
            <h3>Upcoming Featured Event</h3>
            <StatusBadge status={upcomingEvent.status || 'PUBLISHED'} />
          </div>

          <div className="upcoming-event-banner-content" style={{ marginTop: '1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {upcomingEvent.image && (
              <div style={{ width: '140px', height: '90px', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0 }}>
                <img src={upcomingEvent.image} alt={upcomingEvent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: '240px' }}>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>{upcomingEvent.name || upcomingEvent.title}</h4>
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} /> {formatDate(upcomingEvent.start_date || upcomingEvent.date)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} /> {upcomingEvent.venue}
                </span>
                <span style={{ fontWeight: 700, color: '#34d399' }}>
                  {Number(upcomingEvent.ticket_price || upcomingEvent.price) === 0 ? 'Free' : `₹${Number(upcomingEvent.ticket_price || upcomingEvent.price)}`}
                </span>
              </div>
            </div>
            <Link to="/organizer/events" className="btn btn-primary">
              Manage Event <ArrowRight size={16} />
            </Link>
          </div>
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
          ) : recentBookings.length === 0 ? (
            <EmptyState message="No recent bookings for your events." />
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
                  {recentBookings.slice(0, 5).map((b) => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 600 }}>{b.attendeeName || b.userEmail || 'Attendee'}</td>
                      <td>{b.eventName || b.eventTitle}</td>
                      <td>{b.quantity || 1}</td>
                      <td>
                        <StatusBadge status={b.status || 'CONFIRMED'} />
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
                  {stats?.registeredCount !== undefined ? stats.registeredCount : '—'}
                </h4>
              </div>
              <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Checked In</span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem', color: '#34d399' }}>
                  {stats?.checkedInCount !== undefined ? stats.checkedInCount : '—'}
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
