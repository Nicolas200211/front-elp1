import { API_ENDPOINTS } from './config';
import type { ProgramacionGeneral } from './config';
import { api } from './apiClient';


export const programacionGeneralService = {
  // Obtener todas las programaciones generales
  getAll: async (): Promise<ProgramacionGeneral[]> => {
    console.log('Obteniendo programaciones desde:', API_ENDPOINTS.PROGRAMACION_GENERAL.BASE);
    try {
      // Usamos any temporalmente ya que la API devuelve un array directamente
      const response = await api.get(API_ENDPOINTS.PROGRAMACION_GENERAL.BASE) as any;
      console.log('Respuesta de la API:', response);
      
      // Si la respuesta es un array, lo devolvemos directamente
      if (Array.isArray(response)) {
        return response;
      }
      
      // Si la respuesta tiene una propiedad data que es un array, la devolvemos
      if (response && Array.isArray(response.data)) {
        return response.data;
      }
      
      console.warn('La respuesta no tiene el formato esperado:', response);
      return [];
    } catch (error) {
      console.error('Error en programacionGeneralService.getAll:', error);
      throw error;
    }
  },

  // Obtener una programación general por ID
  getById: async (id: number): Promise<ProgramacionGeneral> => {
    try {
      const response = await api.get(API_ENDPOINTS.PROGRAMACION_GENERAL.BY_ID(id)) as any;
      console.log('Respuesta de getById:', response);
      
      // Si la respuesta es un objeto con la programación, lo devolvemos directamente
      if (response && typeof response === 'object' && 'id' in response) {
        return response;
      }
      
      // Si la respuesta tiene una propiedad data, la devolvemos
      if (response && response.data) {
        return response.data;
      }
      
      throw new Error('Formato de respuesta inesperado');
    } catch (error) {
      console.error(`Error al obtener la programación con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear una nueva programación general
  create: async (data: Omit<ProgramacionGeneral, 'id' | 'fecha_creacion' | 'estado'>): Promise<ProgramacionGeneral> => {
    try {
      const response = await api.post(
        API_ENDPOINTS.PROGRAMACION_GENERAL.BASE,
        {
          ...data,
          estado: 'Borrador' // Estado por defecto
        }
      ) as any;
      
      console.log('Respuesta de create:', response);
      
      // Si la respuesta es un objeto con la programación, lo devolvemos directamente
      if (response && typeof response === 'object' && 'id' in response) {
        return response;
      }
      
      // Si la respuesta tiene una propiedad data, la devolvemos
      if (response && response.data) {
        return response.data;
      }
      
      throw new Error('Formato de respuesta inesperado');
    } catch (error) {
      console.error('Error al crear la programación:', error);
      throw error;
    }
  },

  // Actualizar una programación general existente
  update: async (id: number, data: Partial<ProgramacionGeneral>): Promise<ProgramacionGeneral> => {
    try {
      const response = await api.put(
        API_ENDPOINTS.PROGRAMACION_GENERAL.BY_ID(id),
        data
      ) as any;
      
      console.log(`Respuesta de update para ID ${id}:`, response);
      
      // Si la respuesta es un objeto con la programación, lo devolvemos directamente
      if (response && typeof response === 'object' && 'id' in response) {
        return response;
      }
      
      // Si la respuesta tiene una propiedad data, la devolvemos
      if (response && response.data) {
        return response.data;
      }
      
      throw new Error('Formato de respuesta inesperado');
    } catch (error) {
      console.error(`Error al actualizar la programación con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar una programación general
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(API_ENDPOINTS.PROGRAMACION_GENERAL.BY_ID(id));
      console.log(`Programación con ID ${id} eliminada correctamente`);
    } catch (error) {
      console.error(`Error al eliminar la programación con ID ${id}:`, error);
      throw error;
    }
  },

  // Cambiar el estado de una programación general
  cambiarEstado: async (id: number, estado: 'Activo' | 'Inactivo' | 'Borrador' | 'Finalizado'): Promise<ProgramacionGeneral> => {
    try {
      const response = await api.patch(
        `${API_ENDPOINTS.PROGRAMACION_GENERAL.BASE}/${id}/estado`,
        { estado }
      ) as any;
      
      console.log(`Respuesta de cambiarEstado para ID ${id}:`, response);
      
      // Si la respuesta es un objeto con la programación, lo devolvemos directamente
      if (response && typeof response === 'object' && 'id' in response) {
        return response;
      }
      
      // Si la respuesta tiene una propiedad data, la devolvemos
      if (response && response.data) {
        return response.data;
      }
      
      throw new Error('Formato de respuesta inesperado');
    } catch (error) {
      console.error(`Error al cambiar el estado de la programación con ID ${id}:`, error);
      throw error;
    }
  },

  // Obtener programaciones por unidad académica
  getByUnidad: async (idUnidad: number): Promise<ProgramacionGeneral[]> => {
    try {
      const response = await api.get(
        API_ENDPOINTS.PROGRAMACION_GENERAL.BY_UNIDAD(idUnidad)
      ) as any;
      
      console.log(`Respuesta de getByUnidad para ID ${idUnidad}:`, response);
      
      // Si la respuesta es un array, lo devolvemos directamente
      if (Array.isArray(response)) {
        return response;
      }
      
      // Si la respuesta tiene una propiedad data que es un array, la devolvemos
      if (response && Array.isArray(response.data)) {
        return response.data;
      }
      
      console.warn('La respuesta no tiene el formato esperado:', response);
      return [];
    } catch (error) {
      console.error(`Error al obtener programaciones por unidad ${idUnidad}:`, error);
      throw error;
    }
  },

  // Obtener programaciones por estado
  getByEstado: async (estado: string): Promise<ProgramacionGeneral[]> => {
    try {
      const response = await api.get(
        API_ENDPOINTS.PROGRAMACION_GENERAL.BY_ESTADO(estado)
      ) as any;
      
      console.log(`Respuesta de getByEstado para estado ${estado}:`, response);
      
      // Si la respuesta es un array, lo devolvemos directamente
      if (Array.isArray(response)) {
        return response;
      }
      
      // Si la respuesta tiene una propiedad data que es un array, la devolvemos
      if (response && Array.isArray(response.data)) {
        return response.data;
      }
      
      console.warn('La respuesta no tiene el formato esperado:', response);
      return [];
    } catch (error) {
      console.error(`Error al obtener programaciones por estado ${estado}:`, error);
      throw error;
    }
  }
};
