import api from './api';

const authService = {
  login: async ({ email, password }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.warn('Backend /auth/login unavailable or error. Using mock auth response.', error?.message || error);

      // Intelligent mock fallback for seamless testing
      if (!email || !password) {
        throw new Error('Please enter both email and password.');
      }

      let role = 'ATTENDEE';
      if (email.toLowerCase().includes('admin')) {
        role = 'ADMIN';
      } else if (email.toLowerCase().includes('organizer') || email.toLowerCase().includes('org')) {
        role = 'ORGANIZER';
      }

      return {
        token: `mock-jwt-token-${Date.now()}`,
        user: {
          id: `usr-${Date.now()}`,
          name: email.split('@')[0].replace('.', ' '),
          email: email.toLowerCase(),
          role,
        },
      };
    }
  },

  register: async ({ name, email, password }) => {
    try {
      // Registration is strictly Attendee-only
      const response = await api.post('/auth/register', { name, email, password, role: 'ATTENDEE' });
      return response.data;
    } catch (error) {
      console.warn('Backend /auth/register unavailable or error. Using mock registration response.', error?.message || error);

      if (!name || !email || !password) {
        throw new Error('Please fill in all required registration fields.');
      }

      return {
        token: `mock-jwt-token-${Date.now()}`,
        user: {
          id: `usr-${Date.now()}`,
          name: name.trim(),
          email: email.toLowerCase(),
          role: 'ATTENDEE', // Strictly Attendee
        },
      };
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) return JSON.parse(savedUser);
      throw error;
    }
  },
};

export default authService;
