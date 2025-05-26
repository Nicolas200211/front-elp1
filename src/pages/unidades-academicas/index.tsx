import React, { useState, useEffect, useCallback } from 'react';
import { UnidadAcademicaForm } from '../../components/unidades-academicas/UnidadAcademicaForm';
import { UnidadAcademicaTable } from '../../components/unidades-academicas/UnidadAcademicaTable';
import { unidadAcademicaService } from '../../api/unidadAcademicaService';
import type { UnidadAcademica } from '../../api/config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UnidadesAcademicasPage: React.FC = () => {
  const [unidades, setUnidades] = useState<UnidadAcademica[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [currentUnidad, setCurrentUnidad] = useState<Partial<UnidadAcademica> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cargar unidades académicas
  const loadUnidades = useCallback(async () => {
    try {
      setIsLoading(true);
      let data;
      if (searchQuery.trim()) {
        data = await unidadAcademicaService.search(searchQuery);
      } else {
        data = await unidadAcademicaService.getAll();
      }
      setUnidades(data);
    } catch (error) {
      console.error('Error al cargar las unidades académicas:', error);
      toast.error('Error al cargar las unidades académicas');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  // Cargar unidades al montar el componente o cambiar la búsqueda
  useEffect(() => {
    loadUnidades();
  }, [loadUnidades]);

  // Manejar la creación de una nueva unidad
  const handleCreate = () => {
    setCurrentUnidad({
      nombre: '',
      codigo: '',
      direccion: '',
      telefono: '',
      email: '',
      descripcion: '',
    });
    setIsFormOpen(true);
  };

  // Manejar la edición de una unidad existente
  const handleEdit = (unidad: UnidadAcademica) => {
    setCurrentUnidad({ ...unidad });
    setIsFormOpen(true);
  };

  // Manejar la eliminación de una unidad
  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta unidad académica?')) {
      try {
        await unidadAcademicaService.delete(id);
        toast.success('Unidad académica eliminada correctamente');
        loadUnidades();
      } catch (error) {
        console.error('Error al eliminar la unidad académica:', error);
        toast.error('Error al eliminar la unidad académica');
      }
    }
  };

  // Manejar el envío del formulario (crear/actualizar)
  const handleSubmit = async (formData: Partial<UnidadAcademica>) => {
    try {
      setIsSubmitting(true);
      
      if (formData.id) {
        // Actualizar unidad existente
        await unidadAcademicaService.update(formData.id, formData);
        toast.success('Unidad académica actualizada correctamente');
      } else {
        // Crear nueva unidad
        await unidadAcademicaService.create(formData as Omit<UnidadAcademica, 'id'>);
        toast.success('Unidad académica creada correctamente');
      }
      
      setIsFormOpen(false);
      setCurrentUnidad(null);
      loadUnidades();
    } catch (error: any) {
      console.error('Error al guardar la unidad académica:', error);
      toast.error(error.message || 'Error al guardar la unidad académica');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div className="sm:flex-shrink-0">
          <h1 className="text-2xl font-semibold text-gray-900">Unidades Académicas</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona las unidades académicas de la institución
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
            Nueva Unidad
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="max-w-md">
          <label htmlFor="search" className="sr-only">Buscar</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Buscar unidades académicas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabla de unidades académicas */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <UnidadAcademicaTable 
          unidades={unidades} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          isLoading={isLoading}
        />
      </div>

      {/* Modal de formulario */}
      {isFormOpen && currentUnidad && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => !isSubmitting && setIsFormOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {currentUnidad.id ? 'Editar Unidad Académica' : 'Nueva Unidad Académica'}
                  </h3>
                  <div className="mt-4">
                    <UnidadAcademicaForm
                      initialData={currentUnidad}
                      onSubmit={handleSubmit}
                      isEditing={!!currentUnidad.id}
                      onCancel={() => !isSubmitting && setIsFormOpen(false)}
                      isSubmitting={isSubmitting}
                    />
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

export default UnidadesAcademicasPage;
