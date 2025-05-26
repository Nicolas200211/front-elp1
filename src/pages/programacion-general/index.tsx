import React, { useState, useEffect, useCallback } from 'react';
import type { ProgramacionGeneral } from '../../api/config';
import { programacionGeneralService } from '../../api/programacionGeneralService';
import ProgramacionGeneralTable from '../../components/programacion-general/ProgramacionGeneralTable';
import ProgramacionGeneralForm from '../../components/programacion-general/ProgramacionGeneralForm';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProgramacionGeneralPage: React.FC = () => {
  const [programaciones, setProgramaciones] = useState<ProgramacionGeneral[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [currentProgramacion, setCurrentProgramacion] = useState<Partial<ProgramacionGeneral> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // Will be used when implementing navigation to horarios
  // const navigate = useNavigate();

  // Cargar programaciones
  const cargarProgramaciones = useCallback(async () => {
    console.log('Iniciando carga de programaciones...');
    try {
      setIsLoading(true);
      console.log('Llamando a programacionGeneralService.getAll()');
      const data = await programacionGeneralService.getAll();
      console.log('Datos recibidos de programacionGeneralService.getAll():', data);
      const programaciones = Array.isArray(data) ? data : [];
      console.log('Programaciones a guardar en el estado:', programaciones);
      setProgramaciones(programaciones);
    } catch (error) {
      console.error('Error al cargar las programaciones:', error);
      toast.error('Error al cargar las programaciones');
      console.log('Estableciendo programaciones como array vacío debido a error');
      setProgramaciones([]);
    } finally {
      console.log('Finalizando carga, estableciendo isLoading a false');
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
      setCurrentProgramacion(null);
      cargarProgramaciones();
    } catch (error: any) {
      console.error('Error al guardar la programación:', error);
      toast.error(error.message || 'Error al guardar la programación');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para navegar a la programación de horarios (comentada hasta implementación)
  // const handleVerHorarios = (id: number) => {
  //   navigate(`/programacion-horarios?programacionId=${id}`);
  // };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Programación General</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestione las programaciones generales de horarios académicos.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Nueva Programación
          </button>
        </div>
      </div>

      <div className="mt-8">
        <ProgramacionGeneralTable
          programaciones={programaciones}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCambiarEstado={handleCambiarEstado}
          isLoading={isLoading}
        />
      </div>

      {/* Modal de formulario */}
      {isFormOpen && currentProgramacion && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => !isSubmitting && setIsFormOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {currentProgramacion.id ? 'Editar Programación' : 'Nueva Programación'}
                  </h3>
                  <div className="mt-4">
                    <ProgramacionGeneralForm
                      initialData={currentProgramacion}
                      onSubmit={handleSubmit}
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

export default ProgramacionGeneralPage;
