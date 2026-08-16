import React, { useState, useEffect } from 'react';
import organizerService from '../../services/organizerService';
import StatusBadge from '../../components/admin/StatusBadge';
import Pagination from '../../components/common/Pagination';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const OrganizerTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await organizerService.getTickets({ page: p, limit: 20 });
      setTickets(data.tickets || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Error loading ticket inventory:', err);
      setError('Unable to load ticket inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="admin-page-container">
      <div className="admin-section-card">
        <div className="section-card-header">
          <h3>Ticket Inventory & Capacity</h3>
          <span className="results-count">{pagination.total} event(s)</span>
        </div>

        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <Skeleton height="60px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="60px" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => loadData()} />
        ) : tickets.length === 0 ? (
          <EmptyState message="No ticket inventory data available yet." />
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Price</th>
                    <th>Total Capacity</th>
                    <th>Sold</th>
                    <th>Available</th>
                    <th>Sales Progress</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.eventId}>
                      <td style={{ fontWeight: 600 }}>{t.eventName}</td>
                      <td style={{ fontWeight: 600, color: '#34d399' }}>
                        {Number(t.ticketPrice) === 0 ? 'Free' : `₹${Number(t.ticketPrice)}`}
                      </td>
                      <td>{t.totalTickets}</td>
                      <td style={{ fontWeight: 700, color: '#818cf8' }}>{t.soldTickets}</td>
                      <td style={{ fontWeight: 700, color: '#34d399' }}>{t.availableTickets}</td>
                      <td style={{ minWidth: '160px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.min(100, t.salesPercentage)}%`,
                                height: '100%',
                                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                borderRadius: '4px',
                                transition: 'width 0.4s ease'
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{t.salesPercentage}%</span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={(p) => loadData(p)} />
          </>
        )}
      </div>
    </div>
  );
};

export default OrganizerTickets;