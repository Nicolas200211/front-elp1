import React, { useEffect, useState } from 'react';
import { matriculaService } from '../../api/matriculaService';
import type { Matricula, Estudiante, Grupo } from '../../api/config';
import { FiUser, FiUsers, FiCheckCircle, FiX, FiAlertCircle, FiLoader, FiCalendar } from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';

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
  const [filteredEstudiantes, setFilteredEstudiantes] = useState<Estudiante[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(null);
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
        setFilteredEstudiantes(estudiantesData);
        setGrupos(gruposData);
        
        // Si hay datos iniciales, establecer el estudiante seleccionado
        if (initialData.idEstudiante) {
          const estudianteInicial = estudiantesData.find(e => e.id === initialData.idEstudiante);
          if (estudianteInicial) {
            setSelectedEstudiante(estudianteInicial);
            setSearchTerm(`${estudianteInicial.nombres} ${estudianteInicial.apellidos} - ${estudianteInicial.codigo}`);
          }
        }
        
        // Establecer valores iniciales si no están definidos
        setFormData(prev => ({
          ...prev,
          idEstudiante: prev.idEstudiante || 0,
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
  }, [initialData]);

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
      [name]: value
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
    
    if (searchValue.length === 0) {
      setFilteredEstudiantes(estudiantes);
      setSelectedEstudiante(null);
      setFormData(prev => ({ ...prev, idEstudiante: 0 }));
      return;
    }
    
    const filtered = estudiantes.filter(estudiante => 
      `${estudiante.nombres} ${estudiante.apellidos} ${estudiante.codigo} ${estudiante.dni}`
        .toLowerCase()
        .includes(searchValue.toLowerCase())
    );
    setFilteredEstudiantes(filtered);
    setIsDropdownOpen(true);
  };
  
  const handleSelectEstudiante = (estudiante: Estudiante) => {
    setSelectedEstudiante(estudiante);
    setSearchTerm(`${estudiante.nombres} ${estudiante.apellidos} - ${estudiante.codigo}`);
    setFormData(prev => ({ ...prev, idEstudiante: estudiante.id }));
    setIsDropdownOpen(false);
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

  if (isLoading.estudiantes || isLoading.grupos) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Estudiante */}
          <div className="space-y-1">
            <label htmlFor="estudiante" className="block text-sm font-medium text-gray-700">
              <FiUser className="inline mr-1 h-4 w-4 text-blue-500" />
              Estudiante *
            </label>
            <div className="mt-1 relative">
              <div className="relative">
                <input
                  type="text"
                  id="estudiante-search"
                  className={`block w-full pl-10 pr-3 py-2 text-base border ${
                    formData.idEstudiante ? 'border-gray-300' : 'border-red-300'
                  } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Buscar estudiante..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setIsDropdownOpen(true)}
                  disabled={isSubmitting || isLoading.estudiantes}
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="hidden"
                  name="idEstudiante"
                  value={formData.idEstudiante || ''}
                />
              </div>
              
              {isDropdownOpen && filteredEstudiantes.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {filteredEstudiantes.map((estudiante) => (
                    <div
                      key={estudiante.id}
                      className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 ${
                        selectedEstudiante?.id === estudiante.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleSelectEstudiante(estudiante)}
                    >
                      <div className="flex items-center">
                        <span className="font-normal ml-3 block truncate">
                          {estudiante.nombres} {estudiante.apellidos} - {estudiante.codigo} (DNI: {estudiante.dni})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {isDropdownOpen && filteredEstudiantes.length === 0 && searchTerm && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base">
                  <div className="px-4 py-2 text-gray-500">No se encontraron estudiantes</div>
                </div>
              )}
            </div>
          </div>

          {/* Grupo */}
          <div className="space-y-1">
            <label htmlFor="grupo" className="block text-sm font-medium text-gray-700">
              <FiUsers className="inline mr-1 h-4 w-4 text-blue-500" />
              Grupo *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <select
                id="grupo"
                name="idGrupo"
                className={`block w-full pl-10 pr-10 py-2 text-base border ${
                  formData.idGrupo ? 'border-gray-300' : 'border-red-300'
                } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                value={formData.idGrupo || ''}
                onChange={handleChange}
                disabled={isSubmitting || isLoading.grupos}
                required
              >
                <option value="">Seleccione un grupo</option>
                {grupos.map((grupo) => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nombre} - {grupo.programa?.nombre} ({grupo.ciclo?.anio}-{grupo.ciclo?.periodo})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUsers className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-1">
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
              <FiCheckCircle className="inline mr-1 h-4 w-4 text-blue-500" />
              Estado *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <select
                id="estado"
                name="estado"
                className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.estado || ''}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              >
                {ESTADOS.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCheckCircle className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Fecha de Matrícula */}
          <div className="space-y-1">
            <label htmlFor="fechaMatricula" className="block text-sm font-medium text-gray-700">
              <FiCalendar className="inline mr-1 h-4 w-4 text-blue-500" />
              Fecha de Matrícula
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="date"
                name="fechaMatricula"
                id="fechaMatricula"
                value={formData.fechaMatricula || ''}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={isSubmitting}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Fecha de Matrícula */}
        </div>

        {/* Mensaje de error */}
        {isLoading.error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{isLoading.error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            <FiX className="-ml-1 mr-2 h-4 w-4" />
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isSubmitting || isLoading.estudiantes || isLoading.grupos}
          >
            {isSubmitting ? (
              <>
                <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Guardando...
              </>
            ) : isEditing ? (
              'Actualizar matrícula'
            ) : (
              'Registrar Matrícula'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
