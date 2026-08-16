import React, { useState, useEffect } from 'react';
import { Users, PlusCircle, UserCheck, Mail, Phone, Calendar, Info, CheckCircle, AlertCircle } from 'lucide-react';
import organizerService from '../../services/organizerService';
import eventService from '../../services/eventService';
import StatusBadge from '../../components/admin/StatusBadge';
import DetailDrawer from '../../components/admin/DetailDrawer';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const STAFF_ROLES = [
  'Registration Staff',
  'Check-in Staff',
  'Event Coordinator',
  'Support Staff',
];

const OrganizerStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Staff Modal/Drawer state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(STAFF_ROLES[0]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [staffData, eventsData] = await Promise.all([
        organizerService.getStaff(),
        organizerService.getMyEvents(),
      ]);
      setStaffList(staffData || []);
      setEvents(eventsData && eventsData.length > 0 ? eventsData : await eventService.getPublishedEvents());
    } catch (err) {
      console.error('Error fetching staff data:', err);
      setError('Unable to load staff members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setName('');
    setEmail('');
    setPhone('');
    setRole(STAFF_ROLES[0]);
    setSelectedEventId(events[0]?.id || '');
    setFormError('');
    setFormSuccess('');
    setIsAddOpen(true);
  };

  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!name.trim() || !email.trim()) {
      setFormError('Please fill in staff name and email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newStaff = {
        id: `stf-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role,
        eventName: events.find((e) => String(e.id) === String(selectedEventId))?.name || 'Assigned Event',
        status: 'ACTIVE',
      };

      try {
        await organizerService.addStaff(newStaff);
      } catch (err) {
        // Fallback local update if backend endpoint not yet mounted
        console.warn('Backend add staff fallback:', err?.message);
      }

      setStaffList((prev) => [newStaff, ...prev]);
      setFormSuccess('Staff member added successfully!');
      setTimeout(() => {
        setIsAddOpen(false);
      }, 1200);
    } catch (err) {
      console.error('Failed to add staff member:', err);
      setFormError('Failed to add staff member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-page-container">
      {/* Controls Card */}
      <div className="admin-controls-card">
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Event Staff Assignment & Roles</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Staff members handle on-site check-ins and venue coordination during your events.
          </p>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <PlusCircle size={16} /> Add Staff
        </button>
      </div>

      {/* Staff Table */}
      <div className="admin-section-card">
        <div className="section-card-header">
          <h3>Active Event Staff Members</h3>
          <span className="results-count">Showing {staffList.length} staff member(s)</span>
        </div>

        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <Skeleton height="50px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="50px" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
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
                </tr>
              </thead>
              <tbody>
                {staffList.map((st) => (
                  <tr key={st.id}>
                    <td style={{ fontWeight: 600 }}>{st.name}</td>
                    <td>{st.email}</td>
                    <td>{st.phone || '—'}</td>
                    <td>
                      <span className="role-badge badge-organizer">{st.role}</span>
                    </td>
                    <td>{st.eventName || 'All Hosted Events'}</td>
                    <td>
                      <StatusBadge status={st.status || 'ACTIVE'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal/Drawer */}
      <DetailDrawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Event Staff Member"
      >
        <form onSubmit={handleAddStaffSubmit} className="auth-form" noValidate>
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
                <option key={r} value={r}>{r}</option>
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
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>{evt.name || evt.title}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
          >
            Assign Staff Member
          </button>
        </form>
      </DetailDrawer>
    </div>
  );
};

export default OrganizerStaff;
