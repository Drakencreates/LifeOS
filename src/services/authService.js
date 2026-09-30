import api from './api';

const TOKEN_KEY = 'lifeos_token';
const USER_KEY = 'lifeos_user';

export const authService = {
  // Register a new user
  async register(data) {
    const response = await api.post('/auth/register', data);
    if (response.data.token && response.data.user) {
      this.setSession(response.data.token, response.data.user);
    }
    return response.data;
  },

  // Login an existing user
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token && response.data.user) {
      this.setSession(response.data.token, response.data.user);
    }
    return response.data;
  },

  // Logout user
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue client cleanup even if network request fails
    } finally {
      this.clearSession();
    }
  },

  // Get current authenticated user profile
  async getMe() {
    const response = await api.get('/auth/me');
    if (response.data.user) {
      this.setUser(response.data.user);
    }
    return response.data.user;
  },

  // Session storage management
  setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export default authService;
