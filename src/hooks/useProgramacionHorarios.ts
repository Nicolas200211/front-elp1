import { useState, useCallback, useEffect } from 'react';
import { programacionHorarioService } from '../api/programacionHorarioService';
import type { ProgramacionHorario } from '../api/config';
import type { HorarioUpdateDto } from '../api/programacionHorarioService';

type DiaSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';
type Turno = 'Mañana' | 'Tarde' | 'Noche';

type HorarioFormData = {
  dia: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  turno: Turno;
  id_grupo: number;
  id_asignatura: number;
  id_docente: number;
  id_aula: number;
};

// Usamos HorarioUpdateDto del servicio que ya tiene los tipos correctos

type UseProgramacionHorariosProps = {
  initialFilters?: {
    dia?: string;
    turno?: string;
    idGrupo?: number;
    idDocente?: number;
    idAula?: number;
  };
};

/**
 * Hook para manejar la programación de horarios.
 * 
 * @param {UseProgramacionHorariosProps} props - Propiedades del hook.
 * @param {Object} props.initialFilters - Filtros iniciales para la programación de horarios.
 * @param {string} props.initialFilters.dia - Día de la semana (opcional).
 * @param {string} props.initialFilters.turno - Turno del día (opcional).
 * @param {number} props.initialFilters.idGrupo - ID del grupo (opcional).
 * @param {number} props.initialFilters.idDocente - ID del docente (opcional).
 * @param {number} props.initialFilters.idAula - ID del aula (opcional).
 * 
 * @returns {Object} - Objeto con los horarios, estado de carga, errores, filtros y funciones para manejar la programación de horarios.
 */
export const useProgramacionHorarios = ({ initialFilters = {} }: UseProgramacionHorariosProps = {}) => {
  const [horarios, setHorarios] = useState<ProgramacionHorario[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [opciones, setOpciones] = useState<{
    dias: string[];
    turnos: string[];
  }>({ dias: [], turnos: [] });

  // Cargar opciones al montar el hook
  useEffect(() => {
    const cargarOpciones = async () => {
      try {
        const data = await programacionHorarioService.getOpciones();
        setOpciones({
          dias: data.dias,
          turnos: data.turnos
        });
      } catch (err) {
        console.error('Error al cargar opciones:', err);
        setError('No se pudieron cargar las opciones de filtrado');
      }
    };

    cargarOpciones();
  }, []);

  // Función para cargar horarios con filtros
  const cargarHorarios = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Aplicar filtros según los parámetros proporcionados
      const { dia, turno, idGrupo, idDocente, idAula } = filtros as any;
      
      let resultados: ProgramacionHorario[] = [];
      
      if (idGrupo) {
        resultados = await programacionHorarioService.getByGrupo(idGrupo);
      } else if (idDocente) {
        resultados = await programacionHorarioService.getByDocente(idDocente);
      } else if (idAula) {
        resultados = await programacionHorarioService.getByAula(idAula);
      } else if (dia) {
        resultados = await programacionHorarioService.getByDia(dia);
      } else {
        resultados = await programacionHorarioService.getAll();
      }
      
      // Aplicar filtros adicionales
      if (turno) {
        resultados = resultados.filter(h => h.turno === turno);
      }
      
      setHorarios(resultados);
      return resultados;
    } catch (err) {
      console.error('Error al cargar horarios:', err);
      setError('No se pudieron cargar los horarios');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar filtros y recargar horarios
  const actualizarFiltros = useCallback((nuevosFiltros: Partial<typeof filters>) => {
    const filtrosActualizados = { ...filters, ...nuevosFiltros };
    setFilters(filtrosActualizados);
    return cargarHorarios(filtrosActualizados);
  }, [filters, cargarHorarios]);

  // Crear un nuevo horario
  const crearHorario = async (data: HorarioFormData): Promise<{ success: boolean; data?: ProgramacionHorario; error?: string }> => {
    try {
      const nuevoHorario = await programacionHorarioService.create({
        ...data,
        hora_inicio: data.hora_inicio.includes(':') ? data.hora_inicio : `${data.hora_inicio}:00`,
        hora_fin: data.hora_fin.includes(':') ? data.hora_fin : `${data.hora_fin}:00`,
      });
      await cargarHorarios();
      return { success: true, data: nuevoHorario };
    } catch (error) {
      console.error('Error al crear horario:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al crear el horario' 
      };
    }
  };

  // Actualizar un horario existente
  const actualizarHorario = async (
    id: number, 
    data: HorarioUpdateDto
  ): Promise<{ success: boolean; data?: ProgramacionHorario; error?: string }> => {
    try {
      // Crear un objeto con solo los campos que se van a actualizar
      const updateData: Record<string, any> = {};
      
      // Copiar solo los campos definidos
      if (data.dia !== undefined) updateData.dia = data.dia;
      if (data.turno !== undefined) updateData.turno = data.turno;
      if (data.id_grupo !== undefined) updateData.id_grupo = data.id_grupo;
      if (data.id_asignatura !== undefined) updateData.id_asignatura = data.id_asignatura;
      if (data.id_docente !== undefined) updateData.id_docente = data.id_docente;
      if (data.id_aula !== undefined) updateData.id_aula = data.id_aula;
      
      // Formatear horas si existen
      if (data.hora_inicio) {
        updateData.hora_inicio = data.hora_inicio.includes(':') 
          ? data.hora_inicio 
          : `${data.hora_inicio}:00`;
      }
      
      if (data.hora_fin) {
        updateData.hora_fin = data.hora_fin.includes(':') 
          ? data.hora_fin 
          : `${data.hora_fin}:00`;
      }
      
      // Verificar que hay al menos un campo para actualizar
      if (Object.keys(updateData).length === 0) {
        throw new Error('No se proporcionaron datos para actualizar');
      }
      
      // El servicio ahora acepta un objeto parcial
      const horarioActualizado = await programacionHorarioService.update(id, updateData);
      await cargarHorarios();
      return { success: true, data: horarioActualizado };
    } catch (error) {
      console.error('Error al actualizar horario:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al actualizar el horario' 
      };
    }
  };

  const eliminarHorario = async (id: number) => {
    try {
      await programacionHorarioService.delete(id);
      await cargarHorarios(filters);
      return { success: true };
    } catch (err) {
      console.error('Error al eliminar horario:', err);
      return { 
        success: false, 
        error: 'No se pudo eliminar el horario. Intente nuevamente más tarde.' 
      };
    }
  };

  // Verificar disponibilidad de horario
  const verificarDisponibilidad = async (data: {
    dia: DiaSemana;
    hora_inicio: string;
    hora_fin: string;
    id_grupo: number;
    id_asignatura: number;
    id_docente: number;
    id_aula: number;
    id_horario_excluido?: number;
  }) => {
    try {
      return await programacionHorarioService.verificarDisponibilidad(data);
    } catch (err) {
      console.error('Error al verificar disponibilidad:', err);
      return { 
        disponible: false, 
        mensaje: 'Error al verificar disponibilidad. Por favor, intente nuevamente.' 
      };
    }
  };

  return {
    horarios,
    loading,
    error,
    filters,
    opciones,
    cargarHorarios,
    actualizarFiltros,
    crearHorario,
    actualizarHorario,
    eliminarHorario,
    verificarDisponibilidad
  };
};

export default useProgramacionHorarios;
