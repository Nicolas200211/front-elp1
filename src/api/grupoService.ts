import { API_ENDPOINTS } from './config';
import type { Grupo } from './config';
import { api } from './apiClient';

export const grupoService = {
  // Obtener todos los grupos
  async getAll(): Promise<Grupo[]> {
    try {
      const response = await api.get(API_ENDPOINTS.GRUPOS.BASE);
      if (Array.isArray(response)) {
        return response;
      }
      return (response as any)?.data || [];
    } catch (error) {
      console.error('Error al obtener los grupos:', error);
      throw new Error('No se pudieron cargar los grupos. Por favor, intente nuevamente.');
    }
  },

  // Buscar grupos
  async search(query: string): Promise<Grupo[]> {
    try {
      const response = await api.get(API_ENDPOINTS.GRUPOS.SEARCH(query));
      if (Array.isArray(response)) {
        return response;
      }
      return (response as any)?.data || [];
    } catch (error) {
      console.error('Error al buscar grupos:', error);
      throw new Error('No se pudo realizar la búsqueda. Por favor, intente nuevamente.');
    }
  },

  // Obtener grupos por programa
  async getByPrograma(idPrograma: number): Promise<Grupo[]> {
    try {
      const response = await api.get(API_ENDPOINTS.GRUPOS.BY_PROGRAMA(idPrograma));
      if (Array.isArray(response)) {
        return response;
      }
      return (response as any)?.data || [];
    } catch (error) {
      console.error(`Error al obtener los grupos del programa ${idPrograma}:`, error);
      throw new Error('No se pudieron cargar los grupos del programa. Por favor, intente nuevamente.');
    }
  },

  // Obtener grupos por ciclo
  async getByCiclo(idCiclo: number): Promise<Grupo[]> {
    try {
      const response = await api.get(API_ENDPOINTS.GRUPOS.BY_CICLO(idCiclo));
      if (Array.isArray(response)) {
        return response;
      }
      return (response as any)?.data || [];
    } catch (error) {
      console.error(`Error al obtener los grupos del ciclo ${idCiclo}:`, error);
      throw new Error('No se pudieron cargar los grupos del ciclo. Por favor, intente nuevamente.');
    }
  },

  // Obtener un grupo por ID
  async getById(id: number): Promise<Grupo> {
    try {
      const response = await api.get(API_ENDPOINTS.GRUPOS.BY_ID(id));
      return (response as any)?.data || response as Grupo;
    } catch (error) {
      console.error(`Error al obtener el grupo con ID ${id}:`, error);
      throw new Error('No se pudo cargar el grupo. Por favor, verifique el ID e intente nuevamente.');
    }
  },

  // Crear un nuevo grupo
  async create(grupo: Omit<Grupo, 'id'>): Promise<Grupo> {
    try {
      const response = await api.post(API_ENDPOINTS.GRUPOS.BASE, grupo);
      return (response as any)?.data || response as Grupo;
    } catch (error: any) {
      console.error('Error al crear el grupo:', error);
      throw new Error(error.message || 'No se pudo crear el grupo. Verifique los datos e intente nuevamente.');
    }
  },

  // Actualizar un grupo existente
  async update(id: number, grupo: Partial<Grupo>): Promise<Grupo> {
    try {
      const response = await api.put(API_ENDPOINTS.GRUPOS.BY_ID(id), grupo);
      return (response as any)?.data || response as Grupo;
    } catch (error: any) {
      console.error(`Error al actualizar el grupo con ID ${id}:`, error);
      throw new Error(error.message || 'No se pudo actualizar el grupo. Verifique los datos e intente nuevamente.');
    }
  },

  // Eliminar un grupo
  async delete(id: number): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.GRUPOS.BY_ID(id));
    } catch (error: any) {
      console.error(`Error al eliminar el grupo con ID ${id}:`, error);
      throw new Error(error.message || 'No se pudo eliminar el grupo. Por favor, intente nuevamente.');
    }
  },

  // Obtener ciclos (simulado, en un caso real vendría de un servicio de ciclos)
  async getCiclos(): Promise<{id: number, nombre: string}[]> {
    // En un caso real, esto vendría de una API
    return [
      { id: 1, nombre: '2024-1' },
      { id: 2, nombre: '2024-2' },
      { id: 3, nombre: '2025-1' },
    ];
  },

  // Obtener programas (simulado, en un caso real vendría de un servicio de programas)
  async getProgramas(): Promise<{id: number, nombre: string}[]> {
    // En un caso real, esto vendría de una API
    return [
      { id: 1, nombre: 'Ingeniería de Software' },
      { id: 2, nombre: 'Ingeniería de Sistemas' },
      { id: 3, nombre: 'Diseño Gráfico' },
    ];
  },
};
