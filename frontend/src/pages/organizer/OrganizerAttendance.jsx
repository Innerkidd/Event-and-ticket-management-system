import React, { useState, useEffect } from 'react';
import { UserCheck, Users, Calendar, CheckCircle2, Clock } from 'lucide-react';
import organizerService from '../../services/organizerService';
import eventService from '../../services/eventService';
import StatusBadge from '../../components/admin/StatusBadge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const OrganizerAttendance = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const eventsData = await organizerService.getMyEvents();
      const loadedEvents = eventsData && eventsData.length > 0 ? eventsData : await eventService.getPublishedEvents();
      setEvents(loadedEvents);
      if (loadedEvents.length > 0) {
        setSelectedEventId(String(loadedEvents[0].id));
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
      const fetchAttendance = async () => {
        try {
          const data = await organizerService.getAttendance(selectedEventId);
          setAttendanceData(data);
        } catch (err) {
          console.warn('Error fetching attendance for event:', selectedEventId);
        }
      };
      fetchAttendance();
    }
  }, [selectedEventId]);

  const selectedEvent = events.find((e) => String(e.id) === String(selectedEventId));
  const registeredCount = attendanceData?.registeredCount || selectedEvent?.total_tickets || 100;
  const checkedInCount = attendanceData?.checkedInCount || 0;
  const remainingCount = Math.max(0, registeredCount - checkedInCount);
  const attendancePercent = Math.min(100, Math.round((checkedInCount / registeredCount) * 100)) || 0;
  const attendeesList = attendanceData?.attendees || [];

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
              <option key={evt.id} value={evt.id}>{evt.name || evt.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Large Attendance Metric Cards */}
      <div className="stats-grid">
        <div className="admin-stat-card">
          <span className="stat-label">Total Registered</span>
          <span className="stat-value">{registeredCount}</span>
          <span className="stat-subtitle">Confirmed ticket passes</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-label">Checked In</span>
          <span className="stat-value" style={{ color: '#34d399' }}>{checkedInCount}</span>
          <span className="stat-subtitle">Scanned at venue doors</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-label">Remaining</span>
          <span className="stat-value" style={{ color: '#fbbf24' }}>{remainingCount}</span>
          <span className="stat-subtitle">Awaiting arrival</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-label">Turnout Rate</span>
          <span className="stat-value" style={{ color: '#818cf8' }}>{attendancePercent}%</span>
          <span className="stat-subtitle">Live venue attendance</span>
        </div>
      </div>

      {/* Attendance Check-in Table */}
      <div className="admin-section-card">
        <div className="section-card-header">
          <h3>Attendee Gate Check-in Status</h3>
          {selectedEvent && <span className="results-count">{selectedEvent.name || selectedEvent.title}</span>}
        </div>

        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <Skeleton height="50px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="50px" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadInitialData} />
        ) : attendeesList.length === 0 ? (
          <EmptyState message="No attendee check-in records available for this event." />
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
                </tr>
              </thead>
              <tbody>
                {attendeesList.map((att) => (
                  <tr key={att.id}>
                    <td style={{ fontWeight: 600 }}>{att.name}</td>
                    <td style={{ fontWeight: 700 }}>{att.bookingId}</td>
                    <td>{att.quantity || 1} Pass(es)</td>
                    <td>
                      <StatusBadge status={att.status || 'NOT_CHECKED_IN'} />
                    </td>
                    <td>{att.checkedInAt || '—'}</td>
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
