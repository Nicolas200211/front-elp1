import React, { useEffect, useState, useCallback } from 'react';
import type { Aula, UnidadAcademica } from '../../api/config';
import { unidadAcademicaService } from '../../api/unidadAcademicaService';

interface AulaFormProps {
  initialData?: Partial<Aula>;
  onSubmit: (data: Partial<Aula>) => void;
  isEditing?: boolean;
  onCancel: () => void;
  isSubmitting: boolean;
}

const TIPOS_AULA = [
  'Teórica',
  'Laboratorio',
  'Idioma',
  'Multifuncional'
];

const ESTADOS = ['Disponible', 'En Mantenimiento', 'Ocupado', 'Inactivo'];

export const AulaForm: React.FC<AulaFormProps> = ({
  initialData = {},
  onSubmit,
  isEditing = false,
  onCancel,
  isSubmitting,
}) => {
  const [unidadesAcademicas, setUnidadesAcademicas] = useState<UnidadAcademica[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Aula>>({
    tipo: 'Teórica',
    estado: 'Disponible',
    tieneEquipamiento: false,
    capacidad: 20,
    idUnidad: undefined,
    ...initialData
  });

  // Cargar unidades académicas al montar el componente
  const loadUnidadesAcademicas = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await unidadAcademicaService.getAll();
      setUnidadesAcademicas(data);
      
      // Si hay datos iniciales pero no hay idUnidad, establecer el primero por defecto
      if (initialData && !initialData.idUnidad && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          idUnidad: data[0].id
        }));
      }
    } catch (error) {
      console.error('Error al cargar las unidades académicas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [initialData]);

  useEffect(() => {
    loadUnidadesAcademicas();
  }, [loadUnidadesAcademicas]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...initialData,
      capacidad: initialData.capacidad || 20,
      tipo: initialData.tipo || 'Teórica',
      estado: initialData.estado || 'Disponible',
      tieneEquipamiento: initialData.tieneEquipamiento || false,
      idUnidad: initialData.idUnidad || (unidadesAcademicas[0]?.id)
    }));
  }, [initialData, unidadesAcademicas]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 :
              type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
        <div>
          <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">
            Código <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="codigo"
            id="codigo"
            value={formData.codigo || ''}
            onChange={handleChange}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        
        <div>
          <label htmlFor="idUnidad" className="block text-sm font-medium text-gray-700">
            Unidad Académica <span className="text-red-500">*</span>
          </label>
          <select
            id="idUnidad"
            name="idUnidad"
            value={formData.idUnidad || ''}
            onChange={handleChange}
            className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
            disabled={isLoading || unidadesAcademicas.length === 0}
          >
            {isLoading ? (
              <option>Cargando unidades académicas...</option>
            ) : unidadesAcademicas.length === 0 ? (
              <option>No hay unidades académicas disponibles</option>
            ) : (
              unidadesAcademicas.map((unidad) => (
                <option key={unidad.id} value={unidad.id}>
                  {unidad.nombre}
                </option>
              ))
            )}
          </select>
        </div>
        
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
            Nombre <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="nombre"
              id="nombre"
              value={formData.nombre || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
            Tipo <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo || 'Aula'}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              {TIPOS_AULA.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="capacidad" className="block text-sm font-medium text-gray-700">
            Capacidad <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="capacidad"
              id="capacidad"
              min="1"
              value={formData.capacidad || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
            Estado <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="estado"
              name="estado"
              value={formData.estado || 'Disponible'}
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

        <div className="sm:col-span-3">
          <label htmlFor="idUnidad" className="block text-sm font-medium text-gray-700">
            ID de Unidad Académica <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="idUnidad"
              id="idUnidad"
              min="1"
              value={formData.idUnidad || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="sm:col-span-3 flex items-end">
          <div className="flex items-center h-10">
            <input
              id="tieneEquipamiento"
              name="tieneEquipamiento"
              type="checkbox"
              checked={formData.tieneEquipamiento || false}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="tieneEquipamiento" className="ml-2 block text-sm text-gray-900">
              ¿Tiene equipamiento especial?
            </label>
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <div className="mt-1">
            <textarea
              id="descripcion"
              name="descripcion"
              rows={3}
              value={formData.descripcion || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
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
            'Actualizar Aula'
          ) : (
            'Crear Aula'
          )}
        </button>
      </div>
    </form>
  );
};
