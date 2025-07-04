import React, { useState, useEffect, useCallback } from 'react';
import type { Asignatura, Docente, ProgramacionGeneral, UnidadAcademica } from '../../api/config';
import { docenteService } from '../../api/docenteService';
import { programacionGeneralService } from '../../api/programacionGeneralService';
import { unidadAcademicaService } from '../../api/unidadAcademicaService';
// Validación de formularios

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
  const [programaciones, setProgramaciones] = useState<ProgramacionGeneral[]>([]);
  const [unidadesAcademicas, setUnidadesAcademicas] = useState<UnidadAcademica[]>([]);
  const [isLoading, setIsLoading] = useState({
    docentes: true,
    programaciones: true,
    unidades: true
  });

  // Cargar datos para los dropdowns
  const loadData = useCallback(async () => {
    console.log('formData actual en loadData:', formData);
    console.log('idProgramacionGeneral actual:', formData.idProgramacionGeneral);
    try {
      console.log('Cargando datos para los dropdowns...');
      setIsLoading({ docentes: true, programaciones: true, unidades: true });
      
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
      
      // Cargar programaciones generales
      try {
        const programacionesData = await programacionGeneralService.getAll();
        console.log('Programaciones generales cargadas:', programacionesData?.length || 0);
        setProgramaciones(programacionesData || []);
      } catch (error) {
        console.error('Error cargando programaciones generales:', error);
        setProgramaciones([]);
      } finally {
        setIsLoading(prev => ({ ...prev, programaciones: false }));
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
    console.log('initialData recibido en AsignaturaForm:', initialData);
    
    // Crear un nuevo objeto con los valores convertidos
    console.log('Datos iniciales recibidos:', initialData);
    
    // Extraer idProgramacion o idPrograma del objeto initialData
    const programacionId = initialData.idProgramacion || initialData.programacionGeneral?.id;
    
    // Crear el objeto de datos del formulario
    const newFormData: Partial<Asignatura> = {
      ...initialData,
      // Usar idProgramacion si existe, de lo contrario usar idProgramacionGeneral
      idProgramacionGeneral: programacionId !== undefined ? 
        Number(programacionId) : 
        (initialData.idProgramacionGeneral !== undefined ? Number(initialData.idProgramacionGeneral) : undefined),
      
      // Convertir campos numéricos
      idDocente: initialData.idDocente !== undefined ? Number(initialData.idDocente) : undefined,
      idUnidadAcademica: initialData.idUnidadAcademica !== undefined ? Number(initialData.idUnidadAcademica) : undefined,
      creditos: initialData.creditos !== undefined ? Number(initialData.creditos) : 0,
      horasTeoricas: initialData.horasTeoricas !== undefined ? Number(initialData.horasTeoricas) : 0,
      horasPracticas: initialData.horasPracticas !== undefined ? Number(initialData.horasPracticas) : 0,
    };
    
    console.log('Datos mapeados para el formulario:', newFormData);
    setFormData(newFormData);
    
    // Cargar datos adicionales si es necesario
    if (!initialData.id || Object.keys(initialData).length > 1) {
      loadData();
    }
  }, [initialData, loadData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log(`Campo cambiado: ${name} = ${value}`);
    
    setFormData(prev => {
      // Lista de campos que deben ser números
      const numericFields = [
        'creditos', 'horasTeoricas', 'horasPracticas',
        'idProgramacionGeneral', 'idDocente', 'idUnidadAcademica'
      ];
      
      // Determinar el nuevo valor basado en el tipo de campo
      let newValue: any = value;
      
      if (numericFields.includes(name)) {
        // Para campos numéricos, convertir a número o undefined si está vacío
        newValue = value === '' ? undefined : Number(value);
      } else {
        // Para campos de texto, mantener el valor como está
        newValue = value;
      }
      
      console.log(`Nuevo valor para ${name}:`, newValue);
      
      return {
        ...prev,
        [name]: newValue
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Enviando formulario con datos:', formData);
    
    // Validar créditos
    if (formData.creditos && formData.creditos > 10) {
      window.alert('El número de créditos no puede ser mayor a 10');
      return;
    }
    
    // Crear un objeto con los datos en snake_case desde el principio
    const snakeCaseData: Record<string, any> = {};
    
    // Si estamos editando, incluir el ID
    if (isEditing && initialData.id) {
      snakeCaseData.id = initialData.id;
    }
    
    // Mapeo de campos a snake_case
    const fieldMappings: Record<string, string> = {
      codigo: 'codigo',
      nombre: 'nombre',
      creditos: 'creditos',
      tipo: 'tipo',
      estado: 'estado',
      horasTeoricas: 'horas_teoricas',
      horasPracticas: 'horas_practicas',
      idProgramacionGeneral: 'id_programa',
      idDocente: 'id_docente',
      idUnidadAcademica: 'id_unidad_academica'
    };
    
    // Mapear y limpiar los campos
    Object.entries(fieldMappings).forEach(([camelCase, snakeCase]) => {
      const value = formData[camelCase as keyof typeof formData];
      if (value !== undefined && value !== '' && value !== null) {
        snakeCaseData[snakeCase] = value;
      }
    });
    
    // Asegurarse de que los campos numéricos sean números
    const numericFields = [
      'horas_teoricas', 'horas_practicas', 'id_programa', 
      'id_docente', 'id_unidad_academica', 'creditos'
    ];
    
    numericFields.forEach(field => {
      if (snakeCaseData[field] !== undefined && snakeCaseData[field] !== null && snakeCaseData[field] !== '') {
        snakeCaseData[field] = Number(snakeCaseData[field]);
      } else {
        delete snakeCaseData[field];
      }
    });
    
    // Asegurarse de que id_programa sea un número entero válido
    if (snakeCaseData.id_programa !== undefined) {
      snakeCaseData.id_programa = Math.max(1, Math.floor(Number(snakeCaseData.id_programa)));
    }
    
    console.log('Datos a enviar al servidor (snake_case):', snakeCaseData);
    
    // Crear un nuevo objeto solo con los campos permitidos
    const camposPermitidos = [
      'id', 'codigo', 'nombre', 'creditos', 'horas_teoricas',
      'horas_practicas', 'tipo', 'estado', 'id_programa',
      'id_docente', 'id_unidad_academica'
    ];
    
    const datosFinales: Record<string, any> = {};
    camposPermitidos.forEach(campo => {
      if (snakeCaseData[campo] !== undefined) {
        datosFinales[campo] = snakeCaseData[campo];
      }
    });
    
    console.log('Datos finales a enviar:', datosFinales);
    onSubmit(datosFinales as Partial<Asignatura>);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Sección de información básica */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Información Básica</h3>
          <p className="mt-1 text-sm text-gray-500">Complete los datos principales de la asignatura</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Código <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo || ''}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                placeholder="Ej: MAT101"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Nombre <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre || ''}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                placeholder="Nombre de la asignatura"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Créditos <span className="text-red-500">*</span></label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="number"
                  name="creditos"
                  value={formData.creditos || ''}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  min="0"
                  step="0.5"
                  placeholder="0.0"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">créditos</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Tipo <span className="text-red-500">*</span></label>
              <select
                name="tipo"
                value={formData.tipo || ''}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="">Seleccione un tipo</option>
                <option value="Obligatoria">Obligatoria</option>
                <option value="Electiva">Electiva</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Horas Teóricas <span className="text-red-500">*</span></label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="number"
                  name="horasTeoricas"
                  value={formData.horasTeoricas || ''}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  min="0"
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">horas</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Horas Prácticas <span className="text-red-500">*</span></label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="number"
                  name="horasPracticas"
                  value={formData.horasPracticas || ''}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  min="0"
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">horas</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Estado <span className="text-red-500">*</span></label>
              <select
                name="estado"
                value={formData.estado || ''}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="">Seleccione un estado</option>
                <option value="Activa">Activa</option>
                <option value="Inactiva">Inactiva</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sección de relaciones */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Relaciones</h3>
          <p className="mt-1 text-sm text-gray-500">Asocie la asignatura con otros elementos del sistema</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Programación General <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  name="idProgramacionGeneral"
                  value={formData.idProgramacionGeneral ?? ''}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  disabled={isLoading.programaciones}
                >
                  <option value="">Seleccione una programación</option>
                  {programaciones.map(programacion => (
                    <option key={programacion.id} value={programacion.id}>
                      {programacion.nombre || `Programación ${programacion.id}`}
                    </option>
                  ))}
                </select>
                {isLoading.programaciones && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
              {isLoading.programaciones && (
                <p className="mt-1 text-xs text-gray-500">Cargando programaciones...</p>
              )}
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Docente <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  name="idDocente"
                  value={formData.idDocente || ''}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
              {isLoading.docentes && (
                <p className="mt-1 text-xs text-gray-500">Cargando docentes...</p>
              )}
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Unidad Académica <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  name="idUnidadAcademica"
                  value={formData.idUnidadAcademica || ''}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
              {isLoading.unidades && (
                <p className="mt-1 text-xs text-gray-500">Cargando unidades académicas...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Acciones del formulario */}
      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
            isSubmitting 
              ? 'bg-blue-400' 
              : 'bg-blue-600 hover:bg-blue-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </>
          ) : isEditing ? 'Actualizar Asignatura' : 'Crear Asignatura'}
        </button>
      </div>
    </form>
  );
};
