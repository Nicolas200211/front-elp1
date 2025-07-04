import React, { useEffect } from 'react';
import type { Docente } from '../../api/config';
import { FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiClock, FiSave, FiX } from 'react-icons/fi';

interface DocenteFormProps {
  initialData?: Partial<Docente>;
  onSubmit: (data: Partial<Docente>) => void;
  isEditing?: boolean;
  onCancel: () => void;
  isSubmitting: boolean;
}

const TIPOS_CONTRATO = [
  'Tiempo completo',
  'Tiempo parcial',
  'Por horas',
  'Sustituto',
  'Otro'
];

const ESTADOS = ['Activo', 'Inactivo', 'Licencia', 'Jubilado'];
const GENEROS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'O', label: 'Otro' }
];

export const DocenteForm: React.FC<DocenteFormProps> = ({
  initialData = {
    dni: '',
    nombres: '',
    apellidos: '',
    email: '',
    especialidad: '',
    telefono: '',
    direccion: '',
    genero: 'O',
    estado: 'Activo',
    tipoContrato: 'Tiempo completo',
    horasDisponibles: 0
  },
  onSubmit,
  isEditing = false,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = React.useState<Partial<Docente>>(initialData);

  useEffect(() => {
    setFormData({
      ...initialData,
      // Asegurar que los campos requeridos tengan valores por defecto
      nombre: initialData.nombre || `${initialData.nombres || ''} ${initialData.apellidos || ''}`.trim(),
      dni: initialData.dni || '',
      nombres: initialData.nombres || '',
      apellidos: initialData.apellidos || '',
      email: initialData.email || '',
      especialidad: initialData.especialidad || '',
      telefono: initialData.telefono || '',
      direccion: initialData.direccion || '',
      genero: initialData.genero || 'O',
      estado: initialData.estado || 'Activo',
      tipoContrato: initialData.tipoContrato || 'Tiempo completo',
      horasDisponibles: initialData.horasDisponibles || 0
    });
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Actualizar el nombre completo si se cambian nombres o apellidos
    if (name === 'nombres' || name === 'apellidos') {
      const nombres = name === 'nombres' ? value : formData.nombres || '';
      const apellidos = name === 'apellidos' ? value : formData.apellidos || '';
      setFormData(prev => ({
        ...prev,
        [name]: value,
        nombre: `${nombres} ${apellidos}`.trim()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'horasDisponibles' ? parseInt(value) || 0 : value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Crear un nuevo objeto con solo los campos que el backend espera
    const dataToSubmit: Partial<Docente> = {
      dni: formData.dni || '',
      nombres: formData.nombres || '',
      apellidos: formData.apellidos || '',
      email: formData.email || '',
      especialidad: formData.especialidad || '',
      telefono: formData.telefono || undefined,
      direccion: formData.direccion || undefined,
      estado: formData.estado === 'Activo' ? 'Activo' : 'Inactivo', // Asegurar que sea 'Activo' o 'Inactivo'
      tipoContrato: formData.tipoContrato || 'Tiempo completo',
      horasDisponibles: formData.horasDisponibles ? parseInt(formData.horasDisponibles as any) : 0,
      // Solo incluir campos adicionales si tienen valor
      ...(formData.fechaNacimiento && { fechaNacimiento: formData.fechaNacimiento }),
      ...(formData.tituloAcademico && { tituloAcademico: formData.tituloAcademico }),
      ...(formData.fechaIngreso && { fechaIngreso: formData.fechaIngreso }),
      ...(formData.fechaSalida && { fechaSalida: formData.fechaSalida }),
      ...(formData.idUnidadAcademica && { idUnidadAcademica: formData.idUnidadAcademica })
    };
    
    // Eliminar campos que no deberían enviarse
    const { genero, ...cleanedData } = dataToSubmit;
    
    console.log('Datos a enviar:', cleanedData);
    onSubmit(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* DNI */}
            <div className="sm:col-span-3">
              <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-1">
                DNI <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="dni"
                  id="dni"
                  value={formData.dni || ''}
                  onChange={handleChange}
                  maxLength={15}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ingrese DNI"
                  required
                />
              </div>
            </div>

            {/* Nombres */}
            <div className="sm:col-span-3">
              <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 mb-1">
                Nombres <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="nombres"
                  id="nombres"
                  value={formData.nombres || ''}
                  onChange={handleChange}
                  maxLength={100}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ingrese nombres"
                  required
                />
              </div>
            </div>

            {/* Apellidos */}
            <div className="sm:col-span-3">
              <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-1">
                Apellidos <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="apellidos"
                  id="apellidos"
                  value={formData.apellidos || ''}
                  onChange={handleChange}
                  maxLength={100}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ingrese apellidos"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>

            {/* Especialidad */}
            <div className="sm:col-span-3">
              <label htmlFor="especialidad" className="block text-sm font-medium text-gray-700 mb-1">
                Especialidad <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiBriefcase className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="especialidad"
                  id="especialidad"
                  value={formData.especialidad || ''}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ingrese especialidad"
                  required
                />
              </div>
            </div>

            {/* Horas Disponibles */}
            <div className="sm:col-span-3">
              <label htmlFor="horasDisponibles" className="block text-sm font-medium text-gray-700 mb-1">
                Horas Disponibles
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiClock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="horasDisponibles"
                  id="horasDisponibles"
                  min="0"
                  value={formData.horasDisponibles || 0}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Máximo 40 horas</p>
            </div>

            {/* Género */}
            <div className="sm:col-span-3">
              <label htmlFor="genero" className="block text-sm font-medium text-gray-700 mb-1">
                Género
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="genero"
                  name="genero"
                  value={formData.genero || 'O'}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {GENEROS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Estado */}
            <div className="sm:col-span-3">
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                Estado <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado || 'Activo'}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  {ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tipo de Contrato */}
            <div className="sm:col-span-3">
              <label htmlFor="tipoContrato" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Contrato <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiBriefcase className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="tipoContrato"
                  name="tipoContrato"
                  value={formData.tipoContrato || ''}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  {TIPOS_CONTRATO.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Teléfono */}
            <div className="sm:col-span-3">
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="telefono"
                  id="telefono"
                  value={formData.telefono || ''}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="(123) 456-7890"
                />
              </div>
            </div>

            {/* Dirección */}
            <div className="sm:col-span-6">
              <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="direccion"
                  id="direccion"
                  value={formData.direccion || ''}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ingrese dirección"
                />
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
                {isEditing ? 'Actualizar Docente' : 'Crear Docente'}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
