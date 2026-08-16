import api from './api';

const eventService = {
  getPublishedEvents: async () => {
    const response = await api.get('/events');
    return response.data?.data || [];
  },

  getEventById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data?.data;
  },
};

export default eventService;