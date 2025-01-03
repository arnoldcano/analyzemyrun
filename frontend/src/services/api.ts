import axios, { InternalAxiosRequestConfig } from 'axios';

// Types
export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
}

export interface LoginData {
  username: string;  // FastAPI OAuth2 expects 'username' instead of 'email'
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',  // OAuth2 requires form-urlencoded
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to convert data to form-urlencoded format
const toFormData = (data: Record<string, any>): string => {
  return Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
};

// Authentication API functions
export const authApi = {
  login: async (data: LoginData): Promise<TokenResponse> => {
    const formData = toFormData({
      username: data.username,  // Using username instead of email
      password: data.password,
      grant_type: 'password',
    });
    
    const response = await api.post<TokenResponse>('/auth/login', formData);
    return response.data;
  },

  register: async (data: RegisterData): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/auth/register', data, {
      headers: {
        'Content-Type': 'application/json',  // Registration uses JSON
      },
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');  // FastAPI endpoint is usually /users/me
    return response.data;
  },
};

export default api; 