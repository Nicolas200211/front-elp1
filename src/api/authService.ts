import { API_ENDPOINTS } from './config';
import type { LoginCredentials, User } from './config';
import { api } from './apiClient';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    nombre: string;
    rol: string;
  };
}

interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  rol?: 'admin' | 'docente' | 'estudiante';
}

interface ProfileResponse {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  // Add other user fields as needed
}

// Store tokens in memory instead of localStorage for better security
let accessToken: string | null = null;
let refreshToken: string | null = null;

// Get stored tokens from localStorage on initial load
if (typeof window !== 'undefined') {
  accessToken = localStorage.getItem('accessToken');
  refreshToken = localStorage.getItem('refreshToken');
}

export const authService = {
  // Login user with email and password
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Intentando iniciar sesión con credenciales:', credentials);
      const response = await api.post(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials,
        { 
          skipAuth: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      ) as any; // Usamos any temporalmente para manejar la respuesta

      console.log('Respuesta del servidor:', response);

      // Verificar que la respuesta tenga los campos mínimos requeridos
      if (!response || !response.accessToken || !response.userId) {
        console.error('Respuesta del servidor inválida:', response);
        throw new Error('La respuesta del servidor no tiene el formato esperado');
      }

      // Mapear la respuesta al formato esperado por la aplicación
      const authResponse: AuthResponse = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken || '', // El servidor podría no enviar refreshToken
        user: {
          id: response.userId,
          email: response.email,
          nombre: response.nombre || response.email.split('@')[0], // Usar el email como nombre si no viene
          rol: response.role.toLowerCase() // Asegurarse de que el rol esté en minúsculas
        }
      };

      // Guardar tokens y datos del usuario
      this.setTokens({
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken
      });
      this.setCurrentUser(authResponse.user);

      console.log('Inicio de sesión exitoso para el usuario:', authResponse.user.email);
      return authResponse;
    } catch (error) {
      console.error('Error en authService.login:', error);
      
      // Proporcionar un mensaje de error más descriptivo
      let errorMessage = 'Error al iniciar sesión';
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = 'Credenciales inválidas';
        } else if (error.message.includes('network')) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
        } else {
          errorMessage = error.message || errorMessage;
        }
      }
      
      throw new Error(errorMessage);
    }
  },

  // Register a new admin user
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // Default role to 'admin' if not provided
      const data = { ...userData, rol: userData.rol || 'admin' };
      
      const response = await api.post(
        '/api/auth/register',
        data,
        { skipAuth: true }
      ) as AuthResponse;

      // Save tokens and user data if registration includes auto-login
      if (response.accessToken) {
        this.setTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken || ''
        });
        this.setCurrentUser(response.user);
      }

      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  // Get current user profile
  async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await api.get('/api/auth/profile') as ProfileResponse;
      // Update current user data
      if (response) {
        this.setCurrentUser(response);
      }
      return response;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  },

  // Verify if current user is admin
  async verifyAdmin(): Promise<boolean> {
    try {
      await api.get('/api/auth/admin');
      return true;
    } catch (error) {
      console.error('Admin verification failed:', error);
      return false;
    }
  },

  // Logout user
  logout(): void {
    // Clear tokens from memory
    accessToken = null;
    refreshToken = null;
    
    // Clear tokens from storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    // El redireccionamiento ahora se maneja en el AuthContext
  },

  // Get current access token
  getAccessToken(): string | null {
    return accessToken;
  },

  // Set tokens in memory and storage
  setTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken }: { accessToken: string; refreshToken: string }): void {
    accessToken = newAccessToken;
    refreshToken = newRefreshToken;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },

  // Get current user from token
  getCurrentUser(): User | null {
    try {
      // Try to get from memory first
      const userData = localStorage.getItem('user');
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Set current user
  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },

  // Refresh access token using refresh token
  async refreshAccessToken(): Promise<string | null> {
    const currentRefreshToken = refreshToken;
    if (!currentRefreshToken) {
      this.logout();
      return null;
    }

    try {
      // Use type assertion to handle the response
      const response = await api.post(
        API_ENDPOINTS.AUTH.REFRESH,
        { refreshToken: currentRefreshToken },
        { skipAuth: true }
      ) as { accessToken: string };

      if (!response?.accessToken) {
        throw new Error('Respuesta inválida del servidor');
      }

      this.setTokens({
        accessToken: response.accessToken,
        refreshToken: currentRefreshToken // Keep the same refresh token
      });

      return response.accessToken;
    } catch (error) {
      console.error('Error al actualizar el token de acceso:', error);
      this.logout();
      return null;
    }
  }
};
