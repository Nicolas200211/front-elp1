import React, { useState, useEffect } from 'react';
import { cicloService } from '../../api/cicloService';
import type { Ciclo } from '../../api/config';
import { toast } from 'react-toastify';

interface CicloFormProps {
  initialData?: Partial<Ciclo>;
  onSuccess: () => void;
  onCancel: () => void;
}

const PERIODOS = [
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'Verano', 'Invierno'
];

const ESTADOS = [
  'Activo', 'Inactivo', 'Pendiente', 'Finalizado', 'Cancelado'
];

const CicloForm: React.FC<CicloFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Ciclo>>({
    anio: new Date().getFullYear(),
    periodo: 'I',
    fechaInicio: '',
    fechaFin: '',
    estado: 'Pendiente',
    ...initialData
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!initialData?.id;

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        // Asegurarse de que las fechas estén en el formato correcto para el input date
        fechaInicio: initialData.fechaInicio ? new Date(initialData.fechaInicio).toISOString().split('T')[0] : '',
        fechaFin: initialData.fechaFin ? new Date(initialData.fechaFin).toISOString().split('T')[0] : ''
      }));
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.anio) {
      newErrors.anio = 'El año es requerido';
    } else if (formData.anio < 2000 || formData.anio > 2100) {
      newErrors.anio = 'El año debe estar entre 2000 y 2100';
    }
    
    if (!formData.periodo) {
      newErrors.periodo = 'El período es requerido';
    }
    
    if (!formData.fechaInicio) {
      newErrors.fechaInicio = 'La fecha de inicio es requerida';
    }
    
    if (!formData.fechaFin) {
      newErrors.fechaFin = 'La fecha de fin es requerida';
    } else if (formData.fechaInicio && formData.fechaFin < formData.fechaInicio) {
      newErrors.fechaFin = 'La fecha de fin no puede ser anterior a la fecha de inicio';
    }
    
    if (!formData.estado) {
      newErrors.estado = 'El estado es requerido';
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
      if (isEdit && formData.id) {
        await cicloService.update(formData.id, formData);
        toast.success('Ciclo actualizado correctamente');
      } else {
        await cicloService.create(formData as Omit<Ciclo, 'id'>);
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
    const newValue = name === 'anio' ? parseInt(value, 10) : value;
    
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
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="anio" className="block text-sm font-medium text-gray-700">
            Año <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="anio"
              id="anio"
              min="2000"
              max="2100"
              value={formData.anio || ''}
              onChange={handleChange}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.anio ? 'border-red-300' : ''}`}
            />
            {errors.anio && <p className="mt-1 text-sm text-red-600">{errors.anio}</p>}
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="periodo" className="block text-sm font-medium text-gray-700">
            Período <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="periodo"
              name="periodo"
              value={formData.periodo || ''}
              onChange={handleChange}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.periodo ? 'border-red-300' : ''}`}
            >
              <option value="">Seleccionar período</option>
              {PERIODOS.map((periodo) => (
                <option key={periodo} value={periodo}>
                  {periodo}
                </option>
              ))}
            </select>
            {errors.periodo && <p className="mt-1 text-sm text-red-600">{errors.periodo}</p>}
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700">
            Fecha de inicio <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="date"
              name="fechaInicio"
              id="fechaInicio"
              value={formData.fechaInicio || ''}
              onChange={handleChange}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.fechaInicio ? 'border-red-300' : ''}`}
            />
            {errors.fechaInicio && <p className="mt-1 text-sm text-red-600">{errors.fechaInicio}</p>}
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700">
            Fecha de fin <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="date"
              name="fechaFin"
              id="fechaFin"
              value={formData.fechaFin || ''}
              onChange={handleChange}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.fechaFin ? 'border-red-300' : ''}`}
            />
            {errors.fechaFin && <p className="mt-1 text-sm text-red-600">{errors.fechaFin}</p>}
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
              value={formData.estado || ''}
              onChange={handleChange}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.estado ? 'border-red-300' : ''}`}
              disabled={isEdit && formData.estado === 'Activo'}
            >
              <option value="">Seleccionar estado</option>
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
            {errors.estado && <p className="mt-1 text-sm text-red-600">{errors.estado}</p>}
            {isEdit && formData.estado === 'Activo' && (
              <p className="mt-1 text-xs text-gray-500">
                No se puede cambiar el estado de un ciclo activo. Desactívelo primero.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="-ml-1 mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </>
          ) : isEdit ? (
            'Actualizar ciclo'
          ) : (
            'Crear ciclo'
          )}
        </button>
      </div>
    </form>
  );
};

export default CicloForm;
