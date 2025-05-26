import React from 'react';
import type { Asignatura } from '../../api/config';

// Simple SVG icons for actions
const PencilIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

interface AsignaturaTableProps {
  asignaturas: Asignatura[];
  onEdit: (asignatura: Asignatura) => void;
  onDelete: (id: number) => void;
}

// Function to get status badge style
const getEstadoBadgeClass = (estado: string) => {
  const estados: Record<string, string> = {
    'Activa': 'bg-green-100 text-green-800',
    'Inactiva': 'bg-red-100 text-red-800',
    'Pendiente': 'bg-yellow-100 text-yellow-800',
    'En revisión': 'bg-blue-100 text-blue-800',
    'Aprobada': 'bg-purple-100 text-purple-800',
  };
  return estados[estado] || 'bg-gray-100 text-gray-800';
};

// Function to get full teacher name
const getNombreDocente = (docente: { nombres?: string; nombre?: string; apellidos?: string }) => {
  if (!docente) return '';
  return `${docente.nombres || docente.nombre || ''} ${docente.apellidos || ''}`.trim();
};

export const AsignaturaTable: React.FC<AsignaturaTableProps> = ({
  asignaturas = [],
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flow-root">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asignatura
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Docente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {asignaturas.length > 0 ? (
                asignaturas.map((asignatura) => (
                  <tr key={asignatura.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-md flex items-center justify-center">
                          <span className="text-indigo-700 font-medium text-sm">{asignatura.codigo}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{asignatura.nombre}</div>
                          <div className="text-sm text-gray-500">{asignatura.tipo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{asignatura.creditos} créditos</div>
                      <div className="text-sm text-gray-500">
                        {asignatura.horasTeoricas}h teóricas • {asignatura.horasPracticas}h prácticas
                      </div>
                      {asignatura.programa && (
                        <div className="text-sm text-gray-500">
                          {asignatura.programa.nombre}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {asignatura.docente ? (
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-medium">
                            {(asignatura.docente.nombres?.charAt(0) || asignatura.docente.nombre?.charAt(0) || '')}
                            {(asignatura.docente.apellidos?.charAt(0) || '')}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {getNombreDocente(asignatura.docente)}
                            </div>
                            {asignatura.docente.email && (
                              <div className="text-xs text-gray-500">
                                {asignatura.docente.email}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : asignatura.idDocente ? (
                        <span className="text-sm text-gray-500">
                          Docente ID: {asignatura.idDocente}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500 italic">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeClass(asignatura.estado)}`}>
                        {asignatura.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => onEdit(asignatura)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editar"
                        >
                          <PencilIcon />
                        </button>
                        <button
                          onClick={() => asignatura.id && onDelete(asignatura.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    <div className="py-8">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No hay asignaturas</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Comienza creando una nueva asignatura
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
