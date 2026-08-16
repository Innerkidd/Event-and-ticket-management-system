import api from '../services/api';

const adminService = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data?.data || null;
    } catch (error) {
      console.warn('Backend /admin/stats endpoint unavailable.', error?.message);
      return null;
    }
  },

  getPendingApplications: async () => {
    try {
      const response = await api.get('/admin/organizers/applications');
      return response.data?.data || [];
    } catch (error) {
      console.warn('Backend /admin/organizers/applications endpoint unavailable.', error?.message);
      return [];
    }
  },

  getUsers: async (params = {}) => {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data?.data || [];
    } catch (error) {
      console.warn('Backend /admin/users endpoint unavailable.', error?.message);
      return [];
    }
  },

  getOrganizers: async (params = {}) => {
    try {
      const response = await api.get('/admin/organizers', { params });
      return response.data?.data || [];
    } catch (error) {
      console.warn('Backend /admin/organizers endpoint unavailable.', error?.message);
      return [];
    }
  },

  approveOrganizerApplication: async (id) => {
    try {
      const response = await api.patch(`/admin/organizers/applications/${id}/approve`);
      return response.data;
    } catch (error) {
      console.warn(`Backend /admin/organizers/applications/${id}/approve endpoint unavailable.`, error?.message);
      throw error;
    }
  },

  rejectOrganizerApplication: async (id) => {
    try {
      const response = await api.patch(`/admin/organizers/applications/${id}/reject`);
      return response.data;
    } catch (error) {
      console.warn(`Backend /admin/organizers/applications/${id}/reject endpoint unavailable.`, error?.message);
      throw error;
    }
  },

  getEvents: async (params = {}) => {
    try {
      const response = await api.get('/admin/events', { params });
      return response.data?.data || [];
    } catch (error) {
      console.warn('Backend /admin/events endpoint unavailable.', error?.message);
      return [];
    }
  },

  getBookings: async (params = {}) => {
    try {
      const response = await api.get('/admin/bookings', { params });
      return response.data?.data || [];
    } catch (error) {
      console.warn('Backend /admin/bookings endpoint unavailable.', error?.message);
      return [];
    }
  },

  getPayments: async (params = {}) => {
    try {
      const response = await api.get('/admin/payments', { params });
      return response.data?.data || [];
    } catch (error) {
      console.warn('Backend /admin/payments endpoint unavailable.', error?.message);
      return [];
    }
  },

  getReports: async () => {
    try {
      const response = await api.get('/admin/reports');
      return response.data?.data || null;
    } catch (error) {
      console.warn('Backend /admin/reports endpoint unavailable.', error?.message);
      return null;
    }
  },
};

export default adminService;
