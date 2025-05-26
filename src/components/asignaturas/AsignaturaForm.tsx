import React, { useState, useEffect } from 'react';
import type { Asignatura } from '../../api/config';

interface AsignaturaFormProps {
  initialData?: Partial<Asignatura>;
  onSubmit: (data: Partial<Asignatura>) => void;
  isEditing?: boolean;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const AsignaturaForm: React.FC<AsignaturaFormProps> = ({
  initialData = {},
  onSubmit,
  isEditing = false,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<Partial<Asignatura>>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'creditos' || name === 'horasTeoricas' || name === 'horasPracticas' || 
              name === 'idPrograma' || name === 'idDocente' || name === 'idUnidadAcademica'
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Crear un nuevo objeto con los datos en snake_case
    const snakeCaseData: Record<string, any> = { ...formData };
    
    // Mapear campos de camelCase a snake_case
    const fieldMappings: Record<string, string> = {
      horasTeoricas: 'horas_teoricas',
      horasPracticas: 'horas_practicas',
      idPrograma: 'id_programa',
      idDocente: 'id_docente',
      idUnidadAcademica: 'id_unidad_academica'
    };
    
    // Convertir campos de camelCase a snake_case
    Object.entries(fieldMappings).forEach(([camelCase, snakeCase]) => {
      if (camelCase in snakeCaseData) {
        snakeCaseData[snakeCase] = snakeCaseData[camelCase];
        delete snakeCaseData[camelCase];
      }
    });
    
    // Asegurarse de que los campos numéricos sean números
    const numericFields = ['horas_teoricas', 'horas_practicas', 'id_programa', 'id_docente', 'id_unidad_academica', 'creditos'];
    numericFields.forEach(field => {
      if (field in snakeCaseData && snakeCaseData[field] !== undefined) {
        snakeCaseData[field] = Number(snakeCaseData[field]);
      }
    });
    
    onSubmit(snakeCaseData as Partial<Asignatura>);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Código</label>
          <input
            type="text"
            name="codigo"
            value={formData.codigo || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Créditos</label>
          <input
            type="number"
            name="creditos"
            value={formData.creditos || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Horas Teóricas</label>
          <input
            type="number"
            name="horasTeoricas"
            value={formData.horasTeoricas || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Horas Prácticas</label>
          <input
            type="number"
            name="horasPracticas"
            value={formData.horasPracticas || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo</label>
          <select
            name="tipo"
            value={formData.tipo || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Seleccione un tipo</option>
            <option value="Obligatoria">Obligatoria</option>
            <option value="Electiva">Electiva</option>
            <option value="Optativa">Optativa</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Estado</label>
          <select
            name="estado"
            value={formData.estado || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Seleccione un estado</option>
            <option value="Activa">Activa</option>
            <option value="Inactiva">Inactiva</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">ID Programa</label>
          <input
            type="number"
            name="idPrograma"
            value={formData.idPrograma || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">ID Docente</label>
          <input
            type="number"
            name="idDocente"
            value={formData.idDocente || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">ID Unidad Académica</label>
          <input
            type="number"
            name="idUnidadAcademica"
            value={formData.idUnidadAcademica || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            min="1"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="ml-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
            isSubmitting 
              ? 'bg-blue-400' 
              : 'bg-blue-600 hover:bg-blue-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {isSubmitting 
            ? 'Guardando...' 
            : isEditing ? 'Actualizar' : 'Crear'} Asignatura
        </button>
      </div>
    </form>
  );
};
