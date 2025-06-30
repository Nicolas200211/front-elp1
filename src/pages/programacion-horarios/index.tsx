import React, { useState, useEffect, useCallback } from 'react';
import { FiPlusCircle } from 'react-icons/fi';
// Importaciones de componentes
import { ProgramacionHorarioTable } from '../../components/programacion-horarios/ProgramacionHorarioTable';
import ProgramacionHorarioForm from '../../components/programacion-horarios/ProgramacionHorarioForm';
import { programacionHorarioService } from '../../api/programacionHorarioService';
import { grupoService } from '../../api/grupoService';
import { docenteService } from '../../api/docenteService';
import { aulaService } from '../../api/aulaService';
import { asignaturaService } from '../../api/asignaturaService';
import type { 
  ProgramacionHorario, 
  Grupo, 
  Docente, 
  Aula, 
  Asignatura
} from '../../api/config';

type Turno = 'Mañana' | 'Tarde' | 'Noche';

interface HorarioCreateDto {
  dia: ProgramacionHorario['dia'];
  hora_inicio: string;
  hora_fin: string;
  turno: Turno;
  id_grupo: number;
  id_asignatura: number;
  id_docente: number;
  id_aula: number;
}

// Importaciones de estilos y utilidades
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProgramacionHorariosPage: React.FC = () => {
  const [horarios, setHorarios] = useState<ProgramacionHorario[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [currentHorario, setCurrentHorario] = useState<Partial<ProgramacionHorario> | null>({
    dia: 'Lunes',
    hora_inicio: '08:00:00',
    hora_fin: '10:00:00',
    turno: 'Mañana',
    id_grupo: 0,
    id_asignatura: 0,
    id_docente: 0,
    id_aula: 0,
  });
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filtroDia, setFiltroDia] = useState<string>('');
  const [filtroTurno, setFiltroTurno] = useState<string>('');
  const [filtroGrupo, setFiltroGrupo] = useState<string>('');
  const [filtroDocente, setFiltroDocente] = useState<string>('');
  const [filtroAula, setFiltroAula] = useState<string>('');
  
  // Opciones para los filtros
  const [opciones, setOpciones] = useState<{
    dias: string[];
    turnos: string[];
    grupos: Grupo[];
    asignaturas: Asignatura[];
    docentes: Docente[];
    aulas: Aula[];
  }>({
    dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    turnos: ['Mañana', 'Tarde', 'Noche'],
    grupos: [],
    asignaturas: [],
    docentes: [],
    aulas: []
  });
  
  // Asegurarse de que las opciones no sean undefined
  const opcionesSeguras = {
    ...opciones,
    grupos: opciones.grupos || [],
    asignaturas: opciones.asignaturas || [],
    docentes: opciones.docentes || [],
    aulas: opciones.aulas || []
  };
  
  // Datos simulados
  const [datosSimulados, setDatosSimulados] = useState<{
    grupos: Grupo[];
    docentes: Docente[];
    aulas: Aula[];
    asignaturas?: Asignatura[];
  }>({
    grupos: [],
    docentes: [],
    aulas: []
  });

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setIsLoading(true);
        // Cargar opciones para los filtros
        const opcionesData = await programacionHorarioService.getOpciones();
        
        // Cargar datos reales de la API
        const [grupos, docentes, aulas, asignaturas] = await Promise.all([
          grupoService.getAll(),
          docenteService.getAll(),
          aulaService.getAll(),
          asignaturaService.getAll()
        ]);
        
        setOpciones({
          dias: opcionesData.dias || [],
          turnos: opcionesData.turnos || [],
          grupos: grupos || [],
          docentes: docentes || [],
          aulas: aulas || [],
          asignaturas: asignaturas || []
        });
        
        setDatosSimulados({
          grupos: grupos || [],
          docentes: docentes || [],
          aulas: aulas || [],
          asignaturas: asignaturas || []
        });
        
        // Cargar horarios
        await cargarHorarios(grupos || [], docentes || [], aulas || [], asignaturas || []);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        toast.error('Error al cargar los datos iniciales');
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  // Cargar horarios con los filtros aplicados
  const cargarHorarios = useCallback(async (
    grupos: Grupo[],
    docentes: Docente[],
    aulas: Aula[],
    asignaturas: Asignatura[] = []
  ) => {
    try {
      setIsLoading(true);
      
      // Obtener horarios de la API
      console.log('Obteniendo horarios de la API...');
      const allHorarios = await programacionHorarioService.getAll();
      
      // Verificar que allHorarios sea un array antes de intentar usarlo
      if (!Array.isArray(allHorarios)) {
        console.error('La respuesta de horarios no es un array:', allHorarios);
        toast.error('Error en el formato de los datos de horarios');
        setHorarios([]);
        return;
      }
      
      console.log(`Se obtuvieron ${allHorarios.length} horarios`);
      
      let horarios = [...allHorarios];
      
      if (filtroDia) {
        horarios = horarios.filter(h => h.dia === filtroDia);
      }
      
      if (filtroTurno) {
        horarios = horarios.filter(h => h.turno === filtroTurno);
      }
      
      if (filtroGrupo) {
        horarios = horarios.filter(h => h.id_grupo === Number(filtroGrupo));
      }
      
      if (filtroDocente) {
        horarios = horarios.filter(h => h.id_docente === Number(filtroDocente));
      }
      
      if (filtroAula) {
        horarios = horarios.filter(h => h.id_aula === Number(filtroAula));
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        horarios = horarios.filter(h => 
          (h.dia?.toLowerCase().includes(query) || false) ||
          (h.turno?.toLowerCase().includes(query) || false)
        );
      }
      
      const horariosConRelaciones = horarios.map(horario => ({
        ...horario,
        grupo: grupos.find(g => g.id === horario.id_grupo),
        docente: docentes.find(d => d.id === horario.id_docente),
        aula: aulas.find(a => a.id === horario.id_aula),
        asignatura: asignaturas.find(a => a.id === horario.id_asignatura)
      }));
      
      setHorarios(horariosConRelaciones);
    } catch (error) {
      console.error('Error al cargar los horarios:', error);
      toast.error('Error al cargar los horarios');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filtroDia, filtroTurno, filtroGrupo, filtroDocente, filtroAula]);

  useEffect(() => {
    if (datosSimulados.grupos.length > 0) {
      cargarHorarios(
        datosSimulados.grupos,
        datosSimulados.docentes,
        datosSimulados.aulas,
        datosSimulados.asignaturas || []
      );
    }
  }, [cargarHorarios, datosSimulados]);

  const handleAddNew = () => {
    setCurrentHorario({
      dia: 'Lunes',
      hora_inicio: '08:00:00',
      hora_fin: '10:00:00',
      turno: 'Mañana',
      id_grupo: opciones.grupos[0]?.id || 0,
      id_asignatura: opciones.asignaturas?.[0]?.id || 0,
      id_docente: opciones.docentes[0]?.id || 0,
      id_aula: opciones.aulas[0]?.id || 0
    });
    setIsAddModalOpen(true);
  };

  // Manejar el guardado de un nuevo horario
  const handleSaveHorario = async (formData: Omit<ProgramacionHorario, 'id' | 'created_at' | 'updated_at'>) => {
    // Validar que todos los campos requeridos estén presentes
    if (!formData.dia || !formData.hora_inicio || !formData.hora_fin || 
        !formData.turno || !formData.id_grupo || !formData.id_asignatura || 
        !formData.id_docente || !formData.id_aula) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Validar que las horas tengan el formato correcto
      if (formData.hora_inicio >= formData.hora_fin) {
        toast.error('La hora de inicio debe ser menor que la hora de fin');
        return;
      }

      // Crear el objeto de datos para la API
      const horarioData: HorarioCreateDto = {
        dia: formData.dia,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
        turno: formData.turno as Turno, // Asegurar que el tipo sea correcto
        id_grupo: Number(formData.id_grupo),
        id_asignatura: Number(formData.id_asignatura),
        id_docente: Number(formData.id_docente),
        id_aula: Number(formData.id_aula)
      };

      console.log('Datos a enviar a la API:', JSON.stringify(horarioData, null, 2));
      
      // Llamar al servicio para crear o actualizar
      if (currentHorario?.id) {
        // Actualizar horario existente
        await programacionHorarioService.update(currentHorario.id, horarioData);
        toast.success('Horario actualizado correctamente');
      } else {
        // Crear nuevo horario
        await programacionHorarioService.create(horarioData);
        toast.success('Horario creado correctamente');
      }
      
      // Cerrar el modal y recargar los datos
      setIsAddModalOpen(false);
      setCurrentHorario(null);
      
      // Recargar los horarios
      await cargarHorarios(
        datosSimulados.grupos,
        datosSimulados.docentes,
        datosSimulados.aulas,
        datosSimulados.asignaturas || []
      );
    } catch (error) {
      console.error('Error al guardar el horario:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar el horario');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar la edición de un horario existente
  const handleEdit = (horario: ProgramacionHorario) => {
    setCurrentHorario({ ...horario });
    setIsAddModalOpen(true);
  };

  // Manejar la eliminación de un horario
  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta programación de horario? Esta acción no se puede deshacer.')) {
      try {
        setIsLoading(true);
        await programacionHorarioService.delete(id);
        toast.success('Horario eliminado correctamente');
        await cargarHorarios(
          datosSimulados.grupos, 
          datosSimulados.docentes, 
          datosSimulados.aulas, 
          datosSimulados.asignaturas || []
        );
      } catch (error) {
        console.error('Error al eliminar el horario:', error);
        toast.error('Error al eliminar el horario');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setSearchQuery('');
    setFiltroDia('');
    setFiltroTurno('');
    setFiltroGrupo('');
    setFiltroDocente('');
    setFiltroAula('');
  };

  // Verificar si hay filtros activos
  const hayFiltrosActivos = Boolean(
    searchQuery ||
    filtroDia ||
    filtroTurno ||
    filtroGrupo ||
    filtroDocente ||
    filtroAula
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Programación de Horarios</h1>
            <button
              type="button"
              onClick={handleAddNew}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlusCircle className="-ml-1 mr-2 h-5 w-5" />
              Agregar Horario
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-md shadow p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Buscar por día, turno, grupo, docente o aula..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="dia" className="block text-sm font-medium text-gray-700 mb-1">Día</label>
              <select
                id="dia"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filtroDia}
                onChange={(e) => setFiltroDia(e.target.value)}
              >
                <option value="">Todos los días</option>
                {opciones.dias.map((dia, index) => (
                  <option key={`dia-${index}`} value={dia}>
                    {dia}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="turno" className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
              <select
                id="turno"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filtroTurno}
                onChange={(e) => setFiltroTurno(e.target.value)}
              >
                <option value="">Todos los turnos</option>
                {opciones.turnos.map((turno, index) => (
                  <option key={`turno-${index}`} value={turno}>
                    {turno}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="grupo" className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
              <select
                id="grupo"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filtroGrupo || ''}
                onChange={(e) => setFiltroGrupo(e.target.value)}
              >
                <option value="">Todos los grupos</option>
                {opcionesSeguras.grupos.map((grupo) => (
                  <option key={`grupo-${grupo.id}`} value={grupo.id}>
                    {grupo.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="docente" className="block text-sm font-medium text-gray-700 mb-1">Docente</label>
              <select
                id="docente"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filtroDocente || ''}
                onChange={(e) => setFiltroDocente(e.target.value)}
              >
                <option value="">Todos los docentes</option>
                {opcionesSeguras.docentes.map((docente) => {
                  const nombreCompleto = `${docente.nombres || ''} ${docente.apellidos || ''}`.trim();
                  return (
                    <option key={docente.id} value={docente.id}>
                      {nombreCompleto || `Docente ${docente.id}`}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label htmlFor="aula" className="block text-sm font-medium text-gray-700 mb-1">Aula</label>
              <select
                id="aula"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filtroAula || ''}
                onChange={(e) => setFiltroAula(e.target.value)}
              >
                <option value="">Todas las aulas</option>
                {opcionesSeguras.aulas.map((aula) => (
                  <option key={aula.id} value={aula.id}>
                    {aula.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {hayFiltrosActivos && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={limpiarFiltros}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-0.5 mr-1.5 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal para agregar/editar horario */}
      {isAddModalOpen && currentHorario && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {currentHorario.id ? 'Editar Horario' : 'Nuevo Horario'}
                </h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <ProgramacionHorarioForm
                initialData={currentHorario}
                onSave={handleSaveHorario}
                onCancel={() => setIsAddModalOpen(false)}
                isEditing={!!currentHorario.id}
                grupos={opcionesSeguras.grupos}
                asignaturas={opcionesSeguras.asignaturas}
                docentes={opcionesSeguras.docentes}
                aulas={opcionesSeguras.aulas}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabla de horarios */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-1">
        <div className="bg-white shadow overflow-hidden rounded-md text-sm">
          <ProgramacionHorarioTable 
            data={horarios}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
            grupos={opcionesSeguras.grupos}
            asignaturas={opcionesSeguras.asignaturas}
            docentes={opcionesSeguras.docentes}
            aulas={opcionesSeguras.aulas}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgramacionHorariosPage;
