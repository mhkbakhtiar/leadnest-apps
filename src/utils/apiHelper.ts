const BASE_URL = 'https://leadnesttrial.bizmap.id/api'; // change with URL API

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  token?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiHelper {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { method = 'GET', headers = {}, body, token } = options;

    const config: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await response.json();
      
      console.log('Incoming url:', `${this.baseUrl}${endpoint}`);
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan');
      }

      // Return data langsung tanpa wrapping
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', token });
  }

  // POST request
  async post<T>(
    endpoint: string,
    body: any,
    token?: string
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, token });
  }

  // PUT request
  async put<T>(
    endpoint: string,
    body: any,
    token?: string
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, token });
  }

  // DELETE request
  async delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', token });
  }

  // PATCH request
  async patch<T>(
    endpoint: string,
    body: any,
    token?: string
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body, token });
  }

  // Update base URL
  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  // Update default headers
  setDefaultHeaders(headers: Record<string, string>) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }
}

export const apiHelper = new ApiHelper();
export default apiHelper;