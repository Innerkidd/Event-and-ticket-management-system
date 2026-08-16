import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, TrendingUp } from 'lucide-react';
import organizerService from '../../services/organizerService';
import eventService from '../../services/eventService';
import StatusBadge from '../../components/admin/StatusBadge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const OrganizerTickets = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await organizerService.getMyEvents();
      setEvents(data && data.length > 0 ? data : await eventService.getPublishedEvents());
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
          <h3>Concert Ticket Inventory & Capacity Breakdown</h3>
        </div>

        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <Skeleton height="60px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="60px" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : events.length === 0 ? (
          <EmptyState message="No ticket inventory data available." />
        ) : (
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
                {events.map((evt) => {
                  const total = evt.total_tickets || 100;
                  const available = evt.available_tickets !== undefined ? evt.available_tickets : total;
                  const sold = total - available;
                  const percent = Math.min(100, Math.round((sold / total) * 100)) || 0;

                  return (
                    <tr key={evt.id}>
                      <td style={{ fontWeight: 600 }}>{evt.name || evt.title}</td>
                      <td style={{ fontWeight: 600, color: '#34d399' }}>
                        {Number(evt.ticket_price || evt.price) === 0 ? 'Free' : `₹${Number(evt.ticket_price || evt.price)}`}
                      </td>
                      <td>{total}</td>
                      <td style={{ fontWeight: 700, color: '#818cf8' }}>{sold}</td>
                      <td style={{ fontWeight: 700, color: '#34d399' }}>{available}</td>
                      <td style={{ minWidth: '160px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${percent}%`,
                                height: '100%',
                                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                borderRadius: '4px',
                                transition: 'width 0.4s ease'
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{percent}%</span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={evt.status || 'PUBLISHED'} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerTickets;
