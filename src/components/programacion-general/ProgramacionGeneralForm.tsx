import React, { useState, useEffect } from 'react';
import type { ProgramacionGeneral, UnidadAcademica } from '../../api/config';
import { unidadAcademicaService } from '../../api/unidadAcademicaService';

interface ProgramacionGeneralFormProps {
  initialData?: Partial<ProgramacionGeneral>;
  onSubmit: (data: Omit<ProgramacionGeneral, 'id' | 'fechaCreacion' | 'estado'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const NIVELES = [
  'Inicial',
  'Primaria',
  'Secundaria',
  'Superior',
  'Profesional',
  'Otro'
];

const ProgramacionGeneralForm: React.FC<ProgramacionGeneralFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<Omit<ProgramacionGeneral, 'id' | 'fecha_creacion' | 'estado' | 'unidad'>>({
    nombre: '',
    nivel: 'Profesional',
    idUnidad: 0,
  });

  const [unidades, setUnidades] = useState<UnidadAcademica[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar unidades académicas
  useEffect(() => {
    const cargarUnidades = async () => {
      try {
        const data = await unidadAcademicaService.getAll();
        setUnidades(data);
        
        // Si hay un idUnidad en initialData, establecerlo
        if (initialData?.idUnidad && !formData.idUnidad) {
          setFormData(prev => ({
            ...prev,
            idUnidad: initialData.idUnidad as number
          }));
        }
      } catch (error) {
        console.error('Error al cargar unidades académicas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    cargarUnidades();
  }, []);

  // Actualizar formData cuando initialData cambie
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        nombre: initialData.nombre || '',
        nivel: initialData.nivel || 'Profesional',
        idUnidad: initialData.idUnidad || 0,
      }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'idUnidad' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white px-4 py-5 sm:p-6">
        <div className="grid grid-cols-6 gap-6">
          <div className="col-span-6 sm:col-span-3">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre de la Programación *
            </label>
            <input
              type="text"
              name="nombre"
              id="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              placeholder="Ej: Programación 2025-I"
            />
          </div>

          <div className="col-span-6 sm:col-span-3">
            <label htmlFor="nivel" className="block text-sm font-medium text-gray-700">
              Nivel *
            </label>
            <select
              id="nivel"
              name="nivel"
              value={formData.nivel}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              required
            >
              {NIVELES.map((nivel) => (
                <option key={nivel} value={nivel}>
                  {nivel}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="id_unidad" className="block text-sm font-medium text-gray-700">
              Unidad Académica *
            </label>
            <select
              id="idUnidad"
              name="idUnidad"
              value={formData.idUnidad}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="">Seleccione una unidad</option>
              {unidades.map((unidad) => (
                <option key={unidad.id} value={unidad.id}>
                  {unidad.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="mr-3 inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </>
          ) : initialData?.id ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};

export default ProgramacionGeneralForm;
