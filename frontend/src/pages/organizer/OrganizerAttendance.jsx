import React, { useState, useEffect } from 'react';
import { Calendar, UserCheck, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import organizerService from '../../services/organizerService';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { formatDate } from '../../utils/formatDate';

const OrganizerAttendance = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [overview, setOverview] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingId, setCheckingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const loadOverview = async (eventId) => {
    try {
      const data = await organizerService.getAttendance({ eventId });
      setOverview(data);
    } catch (err) {
      console.error('Error loading attendance overview:', err);
      setError(err.response?.data?.message || 'Unable to load attendance data.');
    }
  };

  const loadAttendees = async (eventId) => {
    try {
      const data = await organizerService.getEventAttendance(eventId);
      setAttendees(data.attendees || []);
    } catch (err) {
      console.error('Error loading attendee table:', err);
      setError(err.response?.data?.message || 'Unable to load attendance data.');
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    setActionError('');
    try {
      const eventsData = await organizerService.getEvents({ page: 1, limit: 100 });
      const loadedEvents = eventsData.events || [];
      setEvents(loadedEvents);
      if (loadedEvents.length > 0) {
        const firstId = String(loadedEvents[0].id);
        setSelectedEventId(firstId);
        await Promise.all([loadOverview(firstId), loadAttendees(firstId)]);
      }
    } catch (err) {
      console.error('Error loading attendance events:', err);
      setError('Unable to load attendance portal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      setOverview(null);
      setAttendees([]);
      setActionError('');
      Promise.all([loadOverview(selectedEventId), loadAttendees(selectedEventId)]);
    }
  }, [selectedEventId]);

  const handleCheckIn = async (bookingId) => {
    setCheckingId(bookingId);
    setActionError('');
    try {
      await organizerService.checkIn(bookingId);
      await Promise.all([loadOverview(selectedEventId), loadAttendees(selectedEventId)]);
    } catch (err) {
      console.error('Check-in failed:', err);
      setActionError(err.response?.data?.message || 'Unable to check in attendee.');
    } finally {
      setCheckingId(null);
    }
  };

  const registered = overview ? overview.registered : 0;
  const checkedIn = overview ? overview.checkedIn : 0;
  const remaining = overview ? overview.remaining : 0;
  const attendancePercent = overview ? overview.attendancePercentage : 0;

  return (
    <div className="admin-page-container">
      {/* Controls & Event Selector */}
      <div className="admin-controls-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Calendar size={20} color="#fbbf24" />
          <label className="filter-label" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Select Event:</label>
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

      {actionError && (
        <div className="auth-error-banner" role="alert" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={18} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Large Attendance Metric Cards */}
      <div className="stats-grid">
        <div className="admin-stat-card">
          <span className="stat-label">Total Registered</span>
          <span className="stat-value">{loading ? '—' : registered}</span>
          <span className="stat-subtitle">Confirmed ticket passes</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-label">Checked In</span>
          <span className="stat-value" style={{ color: '#34d399' }}>{loading ? '—' : checkedIn}</span>
          <span className="stat-subtitle">Scanned at venue doors</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-label">Remaining</span>
          <span className="stat-value" style={{ color: '#fbbf24' }}>{loading ? '—' : remaining}</span>
          <span className="stat-subtitle">Awaiting arrival</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-label">Attendance %</span>
          <span className="stat-value" style={{ color: '#818cf8' }}>{loading ? '—' : `${attendancePercent}%`}</span>
          <span className="stat-subtitle">Live venue attendance</span>
        </div>
      </div>

      {/* Attendance Check-in Table */}
      <div className="admin-section-card">
        <div className="section-card-header">
          <h3>Attendee Gate Check-in Status</h3>
          {events.find((e) => String(e.id) === String(selectedEventId)) && (
            <span className="results-count">{events.find((e) => String(e.id) === String(selectedEventId)).name}</span>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <Skeleton height="50px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="50px" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadInitialData} />
        ) : attendees.length === 0 ? (
          <EmptyState message="No attendance data available." />
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Attendee Name</th>
                  <th>Booking ID</th>
                  <th>Tickets</th>
                  <th>Gate Status</th>
                  <th>Check-in Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((att) => (
                  <tr key={att.bookingId}>
                    <td style={{ fontWeight: 600 }}>{att.attendee || att.attendeeEmail || 'Attendee'}</td>
                    <td style={{ fontWeight: 700 }}>{att.bookingId}</td>
                    <td>{att.quantity} Pass(es)</td>
                    <td>
                      {att.checkInStatus === 'CHECKED_IN' ? (
                        <span className="role-badge badge-organizer" style={{ color: '#34d399' }}>
                          <CheckCircle2 size={12} /> CHECKED IN
                        </span>
                      ) : (
                        <span className="role-badge" style={{ color: '#fbbf24' }}>NOT CHECKED IN</span>
                      )}
                    </td>
                    <td>{att.checkedInAt ? formatDate(att.checkedInAt) : '—'}</td>
                    <td>
                      {att.checkInStatus !== 'CHECKED_IN' && (
                        <button
                          onClick={() => handleCheckIn(att.bookingId)}
                          disabled={checkingId === att.bookingId}
                          className="btn btn-primary btn-sm"
                        >
                          <UserCheck size={14} /> {checkingId === att.bookingId ? 'Checking...' : 'Check In'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerAttendance;