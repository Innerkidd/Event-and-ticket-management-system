import api from './api';

const applicationService = {
  applyOrganizer: async (applicationData) => {
    const response = await api.post('/applications/organizer', applicationData);
    return response.data?.data?.application || null;
  },
};

export default applicationService;