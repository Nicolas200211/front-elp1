import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiClock, FiCalendar, FiUsers, FiBook, FiUser, FiHome } from 'react-icons/fi';
import type { 
  Grupo, 
  Asignatura, 
  Docente, 
  Aula
} from '../../api/config';

type DiaSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';
type Turno = 'Mañana' | 'Tarde' | 'Noche';

type HorarioFormData = {
  dia: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  turno: Turno;
  id_grupo: number;
  id_asignatura: number;
  id_docente: number;
  id_aula: number;
};
import 'react-toastify/dist/ReactToastify.css';



interface ProgramacionHorarioFormProps {
  initialData?: Partial<HorarioFormData>;
  onSave: (data: HorarioFormData) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  isEditing?: boolean;
  grupos: Grupo[];
  asignaturas: Asignatura[];
  docentes: Docente[];
  aulas: Aula[];
  loading?: boolean;
}

const ProgramacionHorarioForm: React.FC<ProgramacionHorarioFormProps> = ({
  initialData = {},
  onSave,
  onCancel,
  isEditing = false,
  grupos = [],
  asignaturas = [],
  docentes = [],
  aulas = [],
  loading = false,
}) => {
  const [formData, setFormData] = useState<HorarioFormData>({
    dia: initialData.dia || 'Lunes',
    hora_inicio: initialData.hora_inicio?.substring(0, 5) || '08:00',
    hora_fin: initialData.hora_fin?.substring(0, 5) || '10:00',
    turno: initialData.turno || 'Mañana',
    id_grupo: initialData.id_grupo || 0,
    id_asignatura: initialData.id_asignatura || 0,
    id_docente: initialData.id_docente || 0,
    id_aula: initialData.id_aula || 0,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Días de la semana
  const diasSemana = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ];
  
  // Turnos
  const turnos = ['Mañana', 'Tarde', 'Noche'];
  
  // Actualizar el formulario cuando cambian los datos iniciales
  useEffect(() => {
    if (initialData) {
      setFormData({
        dia: initialData.dia || 'Lunes',
        hora_inicio: initialData.hora_inicio?.substring(0, 5) || '08:00',
        hora_fin: initialData.hora_fin?.substring(0, 5) || '10:00',
        turno: initialData.turno || 'Mañana',
        id_grupo: initialData.id_grupo || 0,
        id_asignatura: initialData.id_asignatura || 0,
        id_docente: initialData.id_docente || 0,
        id_aula: initialData.id_aula || 0,
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.id_grupo) newErrors.id_grupo = 'Seleccione un grupo';
    if (!formData.id_asignatura) newErrors.id_asignatura = 'Seleccione una asignatura';
    if (!formData.id_docente) newErrors.id_docente = 'Seleccione un docente';
    if (!formData.id_aula) newErrors.id_aula = 'Seleccione un aula';
    if (!formData.dia) newErrors.dia = 'Seleccione un día';
    if (!formData.turno) newErrors.turno = 'Seleccione un turno';
    
    // Validar horas
    if (!formData.hora_inicio) {
      newErrors.hora_inicio = 'Ingrese la hora de inicio';
    } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.hora_inicio)) {
      newErrors.hora_inicio = 'Formato de hora inválido (HH:MM)';
    }
    
    if (!formData.hora_fin) {
      newErrors.hora_fin = 'Ingrese la hora de fin';
    } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.hora_fin)) {
      newErrors.hora_fin = 'Formato de hora inválido (HH:MM)';
    }
    
    // Validar que la hora de fin sea mayor que la de inicio
    if (formData.hora_inicio && formData.hora_fin && 
        formData.hora_inicio >= formData.hora_fin) {
      newErrors.hora_fin = 'La hora de fin debe ser posterior a la de inicio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ['id_grupo', 'id_asignatura', 'id_docente', 'id_aula'];
    
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    } as HorarioFormData));
    
    // Limpiar el error cuando el campo se modifica
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Asegurar el formato HH:MM
    let formattedValue = value;
    if (value.length === 2 && !value.includes(':')) {
      formattedValue = value + ':00';
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue,
    } as HorarioFormData));
    
    // Limpiar el error cuando el campo se modifica
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }
    
    try {
      // Asegurar que las horas tengan segundos
      const dataToSave = {
        ...formData,
        hora_inicio: formData.hora_inicio.includes(':') && formData.hora_inicio.length === 5 
          ? `${formData.hora_inicio}:00` 
          : formData.hora_inicio,
        hora_fin: formData.hora_fin.includes(':') && formData.hora_fin.length === 5 
          ? `${formData.hora_fin}:00` 
          : formData.hora_fin,
      };
      
      const result = await onSave(dataToSave);
      
      if (result?.success) {
        toast.success(isEditing ? 'Horario actualizado correctamente' : 'Horario creado correctamente');
      } else if (result?.error) {
        // Mostrar mensaje de error específico para conflictos de horario
        if (result.error.includes('ya tiene una clase programada') || 
            result.error.includes('ya está ocupada') ||
            result.error.includes('ya tiene una clase programada')) {
          toast.warning(result.error, {
            autoClose: 10000, // Mostrar por 10 segundos
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
          });
        } else {
          toast.error(result.error);
        }
      }
    } catch (error: any) {
      console.error('Error al guardar el horario:', error);
      // Mostrar mensaje de error específico si está disponible
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Ocurrió un error al guardar el horario. Por favor, intente nuevamente.';
      
      if (errorMessage.includes('ya tiene una clase programada') || 
          errorMessage.includes('ya está ocupada') ||
          errorMessage.includes('ya tiene una clase programada')) {
        toast.warning(errorMessage, {
          autoClose: 10000, // Mostrar por 10 segundos
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing ? 'Editar Horario' : 'Nuevo Horario'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grupo <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUsers className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="id_grupo"
                  value={formData.id_grupo || ''}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.id_grupo ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="">Seleccione un grupo</option>
                  {grupos.map((grupo) => (
                    <option key={grupo.id} value={grupo.id}>
                      {grupo.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {errors.id_grupo && (
                <p className="mt-1 text-sm text-red-600">{errors.id_grupo}</p>
              )}
            </div>

            {/* Asignatura */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asignatura <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiBook className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="id_asignatura"
                  value={formData.id_asignatura || ''}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.id_asignatura ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="">Seleccione una asignatura</option>
                  {asignaturas.map((asignatura) => (
                    <option key={asignatura.id} value={asignatura.id}>
                      {asignatura.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {errors.id_asignatura && (
                <p className="mt-1 text-sm text-red-600">{errors.id_asignatura}</p>
              )}
            </div>

            {/* Docente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Docente <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="id_docente"
                  value={formData.id_docente || ''}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.id_docente ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="">Seleccione un docente</option>
                  {docentes.map((docente) => (
                    <option key={docente.id} value={docente.id}>
                      {docente.nombres} {docente.apellidos}
                    </option>
                  ))}
                </select>
              </div>
              {errors.id_docente && (
                <p className="mt-1 text-sm text-red-600">{errors.id_docente}</p>
              )}
            </div>

            {/* Aula */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aula <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiHome className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="id_aula"
                  value={formData.id_aula || ''}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.id_aula ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="">Seleccione un aula</option>
                  {aulas.map((aula) => (
                    <option key={aula.id} value={aula.id}>
                      {aula.nombre || aula.codigo} (Cap: {aula.capacidad})
                    </option>
                  ))}
                </select>
              </div>
              {errors.id_aula && (
                <p className="mt-1 text-sm text-red-600">{errors.id_aula}</p>
              )}
            </div>

            {/* Día de la semana */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Día <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="dia"
                  value={formData.dia || ''}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.dia ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="">Seleccione un día</option>
                  {diasSemana.map((dia) => (
                    <option key={dia} value={dia}>
                      {dia}
                    </option>
                  ))}
                </select>
              </div>
              {errors.dia && (
                <p className="mt-1 text-sm text-red-600">{errors.dia}</p>
              )}
            </div>

            {/* Turno */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Turno <span className="text-red-500">*</span>
              </label>
              <select
                name="turno"
                value={formData.turno || ''}
                onChange={handleChange}
                className={`block w-full pl-3 pr-10 py-2 border ${
                  errors.turno ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Seleccione un turno</option>
                {turnos.map((turno) => (
                  <option key={turno} value={turno}>
                    {turno}
                  </option>
                ))}
              </select>
              {errors.turno && (
                <p className="mt-1 text-sm text-red-600">{errors.turno}</p>
              )}
            </div>

            {/* Hora de inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de inicio <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiClock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  name="hora_inicio"
                  value={formData.hora_inicio || ''}
                  onChange={handleTimeChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.hora_inicio ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                  step="300" // Incrementos de 5 minutos
                />
              </div>
              {errors.hora_inicio && (
                <p className="mt-1 text-sm text-red-600">{errors.hora_inicio}</p>
              )}
            </div>

            {/* Hora de fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de fin <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiClock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  name="hora_fin"
                  value={formData.hora_fin || ''}
                  onChange={handleTimeChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.hora_fin ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                  step="300" // Incrementos de 5 minutos
                />
              </div>
              {errors.hora_fin && (
                <p className="mt-1 text-sm text-red-600">{errors.hora_fin}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : isEditing ? (
                'Actualizar horario'
              ) : (
                'Guardar horario'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProgramacionHorarioForm;
