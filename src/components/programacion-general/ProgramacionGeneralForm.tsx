import React, { useState, useEffect } from 'react';
import { FiBook, FiHome, FiSave, FiX, FiInfo } from 'react-icons/fi';
import type { ProgramacionGeneral, UnidadAcademica } from '../../api/config';
import { unidadAcademicaService } from '../../api/unidadAcademicaService';
import { toast } from 'react-toastify';

interface ProgramacionGeneralFormProps {
  initialData?: Partial<ProgramacionGeneral>;
  onSubmit: (data: Omit<ProgramacionGeneral, 'id' | 'fechaCreacion' | 'estado'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const NIVELES = [
  { value: 'Inicial', label: 'Nivel Inicial' },
  { value: 'Primaria', label: 'Educación Primaria' },
  { value: 'Secundaria', label: 'Educación Secundaria' },
  { value: 'Superior', label: 'Educación Superior' },
  { value: 'Profesional', label: 'Formación Profesional' },
  { value: 'Otro', label: 'Otro Nivel' }
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar unidades académicas
  useEffect(() => {
    const cargarUnidades = async () => {
      try {
        const data = await unidadAcademicaService.getAll();
        setUnidades(data);
        
        if (initialData?.idUnidad && !formData.idUnidad) {
          setFormData(prev => ({
            ...prev,
            idUnidad: initialData.idUnidad as number
          }));
        }
      } catch (error) {
        console.error('Error al cargar unidades académicas:', error);
        toast.error('Error al cargar las unidades académicas');
      } finally {
        setIsLoading(false);
      }
    };

    cargarUnidades();
  }, []);

  // Actualizar formData cuando initialData cambie
  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        nivel: initialData.nivel || 'Profesional',
        idUnidad: initialData.idUnidad || 0,
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre?.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.idUnidad) newErrors.idUnidad = 'Seleccione una unidad académica';
    if (!formData.nivel) newErrors.nivel = 'Seleccione un nivel';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'idUnidad' ? parseInt(value, 10) : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error al guardar la programación:', error);
      toast.error('Error al guardar la programación');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-6">
        {/* Nombre */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la Programación <span className="text-red-500">*</span>
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiBook className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="nombre"
              id="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border ${
                errors.nombre ? 'border-red-300' : 'border-gray-300'
              } rounded-md py-2`}
              placeholder="Ej: Programación Académica 2024"
            />
          </div>
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <FiInfo className="mr-1" /> {errors.nombre}
            </p>
          )}
        </div>

        {/* Nivel */}
        <div>
          <label htmlFor="nivel" className="block text-sm font-medium text-gray-700 mb-1">
            Nivel Educativo <span className="text-red-500">*</span>
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiBook className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="nivel"
              name="nivel"
              value={formData.nivel}
              onChange={handleChange}
              className={`block w-full pl-10 pr-10 py-2 text-base border ${
                errors.nivel ? 'border-red-300' : 'border-gray-300'
              } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md`}
            >
              {NIVELES.map((nivel) => (
                <option key={nivel.value} value={nivel.value}>
                  {nivel.label}
                </option>
              ))}
            </select>
          </div>
          {errors.nivel && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <FiInfo className="mr-1" /> {errors.nivel}
            </p>
          )}
        </div>

        {/* Unidad Académica */}
        <div>
          <label htmlFor="idUnidad" className="block text-sm font-medium text-gray-700 mb-1">
            Unidad Académica <span className="text-red-500">*</span>
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiHome className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="idUnidad"
              name="idUnidad"
              value={formData.idUnidad || ''}
              onChange={handleChange}
              className={`block w-full pl-10 pr-10 py-2 text-base border ${
                errors.idUnidad ? 'border-red-300' : 'border-gray-300'
              } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md`}
            >
              <option value="">Seleccione una unidad académica</option>
              {unidades.map((unidad) => (
                <option key={unidad.id} value={unidad.id}>
                  {unidad.nombre}
                </option>
              ))}
            </select>
          </div>
          {errors.idUnidad && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <FiInfo className="mr-1" /> {errors.idUnidad}
            </p>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="pt-5 border-t border-gray-200">
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiX className="-ml-1 mr-2 h-4 w-4" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <FiSave className="-ml-1 mr-2 h-4 w-4" />
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
      </div>
    </form>
  );
};

export default ProgramacionGeneralForm;
