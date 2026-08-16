import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Info, Upload, Trash2 } from 'lucide-react';
import organizerService from '../../services/organizerService';

const OrganizerCreateEvent = () => {
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venue, setVenue] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [totalTickets, setTotalTickets] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [infoNotice, setInfoNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoNotice('');

    // Validation
    if (!name.trim()) {
      setError('Please enter the event name.');
      return;
    }
    if (!description.trim()) {
      setError('Please enter an event description.');
      return;
    }
    if (!date) {
      setError('Please select an event date.');
      return;
    }
    if (!time) {
      setError('Please select an event start time.');
      return;
    }
    if (!endDate) {
      setError('Please select an event end date.');
      return;
    }
    if (!endTime) {
      setError('Please select an event end time.');
      return;
    }
    if (!venue.trim()) {
      setError('Please enter the venue location.');
      return;
    }
    const priceNum = parseFloat(ticketPrice) || 0;
    const quantityNum = parseInt(totalTickets, 10) || 0;
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Ticket price must be a valid non-negative number.');
      return;
    }
    if (isNaN(quantityNum) || quantityNum < 1) {
      setError('Total tickets quantity must be at least 1.');
      return;
    }

    // Build ISO date-time values from the raw HTML input values (YYYY-MM-DD / HH:mm).
    const startDateTime = `${date}T${time}`;
    const endDateTime = `${endDate}T${endTime}`;
    const startMs = new Date(startDateTime).getTime();
    const endMs = new Date(endDateTime).getTime();

    if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
      setError('Please provide valid event date and time values.');
      return;
    }
    if (endMs <= startMs) {
      setError('End date and time must be after the start date and time.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        image: imagePreview || null,
        startDate: startDateTime,
        endDate: endDateTime,
        venue: venue.trim(),
        ticketPrice: priceNum,
        totalTickets: quantityNum,
      };

      await organizerService.createEvent(payload);
      setInfoNotice('Event created successfully as a draft. You can publish it from My Events after paying the platform fee.');
      setTimeout(() => {
        navigate('/organizer/events');
      }, 2000);
    } catch (err) {
      console.error('Failed to create event:', err);
      setError(err.response?.data?.message || 'Unable to create event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-section-card" style={{ padding: '2rem' }}>
        <div className="section-card-header" style={{ padding: '0 0 1.25rem 0', borderBottom: '1px solid var(--border-color)', marginBottom: '1.75rem' }}>
          <h3>Create New Event</h3>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {infoNotice && (
          <div className="auth-info-banner" role="status">
            <Info size={18} />
            <span>{infoNotice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Column 1: Event Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                1. Event Details
              </h4>

              <div className="form-group">
                <label className="form-label" htmlFor="eventName">Event Name *</label>
                <input
                  type="text"
                  id="eventName"
                  className="form-input"
                  placeholder="e.g. Electric Beats Music Festival 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Event Description *</label>
                <textarea
                  id="description"
                  className="form-input"
                  style={{ minHeight: '110px', resize: 'vertical' }}
                  placeholder="Describe the artists, lineup, doors open time, and vibe..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="date">Event Date *</label>
                  <input
                    type="date"
                    id="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="time">Start Time *</label>
                  <input
                    type="time"
                    id="time"
                    className="form-input"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="endDate">End Date *</label>
                  <input
                    type="date"
                    id="endDate"
                    className="form-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="endTime">End Time *</label>
                  <input
                    type="time"
                    id="endTime"
                    className="form-input"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="venue">Venue Location *</label>
                <input
                  type="text"
                  id="venue"
                  className="form-input"
                  placeholder="e.g. Sunburn Arena, North Gate"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  required
                />
              </div>

              {/* Image Upload Component */}
              <div className="form-group">
                <label className="form-label">Event Cover Image</label>
                {imagePreview ? (
                  <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="btn btn-danger btn-sm"
                      style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                ) : (
                  <label style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.75rem',
                    border: '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    background: 'rgba(11, 15, 25, 0.4)',
                    color: 'var(--text-muted)'
                  }}>
                    <Upload size={24} style={{ marginBottom: '0.5rem' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Click to upload cover banner</span>
                    <span style={{ fontSize: '0.75rem' }}>PNG, JPG or WEBP (Max 5MB)</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>

            {/* Column 2: Ticketing */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                2. Ticketing
              </h4>

              <div className="form-group">
                <label className="form-label" htmlFor="ticketPrice">Ticket Price (₹) *</label>
                <input
                  type="number"
                  id="ticketPrice"
                  min="0"
                  step="10"
                  className="form-input"
                  placeholder="e.g. 500 (Set 0 for Free events)"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="totalTickets">Total Ticket Quantity *</label>
                <input
                  type="number"
                  id="totalTickets"
                  min="1"
                  step="1"
                  className="form-input"
                  placeholder="e.g. 1000"
                  value={totalTickets}
                  onChange={(e) => setTotalTickets(e.target.value)}
                  required
                />
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Your event is created as a <strong>draft</strong>. From My Events, you can pay the platform fee to publish it. The exact fee is calculated by the backend when you publish.
              </p>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}
              >
                {isSubmitting ? 'Creating...' : 'Create Draft Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizerCreateEvent;