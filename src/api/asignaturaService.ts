import { API_ENDPOINTS } from './config';
import type { Asignatura } from './config';
import { api } from './apiClient';

export const asignaturaService = {
  /**
   * Obtener lista de todas las asignaturas
   * @returns Promise<Asignatura[]> Lista de asignaturas
   */
  async getAll(): Promise<Asignatura[]> {
    try {
      const response = await api.get(API_ENDPOINTS.ASIGNATURAS.BASE);
      // Handle response with data and meta properties
      if (response && typeof response === 'object' && 'data' in response) {
        return Array.isArray(response.data) ? response.data : [];
      }
      return [];
    } catch (error) {
      console.error('Error al obtener las asignaturas:', error);
      throw new Error('No se pudieron cargar las asignaturas. Por favor, intente nuevamente.');
    }
  },

  /**
   * Obtener una asignatura por su ID
   * @param id ID de la asignatura
   * @returns Promise<Asignatura> Datos de la asignatura
   */
  async getById(id: string | number): Promise<Asignatura> {
    try {
      const response = await api.get(API_ENDPOINTS.ASIGNATURAS.BY_ID(id));
      // Handle response with data property
      if (response && typeof response === 'object' && 'data' in response) {
        return response.data as Asignatura;
      }
      throw new Error('No se encontraron datos de la asignatura');
    } catch (error) {
      console.error(`Error al obtener la asignatura con ID ${id}:`, error);
      throw new Error('No se pudo cargar la asignatura. Por favor, verifique el ID e intente nuevamente.');
    }
  },

  /**
   * Crear una nueva asignatura
   * @param asignatura Datos de la nueva asignatura
   * @returns Promise<Asignatura> Asignatura creada
   */
  async create(asignatura: Omit<Asignatura, 'id'>): Promise<Asignatura> {
    try {
      const response = await api.post(API_ENDPOINTS.ASIGNATURAS.BASE, asignatura) as unknown;
      
      // If we get a response with data, return it
      if (response && typeof response === 'object') {
        // Some APIs might return the created object directly, others might wrap it in a 'data' property
        if ('data' in response) {
          return (response as { data: Asignatura }).data;
        }
        // If the response is the actual data (common with 201 responses)
        return response as Asignatura;
      }
      
      // If no response data, return the original data with a generated ID (or throw an error if that's not appropriate)
      // This is a fallback and might need adjustment based on your API behavior
      return { ...asignatura, id: Date.now() } as Asignatura;
    } catch (error) {
      console.error('Error al crear la asignatura:', error);
      throw new Error('No se pudo crear la asignatura. Verifique los datos e intente nuevamente.');
    }
  },

  /**
   * Actualizar una asignatura existente
   * @param id ID de la asignatura a actualizar
   * @param asignatura Datos actualizados de la asignatura
   * @returns Promise<Asignatura> Asignatura actualizada
   */
  async update(id: string | number, asignatura: Partial<Asignatura>): Promise<Asignatura> {
    try {
      const response = await api.patch(API_ENDPOINTS.ASIGNATURAS.BY_ID(id), asignatura);
      // Handle response with data property
      if (response && typeof response === 'object' && 'data' in response) {
        return response.data as Asignatura;
      }
      throw new Error('No se recibieron datos de la asignatura actualizada');
    } catch (error) {
      console.error(`Error al actualizar la asignatura con ID ${id}:`, error);
      throw new Error('No se pudo actualizar la asignatura. Verifique los datos e intente nuevamente.');
    }
  },

  /**
   * Eliminar una asignatura
   * @param id ID de la asignatura a eliminar
   * @returns Promise<void>
   */
  async delete(id: string | number): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.ASIGNATURAS.BY_ID(id));
    } catch (error) {
      console.error(`Error al eliminar la asignatura con ID ${id}:`, error);
      throw new Error('No se pudo eliminar la asignatura. Por favor, intente nuevamente.');
    }
  },

  /**
   * Obtener asignaturas por programa académico
   * @param programaId ID del programa académico
   * @returns Promise<Asignatura[]> Lista de asignaturas del programa
   */
  async getByPrograma(programaId: string | number): Promise<Asignatura[]> {
    try {
      const response = await api.get(API_ENDPOINTS.ASIGNATURAS.BY_PROGRAMA(programaId));
      // Handle response with data and meta properties
      if (response && typeof response === 'object' && 'data' in response) {
        return Array.isArray(response.data) ? response.data : [];
      }
      return [];
    } catch (error) {
      console.error(`Error al obtener las asignaturas del programa ${programaId}:`, error);
      throw new Error('No se pudieron cargar las asignaturas del programa. Por favor, intente nuevamente.');
    }
  },

  /**
   * Obtener asignaturas por docente
   * @param docenteId ID del docente
   * @returns Promise<Asignatura[]> Lista de asignaturas del docente
   */
  async getByDocente(docenteId: string | number): Promise<Asignatura[]> {
    try {
      const response = await api.get(API_ENDPOINTS.ASIGNATURAS.BY_DOCENTE(docenteId));
      // Handle response with data and meta properties
      if (response && typeof response === 'object' && 'data' in response) {
        return Array.isArray(response.data) ? response.data : [];
      }
      return [];
    } catch (error) {
      console.error(`Error al obtener las asignaturas del docente ${docenteId}:`, error);
      throw new Error('No se pudieron cargar las asignaturas del docente. Por favor, intente nuevamente.');
    }
  },
};
