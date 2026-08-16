import api from './api';

const loadRazorpayCheckoutScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => (window.Razorpay ? resolve(window.Razorpay) : reject(new Error('Razorpay checkout failed to load')));
    script.onerror = () => reject(new Error('Unable to load Razorpay checkout.'));
    document.body.appendChild(script);
  });

const organizerService = {
  getDashboard: async () => {
    const response = await api.get('/organizer/dashboard');
    return response.data?.data || null;
  },

  getEvents: async (params = {}) => {
    const response = await api.get('/organizer/events', { params });
    return response.data?.data || null;
  },

  getEvent: async (id) => {
    const response = await api.get(`/organizer/events/${id}`);
    return response.data?.data?.event || null;
  },

  createEvent: async (data) => {
    const response = await api.post('/organizer/events', data);
    return response.data?.data?.event || null;
  },

  updateEvent: async (id, data) => {
    const response = await api.patch(`/organizer/events/${id}`, data);
    return response.data?.data?.event || null;
  },

  getPublishSummary: async (eventId) => {
    const response = await api.get(`/organizer/events/${eventId}/publish-summary`);
    return response.data?.data || null;
  },

  createPublishPayment: async (eventId) => {
    const response = await api.post(`/organizer/events/${eventId}/publish-payment`);
    return response.data?.data || null;
  },

  verifyPublishPayment: async (eventId, data) => {
    const response = await api.post(`/organizer/events/${eventId}/publish-payment/verify`, data);
    return response.data?.data || null;
  },

  getTickets: async (params = {}) => {
    const response = await api.get('/organizer/tickets', { params });
    return response.data?.data || null;
  },

  getEventTickets: async (eventId) => {
    const response = await api.get(`/organizer/events/${eventId}/tickets`);
    return response.data?.data?.tickets || null;
  },

  getBookings: async (params = {}) => {
    const response = await api.get('/organizer/bookings', { params });
    return response.data?.data || null;
  },

  getBooking: async (id) => {
    const response = await api.get(`/organizer/bookings/${id}`);
    return response.data?.data?.booking || null;
  },

  getStaff: async (params = {}) => {
    const response = await api.get('/organizer/staff', { params });
    return response.data?.data || null;
  },

  createStaff: async (data) => {
    const response = await api.post('/organizer/staff', data);
    return response.data?.data?.staff || null;
  },

  updateStaff: async (id, data) => {
    const response = await api.patch(`/organizer/staff/${id}`, data);
    return response.data?.data?.staff || null;
  },

  deleteStaff: async (id) => {
    const response = await api.delete(`/organizer/staff/${id}`);
    return response.data;
  },

  getAttendance: async (params = {}) => {
    const response = await api.get('/organizer/attendance', { params });
    return response.data?.data || null;
  },

  getEventAttendance: async (eventId, params = {}) => {
    const response = await api.get(`/organizer/events/${eventId}/attendance`, { params });
    return response.data?.data || null;
  },

  checkIn: async (bookingId) => {
    const response = await api.patch(`/organizer/attendance/${bookingId}/check-in`);
    return response.data?.data?.attendance || null;
  },

  getAnalytics: async (eventId) => {
    const response = await api.get('/organizer/analytics', { params: { eventId } });
    return response.data?.data || null;
  },

  openRazorpayCheckout: async ({ key, orderId, amount, currency }, { onSuccess, onCancel }) => {
    const Razorpay = await loadRazorpayCheckoutScript();
    const options = {
      key,
      order_id: orderId,
      amount,
      currency,
      name: 'Event Ticket Platform',
      description: 'Platform fee to publish your event',
      theme: { color: '#6366f1' },
      handler: onSuccess,
      modal: { ondismiss: onCancel },
    };
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', () => onCancel && onCancel());
    rzp.open();
  },
};

export default organizerService;