import React, { useState, useEffect, useCallback } from 'react';
import { cicloService } from '../../api/cicloService';
import type { Ciclo } from '../../api/config';
import { toast } from 'react-toastify';
import CicloTable from '../../components/ciclos/CicloTable';
import CicloForm from '../../components/ciclos/CicloForm';
import { EditModal } from '../../components/modales/EditModal';
import { DeleteModal } from '../../components/modales/DeleteModal';

const CiclosPage: React.FC = () => {
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentCiclo, setCurrentCiclo] = useState<Partial<Ciclo> | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('todos');

  // Cargar ciclos
  const cargarCiclos = useCallback(async () => {
    try {
      console.log('Iniciando carga de ciclos con filtro:', activeFilter);
      setIsLoading(true);
      let data: Ciclo[] = [];
      
      if (activeFilter === 'todos') {
        console.log('Obteniendo todos los ciclos...');
        data = await cicloService.getAll();
      } else {
        console.log(`Obteniendo ciclos con estado: ${activeFilter}...`);
        data = await cicloService.getByEstado(activeFilter);
      }
      
      console.log('Datos recibidos del servicio:', data);
      
      // Ordenar por año y período
      const dataOrdenada = [...data].sort((a, b) => {
        if (a.anio !== b.anio) return b.anio - a.anio;
        // Ordenar por período (I, II, III, etc.)
        const periodos = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'Verano', 'Invierno'];
        return periodos.indexOf(b.periodo) - periodos.indexOf(a.periodo);
      });
      
      console.log('Datos ordenados:', dataOrdenada);
      setCiclos(dataOrdenada);
    } catch (error) {
      console.error('Error al cargar los ciclos:', error);
      toast.error('Error al cargar los ciclos');
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  // Cargar ciclos al montar el componente o cambiar el filtro
  useEffect(() => {
    cargarCiclos();
  }, [cargarCiclos]);

  // Manejar la creación de un nuevo ciclo
  const handleNuevoCiclo = () => {
    setCurrentCiclo(null);
    setShowForm(true);
  };

  // Manejar la edición de un ciclo
  const handleEditCiclo = (ciclo: Ciclo) => {
    setCurrentCiclo(ciclo);
    setShowForm(true);
  };

  // Estados para los modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cicloToDelete, setCicloToDelete] = useState<Ciclo | null>(null);

  // Manejar la eliminación de un ciclo
  const handleDeleteCiclo = (id: number) => {
    const ciclo = ciclos.find(c => c.id === id);
    if (ciclo) {
      setCicloToDelete(ciclo);
      setShowDeleteModal(true);
    }
  };

  // Confirmar eliminación
  const confirmDeleteCiclo = async () => {
    if (!cicloToDelete?.id) return;
    
    try {
      await cicloService.delete(cicloToDelete.id);
      toast.success('Ciclo eliminado correctamente');
      cargarCiclos();
    } catch (error) {
      console.error('Error al eliminar el ciclo:', error);
      toast.error('No se pudo eliminar el ciclo');
    } finally {
      setShowDeleteModal(false);
      setCicloToDelete(null);
    }
  };

  // Manejar el envío del formulario
  const handleFormSubmit = () => {
    setShowForm(false);
    cargarCiclos();
  };

  // Manejar la cancelación del formulario
  const handleFormCancel = () => {
    setShowForm(false);
    setCurrentCiclo(null);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Ciclos Académicos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestione los ciclos académicos de la institución.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={handleNuevoCiclo}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Nuevo ciclo
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Filtrar por estado:</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter('todos')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeFilter === 'todos'
                ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('Activos')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeFilter === 'Activos'
                ? 'bg-green-600 text-white shadow-sm hover:bg-green-700'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Activos
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('Inactivos')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeFilter === 'Inactivos'
                ? 'bg-yellow-600 text-white shadow-sm hover:bg-yellow-700'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Inactivos
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('Finalizados')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeFilter === 'Finalizados'
                ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Finalizados
          </button>
        </div>
      </div>

      {/* Modal de edición */}
      <EditModal
        isOpen={showForm}
        onClose={handleFormCancel}
        title={currentCiclo ? 'Editar Ciclo Académico' : 'Nuevo Ciclo Académico'}
        size="lg"
      >
        <CicloForm
          initialData={currentCiclo || undefined}
          onSuccess={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </EditModal>

      {/* Modal de confirmación de eliminación */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteCiclo}
        itemName={cicloToDelete ? `Ciclo ${cicloToDelete.anio}-${cicloToDelete.periodo}` : ''}
        title="Confirmar eliminación de ciclo"
        description="¿Está seguro de que desea eliminar el siguiente ciclo académico?"
        confirmText="Eliminar ciclo"
        cancelText="Cancelar"
      />

      {/* Tabla de ciclos */}
      <div className="mt-8">
        <CicloTable
          ciclos={ciclos}
          onEdit={handleEditCiclo}
          onDelete={handleDeleteCiclo}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default CiclosPage;
