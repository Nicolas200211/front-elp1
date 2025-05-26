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
      idPrograma: 0,
      idDocente: 0,
    });
    setIsFormOpen(true);
  };

  const handleEdit = (asignatura: Asignatura) => {
    setCurrentAsignatura({ ...asignatura });
    setIsFormOpen(true);
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
        await asignaturaService.update(formData.id, formData);
        toast.success('Asignatura actualizada correctamente');
      } else {
        // Crear nueva asignatura
        await asignaturaService.create(formData as Omit<Asignatura, 'id'>);
        toast.success('Asignatura creada correctamente');
      }
      
      setIsFormOpen(false);
      setCurrentAsignatura(null);
      loadAsignaturas();
    } catch (error: any) {
      console.error('Error al guardar la asignatura:', error);
      toast.error(error.message || 'Error al guardar la asignatura');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
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

      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <AsignaturaTable 
              asignaturas={asignaturas} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => !isSubmitting && setIsFormOpen(false)}
        title={currentAsignatura?.id ? 'Editar Asignatura' : 'Nueva Asignatura'}
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
              onClick={() => currentAsignatura && handleSubmit(currentAsignatura)}
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
        {currentAsignatura && (
          <AsignaturaForm
            initialData={currentAsignatura}
            onSubmit={handleSubmit}
            isEditing={!!currentAsignatura.id}
            onCancel={() => !isSubmitting && setIsFormOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default AsignaturasPage;
