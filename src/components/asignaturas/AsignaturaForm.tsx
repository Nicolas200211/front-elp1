import React, { useState, useEffect, useCallback } from 'react';
import type { Asignatura, Docente, Programa, UnidadAcademica } from '../../api/config';
import { docenteService } from '../../api/docenteService';
import { programaService } from '../../api/programaService';
import { unidadAcademicaService } from '../../api/unidadAcademicaService';

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
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [unidadesAcademicas, setUnidadesAcademicas] = useState<UnidadAcademica[]>([]);
  const [isLoading, setIsLoading] = useState({
    docentes: true,
    programas: true,
    unidades: true
  });

  // Cargar datos para los dropdowns
  const loadData = useCallback(async () => {
    try {
      console.log('Cargando datos para los dropdowns...');
      setIsLoading({ docentes: true, programas: true, unidades: true });
      
      // Cargar docentes
      try {
        const docentesData = await docenteService.getAll();
        console.log('Docentes cargados:', docentesData?.length || 0);
        setDocentes(docentesData || []);
      } catch (error) {
        console.error('Error cargando docentes:', error);
        setDocentes([]);
      } finally {
        setIsLoading(prev => ({ ...prev, docentes: false }));
      }
      
      // Cargar programas
      try {
        const programasData = await programaService.getAll();
        console.log('Programas cargados:', programasData?.length || 0);
        setProgramas(programasData || []);
      } catch (error) {
        console.error('Error cargando programas:', error);
        setProgramas([]);
      } finally {
        setIsLoading(prev => ({ ...prev, programas: false }));
      }
      
      // Cargar unidades académicas
      try {
        const unidadesData = await unidadAcademicaService.getAll();
        console.log('Unidades académicas cargadas:', unidadesData?.length || 0);
        setUnidadesAcademicas(unidadesData || []);
      } catch (error) {
        console.error('Error cargando unidades académicas:', error);
        setUnidadesAcademicas([]);
      } finally {
        setIsLoading(prev => ({ ...prev, unidades: false }));
      }
      
    } catch (error) {
      console.error('Error inesperado al cargar datos:', error);
    }
  }, []);

  useEffect(() => {
    setFormData(initialData);
    loadData();
  }, [initialData, loadData]);

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
      <div className="space-y-6">
        {/* Sección de información básica */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-6 pb-2 border-b border-gray-200">Información Básica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                placeholder="Ej: MAT101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                placeholder="Nombre de la asignatura"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Créditos</label>
              <input
                type="number"
                name="creditos"
                value={formData.creditos || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min="0"
                step="0.5"
                placeholder="Ej: 4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horas Teóricas</label>
              <input
                type="number"
                name="horasTeoricas"
                value={formData.horasTeoricas || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min="0"
                placeholder="Horas semanales"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horas Prácticas</label>
              <input
                type="number"
                name="horasPracticas"
                value={formData.horasPracticas || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min="0"
                placeholder="Horas semanales"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
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
                <option value="Libre Elección">Libre Elección</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
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
          </div>
        </div>
        
        {/* Sección de relaciones */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-6 pb-2 border-b border-gray-200">Relaciones</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Programa Académico</label>
              <select
                name="idPrograma"
                value={formData.idPrograma || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={isLoading.programas}
              >
                <option value="">Seleccione un programa</option>
                {programas.map(programa => (
                  <option key={programa.id} value={programa.id}>
                    {programa.nombre}
                  </option>
                ))}
              </select>
              {isLoading.programas && (
                <p className="mt-1 text-sm text-gray-500">Cargando programas...</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Docente</label>
              <select
                name="idDocente"
                value={formData.idDocente || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={isLoading.docentes}
              >
                <option value="">Seleccione un docente</option>
                {docentes.map(docente => (
                  <option key={docente.id} value={docente.id}>
                    {docente.nombres} {docente.apellidos}
                  </option>
                ))}
              </select>
              {isLoading.docentes && (
                <p className="mt-1 text-sm text-gray-500">Cargando docentes...</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Unidad Académica</label>
              <select
                name="idUnidadAcademica"
                value={formData.idUnidadAcademica || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={isLoading.unidades}
              >
                <option value="">Seleccione una unidad</option>
                {unidadesAcademicas.map(unidad => (
                  <option key={unidad.id} value={unidad.id}>
                    {unidad.nombre}
                  </option>
                ))}
              </select>
              {isLoading.unidades && (
                <p className="mt-1 text-sm text-gray-500">Cargando unidades académicas...</p>
              )}
            </div>
          </div>
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
