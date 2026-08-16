import api from './api';

const bookingService = {
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data?.data?.booking || null;
  },

  getUserBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data?.data?.bookings || [];
  },
};

export default bookingService;