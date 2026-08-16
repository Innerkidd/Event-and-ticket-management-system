import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Eye } from 'lucide-react';
import adminService from '../../services/adminService';
import StatusBadge from '../../components/admin/StatusBadge';
import DetailDrawer from '../../components/admin/DetailDrawer';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/formatDate';

const AdminPayments = () => {
  const [activeTab, setActiveTab] = useState('organizer'); // 'organizer' | 'ticket'
  const [organizerFees, setOrganizerFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  // Detail Drawer state
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadOrganizerFees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getOrganizerFees();
      setOrganizerFees(data || []);
    } catch (err) {
      console.error('Error fetching organizer fees:', err);
      setError('Unable to load organizer fee records.');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getPayments({ page: params.page || page, limit: 20 });
      setPayments(data?.payments || []);
      setPagination(data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      console.error('Error fetching admin payments:', err);
      setError('Unable to load payment records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'organizer') {
      loadOrganizerFees();
    } else {
      loadPayments({ page: 1 });
    }
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPage(nextPage);
    loadPayments({ page: nextPage });
  };

  const handleOpenDrawer = async (payment) => {
    setIsDrawerOpen(true);
    setDetailLoading(true);
    setSelectedPayment(payment);
    try {
      const detail = await adminService.getPayment(payment.id);
      if (detail) setSelectedPayment(detail);
    } catch (err) {
      console.error('Error fetching payment detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      {/* Navigation Tabs Header */}
      <div className="tab-navigation">
        <button
          onClick={() => handleTabChange('organizer')}
          className={`tab-btn ${activeTab === 'organizer' ? 'active' : ''}`}
        >
          <DollarSign size={16} /> Organizer Fees
          {organizerFees.length > 0 && <span className="tab-badge">{organizerFees.length}</span>}
        </button>
        <button
          onClick={() => handleTabChange('ticket')}
          className={`tab-btn ${activeTab === 'ticket' ? 'active' : ''}`}
        >
          <CreditCard size={16} /> Ticket Payments
          {payments.length > 0 && <span className="tab-badge">{payments.length}</span>}
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
            <ErrorState message={error} onRetry={loadOrganizerFees} />
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
            <ErrorState message={error} onRetry={() => loadPayments({ page })} />
          ) : payments.length === 0 ? (
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
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700 }}>{p.id}</td>
                      <td>{p.booking_id}</td>
                      <td>{p.attendee_name || p.attendee_email}</td>
                      <td>{p.event_name}</td>
                      <td style={{ fontWeight: 600 }}>₹{p.amount || 0}</td>
                      <td>{p.method || 'Online'}</td>
                      <td>
                        <StatusBadge status={p.status} />
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

          {!loading && !error && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}

      {/* Detail Inspection Drawer */}
      <DetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Payment Record Inspection"
      >
        {detailLoading ? (
          <div style={{ padding: '1.5rem' }}>
            <Skeleton height="30px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="30px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="30px" />
          </div>
        ) : selectedPayment && (
          <div className="detail-drawer-content">
            <div className="detail-group">
              <label>Payment ID</label>
              <p>{selectedPayment.id}</p>
            </div>
            <div className="detail-group">
              <label>Booking ID</label>
              <p>{selectedPayment.booking_id || 'N/A'}</p>
            </div>
            <div className="detail-group">
              <label>Attendee</label>
              <p>{selectedPayment.attendee_name || selectedPayment.attendee_email}</p>
            </div>
            <div className="detail-group">
              <label>Event Name</label>
              <p>{selectedPayment.event_name || 'N/A'}</p>
            </div>
            <div className="detail-group">
              <label>Amount / Fee</label>
              <p>₹{selectedPayment.amount || 0}</p>
            </div>
            <div className="detail-group">
              <label>Payment Method</label>
              <p>{selectedPayment.method || 'Card / UPI'}</p>
            </div>
            <div className="detail-group">
              <label>Payment Date</label>
              <p>{formatDate(selectedPayment.created_at)}</p>
            </div>
            <div className="detail-group">
              <label>Status</label>
              <div><StatusBadge status={selectedPayment.status} /></div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};

export default AdminPayments;