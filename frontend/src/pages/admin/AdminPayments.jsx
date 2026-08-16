import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Eye } from 'lucide-react';
import adminService from '../../services/adminService';
import StatusBadge from '../../components/admin/StatusBadge';
import DetailDrawer from '../../components/admin/DetailDrawer';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { formatDate } from '../../utils/formatDate';

const AdminPayments = () => {
  const [activeTab, setActiveTab] = useState('organizer'); // 'organizer' | 'ticket'
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detail Drawer state
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getPayments();
      setPayments(data || []);
    } catch (err) {
      console.error('Error fetching admin payments:', err);
      setError('Unable to load payment records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const organizerFees = payments.filter((p) => p.type === 'ORGANIZER_FEE');
  const ticketPayments = payments.filter((p) => p.type !== 'ORGANIZER_FEE');

  const handleOpenDrawer = (payment) => {
    setSelectedPayment(payment);
    setIsDrawerOpen(true);
  };

  return (
    <div className="admin-page-container">
      {/* Navigation Tabs Header */}
      <div className="tab-navigation">
        <button
          onClick={() => setActiveTab('organizer')}
          className={`tab-btn ${activeTab === 'organizer' ? 'active' : ''}`}
        >
          <DollarSign size={16} /> Organizer Fees
          {organizerFees.length > 0 && <span className="tab-badge">{organizerFees.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab('ticket')}
          className={`tab-btn ${activeTab === 'ticket' ? 'active' : ''}`}
        >
          <CreditCard size={16} /> Ticket Payments
          {ticketPayments.length > 0 && <span className="tab-badge">{ticketPayments.length}</span>}
        </button>
      </div>

      {/* Tab 1: Organizer Fees */}
      {activeTab === 'organizer' && (
        <div className="admin-section-card">
          <div className="section-card-header">
            <h3>Organizer Platform Fee Structure & Logs</h3>
          </div>

          {loading ? (
            <div style={{ padding: '1.5rem' }}>
              <Skeleton height="50px" style={{ marginBottom: '0.75rem' }} />
              <Skeleton height="50px" />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={loadPayments} />
          ) : organizerFees.length === 0 ? (
            <EmptyState message="No organizer fee payment records available." />
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Organizer</th>
                    <th>Event</th>
                    <th>Max Ticket Value</th>
                    <th>Platform Fee</th>
                    <th>Status</th>
                    <th>Payment Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {organizerFees.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.organizerName}</td>
                      <td>{p.eventName}</td>
                      <td>₹{p.maxTicketValue || 0}</td>
                      <td style={{ fontWeight: 600, color: '#34d399' }}>₹{p.platformFee || 0}</td>
                      <td>
                        <StatusBadge status={p.status || 'SUCCESS'} />
                      </td>
                      <td>{formatDate(p.createdAt || p.paymentDate)}</td>
                      <td>
                        <button onClick={() => handleOpenDrawer(p)} className="btn btn-secondary btn-sm">
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
      )}

      {/* Tab 2: Ticket Payments */}
      {activeTab === 'ticket' && (
        <div className="admin-section-card">
          <div className="section-card-header">
            <h3>Attendee Ticket Purchase Payments</h3>
          </div>

          {loading ? (
            <div style={{ padding: '1.5rem' }}>
              <Skeleton height="50px" style={{ marginBottom: '0.75rem' }} />
              <Skeleton height="50px" />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={loadPayments} />
          ) : ticketPayments.length === 0 ? (
            <EmptyState message="No ticket payment records available." />
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>Booking ID</th>
                    <th>Attendee</th>
                    <th>Event</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketPayments.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700 }}>{p.id}</td>
                      <td>{p.bookingId}</td>
                      <td>{p.attendeeName || p.userEmail}</td>
                      <td>{p.eventName}</td>
                      <td style={{ fontWeight: 600 }}>₹{p.amount}</td>
                      <td>{p.paymentMethod || 'Online'}</td>
                      <td>
                        <StatusBadge status={p.status || 'SUCCESS'} />
                      </td>
                      <td>
                        <button onClick={() => handleOpenDrawer(p)} className="btn btn-secondary btn-sm">
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
      )}

      {/* Detail Inspection Drawer */}
      <DetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Payment Record Inspection"
      >
        {selectedPayment && (
          <div className="detail-drawer-content">
            <div className="detail-group">
              <label>Payment ID</label>
              <p>{selectedPayment.id}</p>
            </div>
            <div className="detail-group">
              <label>Event Name</label>
              <p>{selectedPayment.eventName || 'N/A'}</p>
            </div>
            <div className="detail-group">
              <label>Amount / Fee</label>
              <p>₹{selectedPayment.amount || selectedPayment.platformFee || 0}</p>
            </div>
            <div className="detail-group">
              <label>Payment Method</label>
              <p>{selectedPayment.paymentMethod || 'Card / UPI'}</p>
            </div>
            <div className="detail-group">
              <label>Payment Date</label>
              <p>{formatDate(selectedPayment.createdAt || selectedPayment.paymentDate)}</p>
            </div>
            <div className="detail-group">
              <label>Status</label>
              <div><StatusBadge status={selectedPayment.status || 'SUCCESS'} /></div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};

export default AdminPayments;
