import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, DollarSign, Ticket, UserCheck, TrendingUp, Info } from 'lucide-react';
import organizerService from '../../services/organizerService';
import eventService from '../../services/eventService';
import StatCard from '../../components/admin/StatCard';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const OrganizerAnalytics = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const eventsData = await organizerService.getMyEvents();
      const loadedEvents = eventsData && eventsData.length > 0 ? eventsData : await eventService.getPublishedEvents();
      setEvents(loadedEvents);
      if (loadedEvents.length > 0) {
        setSelectedEventId(String(loadedEvents[0].id));
      }
    } catch (err) {
      console.error('Error loading analytics events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      const fetchAnalytics = async () => {
        try {
          const data = await organizerService.getAnalytics(selectedEventId);
          setAnalyticsData(data);
        } catch (err) {
          console.warn('Error fetching analytics for event:', selectedEventId);
        }
      };
      fetchAnalytics();
    }
  }, [selectedEventId]);

  const selectedEvent = events.find((e) => String(e.id) === String(selectedEventId));
  const price = Number(selectedEvent?.ticket_price || selectedEvent?.price || 0);
  const totalTickets = selectedEvent?.total_tickets || 100;
  const availableTickets = selectedEvent?.available_tickets !== undefined ? selectedEvent.available_tickets : totalTickets;
  const soldTickets = totalTickets - availableTickets;
  const grossRevenue = soldTickets * price;
  const platformFee = grossRevenue * 0.05;
  const netRevenue = Math.max(0, grossRevenue - platformFee);

  return (
    <div className="admin-page-container">
      {/* Controls & Event Selector */}
      <div className="admin-controls-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <BarChart3 size={20} color="#ec4899" />
          <label className="filter-label" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Select Event Analytics:</label>
          <select
            className="form-select"
            style={{ minWidth: '260px', fontWeight: 600 }}
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>{evt.name || evt.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Analytics Stat Cards */}
      <div className="stats-grid">
        <StatCard
          label="Tickets Sold"
          value={soldTickets}
          subtitle={`Out of ${totalTickets} total capacity`}
          icon={Ticket}
          color="#34d399"
        />
        <StatCard
          label="Gross Ticket Revenue"
          value={`₹${grossRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="#818cf8"
        />
        <StatCard
          label="Estimated Platform Fee (5%)"
          value={`₹${platformFee.toLocaleString()}`}
          icon={TrendingUp}
          color="#fbbf24"
        />
        <StatCard
          label="Net Organizer Revenue"
          value={`₹${netRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="#ec4899"
        />
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="dashboard-sections-grid">
        {/* Ticket Sales Progress Section */}
        <div className="admin-section-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Ticket Sales & Capacity Ratio</h3>
          <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600 }}>
              <span>Sales Progress</span>
              <span>{Math.round((soldTickets / totalTickets) * 100) || 0}%</span>
            </div>
            <div style={{ height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, Math.round((soldTickets / totalTickets) * 100))}%`,
                  height: '100%',
                  background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                  borderRadius: '5px'
                }}
              />
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Real-time ticket distribution for {selectedEvent?.name || selectedEvent?.title || 'Selected Event'}.
          </p>
        </div>

        {/* Financial Net Breakdown Section */}
        <div className="admin-section-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Financial Settlement Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Gross Ticket Revenue</span>
              <span style={{ fontWeight: 700 }}>₹{grossRevenue.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Platform Fee (5%)</span>
              <span style={{ fontWeight: 700, color: '#fbbf24' }}>- ₹{platformFee.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem', fontSize: '1rem' }}>
              <span style={{ fontWeight: 800 }}>Net Payout</span>
              <span style={{ fontWeight: 800, color: '#34d399' }}>₹{netRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerAnalytics;
