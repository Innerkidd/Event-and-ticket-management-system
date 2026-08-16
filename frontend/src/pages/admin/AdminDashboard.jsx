import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Award, Calendar, Ticket, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import StatCard from '../../components/admin/StatCard';
import StatusBadge from '../../components/admin/StatusBadge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { formatDate } from '../../utils/formatDate';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pendingApps, setPendingApps] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardData, appsData] = await Promise.all([
        adminService.getDashboard(),
        adminService.getOrganizerApplications({ status: 'PENDING', page: 1, limit: 5 }),
      ]);

      setStats(dashboardData?.stats || null);
      setRecentEvents(dashboardData?.recentEvents || []);
      setPendingApps(appsData?.applications || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="admin-page-container">
      {/* Welcome Banner */}
      <div className="admin-welcome-banner">
        <h2>Good morning, {user?.name || 'Admin'}</h2>
        <p>Here's what's happening across the platform.</p>
      </div>

      {/* Summary Cards Row */}
      <div className="stats-grid">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers !== undefined ? stats.totalUsers : loading ? null : '—'}
          icon={Users}
          color="#818cf8"
        />
        <StatCard
          label="Organizers"
          value={stats?.totalOrganizers !== undefined ? stats.totalOrganizers : loading ? null : '—'}
          icon={Award}
          color="#fbbf24"
        />
        <StatCard
          label="Published Events"
          value={stats?.publishedEvents !== undefined ? stats.publishedEvents : loading ? null : '—'}
          icon={Calendar}
          color="#34d399"
        />
        <StatCard
          label="Total Bookings"
          value={stats?.totalBookings !== undefined ? stats.totalBookings : loading ? null : '—'}
          icon={Ticket}
          color="#f43f5e"
        />
        <StatCard
          label="Pending Applications"
          value={stats?.pendingOrganizerApplications !== undefined ? stats.pendingOrganizerApplications : loading ? null : '—'}
          icon={UserCheck}
          color="#f59e0b"
        />
      </div>

      {error && <ErrorState message={error} onRetry={loadDashboardData} />}

      {/* Pending Applications & Recent Events Grid */}
      <div className="dashboard-sections-grid">
        {/* Pending Organizer Applications Preview */}
        <div className="admin-section-card">
          <div className="section-card-header">
            <h3>Pending Organizer Applications</h3>
            <Link to="/admin/organizers" className="section-link">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '1rem' }}>
              <Skeleton height="40px" style={{ marginBottom: '0.5rem' }} />
              <Skeleton height="40px" />
            </div>
          ) : pendingApps.length === 0 ? (
            <EmptyState message="No pending organizer applications." />
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApps.map((app) => (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 600 }}>{app.full_name}</td>
                      <td>{app.email}</td>
                      <td>
                        <StatusBadge status={app.status || 'PENDING'} />
                      </td>
                      <td>
                        <Link to="/admin/organizers" className="btn btn-secondary btn-sm">
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Events Preview */}
        <div className="admin-section-card">
          <div className="section-card-header">
            <h3>Recent Events</h3>
            <Link to="/admin/events" className="section-link">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '1rem' }}>
              <Skeleton height="40px" style={{ marginBottom: '0.5rem' }} />
              <Skeleton height="40px" />
            </div>
          ) : recentEvents.length === 0 ? (
            <EmptyState message="No published events found." />
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.slice(0, 5).map((evt) => (
                    <tr key={evt.id}>
                      <td style={{ fontWeight: 600 }}>{evt.name}</td>
                      <td>{formatDate(evt.start_date)}</td>
                      <td>
                        <StatusBadge status={evt.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-section-card" style={{ marginTop: '1.75rem' }}>
        <div className="section-card-header">
          <h3>Quick Actions</h3>
        </div>
        <div className="quick-actions-grid">
          <Link to="/admin/organizers" className="quick-action-btn">
            <Award size={20} color="#fbbf24" />
            <span>Review Organizer Applications</span>
          </Link>
          <Link to="/admin/users" className="quick-action-btn">
            <Users size={20} color="#818cf8" />
            <span>Manage Users</span>
          </Link>
          <Link to="/admin/events" className="quick-action-btn">
            <Calendar size={20} color="#34d399" />
            <span>Monitor Events</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;