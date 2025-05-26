import { API_ENDPOINTS } from './config';
import type { ProgramacionHorario } from './config';
import { api } from './apiClient';

// Define the response type for API calls
interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export const programacionHorarioService = {
  // Obtener todas las programaciones de horario
  getAll: async (): Promise<ProgramacionHorario[]> => {
    const response = await api.get(API_ENDPOINTS.PROGRAMACION_HORARIOS.BASE) as ApiResponse<ProgramacionHorario[]>;
    return response.data;
  },

  // Obtener una programación de horario por ID
  getById: async (id: number): Promise<ProgramacionHorario> => {
    const response = await api.get(API_ENDPOINTS.PROGRAMACION_HORARIOS.BY_ID(id)) as ApiResponse<ProgramacionHorario>;
    return response.data;
  },

  // Crear una nueva programación de horario
  create: async (data: Omit<ProgramacionHorario, 'id' | 'fechaCreacion'>): Promise<ProgramacionHorario> => {
    const response = await api.post(
      API_ENDPOINTS.PROGRAMACION_HORARIOS.BASE,
      data
    ) as ApiResponse<ProgramacionHorario>;
    return response.data;
  },

  // Actualizar una programación de horario existente
  update: async (id: number, data: Partial<ProgramacionHorario>): Promise<ProgramacionHorario> => {
    const response = await api.put(
      API_ENDPOINTS.PROGRAMACION_HORARIOS.BY_ID(id),
      data
    ) as ApiResponse<ProgramacionHorario>;
    return response.data;
  },

  // Eliminar una programación de horario
  delete: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.PROGRAMACION_HORARIOS.BY_ID(id));
  },

  // Obtener programaciones por aula
  getByAula: async (idAula: number): Promise<ProgramacionHorario[]> => {
    const response = await api.get(
      `${API_ENDPOINTS.PROGRAMACION_HORARIOS.BASE}/aula/${idAula}`
    ) as ApiResponse<ProgramacionHorario[]>;
    return response.data;
  },

  // Obtener programaciones por docente
  getByDocente: async (idDocente: number): Promise<ProgramacionHorario[]> => {
    const response = await api.get(
      `${API_ENDPOINTS.PROGRAMACION_HORARIOS.BASE}/docente/${idDocente}`
    ) as ApiResponse<ProgramacionHorario[]>;
    return response.data;
  },

  // Obtener programaciones por asignatura
  getByAsignatura: async (idAsignatura: number): Promise<ProgramacionHorario[]> => {
    const response = await api.get(
      `${API_ENDPOINTS.PROGRAMACION_HORARIOS.BASE}/asignatura/${idAsignatura}`
    ) as ApiResponse<ProgramacionHorario[]>;
    return response.data;
  },

  // Verificar disponibilidad de horario
  verificarDisponibilidad: async (data: {
    fecha: string;
    horaInicio: string;
    horaFin: string;
    idAula?: number;
    idDocente?: number;
  }): Promise<{ disponible: boolean; mensaje?: string }> => {
    const response = await api.post(
      `${API_ENDPOINTS.PROGRAMACION_HORARIOS.BASE}/verificar-disponibilidad`,
      data
    ) as ApiResponse<{ disponible: boolean; mensaje?: string }>;
    return response.data;
  },

  // Obtener horario por rango de fechas
  getByRangoFechas: async (fechaInicio: string, fechaFin: string): Promise<ProgramacionHorario[]> => {
    const response = await api.get(
      `${API_ENDPOINTS.PROGRAMACION_HORARIOS.BASE}/rango-fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    ) as ApiResponse<ProgramacionHorario[]>;
    return response.data;
  },

  // Obtener opciones para filtros y formularios
  getOpciones: async (): Promise<{
    dias: string[];
    turnos: string[];
    estados: string[];
  }> => {
    // Valores estáticos para los filtros
    return {
      dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      turnos: ['Mañana', 'Tarde', 'Noche'],
      estados: ['Activo', 'Inactivo', 'Pendiente']
    };
  }
};
