import React from 'react';
import type { Matricula } from '../../api/config';

interface MatriculaTableProps {
  matriculas: Matricula[];
  onEdit: (matricula: Matricula) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
  showEstudiante?: boolean;
  showGrupo?: boolean;
  showActions?: boolean;
}

export const MatriculaTable: React.FC<MatriculaTableProps> = ({
  matriculas,
  onEdit,
  onDelete,
  isLoading = false,
  showEstudiante = true,
  showGrupo = true,
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

  const getEstadoBadge = (estado: string) => {
    const estados: Record<string, string> = {
      'Activo': 'bg-blue-100 text-blue-800',
      'Retirado': 'bg-gray-100 text-gray-800',
      'Aprobado': 'bg-green-100 text-green-800',
      'Reprobado': 'bg-red-100 text-red-800',
      'Incompleto': 'bg-yellow-100 text-yellow-800',
    };

    const estilo = estados[estado] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estilo}`}>
        {estado}
      </span>
    );
  };

  const getCalificacionBadge = (calificacion?: number) => {
    if (calificacion === undefined || calificacion === null) {
      return <span className="text-gray-500 text-sm">-</span>;
    }
    
    let estilo = '';
    if (calificacion >= 13) {
      estilo = 'text-green-600';
    } else if (calificacion >= 11) {
      estilo = 'text-yellow-600';
    } else {
      estilo = 'text-red-600';
    }
    
    return <span className={`font-medium ${estilo}`}>{calificacion.toFixed(1)}</span>;
  };

  const getAsistenciaBadge = (asistencia?: number) => {
    if (asistencia === undefined || asistencia === null) {
      return <span className="text-gray-500 text-sm">-</span>;
    }
    
    let estilo = '';
    if (asistencia >= 80) {
      estilo = 'text-green-600';
    } else if (asistencia >= 60) {
      estilo = 'text-yellow-600';
    } else {
      estilo = 'text-red-600';
    }
    
    return <span className={`font-medium ${estilo}`}>{asistencia}%</span>;
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                {showEstudiante && (
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Estudiante
                  </th>
                )}
                {showGrupo && (
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Grupo
                  </th>
                )}
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Estado
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Calificación
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Asistencia
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
                  {showEstudiante && (
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div className="font-medium text-gray-900">
                        {matricula.estudiante?.nombres} {matricula.estudiante?.apellidos}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {matricula.estudiante?.codigo || 'Código no disponible'}
                      </div>
                      {matricula.estudiante?.programa && (
                        <div className="text-gray-500 text-xs">
                          {matricula.estudiante.programa.nombre}
                        </div>
                      )}
                    </td>
                  )}
                  
                  {showGrupo && (
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div className="font-medium text-gray-900">
                        {matricula.grupo?.nombre || 'Grupo no disponible'}
                      </div>
                      {matricula.grupo?.programa && (
                        <div className="text-gray-500 text-xs">
                          {matricula.grupo.programa.nombre}
                        </div>
                      )}
                      {matricula.grupo?.ciclo && (
                        <div className="text-gray-500 text-xs">
                          {matricula.grupo.ciclo.nombre}
                        </div>
                      )}
                    </td>
                  )}
                  
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {matricula.estado && getEstadoBadge(matricula.estado)}
                  </td>
                  
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {getCalificacionBadge(matricula.calificacionFinal)}
                  </td>
                  
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {getAsistenciaBadge(matricula.asistenciaPorcentaje)}
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
                        onClick={() => matricula.id && onDelete(matricula.id)}
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
