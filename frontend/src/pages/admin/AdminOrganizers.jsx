import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, XCircle, Eye, Info } from 'lucide-react';
import adminService from '../../services/adminService';
import StatusBadge from '../../components/admin/StatusBadge';
import DetailDrawer from '../../components/admin/DetailDrawer';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { formatDate } from '../../utils/formatDate';

const AdminOrganizers = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'active'
  const [pendingApps, setPendingApps] = useState([]);
  const [activeOrganizers, setActiveOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review Drawer state
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [appsData, orgsData] = await Promise.all([
        adminService.getOrganizerApplications({ status: 'PENDING', page: 1, limit: 20 }),
        adminService.getOrganizers(),
      ]);
      setPendingApps(appsData?.applications || []);
      setActiveOrganizers(orgsData?.organizers || []);
    } catch (err) {
      console.error('Error fetching organizers data:', err);
      setError('Unable to load organizers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDrawer = async (app) => {
    setIsDrawerOpen(true);
    setDetailLoading(true);
    setActionFeedback('');
    setSelectedApp(app);
    try {
      const detail = await adminService.getOrganizerApplication(app.id);
      if (detail) setSelectedApp(detail);
    } catch (err) {
      console.error('Error fetching application detail:', err);
      setActionFeedback('Unable to load application details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedApp(null);
    setActionFeedback('');
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    setActionLoading(true);
    setActionFeedback('');
    try {
      await adminService.approveOrganizerApplication(selectedApp.id);
      setActionFeedback('Application approved successfully!');
      setTimeout(() => {
        handleCloseDrawer();
        loadData();
      }, 1200);
    } catch (err) {
      console.error('Approval failed:', err);
      setActionFeedback(err?.response?.data?.message || 'Failed to approve application.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    setActionLoading(true);
    setActionFeedback('');
    try {
      await adminService.rejectOrganizerApplication(selectedApp.id);
      setActionFeedback('Application rejected.');
      setTimeout(() => {
        handleCloseDrawer();
        loadData();
      }, 1200);
    } catch (err) {
      console.error('Rejection failed:', err);
      setActionFeedback(err?.response?.data?.message || 'Failed to reject application.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      {/* Navigation Tabs Header */}
      <div className="tab-navigation">
        <button
          onClick={() => setActiveTab('pending')}
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
        >
          <Award size={16} /> Pending Applications
          {pendingApps.length > 0 && <span className="tab-badge">{pendingApps.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
        >
          Active Organizers
          {activeOrganizers.length > 0 && <span className="tab-badge">{activeOrganizers.length}</span>}
        </button>
      </div>

      {/* Tab 1: Pending Applications */}
      {activeTab === 'pending' && (
        <div className="admin-section-card">
          <div className="section-card-header">
            <h3>Pending Applications</h3>
          </div>

          {loading ? (
            <div style={{ padding: '1.5rem' }}>
              <Skeleton height="50px" style={{ marginBottom: '0.75rem' }} />
              <Skeleton height="50px" />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={loadData} />
          ) : pendingApps.length === 0 ? (
            <EmptyState message="No pending organizer applications." />
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Email</th>
                    <th>Organization</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApps.map((app) => (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 600 }}>{app.full_name}</td>
                      <td>{app.email}</td>
                      <td>{app.organization || '—'}</td>
                      <td>{formatDate(app.created_at)}</td>
                      <td>
                        <StatusBadge status={app.status || 'PENDING'} />
                      </td>
                      <td>
                        <button onClick={() => handleOpenDrawer(app)} className="btn btn-secondary btn-sm">
                          <Eye size={14} /> View
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

      {/* Tab 2: Active Organizers */}
      {activeTab === 'active' && (
        <div className="admin-section-card">
          <div className="section-card-header">
            <h3>Active Approved Organizers</h3>
          </div>

          {loading ? (
            <div style={{ padding: '1.5rem' }}>
              <Skeleton height="50px" style={{ marginBottom: '0.75rem' }} />
              <Skeleton height="50px" />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={loadData} />
          ) : activeOrganizers.length === 0 ? (
            <EmptyState message="No active organizers found." />
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Organizer</th>
                    <th>Email</th>
                    <th>Events Count</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {activeOrganizers.map((org) => (
                    <tr key={org.id}>
                      <td style={{ fontWeight: 600 }}>{org.name}</td>
                      <td>{org.email}</td>
                      <td>{org.event_count !== undefined ? org.event_count : '—'}</td>
                      <td>{formatDate(org.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Organizer Application Review Drawer */}
      <DetailDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title="Organizer Application Review"
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'flex-end' }}>
            <button onClick={handleReject} disabled={actionLoading || detailLoading} className="btn btn-danger">
              <XCircle size={16} /> Reject
            </button>
            <button onClick={handleApprove} disabled={actionLoading || detailLoading} className="btn btn-primary">
              <CheckCircle size={16} /> Approve
            </button>
          </div>
        }
      >
        {detailLoading ? (
          <div style={{ padding: '1.5rem' }}>
            <Skeleton height="30px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="30px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="30px" />
          </div>
        ) : selectedApp && (
          <div className="detail-drawer-content">
            {actionFeedback && (
              <div className={`auth-info-banner ${actionFeedback.includes('successfully') ? '' : 'banner-error'}`} style={{ marginBottom: '1.25rem' }}>
                <Info size={18} />
                <span>{actionFeedback}</span>
              </div>
            )}

            <div className="detail-group">
              <label>Applicant Full Name</label>
              <p>{selectedApp.full_name}</p>
            </div>

            <div className="detail-group">
              <label>Email Address</label>
              <p>{selectedApp.email}</p>
            </div>

            <div className="detail-group">
              <label>Phone Number</label>
              <p>{selectedApp.phone || 'Not provided'}</p>
            </div>

            <div className="detail-group">
              <label>Organization / Company</label>
              <p>{selectedApp.organization || 'Independent Organizer'}</p>
            </div>

            <div className="detail-group">
              <label>Event Hosting Experience</label>
              <p>{selectedApp.experience || 'Not specified'}</p>
            </div>

            <div className="detail-group">
              <label>Reason for Applying</label>
              <p>{selectedApp.reason || 'Not specified'}</p>
            </div>

            <div className="detail-group">
              <label>Submission Date</label>
              <p>{formatDate(selectedApp.created_at)}</p>
            </div>

            {selectedApp.admin_remarks && (
              <div className="detail-group">
                <label>Admin Remarks</label>
                <p>{selectedApp.admin_remarks}</p>
              </div>
            )}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};

export default AdminOrganizers;