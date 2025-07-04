import React, { useState, useEffect, useCallback } from 'react';
import { UnidadAcademicaForm } from '../../components/unidades-academicas/UnidadAcademicaForm';
import { UnidadAcademicaTable } from '../../components/unidades-academicas/UnidadAcademicaTable';
import { unidadAcademicaService } from '../../api/unidadAcademicaService';
import type { UnidadAcademica } from '../../api/config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiX, FiAlertTriangle } from 'react-icons/fi';

const UnidadesAcademicasPage: React.FC = () => {
  const [unidades, setUnidades] = useState<UnidadAcademica[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUnidad, setCurrentUnidad] = useState<Partial<UnidadAcademica> | null>(null);
  const [unidadToDelete, setUnidadToDelete] = useState<UnidadAcademica | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
      descripcion: '',
      asignaturas: []
    });
  };

  // Manejar la edición de una unidad existente
  const handleEdit = (unidad: UnidadAcademica) => {
    setCurrentUnidad(unidad);
  };

  // Manejar la eliminación de una unidad
  const handleDeleteClick = (id: number) => {
    const unidad = unidades.find(u => u.id === id);
    if (unidad) {
      setUnidadToDelete(unidad);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!unidadToDelete?.id) return;
    
    try {
      setIsSubmitting(true);
      await unidadAcademicaService.delete(unidadToDelete.id);
      toast.success('Unidad académica eliminada correctamente');
      loadUnidades();
    } catch (error) {
      console.error('Error al eliminar la unidad académica:', error);
      toast.error('Error al eliminar la unidad académica');
    } finally {
      setIsSubmitting(false);
      setIsDeleteModalOpen(false);
      setUnidadToDelete(null);
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Unidades Académicas</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Cargando...' : 'Nueva Unidad'}
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar unidades académicas..."
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <UnidadAcademicaTable
        unidades={unidades}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        isLoading={isLoading}
      />

      {/* Modal de edición personalizado */}
      {currentUnidad && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {currentUnidad.id ? 'Editar' : 'Nueva'} Unidad Académica
              </h2>
              <button
                onClick={() => setCurrentUnidad(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            <UnidadAcademicaForm
              initialData={currentUnidad}
              onSubmit={handleSubmit}
              onCancel={() => setCurrentUnidad(null)}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación personalizado */}
      {isDeleteModalOpen && unidadToDelete && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3">
                  <FiAlertTriangle size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Confirmar eliminación</h2>
              </div>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setUnidadToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="my-6">
              <p className="text-gray-600 mb-2">
                ¿Estás seguro de que deseas eliminar la unidad académica:
              </p>
              <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-lg">
                {unidadToDelete.nombre}
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setUnidadToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnidadesAcademicasPage;
