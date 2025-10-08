import apiHelper from '../utils/apiHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@user_data';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponseData {
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    roles: string[];
  };
  token: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginResponseData;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  roles: string[];
}

class AuthService {
  // Login
  async login(credentials: LoginCredentials) {
    const response = await apiHelper.post<LoginResponse>(
      '/login',
      credentials
    );
    console.log(response, 'response login');
    
    // Response structure: response.data.data (nested)
    if (response.success && response.data) {
      // Simpan token dan user data dari nested data
      await this.saveToken(response.data.token);
      await this.saveUser(response.data.user);
    }

    return response;
  }

  // Logout
  async logout() {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  }

  // Save token
  async saveToken(token: string) {
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
  }

  // Get token
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
  }

  // Save user
  async saveUser(user: User) {
    if (user) {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  // Get user
  async getUser(): Promise<User | null> {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Check if logged in
  async isLoggedIn(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  // Register (opsional)
  async register(userData: {
    email: string;
    password: string;
    name: string;
  }) {
    const response = await apiHelper.post<LoginResponse>(
      '/auth/register',
      userData
    );

    if (response.success && response.data) {
      await this.saveToken(response.data.token);
      await this.saveUser(response.data.user);
    }

    return response;
  }
}

export const authService = new AuthService();
export default authService;