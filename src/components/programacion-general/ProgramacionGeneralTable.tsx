import React from 'react';
import type { ProgramacionGeneral } from '../../api/config';

interface ProgramacionGeneralTableProps {
  programaciones: ProgramacionGeneral[]; // Required prop, always an array
  onEdit: (programacion: ProgramacionGeneral) => void;
  onDelete: (id: number) => void;
  onCambiarEstado: (id: number, nuevoEstado: string) => void;
  isLoading?: boolean;
}

const ProgramacionGeneralTable: React.FC<ProgramacionGeneralTableProps> = ({
  programaciones,
  onEdit,
  onDelete,
  onCambiarEstado,
  isLoading = false
}) => {
  console.log('Renderizando ProgramacionGeneralTable con programaciones:', programaciones);
  
  // Clase para el badge de nivel
  const nivelBadgeClass = 'bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded';

  if (isLoading) {
    console.log('Mostrando indicador de carga...');
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4">Cargando programaciones...</span>
      </div>
    );
  }

  // Si no hay programaciones, mostrar estado vacío
  console.log('No hay programaciones para mostrar');
  if (programaciones.length === 0) {
    return (
      <div className="text-center py-8">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay programaciones</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza creando una nueva programación general.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  ID Unidad
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Nombre
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Nivel
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {programaciones.map((programacion) => (
                <tr key={programacion.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {programacion.idUnidad || 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {programacion.nombre || 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={nivelBadgeClass}>
                      {programacion.nivel || 'N/A'}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex items-center space-x-2 justify-end">
                      <button
                        onClick={() => programacion.id && onCambiarEstado(programacion.id, programacion.estado === 'Activo' ? 'Inactivo' : 'Activo')}
                        className={`text-sm ${programacion.estado === 'Activo' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {programacion.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => onEdit(programacion)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => programacion.id && onDelete(programacion.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProgramacionGeneralTable;
