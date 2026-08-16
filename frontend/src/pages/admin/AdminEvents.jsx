import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import adminService from '../../services/adminService';
import StatusBadge from '../../components/admin/StatusBadge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/formatDate';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [organizerFilter, setOrganizerFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  const loadEvents = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const query = { page: params.page || page, limit: 20 };
      if (params.search !== undefined && params.search !== '') query.search = params.search;
      if (params.status !== undefined && params.status !== 'ALL') query.status = params.status;
      if (params.organizer !== undefined && params.organizer !== '') query.organizer = params.organizer;
      if (params.dateFrom) query.from = params.dateFrom;
      if (params.dateTo) query.to = params.dateTo;

      const data = await adminService.getEvents(query);
      setEvents(data?.events || []);
      setPagination(data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      console.error('Error fetching admin events:', err);
      setError('Unable to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEvents({ search: searchTerm, status: statusFilter, organizer: organizerFilter, dateFrom, dateTo, page: 1 });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, organizerFilter, dateFrom, dateTo]);

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPage(nextPage);
    loadEvents({ search: searchTerm, status: statusFilter, organizer: organizerFilter, dateFrom, dateTo, page: nextPage });
  };

  const handleRetry = () => {
    loadEvents({ search: searchTerm, status: statusFilter, organizer: organizerFilter, dateFrom, dateTo, page });
  };

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
          <div className="filter-item">
            <label className="filter-label">Organizer</label>
            <input
              type="text"
              className="form-input"
              placeholder="Organizer name / email"
              value={organizerFilter}
              onChange={(e) => setOrganizerFilter(e.target.value)}
            />
          </div>
          <div className="filter-item">
            <label className="filter-label">From</label>
            <input
              type="date"
              className="form-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="filter-item">
            <label className="filter-label">To</label>
            <input
              type="date"
              className="form-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Events Oversight Table */}
      <div className="admin-section-card">
        <div className="section-card-header">
          <h3>Platform Events Portfolio</h3>
          <span className="results-count">Showing {events.length} event(s)</span>
        </div>

        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <Skeleton height="50px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="50px" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={handleRetry} />
        ) : events.length === 0 ? (
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
                {events.map((evt) => (
                  <tr key={evt.id}>
                    <td style={{ fontWeight: 600 }}>{evt.name}</td>
                    <td>{evt.organizer_name || '—'}</td>
                    <td>{formatDate(evt.start_date)}</td>
                    <td>{evt.venue}</td>
                    <td style={{ fontWeight: 600, color: '#34d399' }}>
                      {Number(evt.ticket_price) === 0 ? 'Free' : `₹${Number(evt.ticket_price)}`}
                    </td>
                    <td>
                      {evt.available_tickets !== undefined
                        ? `${evt.available_tickets} / ${evt.total_tickets}`
                        : '—'}
                    </td>
                    <td>
                      <StatusBadge status={evt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default AdminEvents;