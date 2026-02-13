import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

interface LoginCredentials {
  email: string;
  password: string;
}

interface GoogleLoginData {
  email: string;
  name: string;
  google_id: string;
  avatar: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  roles: string[];
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    token: string;
  };
}

class AuthService {
  private API_BASE = API_URL || 'https://saban-group-leadnest.verse-realty.com/api';

  // Regular Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success && data.data?.token) {
        // Save token and user data
        await AsyncStorage.setItem('token', data.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Google Login - Kirim email, name, google_id, avatar
  async googleLogin(googleData: GoogleLoginData): Promise<AuthResponse> {
    try {
      console.log('Google login request:', googleData);

      const response = await fetch(`${this.API_BASE}/login/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(googleData),
      });

      const data = await response.json();
      console.log('Google login response:', data);

      if (data.success && data.data?.token) {
        // Save token and user data
        await AsyncStorage.setItem('token', data.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
      }

      return data;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (token) {
        await fetch(`${this.API_BASE}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      // Clear local storage
      await AsyncStorage.multiRemove(['token', 'user']);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local storage anyway
      await AsyncStorage.multiRemove(['token', 'user']);
    }
  }

  // Get stored token
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('token');
  }

  // Get stored user
  async getUser(): Promise<User | null> {
    const userString = await AsyncStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}

export const authService = new AuthService();
export default authService;