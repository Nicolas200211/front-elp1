import React, { useState, useEffect, useCallback } from 'react';
import { EstudianteForm } from '../../components/estudiantes/EstudianteForm';
import type { EstudianteFormData } from '../../components/estudiantes/EstudianteForm';
import { estudianteService } from '../../api/estudianteService';
import type { Estudiante, Programa } from '../../api/config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal } from '../../components/ui/Modal';

const EstudiantesPage: React.FC = () => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [currentEstudiante, setCurrentEstudiante] = useState<Partial<Estudiante> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroPrograma, setFiltroPrograma] = useState<string>('');
  
  // Datos para filtros
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [isLoadingFiltros, setIsLoadingFiltros] = useState<boolean>(true);

  // Cargar datos iniciales para filtros
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [programasData] = await Promise.all([
          estudianteService.getProgramas(),
        ]);
        
        setProgramas(programasData);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        toast.error('Error al cargar los datos iniciales');
      } finally {
        setIsLoadingFiltros(false);
      }
    };

    loadInitialData();
  }, []);

  // Cargar estudiantes
  const loadEstudiantes = useCallback(async () => {
    try {
      setIsLoading(true);
      let data: Estudiante[] = [];
      
      if (searchQuery.trim()) {
        // Búsqueda por término
        data = await estudianteService.getAll();
        const query = searchQuery.toLowerCase();
        data = data.filter(estudiante => 
          estudiante.nombres.toLowerCase().includes(query) ||
          estudiante.apellidos.toLowerCase().includes(query) ||
          estudiante.codigo.toLowerCase().includes(query) ||
          estudiante.dni.toLowerCase().includes(query) ||
          estudiante.email.toLowerCase().includes(query)
        );
      } else if (filtroPrograma) {
        // Filtrar por programa
        data = await estudianteService.getByPrograma(Number(filtroPrograma));
      } else {
        // Cargar todos los estudiantes
        data = await estudianteService.getAll();
      }
      
      // Aplicar filtro de estado si está activo
      if (filtroEstado) {
        data = data.filter(estudiante => estudiante.estado === filtroEstado);
      }
      
      // Ordenar por apellidos y nombres
      data.sort((a, b) => {
        const nombreA = `${a.apellidos} ${a.nombres}`.toLowerCase();
        const nombreB = `${b.apellidos} ${b.nombres}`.toLowerCase();
        return nombreA.localeCompare(nombreB);
      });
      
      // Enriquecer datos con relaciones si no están presentes
      data = data.map(estudiante => ({
        ...estudiante,
        programa: estudiante.programa || programas.find(p => p.id === estudiante.idPrograma),
      }));
      
      setEstudiantes(data);
    } catch (error) {
      console.error('Error al cargar los estudiantes:', error);
      toast.error('Error al cargar los estudiantes');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filtroEstado, filtroPrograma, programas]);

  // Cargar estudiantes al montar el componente o cambiar los filtros
  useEffect(() => {
    if (!isLoadingFiltros) {
      loadEstudiantes();
    }
  }, [loadEstudiantes, isLoadingFiltros]);

  // Manejar la edición de un estudiante existente
  const handleEdit = (estudiante: Estudiante) => {
    setCurrentEstudiante({ ...estudiante });
    setIsFormOpen(true);
  };

  // Manejar la creación de un nuevo estudiante
  const handleCreate = () => {
    setCurrentEstudiante({
      codigo: '',
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      dni: '',
      direccion: '',
      fechaNacimiento: new Date().toISOString().split('T')[0],
      genero: 'M',
      estado: 'Activo',
      idPrograma: programas[0]?.id || 0,
    });
    setIsFormOpen(true);
  };



  // Manejar la eliminación de un estudiante
  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este estudiante?')) {
      try {
        await estudianteService.delete(id);
        toast.success('Estudiante eliminado correctamente');
        loadEstudiantes();
      } catch (error) {
        console.error('Error al eliminar estudiante:', error);
        toast.error('Error al eliminar el estudiante');
      }
    }
  };



  // Manejar el envío del formulario (crear/actualizar)
  const handleSubmit = async (formData: Partial<Estudiante>) => {
    try {
      setIsSubmitting(true);
      
      if (formData.id) {
        // Actualizar estudiante existente
        await estudianteService.update(formData.id, formData);
        toast.success('Estudiante actualizado correctamente');
      } else {
        // Crear nuevo estudiante
        await estudianteService.create(formData as Omit<Estudiante, 'id'>);
        toast.success('Estudiante creado correctamente');
      }
      
      setIsFormOpen(false);
      setCurrentEstudiante(null);
      loadEstudiantes();
    } catch (error: any) {
      console.error('Error al guardar el estudiante:', error);
      toast.error(error.message || 'Error al guardar el estudiante');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setSearchQuery('');
    setFiltroEstado('');
    setFiltroPrograma('');
  };

  // Verificar si hay filtros activos
  const hayFiltrosActivos = Boolean(filtroEstado || filtroPrograma);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div className="sm:flex-shrink-0">
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Estudiantes</h1>
          <p className="mt-1 text-sm text-gray-600">
            Administra la información de los estudiantes
          </p>
        </div>
        <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Nuevo Estudiante
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
                placeholder="Buscar por nombre, apellido, código o DNI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoadingFiltros}
              />
            </div>
          </div>

          {/* Filtro por estado */}
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              disabled={isLoadingFiltros}
            >
              <option value="">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Egresado">Egresado</option>
              <option value="Suspendido">Suspendido</option>
            </select>
          </div>

          {/* Filtro por programa */}
          <div>
            <label htmlFor="programa" className="block text-sm font-medium text-gray-700 mb-1">
              Programa
            </label>
            <select
              id="programa"
              name="programa"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filtroPrograma}
              onChange={(e) => setFiltroPrograma(e.target.value)}
              disabled={isLoadingFiltros}
            >
              <option value="">Todos los programas</option>
              {programas.map((programa) => (
                <option key={programa.id} value={programa.id}>
                  {programa.nombre}
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
              disabled={isLoadingFiltros}
            >
              <svg className="-ml-0.5 mr-1.5 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Tabla de estudiantes */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Código
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Nombres
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Apellidos
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Teléfono
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      DNI
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {estudiantes.length > 0 ? (
                    estudiantes.map((estudiante) => (
                      <tr key={estudiante.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {estudiante.codigo}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {estudiante.nombres}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {estudiante.apellidos}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {estudiante.email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {estudiante.telefono}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {estudiante.dni}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => handleEdit(estudiante)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(estudiante.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        No se encontraron estudiantes
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>


      {/* Modal de formulario */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => !isSubmitting && setIsFormOpen(false)}
        title={`${currentEstudiante?.id ? 'Editar' : 'Nuevo'} Estudiante`}
      >
        <div className="flex flex-col space-y-4">
          {currentEstudiante && (
            <EstudianteForm
              initialData={currentEstudiante}
              onSubmit={async (formData: EstudianteFormData) => {
                if (currentEstudiante) {
                  // Map form data to Estudiante type
                  const estudianteData: Partial<Estudiante> = {
                    ...currentEstudiante,
                    ...formData,
                    fechaNacimiento: formData.fechaNacimiento instanceof Date 
                      ? formData.fechaNacimiento.toISOString() 
                      : formData.fechaNacimiento,
                    genero: formData.genero,
                    idPrograma: formData.idPrograma,
                    programa: undefined // Clear the programa object as we only need the ID
                  };
                  
                  // Remove any undefined values
                  (Object.keys(estudianteData) as Array<keyof Estudiante>).forEach((key) => {
                    if (estudianteData[key] === undefined) {
                      delete estudianteData[key];
                    }
                  });
                  
                  await handleSubmit(estudianteData);
                }
              }}
              isEditing={!!currentEstudiante?.id}
              onCancel={() => setIsFormOpen(false)}
              isSubmitting={isSubmitting}
            />
          )}
          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={() => !isSubmitting && setIsFormOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => currentEstudiante && handleSubmit(currentEstudiante)}
              disabled={isSubmitting}
              className={`inline-flex justify-center px-4 py-2 ml-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EstudiantesPage;
