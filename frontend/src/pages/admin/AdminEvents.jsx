import React, { useState, useEffect } from 'react';
import { Search, Calendar } from 'lucide-react';
import eventService from '../../services/eventService';
import StatusBadge from '../../components/admin/StatusBadge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { formatDate } from '../../utils/formatDate';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.getPublishedEvents();
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching admin events:', err);
      setError('Unable to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = events.filter((evt) => {
    const title = evt.name || evt.title || '';
    const venue = evt.venue || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || (evt.status || 'PUBLISHED') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-page-container">
      {/* Controls Header */}
      <div className="admin-controls-card">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by event title, venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <div className="filter-item">
            <label className="filter-label">Status</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="DRAFT">DRAFT</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Oversight Table */}
      <div className="admin-section-card">
        <div className="section-card-header">
          <h3>Platform Events Portfolio</h3>
          <span className="results-count">Showing {filteredEvents.length} event(s)</span>
        </div>

        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <Skeleton height="50px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="50px" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadEvents} />
        ) : filteredEvents.length === 0 ? (
          <EmptyState message="No events found." />
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Organizer / Host</th>
                  <th>Date & Time</th>
                  <th>Venue</th>
                  <th>Ticket Price</th>
                  <th>Available / Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((evt) => (
                  <tr key={evt.id}>
                    <td style={{ fontWeight: 600 }}>{evt.name || evt.title}</td>
                    <td>{evt.organizer || evt.artistOrHost || 'Organized Partner'}</td>
                    <td>{formatDate(evt.start_date || evt.date)}</td>
                    <td>{evt.venue}</td>
                    <td style={{ fontWeight: 600, color: '#34d399' }}>
                      {Number(evt.ticket_price || evt.price) === 0 ? 'Free' : `₹${Number(evt.ticket_price || evt.price)}`}
                    </td>
                    <td>
                      {evt.available_tickets !== undefined
                        ? `${evt.available_tickets} / ${evt.total_tickets}`
                        : `${evt.ticketsAvailable || 0} tickets`}
                    </td>
                    <td>
                      <StatusBadge status={evt.status || 'PUBLISHED'} />
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

export default AdminEvents;
