import { API_ENDPOINTS } from './config';
import type { Ciclo } from './config';
import { apiRequest } from './apiClient';

export const cicloService = {
  // Obtener todos los ciclos
  getAll: async (): Promise<Ciclo[]> => {
    console.log('Obteniendo todos los ciclos...');
    try {
      const data = await apiRequest<Ciclo[]>(API_ENDPOINTS.CICLOS.BASE);
      console.log('Datos recibidos en cicloService.getAll:', data);
      return data;
    } catch (error) {
      console.error('Error en cicloService.getAll:', error);
      throw error;
    }
  },

  // Obtener un ciclo por ID
  getById: async (id: number): Promise<Ciclo> => {
    return apiRequest<Ciclo>(API_ENDPOINTS.CICLOS.BY_ID(id));
  },

  // Crear un nuevo ciclo
  create: async (data: Omit<Ciclo, 'id' | 'nombre'>): Promise<Ciclo> => {
    return apiRequest<Ciclo>(API_ENDPOINTS.CICLOS.BASE, {
      method: 'POST',
      body: JSON.stringify(data)
    }); 
  },

  // Actualizar un ciclo existente
  update: async (id: number, data: Partial<Ciclo>): Promise<Ciclo> => {
    return apiRequest<Ciclo>(API_ENDPOINTS.CICLOS.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Eliminar un ciclo
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(API_ENDPOINTS.CICLOS.BY_ID(id), {
      method: 'DELETE'
    });
  },

  // Cambiar el estado de un ciclo
  cambiarEstado: async (id: number, estado: string): Promise<Ciclo> => {
    return apiRequest<Ciclo>(`${API_ENDPOINTS.CICLOS.BASE}/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado })
    });
  },

  // Obtener ciclos por año
  getByAnio: async (anio: number): Promise<Ciclo[]> => {
    // Usar parámetros de consulta en lugar de segmentos de ruta
    const url = `${API_ENDPOINTS.CICLOS.BASE}?anio=${anio}`;
    return apiRequest<Ciclo[]>(url);
  },

  // Obtener ciclos por estado
  getByEstado: async (estado: string): Promise<Ciclo[]> => {
    // Usar parámetros de consulta en lugar de segmentos de ruta
    const url = `${API_ENDPOINTS.CICLOS.BASE}?estado=${encodeURIComponent(estado)}`;
    return apiRequest<Ciclo[]>(url);
  },

  // Obtener el ciclo actual
  getActual: async (): Promise<Ciclo> => {
    return apiRequest<Ciclo>(API_ENDPOINTS.CICLOS.ACTUAL);
  }
};
