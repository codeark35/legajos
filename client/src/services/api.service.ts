import axios, { type AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3020/api/v1';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token JWT
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para manejar errores de autenticación
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expirado o inválido
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  getInstance(): AxiosInstance {
    return this.api;
  }

  // Métodos helpers
  get<T>(url: string, config?: any) {
    return this.api.get<T>(url, config);
  }

  post<T>(url: string, data?: any, config?: any) {
    return this.api.post<T>(url, data, config);
  }

  patch<T>(url: string, data?: any, config?: any) {
    return this.api.patch<T>(url, data, config);
  }

  delete<T>(url: string, config?: any) {
    return this.api.delete<T>(url, config);
  }
}

export const apiService = new ApiService();
export default apiService.getInstance();
