import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Calendar, MapPin, Search, Pencil, Rocket, AlertCircle, CheckCircle, Info } from 'lucide-react';
import organizerService from '../../services/organizerService';
import StatusBadge from '../../components/admin/StatusBadge';
import DetailDrawer from '../../components/admin/DetailDrawer';
import Pagination from '../../components/common/Pagination';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { formatEventDateTime, formatDate } from '../../utils/formatDate';

const STATUS_OPTIONS = ['ALL', 'DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'];

const OrganizerEvents = () => {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Edit drawer
  const [editEvent, setEditEvent] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Publish modal
  const [publishEvent, setPublishEvent] = useState(null);
  const [summary, setSummary] = useState(null);
  const [publishError, setPublishError] = useState('');
  const [publishMessage, setPublishMessage] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const loadEvents = async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: 20 };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const data = await organizerService.getEvents(params);
      setEvents(data.events || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Error fetching organizer events:', err);
      setError('Unable to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents(1);
    setPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (page !== 1) loadEvents(page);
  }, [page]);

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    loadEvents(nextPage);
  };

  const openEditDrawer = (evt) => {
    setEditForm({
      name: evt.name,
      description: evt.description || '',
      image: evt.image || '',
      startDate: evt.startDate ? evt.startDate.slice(0, 10) : '',
      endDate: evt.endDate ? evt.endDate.slice(0, 10) : '',
      venue: evt.venue || '',
      ticketPrice: evt.ticketPrice,
      totalTickets: evt.totalTickets,
    });
    setEditError('');
    setEditSuccess('');
    setEditEvent(evt);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    setIsSaving(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        description: editForm.description,
        image: editForm.image || null,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        venue: editForm.venue.trim(),
        ticketPrice: Number(editForm.ticketPrice),
        totalTickets: Number(editForm.totalTickets),
      };
      await organizerService.updateEvent(editEvent.id, payload);
      setEditSuccess('Event updated successfully.');
      setTimeout(() => {
        setEditEvent(null);
        loadEvents(page);
      }, 1200);
    } catch (err) {
      console.error('Error updating event:', err);
      setEditError(err.response?.data?.message || 'Unable to update event.');
    } finally {
      setIsSaving(false);
    }
  };

  const openPublishModal = async (evt) => {
    setPublishEvent(evt);
    setSummary(null);
    setPublishError('');
    setPublishMessage('');
    try {
      const summaryData = await organizerService.getPublishSummary(evt.id);
      setSummary(summaryData);
    } catch (err) {
      setPublishError(err.response?.data?.message || 'Unable to load publish summary.');
    }
  };

  const handlePayAndPublish = async () => {
    setPublishError('');
    setPublishMessage('');
    setIsPublishing(true);
    try {
      const order = await organizerService.createPublishPayment(publishEvent.id);
      await organizerService.openRazorpayCheckout(
        { key: order.keyId, orderId: order.orderId, amount: order.amount, currency: order.currency },
        {
          onSuccess: async (response) => {
            try {
              await organizerService.verifyPublishPayment(publishEvent.id, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              setPublishMessage('Payment verified! Your event is now PUBLISHED.');
              setTimeout(() => {
                setPublishEvent(null);
                loadEvents(page);
              }, 1500);
            } catch (verifyErr) {
              console.error('Payment verification failed:', verifyErr);
              setPublishError(verifyErr.response?.data?.message || 'Payment verification failed. Your event remains a draft.');
            } finally {
              setIsPublishing(false);
            }
          },
          onCancel: () => {
            setIsPublishing(false);
            setPublishError('Payment cancelled. Your event remains a draft.');
          },
        }
      );
    } catch (err) {
      console.error('Error creating publish payment:', err);
      setPublishError(err.response?.data?.message || 'Unable to publish event.');
      setIsPublishing(false);
    }
  };

  return (
    <div className="admin-page-container">
      {/* Header Actions Card */}
      <div className="admin-controls-card">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search your events by name or venue..."
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
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>
              ))}
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
          <h3>My Events</h3>
          <span className="results-count">{pagination.total} event(s)</span>
        </div>

        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <Skeleton height="60px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="60px" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => loadEvents(page)} />
        ) : events.length === 0 ? (
          <EmptyState
            message="You haven't created any events yet."
            action={
              <Link to="/organizer/events/create" className="btn btn-primary">
                <PlusCircle size={16} /> Create Your First Event
              </Link>
            }
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Event Info</th>
                    <th>Date & Time</th>
                    <th>Venue</th>
                    <th>Ticket Price</th>
                    <th>Sold / Total</th>
                    <th>Available</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((evt) => (
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
                          <span>{evt.name}</span>
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatEventDateTime(evt.startDate)}</td>
                      <td>{evt.venue}</td>
                      <td style={{ fontWeight: 600, color: '#34d399' }}>
                        {Number(evt.ticketPrice) === 0 ? 'Free' : `₹${Number(evt.ticketPrice)}`}
                      </td>
                      <td>{evt.soldTickets} / {evt.totalTickets}</td>
                      <td style={{ fontWeight: 700 }}>{evt.availableTickets}</td>
                      <td>
                        <StatusBadge status={evt.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => openEditDrawer(evt)} className="btn btn-secondary btn-sm">
                            <Pencil size={14} /> Edit
                          </button>
                          {evt.status === 'DRAFT' && (
                            <button onClick={() => openPublishModal(evt)} className="btn btn-primary btn-sm">
                              <Rocket size={14} /> Publish
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={handlePageChange} />
          </>
        )}
      </div>

      {/* Edit Event Drawer */}
      <DetailDrawer
        isOpen={!!editEvent}
        onClose={() => setEditEvent(null)}
        title={editEvent ? `Edit Event: ${editEvent.name}` : 'Edit Event'}
      >
        {editEvent && (
          <form onSubmit={handleEditSave} className="auth-form" noValidate>
            {editError && (
              <div className="auth-error-banner" role="alert">
                <AlertCircle size={18} />
                <span>{editError}</span>
              </div>
            )}
            {editSuccess && (
              <div className="auth-info-banner" role="status">
                <CheckCircle size={18} />
                <span>{editSuccess}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="editName">Event Name *</label>
              <input
                type="text"
                id="editName"
                className="form-input"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="editDescription">Description</label>
              <textarea
                id="editDescription"
                className="form-input"
                style={{ minHeight: '80px', resize: 'vertical' }}
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="editStart">Start Date *</label>
                <input
                  type="date"
                  id="editStart"
                  className="form-input"
                  value={editForm.startDate || ''}
                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="editEnd">End Date *</label>
                <input
                  type="date"
                  id="editEnd"
                  className="form-input"
                  value={editForm.endDate || ''}
                  onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="editVenue">Venue *</label>
              <input
                type="text"
                id="editVenue"
                className="form-input"
                value={editForm.venue || ''}
                onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="editPrice">Ticket Price (₹) *</label>
                <input
                  type="number"
                  id="editPrice"
                  min="1"
                  step="10"
                  className="form-input"
                  value={editForm.ticketPrice ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, ticketPrice: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="editTotal">Total Tickets *</label>
                <input
                  type="number"
                  id="editTotal"
                  min="1"
                  step="1"
                  className="form-input"
                  value={editForm.totalTickets ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, totalTickets: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
      </DetailDrawer>

      {/* Publish Event Modal */}
      <DetailDrawer
        isOpen={!!publishEvent}
        onClose={() => setPublishEvent(null)}
        title={publishEvent ? `Publish Event: ${publishEvent.name}` : 'Publish Event'}
      >
        {publishEvent && (
          <div>
            {publishError && (
              <div className="auth-error-banner" role="alert">
                <AlertCircle size={18} />
                <span>{publishError}</span>
              </div>
            )}
            {publishMessage && (
              <div className="auth-info-banner" role="status">
                <CheckCircle size={18} />
                <span>{publishMessage}</span>
              </div>
            )}

            {!summary && !publishError && (
              <div style={{ padding: '1rem' }}>
                <Skeleton height="40px" style={{ marginBottom: '0.5rem' }} />
                <Skeleton height="40px" />
              </div>
            )}

            {summary && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Ticket Price</span>
                    <span style={{ fontWeight: 600 }}>₹{Number(summary.ticketPrice).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Tickets</span>
                    <span style={{ fontWeight: 600 }}>{summary.totalTickets.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Maximum Ticket Value</span>
                    <span style={{ fontWeight: 700 }}>₹{summary.maximumTicketValue.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Platform Fee</span>
                    <span style={{ fontWeight: 600, color: '#fbbf24' }}>{summary.platformFeePercent}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem', fontSize: '1rem' }}>
                    <span style={{ fontWeight: 800 }}>Organizer Fee Payable</span>
                    <span style={{ fontWeight: 800, color: '#34d399' }}>₹{summary.organizerFee.toLocaleString()}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                  Your event is published only after the platform fee payment is verified by the backend.
                </p>

                <button
                  type="button"
                  disabled={isPublishing}
                  onClick={handlePayAndPublish}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  {isPublishing ? 'Processing...' : 'Pay & Publish Event'}
                </button>
              </>
            )}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};

export default OrganizerEvents;