import { User } from '../types';

// Future Backend API Contracts:
// POST /api/auth/login

const MOCK_USER: User = {
  id: 'usr_001',
  username: 'analyst@anomalyse.bank',
  role: 'analyst',
  token: 'mock_jwt_token_secure_xyz',
};

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (email && password) {
      // Use sessionStorage so the user is logged out when the tab closes
      sessionStorage.setItem('anomalyse_token', MOCK_USER.token);
      sessionStorage.setItem('anomalyse_user', JSON.stringify(MOCK_USER));
      return MOCK_USER;
    }
    throw new Error('Invalid credentials');
  },

  logout: () => {
    sessionStorage.removeItem('anomalyse_token');
    sessionStorage.removeItem('anomalyse_user');
    window.location.href = '#/login';
  },

  getCurrentUser: (): User | null => {
    const userStr = sessionStorage.getItem('anomalyse_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!sessionStorage.getItem('anomalyse_token');
  }
};