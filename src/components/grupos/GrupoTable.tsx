import React from 'react';
import type { Grupo } from '../../api/config';

interface GrupoTableProps {
  grupos: Grupo[];
  onEdit: (grupo: Grupo) => void;
  onDelete: (id: number, nombre: string) => void;
  isLoading?: boolean;
  // Mantener compatibilidad con los props existentes aunque no los usemos
  showPrograma?: boolean;
  showCiclo?: boolean;
}

export const GrupoTable: React.FC<GrupoTableProps> = ({
  grupos,
  onEdit,
  onDelete,
  isLoading = false,
  // Los props showPrograma y showCiclo se mantienen por compatibilidad pero no se usan
  showPrograma: _showPrograma,
  showCiclo: _showCiclo,
}) => {
  // Debug: Log the grupos data with more details
  console.log('Grupos data in GrupoTable:', {
    isArray: Array.isArray(grupos),
    length: grupos?.length || 0,
    firstItem: grupos?.[0],
    allItems: grupos
  });
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Debug: Check if grupos is an array and log its length
  console.log('Grupos array length:', grupos.length);
  console.log('Is grupos an array?', Array.isArray(grupos));

  if (!Array.isArray(grupos)) {
    return (
      <div className="text-center py-12 text-red-600">
        Error: grupos no es un array
      </div>
    );
  }

  if (grupos.length === 0) {
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
            d="M8 4v6m0 0h8M8 10h8m-8 6h8m-8 0v6m0 0h8m0 0v-6m0 0h8"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay grupos registrados</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza agregando un nuevo grupo.
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
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  ID
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Nombre
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Ciclo
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Año - Período
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {grupos.map((grupo) => (
                <tr key={grupo.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {grupo.id}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                    {grupo.nombre}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {grupo.idCiclo}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {grupo.ciclo ? `${grupo.ciclo.anio} - ${grupo.ciclo.periodo}` : 'N/A'}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      onClick={() => onEdit(grupo)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(grupo.id as number, grupo.nombre)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
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
