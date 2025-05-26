import React, { useState, useEffect, useCallback } from 'react';
// Importaciones de componentes
import { ProgramacionHorarioTable } from '../../components/programacion-horarios/ProgramacionHorarioTable';
import { programacionHorarioService } from '../../api/programacionHorarioService';
import type { 
  ProgramacionHorario, 
  Grupo, 
  Docente, 
  Aula, 
  Asignatura 
} from '../../api/config';

// Importaciones de estilos y utilidades
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProgramacionHorariosPage: React.FC = () => {
  const [horarios, setHorarios] = useState<ProgramacionHorario[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [currentHorario, setCurrentHorario] = useState<Partial<ProgramacionHorario> | null>(null);
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filtroDia, setFiltroDia] = useState<string>('');
  const [filtroTurno, setFiltroTurno] = useState<string>('');
  const [filtroGrupo, setFiltroGrupo] = useState<string>('');
  const [filtroDocente, setFiltroDocente] = useState<string>('');
  const [filtroAula, setFiltroAula] = useState<string>('');
  
  // Opciones para los filtros
  const [opciones, setOpciones] = useState({
    dias: [] as string[],
    turnos: [] as string[],
    grupos: [] as Grupo[],
    docentes: [] as Docente[],
    aulas: [] as Aula[],
    asignaturas: [] as Asignatura[]
  });
  
  // Datos simulados
  const [datosSimulados, setDatosSimulados] = useState<{
    grupos: Grupo[];
    docentes: Docente[];
    aulas: Aula[];
    asignaturas: Asignatura[];
  }>({
    grupos: [],
    docentes: [],
    aulas: [],
    asignaturas: []
  });

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setIsLoading(true);
        // Cargar opciones para los filtros
        const opcionesData = await programacionHorarioService.getOpciones();
        
        // Simular carga de grupos, docentes y aulas (en una implementación real, estos vendrían de la API)
        const gruposSimulados: Grupo[] = [
          { 
            id: 1, 
            nombre: 'Grupo A',
            capacidad: 30,
            idCiclo: 1,
            idPrograma: 1,
            estado: 'Activo'
          },
          { 
            id: 2, 
            nombre: 'Grupo B',
            capacidad: 25,
            idCiclo: 1,
            idPrograma: 1,
            estado: 'Activo'
          },
        ];
        
        const docentesSimulados: Docente[] = [
          { 
            id: 1, 
            nombre: 'Juan Pérez', 
            email: 'juan@example.com',
            especialidad: 'Matemáticas',
            telefono: '123456789',
            direccion: 'Calle 123',
            estado: 'Activo',
            // Mantener compatibilidad con nombres y apellidos separados
            nombres: 'Juan',
            apellidos: 'Pérez'
          },
          { 
            id: 2, 
            nombre: 'María González', 
            email: 'maria@example.com',
            especialidad: 'Lenguaje',
            telefono: '987654321',
            direccion: 'Avenida 456',
            estado: 'Activo',
            // Mantener compatibilidad con nombres y apellidos separados
            nombres: 'María',
            apellidos: 'González'
          },
        ];
        
        const aulasSimuladas: Aula[] = [
          { 
            id: 1, 
            nombre: 'Aula 101', 
            codigo: 'A101',
            tipo: 'Aula',
            capacidad: 30,
            idUnidad: 1,
            estado: 'Disponible',
            tieneEquipamiento: true
          },
          { 
            id: 2, 
            nombre: 'Aula 102', 
            codigo: 'A102',
            tipo: 'Laboratorio',
            capacidad: 25,
            idUnidad: 1,
            estado: 'Disponible',
            tieneEquipamiento: true
          },
        ];
        
        // Crear datos de asignaturas simuladas
        const asignaturasSimuladas: Asignatura[] = [
          {
            id: 1,
            nombre: 'Matemáticas',
            codigo: 'MAT101',
            creditos: 4,
            horasTeoricas: 3,
            horasPracticas: 2,
            tipo: 'Obligatoria',
            estado: 'Activo',
            idPrograma: 1,
            idDocente: 1,
            idUnidadAcademica: 1
          },
          {
            id: 2,
            nombre: 'Lenguaje',
            codigo: 'LEN201',
            creditos: 3,
            horasTeoricas: 2,
            horasPracticas: 2,
            tipo: 'Obligatoria',
            estado: 'Activo',
            idPrograma: 1,
            idDocente: 2,
            idUnidadAcademica: 1
          },
        ];
        
        setOpciones({
          dias: opcionesData.dias,
          turnos: opcionesData.turnos,
          grupos: gruposSimulados,
          docentes: docentesSimulados,
          aulas: aulasSimuladas,
          asignaturas: asignaturasSimuladas
        });
        
        setDatosSimulados({
          grupos: gruposSimulados,
          docentes: docentesSimulados,
          aulas: aulasSimuladas,
          asignaturas: asignaturasSimuladas
        });
        
        // Cargar horarios
        await cargarHorarios(gruposSimulados, docentesSimulados, aulasSimuladas, asignaturasSimuladas);
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
    asignaturas: Asignatura[]
  ) => {
    try {
      setIsLoading(true);
      
      // En una implementación real, aquí se haría la llamada a la API con los filtros
      // Por ahora simulamos datos de ejemplo
      const data: ProgramacionHorario[] = [
        {
          id: 1,
          dia: 'Lunes',
          hora_inicio: '08:00:00',
          hora_fin: '10:00:00',
          turno: 'M1',
          idGrupo: 1,
          idAsignatura: 1,
          idDocente: 1,
          idAula: 1,
          grupo: grupos[0],
          asignatura: asignaturas[0],
          docente: docentes[0],
          aula: aulas[0]
        },
        {
          id: 2,
          dia: 'Miércoles',
          hora_inicio: '14:00:00',
          hora_fin: '16:00:00',
          turno: 'T1',
          idGrupo: 2,
          idAsignatura: 2,
          idDocente: 2,
          idAula: 2,
          grupo: grupos[1],
          asignatura: asignaturas[1],
          docente: docentes[1],
          aula: aulas[1]
        },
      ];
      
      // Aplicar filtros
      let filteredData = [...data];
      
      if (filtroDia) {
        filteredData = filteredData.filter(h => h.dia === filtroDia);
      }
      
      if (filtroTurno) {
        filteredData = filteredData.filter(h => h.turno === filtroTurno);
      }
      
      if (filtroGrupo) {
        filteredData = filteredData.filter(h => h.idGrupo === Number(filtroGrupo));
      }
      
      if (filtroDocente) {
        filteredData = filteredData.filter(h => h.idDocente === Number(filtroDocente));
      }
      
      if (filtroAula) {
        filteredData = filteredData.filter(h => h.idAula === Number(filtroAula));
      }
      
      // Búsqueda por texto
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredData = filteredData.filter(h => 
          h.dia.toLowerCase().includes(query) ||
          h.turno.toLowerCase().includes(query) ||
          (h.grupo?.nombre?.toLowerCase().includes(query) || '') ||
          (h.asignatura?.nombre?.toLowerCase().includes(query) || '') ||
          (h.docente?.nombres?.toLowerCase().includes(query) || '') ||
          (h.docente?.apellidos?.toLowerCase().includes(query) || '') ||
          (h.aula?.nombre?.toLowerCase().includes(query) || '')
        );
      }
      
      setHorarios(filteredData);
    } catch (error) {
      console.error('Error al cargar los horarios:', error);
      toast.error('Error al cargar los horarios');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filtroDia, filtroTurno, filtroGrupo, filtroDocente, filtroAula]);

  // Recargar horarios cuando cambian los filtros
  useEffect(() => {
    if (datosSimulados.grupos.length > 0) {
      cargarHorarios(
        datosSimulados.grupos,
        datosSimulados.docentes,
        datosSimulados.aulas,
        datosSimulados.asignaturas
      );
    }
  }, [cargarHorarios, datosSimulados]);

  // Manejar la creación de un nuevo horario
  const handleCreate = () => {
    setCurrentHorario({
      dia: 'Lunes',
      hora_inicio: '08:00:00',
      hora_fin: '10:00:00',
      turno: 'M1',
      idGrupo: opciones.grupos[0]?.id || 0,
      idAsignatura: 1,
      idDocente: opciones.docentes[0]?.id || 0,
      idAula: opciones.aulas[0]?.id || 0,
    });
    setIsFormOpen(true);
  };

  // Manejar la edición de un horario existente
  const handleEdit = (horario: ProgramacionHorario) => {
    setCurrentHorario({ ...horario });
    setIsFormOpen(true);
  };

  // Manejar la eliminación de un horario
  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta programación de horario? Esta acción no se puede deshacer.')) {
      try {
        // En una implementación real, aquí se llamaría al servicio para eliminar
        // await programacionHorarioService.delete(id);
        console.log('Eliminando horario con ID:', id);
        toast.success('Horario eliminado correctamente');
        if (datosSimulados.grupos.length > 0) {
          cargarHorarios(
            datosSimulados.grupos,
            datosSimulados.docentes,
            datosSimulados.aulas,
            datosSimulados.asignaturas
          );
        }
      } catch (error) {
        console.error('Error al eliminar el horario:', error);
        toast.error('Error al eliminar el horario');
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
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div className="sm:flex-shrink-0">
          <h1 className="text-2xl font-semibold text-gray-900">Programación de Horarios</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona los horarios de clases, docentes y aulas
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Nuevo Horario
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Búsqueda por texto */}
          <div className="sm:col-span-2">
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

          {/* Filtro por día */}
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

          {/* Filtro por turno */}
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

          {/* Filtro por grupo */}
          <div>
            <label htmlFor="grupo" className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
            <select
              id="grupo"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filtroGrupo}
              onChange={(e) => setFiltroGrupo(e.target.value)}
            >
              <option value="">Todos los grupos</option>
              {opciones.grupos && opciones.grupos.map((grupo) => (
                <option key={`grupo-${grupo.id}`} value={grupo.id}>
                  {grupo.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por docente */}
          <div>
            <label htmlFor="docente" className="block text-sm font-medium text-gray-700 mb-1">Docente</label>
            <select
              id="docente"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filtroDocente}
              onChange={(e) => setFiltroDocente(e.target.value)}
            >
              <option value="">Todos los docentes</option>
              {opciones.docentes.map((docente) => (
                <option key={docente.id} value={docente.id}>
                  {docente.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por aula */}
          <div>
            <label htmlFor="aula" className="block text-sm font-medium text-gray-700 mb-1">Aula</label>
            <select
              id="aula"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filtroAula}
              onChange={(e) => setFiltroAula(e.target.value)}
            >
              <option value="">Todas las aulas</option>
              {opciones.aulas.map((aula) => (
                <option key={aula.id} value={aula.id}>
                  {aula.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Botón para limpiar filtros */}
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

      {/* Tabla de horarios */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ProgramacionHorarioTable 
          horarios={horarios} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          isLoading={isLoading}
        />
      </div>

      {/* Modal de formulario - Comentado temporalmente hasta implementar el componente */}
      {isFormOpen && currentHorario && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsFormOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {currentHorario.id ? 'Editar Horario' : 'Nuevo Horario'}
                  </h3>
                  <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          El formulario de horarios está en desarrollo. Esta funcionalidad estará disponible pronto.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                      onClick={() => setIsFormOpen(false)}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramacionHorariosPage;
