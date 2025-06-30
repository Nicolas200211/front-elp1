import React, { useEffect, useState } from 'react';
import type { Aula, UnidadAcademica } from '../../api/config';
import { 
  HomeIcon,
  HashtagIcon,
  InformationCircleIcon,
  Squares2X2Icon,
  SwatchIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'; 
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface AulaFormProps {
  initialData?: Partial<Aula>;
  onSubmit: (data: Partial<Aula>) => void;
  isEditing?: boolean;
  onCancel: () => void;
  isSubmitting: boolean;
  unidadesAcademicas: UnidadAcademica[];
  isLoadingUnidades: boolean;
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
  unidadesAcademicas = [],
  isLoadingUnidades = false,
}) => {
  const [formData, setFormData] = useState<Partial<Aula> & { tipo?: string; estado?: string }>({
    tipo: undefined,
    estado: undefined,
    tieneEquipamiento: false,
    capacidad: undefined,
    idUnidad: undefined,
    ...initialData
  });

  // Actualizar el formulario cuando cambien las unidades académicas o los datos iniciales
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...initialData
    }));
  }, [initialData]);



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
    if (isSubmitting || isLoadingUnidades) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {isSubmitting && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70 rounded-lg">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">Procesando...</p>
            </div>
          </div>
        )}
        {/* Código */}
        <div className="space-y-1.5">
          <label htmlFor="codigo" className="flex items-center text-sm font-medium text-gray-700">
            <HashtagIcon className="mr-2 h-4 w-4 text-blue-500" />
            Código <span className="ml-1 text-red-500">*</span>
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              type="text"
              name="codigo"
              id="codigo"
              value={formData.codigo || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Ej: A-101"
              required
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <HashtagIcon className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Nombre */}
        <div className="space-y-1.5">
          <label htmlFor="nombre" className="flex items-center text-sm font-medium text-gray-700">
            <HomeIcon className="mr-2 h-4 w-4 text-blue-500" />
            Nombre <span className="ml-1 text-red-500">*</span>
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              type="text"
              name="nombre"
              id="nombre"
              value={formData.nombre || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Ej: Aula Magna"
              required
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <HomeIcon className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Tipo de Aula */}
        <div className="space-y-1.5">
          <label htmlFor="tipo" className="flex items-center text-sm font-medium text-gray-700">
            <Squares2X2Icon className="mr-2 h-4 w-4 text-blue-500" />
            Tipo de Aula <span className="ml-1 text-red-500">*</span>
          </label>
          <div className="relative mt-1">
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 py-2 pl-10 pr-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Seleccione un tipo</option>
              {TIPOS_AULA.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Squares2X2Icon className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Capacidad */}
        <div className="space-y-1.5">
          <label htmlFor="capacidad" className="flex items-center text-sm font-medium text-gray-700">
            <SwatchIcon className="mr-2 h-4 w-4 text-blue-500" />
            Capacidad <span className="ml-1 text-red-500">*</span>
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              type="number"
              name="capacidad"
              id="capacidad"
              min="1"
              value={formData.capacidad || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Ej: 30"
              required
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <SwatchIcon className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Estado */}
        <div className="space-y-1.5">
          <label htmlFor="estado" className="flex items-center text-sm font-medium text-gray-700">
            <InformationCircleIcon className="mr-2 h-4 w-4 text-blue-500" />
            Estado <span className="ml-1 text-red-500">*</span>
          </label>
          <div className="relative mt-1">
            <select
              id="estado"
              name="estado"
              value={formData.estado || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 py-2 pl-10 pr-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Seleccione un estado</option>
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <InformationCircleIcon className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Unidad Académica */}
        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="idUnidad" className="flex items-center text-sm font-medium text-gray-700">
            <HomeIcon className="mr-2 h-4 w-4 text-blue-500" />
            Unidad Académica <span className="ml-1 text-red-500">*</span>
          </label>
          <div className="relative mt-1">
            <select
              id="idUnidad"
              name="idUnidad"
              value={formData.idUnidad || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 py-2 pl-10 pr-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm"
              required
              disabled={isLoadingUnidades || unidadesAcademicas.length === 0}
              aria-invalid={!formData.idUnidad ? 'true' : 'false'}
              aria-describedby="unidad-error"
            >
              <option value="">Seleccione una unidad académica</option>
              {unidadesAcademicas.map((unidad) => (
                <option key={unidad.id} value={unidad.id}>
                  {unidad.nombre} {unidad.codigo ? `(${unidad.codigo})` : ''}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <HomeIcon className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          {isLoadingUnidades ? (
            <p className="mt-1 flex items-center text-sm text-blue-600">
              <svg className="mr-1.5 h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cargando unidades...
            </p>
          ) : unidadesAcademicas.length === 0 ? (
            <p className="mt-1 text-sm text-red-600" id="unidad-error">
              No se pudieron cargar las unidades académicas. Intente recargar la página.
            </p>
          ) : !formData.idUnidad && formData.idUnidad !== undefined ? (
            <p className="mt-1 text-sm text-red-600" id="unidad-required">
              Por favor seleccione una unidad académica
            </p>
          ) : null}
        </div>

        {/* Equipamiento */}
        <div className="flex items-start space-x-3 pt-1 md:col-span-2">
          <div className="flex h-5 items-center">
            <input
              id="tieneEquipamiento"
              name="tieneEquipamiento"
              type="checkbox"
              checked={formData.tieneEquipamiento || false}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
          <div className="text-sm">
            <label htmlFor="tieneEquipamiento" className="font-medium text-gray-700">
              Equipamiento especial
            </label>
            <p className="text-xs text-gray-500">Marque si el aula cuenta con equipamiento especial (proyector, computadoras, etc.)</p>
          </div>
        </div>

        {/* Descripción */}
        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="descripcion" className="flex items-center text-sm font-medium text-gray-700">
            <InformationCircleIcon className="mr-2 h-4 w-4 text-blue-500" />
            Descripción adicional
          </label>
          <div className="mt-1">
            <textarea
              id="descripcion"
              name="descripcion"
              rows={3}
              value={formData.descripcion || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Ingrese detalles adicionales sobre el aula (opcional)"
            />
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end sm:space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <XMarkIcon className="mr-2 h-4 w-4" />
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isLoadingUnidades || unidadesAcademicas.length === 0}
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <svg className="-ml-1 mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </>
          ) : (
            <>
              <CheckCircleIcon className="mr-2 h-4 w-4" />
              {isEditing ? 'Actualizar Aula' : 'Guardar Aula'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};
