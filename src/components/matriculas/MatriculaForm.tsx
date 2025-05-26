import React, { useEffect, useState } from 'react';
import { matriculaService } from '../../api/matriculaService';
import type { Matricula, Estudiante, Grupo } from '../../api/config';

interface MatriculaFormProps {
  initialData?: Partial<Matricula>;
  onSubmit: (data: Partial<Matricula>) => void;
  isEditing?: boolean;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ESTADOS = ['Activo', 'Retirado', 'Aprobado', 'Reprobado', 'Incompleto'] as const;

export const MatriculaForm: React.FC<MatriculaFormProps> = ({
  initialData = {},
  onSubmit,
  isEditing = false,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<Partial<Matricula>>({
    idEstudiante: 0,
    idGrupo: 0,
    estado: 'Activo',
    ...initialData
  });
  
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [isLoading, setIsLoading] = useState({
    estudiantes: true,
    grupos: true,
    validando: false,
    error: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [estudiantesData, gruposData] = await Promise.all([
          matriculaService.getEstudiantes(),
          matriculaService.getGrupos()
        ]);
        
        setEstudiantes(estudiantesData);
        setGrupos(gruposData);
        
        // Establecer valores iniciales si no están definidos
        setFormData(prev => ({
          ...prev,
          idEstudiante: prev.idEstudiante || estudiantesData[0]?.id || 0,
          idGrupo: prev.idGrupo || gruposData[0]?.id || 0,
          estado: prev.estado || 'Activo',
        }));
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        setIsLoading(prev => ({ ...prev, error: 'Error al cargar los datos iniciales' }));
      } finally {
        setIsLoading(prev => ({ ...prev, estudiantes: false, grupos: false }));
      }
    };

    loadInitialData();
  }, []);

  // Validar matrícula cuando cambian los datos del formulario
  useEffect(() => {
    const validarMatricula = async () => {
      if (formData.idEstudiante && formData.idGrupo) {
        try {
          setIsLoading(prev => ({ ...prev, validando: true, error: '' }));
          const resultado = await matriculaService.validarMatricula(
            formData.idEstudiante,
            formData.idGrupo
          );
          
          if (!resultado.valido) {
            setIsLoading(prev => ({ ...prev, error: resultado.mensaje }));
          } else {
            setIsLoading(prev => ({ ...prev, error: '' }));
          }
        } catch (error: any) {
          console.error('Error al validar matrícula:', error);
          setIsLoading(prev => ({ ...prev, error: error.message || 'Error al validar la matrícula' }));
        } finally {
          setIsLoading(prev => ({ ...prev, validando: false }));
        }
      }
    };

    // Solo validar si estamos creando una nueva matrícula
    if (!isEditing && formData.idEstudiante && formData.idGrupo) {
      validarMatricula();
    }
  }, [formData.idEstudiante, formData.idGrupo, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'calificacionFinal' || name === 'asistenciaPorcentaje' 
        ? value === '' ? undefined : Number(value)
        : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.idEstudiante || !formData.idGrupo) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }
    
    // Si hay un error de validación, no permitir enviar el formulario
    if (isLoading.error && !isEditing) {
      alert('No se puede guardar la matrícula con los datos actuales');
      return;
    }
    
    onSubmit(formData);
  };

  // Obtener información del estudiante seleccionado
  const estudianteSeleccionado = estudiantes.find(e => e.id === formData.idEstudiante);
  
  // Obtener información del grupo seleccionado
  const grupoSeleccionado = grupos.find(g => g.id === formData.idGrupo);

  if (isLoading.estudiantes || isLoading.grupos) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        {/* Estudiante */}
        <div className="sm:col-span-6">
          <label htmlFor="idEstudiante" className="block text-sm font-medium text-gray-700">
            Estudiante <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="idEstudiante"
              name="idEstudiante"
              value={formData.idEstudiante || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
              disabled={isSubmitting || isLoading.validando || isEditing}
            >
              <option value="">Seleccione un estudiante</option>
              {estudiantes.map((estudiante) => (
                <option key={estudiante.id} value={estudiante.id}>
                  {estudiante.codigo} - {estudiante.nombres} {estudiante.apellidos}
                </option>
              ))}
            </select>
          </div>
          {estudianteSeleccionado && (
            <div className="mt-1 text-sm text-gray-500">
              Programa: {estudianteSeleccionado.programa?.nombre || 'No especificado'}
            </div>
          )}
        </div>

        {/* Grupo */}
        <div className="sm:col-span-6">
          <label htmlFor="idGrupo" className="block text-sm font-medium text-gray-700">
            Grupo <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="idGrupo"
              name="idGrupo"
              value={formData.idGrupo || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
              disabled={isSubmitting || isLoading.validando}
            >
              <option value="">Seleccione un grupo</option>
              {grupos.map((grupo) => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.nombre} - {grupo.programa?.nombre} ({grupo.ciclo?.nombre})
                </option>
              ))}
            </select>
          </div>
          {grupoSeleccionado && (
            <div className="mt-1 text-sm text-gray-500">
              Capacidad: {grupoSeleccionado.capacidad} estudiantes | 
              Programa: {grupoSeleccionado.programa?.nombre} | 
              Ciclo: {grupoSeleccionado.ciclo?.nombre}
            </div>
          )}
        </div>

        {/* Estado */}
        <div className="sm:col-span-3">
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
            Estado <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="estado"
              name="estado"
              value={formData.estado || 'Activo'}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
              disabled={isSubmitting}
            >
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calificación Final */}
        <div className="sm:col-span-3">
          <label htmlFor="calificacionFinal" className="block text-sm font-medium text-gray-700">
            Calificación Final
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="calificacionFinal"
              id="calificacionFinal"
              min="0"
              max="20"
              step="0.1"
              value={formData.calificacionFinal ?? ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              disabled={isSubmitting}
              placeholder="Opcional"
            />
          </div>
        </div>

        {/* Porcentaje de Asistencia */}
        <div className="sm:col-span-3">
          <label htmlFor="asistenciaPorcentaje" className="block text-sm font-medium text-gray-700">
            Asistencia (%)
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="asistenciaPorcentaje"
              id="asistenciaPorcentaje"
              min="0"
              max="100"
              value={formData.asistenciaPorcentaje ?? ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              disabled={isSubmitting}
              placeholder="Opcional"
            />
          </div>
        </div>

        {/* Mensaje de validación */}
        {isLoading.error && (
          <div className="sm:col-span-6">
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {isLoading.error}
            </div>
          </div>
        )}

        {/* Cargando validación */}
        {isLoading.validando && (
          <div className="sm:col-span-6 flex items-center text-sm text-blue-600">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Validando matrícula...
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting || isLoading.validando}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={!!(isSubmitting || isLoading.validando || (isLoading.error && !isEditing))}
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
            'Actualizar Matrícula'
          ) : (
            'Registrar Matrícula'
          )}
        </button>
      </div>
    </form>
  );
};
