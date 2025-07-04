import React, { useState, useEffect, useCallback } from 'react';
import { AulaForm } from '../../components/aulas/AulaForm';
import { AulaTable } from '../../components/aulas/AulaTable';
import { aulaService } from '../../api/aulaService';
import { unidadAcademicaService } from '../../api/unidadAcademicaService';
import type { Aula, UnidadAcademica } from '../../api/config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal } from '../../components/ui/Modal';
import { DeleteModal } from '../../components/modales/DeleteModal';

const AulasPage: React.FC = () => {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [currentAula, setCurrentAula] = useState<Partial<Aula> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [aulaToDelete, setAulaToDelete] = useState<{id: number, nombre: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [unidadesAcademicas, setUnidadesAcademicas] = useState<UnidadAcademica[]>([]);
  const [isLoadingUnidades, setIsLoadingUnidades] = useState<boolean>(true);

  // Cargar aulas
  const loadAulas = useCallback(async () => {
    try {
      console.log('Loading aulas...');
      setIsLoading(true);
      const response = await aulaService.getAll();
      console.log('API Response:', response);
      
      // Asegurarse de que la respuesta sea un array
      const data = Array.isArray(response) ? response : [];
      console.log('Processed data:', data);
      
      // Filtrar localmente si hay un término de búsqueda
      let filteredData = [...data];
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredData = data.filter(aula => 
          aula?.codigo?.toLowerCase().includes(query) || 
          aula?.nombre?.toLowerCase().includes(query) ||
          (aula?.descripcion && aula.descripcion.toLowerCase().includes(query))
        );
      }
      
      console.log('Setting aulas state:', filteredData);
      setAulas(filteredData);
    } catch (error) {
      console.error('Error al cargar las aulas:', error);
      toast.error('No se pudieron cargar las aulas. Por favor, intente nuevamente.');
      console.log('Setting empty array due to error');
      setAulas([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  // Cargar unidades académicas al montar el componente
  const loadUnidadesAcademicas = useCallback(async () => {
    try {
      setIsLoadingUnidades(true);
      const data = await unidadAcademicaService.getAll();
      setUnidadesAcademicas(data || []);
    } catch (error) {
      console.error('Error al cargar las unidades académicas:', error);
      toast.error('No se pudieron cargar las unidades académicas');
      setUnidadesAcademicas([]);
    } finally {
      setIsLoadingUnidades(false);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadAulas();
    loadUnidadesAcademicas();
  }, [loadAulas, loadUnidadesAcademicas]);

  // Manejar la creación de una nueva aula
  const handleCreate = () => {
    setCurrentAula({
      codigo: '',
      nombre: '',
      capacidad: undefined,
      tipo: undefined,
      descripcion: '',
      idUnidad: undefined,
      estado: undefined,
      tieneEquipamiento: false,
    });
    setIsFormOpen(true);
  };

  // Manejar la edición de un aula existente
  const handleEdit = (aula: Aula) => {
    setCurrentAula({ ...aula });
    setIsFormOpen(true);
  };

  // Manejar la apertura del modal de eliminación
  const handleDeleteClick = (id: number, nombre: string) => {
    setAulaToDelete({ id, nombre });
    setIsDeleteModalOpen(true);
  };

  // Manejar la confirmación de eliminación
  const handleDeleteConfirm = async () => {
    if (!aulaToDelete) return;
    
    try {
      setIsSubmitting(true);
      await aulaService.delete(aulaToDelete.id);
      toast.success('Aula eliminada correctamente');
      loadAulas();
    } catch (error) {
      console.error('Error al eliminar el aula:', error);
      toast.error('Error al eliminar el aula');
    } finally {
      setIsDeleteModalOpen(false);
      setAulaToDelete(null);
      setIsSubmitting(false);
    }
  };

  // Manejar el envío del formulario (crear/actualizar)
  const handleSubmit = async (formData: Partial<Aula>) => {
    try {
      setIsSubmitting(true);
      
      if (formData.id) {
        // Actualizar aula existente
        await aulaService.update(formData.id, formData);
        toast.success('Aula actualizada correctamente');
      } else {
        // Crear nueva aula
        await aulaService.create(formData as Omit<Aula, 'id'>);
        toast.success('Aula creada correctamente');
      }
      
      setIsFormOpen(false);
      setCurrentAula(null);
      loadAulas();
    } catch (error: any) {
      console.error('Error al guardar el aula:', error);
      toast.error(error.message || 'Error al guardar el aula');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div className="sm:flex-shrink-0">
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Aulas</h1>
          <p className="mt-1 text-sm text-gray-600">
            Administra las aulas y espacios físicos de la institución
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
            Nueva Aula
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
              placeholder="Buscar aulas por código o nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabla de aulas */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <AulaTable 
          aulas={aulas} 
          onEdit={handleEdit} 
          onDelete={handleDeleteClick} 
          isLoading={isLoading} 
        />

        {/* Modal de confirmación de eliminación */}
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          itemName={aulaToDelete ? `"${aulaToDelete.nombre}"` : 'esta aula'}
          isLoading={isSubmitting}
          title="Eliminar Aula"
          description="¿Está seguro de que desea eliminar esta aula?"
          confirmText="Eliminar"
          cancelText="Cancelar"
        />
      </div>

      {/* Modal de formulario */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => !isSubmitting && setIsFormOpen(false)}
        title={currentAula?.id ? 'Editar Aula' : 'Nueva Aula'}
        maxWidth="800px"
      >
        {currentAula && (
          <AulaForm 
            initialData={currentAula || {}} 
            onSubmit={handleSubmit} 
            onCancel={() => !isSubmitting && setIsFormOpen(false)}
            isSubmitting={isSubmitting}
            unidadesAcademicas={unidadesAcademicas}
            isLoadingUnidades={isLoadingUnidades}
            isEditing={!!currentAula?.id}
          />
        )}
      </Modal>
    </div>
  );
};

export default AulasPage;
