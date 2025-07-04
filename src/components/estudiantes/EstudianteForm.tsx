import React, { useState, useEffect } from 'react';
import { estudianteService } from '../../api/estudianteService';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiBook } from 'react-icons/fi';

// Definir tipos locales ya que no están en las importaciones
export interface Programa {
  id: number;
  nombre: string;
}

export interface Estudiante {
  id?: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  direccion: string;
  genero: string;
  estado: string;
  idPrograma: number;
  programa?: Programa;
  fechaNacimiento: string | Date;
  dni: string; // Agregar la propiedad dni
}

export interface EstudianteFormData {
  id?: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  dni: string;
  direccion: string;
  fechaNacimiento: string | Date;
  genero: 'M' | 'F' | 'O';
  idPrograma: number;
  programa?: number; // ID del programa
  estado?: string;
}

interface EstudianteFormProps {
  initialData?: Partial<Estudiante>;
  onSubmit: (data: EstudianteFormData) => void;
  isEditing?: boolean;
  onCancel: () => void;
  isSubmitting: boolean;
}

const GENEROS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'O', label: 'Otro' },
] as const;

const ESTADOS = ['Activo', 'Inactivo', 'Egresado', 'Suspendido'] as const;

export const EstudianteForm: React.FC<EstudianteFormProps> = ({
  initialData = {},
  onSubmit,
  isEditing = false,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<EstudianteFormData>(() => {
    // Create initial form data with default values
    const defaultData: EstudianteFormData = {
      codigo: '',
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      dni: '',
      direccion: '',
      fechaNacimiento: '',
      genero: 'M',
      idPrograma: 0,
      programa: undefined,
    };

    // If we have initial data, merge it with defaults
    if (initialData) {
      return {
        ...defaultData,
        ...initialData,
        // Ensure we only use the ID for the programa field
        programa: initialData.programa?.id || initialData.idPrograma,
        // Ensure genero is one of the allowed values
        genero: (initialData.genero === 'M' || initialData.genero === 'F' || initialData.genero === 'O') 
          ? initialData.genero 
          : 'M',
      };
    }
    
    return defaultData;
  });
  
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [isLoading, setIsLoading] = useState({
    programas: false,
    estudiante: false,
    codigoVerificando: false,
    dniVerificando: false,
  });
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(prev => ({ ...prev, programas: true }));
        const programasData = await estudianteService.getProgramas();
        setProgramas(programasData);
        
        // Establecer el primer programa como valor por defecto si no hay un valor inicial
        if (initialData) {
          setFormData(prev => ({
            ...prev,
            ...initialData,
            idPrograma: initialData.idPrograma || (programasData[0]?.id || 0)
          } as EstudianteFormData));
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
      } finally {
        setIsLoading(prev => ({ ...prev, programas: false }));
      }
    };

    loadInitialData();
  }, [initialData]);

  // Validar formulario
  const validarFormulario = async (): Promise<boolean> => {
    const nuevosErrores: Record<string, string> = {};
    
    // Validar campos requeridos
    if (!formData.codigo?.trim()) {
      nuevosErrores.codigo = 'El código es requerido';
    } else if (!/^\d{8}$/.test(formData.codigo)) {
      nuevosErrores.codigo = 'El código debe tener 8 dígitos';
    }
    
    if (!formData.nombres?.trim()) nuevosErrores.nombres = 'Los nombres son requeridos';
    if (!formData.apellidos?.trim()) nuevosErrores.apellidos = 'Los apellidos son requeridos';
    
    if (!formData.email?.trim()) {
      nuevosErrores.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = 'El correo electrónico no es válido';
    }
    
    if (!formData.dni?.trim()) {
      nuevosErrores.dni = 'El DNI es requerido';
    } else if (!/^\d{8}$/.test(formData.dni)) {
      nuevosErrores.dni = 'El DNI debe tener 8 dígitos';
    }
    
    if (!formData.telefono?.trim()) {
      nuevosErrores.telefono = 'El teléfono es requerido';
    } else if (!/^\d{9}$/.test(formData.telefono)) {
      nuevosErrores.telefono = 'El teléfono debe tener 9 dígitos';
    }
    
    if (!formData.fechaNacimiento) {
      nuevosErrores.fechaNacimiento = 'La fecha de nacimiento es requerida';
    } else {
      const fechaNac = new Date(formData.fechaNacimiento);
      const hoy = new Date();
      let edad = hoy.getFullYear() - fechaNac.getFullYear();
      const mes = hoy.getMonth() - fechaNac.getMonth();
      
      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
      }
      
      if (edad < 16) {
        nuevosErrores.fechaNacimiento = 'El estudiante debe tener al menos 16 años';
      }
    }
    
    if (!formData.direccion?.trim()) nuevosErrores.direccion = 'La dirección es requerida';
    if (!formData.idPrograma) nuevosErrores.idPrograma = 'El programa es requerido';
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Verificar si un código ya existe
  const verificarCodigo = async (codigo: string) => {
    if (!codigo || !/^\d{8}$/.test(codigo)) return;
    
    try {
      setIsLoading(prev => ({ ...prev, codigoVerificando: true }));
      const existe = await estudianteService.verificarCodigoExistente(
        codigo, 
        formData.id
      );
      
      if (existe) {
        setErrores(prev => ({
          ...prev,
          codigo: 'Este código ya está en uso por otro estudiante'
        }));
      } else {
        const { codigo: _, ...restErrores } = errores;
        setErrores(restErrores);
      }
    } catch (error) {
      console.error('Error al verificar código:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, codigoVerificando: false }));
    }
  };
  
  // Alias para mantener compatibilidad
  const handleVerificarCodigo = verificarCodigo;

  // Verificar si un DNI ya existe
  const verificarDni = async (dni: string) => {
    if (!dni || !/^\d{8}$/.test(dni)) return;
    
    try {
      setIsLoading(prev => ({ ...prev, dniVerificando: true }));
      const existe = await estudianteService.verificarDniExistente(
        dni,
        formData.id
      );
      
      if (existe) {
        setErrores(prev => ({
          ...prev,
          dni: 'Este DNI ya está registrado por otro estudiante'
        }));
      } else {
        const { dni: _, ...restErrores } = errores;
        setErrores(restErrores);
      }
    } catch (error) {
      console.error('Error al verificar DNI:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, dniVerificando: false }));
    }
  };
  
  // Alias para mantener compatibilidad
  const handleVerificarDni = verificarDni;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    } as EstudianteFormData));

    // Limpiar errores del campo al modificar
    if (errores[name]) {
      setErrores(prev => {
        const newErrores = { ...prev };
        delete newErrores[name];
        return newErrores;
      });
    }

    // Verificar código cuando se escribe
    if (name === 'codigo' && value) {
      handleVerificarCodigo(value);
    }

    // Verificar DNI cuando se escribe
    if (name === 'dni' && value) {
      handleVerificarDni(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario
    const esValido = await validarFormulario();
    if (!esValido) return;
    
    // Verificar códigos duplicados
    if (Object.values(errores).some(mensaje => 
      mensaje.includes('ya está') || 
      mensaje.includes('ya está registrado')
    )) {
      return;
    }
    
    // Si todo está bien, enviar el formulario
    onSubmit(formData);
  };

  if (isLoading.programas) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        {/* Código */}
        <div className="sm:col-span-2">
          <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
            Código <span className="text-red-500">*</span>
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUser className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="codigo"
              id="codigo"
              maxLength={8}
              value={formData.codigo || ''}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2 border ${
                errores.codigo 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-md shadow-sm sm:text-sm`}
              placeholder="Ej: 20250001"
              disabled={isSubmitting || isLoading.codigoVerificando || isEditing}
              onBlur={(e) => verificarCodigo(e.target.value)}
            />
            {isLoading.codigoVerificando && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
          {errores.codigo && (
            <p className="mt-1 text-sm text-red-600">{errores.codigo}</p>
          )}
        </div>

        {/* DNI */}
        <div className="sm:col-span-2">
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
              maxLength={8}
              value={formData.dni || ''}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2 border ${
                errores.dni 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-md shadow-sm sm:text-sm`}
              placeholder="Ej: 87654321"
              disabled={isSubmitting || isLoading.dniVerificando}
              onBlur={(e) => verificarDni(e.target.value)}
            />
            {isLoading.dniVerificando && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
          {errores.dni && (
            <p className="mt-1 text-sm text-red-600">{errores.dni}</p>
          )}
        </div>

        {/* Fecha de Nacimiento */}
        <div className="sm:col-span-3">
          <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Nacimiento <span className="text-red-500">*</span>
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiCalendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              name="fechaNacimiento"
              id="fechaNacimiento"
              value={formData.fechaNacimiento?.toString().split('T')[0] || ''}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2 border ${errores.fechaNacimiento ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm sm:text-sm`}
              max={new Date().toISOString().split('T')[0]}
              disabled={isSubmitting}
            />
          </div>
          {formData.fechaNacimiento && (
            <p className="mt-1 text-xs text-gray-500">
              Edad: {new Date().getFullYear() - new Date(formData.fechaNacimiento).getFullYear()} años
            </p>
          )}
          {errores.fechaNacimiento && (
            <p className="mt-1 text-sm text-red-600">{errores.fechaNacimiento}</p>
          )}
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
              className={`block w-full pl-10 pr-3 py-2 border ${errores.nombres ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm sm:text-sm`}
              disabled={isSubmitting}
            />
          </div>
          {errores.nombres && (
            <p className="mt-1 text-sm text-red-600">{errores.nombres}</p>
          )}
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
              className={`block w-full pl-10 pr-3 py-2 border ${
                errores.apellidos ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-md shadow-sm sm:text-sm`}
              disabled={isSubmitting}
            />
          </div>
          {errores.apellidos && (
            <p className="mt-1 text-sm text-red-600">{errores.apellidos}</p>
          )}
        </div>

        {/* Género */}
        <div className="sm:col-span-3">
          <label htmlFor="genero" className="block text-sm font-medium text-gray-700 mb-1">
            Género <span className="text-red-500">*</span>
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUser className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="genero"
              name="genero"
              value={formData.genero || 'M'}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={isSubmitting}
            >
              {GENEROS.map((genero) => (
                <option key={genero.value} value={genero.value}>
                  {genero.label}
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
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <select
              id="estado"
              name="estado"
              value={formData.estado || 'Activo'}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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

        {/* Programa */}
        <div className="sm:col-span-3">
          <label htmlFor="idPrograma" className="block text-sm font-medium text-gray-700 mb-1">
            Programa <span className="text-red-500">*</span>
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiBook className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="idPrograma"
              name="idPrograma"
              value={formData.idPrograma || ''}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2 border ${
                errores.idPrograma ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-md shadow-sm sm:text-sm`}
              disabled={isSubmitting || isLoading.programas}
            >
              <option value="">Seleccione un programa</option>
              {programas.map((programa) => (
                <option key={programa.id} value={programa.id}>
                  {programa.nombre}
                </option>
              ))}
            </select>
            {isLoading.programas && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
          {errores.idPrograma && (
            <p className="mt-1 text-sm text-red-600">{errores.idPrograma}</p>
          )}
        </div>

        {/* Email */}
        <div className="sm:col-span-3">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Correo Electrónico <span className="text-red-500">*</span>
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
              className={`block w-full pl-10 pr-3 py-2 border ${
                errores.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-md shadow-sm sm:text-sm`}
              disabled={isSubmitting}
              placeholder="correo@ejemplo.com"
            />
          </div>
          {errores.email && (
            <p className="mt-1 text-sm text-red-600">{errores.email}</p>
          )}
        </div>

        {/* Teléfono */}
        <div className="sm:col-span-3">
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono <span className="text-red-500">*</span>
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
              className={`block w-full pl-10 pr-3 py-2 border ${
                errores.telefono ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-md shadow-sm sm:text-sm`}
              disabled={isSubmitting}
              placeholder="912345678"
            />
          </div>
          {errores.telefono && (
            <p className="mt-1 text-sm text-red-600">{errores.telefono}</p>
          )}
        </div>

        {/* Dirección */}
        <div className="sm:col-span-6">
          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
            Dirección <span className="text-red-500">*</span>
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute top-0 left-0 pl-3 pt-2.5">
              <FiMapPin className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="direccion"
              name="direccion"
              rows={3}
              value={formData.direccion || ''}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2 border ${
                errores.direccion ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-md shadow-sm sm:text-sm`}
              placeholder="Ingrese la dirección completa"
              disabled={isSubmitting}
            />
          </div>
          {errores.direccion && (
            <p className="mt-1 text-sm text-red-600">{errores.direccion}</p>
          )}
        </div>

        {/* Mensaje de error general */}
        {errores.general && (
          <div className="sm:col-span-6">
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {errores.general}
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default EstudianteForm;
