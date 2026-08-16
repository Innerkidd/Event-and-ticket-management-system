import React, { useState, useEffect } from 'react';
import { BarChart3, Info } from 'lucide-react';
import adminService from '../../services/adminService';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const AdminReports = () => {
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getReports();
      setReportsData(data);
    } catch (err) {
      console.error('Error fetching admin reports:', err);
      setError('Unable to load platform analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const reportSections = reportsData
    ? [
        {
          title: 'User Accounts',
          subtitle: 'Platform registration breakdown by role.',
          rows: [
            ['Total Users', reportsData.users?.total],
            ['Attendees', reportsData.users?.attendees],
            ['Organizers', reportsData.users?.organizers],
            ['Admins', reportsData.users?.admins],
          ],
        },
        {
          title: 'Events Portfolio',
          subtitle: 'Events by publication status.',
          rows: [
            ['Total Events', reportsData.events?.total],
            ['Published', reportsData.events?.published],
            ['Completed', reportsData.events?.completed],
            ['Cancelled', reportsData.events?.cancelled],
          ],
        },
        {
          title: 'Bookings',
          subtitle: 'Ticket booking transactions and volume.',
          rows: [
            ['Total Bookings', reportsData.bookings?.total],
            ['Confirmed', reportsData.bookings?.confirmed],
            ['Cancelled', reportsData.bookings?.cancelled],
            ['Tickets Sold', reportsData.bookings?.tickets_sold],
          ],
        },
        {
          title: 'Payments & Revenue',
          subtitle: 'Successful payment settlements and collected revenue.',
          rows: [
            ['Total Payments', reportsData.payments?.total],
            ['Successful', reportsData.payments?.successful],
            ['Revenue (₹)', reportsData.payments?.revenue],
          ],
        },
      ]
    : [];

  return (
    <div className="admin-page-container">
      {/* Information Banner */}
      <div className="auth-info-banner" style={{ marginBottom: '1.75rem' }}>
        <Info size={18} />
        <span>Platform analytics as reported by the backend.</span>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <Skeleton height="180px" />
          <Skeleton height="180px" />
          <Skeleton height="180px" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadReports} />
      ) : reportsData ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {reportSections.map((section) => (
            <div className="admin-section-card" key={section.title}>
              <h3>{section.title}</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1rem' }}>
                {section.subtitle}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {section.rows.map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.55rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-glass)',
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{label}</span>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                      {value !== undefined && value !== null ? value : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="Analytics & Reports Engine Ready" />
      )}

      {!loading && !error && reportsData && (
        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <BarChart3 size={16} />
          <span>Figures above are live counts from the platform database.</span>
        </div>
      )}
    </div>
  );
};

export default AdminReports;