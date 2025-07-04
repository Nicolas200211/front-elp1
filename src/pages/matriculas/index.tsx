import React, { useState, useEffect, useCallback } from 'react';
import { MatriculaForm } from '../../components/matriculas/MatriculaForm';
import { MatriculaTable } from '../../components/matriculas/MatriculaTable';
import { matriculaService } from '../../api/matriculaService';
import { authService } from '../../api/authService';
import type { Matricula, Estudiante, Grupo } from '../../api/config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DeleteModal } from '../../components/modales/DeleteModal';
import { EditModal } from '../../components/modales/EditModal';

const MatriculasPage: React.FC = () => {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [currentMatricula, setCurrentMatricula] = useState<Partial<Matricula> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [matriculaToDelete, setMatriculaToDelete] = useState<{id: number, identificador: string} | null>(null);
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroEstudiante, setFiltroEstudiante] = useState<string>('');
  const [filtroGrupo, setFiltroGrupo] = useState<string>('');
  
  // Datos para filtros
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [isLoadingFiltros, setIsLoadingFiltros] = useState<boolean>(true);

  // Cargar datos iniciales para filtros
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [estudiantesData, gruposData] = await Promise.all([
          matriculaService.getEstudiantes(),
          matriculaService.getGrupos()
        ]);
        
        setEstudiantes(estudiantesData);
        setGrupos(gruposData);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        toast.error('Error al cargar los datos iniciales');
      } finally {
        setIsLoadingFiltros(false);
      }
    };

    loadInitialData();
  }, []);

  // Verificar autenticación
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      // Redirigir al login si no está autenticado
      window.location.href = '/login';
      return;
    }
  }, []);

  // Cargar matrículas
  const loadMatriculas = useCallback(async () => {
    try {
      // Verificar autenticación nuevamente por si el token expiró
      if (!authService.isAuthenticated()) {
        // Intentar refrescar el token
        const newToken = await authService.refreshAccessToken();
        if (!newToken) {
          // Si no se pudo refrescar el token, redirigir al login
          window.location.href = '/login';
          return [];
        }
      }
      setIsLoading(true);
      let data: Matricula[] = [];
      
      if (searchQuery.trim()) {
        // Búsqueda por término
        data = await matriculaService.getAll();
        data = data.filter(matricula => 
          (matricula.estudiante?.nombres?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           matricula.estudiante?.apellidos?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           matricula.estudiante?.codigo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           matricula.grupo?.nombre?.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      } else if (filtroEstudiante) {
        // Filtrar por estudiante
        data = await matriculaService.getByEstudiante(Number(filtroEstudiante));
      } else if (filtroGrupo) {
        // Filtrar por grupo
        data = await matriculaService.getByGrupo(Number(filtroGrupo));
      } else {
        // Cargar todas las matrículas
        data = await matriculaService.getAll();
      }
      
      // Aplicar filtro de estado si está activo
      if (filtroEstado) {
        data = data.filter(matricula => matricula.estado === filtroEstado);
      }
      
      // Enriquecer datos con relaciones si no están presentes
      data = data.map(matricula => ({
        ...matricula,
        estudiante: matricula.estudiante || estudiantes.find(e => e.id === matricula.idEstudiante),
        grupo: matricula.grupo || grupos.find(g => g.id === matricula.idGrupo)
      }));
      
      setMatriculas(data);
    } catch (error) {
      console.error('Error al cargar las matrículas:', error);
      toast.error('Error al cargar las matrículas');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filtroEstado, filtroEstudiante, filtroGrupo, estudiantes, grupos]);

  // Cargar matrículas al montar el componente o cambiar los filtros
  useEffect(() => {
    if (!isLoadingFiltros) {
      loadMatriculas();
    }
  }, [loadMatriculas, isLoadingFiltros]);

  // Manejar la creación de una nueva matrícula
  const handleCreate = () => {
    setCurrentMatricula({
      idEstudiante: estudiantes[0]?.id || 0,
      idGrupo: grupos[0]?.id || 0,
      estado: 'Activo',
    });
    setIsFormOpen(true);
  };

  // Manejar la edición de una matrícula existente
  const handleEdit = (matricula: Matricula) => {
    setCurrentMatricula({ ...matricula });
    setIsFormOpen(true);
  };

  // Manejar la apertura del modal de eliminación
  const handleDeleteClick = (id: number, matricula: Matricula) => {
    setMatriculaToDelete({
      id,
      identificador: `Matrícula #${id} - ${matricula.estudiante?.nombres} ${matricula.estudiante?.apellidos} (${matricula.grupo?.nombre || 'Grupo'})`
    });
    setIsDeleteModalOpen(true);
  };

  // Manejar la confirmación de eliminación
  const handleDeleteConfirm = async () => {
    if (!matriculaToDelete) return;
    
    try {
      setIsSubmitting(true);
      await matriculaService.delete(matriculaToDelete.id);
      toast.success('Matrícula eliminada correctamente');
      loadMatriculas();
    } catch (error) {
      console.error('Error al eliminar la matrícula:', error);
      toast.error('Error al eliminar la matrícula');
    } finally {
      setIsDeleteModalOpen(false);
      setMatriculaToDelete(null);
      setIsSubmitting(false);
    }
  };

  // Manejar el envío del formulario (crear/actualizar)
  const handleSubmit = async (formData: Partial<Matricula>) => {
    try {
      setIsSubmitting(true);
      
      if (formData.id) {
        // Actualizar matrícula existente
        await matriculaService.update(formData.id, formData);
        toast.success('Matrícula actualizada correctamente');
      } else {
        // Crear nueva matrícula
        await matriculaService.create(formData as Omit<Matricula, 'id'>);
        toast.success('Matrícula creada correctamente');
      }
      
      setIsFormOpen(false);
      setCurrentMatricula(null);
      loadMatriculas();
    } catch (error: any) {
      console.error('Error al guardar la matrícula:', error);
      toast.error(error.message || 'Error al guardar la matrícula');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setSearchQuery('');
    setFiltroEstado('');
    setFiltroEstudiante('');
    setFiltroGrupo('');
  };

  // Verificar si hay filtros activos
  const hayFiltrosActivos = Boolean(filtroEstado || filtroEstudiante || filtroGrupo);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div className="sm:flex-shrink-0">
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Matrículas</h1>
          <p className="mt-1 text-sm text-gray-600">
            Administra las matrículas de los estudiantes en los grupos
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-4">
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Nueva Matrícula
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
                placeholder="Buscar por nombre, apellido o código..."
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
              <option value="Retirado">Retirado</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Reprobado">Reprobado</option>
              <option value="Incompleto">Incompleto</option>
            </select>
          </div>

          {/* Filtro por estudiante */}
          <div>
            <label htmlFor="estudiante" className="block text-sm font-medium text-gray-700 mb-1">
              Estudiante
            </label>
            <select
              id="estudiante"
              name="estudiante"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filtroEstudiante}
              onChange={(e) => setFiltroEstudiante(e.target.value)}
              disabled={isLoadingFiltros}
            >
              <option value="">Todos los estudiantes</option>
              {estudiantes.map((estudiante) => (
                <option key={estudiante.id} value={estudiante.id}>
                  {estudiante.nombres} {estudiante.apellidos}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por grupo */}
          <div>
            <label htmlFor="grupo" className="block text-sm font-medium text-gray-700 mb-1">
              Grupo
            </label>
            <select
              id="grupo"
              name="grupo"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filtroGrupo}
              onChange={(e) => setFiltroGrupo(e.target.value)}
              disabled={isLoadingFiltros}
            >
              <option value="">Todos los grupos</option>
              {grupos.map((grupo) => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.nombre} - {grupo.programa?.nombre}
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

      {/* Tabla de matrículas */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <MatriculaTable 
          matriculas={matriculas} 
          onEdit={handleEdit} 
          onDelete={handleDeleteClick} 
          isLoading={isLoading || isLoadingFiltros}
        />
      </div>

      {/* Modal de confirmación de eliminación */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={matriculaToDelete ? matriculaToDelete.identificador : 'esta matrícula'}
        isLoading={isSubmitting}
        title="Eliminar Matrícula"
        description="¿Está seguro de que desea eliminar esta matrícula?"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Modal de formulario */}
      <EditModal
        isOpen={isFormOpen && !!currentMatricula}
        onClose={() => !isSubmitting && setIsFormOpen(false)}
        title={currentMatricula?.id ? 'Editar Matrícula' : 'Nueva Matrícula'}
        isLoading={isSubmitting}
      >
        <div className="mt-4">
          <MatriculaForm
            initialData={currentMatricula || {}}
            onSubmit={handleSubmit}
            isEditing={!!currentMatricula?.id}
            onCancel={() => !isSubmitting && setIsFormOpen(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </EditModal>
    </div>
  );
};

export default MatriculasPage;
