import React, { useState, useEffect } from 'react';
import { Search, Ticket, CheckCircle2, XCircle, Eye } from 'lucide-react';
import adminService from '../../services/adminService';
import StatCard from '../../components/admin/StatCard';
import StatusBadge from '../../components/admin/StatusBadge';
import DetailDrawer from '../../components/admin/DetailDrawer';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { formatDate } from '../../utils/formatDate';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Detail Drawer state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getBookings();
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching admin bookings:', err);
      setError('Unable to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const attendee = b.attendeeName || b.userEmail || '';
    const eventName = b.eventName || b.eventTitle || '';
    const matchesSearch = attendee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (b.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || (b.status || 'CONFIRMED') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const confirmedCount = bookings.filter((b) => (b.status || 'CONFIRMED') === 'CONFIRMED').length;
  const cancelledCount = bookings.filter((b) => b.status === 'CANCELLED').length;
  const totalTicketsSold = bookings.reduce((sum, b) => sum + (Number(b.quantity) || 1), 0);

  const handleOpenDrawer = (booking) => {
    setSelectedBooking(booking);
    setIsDrawerOpen(true);
  };

  return (
    <div className="admin-page-container">
      {/* Metric Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Bookings"
          value={bookings ? bookings.length : loading ? null : '—'}
          icon={Ticket}
          color="#818cf8"
        />
        <StatCard
          label="Tickets Sold"
          value={totalTicketsSold ? totalTicketsSold : loading ? null : '—'}
          icon={Ticket}
          color="#34d399"
        />
        <StatCard
          label="Confirmed Bookings"
          value={confirmedCount ? confirmedCount : loading ? null : '—'}
          icon={CheckCircle2}
          color="#10b981"
        />
        <StatCard
          label="Cancelled Bookings"
          value={cancelledCount ? cancelledCount : loading ? null : '—'}
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
        </div>
      </div>

      {/* Main Bookings Table */}
      <div className="admin-section-card">
        <div className="section-card-header">
          <h3>Platform Booking Transactions</h3>
          <span className="results-count">Showing {filteredBookings.length} record(s)</span>
        </div>

        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <Skeleton height="50px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="50px" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadBookings} />
        ) : filteredBookings.length === 0 ? (
          <EmptyState message="No booking records available." />
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Attendee</th>
                  <th>Event</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                  <th>Booking Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 700 }}>{b.id}</td>
                    <td>{b.attendeeName || b.userEmail || 'Attendee'}</td>
                    <td>{b.eventName || b.eventTitle || 'Event'}</td>
                    <td>{b.quantity || 1} Ticket(s)</td>
                    <td style={{ fontWeight: 600 }}>₹{b.amount || b.totalPrice || 0}</td>
                    <td>{formatDate(b.createdAt || b.bookingDate)}</td>
                    <td>
                      <StatusBadge status={b.status || 'CONFIRMED'} />
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
      </div>

      {/* Booking Detail Drawer */}
      <DetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Booking Transaction Details"
      >
        {selectedBooking && (
          <div className="detail-drawer-content">
            <div className="detail-group">
              <label>Booking ID</label>
              <p>{selectedBooking.id}</p>
            </div>
            <div className="detail-group">
              <label>Attendee Name / Email</label>
              <p>{selectedBooking.attendeeName || selectedBooking.userEmail}</p>
            </div>
            <div className="detail-group">
              <label>Event Title</label>
              <p>{selectedBooking.eventName || selectedBooking.eventTitle}</p>
            </div>
            <div className="detail-group">
              <label>Organizer</label>
              <p>{selectedBooking.organizerName || 'Organized Partner'}</p>
            </div>
            <div className="detail-group">
              <label>Ticket Quantity</label>
              <p>{selectedBooking.quantity || 1} Ticket(s)</p>
            </div>
            <div className="detail-group">
              <label>Total Transaction Amount</label>
              <p>₹{selectedBooking.amount || selectedBooking.totalPrice || 0}</p>
            </div>
            <div className="detail-group">
              <label>Booking Date</label>
              <p>{formatDate(selectedBooking.createdAt || selectedBooking.bookingDate)}</p>
            </div>
            <div className="detail-group">
              <label>Current Status</label>
              <div><StatusBadge status={selectedBooking.status || 'CONFIRMED'} /></div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};

export default AdminBookings;
