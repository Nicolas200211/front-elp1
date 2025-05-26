import { API_ENDPOINTS } from './config';
import type { Aula } from './config';
import { api } from './apiClient';

export const aulaService = {
  // Obtener todas las aulas
  async getAll(): Promise<Aula[]> {
    try {
      const response = await api.get(API_ENDPOINTS.AULAS.BASE);
      
      // Manejar respuesta paginada { data: Aula[], meta: {...} }
      if (response && typeof response === 'object' && 'data' in response) {
        return Array.isArray(response.data) ? response.data : [];
      }
      
      // Manejar caso donde la respuesta es directamente un array
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error al obtener las aulas:', error);
      return [];
    }
  },

  // Obtener un aula por ID
  async getById(id: number): Promise<Aula> {
    try {
      const response = await api.get(API_ENDPOINTS.AULAS.BY_ID(id));
      return response as Aula;
    } catch (error) {
      console.error(`Error al obtener el aula con ID ${id}:`, error);
      throw new Error('No se pudo cargar el aula. Por favor, verifique el ID e intente nuevamente.');
    }
  },

  // Obtener aula por código
  async getByCodigo(codigo: string): Promise<Aula> {
    try {
      const response = await api.get(API_ENDPOINTS.AULAS.BY_CODIGO(codigo));
      return response as Aula;
    } catch (error) {
      console.error(`Error al obtener el aula con código ${codigo}:`, error);
      throw new Error('No se pudo cargar el aula. Por favor, verifique el código e intente nuevamente.');
    }
  },

  // Obtener aulas disponibles
  async getDisponibles(): Promise<Aula[]> {
    try {
      const response = await api.get(API_ENDPOINTS.AULAS.DISPONIBLES);
      return response as Aula[];
    } catch (error) {
      console.error('Error al obtener las aulas disponibles:', error);
      throw new Error('No se pudieron cargar las aulas disponibles. Por favor, intente nuevamente.');
    }
  },

  // Obtener disponibilidad de un aula
  async getDisponibilidad(id: number): Promise<any> {
    try {
      return await api.get(API_ENDPOINTS.AULAS.DISPONIBILIDAD(id));
    } catch (error) {
      console.error(`Error al obtener la disponibilidad del aula ${id}:`, error);
      throw new Error('No se pudo cargar la disponibilidad del aula. Por favor, intente nuevamente.');
    }
  },

  // Crear un nuevo aula
  async create(aula: Omit<Aula, 'id'>): Promise<Aula> {
    try {
      const response = await api.post(API_ENDPOINTS.AULAS.BASE, aula);
      return response as Aula;
    } catch (error: any) {
      console.error('Error al crear el aula:', error);
      throw new Error(error.message || 'No se pudo crear el aula. Verifique los datos e intente nuevamente.');
    }
  },

  // Actualizar un aula existente
  async update(id: number, aula: Partial<Aula>): Promise<Aula> {
    try {
      const response = await api.put(API_ENDPOINTS.AULAS.BY_ID(id), aula);
      return response as Aula;
    } catch (error: any) {
      console.error(`Error al actualizar el aula con ID ${id}:`, error);
      throw new Error(error.message || 'No se pudo actualizar el aula. Verifique los datos e intente nuevamente.');
    }
  },

  // Eliminar un aula
  async delete(id: number): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.AULAS.BY_ID(id));
    } catch (error: any) {
      console.error(`Error al eliminar el aula con ID ${id}:`, error);
      throw new Error(error.message || 'No se pudo eliminar el aula. Por favor, intente nuevamente.');
    }
  },
};
