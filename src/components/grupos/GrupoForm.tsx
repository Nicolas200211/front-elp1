import React, { useEffect, useState } from 'react';
import { grupoService } from '../../api/grupoService';
import type { Grupo } from '../../api/config'; // Removed unused Ciclo and Programa imports

interface GrupoFormProps {
  initialData?: Partial<Grupo>;
  onSubmit: (data: Partial<Grupo>) => void;
  isEditing?: boolean;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ESTADOS = ['Activo', 'Inactivo', 'Completo', 'En Curso', 'Finalizado'] as const;

export const GrupoForm: React.FC<GrupoFormProps> = ({
  initialData = {},
  onSubmit,
  isEditing = false,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<Partial<Grupo>>(() => ({
    nombre: '',
    capacidad: 20,
    idCiclo: 0,
    idPrograma: 0,
    estado: 'Activo',
    ...initialData
  }));
  
  // Actualizar el estado cuando cambien los initialData
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        // Asegurarse de que los valores numéricos no sean undefined
        capacidad: initialData.capacidad || 20,
        idCiclo: initialData.idCiclo || 0,
        idPrograma: initialData.idPrograma || 0,
        estado: initialData.estado || 'Activo'
      }));
    }
  }, [initialData]);
  
  const [ciclos, setCiclos] = useState<{id: number, nombre: string}[]>([]);
  const [programas, setProgramas] = useState<{id: number, nombre: string}[]>([]);
  const [isLoading, setIsLoading] = useState({
    ciclos: true,
    programas: true
  });

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [ciclosData, programasData] = await Promise.all([
          grupoService.getCiclos(),
          grupoService.getProgramas()
        ]);
        
        setCiclos(ciclosData);
        setProgramas(programasData);
        
        // Si hay un ID de ciclo o programa en los datos iniciales, asegurarse de que existan
        const hasCiclo = initialData.idCiclo && ciclosData.some(c => c.id === initialData.idCiclo);
        const hasPrograma = initialData.idPrograma && programasData.some(p => p.id === initialData.idPrograma);
        
        setFormData(prev => ({
          ...prev,
          idCiclo: hasCiclo ? initialData.idCiclo : ciclosData[0]?.id || 0,
          idPrograma: hasPrograma ? initialData.idPrograma : programasData[0]?.id || 0,
        }));
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
      } finally {
        setIsLoading({ ciclos: false, programas: false });
      }
    };

    loadInitialData();
  }, [initialData.idCiclo, initialData.idPrograma]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
      const newValue = type === 'number' ? (value === '' ? '' : parseInt(value) || 0) : value;
      return {
        ...prev,
        [name]: newValue
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.nombre || !formData.idCiclo || !formData.idPrograma) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }
    
    onSubmit(formData);
  };

  if (isLoading.ciclos || isLoading.programas) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
            Nombre del Grupo <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="nombre"
              id="nombre"
              value={formData.nombre ?? ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
              placeholder="Ej: 1-A, 2-B, etc."
            />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="capacidad" className="block text-sm font-medium text-gray-700">
            Capacidad <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="capacidad"
              id="capacidad"
              min="1"
              value={formData.capacidad ?? ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="idCiclo" className="block text-sm font-medium text-gray-700">
            Ciclo <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="idCiclo"
              name="idCiclo"
              value={formData.idCiclo ?? ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
              disabled={isLoading.ciclos}
            >
              {ciclos.length === 0 ? (
                <option value="">Cargando ciclos...</option>
              ) : (
                ciclos.map((ciclo) => (
                  <option key={ciclo.id} value={ciclo.id}>
                    {ciclo.nombre}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="idPrograma" className="block text-sm font-medium text-gray-700">
            Programa <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="idPrograma"
              name="idPrograma"
              value={formData.idPrograma ?? ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
              disabled={isLoading.programas}
            >
              {programas.length === 0 ? (
                <option value="">Cargando programas...</option>
              ) : (
                programas.map((programa) => (
                  <option key={programa.id} value={programa.id}>
                    {programa.nombre}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
            Estado <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="estado"
              name="estado"
              value={formData.estado ?? 'Activo'}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </>
          ) : isEditing ? (
            'Actualizar Grupo'
          ) : (
            'Crear Grupo'
          )}
        </button>
      </div>
    </form>
  );
};
