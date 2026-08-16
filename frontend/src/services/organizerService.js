import api from '../services/api';

const organizerService = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('/organizer/stats');
      return response.data?.data || null;
    } catch (error) {
      console.warn('Backend /organizer/stats endpoint unavailable.', error?.message);
      return null;
    }
  },

  getMyEvents: async () => {
    try {
      const response = await api.get('/organizer/events');
      return response.data?.data || [];
    } catch (error) {
      console.warn('Backend /organizer/events endpoint unavailable.', error?.message);
      return [];
    }
  },

  createEvent: async (eventData) => {
    try {
      const response = await api.post('/organizer/events', eventData);
      return response.data;
    } catch (error) {
      console.warn('Backend /organizer/events endpoint unavailable.', error?.message);
      throw error;
    }
  },

  getTicketsSummary: async () => {
    try {
      const response = await api.get('/organizer/tickets');
      return response.data?.data || [];
    } catch (error) {
      console.warn('Backend /organizer/tickets endpoint unavailable.', error?.message);
      return [];
    }
  },

  getBookings: async (params = {}) => {
    try {
      const response = await api.get('/organizer/bookings', { params });
      return response.data?.data || [];
    } catch (error) {
      console.warn('Backend /organizer/bookings endpoint unavailable.', error?.message);
      return [];
    }
  },

  getStaff: async (eventId) => {
    try {
      const response = await api.get('/organizer/staff', { params: { eventId } });
      return response.data?.data || [];
    } catch (error) {
      console.warn('Backend /organizer/staff endpoint unavailable.', error?.message);
      return [];
    }
  },

  addStaff: async (staffData) => {
    try {
      const response = await api.post('/organizer/staff', staffData);
      return response.data;
    } catch (error) {
      console.warn('Backend /organizer/staff endpoint unavailable.', error?.message);
      throw error;
    }
  },

  getAttendance: async (eventId) => {
    try {
      const response = await api.get('/organizer/attendance', { params: { eventId } });
      return response.data?.data || null;
    } catch (error) {
      console.warn('Backend /organizer/attendance endpoint unavailable.', error?.message);
      return null;
    }
  },

  getAnalytics: async (eventId) => {
    try {
      const response = await api.get('/organizer/analytics', { params: { eventId } });
      return response.data?.data || null;
    } catch (error) {
      console.warn('Backend /organizer/analytics endpoint unavailable.', error?.message);
      return null;
    }
  },
};

export default organizerService;
