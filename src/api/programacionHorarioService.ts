import { API_ENDPOINTS } from './config';
import type { ProgramacionHorario } from './config';
import { api } from './apiClient';

type Turno = 'Mañana' | 'Tarde' | 'Noche';
type DiaSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';

export interface HorarioCreateDto {
  dia: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  turno: Turno;
  id_grupo: number;
  id_asignatura: number;
  id_docente: number;
  id_aula: number;
}

// HorarioUpdateDto permite actualizaciones parciales de un horario
export type HorarioUpdateDto = Partial<{
  dia: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  turno: Turno;
  id_grupo: number;
  id_asignatura: number;
  id_docente: number;
  id_aula: number;
}>;

interface DisponibilidadResponse {
  disponible: boolean;
  mensaje?: string;
}

export const programacionHorarioService = {
  // Obtener todas las programaciones de horario
  getAll: async (): Promise<ProgramacionHorario[]> => {
    try {
      const response = await api.get<ProgramacionHorario[]>(API_ENDPOINTS.PROGRAMACION_HORARIOS.BASE);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error al obtener las programaciones de horario:', error);
      throw error;
    }
  },

  // Obtener una programación de horario por ID
  getById: async (id: number): Promise<ProgramacionHorario> => {
    try {
      return await api.get<ProgramacionHorario>(API_ENDPOINTS.PROGRAMACION_HORARIOS.BY_ID(id));
    } catch (error) {
      console.error(`Error al obtener el horario con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear una nueva programación de horario
  create: async (data: HorarioCreateDto): Promise<ProgramacionHorario> => {
    try {
      return await api.post<ProgramacionHorario>(
        API_ENDPOINTS.PROGRAMACION_HORARIOS.BASE,
        data
      );
    } catch (error: any) {
      console.error('Error al crear el horario:', error);
      // Si el backend devuelve un mensaje de error, propagarlo
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      // Si no hay un mensaje específico, lanzar un error genérico
      throw new Error('Error al intentar crear el horario. Por favor, intente nuevamente.');
    }
  },

  // Actualizar una programación de horario existente
  update: async (id: number, data: HorarioUpdateDto): Promise<ProgramacionHorario> => {
    try {
      // Asegurarse de que los campos opcionales se manejen correctamente
      const updateData: Record<string, any> = {};
      
      // Copiar solo los campos definidos
      if (data.dia !== undefined) updateData.dia = data.dia;
      if (data.hora_inicio !== undefined) updateData.hora_inicio = data.hora_inicio;
      if (data.hora_fin !== undefined) updateData.hora_fin = data.hora_fin;
      if (data.turno !== undefined) updateData.turno = data.turno;
      if (data.id_grupo !== undefined) updateData.id_grupo = data.id_grupo;
      if (data.id_asignatura !== undefined) updateData.id_asignatura = data.id_asignatura;
      if (data.id_docente !== undefined) updateData.id_docente = data.id_docente;
      if (data.id_aula !== undefined) updateData.id_aula = data.id_aula;
      
      // Verificar que hay al menos un campo para actualizar
      if (Object.keys(updateData).length === 0) {
        throw new Error('No se proporcionaron datos para actualizar');
      }
      
      return await api.patch<ProgramacionHorario>(API_ENDPOINTS.PROGRAMACION_HORARIOS.BY_ID(id), updateData);
    } catch (error) {
      console.error(`Error al actualizar el horario con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar una programación de horario
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(API_ENDPOINTS.PROGRAMACION_HORARIOS.BY_ID(id));
    } catch (error) {
      console.error(`Error al eliminar el horario con ID ${id}:`, error);
      throw error;
    }
  },

  // Obtener programaciones por aula
  getByAula: async (idAula: number): Promise<ProgramacionHorario[]> => {
    try {
      const response = await api.get<ProgramacionHorario[]>(
        API_ENDPOINTS.PROGRAMACION_HORARIOS.BY_AULA(idAula)
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(`Error al obtener horarios para el aula ${idAula}:`, error);
      return [];
    }
  },

  // Obtener programaciones por docente
  getByDocente: async (idDocente: number): Promise<ProgramacionHorario[]> => {
    try {
      const response = await api.get<ProgramacionHorario[]>(
        API_ENDPOINTS.PROGRAMACION_HORARIOS.BY_DOCENTE(idDocente)
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(`Error al obtener horarios para el docente ${idDocente}:`, error);
      return [];
    }
  },

  // Obtener programaciones por asignatura
  getByAsignatura: async (idAsignatura: number): Promise<ProgramacionHorario[]> => {
    try {
      const response = await api.get<ProgramacionHorario[]>(
        API_ENDPOINTS.PROGRAMACION_HORARIOS.BY_ASIGNATURA(idAsignatura)
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(`Error al obtener horarios para la asignatura ${idAsignatura}:`, error);
      return [];
    }
  },

  // Verificar disponibilidad de horario
  verificarDisponibilidad: async (data: {
    dia: DiaSemana;
    hora_inicio: string;
    hora_fin: string;
    id_grupo: number;
    id_asignatura: number;
    id_docente: number;
    id_aula: number;
    id_horario_excluido?: number; // Para actualizaciones, excluir el horario actual
  }): Promise<DisponibilidadResponse> => {
    try {
      // Preparar los datos para la solicitud
      const requestData = {
        dia: data.dia,
        hora_inicio: data.hora_inicio,
        hora_fin: data.hora_fin,
        id_grupo: data.id_grupo,
        id_asignatura: data.id_asignatura,
        id_docente: data.id_docente,
        id_aula: data.id_aula,
      };

      // Si se está verificando para una actualización, incluir el ID del horario a excluir
      const url = data.id_horario_excluido 
        ? `${API_ENDPOINTS.PROGRAMACION_HORARIOS.BASE}/verificar-disponibilidad?excluir=${data.id_horario_excluido}`
        : `${API_ENDPOINTS.PROGRAMACION_HORARIOS.BASE}/verificar-disponibilidad`;

      const response = await api.post<DisponibilidadResponse>(url, requestData);
      return response;
    } catch (error: any) {
      console.error('Error al verificar disponibilidad:', error);
      
      // Si hay un error de validación del servidor, devolverlo como respuesta
      if (error.response?.data?.message) {
        return {
          disponible: false,
          mensaje: error.response.data.message
        };
      }
      
      // Si no hay un mensaje específico, devolver un error genérico
      return {
        disponible: false,
        mensaje: 'Error al verificar la disponibilidad. Por favor, intente nuevamente.'
      };
    }
  },

  // Obtener horario por rango de fechas
  getByRangoFechas: async (fechaInicio: string, fechaFin: string): Promise<ProgramacionHorario[]> => {
    try {
      const response = await api.get<ProgramacionHorario[]>(
        API_ENDPOINTS.PROGRAMACION_HORARIOS.BY_RANGO_FECHAS(fechaInicio, fechaFin)
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error al obtener horarios por rango de fechas:', error);
      return [];
    }
  },

  // Obtener opciones para filtros y formularios
  getOpciones: async (): Promise<{
    dias: DiaSemana[];
    turnos: Turno[];
  }> => {
    return {
      dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      turnos: ['Mañana', 'Tarde', 'Noche']
    };
  },

  // Obtener horarios por grupo
  getByGrupo: async (idGrupo: number): Promise<ProgramacionHorario[]> => {
    try {
      const response = await api.get<ProgramacionHorario[]>(
        API_ENDPOINTS.PROGRAMACION_HORARIOS.BY_GRUPO(idGrupo)
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(`Error al obtener horarios para el grupo ${idGrupo}:`, error);
      return [];
    }
  },

  // Obtener horarios por día
  getByDia: async (dia: DiaSemana): Promise<ProgramacionHorario[]> => {
    try {
      const response = await api.get<ProgramacionHorario[]>(
        `${API_ENDPOINTS.PROGRAMACION_HORARIOS.BASE}?dia=${encodeURIComponent(dia)}`
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(`Error al obtener horarios para el día ${dia}:`, error);
      return [];
    }
  },
};
