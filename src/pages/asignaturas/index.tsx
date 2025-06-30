import React, { useState, useEffect } from 'react';
import { AsignaturaForm } from '../../components/asignaturas/AsignaturaForm';
import { AsignaturaTable } from '../../components/asignaturas/AsignaturaTable';
import { asignaturaService } from '../../api/asignaturaService';
import type { Asignatura } from '../../api/config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal } from '../../components/ui/Modal';

const AsignaturasPage: React.FC = () => {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [currentAsignatura, setCurrentAsignatura] = useState<Partial<Asignatura> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Cargar asignaturas al montar el componente
  useEffect(() => {
    loadAsignaturas();
  }, []);

  const loadAsignaturas = async () => {
    try {
      setIsLoading(true);
      const data = await asignaturaService.getAll();
      setAsignaturas(data);
    } catch (error) {
      console.error('Error al cargar las asignaturas:', error);
      toast.error('Error al cargar las asignaturas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setCurrentAsignatura({
      codigo: '',
      nombre: '',
      creditos: 0,
      horasTeoricas: 0,
      horasPracticas: 0,
      tipo: 'Obligatoria',
      estado: 'Activa',
      idProgramacionGeneral: 0, // Agregado
      idDocente: 0,
    });
    setIsFormOpen(true);
  };

  const handleEdit = async (asignatura: Asignatura) => {
    console.log('Iniciando edición de asignatura:', asignatura);
    try {
      // Usar los datos que ya tenemos en lugar de hacer una nueva petición
      const datosActuales = { ...asignatura };
      
      console.log('Datos actuales de la asignatura:', datosActuales);
      
      // Si faltan datos importantes, intentar cargarlos desde el servidor
      if (!datosActuales.idProgramacionGeneral || !datosActuales.docente || !datosActuales.unidadAcademica) {
        try {
          console.log('Cargando datos adicionales de la asignatura...');
          const datosCompletos = await asignaturaService.getById(asignatura.id!);
          console.log('Datos completos cargados:', datosCompletos);
          
          // Combinar los datos existentes con los datos cargados
          Object.assign(datosActuales, datosCompletos);
        } catch (error) {
          console.warn('No se pudieron cargar los datos adicionales, usando datos básicos:', error);
        }
      }
      
      // Preparar los datos para el formulario
      const datosFormulario: Partial<Asignatura> = {
        ...datosActuales,
        // Asegurarnos de que los campos numéricos sean números
        idProgramacionGeneral: datosActuales.idProgramacionGeneral ? Number(datosActuales.idProgramacionGeneral) : 0,
        idDocente: datosActuales.idDocente ? Number(datosActuales.idDocente) : 0,
        idUnidadAcademica: datosActuales.idUnidadAcademica ? Number(datosActuales.idUnidadAcademica) : 0,
        creditos: datosActuales.creditos ? Number(datosActuales.creditos) : 0,
        horasTeoricas: datosActuales.horasTeoricas ? Number(datosActuales.horasTeoricas) : 0,
        horasPracticas: datosActuales.horasPracticas ? Number(datosActuales.horasPracticas) : 0,
      };
      
      console.log('Datos preparados para el formulario:', datosFormulario);
      
      setCurrentAsignatura(datosFormulario);
      setIsFormOpen(true);
    } catch (error) {
      console.error('Error al cargar los datos de la asignatura para edición:', error);
      toast.error('Error al cargar los datos de la asignatura. Intente nuevamente.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta asignatura?')) {
      try {
        await asignaturaService.delete(id);
        toast.success('Asignatura eliminada correctamente');
        loadAsignaturas();
      } catch (error) {
        console.error('Error al eliminar la asignatura:', error);
        toast.error('Error al eliminar la asignatura');
      }
    }
  };

  const handleSubmit = async (formData: Partial<Asignatura>) => {
    try {
      setIsSubmitting(true);
      
      if (formData.id) {
        // Actualizar asignatura existente
        console.log('Actualizando asignatura con datos:', formData);
        const updatedAsignatura = await asignaturaService.update(formData.id, formData);
        console.log('Asignatura actualizada en el servidor:', updatedAsignatura);
        toast.success('Asignatura actualizada correctamente');
      } else {
        // Crear nueva asignatura
        console.log('Creando nueva asignatura con datos:', formData);
        await asignaturaService.create(formData as Omit<Asignatura, 'id'>);
        toast.success('Asignatura creada correctamente');
      }
      
      // Forzar una recarga completa de las asignaturas
      await loadAsignaturas();
      setIsFormOpen(false);
      setCurrentAsignatura(null);
    } catch (error: any) {
      console.error('Error al guardar la asignatura:', error);
      toast.error(error.message || 'Error al guardar la asignatura');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6 pl-0 pr-4">
      <div className="sm:flex sm:items-center pl-16 pr-4">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Asignaturas</h1>
          <p className="mt-2 text-sm text-gray-700">
            Administra las asignaturas de la institución. Puedes crear, editar y eliminar asignaturas.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            Agregar Asignatura
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <AsignaturaTable 
          asignaturas={asignaturas} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      )}

      {/* Modal de formulario */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => !isSubmitting && setIsFormOpen(false)}
        title={currentAsignatura?.id ? 'Editar Asignatura' : 'Nueva Asignatura'}
        maxWidth="1024px"
      >
        {currentAsignatura && (
          <AsignaturaForm
            initialData={currentAsignatura}
            onSubmit={handleSubmit}
            isEditing={!!currentAsignatura.id}
            onCancel={() => !isSubmitting && setIsFormOpen(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>
    </div>
  );
};

export default AsignaturasPage;
