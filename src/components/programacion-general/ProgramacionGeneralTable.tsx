import React, { useState } from 'react';
import type { ProgramacionGeneral } from '../../api/config';
import { EditModal } from '../modales/EditModal';
import { DeleteModal } from '../modales/DeleteModal';
import ProgramacionGeneralForm from './ProgramacionGeneralForm';
import { programacionGeneralService } from '../../api/programacionGeneralService';
import { toast } from 'react-toastify';

interface ProgramacionGeneralTableProps {
  programaciones: ProgramacionGeneral[];
  isLoading?: boolean;
  onRefresh: () => Promise<void>;
  onEdit?: (programacion: ProgramacionGeneral) => void;
  onDelete?: (id: number) => Promise<void>;
  onCambiarEstado?: (id: number, nuevoEstado: string) => Promise<void>;
}

const ProgramacionGeneralTable: React.FC<ProgramacionGeneralTableProps> = ({
  programaciones,
  isLoading = false,
  onRefresh,
  onEdit,
  onDelete,
  onCambiarEstado
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProgramacion, setSelectedProgramacion] = useState<ProgramacionGeneral | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = (programacion: ProgramacionGeneral) => {
    if (onEdit) {
      onEdit(programacion);
    } else {
      setSelectedProgramacion(programacion);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteClick = (programacion: ProgramacionGeneral) => {
    setSelectedProgramacion(programacion);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProgramacion?.id) return;
    
    try {
      setIsSubmitting(true);
      if (onDelete) {
        await onDelete(selectedProgramacion.id);
      } else {
        await programacionGeneralService.delete(selectedProgramacion.id);
        toast.success('Programación eliminada correctamente');
        await onRefresh();
      }
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error al eliminar la programación:', error);
      toast.error('Error al eliminar la programación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCambiarEstado = async (id: number, nuevoEstado: string) => {
    if (onCambiarEstado) {
      await onCambiarEstado(id, nuevoEstado);
    } else {
      try {
        await programacionGeneralService.cambiarEstado(id, nuevoEstado as any);
        toast.success(`Programación ${nuevoEstado.toLowerCase()} correctamente`);
        await onRefresh();
      } catch (error) {
        console.error('Error al cambiar el estado de la programación:', error);
        toast.error('Error al cambiar el estado de la programación');
      }
    }
  };

  const handleSubmit = async (data: Omit<ProgramacionGeneral, 'id' | 'fecha_creacion' | 'estado'>) => {
    try {
      setIsSubmitting(true);
      
      if (selectedProgramacion?.id) {
        // Actualizar programación existente
        await programacionGeneralService.update(selectedProgramacion.id, data);
        toast.success('Programación actualizada correctamente');
      } else {
        // Crear nueva programación
        await programacionGeneralService.create(data);
        toast.success('Programación creada correctamente');
      }
      
      await onRefresh();
      setIsEditModalOpen(false);
      setSelectedProgramacion(null);
    } catch (error) {
      console.error('Error al guardar la programación:', error);
      const action = selectedProgramacion?.id ? 'actualizar' : 'crear';
      toast.error(`Error al ${action} la programación`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nivelBadgeClass = 'bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4">Cargando programaciones...</span>
      </div>
    );
  }

  if (programaciones.length === 0) {
    return (
      <div className="text-center py-8">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay programaciones</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza creando una nueva programación general.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    ID
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Nombre
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Nivel
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Unidad
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {programaciones.map((programacion) => (
                  <tr key={programacion.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {programacion.id || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {programacion.nombre || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={nivelBadgeClass}>
                        {programacion.nivel || 'N/A'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {programacion.idUnidad || 'N/A'}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(programacion)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editar programación"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(programacion)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar programación"
                        >
                          Eliminar
                        </button>
                        {programacion.estado && (
                          <button
                            type="button"
                            onClick={() => handleCambiarEstado(programacion.id as number, programacion.estado === 'Activo' ? 'Inactivo' : 'Activo')}
                            className={`text-sm font-medium ${
                              programacion.estado === 'Activo' 
                                ? 'text-yellow-600 hover:text-yellow-800' 
                                : 'text-green-600 hover:text-green-800'
                            }`}
                            title={programacion.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                          >
                            {programacion.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => !isSubmitting && setIsEditModalOpen(false)}
        title={selectedProgramacion?.id ? 'Editar Programación' : 'Nueva Programación'}
        size="lg"
        isLoading={isSubmitting}
      >
        <div className="mt-4">
          <ProgramacionGeneralForm
            initialData={selectedProgramacion || {
              nombre: '',
              nivel: 'Profesional',
              idUnidad: 0,
              estado: 'Borrador'
            }}
            onSubmit={handleSubmit}
            onCancel={() => !isSubmitting && setIsEditModalOpen(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </EditModal>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        itemName={`la programación "${selectedProgramacion?.nombre || 'seleccionada'}"`}
        isLoading={isSubmitting}
      />
    </>
  );
};

export default ProgramacionGeneralTable;
