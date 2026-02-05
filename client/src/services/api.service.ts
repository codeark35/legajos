import axios, { type AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3040/api/v1';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000, // 10 segundos timeout
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

    // Interceptor para manejar errores de autenticación y timeouts
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Manejo de token expirado o inválido
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(new Error('Sesión expirada. Por favor, inicia sesión nuevamente.'));
        }

        // Manejo de timeout
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          return Promise.reject(new Error('La solicitud tardó demasiado. Verifica tu conexión.'));
        }

        // Manejo de error de red
        if (!error.response) {
          return Promise.reject(new Error('Error de conexión. Verifica tu conexión a internet.'));
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
