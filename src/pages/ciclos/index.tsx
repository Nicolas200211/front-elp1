import React, { useState, useEffect, useCallback } from 'react';
import { cicloService } from '../../api/cicloService';
import type { Ciclo } from '../../api/config';
import { toast } from 'react-toastify';
import CicloTable from '../../components/ciclos/CicloTable';
import CicloForm from '../../components/ciclos/CicloForm';

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
      } else if (activeFilter === 'activos') {
        console.log('Obteniendo ciclos activos...');
        data = await cicloService.getByEstado('Activo');
      } else if (activeFilter === 'inactivos') {
        console.log('Obteniendo ciclos inactivos...');
        data = await cicloService.getByEstado('Inactivo');
      } else if (activeFilter === 'finalizados') {
        console.log('Obteniendo ciclos finalizados...');
        data = await cicloService.getByEstado('Finalizado');
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

  // Manejar la eliminación de un ciclo
  const handleDeleteCiclo = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este ciclo? Esta acción no se puede deshacer.')) {
      try {
        await cicloService.delete(id);
        toast.success('Ciclo eliminado correctamente');
        cargarCiclos();
      } catch (error) {
        console.error('Error al eliminar el ciclo:', error);
        toast.error('No se pudo eliminar el ciclo');
      }
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
      <div className="mt-6 flex space-x-4">
        <button
          type="button"
          onClick={() => setActiveFilter('todos')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${activeFilter === 'todos' 
            ? 'bg-indigo-100 text-indigo-700' 
            : 'text-gray-700 hover:bg-gray-100'}`}
        >
          Todos
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('activos')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${activeFilter === 'activos' 
            ? 'bg-green-100 text-green-700' 
            : 'text-gray-700 hover:bg-gray-100'}`}
        >
          Activos
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('inactivos')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${activeFilter === 'inactivos' 
            ? 'bg-gray-100 text-gray-700' 
            : 'text-gray-700 hover:bg-gray-100'}`}
        >
          Inactivos
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('finalizados')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${activeFilter === 'finalizados' 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-700 hover:bg-gray-100'}`}
        >
          Finalizados
        </button>
      </div>

      {/* Formulario de ciclo (modal) */}
      {showForm && (
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="border-b border-gray-200 pb-5">
            <h2 className="text-lg font-medium text-gray-900">
              {currentCiclo ? 'Editar Ciclo Académico' : 'Nuevo Ciclo Académico'}
            </h2>
          </div>
          <div className="mt-6">
            <CicloForm
              initialData={currentCiclo || undefined}
              onSuccess={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}

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
