import { api } from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  timezone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Timezone {
  value: string;
  label: string;
  offset: number;
}

export const authService = {
  register: async (username: string, email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/register', {
      username,
      email,
      password,
    });
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  login: async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  updateTimezone: async (timezone: string) => {
    const response = await api.put<{ user: User }>('/auth/timezone', { timezone });
    if (response.user) {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, timezone: response.user.timezone };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
    return response;
  },

  getTimezones: async () => {
    return api.get<{ timezones: Timezone[] }>('/auth/timezones');
  },
};
