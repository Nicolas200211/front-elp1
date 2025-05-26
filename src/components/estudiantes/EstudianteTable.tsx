import React from 'react';
import { Link } from 'react-router';
import type { Estudiante } from '../../api/config';

interface EstudianteTableProps {
  estudiantes: Estudiante[];
  onEdit: (estudiante: Estudiante) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
  showActions?: boolean;
}

export const EstudianteTable: React.FC<EstudianteTableProps> = ({
  estudiantes,
  onEdit,
  onDelete,
  isLoading = false,
  showActions = true,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (estudiantes.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            vectorEffect="non-scaling-stroke"
            strokeWidth={2}
            strokeLinecap="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay estudiantes registrados</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza registrando un nuevo estudiante.
        </p>
      </div>
    );
  }

  const getEstadoBadge = (estado: string) => {
    const estados: Record<string, string> = {
      'Activo': 'bg-green-100 text-green-800',
      'Inactivo': 'bg-gray-100 text-gray-800',
      'Egresado': 'bg-blue-100 text-blue-800',
      'Suspendido': 'bg-yellow-100 text-yellow-800',
    };

    const estilo = estados[estado] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estilo}`}>
        {estado}
      </span>
    );
  };

  const getGeneroLabel = (genero: string) => {
    const generos: Record<string, string> = {
      'M': 'Masculino',
      'F': 'Femenino',
      'O': 'Otro',
    };
    return generos[genero] || genero;
  };

  const calcularEdad = (fechaNacimiento: string) => {
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
      return 'N/A';
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Código
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Estudiante
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Información
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Contacto
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Estado
                </th>
                {showActions && (
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Acciones</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {estudiantes.map((estudiante) => (
                <tr key={estudiante.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="font-mono font-medium text-gray-900">
                      {estudiante.codigo}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      DNI: {estudiante.dni}
                    </div>
                  </td>
                  
                  <td className="whitespace-nowrap px-3 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {estudiante.nombres.charAt(0)}{estudiante.apellidos.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">
                          {estudiante.nombres} {estudiante.apellidos}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {getGeneroLabel(estudiante.genero)} • {calcularEdad(estudiante.fechaNacimiento)}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="text-gray-900">
                      {estudiante.programa?.nombre || 'Programa no especificado'}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {estudiante.programa?.idUnidad ? `ID Unidad: ${estudiante.programa.idUnidad}` : 'Unidad no especificada'}
                    </div>
                  </td>
                  
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="text-gray-900">{estudiante.email}</div>
                    <div className="text-gray-500">{estudiante.telefono}</div>
                  </td>
                  
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {getEstadoBadge(estudiante.estado)}
                  </td>
                  
                  {showActions && (
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/estudiantes/${estudiante.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => onEdit(estudiante)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editar"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(estudiante.id!)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
