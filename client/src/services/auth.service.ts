import { apiService } from './api.service';
import type { AuthResponse, LoginCredentials, Usuario } from '../types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('AuthService.login - Enviando credenciales:', credentials.email);
    const response = await apiService.post<any>('/auth/login', credentials);
    console.log('AuthService.login - Respuesta recibida:', response.data);
    
    // El backend envuelve la respuesta en { success, data, timestamp }
    const authData = response.data.data || response.data;
    const { access_token, user } = authData;
    
    if (!access_token) {
      console.error('No se recibió access_token. Respuesta completa:', response.data);
      console.error('authData:', authData);
      throw new Error('No se recibió token de autenticación');
    }
    
    // Guardar token y usuario en localStorage
    console.log('✓ Token recibido:', access_token.substring(0, 20) + '...');
    console.log('✓ Usuario:', user);
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    console.log('✓ Login completado exitosamente');
    return authData;
  }

  async register(data: any): Promise<AuthResponse> {
    const response = await apiService.post<any>('/auth/register', data);
    
    // El backend envuelve la respuesta en { success, data, timestamp }
    const authData = response.data.data || response.data;
    const { access_token, user } = authData;
    
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return authData;
  }

  async getProfile(): Promise<Usuario> {
    const response = await apiService.get<any>('/auth/profile');
    // El backend envuelve la respuesta en { success, data, timestamp }
    return response.data.data || response.data;
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): Usuario | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export const authService = new AuthService();
