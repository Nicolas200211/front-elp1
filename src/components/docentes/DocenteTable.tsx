import React from 'react';
import type { Docente } from '../../api/config';

interface DocenteTableProps {
  docentes: Docente[];
  onEdit: (docente: Docente) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export const DocenteTable: React.FC<DocenteTableProps> = ({
  docentes,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (docentes.length === 0) {
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
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay docentes registrados</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza agregando un nuevo docente.
        </p>
      </div>
    );
  }

  const getEstadoBadge = (estado: string) => {
    const estados = {
      'Activo': 'bg-green-100 text-green-800',
      'Inactivo': 'bg-gray-100 text-gray-800',
      'Licencia': 'bg-yellow-100 text-yellow-800',
      'Jubilado': 'bg-blue-100 text-blue-800',
    };

    const estilo = estados[estado as keyof typeof estados] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estilo}`}>
        {estado}
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
                  Nombre Completo
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Información de Contacto
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Especialidad / Título
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Contrato / Estado
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {docentes.map((docente) => (
                <tr key={docente.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {docente.nombre || `${docente.nombres || ''} ${docente.apellidos || ''}`.trim()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {docente.genero && `Género: ${docente.genero}`}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-sm text-gray-900">{docente.email}</div>
                    {docente.telefono && (
                      <div className="text-xs text-gray-500">
                        Tel: {docente.telefono}
                      </div>
                    )}
                    {docente.direccion && (
                      <div className="text-xs text-gray-500 truncate max-w-xs" title={docente.direccion}>
                        {docente.direccion}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-4">
                    {docente.especialidad && (
                      <div className="text-sm text-gray-900">{docente.especialidad}</div>
                    )}
                    {docente.tituloAcademico && (
                      <div className="text-xs text-gray-500">{docente.tituloAcademico}</div>
                    )}
                  </td>
                  <td className="px-3 py-4">
                    <div className="mb-1">
                      {docente.estado && getEstadoBadge(docente.estado)}
                    </div>
                    {docente.tipoContrato && (
                      <div className="text-xs text-gray-500">{docente.tipoContrato}</div>
                    )}
                    {docente.fechaIngreso && (
                      <div className="text-xs text-gray-500">
                        Ingreso: {new Date(docente.fechaIngreso).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      onClick={() => onEdit(docente)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => docente.id && onDelete(docente.id)}
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
