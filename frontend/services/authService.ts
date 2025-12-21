import { User } from '../types';
import { API_CONFIG } from './config';

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const resp = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!resp.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await resp.json(); // { access_token, token_type }
    const user: User = {
      id: 'usr_001',
      username: email,
      role: 'analyst',
      token: data.access_token,
    };

    localStorage.setItem('anomalyse_token', user.token);
    localStorage.setItem('anomalyse_user', JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem('anomalyse_token');
    localStorage.removeItem('anomalyse_user');
    window.location.href = '#/login';
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('anomalyse_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('anomalyse_token');
  }
};
