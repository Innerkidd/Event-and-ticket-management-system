import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Ticket, ArrowLeft, Mic2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import eventService from '../services/eventService';
import Skeleton from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { formatEventDateTime } from '../utils/formatDate';

const DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEventDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      let fetched = null;
      try {
        fetched = await eventService.getEventById(id);
      } catch (err) {
        console.warn('Single event endpoint failed, attempting fallback to published events list...');
      }

      if (!fetched) {
        const allEvents = await eventService.getPublishedEvents();
        fetched = allEvents.find((e) => String(e.id) === String(id));
      }

      if (!fetched) {
        setError('Event not found.');
      } else {
        setEvent(fetched);
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError('Unable to load event details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventDetails();
  }, [id]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}/book` } });
    } else {
      navigate(`/events/${id}/book`);
    }
  };

  const isSoldOut = event ? Number(event.available_tickets) <= 0 : false;
  const imageSrc = event?.image || DEFAULT_COVER_IMAGE;

  return (
    <div className="discover-page-container" style={{ maxWidth: '1000px', paddingTop: '2rem' }}>
      {/* Back to Events Navigation */}
      <button
        onClick={() => navigate('/events')}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={16} /> Back to Events
      </button>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Skeleton height="320px" style={{ borderRadius: 'var(--radius-lg)' }} />
          <Skeleton height="40px" width="60%" />
          <Skeleton height="80px" />
        </div>
      ) : error || !event ? (
        <ErrorState
          message={error || 'Event not found.'}
          onRetry={loadEventDetails}
        />
      ) : (
        <div className="event-details-card">
          {/* Event Cover Image Banner */}
          <div className="event-details-cover-container">
            <img
              src={imageSrc}
              alt={event.name || event.title}
              className="event-details-cover-image"
              onError={(e) => {
                e.target.src = DEFAULT_COVER_IMAGE;
              }}
            />
            {event.category && (
              <span className={`category-badge ${event.category === 'Party' ? 'badge-party' : 'badge-concert'}`}>
                {event.category}
              </span>
            )}
            <span className={`availability-badge ${isSoldOut ? 'badge-sold-out' : 'badge-available'}`}>
              {isSoldOut ? 'Sold Out' : `${event.available_tickets !== undefined ? event.available_tickets : event.total_tickets || 100} tickets left`}
            </span>
          </div>

          {/* Event Body Information */}
          <div className="event-details-body">
            <h1 className="event-details-title">{event.name || event.title}</h1>

            <div className="event-details-meta-grid">
              <div className="meta-card">
                <Calendar size={20} color="#818cf8" />
                <div>
                  <span className="meta-card-label">Date & Time</span>
                  <span className="meta-card-value">{formatEventDateTime(event.start_date || event.date)}</span>
                </div>
              </div>

              <div className="meta-card">
                <MapPin size={20} color="#818cf8" />
                <div>
                  <span className="meta-card-label">Venue Location</span>
                  <span className="meta-card-value">{event.venue}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="event-details-description-box">
                <h3>About This Event</h3>
                <p>{event.description}</p>
              </div>
            )}

            {/* Pricing & Booking Footer Block */}
            <div className="event-details-booking-footer">
              <div className="booking-price-info">
                <span className="price-label">Ticket Price</span>
                <span className="price-value" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>
                  {Number(event.ticket_price || event.price) === 0 ? 'Free' : `₹${Number(event.ticket_price || event.price)}`}
                </span>
              </div>

              <button
                onClick={handleBookNow}
                disabled={isSoldOut}
                className={`btn ${isSoldOut ? 'btn-secondary' : 'btn-primary'}`}
                style={{ padding: '0.85rem 2.25rem', fontSize: '1.05rem' }}
              >
                <Ticket size={18} /> {isSoldOut ? 'Sold Out' : 'Book Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailsPage;
