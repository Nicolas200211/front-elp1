import React, { useState } from 'react';
import { cicloService } from '../../api/cicloService';
import type { Ciclo } from '../../api/config';
import { toast } from 'react-toastify';
import { FiCalendar, FiRefreshCw, FiSave, FiX } from 'react-icons/fi';

// Type for the form data that matches the API expected type
type CicloFormData = {
  anio: number;
  periodo: 'I' | 'II' | 'Extra';
  estado: 'Todos' | 'Activos' | 'Inactivos' | 'Finalizados';
};

interface CicloFormProps {
  initialData?: Partial<Ciclo>;
  onSuccess: () => void;
  onCancel: () => void;
}

const PERIODOS: Array<CicloFormData['periodo']> = ['I', 'II', 'Extra'];
const ESTADOS: Array<CicloFormData['estado']> = ['Activos', 'Inactivos', 'Finalizados', 'Todos'];

const CicloForm: React.FC<CicloFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<CicloFormData>({
    anio: initialData?.anio || new Date().getFullYear(),
    periodo: initialData?.periodo || 'I',
    estado: initialData?.estado || 'Activos'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!initialData?.id;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.anio) {
      newErrors.anio = 'El año es requerido';
    } else if (formData.anio < 2000 || formData.anio > 2100) {
      newErrors.anio = 'El año debe estar entre 2000 y 2100';
    }
    
    if (!formData.periodo) {
      newErrors.periodo = 'El período es requerido';
    } else if (!PERIODOS.includes(formData.periodo)) {
      newErrors.periodo = 'Período no válido';
    }
    
    if (!formData.estado) {
      newErrors.estado = 'El estado es requerido';
    } else if (!ESTADOS.includes(formData.estado)) {
      newErrors.estado = 'Estado no válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Only send the required fields to the API
      const cicloData = {
        anio: formData.anio,
        periodo: formData.periodo,
        estado: formData.estado
      };

      if (isEdit && initialData?.id) {
        await cicloService.update(initialData.id, cicloData);
        toast.success('Ciclo actualizado correctamente');
      } else {
        await cicloService.create(cicloData);
        toast.success('Ciclo creado correctamente');
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar el ciclo:', error);
      toast.error('Error al guardar el ciclo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Convertir a número si es el campo de año
    let newValue: string | number = value;
    if (name === 'anio') {
      newValue = parseInt(value, 10) || 0;
    } else if (name === 'periodo') {
      newValue = value as Ciclo['periodo'];
    } else if (name === 'estado') {
      newValue = value as Ciclo['estado'];
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Limpiar el error cuando el usuario comienza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            <FiCalendar className="inline-block mr-2 -mt-1" />
            {isEdit ? 'Editar Ciclo Académico' : 'Nuevo Ciclo Académico'}
          </h3>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Año */}
            <div className="space-y-2">
              <label htmlFor="anio" className="block text-sm font-medium text-gray-700">
                Año <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="number"
                  name="anio"
                  id="anio"
                  min="2000"
                  max="2100"
                  value={formData.anio || ''}
                  onChange={handleChange}
                  className={`block w-full pl-3 pr-10 py-2 border ${
                    errors.anio ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Ej: 2023"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FiCalendar className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {errors.anio && (
                <p className="mt-1 text-sm text-red-600">{errors.anio}</p>
              )}
            </div>

            {/* Período */}
            <div className="space-y-2">
              <label htmlFor="periodo" className="block text-sm font-medium text-gray-700">
                Período <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="periodo"
                  name="periodo"
                  value={formData.periodo || ''}
                  onChange={handleChange}
                  className={`block w-full pl-3 pr-10 py-2 border ${
                    errors.periodo ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                >
                  <option value="">Seleccione un período</option>
                  {PERIODOS.map((periodo) => (
                    <option key={periodo} value={periodo}>
                      {periodo}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FiRefreshCw className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {errors.periodo && (
                <p className="mt-1 text-sm text-red-600">{errors.periodo}</p>
              )}
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                Estado <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado || ''}
                  onChange={handleChange}
                  className={`block w-full pl-3 pr-10 py-2 border ${
                    errors.estado ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                >
                  <option value="">Seleccione un estado</option>
                  {ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FiCalendar className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {errors.estado && (
                <p className="mt-1 text-sm text-red-600">{errors.estado}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer del formulario */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            <FiX className="-ml-1 mr-2 h-5 w-5" />
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <FiSave className="-ml-1 mr-2 h-5 w-5" />
                {isEdit ? 'Actualizar ciclo' : 'Crear ciclo'}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CicloForm;
