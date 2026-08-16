import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Calendar, MapPin, Ticket, Search } from 'lucide-react';
import organizerService from '../../services/organizerService';
import eventService from '../../services/eventService';
import StatusBadge from '../../components/admin/StatusBadge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { formatDate } from '../../utils/formatDate';

const OrganizerEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await organizerService.getMyEvents();
      setEvents(data && data.length > 0 ? data : await eventService.getPublishedEvents());
    } catch (err) {
      console.error('Error fetching organizer events:', err);
      setError('Unable to load your events.');
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
      {/* Header Actions Card */}
      <div className="admin-controls-card">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search your events by title or venue..."
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
              <option value="SOLD OUT">SOLD OUT</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <Link to="/organizer/events/create" className="btn btn-primary">
            <PlusCircle size={16} /> Create Event
          </Link>
        </div>
      </div>

      {/* Events List / Table Card */}
      <div className="admin-section-card">
        <div className="section-card-header">
          <h3>Hosted Concert & Party Events</h3>
          <span className="results-count">Showing {filteredEvents.length} event(s)</span>
        </div>

        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <Skeleton height="60px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="60px" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadEvents} />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            message="You haven't created any events yet."
            action={
              <Link to="/organizer/events/create" className="btn btn-primary">
                <PlusCircle size={16} /> Create Your First Event
              </Link>
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Event Info</th>
                  <th>Date & Time</th>
                  <th>Venue</th>
                  <th>Ticket Price</th>
                  <th>Tickets Capacity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((evt) => (
                  <tr key={evt.id}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {evt.image && (
                          <img
                            src={evt.image}
                            alt={evt.name}
                            style={{ width: '48px', height: '36px', borderRadius: '4px', objectFit: 'cover' }}
                          />
                        )}
                        <span>{evt.name || evt.title}</span>
                      </div>
                    </td>
                    <td>{formatDate(evt.start_date || evt.date)}</td>
                    <td>{evt.venue}</td>
                    <td style={{ fontWeight: 600, color: '#34d399' }}>
                      {Number(evt.ticket_price || evt.price) === 0 ? 'Free' : `₹${Number(evt.ticket_price || evt.price)}`}
                    </td>
                    <td>
                      {evt.available_tickets !== undefined
                        ? `${evt.available_tickets} available / ${evt.total_tickets} total`
                        : `${evt.total_tickets || 100} total tickets`}
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

export default OrganizerEvents;
