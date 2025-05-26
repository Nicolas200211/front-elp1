import React, { useEffect, useState } from 'react';
import { estudianteService } from '../../api/estudianteService';
import type { Estudiante, Programa } from '../../api/config';

interface EstudianteFormProps {
  initialData?: Partial<Estudiante>;
  onSubmit: (data: Partial<Estudiante>) => void;
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
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<Partial<Estudiante>>({
    codigo: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    dni: '',
    direccion: '',
    fechaNacimiento: '',
    genero: 'M',
    estado: 'Activo',
    idPrograma: 0,
    ...initialData,
  });
  
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [isLoading, setIsLoading] = useState({
    programas: true,
    codigoVerificando: false,
    dniVerificando: false,
  });
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const programasData = await estudianteService.getProgramas();
        setProgramas(programasData);
        
        // Establecer el primer programa como valor por defecto si no hay un valor inicial
        if (programasData.length > 0 && !formData.idPrograma) {
          setFormData(prev => ({
            ...prev,
            idPrograma: programasData[0].id
          }));
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        setErrores(prev => ({
          ...prev,
          general: 'Error al cargar los programas. Por favor, intente nuevamente.'
        }));
      } finally {
        setIsLoading(prev => ({ ...prev, programas: false }));
      }
    };

    loadInitialData();
  }, []);

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
      } else if (errores.codigo === 'Este código ya está en uso por otro estudiante') {
        const { codigo: _, ...restErrores } = errores;
        setErrores(restErrores);
      }
    } catch (error) {
      console.error('Error al verificar código:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, codigoVerificando: false }));
    }
  };

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
      } else if (errores.dni === 'Este DNI ya está registrado por otro estudiante') {
        const { dni: _, ...restErrores } = errores;
        setErrores(restErrores);
      }
    } catch (error) {
      console.error('Error al verificar DNI:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, dniVerificando: false }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Limpiar el error del campo cuando se modifica
    if (errores[name]) {
      const { [name]: _, ...restErrores } = errores;
      setErrores(restErrores);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Verificar código y DNI en tiempo real
    if (name === 'codigo' && value.length === 8) {
      verificarCodigo(value);
    }
    
    if (name === 'dni' && value.length === 8) {
      verificarDni(value);
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

  // Calcular edad a partir de la fecha de nacimiento
  const calcularEdad = (fechaNacimiento?: string) => {
    if (!fechaNacimiento) return '';
    
    try {
      const fechaNac = new Date(fechaNacimiento);
      const hoy = new Date();
      let edad = hoy.getFullYear() - fechaNac.getFullYear();
      const mes = hoy.getMonth() - fechaNac.getMonth();
      
      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
      }
      
      return `${edad} años`;
    } catch (error) {
      return '';
    }
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
          <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">
            Código <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              name="codigo"
              id="codigo"
              maxLength={8}
              value={formData.codigo || ''}
              onChange={handleChange}
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errores.codigo ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="Ej: 20250001"
              disabled={isSubmitting || isLoading.codigoVerificando || isEditing}
              onBlur={(e) => verificarCodigo(e.target.value)}
            />
            {isLoading.codigoVerificando && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              </div>
            )}
          </div>
          {errores.codigo && (
            <p className="mt-1 text-sm text-red-600">{errores.codigo}</p>
          )}
        </div>

        {/* DNI */}
        <div className="sm:col-span-2">
          <label htmlFor="dni" className="block text-sm font-medium text-gray-700">
            DNI <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              name="dni"
              id="dni"
              maxLength={8}
              value={formData.dni || ''}
              onChange={handleChange}
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errores.dni ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="Ej: 87654321"
              disabled={isSubmitting || isLoading.dniVerificando}
              onBlur={(e) => verificarDni(e.target.value)}
            />
            {isLoading.dniVerificando && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              </div>
            )}
          </div>
          {errores.dni && (
            <p className="mt-1 text-sm text-red-600">{errores.dni}</p>
          )}
        </div>

        {/* Fecha de Nacimiento */}
        <div className="sm:col-span-2">
          <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700">
            Fecha de Nacimiento <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="date"
              name="fechaNacimiento"
              id="fechaNacimiento"
              value={formData.fechaNacimiento?.toString().split('T')[0] || ''}
              onChange={handleChange}
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errores.fechaNacimiento ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              disabled={isSubmitting}
              max={new Date().toISOString().split('T')[0]}
            />
            {formData.fechaNacimiento && (
              <p className="mt-1 text-xs text-gray-500">
                Edad: {calcularEdad(formData.fechaNacimiento.toString())}
              </p>
            )}
            {errores.fechaNacimiento && (
              <p className="mt-1 text-sm text-red-600">{errores.fechaNacimiento}</p>
            )}
          </div>
        </div>

        {/* Nombres */}
        <div className="sm:col-span-3">
          <label htmlFor="nombres" className="block text-sm font-medium text-gray-700">
            Nombres <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="nombres"
              id="nombres"
              value={formData.nombres || ''}
              onChange={handleChange}
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errores.nombres ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              disabled={isSubmitting}
            />
            {errores.nombres && (
              <p className="mt-1 text-sm text-red-600">{errores.nombres}</p>
            )}
          </div>
        </div>

        {/* Apellidos */}
        <div className="sm:col-span-3">
          <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700">
            Apellidos <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="apellidos"
              id="apellidos"
              value={formData.apellidos || ''}
              onChange={handleChange}
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errores.apellidos ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              disabled={isSubmitting}
            />
            {errores.apellidos && (
              <p className="mt-1 text-sm text-red-600">{errores.apellidos}</p>
            )}
          </div>
        </div>

        {/* Género */}
        <div className="sm:col-span-2">
          <label htmlFor="genero" className="block text-sm font-medium text-gray-700">
            Género <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="genero"
              name="genero"
              value={formData.genero || 'M'}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
        <div className="sm:col-span-2">
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
        <div className="sm:col-span-2">
          <label htmlFor="idPrograma" className="block text-sm font-medium text-gray-700">
            Programa <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="idPrograma"
              name="idPrograma"
              value={formData.idPrograma || ''}
              onChange={handleChange}
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errores.idPrograma ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              disabled={isSubmitting || programas.length === 0}
            >
              {programas.length === 0 ? (
                <option value="">No hay programas disponibles</option>
              ) : (
                <>
                  <option value="">Seleccione un programa</option>
                  {programas.map((programa) => (
                    <option key={programa.id} value={programa.id}>
                      {programa.nombre}
                    </option>
                  ))}
                </>
              )}
            </select>
            {errores.idPrograma && (
              <p className="mt-1 text-sm text-red-600">{errores.idPrograma}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="sm:col-span-3">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Correo Electrónico <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email || ''}
              onChange={handleChange}
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errores.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="ejemplo@dominio.com"
              disabled={isSubmitting}
            />
            {errores.email && (
              <p className="mt-1 text-sm text-red-600">{errores.email}</p>
            )}
          </div>
        </div>

        {/* Teléfono */}
        <div className="sm:col-span-3">
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
            Teléfono <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="tel"
              name="telefono"
              id="telefono"
              value={formData.telefono || ''}
              onChange={handleChange}
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errores.telefono ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="Ej: 987654321"
              disabled={isSubmitting}
            />
            {errores.telefono && (
              <p className="mt-1 text-sm text-red-600">{errores.telefono}</p>
            )}
          </div>
        </div>

        {/* Dirección */}
        <div className="sm:col-span-6">
          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
            Dirección <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <textarea
              id="direccion"
              name="direccion"
              rows={2}
              value={formData.direccion || ''}
              onChange={handleChange}
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errores.direccion ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              disabled={isSubmitting}
            />
            {errores.direccion && (
              <p className="mt-1 text-sm text-red-600">{errores.direccion}</p>
            )}
          </div>
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

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isSubmitting || Object.keys(errores).some(key => 
            key !== 'general' && errores[key]?.includes('ya está')
          )}
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
            'Actualizar Estudiante'
          ) : (
            'Registrar Estudiante'
          )}
        </button>
      </div>
    </form>
  );
};
