import React, { useState, useEffect } from 'react';
import { BarChart3, LineChart, PieChart, Info } from 'lucide-react';
import adminService from '../../services/adminService';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const AdminReports = () => {
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const data = await adminService.getReports();
        setReportsData(data);
      } catch (err) {
        console.error('Error fetching admin reports:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  return (
    <div className="admin-page-container">
      {/* Information Banner */}
      <div className="auth-info-banner" style={{ marginBottom: '1.75rem' }}>
        <Info size={18} />
        <span>Platform analytics aggregation. Real data will populate automatically as analytics endpoints connect.</span>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <Skeleton height="180px" />
          <Skeleton height="180px" />
          <Skeleton height="180px" />
        </div>
      ) : reportsData ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="admin-section-card">
            <h3>User & Registration Growth</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Monthly new attendee & organizer signups.</p>
          </div>
          <div className="admin-section-card">
            <h3>Event Distribution & Categories</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Concert vs Party event breakdowns.</p>
          </div>
          <div className="admin-section-card">
            <h3>Booking & Revenue Stream</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Ticket sales and organizer fee collections.</p>
          </div>
        </div>
      ) : (
        <EmptyState
          message="Analytics & Reports Engine Ready"
        />
      )}
    </div>
  );
};

export default AdminReports;
