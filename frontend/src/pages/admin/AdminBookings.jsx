import React, { useState, useEffect } from 'react';
import { Search, Ticket, CheckCircle2, XCircle, Eye } from 'lucide-react';
import adminService from '../../services/adminService';
import StatCard from '../../components/admin/StatCard';
import StatusBadge from '../../components/admin/StatusBadge';
import DetailDrawer from '../../components/admin/DetailDrawer';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/formatDate';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [organizerFilter, setOrganizerFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  // Detail Drawer state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadBookings = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const query = { page: params.page || page, limit: 20 };
      if (params.search !== undefined && params.search !== '') query.search = params.search;
      if (params.status !== undefined && params.status !== 'ALL') query.status = params.status;
      if (params.organizer !== undefined && params.organizer !== '') query.organizer = params.organizer;
      if (params.dateFrom) query.from = params.dateFrom;
      if (params.dateTo) query.to = params.dateTo;

      const data = await adminService.getBookings(query);
      setBookings(data?.bookings || []);
      setSummary(data?.summary || null);
      setPagination(data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      console.error('Error fetching admin bookings:', err);
      setError('Unable to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBookings({ search: searchTerm, status: statusFilter, organizer: organizerFilter, dateFrom, dateTo, page: 1 });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, organizerFilter, dateFrom, dateTo]);

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPage(nextPage);
    loadBookings({ search: searchTerm, status: statusFilter, organizer: organizerFilter, dateFrom, dateTo, page: nextPage });
  };

  const handleRetry = () => {
    loadBookings({ search: searchTerm, status: statusFilter, organizer: organizerFilter, dateFrom, dateTo, page });
  };

  const handleOpenDrawer = async (booking) => {
    setIsDrawerOpen(true);
    setDetailLoading(true);
    setSelectedBooking(booking);
    try {
      const detail = await adminService.getBooking(booking.id);
      if (detail) setSelectedBooking(detail);
    } catch (err) {
      console.error('Error fetching booking detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      {/* Metric Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Bookings"
          value={summary?.totalBookings !== undefined ? summary.totalBookings : loading ? null : '—'}
          icon={Ticket}
          color="#818cf8"
        />
        <StatCard
          label="Tickets Sold"
          value={summary?.ticketsSold !== undefined ? summary.ticketsSold : loading ? null : '—'}
          icon={Ticket}
          color="#34d399"
        />
        <StatCard
          label="Confirmed Bookings"
          value={summary?.confirmedBookings !== undefined ? summary.confirmedBookings : loading ? null : '—'}
          icon={CheckCircle2}
          color="#10b981"
        />
        <StatCard
          label="Cancelled Bookings"
          value={summary?.cancelledBookings !== undefined ? summary.cancelledBookings : loading ? null : '—'}
          icon={XCircle}
          color="#f43f5e"
        />
      </div>

      {/* Controls & Search Header */}
      <div className="admin-controls-card">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by Booking ID, attendee, event..."
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
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PENDING">PENDING</option>
              <option value="CANCELLED">CANCELLED</option>
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

      {/* Main Bookings Table */}
      <div className="admin-section-card">
        <div className="section-card-header">
          <h3>Platform Booking Transactions</h3>
          <span className="results-count">Showing {bookings.length} record(s)</span>
        </div>

        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <Skeleton height="50px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="50px" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={handleRetry} />
        ) : bookings.length === 0 ? (
          <EmptyState message="No booking records available." />
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Attendee</th>
                  <th>Event</th>
                  <th>Organizer</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                  <th>Booking Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 700 }}>{b.id}</td>
                    <td>{b.attendee_name || b.attendee_email}</td>
                    <td>{b.event_name}</td>
                    <td>{b.organizer_name || '—'}</td>
                    <td>{b.quantity}</td>
                    <td style={{ fontWeight: 600 }}>₹{b.total_amount || 0}</td>
                    <td>{formatDate(b.created_at)}</td>
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

      {/* Booking Detail Drawer */}
      <DetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Booking Transaction Details"
      >
        {detailLoading ? (
          <div style={{ padding: '1.5rem' }}>
            <Skeleton height="30px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="30px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="30px" />
          </div>
        ) : selectedBooking && (
          <div className="detail-drawer-content">
            <div className="detail-group">
              <label>Booking ID</label>
              <p>{selectedBooking.id}</p>
            </div>
            <div className="detail-group">
              <label>Attendee Name / Email</label>
              <p>{selectedBooking.attendee_name || selectedBooking.attendee_email}</p>
            </div>
            <div className="detail-group">
              <label>Event Title</label>
              <p>{selectedBooking.event_name}</p>
            </div>
            <div className="detail-group">
              <label>Organizer</label>
              <p>{selectedBooking.organizer_name || '—'}</p>
            </div>
            <div className="detail-group">
              <label>Ticket Quantity</label>
              <p>{selectedBooking.quantity} Ticket(s)</p>
            </div>
            <div className="detail-group">
              <label>Total Transaction Amount</label>
              <p>₹{selectedBooking.total_amount || 0}</p>
            </div>
            <div className="detail-group">
              <label>Booking Date</label>
              <p>{formatDate(selectedBooking.created_at)}</p>
            </div>
            <div className="detail-group">
              <label>Current Status</label>
              <div><StatusBadge status={selectedBooking.status} /></div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};

export default AdminBookings;