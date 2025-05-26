
import { authService } from './authService';

export interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
  isRetry?: boolean;
}

/**
 * Makes an API request with authentication handling
 * @template T Expected response type
 * @param endpoint API endpoint URL
 * @param options Fetch options with additional configuration
 * @returns Promise with the response data
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { skipAuth = false, isRetry = false, ...fetchOptions } = options;
  
  // Set default headers
  const headers = new Headers(fetchOptions.headers);
  headers.set('Content-Type', 'application/json');
  
  // Add authorization header if not skipped
  if (!skipAuth) {
    const token = authService.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  try {
    console.log('Making request to:', endpoint);
    console.log('Request headers:', Object.fromEntries(headers.entries()));
    
    const response = await fetch(endpoint, {
      ...fetchOptions,
      headers,
      credentials: 'include', // Important for cookies, if using them
    });
    
    console.log('Response status:', response.status, response.statusText);

    // Handle 401 Unauthorized - try to refresh token if this is not a retry
    if (response.status === 401 && !skipAuth && !isRetry) {
      const newToken = await authService.refreshAccessToken();
      if (newToken) {
        // Retry the original request with the new token
        return apiRequest<T>(endpoint, {
          ...options,
          isRetry: true,
        });
      } else {
        // If refresh token fails, log the user out
        authService.logout();
        window.location.href = '/login';
        throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      }
    }

    // Handle other error statuses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 
                         errorData.error || 
                         `Error en la solicitud (${response.status})`;
      
      // Show error toast for better user feedback
      if (typeof window !== 'undefined') {
        const { toast } = await import('react-toastify');
        toast.error(errorMessage);
      }
      
      throw new Error(errorMessage);
    }

    // For 204 No Content responses, return null
    if (response.status === 204) {
      return null as unknown as T;
    }

    // Parse and return the JSON response
    return await response.json();
  } catch (error) {
    console.error('Error en la solicitud API:', error);
    
    // Only show toast in browser environment
    if (typeof window !== 'undefined') {
      const { toast } = await import('react-toastify');
      toast.error(error instanceof Error ? error.message : 'Error en la conexión con el servidor');
    }
    
    throw error;
  }
}

// Helper function for common HTTP methods
const createApiMethod = <T>(
  method: string
): ((url: string, data?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>) => Promise<T>) => {
  return async (url: string, data?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>) => {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });

    // Add authorization header if not skipped
    if (!options?.skipAuth) {
      const token = authService.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
    const response = await apiRequest<T>(url, {
      method,
      headers: Object.fromEntries(headers.entries()),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    return response;
  };
};

// API client with common methods
export const api = {
  request: apiRequest,
  get: createApiMethod('GET'),
  post: createApiMethod('POST'),
  put: createApiMethod('PUT'),
  patch: createApiMethod('PATCH'),
  delete: createApiMethod('DELETE'),
};
