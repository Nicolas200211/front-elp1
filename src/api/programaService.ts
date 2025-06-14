import { API_ENDPOINTS } from './config';
import type { Programa } from './config';
import { api } from './apiClient';

export const programaService = {
  /**
   * Obtener todos los programas académicos
   * @returns Promise<Programa[]> Lista de programas académicos
   */
  async getAll(): Promise<Programa[]> {
    try {
      console.log('Fetching programs from:', API_ENDPOINTS.PROGRAMACION_GENERAL.BASE);
      const response = await api.get(API_ENDPOINTS.PROGRAMACION_GENERAL.BASE);
      console.log('Programs API response:', response);
      
      // Handle different response structures
      let programsData = [];
      
      // Case 1: Response has a data property that's an array
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        programsData = response.data;
      } 
      // Case 2: Response is directly an array
      else if (Array.isArray(response)) {
        programsData = response;
      }
      
      console.log('Extracted programs data:', programsData);
      
      // Map the data to the Programa interface
      return programsData.map((item: any) => ({
        id: item.id,
        nombre: item.nombre || 'Sin nombre',
        codigo: item.codigo || `PRG-${item.id}`,
        descripcion: item.descripcion || '',
        idUnidad: item.idUnidad || item.id_unidad || 1, // Default to 1 if not provided
        estado: item.estado || 'Activo'
      }));
      
    } catch (error) {
      console.error('Error al obtener los programas académicos:', error);
      // Return empty array instead of throwing to prevent UI breakage
      return [];
    }
  },

  /**
   * Obtener un programa académico por su ID
   * @param id ID del programa académico
   * @returns Promise<Programa> Datos del programa académico
   */
  async getById(id: string | number): Promise<Programa> {
    try {
      const response = await api.get(API_ENDPOINTS.PROGRAMACION_GENERAL.BY_ID(String(id)));
      const item = response?.data;
      return {
        id: item.id,
        nombre: item.nombre,
        codigo: item.codigo || '',
        descripcion: item.descripcion,
        idUnidad: item.idUnidad,
        estado: item.estado || 'Activo'
      };
    } catch (error) {
      console.error(`Error al obtener el programa académico con ID ${id}:`, error);
      throw new Error('No se pudo cargar el programa académico. Por favor, intente nuevamente.');
    }
  },

  /**
   * Crear un nuevo programa académico
   * @param programa Datos del nuevo programa académico
   * @returns Promise<Programa> Programa académico creado
   */
  async create(programa: Omit<Programa, 'id'>): Promise<Programa> {
    try {
      const response = await api.post(API_ENDPOINTS.PROGRAMACION_GENERAL.BASE, {
        nombre: programa.nombre,
        codigo: programa.codigo,
        descripcion: programa.descripcion,
        idUnidad: programa.idUnidad,
        estado: programa.estado || 'Activo'
      });
      return {
        ...response?.data,
        estado: response?.data.estado || 'Activo'
      };
    } catch (error) {
      console.error('Error al crear el programa académico:', error);
      throw new Error('No se pudo crear el programa académico. Por favor, intente nuevamente.');
    }
  },

  /**
   * Actualizar un programa académico existente
   * @param id ID del programa académico a actualizar
   * @param programa Datos actualizados del programa académico
   * @returns Promise<Programa> Programa académico actualizado
   */
  async update(id: string | number, programa: Partial<Programa>): Promise<Programa> {
    try {
      const response = await api.put(API_ENDPOINTS.PROGRAMACION_GENERAL.BY_ID(String(id)), {
        ...programa,
        estado: programa.estado || 'Activo'
      });
      return {
        ...response?.data,
        estado: response?.data.estado || 'Activo'
      };
    } catch (error) {
      console.error(`Error al actualizar el programa académico con ID ${id}:`, error);
      throw new Error('No se pudo actualizar el programa académico. Por favor, intente nuevamente.');
    }
  },

  /**
   * Eliminar un programa académico
   * @param id ID del programa académico a eliminar
   * @returns Promise<void>
   */
  async delete(id: string | number): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.PROGRAMACION_GENERAL.BY_ID(String(id)));
    } catch (error) {
      console.error(`Error al eliminar el programa académico con ID ${id}:`, error);
      throw new Error('No se pudo eliminar el programa académico. Por favor, intente nuevamente.');
    }
  },
};
