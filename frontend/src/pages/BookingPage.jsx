import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Ticket, Calendar, MapPin, CheckCircle, AlertCircle, Info, ShieldCheck, Minus, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import eventService from '../services/eventService';
import bookingService from '../services/bookingService';
import Skeleton from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { formatEventDateTime } from '../utils/formatDate';

const DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [optInMarketing, setOptInMarketing] = useState(false);

  // UI state
  const [formError, setFormError] = useState('');
  const [paymentNotice, setPaymentNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadEventData = async () => {
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
      console.error('Error fetching event for booking:', err);
      setError('Unable to load event details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventData();
  }, [id]);

  // Calculations
  const availableTickets = event?.available_tickets !== undefined ? Number(event.available_tickets) : Number(event?.total_tickets || 100);
  const maxAllowedQuantity = Math.max(1, availableTickets);
  const unitPrice = Number(event?.ticket_price || event?.price || 0);
  const totalAmount = unitPrice * quantity;
  const isSoldOut = availableTickets <= 0;

  const handleIncrement = () => {
    if (quantity < maxAllowedQuantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setFormError('');
    setPaymentNotice('');

    // Validation
    if (!fullName.trim()) {
      setFormError('Full name is required.');
      return;
    }
    if (!email.trim()) {
      setFormError('Email address is required.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setFormError('Please enter a valid phone number (at least 8 digits).');
      return;
    }
    if (quantity < 1 || quantity > maxAllowedQuantity) {
      setFormError(`Please select between 1 and ${maxAllowedQuantity} tickets.`);
      return;
    }
    if (!agreedTerms) {
      setFormError('You must agree to the Terms & Conditions and Privacy Policy to proceed.');
      return;
    }

    setIsSubmitting(true);

    try {
      const booking = await bookingService.createBooking({
        eventId: event.id,
        quantity,
      });

      setPaymentNotice(
        `Booking ${booking.bookingId} created successfully for ₹${Number(booking.amount).toLocaleString()}. Status: ${booking.status}. Payment processing will be available soon.`
      );
    } catch (err) {
      console.error('Booking submission error:', err);
      setFormError(err.response?.data?.message || 'Unable to process booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPayDisabled = isSubmitting || !agreedTerms || !phone.trim() || isSoldOut;

  return (
    <div className="discover-page-container" style={{ maxWidth: '1000px', paddingTop: '2rem' }}>
      {/* Back to Event Navigation */}
      <button
        onClick={() => navigate(`/events/${id}`)}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={16} /> Back to Event
      </button>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Skeleton height="200px" style={{ borderRadius: 'var(--radius-lg)' }} />
          <Skeleton height="300px" />
        </div>
      ) : error || !event ? (
        <ErrorState
          message={error || 'Event not found.'}
          onRetry={loadEventData}
        />
      ) : isSoldOut ? (
        <EmptyState message="This event is sold out. Tickets are unavailable." />
      ) : (
        <div className="booking-page-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Column 1: Booking & Attendee Form */}
          <div className="admin-section-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              Attendee & Ticket Booking Form
            </h3>

            {formError && (
              <div className="auth-error-banner" role="alert">
                <AlertCircle size={18} />
                <span>{formError}</span>
              </div>
            )}

            {paymentNotice && (
              <div className="auth-info-banner" role="status">
                <Info size={18} />
                <span>{paymentNotice}</span>
              </div>
            )}

            <form onSubmit={handleSubmitBooking} noValidate className="auth-form">
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="bookingEmail">Email Address *</label>
                <input
                  type="email"
                  id="bookingEmail"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              {/* Quantity Selector */}
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="form-label">Select Ticket Quantity *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'rgba(11, 15, 25, 0.7)' }}>
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      style={{ padding: '0.6rem 0.85rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: quantity <= 1 ? 'not-allowed' : 'pointer', opacity: quantity <= 1 ? 0.4 : 1 }}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{ padding: '0 1rem', fontWeight: 800, fontSize: '1.1rem' }}>{quantity}</span>
                    <button
                      type="button"
                      onClick={handleIncrement}
                      disabled={quantity >= maxAllowedQuantity}
                      style={{ padding: '0.6rem 0.85rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: quantity >= maxAllowedQuantity ? 'not-allowed' : 'pointer', opacity: quantity >= maxAllowedQuantity ? 0.4 : 1 }}
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Max {maxAllowedQuantity} tickets
                  </span>
                </div>
              </div>

              {/* Mandatory Terms & Conditions Checkbox */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginTop: '1rem' }}>
                <input
                  type="checkbox"
                  id="termsCheck"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  style={{ marginTop: '0.25rem', width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
                <label htmlFor="termsCheck" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', cursor: 'pointer' }}>
                  I agree to the <Link to="/events" className="auth-link">Terms & Conditions</Link> and <Link to="/events" className="auth-link">Privacy Policy</Link>. *
                </label>
              </div>

              {/* Optional Marketing Checkbox */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <input
                  type="checkbox"
                  id="optInCheck"
                  checked={optInMarketing}
                  onChange={(e) => setOptInMarketing(e.target.checked)}
                  style={{ marginTop: '0.25rem', width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
                <label htmlFor="optInCheck" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4', cursor: 'pointer' }}>
                  Send me updates about future concert & party events. (Optional)
                </label>
              </div>

              {/* Pay Now Button */}
              <button
                type="submit"
                disabled={isPayDisabled}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '1rem' }}
              >
                <ShieldCheck size={18} /> Pay Now (₹{totalAmount.toLocaleString()})
              </button>
            </form>
          </div>

          {/* Column 2: Booking Summary Card */}
          <div className="admin-section-card" style={{ padding: '2rem', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              Booking Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {event.image && (
                  <img src={event.image} alt={event.name} style={{ width: '64px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                )}
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{event.name || event.title}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{event.venue}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Date & Time</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right' }}>{formatEventDateTime(event.start_date || event.date)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Ticket Price</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{unitPrice.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Quantity</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{quantity} ticket(s)</span>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800 }}>Total Amount</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
