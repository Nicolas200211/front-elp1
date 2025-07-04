import React from 'react';
import { FiUser, FiEdit2 } from 'react-icons/fi';
import type { Estudiante } from './EstudianteForm';

export interface EstudianteDetalleProps {
  estudiante: Estudiante;
  onEdit: () => void;
  onClose: () => void;
}

const EstudianteDetalle: React.FC<EstudianteDetalleProps> = ({ estudiante, onEdit, onClose }) => {
  // Función para formatear la fecha de nacimiento
  const formatearFecha = (fecha: string | Date) => {
    if (!fecha) return 'No especificada';
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return fechaObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calcular la edad
  const calcularEdad = (fechaNacimiento: string | Date) => {
    if (!fechaNacimiento) return '';
    const nacimiento = typeof fechaNacimiento === 'string' ? new Date(fechaNacimiento) : fechaNacimiento;
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return `${edad} años`;
  };

  // Formatear género
  const formatearGenero = (genero: string) => {
    const generos: { [key: string]: string } = {
      'M': 'Masculino',
      'F': 'Femenino',
      'O': 'Otro'
    };
    return generos[genero] || genero;
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-white">
            Información del Estudiante
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-full text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title="Editar"
            >
              <FiEdit2 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title="Cerrar"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          {/* Foto de perfil */}
          <div className="sm:col-span-2 flex justify-center mb-4">
            <div className="h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center">
              <FiUser className="h-16 w-16 text-blue-600" />
            </div>
          </div>

          {/* Información personal */}
          <div className="sm:col-span-2">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h4>
            <dl className="space-y-4">
              <div className="flex items-start">
                <dt className="w-32 text-sm font-medium text-gray-500">Código:</dt>
                <dd className="text-sm text-gray-900">{estudiante.codigo}</dd>
              </div>
              <div className="flex items-start">
                <dt className="w-32 text-sm font-medium text-gray-500">Nombres:</dt>
                <dd className="text-sm text-gray-900">{estudiante.nombres}</dd>
              </div>
              <div className="flex items-start">
                <dt className="w-32 text-sm font-medium text-gray-500">Apellidos:</dt>
                <dd className="text-sm text-gray-900">{estudiante.apellidos}</dd>
              </div>
              <div className="flex items-start">
                <dt className="w-32 text-sm font-medium text-gray-500">DNI:</dt>
                <dd className="text-sm text-gray-900">{estudiante.dni}</dd>
              </div>
              <div className="flex items-start">
                <dt className="w-32 text-sm font-medium text-gray-500">Género:</dt>
                <dd className="text-sm text-gray-900">{formatearGenero(estudiante.genero)}</dd>
              </div>
              <div className="flex items-start">
                <dt className="w-32 text-sm font-medium text-gray-500">Fecha Nac.:</dt>
                <dd className="text-sm text-gray-900">
                  {formatearFecha(estudiante.fechaNacimiento)}
                  <span className="ml-2 text-gray-500">({calcularEdad(estudiante.fechaNacimiento)})</span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Información de contacto */}
          <div className="sm:col-span-2 mt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Información de Contacto</h4>
            <dl className="space-y-4">
              <div className="flex items-start">
                <dt className="w-32 text-sm font-medium text-gray-500">Email:</dt>
                <dd className="text-sm text-blue-600">
                  <a href={`mailto:${estudiante.email}`} className="hover:underline">
                    {estudiante.email}
                  </a>
                </dd>
              </div>
              <div className="flex items-start">
                <dt className="w-32 text-sm font-medium text-gray-500">Teléfono:</dt>
                <dd className="text-sm text-gray-900">{estudiante.telefono}</dd>
              </div>
              <div className="flex items-start">
                <dt className="w-32 text-sm font-medium text-gray-500">Dirección:</dt>
                <dd className="text-sm text-gray-900">{estudiante.direccion}</dd>
              </div>
            </dl>
          </div>

          {/* Información académica */}
          {estudiante.programa && (
            <div className="sm:col-span-2 mt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Información Académica</h4>
              <dl className="space-y-4">
                <div className="flex items-start">
                  <dt className="w-32 text-sm font-medium text-gray-500">Programa:</dt>
                  <dd className="text-sm text-gray-900">{estudiante.programa.nombre}</dd>
                </div>
                <div className="flex items-start">
                  <dt className="w-32 text-sm font-medium text-gray-500">Estado:</dt>
                  <dd className="text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      estudiante.estado === 'Activo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {estudiante.estado}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cerrar
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiEdit2 className="-ml-1 mr-2 h-5 w-5" />
          Editar Estudiante
        </button>
      </div>
    </div>
  );
};

export { EstudianteDetalle };
