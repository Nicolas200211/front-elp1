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

// La función getNombreDocente fue eliminada ya que no se está utilizando

export const AsignaturaTable: React.FC<AsignaturaTableProps> = ({
  asignaturas = [],
  onEdit,
  onDelete,
}) => {
  // Depuración: Mostrar los datos de las asignaturas en consola
  React.useEffect(() => {
    console.log('Datos de asignaturas en la tabla:', asignaturas);
    if (asignaturas.length > 0 && asignaturas[0].docente) {
      console.log('Primer docente:', asignaturas[0].docente);
    }
  }, [asignaturas]);
  return (
    <div className="w-full overflow-x-auto pl-16 pr-8">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="min-w-[1200px] w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Código
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                Asignatura
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Tipo
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                Horas
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-72">
                Docente
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                Unidad Académica
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Estado
              </th>
              <th scope="col" className="relative px-6 py-4 w-32">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {asignaturas.length > 0 ? (
              asignaturas.map((asignatura) => (
                <tr 
                  key={asignatura.id} 
                  className="hover:bg-gray-50/80 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 font-mono">{asignatura.codigo}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">{asignatura.nombre}</div>
                    <div className="text-xs text-gray-500 mt-1">{asignatura.creditos} créditos</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {asignatura.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-700">
                        <span className="w-24 text-gray-500">Teóricas:</span>
                        <span className="font-medium">{asignatura.horasTeoricas}h</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <span className="w-24 text-gray-500">Prácticas:</span>
                        <span className="font-medium">{asignatura.horasPracticas}h</span>
                      </div>
                      <div className="flex items-center text-sm font-medium text-gray-900 pt-1 border-t border-gray-100">
                        <span className="w-24">Total:</span>
                        <span>{asignatura.horasTeoricas + asignatura.horasPracticas}h</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {asignatura.docente ? (
                      <div className="flex items-center group">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-700 text-sm font-medium flex-shrink-0 ring-2 ring-white shadow-sm">
                          {asignatura.docente.nombres?.charAt(0) || asignatura.docente.nombre?.charAt(0) || ''}
                          {asignatura.docente.apellidos?.charAt(0) || asignatura.docente.apellido?.charAt(0) || ''}
                        </div>
                        <div className="ml-3 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                            {asignatura.docente.nombres || asignatura.docente.nombre || ''} {asignatura.docente.apellidos || asignatura.docente.apellido || ''}
                          </div>
                          {asignatura.docente.email && (
                            <div className="text-xs text-gray-500 truncate">
                              {asignatura.docente.email}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : asignatura.idDocente ? (
                      <div className="text-sm text-gray-500 italic">
                        Docente ID: {asignatura.idDocente}
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        Sin asignar
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {asignatura.unidadAcademica?.nombre || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ID: {asignatura.idUnidadAcademica || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoBadgeClass(asignatura.estado)}`}>
                      {asignatura.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onEdit(asignatura)}
                        className="text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 p-1.5 rounded-full transition-colors duration-150"
                        title="Editar"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        onClick={() => asignatura.id && onDelete(asignatura.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-colors duration-150"
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
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-gray-50 p-4 rounded-full mb-3">
                      <svg
                        className="h-8 w-8 text-gray-400"
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
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No hay asignaturas</h3>
                    <p className="text-gray-500 max-w-md">
                      No se encontraron asignaturas. Comienza creando una nueva asignatura para verla aquí.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
