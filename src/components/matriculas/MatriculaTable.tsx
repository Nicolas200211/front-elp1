import React from 'react';
import type { Matricula } from '../../api/config';
import { format } from 'date-fns';

interface MatriculaTableProps {
  matriculas: Matricula[];
  onEdit: (matricula: Matricula) => void;
  onDelete: (id: number, matricula: Matricula) => void;
  isLoading?: boolean;
  showActions?: boolean;
}

export const MatriculaTable: React.FC<MatriculaTableProps> = ({
  matriculas,
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

  if (matriculas.length === 0) {
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay matrículas registradas</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza registrando una nueva matrícula.
        </p>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPpp');
    } catch (error) {
      return 'Fecha inválida';
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
                  Grupo
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Fecha de Registro
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Última Actualización
                </th>
                {showActions && (
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Acciones</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {matriculas.map((matricula) => (
                <tr key={matricula.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {matricula.estudiante?.codigo || 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 text-sm font-medium">
                            {matricula.estudiante?.nombres?.charAt(0)}{matricula.estudiante?.apellidos?.charAt(0) || '?'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">
                          {matricula.estudiante?.nombres} {matricula.estudiante?.apellidos}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {matricula.estudiante?.email || 'Sin email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="font-medium text-gray-900">
                      {matricula.grupo?.nombre || 'Grupo no disponible'}
                    </div>
                    <div className="text-gray-500 text-xs">
                      ID: {matricula.grupo?.id || 'N/A'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {matricula.createdAt ? formatDate(matricula.createdAt) : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {matricula.updatedAt ? formatDate(matricula.updatedAt) : 'N/A'}
                  </td>
                  
                  {showActions && (
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => onEdit(matricula)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(matricula.id as number, matricula)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
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
