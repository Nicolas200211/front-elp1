import { API_ENDPOINTS } from './config';
import type { Estudiante, Programa } from './config';
import { api } from './apiClient';

export const estudianteService = {
  // Obtener todos los estudiantes
  async getAll(): Promise<Estudiante[]> {
    try {
      const response = await api.get(API_ENDPOINTS.ESTUDIANTES.BASE);
      if (Array.isArray(response)) {
        return response;
      }
      // Handle case where response has data property
      return (response as any)?.data || [];
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
      throw new Error('Error al obtener los estudiantes');
    }
  },

  // Obtener un estudiante por ID
  async getById(id: number): Promise<Estudiante> {
    try {
      const response = await api.get(API_ENDPOINTS.ESTUDIANTES.BY_ID(id));
      return (response as any)?.data || response as Estudiante;
    } catch (error) {
      console.error(`Error al obtener estudiante con ID ${id}:`, error);
      throw new Error('Estudiante no encontrado');
    }
  },

  // Obtener estudiantes por programa
  async getByPrograma(idPrograma: number): Promise<Estudiante[]> {
    try {
      const response = await api.get(API_ENDPOINTS.ESTUDIANTES.BY_PROGRAMA(idPrograma));
      if (Array.isArray(response)) {
        return response;
      }
      return (response as any)?.data || [];
    } catch (error) {
      console.error(`Error al obtener estudiantes del programa ${idPrograma}:`, error);
      throw new Error('Error al obtener los estudiantes del programa');
    }
  },

  // Buscar por código de estudiante
  async getByCodigo(codigo: string): Promise<Estudiante> {
    try {
      const response = await api.get(API_ENDPOINTS.ESTUDIANTES.BY_CODIGO(codigo));
      return (response as any)?.data || response as Estudiante;
    } catch (error) {
      console.error(`Error al buscar estudiante con código ${codigo}:`, error);
      throw new Error('Estudiante no encontrado');
    }
  },

  // Buscar por DNI
  async getByDni(dni: string): Promise<Estudiante> {
    try {
      const response = await api.get(API_ENDPOINTS.ESTUDIANTES.BY_DNI(dni));
      return (response as any)?.data || response as Estudiante;
    } catch (error) {
      console.error(`Error al buscar estudiante con DNI ${dni}:`, error);
      throw new Error('Estudiante no encontrado');
    }
  },

  // Crear un nuevo estudiante
  async create(estudiante: Omit<Estudiante, 'id' | 'estado'>): Promise<Estudiante> {
    const estudianteData = {
      ...estudiante,
      estado: 'Activo' as const
    };

    try {
      const response = await api.post(API_ENDPOINTS.ESTUDIANTES.BASE, estudianteData);
      return (response as any)?.data || response as Estudiante;
    } catch (error: any) {
      console.error('Error al crear estudiante:', error);
      throw new Error(error.message || 'Error al crear el estudiante');
    }
  },

  // Actualizar un estudiante existente
  async update(id: number, estudiante: Partial<Estudiante>): Promise<Estudiante> {
    try {
      const response = await api.patch(API_ENDPOINTS.ESTUDIANTES.BY_ID(id), estudiante);
      return (response as any)?.data || response as Estudiante;
    } catch (error: any) {
      console.error(`Error al actualizar estudiante con ID ${id}:`, error);
      throw new Error(error.message || 'Error al actualizar el estudiante');
    }
  },

  // Eliminar un estudiante (cambiar estado a inactivo)
  async delete(id: number): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.ESTUDIANTES.BY_ID(id));
    } catch (error: any) {
      console.error(`Error al eliminar estudiante con ID ${id}:`, error);
      throw new Error(error.message || 'Error al eliminar el estudiante');
    }
  },

  // Método para verificar si un código de estudiante ya existe
  async verificarCodigoExistente(codigo: string, idExcluido?: number): Promise<boolean> {
    try {
      const estudiante = await this.getByCodigo(codigo);
      return !idExcluido || estudiante.id !== idExcluido;
    } catch (error) {
      // Si no se encuentra el estudiante, el código está disponible
      return false;
    }
  },

  // Método para verificar si un DNI ya existe
  async verificarDniExistente(dni: string, idExcluido?: number): Promise<boolean> {
    try {
      const estudiante = await this.getByDni(dni);
      return !idExcluido || estudiante.id !== idExcluido;
    } catch (error) {
      // Si no se encuentra el estudiante, el DNI está disponible
      return false;
    }
  },

  // Datos de ejemplo para desarrollo
  getProgramas(): Promise<Programa[]> {
    // En un entorno real, esto haría una llamada a la API
    return Promise.resolve([
      { 
        id: 1, 
        nombre: 'Ingeniería de Sistemas', 
        codigo: 'IS',
        descripcion: 'Programa de Ingeniería de Sistemas',
        idUnidad: 1,
        estado: 'Activo' as const
      },
      { 
        id: 2, 
        nombre: 'Ingeniería Industrial', 
        codigo: 'II',
        descripcion: 'Programa de Ingeniería Industrial',
        idUnidad: 1,
        estado: 'Activo' as const
      },
      { 
        id: 3, 
        nombre: 'Administración de Empresas', 
        codigo: 'AE',
        descripcion: 'Programa de Administración de Empresas',
        idUnidad: 2,
        estado: 'Activo' as const
      },
    ]);
  }
};
