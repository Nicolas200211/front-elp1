import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../api/authService';
import type { AuthResponse } from '../api/config';
import { useNavigate, useLocation } from 'react-router';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Estados
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Hooks de React Router
  const navigate = useNavigate();
  const location = useLocation();
  
  // Efecto para verificar autenticación inicial
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        const accessToken = authService.getAccessToken();
        
        if (currentUser && accessToken) {
          setUser(currentUser);
        } else {
          // Clear any invalid auth data
          authService.logout();
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to check authentication:', error);
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    // Solo ejecutar checkAuth en el cliente
    if (typeof window !== 'undefined') {
      checkAuth();
    }
  }, []);
  
  // Efecto para manejar redirecciones basadas en autenticación
  useEffect(() => {
    // No hacer nada si aún estamos cargando
    if (initialLoad) return;
    
    // Si el usuario no está autenticado y no está en la página de login, redirigir al login
    if (!user && !location.pathname.startsWith('/login')) {
      navigate('/login', { replace: true });
    }
    // Si el usuario está autenticado y está en la página de login, redirigir al dashboard
    else if (user && location.pathname.startsWith('/login')) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, location.pathname, navigate, initialLoad]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Iniciando proceso de login para:', email);
      
      // Llamar al servicio de autenticación
      const response = await authService.login({ email, password });
      console.log('Respuesta del servicio de autenticación:', response);
      
      // Verificar que la respuesta tenga la estructura esperada
      if (!response || !response.user || !response.accessToken) {
        console.error('Respuesta de autenticación inválida:', response);
        throw new Error('La respuesta del servidor es inválida');
      }
      
      // Actualizar el estado del usuario
      setUser(response.user);
      
      // No es necesario llamar a setCurrentUser ni setTokens aquí ya que
      // ya se llaman dentro de authService.login
      
      console.log('Login exitoso, redirigiendo a /dashboard');
      
      // Retrasar ligeramente la navegación para asegurar que el estado se actualice
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
      
      return response;
      
    } catch (error) {
      console.error('Error en el proceso de login:', error);
      
      // Limpiar cualquier dato de autenticación en caso de error
      authService.logout();
      setUser(null);
      
      // Proporcionar un mensaje de error más descriptivo
      let errorMessage = 'Error al iniciar sesión. Por favor, intente nuevamente.';
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.toLowerCase().includes('credenciales')) {
          errorMessage = 'Credenciales inválidas. Por favor, verifique su correo y contraseña.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Error de conexión. Por favor, verifique su conexión a internet.';
        } else {
          errorMessage = error.message || errorMessage;
        }
      }
      
      throw new Error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    // Solo redirigir si no estamos ya en la página de login
    if (location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [navigate, location.pathname]);

  const value = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
    loading,
  };

  // Mostrar un loader mientras se verifica la autenticación inicial
  if (initialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
