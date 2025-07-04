import React from 'react';
import type { Aula } from '../../api/config';

interface AulaTableProps {
  aulas: Aula[];
  onEdit: (aula: Aula) => void;
  onDelete: (id: number, nombre: string) => void;
  isLoading?: boolean;
}

export const AulaTable: React.FC<AulaTableProps> = ({
  aulas: aulasProp,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  // Debug log and safeguard
  console.log('AulaTable received:', { aulasProp, isArray: Array.isArray(aulasProp) });
  const aulas = Array.isArray(aulasProp) ? aulasProp : [];
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (aulas.length === 0) {
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay aulas registradas</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza agregando una nueva aula.
        </p>
      </div>
    );
  }

  const getEstadoBadge = (estado: string) => {
    const estados = {
      'Disponible': 'bg-green-100 text-green-800',
      'En Mantenimiento': 'bg-yellow-100 text-yellow-800',
      'Ocupado': 'bg-red-100 text-red-800',
      'Inactivo': 'bg-gray-100 text-gray-800',
    };

    const estilo = estados[estado as keyof typeof estados] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estilo}`}>
        {estado}
      </span>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const tipos = {
      'Aula': 'bg-blue-100 text-blue-800',
      'Laboratorio': 'bg-purple-100 text-purple-800',
      'Auditorio': 'bg-indigo-100 text-indigo-800',
      'Sala de Reuniones': 'bg-pink-100 text-pink-800',
      'Otro': 'bg-gray-100 text-gray-800',
    };

    const estilo = tipos[tipo as keyof typeof tipos] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estilo}`}>
        {tipo}
      </span>
    );
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
                  Nombre
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Tipo
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Capacidad
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Estado
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {aulas.map((aula) => (
                <tr key={aula.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                    {aula.codigo}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {aula.nombre}
                    {aula.descripcion && (
                      <p className="text-xs text-gray-500 truncate max-w-xs">{aula.descripcion}</p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {aula.tipo && getTipoBadge(aula.tipo)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {aula.capacidad} personas
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {aula.estado && getEstadoBadge(aula.estado)}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      onClick={() => onEdit(aula)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(aula.id as number, aula.nombre || '')}
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
