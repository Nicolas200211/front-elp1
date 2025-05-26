import React, { useState, useEffect, useCallback } from 'react';
import { DocenteForm } from '../../components/docentes/DocenteForm';
import { DocenteTable } from '../../components/docentes/DocenteTable';
import { docenteService } from '../../api/docenteService';
import type { Docente } from '../../api/config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DocentesPage: React.FC = () => {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [currentDocente, setCurrentDocente] = useState<Partial<Docente> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cargar docentes
  const loadDocentes = useCallback(async () => {
    try {
      setIsLoading(true);
      let data;
      if (searchQuery.trim()) {
        // Si hay una búsqueda, usamos el endpoint de búsqueda
        data = await docenteService.search(searchQuery);
      } else {
        // Si no hay búsqueda, cargamos todos los docentes
        data = await docenteService.getAll();
      }
      setDocentes(data);
    } catch (error) {
      console.error('Error al cargar los docentes:', error);
      toast.error('Error al cargar los docentes');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  // Cargar docentes al montar el componente o cambiar la búsqueda
  useEffect(() => {
    loadDocentes();
  }, [loadDocentes]);

  // Manejar la creación de un nuevo docente
  const handleCreate = () => {
    setCurrentDocente({
      nombre: '',
      email: '',
      especialidad: '',
      telefono: '',
      direccion: '',
      tipoContrato: '',
      estado: 'Activo',
    });
    setIsFormOpen(true);
  };

  // Manejar la edición de un docente existente
  const handleEdit = (docente: Docente) => {
    setCurrentDocente({ ...docente });
    setIsFormOpen(true);
  };

  // Manejar la eliminación de un docente
  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este docente?')) {
      try {
        await docenteService.delete(id);
        toast.success('Docente eliminado correctamente');
        loadDocentes();
      } catch (error) {
        console.error('Error al eliminar el docente:', error);
        toast.error('Error al eliminar el docente');
      }
    }
  };

  // Manejar el envío del formulario (crear/actualizar)
  const handleSubmit = async (formData: Partial<Docente>) => {
    try {
      setIsSubmitting(true);
      
      if (formData.id) {
        // Actualizar docente existente
        await docenteService.update(formData.id, formData);
        toast.success('Docente actualizado correctamente');
      } else {
        // Crear nuevo docente
        await docenteService.create(formData as Omit<Docente, 'id'>);
        toast.success('Docente creado correctamente');
      }
      
      setIsFormOpen(false);
      setCurrentDocente(null);
      loadDocentes();
    } catch (error: any) {
      console.error('Error al guardar el docente:', error);
      toast.error(error.message || 'Error al guardar el docente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div className="sm:flex-shrink-0">
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Docentes</h1>
          <p className="mt-1 text-sm text-gray-600">
            Administra la información de los docentes de la institución
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
            Nuevo Docente
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
              placeholder="Buscar docentes por nombre o especialidad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabla de docentes */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <DocenteTable 
          docentes={docentes} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          isLoading={isLoading}
        />
      </div>

      {/* Modal de formulario */}
      {isFormOpen && currentDocente && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => !isSubmitting && setIsFormOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {currentDocente.id ? 'Editar Docente' : 'Nuevo Docente'}
                  </h3>
                  <div className="mt-4">
                    <DocenteForm
                      initialData={currentDocente}
                      onSubmit={handleSubmit}
                      isEditing={!!currentDocente.id}
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

export default DocentesPage;
