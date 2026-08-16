import React, { useState, useEffect } from 'react';
import { BarChart3, Ticket, UserCheck, DollarSign, AlertCircle } from 'lucide-react';
import organizerService from '../../services/organizerService';
import StatCard from '../../components/admin/StatCard';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const OrganizerAnalytics = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const eventsData = await organizerService.getEvents({ page: 1, limit: 100 });
      const loadedEvents = eventsData.events || [];
      setEvents(loadedEvents);
      if (loadedEvents.length > 0) {
        setSelectedEventId(String(loadedEvents[0].id));
      }
    } catch (err) {
      console.error('Error loading analytics events:', err);
      setError('Unable to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        setAnalyticsData(null);
        try {
          const data = await organizerService.getAnalytics(selectedEventId);
          setAnalyticsData(data);
        } catch (err) {
          console.error('Error fetching analytics for event:', selectedEventId);
          setError(err.response?.data?.message || 'Unable to load analytics.');
        } finally {
          setLoading(false);
        }
      };
      fetchAnalytics();
    }
  }, [selectedEventId]);

  const selectedEvent = events.find((e) => String(e.id) === String(selectedEventId));
  const tickets = analyticsData?.tickets;
  const bookings = analyticsData?.bookings;
  const attendance = analyticsData?.attendance;
  const revenue = analyticsData?.revenue;
  const hasActivity = bookings && bookings.totalBookings > 0;

  return (
    <div className="admin-page-container">
      {/* Controls & Event Selector */}
      <div className="admin-controls-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <BarChart3 size={20} color="#ec4899" />
          <label className="filter-label" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Select Event Analytics:</label>
          <select
            className="form-select"
            style={{ minWidth: '260px', fontWeight: 600 }}
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>{evt.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="stats-grid">
          <Skeleton height="100px" />
          <Skeleton height="100px" />
          <Skeleton height="100px" />
          <Skeleton height="100px" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadInitialData} />
      ) : !analyticsData ? null : (
        <>
          {/* Overview Analytics Stat Cards */}
          <div className="stats-grid">
            <StatCard
              label="Tickets Sold"
              value={tickets.sold}
              subtitle={`Out of ${tickets.totalTickets} total capacity`}
              icon={Ticket}
              color="#34d399"
            />
            <StatCard
              label="Tickets Available"
              value={tickets.available}
              subtitle={`${tickets.salesPercentage}% sold`}
              icon={Ticket}
              color="#818cf8"
            />
            <StatCard
              label="Total Bookings"
              value={bookings.totalBookings}
              subtitle="All bookings received"
              icon={BarChart3}
              color="#fbbf24"
            />
            <StatCard
              label="Attendance"
              value={`${attendance.checkedIn} / ${attendance.registered}`}
              subtitle={`${attendance.attendancePercentage}% checked in`}
              icon={UserCheck}
              color="#ec4899"
            />
          </div>

          {/* Analytics Breakdown Grid */}
          <div className="dashboard-sections-grid">
            {/* Ticket Sales Progress Section */}
            <div className="admin-section-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Ticket Sales & Capacity Ratio</h3>
              <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600 }}>
                  <span>Sales Progress</span>
                  <span>{tickets.salesPercentage}%</span>
                </div>
                <div style={{ height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, tickets.salesPercentage)}%`,
                      height: '100%',
                      background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                      borderRadius: '5px'
                    }}
                  />
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {hasActivity
                  ? `Real-time ticket distribution for ${selectedEvent?.name || 'Selected Event'}.`
                  : 'Analytics will appear once your event has activity.'}
              </p>
            </div>

            {/* Financial Breakdown Section */}
            <div className="admin-section-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Financial Settlement Breakdown</h3>
              {hasActivity ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Gross Ticket Revenue</span>
                    <span style={{ fontWeight: 700 }}>₹{revenue.grossTicketSales.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Platform Fee Paid</span>
                    <span style={{ fontWeight: 700, color: '#fbbf24' }}>- ₹{revenue.platformFee.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem', fontSize: '1rem' }}>
                    <span style={{ fontWeight: 800 }}>Net Organizer Amount</span>
                    <span style={{ fontWeight: 800, color: '#34d399' }}>₹{revenue.netOrganizerAmount.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <EmptyState message="Analytics will appear once your event has activity." />
              )}
            </div>
          </div>

          {/* Booking Trend Section */}
          {hasActivity && (
            <div className="admin-section-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Booking Trend (Last 7 Days)</h3>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {bookings.trend.map((point) => (
                  <div
                    key={point.date}
                    style={{
                      flex: '1 1 90px',
                      background: 'var(--bg-glass)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#818cf8' }}>{point.count}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{point.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrganizerAnalytics;