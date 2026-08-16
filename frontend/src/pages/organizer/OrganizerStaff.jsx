import React, { useState, useEffect } from 'react';
import { PlusCircle, Pencil, UserMinus, AlertCircle, CheckCircle } from 'lucide-react';
import organizerService from '../../services/organizerService';
import StatusBadge from '../../components/admin/StatusBadge';
import DetailDrawer from '../../components/admin/DetailDrawer';
import Pagination from '../../components/common/Pagination';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const STAFF_ROLES = [
  { value: 'REGISTRATION', label: 'Registration Staff' },
  { value: 'CHECK_IN', label: 'Check-in Staff' },
  { value: 'EVENT_COORDINATOR', label: 'Event Coordinator' },
  { value: 'SUPPORT', label: 'Support Staff' },
];

const OrganizerStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [eventFilter, setEventFilter] = useState('');

  // Add/Edit drawer state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(STAFF_ROLES[0].value);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadStaff = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: 20 };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (eventFilter) params.eventId = eventFilter;
      const data = await organizerService.getStaff(params);
      setStaffList(data.staff || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Error fetching staff data:', err);
      setError('Unable to load staff members.');
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
    loadStaff(1);
  }, [searchTerm, statusFilter, eventFilter]);

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setName('');
    setEmail('');
    setPhone('');
    setRole(STAFF_ROLES[0].value);
    setSelectedEventId(events[0]?.id ? String(events[0].id) : '');
    setFormError('');
    setFormSuccess('');
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (st) => {
    setEditingStaff(st);
    setName(st.name);
    setEmail(st.email);
    setPhone(st.phone || '');
    setRole(st.role);
    setSelectedEventId(String(st.eventId));
    setFormError('');
    setFormSuccess('');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!name.trim() || !email.trim()) {
      setFormError('Please fill in staff name and email address.');
      return;
    }
    if (!selectedEventId) {
      setFormError('Please select an event for this staff member.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        role,
        eventId: Number(selectedEventId),
      };
      if (editingStaff) {
        await organizerService.updateStaff(editingStaff.id, payload);
      } else {
        await organizerService.createStaff(payload);
      }
      setFormSuccess(editingStaff ? 'Staff member updated successfully!' : 'Staff member added successfully!');
      setTimeout(() => {
        setIsFormOpen(false);
        loadStaff(1);
      }, 1200);
    } catch (err) {
      console.error('Failed to save staff member:', err);
      setFormError(err.response?.data?.message || 'Unable to save staff member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveStaff = async (st) => {
    if (!window.confirm(`Remove ${st.name} from staff? This deactivates the member.`)) return;
    setFormError('');
    try {
      await organizerService.deleteStaff(st.id);
      loadStaff(1);
    } catch (err) {
      console.error('Failed to remove staff member:', err);
      alert(err.response?.data?.message || 'Unable to remove staff member.');
    }
  };

  return (
    <div className="admin-page-container">
      {/* Controls Card */}
      <div className="admin-controls-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
          <input
            type="text"
            className="form-input"
            style={{ maxWidth: '260px' }}
            placeholder="Search staff by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <PlusCircle size={16} /> Add Staff
        </button>
      </div>

      {/* Staff Table */}
      <div className="admin-section-card">
        <div className="section-card-header">
          <h3>Event Staff Members</h3>
          <span className="results-count">{pagination.total} staff member(s)</span>
        </div>

        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <Skeleton height="50px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="50px" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => loadStaff(1)} />
        ) : staffList.length === 0 ? (
          <EmptyState
            message="No staff members added yet."
            action={
              <button onClick={handleOpenAddModal} className="btn btn-primary">
                <PlusCircle size={16} /> Add Your First Staff Member
              </button>
            }
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Staff Role</th>
                    <th>Assigned Event</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((st) => (
                    <tr key={st.id}>
                      <td style={{ fontWeight: 600 }}>{st.name}</td>
                      <td>{st.email}</td>
                      <td>{st.phone || '—'}</td>
                      <td>
                        <span className="role-badge badge-organizer">{STAFF_ROLES.find((r) => r.value === st.role)?.label || st.role}</span>
                      </td>
                      <td>{st.eventName || '—'}</td>
                      <td>
                        <StatusBadge status={st.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleOpenEditModal(st)} className="btn btn-secondary btn-sm">
                            <Pencil size={14} /> Edit
                          </button>
                          {st.status === 'ACTIVE' && (
                            <button onClick={() => handleRemoveStaff(st)} className="btn btn-danger btn-sm">
                              <UserMinus size={14} /> Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={(p) => loadStaff(p)} />
          </>
        )}
      </div>

      {/* Add/Edit Staff Drawer */}
      <DetailDrawer
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingStaff ? 'Edit Staff Member' : 'Add Event Staff Member'}
      >
        <form onSubmit={handleFormSubmit} className="auth-form" noValidate>
          {formError && (
            <div className="auth-error-banner">
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="auth-info-banner">
              <CheckCircle size={18} />
              <span>{formSuccess}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="staffName">Full Name *</label>
            <input
              type="text"
              id="staffName"
              className="form-input"
              placeholder="e.g. Rahul Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="staffEmail">Email Address *</label>
            <input
              type="email"
              id="staffEmail"
              className="form-input"
              placeholder="staff@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="staffPhone">Phone Number</label>
            <input
              type="text"
              id="staffPhone"
              className="form-input"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="staffRole">Staff Role *</label>
            <select
              id="staffRole"
              className="form-select"
              style={{ width: '100%' }}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {STAFF_ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="assignedEvent">Assigned Event *</label>
            <select
              id="assignedEvent"
              className="form-select"
              style={{ width: '100%' }}
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              required
            >
              <option value="">Select an event...</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>{evt.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {isSubmitting ? 'Saving...' : editingStaff ? 'Save Changes' : 'Assign Staff Member'}
          </button>
        </form>
      </DetailDrawer>
    </div>
  );
};

export default OrganizerStaff;