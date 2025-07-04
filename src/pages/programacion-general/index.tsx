import React, { useState, useEffect, useCallback } from 'react';
import type { ProgramacionGeneral } from '../../api/config';
import { programacionGeneralService } from '../../api/programacionGeneralService';
import ProgramacionGeneralTable from '../../components/programacion-general/ProgramacionGeneralTable';
import ProgramacionGeneralForm from '../../components/programacion-general/ProgramacionGeneralForm';
import { EditModal } from '../../components/modales/EditModal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProgramacionGeneralPage: React.FC = () => {
  const [programaciones, setProgramaciones] = useState<ProgramacionGeneral[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [currentProgramacion, setCurrentProgramacion] = useState<Partial<ProgramacionGeneral> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Cargar programaciones
  const cargarProgramaciones = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await programacionGeneralService.getAll();
      const programaciones = Array.isArray(data) ? data : [];
      setProgramaciones(programaciones);
    } catch (error) {
      console.error('Error al cargar las programaciones:', error);
      toast.error('Error al cargar las programaciones');
      setProgramaciones([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    cargarProgramaciones();
  }, [cargarProgramaciones]);

  // Manejar la creación de una nueva programación
  const handleCreate = () => {
    setCurrentProgramacion({
      nombre: '',
      nivel: 'Profesional',
      idUnidad: 0,
      estado: 'Borrador' as const
    });
    setIsFormOpen(true);
  };

  // Manejar la edición de una programación
  const handleEdit = (programacion: ProgramacionGeneral) => {
    setCurrentProgramacion(programacion);
    setIsFormOpen(true);
  };

  // Manejar la eliminación de una programación
  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta programación? Esta acción no se puede deshacer.')) {
      try {
        await programacionGeneralService.delete(id);
        toast.success('Programación eliminada correctamente');
        cargarProgramaciones();
      } catch (error) {
        console.error('Error al eliminar la programación:', error);
        toast.error('Error al eliminar la programación');
      }
    }
  };

  // Manejar el cambio de estado de una programación
  const handleCambiarEstado = async (id: number, nuevoEstado: string) => {
    try {
      await programacionGeneralService.cambiarEstado(id, nuevoEstado as any);
      toast.success(`Programación ${nuevoEstado.toLowerCase()} correctamente`);
      cargarProgramaciones();
    } catch (error) {
      console.error('Error al cambiar el estado de la programación:', error);
      toast.error('Error al cambiar el estado de la programación');
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async (data: Omit<ProgramacionGeneral, 'id' | 'fechaCreacion' | 'estado'>) => {
    try {
      setIsSubmitting(true);
      
      if (currentProgramacion?.id) {
        // Actualizar programación existente
        await programacionGeneralService.update(currentProgramacion.id, data);
        toast.success('Programación actualizada correctamente');
      } else {
        // Crear nueva programación
        await programacionGeneralService.create(data);
        toast.success('Programación creada correctamente');
      }
      
      setIsFormOpen(false);
      cargarProgramaciones();
    } catch (error) {
      console.error('Error al guardar la programación:', error);
      toast.error('Error al guardar la programación');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Programación General</h1>
              <button
                type="button"
                onClick={handleCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Agregar Programación
              </button>
            </div>
          </div>

          <div className="px-4 py-5 sm:p-6">
            <ProgramacionGeneralTable 
              programaciones={programaciones} 
              isLoading={isLoading} 
              onRefresh={cargarProgramaciones}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCambiarEstado={handleCambiarEstado}
            />

            {/* Modal de formulario */}
            <EditModal
              isOpen={isFormOpen}
              onClose={() => !isSubmitting && setIsFormOpen(false)}
              title={currentProgramacion?.id ? 'Editar Programación' : 'Nueva Programación'}
              size="lg"
              isLoading={isSubmitting}
            >
              <div className="mt-4">
                <ProgramacionGeneralForm
                  initialData={currentProgramacion || {
                    nombre: '',
                    nivel: 'Profesional',
                    idUnidad: 0,
                    estado: 'Borrador'
                  }}
                  onSubmit={handleSubmit}
                  onCancel={() => !isSubmitting && setIsFormOpen(false)}
                  isSubmitting={isSubmitting}
                />
              </div>
            </EditModal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramacionGeneralPage;
