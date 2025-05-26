import { API_ENDPOINTS } from './config';
import type { Matricula, Estudiante, Grupo } from './config';
import { api } from './apiClient';
import { authService } from './authService';

export const matriculaService = {
  // Obtener todas las matrículas
  async getAll(): Promise<Matricula[]> {
    try {
      const response = await api.get(API_ENDPOINTS.MATRICULAS.BASE);
      if (Array.isArray(response)) {
        return response;
      }
      return (response as any)?.data || [];
    } catch (error: any) {
      console.error('Error al obtener las matrículas:', error);
      
      // Verificar si es un error de autenticación
      if (error.message?.includes('401') || error.response?.status === 401) {
        // Intentar refrescar el token
        try {
          const newToken = await authService.refreshAccessToken();
          if (newToken) {
            // Reintentar la solicitud con el nuevo token
            const retryResponse = await api.get(API_ENDPOINTS.MATRICULAS.BASE);
            if (Array.isArray(retryResponse)) {
              return retryResponse;
            }
            return (retryResponse as any)?.data || [];
          }
          // Si no se pudo refrescar el token, redirigir al login
          authService.logout();
          window.location.href = '/login';
          throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        } catch (refreshError) {
          console.error('Error al refrescar el token:', refreshError);
          authService.logout();
          window.location.href = '/login';
          throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        }
      }
      
      // Para otros errores, lanzar el mensaje original
      throw new Error(error.message || 'No se pudieron cargar las matrículas. Por favor, intente nuevamente.');
    }
  },

  // Obtener matrículas por estudiante
  async getByEstudiante(idEstudiante: number): Promise<Matricula[]> {
    try {
      const response = await api.get(API_ENDPOINTS.MATRICULAS.BY_ESTUDIANTE(idEstudiante));
      if (Array.isArray(response)) {
        return response;
      }
      return (response as any)?.data || [];
    } catch (error) {
      console.error(`Error al obtener las matrículas del estudiante ${idEstudiante}:`, error);
      throw new Error('No se pudieron cargar las matrículas del estudiante. Por favor, intente nuevamente.');
    }
  },

  // Obtener matrículas por grupo
  async getByGrupo(idGrupo: number): Promise<Matricula[]> {
    try {
      const response = await api.get(API_ENDPOINTS.MATRICULAS.BY_GRUPO(idGrupo));
      if (Array.isArray(response)) {
        return response;
      }
      return (response as any)?.data || [];
    } catch (error) {
      console.error(`Error al obtener las matrículas del grupo ${idGrupo}:`, error);
      throw new Error('No se pudieron cargar las matrículas del grupo. Por favor, intente nuevamente.');
    }
  },

  // Obtener una matrícula por ID
  async getById(id: number): Promise<Matricula> {
    try {
      const response = await api.get(API_ENDPOINTS.MATRICULAS.BY_ID(id));
      return (response as any)?.data || response as Matricula;
    } catch (error) {
      console.error(`Error al obtener la matrícula con ID ${id}:`, error);
      throw new Error('No se pudo cargar la matrícula. Por favor, verifique el ID e intente nuevamente.');
    }
  },

  // Crear una nueva matrícula
  async create(matricula: Omit<Matricula, 'id' | 'fechaMatricula' | 'estado'>): Promise<Matricula> {
    const matriculaData = {
      ...matricula,
      fechaMatricula: new Date().toISOString(),
      estado: 'Activo' as const
    };

    try {
      const response = await api.post(API_ENDPOINTS.MATRICULAS.BASE, matriculaData);
      return (response as any)?.data || response as Matricula;
    } catch (error: any) {
      console.error('Error al crear la matrícula:', error);
      throw new Error(error.message || 'No se pudo crear la matrícula. Verifique los datos e intente nuevamente.');
    }
  },

  // Actualizar una matrícula existente
  async update(id: number, matricula: Partial<Matricula>): Promise<Matricula> {
    try {
      const response = await api.put(API_ENDPOINTS.MATRICULAS.BY_ID(id), matricula);
      return (response as any)?.data || response as Matricula;
    } catch (error: any) {
      console.error(`Error al actualizar la matrícula con ID ${id}:`, error);
      throw new Error(error.message || 'No se pudo actualizar la matrícula. Verifique los datos e intente nuevamente.');
    }
  },

  // Eliminar una matrícula
  async delete(id: number): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.MATRICULAS.BY_ID(id));
    } catch (error: any) {
      console.error(`Error al eliminar la matrícula con ID ${id}:`, error);
      throw new Error(error.message || 'No se pudo eliminar la matrícula. Por favor, intente nuevamente.');
    }
  },

  // Buscar matrículas por fecha
  async buscarPorFecha(fechaInicio: string, fechaFin?: string): Promise<Matricula[]> {
    try {
      const params = new URLSearchParams();
      params.append('fechaInicio', fechaInicio);
      if (fechaFin) {
        params.append('fechaFin', fechaFin);
      }
      
      const response = await api.get(`${API_ENDPOINTS.MATRICULAS.BUSCAR_POR_FECHA}?${params.toString()}`);
      if (Array.isArray(response)) {
        return response;
      }
      return (response as any)?.data || [];
    } catch (error) {
      console.error('Error al buscar matrículas por fecha:', error);
      throw new Error('No se pudieron buscar las matrículas. Por favor, intente nuevamente.');
    }
  },

  // Validar si un estudiante puede matricularse en un grupo
  async validarMatricula(idEstudiante: number, idGrupo: number): Promise<{ valido: boolean; mensaje: string }> {
    try {
      // Implementación alternativa ya que el endpoint de validación directa ya no existe
      // Verificamos si el estudiante ya está matriculado en el grupo
      const matriculas = await this.getByEstudiante(idEstudiante);
      const matriculaExistente = matriculas.find(m => m.idGrupo === idGrupo);
      
      if (matriculaExistente) {
        return {
          valido: false,
          mensaje: 'El estudiante ya está matriculado en este grupo.'
        };
      }
      
      // Aquí podrías agregar más validaciones según sea necesario
      
      return {
        valido: true,
        mensaje: 'La matrícula es válida.'
      };
    } catch (error: any) {
      console.error('Error al validar la matrícula:', error);
      return {
        valido: false,
        mensaje: error.message || 'No se pudo validar la matrícula. Por favor, intente nuevamente.'
      };
    }
  },

  // Método para obtener estudiantes por programa
  async getEstudiantesByPrograma(idPrograma: number): Promise<Estudiante[]> {
    try {
      const response = await api.get(API_ENDPOINTS.ESTUDIANTES.BY_PROGRAMA(idPrograma));
      if (Array.isArray(response)) {
        return response;
      }
      return (response as any)?.data || [];
    } catch (error) {
      console.error(`Error al obtener estudiantes del programa ${idPrograma}:`, error);
      throw new Error('No se pudieron cargar los estudiantes del programa. Por favor, intente nuevamente.');
    }
  },

  // Obtener todos los estudiantes
  async getEstudiantes(): Promise<Estudiante[]> {
    try {
      const response = await api.get(API_ENDPOINTS.ESTUDIANTES.BASE);
      if (Array.isArray(response)) {
        return response;
      }
      return (response as any)?.data || [];
    } catch (error) {
      console.error('Error al obtener los estudiantes:', error);
      throw new Error('No se pudieron cargar los estudiantes. Por favor, intente nuevamente.');
    }
  },

  // Obtener todos los grupos
  async getGrupos(): Promise<Grupo[]> {
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
  
  // Obtener grupos por ciclo
  async getGruposPorCiclo(idCiclo: number): Promise<Grupo[]> {
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
};
