import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Award, Calendar, Ticket, ArrowRight, UserCheck, PlusCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import eventService from '../../services/eventService';
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
      // Parallel fetch for stats, applications, and events
      const [statsData, appsData, eventsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getPendingApplications(),
        eventService.getPublishedEvents(),
      ]);

      setStats(statsData);
      setPendingApps(appsData || []);
      setRecentEvents(eventsData || []);
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
          value={recentEvents ? recentEvents.length : loading ? null : '—'}
          icon={Calendar}
          color="#34d399"
        />
        <StatCard
          label="Total Bookings"
          value={stats?.totalBookings !== undefined ? stats.totalBookings : loading ? null : '—'}
          icon={Ticket}
          color="#f43f5e"
        />
      </div>

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
                  {pendingApps.slice(0, 5).map((app) => (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 600 }}>{app.name || app.applicantName}</td>
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
                    <th>Venue</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.slice(0, 5).map((evt) => (
                    <tr key={evt.id}>
                      <td style={{ fontWeight: 600 }}>{evt.name || evt.title}</td>
                      <td>{formatDate(evt.start_date || evt.date)}</td>
                      <td>{evt.venue}</td>
                      <td style={{ fontWeight: 600, color: '#34d399' }}>
                        {Number(evt.ticket_price || evt.price) === 0 ? 'Free' : `₹${Number(evt.ticket_price || evt.price)}`}
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
