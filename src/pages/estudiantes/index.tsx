import React, { useState, useEffect, useCallback } from 'react';
import { EstudianteForm } from '../../components/estudiantes/EstudianteForm';
import { EstudianteTable } from '../../components/estudiantes/EstudianteTable';
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

  // Manejar la edición de un estudiante existente
  const handleEdit = (estudiante: Estudiante) => {
    setCurrentEstudiante({ ...estudiante });
    setIsFormOpen(true);
  };

  // Manejar la eliminación de un estudiante
  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este estudiante? Esta acción no se puede deshacer.')) {
      try {
        await estudianteService.delete(id);
        toast.success('Estudiante eliminado correctamente');
        loadEstudiantes();
      } catch (error) {
        console.error('Error al eliminar el estudiante:', error);
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
        <div className="mt-4 sm:mt-0 sm:ml-4">
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <EstudianteTable 
          estudiantes={estudiantes} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          isLoading={isLoading || isLoadingFiltros}
        />
      </div>

      {/* Modal de formulario */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => !isSubmitting && setIsFormOpen(false)}
        title={currentEstudiante?.id ? 'Editar Estudiante' : 'Nuevo Estudiante'}
        footer={
          <>
            <button
              type="button"
              onClick={() => !isSubmitting && setIsFormOpen(false)}
              disabled={isSubmitting}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                color: '#374151',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.5 : 1
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => currentEstudiante && handleSubmit(currentEstudiante)}
              disabled={isSubmitting}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                backgroundColor: isSubmitting ? '#93c5fd' : '#2563eb',
                color: 'white',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </>
        }
      >
        {currentEstudiante && (
          <EstudianteForm
            initialData={currentEstudiante}
            onSubmit={handleSubmit}
            isEditing={!!currentEstudiante.id}
            onCancel={() => !isSubmitting && setIsFormOpen(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>
    </div>
  );
};

export default EstudiantesPage;
