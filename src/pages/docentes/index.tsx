import React, { useState, useEffect, useCallback } from 'react';
import { DocenteForm } from '../../components/docentes/DocenteForm';
import { DocenteTable } from '../../components/docentes/DocenteTable';
import { docenteService } from '../../api/docenteService';
import type { Docente } from '../../api/config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal } from '../../components/ui/Modal';
import { DeleteModal } from '../../components/modales/DeleteModal';

const DocentesPage: React.FC = () => {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [currentDocente, setCurrentDocente] = useState<Partial<Docente> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [docenteToDelete, setDocenteToDelete] = useState<Docente | null>(null);

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
      dni: '',
      nombres: '',
      apellidos: '',
      email: '',  
      especialidad: '',
      telefono: '',
      direccion: '',
      estado: 'Activo',
      tipoContrato: 'Tiempo completo',
      horasDisponibles: 0
    });
    setIsFormOpen(true);
  };

  // Manejar la edición de un docente existente
  const handleEdit = (docente: Docente) => {
    // When editing, keep the existing data but ensure required fields are set
    setCurrentDocente({
      ...docente,
      // Ensure required fields have defaults if undefined
      nombres: docente.nombres || '',
      apellidos: docente.apellidos || '',
      email: docente.email || '',
      especialidad: docente.especialidad || '',
      estado: docente.estado || 'Activo',
      tipoContrato: docente.tipoContrato || 'Tiempo completo',
      horasDisponibles: docente.horasDisponibles || 0
    });
    setIsFormOpen(true);
  };

  // Manejar la solicitud de eliminación de un docente
  const handleDeleteClick = (id: number) => {
    const docente = docentes.find(d => d.id === id);
    if (docente) {
      setDocenteToDelete(docente);
    }
  };

  // Confirmar eliminación de docente
  const handleDeleteConfirm = async () => {
    if (!docenteToDelete?.id) return;
    
    try {
      await docenteService.delete(docenteToDelete.id);
      toast.success('Docente eliminado correctamente');
      loadDocentes();
    } catch (error) {
      console.error('Error al eliminar el docente:', error);
      toast.error('Error al eliminar el docente');
    } finally {
      setDocenteToDelete(null);
    }
  };

  // Cancelar eliminación
  const handleDeleteCancel = () => {
    setDocenteToDelete(null);
  };

  // Función para verificar si el email ya existe
  const verificarEmailExistente = async (email: string, excludeId?: number | string): Promise<boolean> => {
    try {
      const docentes = await docenteService.getAll();
      return docentes.some(docente => {
        // Normalizar emails para comparación insensible a mayúsculas
        const emailCoincide = docente.email?.toLowerCase() === email.toLowerCase();
        // Si se proporciona un ID a excluir, verificar que no sea el mismo docente
        const esMismoDocente = excludeId !== undefined && String(docente.id) === String(excludeId);
        return emailCoincide && !esMismoDocente;
      });
    } catch (error) {
      console.error('Error al verificar email existente:', error);
      return false;
    }
  };

  // Manejar el envío del formulario (crear/actualizar)
  const handleSubmit = async (formData: Partial<Docente>) => {
    try {
      if (!formData.email) {
        throw new Error('El correo electrónico es requerido');
      }

      setIsSubmitting(true);
      
      // Verificar si el email ya existe (excluyendo el docente actual si es una edición)
      const emailExiste = await verificarEmailExistente(
        formData.email,
        formData.id
      );

      if (emailExiste) {
        throw new Error(
          formData.id 
            ? 'Ya existe otro docente con este correo electrónico' 
            : 'Ya existe un docente con este correo electrónico'
        );
      }
      
      // Crear un objeto limpio sin campos undefined
      const cleanData = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v !== undefined)
      );

      if (formData.id) {
        // Actualizar docente existente
        await docenteService.update(formData.id, cleanData);
        toast.success('Docente actualizado correctamente');
      } else {
        // Crear nuevo docente
        await docenteService.create(cleanData as Omit<Docente, 'id'>);
        toast.success('Docente creado correctamente');
      }
      
      setIsFormOpen(false);
      setCurrentDocente(null);
      loadDocentes();
    } catch (error: any) {
      console.error('Error al guardar el docente:', error);
      
      // Mostrar mensajes de error más amigables
      if (error.message.includes('Ya existe')) {
        toast.error(error.message);
      } else {
        toast.error('Error al guardar el docente. Verifique los datos e intente nuevamente.');
      }
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
          onDelete={handleDeleteClick}
          isLoading={isLoading}
        />
      </div>

      {/* Modal de formulario */}
      <Modal
        isOpen={isFormOpen && !!currentDocente}
        onClose={() => !isSubmitting && setIsFormOpen(false)}
        title={currentDocente?.id ? 'Editar Docente' : 'Nuevo Docente'}
        maxWidth="800px"
      >
        <DocenteForm
          initialData={currentDocente || {}}
          onSubmit={handleSubmit}
          isEditing={!!currentDocente?.id}
          onCancel={() => !isSubmitting && setIsFormOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <DeleteModal
        isOpen={!!docenteToDelete}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Docente"
        itemName={`${docenteToDelete?.nombres} ${docenteToDelete?.apellidos}`}
        description={`¿Está seguro de que desea eliminar a este docente? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default DocentesPage;
