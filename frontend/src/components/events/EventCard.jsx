import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Mic2, Ticket, ArrowRight } from 'lucide-react';
import { formatEventDateTime } from '../../utils/formatDate';

const DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80';

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  const {
    id = 0,
    name = 'Live Concert Event',
    description = '',
    category = '',
    start_date = new Date().toISOString(),
    venue = 'Main Stage Arena',
    ticket_price = 0,
    available_tickets = 0,
    image = null,
  } = event || {};

  const isSoldOut = Number(available_tickets) <= 0;
  const imageSrc = image || DEFAULT_COVER_IMAGE;

  const handleCardClick = () => {
    navigate(`/events/${id}`);
  };

  return (
    <div className="event-card" onClick={handleCardClick} role="button" tabIndex={0}>
      {/* Cover Image Container */}
      <div className="card-image-container">
        <img
          src={imageSrc}
          alt={name}
          className="card-cover-image"
          onError={(e) => {
            e.target.src = DEFAULT_COVER_IMAGE;
          }}
        />
        {/* Category Tag (Concert / Party) */}
        {category && (
          <span className={`category-badge ${category === 'Party' ? 'badge-party' : 'badge-concert'}`}>
            {category}
          </span>
        )}

        {/* Availability Badge */}
        <span className={`availability-badge ${isSoldOut ? 'badge-sold-out' : 'badge-available'}`}>
          {isSoldOut ? 'Sold Out' : `${available_tickets} tickets left`}
        </span>
      </div>

      {/* Card Content Body */}
      <div className="card-body">
        {/* Event Description */}
        {description && (
          <div className="artist-info">
            <Mic2 size={15} color="#818cf8" />
            <span className="artist-name">{description}</span>
          </div>
        )}

        {/* Event Title */}
        <h3 className="event-title">{name}</h3>

        {/* Date and Time */}
        <div className="event-meta-row">
          <Calendar size={15} color="#818cf8" />
          <span className="meta-text">{formatEventDateTime(start_date)}</span>
        </div>

        {/* Venue / Location */}
        <div className="event-meta-row">
          <MapPin size={15} color="#818cf8" />
          <span className="meta-text venue-text">{venue}</span>
        </div>

        {/* Card Footer: Price & Navigation Button */}
        <div className="card-footer">
          <div className="price-block">
            <span className="price-label">Tickets from</span>
            <span className="price-value">
              {Number(ticket_price) === 0 ? 'Free' : `₹${Number(ticket_price)}`}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/events/${id}`);
            }}
            className="btn btn-view-details"
          >
            View Details <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
