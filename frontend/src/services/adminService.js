import api from './api';

const adminService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data?.data || null;
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data?.data || null;
  },

  getOrganizers: async (params = {}) => {
    const response = await api.get('/admin/organizers', { params });
    return response.data?.data || null;
  },

  getOrganizerApplications: async (params = {}) => {
    const response = await api.get('/admin/organizers/applications', { params });
    return response.data?.data || null;
  },

  getOrganizerApplication: async (id) => {
    const response = await api.get(`/admin/organizers/applications/${id}`);
    return response.data?.data?.application || null;
  },

  approveOrganizerApplication: async (id, data = {}) => {
    const response = await api.patch(`/admin/organizers/applications/${id}/approve`, data);
    return response.data;
  },

  rejectOrganizerApplication: async (id, data = {}) => {
    const response = await api.patch(`/admin/organizers/applications/${id}/reject`, data);
    return response.data;
  },

  getEvents: async (params = {}) => {
    const response = await api.get('/admin/events', { params });
    return response.data?.data || null;
  },

  getEvent: async (id) => {
    const response = await api.get(`/admin/events/${id}`);
    return response.data?.data?.event || null;
  },

  getBookings: async (params = {}) => {
    const response = await api.get('/admin/bookings', { params });
    return response.data?.data || null;
  },

  getBooking: async (id) => {
    const response = await api.get(`/admin/bookings/${id}`);
    return response.data?.data?.booking || null;
  },

  getPayments: async (params = {}) => {
    const response = await api.get('/admin/payments', { params });
    return response.data?.data || null;
  },

  getPayment: async (id) => {
    const response = await api.get(`/admin/payments/${id}`);
    return response.data?.data?.payment || null;
  },

  getOrganizerFees: async (params = {}) => {
    const response = await api.get('/admin/payments/organizer-fees', { params });
    return response.data?.data || [];
  },

  getReports: async () => {
    const response = await api.get('/admin/reports');
    return response.data?.data || null;
  },
};

export default adminService;