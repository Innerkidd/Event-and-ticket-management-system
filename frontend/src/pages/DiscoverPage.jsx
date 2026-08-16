import React, { useState, useEffect, useCallback } from 'react';
import EventCard from '../components/events/EventCard';
import EventCardSkeleton from '../components/events/EventCardSkeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import eventService from '../services/eventService';
import { Sparkles, Music2 } from 'lucide-react';

const DiscoverPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.getPublishedEvents();
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching published events:', err);
      setError(err?.message || 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="discover-page-container">
      {/* Banner / Header Hero section */}
      <section className="discover-hero">
        <div className="hero-badge">
          <Sparkles size={14} style={{ marginRight: '6px' }} /> Live Music & Party Experiences
        </div>
        <h1 className="discover-title">
          Explore Live <span className="gradient-text">Concerts & Parties</span>
        </h1>
        <p className="discover-subtitle">
          Book passes for upcoming electronic festivals, club nights, indie rock gigs, and exclusive party events.
        </p>
      </section>

      {/* Main Events Section */}
      <section className="events-section">
        <div className="section-header">
          <h2 className="section-title">
            <Music2 size={24} color="#818cf8" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
            Upcoming Events
          </h2>
          {!loading && !error && (
            <span className="events-count">
              Showing {events.length} event{events.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {/* State Conditional Rendering */}
        {loading ? (
          <div className="events-grid">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <EventCardSkeleton key={idx} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchEvents} />
        ) : events.length === 0 ? (
          <EmptyState message="No upcoming events available." />
        ) : (
          <div className="events-grid">
            {events.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DiscoverPage;
