import api from './api';

const bookingService = {
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      console.warn('Backend /bookings endpoint unavailable.', error?.message);
      throw error;
    }
  },

  getUserBookings: async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      return response.data?.data || [];
    } catch (error) {
      console.warn('Backend /bookings/my-bookings endpoint unavailable.', error?.message);
      return [];
    }
  },
};

export default bookingService;
