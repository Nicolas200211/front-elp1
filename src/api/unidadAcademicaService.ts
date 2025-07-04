import { API_ENDPOINTS } from './config';
import type { UnidadAcademica } from './config';
import { api } from './apiClient';

/**
 * Servicio para gestionar las operaciones de unidades académicas
 */
export const unidadAcademicaService = {
  /**
   * Obtener todas las unidades académicas
   * @returns Promise<UnidadAcademica[]> Lista de unidades académicas
   */
  async getAll(): Promise<UnidadAcademica[]> {
    try {
      const response = await api.get<{ data: UnidadAcademica[] }>(API_ENDPOINTS.UNIDADES_ACADEMICAS.BASE);
      // The API returns { data: UnidadAcademica[] }
      return Array.isArray(response?.data) ? response.data : [];
    } catch (error) {
      console.error('Error al obtener las unidades académicas:', error);
      throw new Error('No se pudieron cargar las unidades académicas. Por favor, intente nuevamente.');
    }
  },

  /**
   * Buscar unidades académicas por término de búsqueda
   * @param query Término de búsqueda
   * @returns Promise<UnidadAcademica[]> Lista de unidades académicas que coinciden con la búsqueda
   */
  async search(query: string): Promise<UnidadAcademica[]> {
    try {
      const response = await api.get<{ data: UnidadAcademica[] }>(
        API_ENDPOINTS.UNIDADES_ACADEMICAS.SEARCH(query)
      );
      return Array.isArray(response?.data) ? response.data : [];
    } catch (error) {
      console.error('Error al buscar unidades académicas:', error);
      throw new Error('No se pudo realizar la búsqueda. Por favor, intente nuevamente.');
    }
  },

  /**
   * Obtener una unidad académica por su ID
   * @param id ID de la unidad académica
   * @returns Promise<UnidadAcademica> Datos de la unidad académica
   */
  async getById(id: string | number): Promise<UnidadAcademica> {
    try {
      const response = await api.get<{ data: UnidadAcademica }>(API_ENDPOINTS.UNIDADES_ACADEMICAS.BY_ID(id));
      if (!response?.data) {
        throw new Error('No se encontraron datos de la unidad académica');
      }
      return response.data;
    } catch (error) {
      console.error(`Error al obtener la unidad académica con ID ${id}:`, error);
      throw new Error('No se pudo cargar la unidad académica. Por favor, verifique el ID e intente nuevamente.');
    }
  },

  /**
   * Crear una nueva unidad académica
   * @param unidad Datos de la nueva unidad académica
   * @returns Promise<UnidadAcademica> Unidad académica creada
   */
  async create(unidad: Omit<UnidadAcademica, 'id'>): Promise<UnidadAcademica> {
    try {
      const response = await api.post<{ data: UnidadAcademica }>(
        API_ENDPOINTS.UNIDADES_ACADEMICAS.BASE, 
        unidad
      );
      if (!response?.data) {
        throw new Error('No se recibieron datos de la unidad académica creada');
      }
      return response.data;
    } catch (error) {
      console.error('Error al crear la unidad académica:', error);
      throw new Error('No se pudo crear la unidad académica. Verifique los datos e intente nuevamente.');
    }
  },

  /**
   * Actualizar una unidad académica existente
   * @param id ID de la unidad académica a actualizar
   * @param unidad Datos actualizados de la unidad académica
   * @returns Promise<UnidadAcademica> Unidad académica actualizada
   */
  async update(id: string | number, unidad: Partial<UnidadAcademica>): Promise<UnidadAcademica> {
    try {
      const response = await api.patch<{ data: UnidadAcademica }>(
        API_ENDPOINTS.UNIDADES_ACADEMICAS.BY_ID(id), 
        unidad
      );
      if (!response?.data) {
        throw new Error('No se recibieron datos de la unidad académica actualizada');
      }
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar la unidad académica con ID ${id}:`, error);
      throw new Error('No se pudo actualizar la unidad académica. Verifique los datos e intente nuevamente.');
    }
  },

  /**
   * Eliminar una unidad académica
   * @param id ID de la unidad académica a eliminar
   * @returns Promise<void>
   */
  async delete(id: string | number): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.UNIDADES_ACADEMICAS.BY_ID(id));
    } catch (error) {
      console.error(`Error al eliminar la unidad académica con ID ${id}:`, error);
      throw new Error('No se pudo eliminar la unidad académica. Por favor, intente nuevamente.');
    }
  },
};
