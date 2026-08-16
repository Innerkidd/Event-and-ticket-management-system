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

const bookingService = {
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data?.data?.booking || null;
  },

  getUserBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data?.data?.bookings || [];
  },

  createTicketPaymentOrder: async (bookingId) => {
    const response = await api.post(`/bookings/${bookingId}/payment`);
    return response.data?.data || null;
  },

  verifyTicketPayment: async (bookingId, paymentData) => {
    const response = await api.post(`/bookings/${bookingId}/payment/verify`, paymentData);
    return response.data?.data?.data || null;
  },

  openRazorpayCheckout: async ({ key, orderId, amount, currency }, { name, email, contact, onSuccess, onCancel }) => {
    const Razorpay = await loadRazorpayCheckoutScript();
    const options = {
      key,
      order_id: orderId,
      amount,
      currency,
      name: 'Event Ticket Platform',
      description: 'Event ticket purchase',
      prefill: {
        name: name || '',
        email: email || '',
        contact: contact || '',
      },
      theme: { color: '#6366f1' },
      handler: onSuccess,
      modal: { ondismiss: onCancel },
    };
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', () => onCancel && onCancel());
    rzp.open();
  },
};

export default bookingService;