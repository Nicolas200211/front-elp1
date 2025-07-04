import React, { useEffect } from 'react';
import type { UnidadAcademica } from '../../api/config';
import { FiBook, FiEdit2, FiX, FiSave } from 'react-icons/fi';

interface UnidadAcademicaFormProps {
  initialData?: Partial<UnidadAcademica>;
  onSubmit: (data: Partial<UnidadAcademica>) => void;
  isEditing?: boolean;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const UnidadAcademicaForm: React.FC<UnidadAcademicaFormProps> = ({
  initialData = {},
  onSubmit,
  isEditing = false,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = React.useState<Partial<UnidadAcademica>>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        
        <div className="p-6 space-y-6">
          {/* Nombre */}
          <div className="space-y-2">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre || ''}
                onChange={handleChange}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ej: Facultad de Ingeniería"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FiEdit2 className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <div className="relative">
              <textarea
                id="descripcion"
                name="descripcion"
                rows={4}
                value={formData.descripcion || ''}
                onChange={handleChange}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ingrese una descripción para la unidad académica"
              />
              <div className="absolute inset-y-0 right-0 pr-3 pt-2 flex items-start pointer-events-none">
                <FiBook className="h-5 w-5 text-gray-400" />
              </div>
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
                Procesando...
              </>
            ) : (
              <>
                <FiSave className="-ml-1 mr-2 h-5 w-5" />
                {isEditing ? 'Actualizar Unidad' : 'Crear Unidad'}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
