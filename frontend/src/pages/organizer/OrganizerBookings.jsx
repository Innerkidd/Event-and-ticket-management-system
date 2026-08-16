import React, { useState, useEffect } from 'react';
import { Search, Eye, AlertCircle } from 'lucide-react';
import organizerService from '../../services/organizerService';
import StatusBadge from '../../components/admin/StatusBadge';
import DetailDrawer from '../../components/admin/DetailDrawer';
import Pagination from '../../components/common/Pagination';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { formatDate } from '../../utils/formatDate';

const BOOKING_STATUSES = ['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'];

const OrganizerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [eventFilter, setEventFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [events, setEvents] = useState([]);

  // Detail Drawer state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadBookings = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: 20 };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (eventFilter) params.eventId = eventFilter;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      const data = await organizerService.getBookings(params);
      setBookings(data.bookings || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Error fetching organizer bookings:', err);
      setError('Unable to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    organizerService.getEvents({ page: 1, limit: 100 }).then((data) => {
      setEvents(data.events || []);
    }).catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    loadBookings(1);
  }, [searchTerm, statusFilter, eventFilter, fromDate, toDate]);

  const handleOpenDrawer = async (booking) => {
    setIsDrawerOpen(true);
    setDrawerLoading(true);
    setDrawerError('');
    setSelectedBooking(null);
    try {
      const detail = await organizerService.getBooking(booking.bookingId);
      setSelectedBooking(detail);
    } catch (err) {
      console.error('Error loading booking detail:', err);
      setDrawerError('Unable to load booking details.');
    } finally {
      setDrawerLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      {/* Controls & Search Header */}
      <div className="admin-controls-card">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by attendee, email, event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <div className="filter-item">
            <label className="filter-label">Event</label>
            <select
              className="form-select"
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
            >
              <option value="">All Events</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>{evt.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">Status</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {BOOKING_STATUSES.map((s) => (
                <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">From</label>
            <input
              type="date"
              className="form-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="filter-item">
            <label className="filter-label">To</label>
            <input
              type="date"
              className="form-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="admin-section-card">
        <div className="section-card-header">
          <h3>Bookings for Your Events</h3>
          <span className="results-count">{pagination.total} booking(s)</span>
        </div>

        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <Skeleton height="50px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="50px" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => loadBookings(1)} />
        ) : bookings.length === 0 ? (
          <EmptyState message="No bookings yet for your events." />
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Attendee</th>
                    <th>Event Name</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                    <th>Booking Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.bookingId}>
                      <td style={{ fontWeight: 700 }}>{b.bookingId}</td>
                      <td>
                        <div>{b.attendee || 'Attendee'}</div>
                        {b.attendeeEmail && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.attendeeEmail}</div>}
                      </td>
                      <td>{b.event}</td>
                      <td>{b.quantity} Ticket(s)</td>
                      <td style={{ fontWeight: 600 }}>₹{Number(b.amount).toLocaleString()}</td>
                      <td>{formatDate(b.bookingDate)}</td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                      <td>
                        <button onClick={() => handleOpenDrawer(b)} className="btn btn-secondary btn-sm">
                          <Eye size={14} /> Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={(p) => loadBookings(p)} />
          </>
        )}
      </div>

      {/* Booking Detail Inspection Drawer */}
      <DetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Booking Details"
      >
        {drawerError && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{drawerError}</span>
          </div>
        )}
        {drawerLoading ? (
          <div style={{ padding: '1rem' }}>
            <Skeleton height="40px" style={{ marginBottom: '0.5rem' }} />
            <Skeleton height="40px" />
          </div>
        ) : selectedBooking && (
          <div className="detail-drawer-content">
            <div className="detail-group">
              <label>Booking ID</label>
              <p>{selectedBooking.bookingId}</p>
            </div>
            <div className="detail-group">
              <label>Attendee</label>
              <p>{selectedBooking.attendee || 'Attendee'}</p>
            </div>
            <div className="detail-group">
              <label>Attendee Email</label>
              <p>{selectedBooking.attendeeEmail || '—'}</p>
            </div>
            <div className="detail-group">
              <label>Event Name</label>
              <p>{selectedBooking.event}</p>
            </div>
            <div className="detail-group">
              <label>Ticket Quantity</label>
              <p>{selectedBooking.quantity} Ticket(s)</p>
            </div>
            <div className="detail-group">
              <label>Total Amount</label>
              <p>₹{Number(selectedBooking.amount).toLocaleString()}</p>
            </div>
            <div className="detail-group">
              <label>Booking Date</label>
              <p>{formatDate(selectedBooking.bookingDate)}</p>
            </div>
            <div className="detail-group">
              <label>Status</label>
              <div><StatusBadge status={selectedBooking.status} /></div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};

export default OrganizerBookings;