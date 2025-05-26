import React from 'react';
import type { ProgramacionHorario } from '../../api/config';

interface ProgramacionHorarioTableProps {
  horarios: ProgramacionHorario[];
  onEdit: (horario: ProgramacionHorario) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
  showActions?: boolean;
}

export const ProgramacionHorarioTable: React.FC<ProgramacionHorarioTableProps> = ({
  horarios,
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

  if (horarios.length === 0) {
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay horarios programados</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza programando un nuevo horario.
        </p>
      </div>
    );
  }

  // Función para formatear la hora en formato legible
  const formatHora = (hora: string) => {
    try {
      const [hours, minutes] = hora.split(':');
      return `${hours}:${minutes}`;
    } catch (error) {
      return hora;
    }
  };

  // Función para obtener el color del badge según el turno
  const getTurnoBadge = (turno: string) => {
    const turnos: Record<string, { bg: string; text: string }> = {
      'M1': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'M2': { bg: 'bg-blue-200', text: 'text-blue-900' },
      'M3': { bg: 'bg-blue-300', text: 'text-blue-900' },
      'T1': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'T2': { bg: 'bg-yellow-200', text: 'text-yellow-900' },
      'N1': { bg: 'bg-purple-100', text: 'text-purple-800' },
      'N2': { bg: 'bg-purple-200', text: 'text-purple-900' },
    };

    const estilo = turnos[turno] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estilo.bg} ${estilo.text}`}>
        {turno}
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
                  Día y Horario
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Grupo y Asignatura
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Docente
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Aula
                </th>
                {showActions && (
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Acciones</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {horarios.map((horario) => (
                <tr key={horario.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-3 py-4">
                    <div className="font-medium text-gray-900">
                      {horario.dia}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {formatHora(horario.hora_inicio)} - {formatHora(horario.hora_fin)}
                    </div>
                    <div className="mt-1">
                      {getTurnoBadge(horario.turno)}
                    </div>
                  </td>
                  
                  <td className="whitespace-nowrap px-3 py-4">
                    <div className="text-gray-900 font-medium">
                      {horario.grupo?.nombre || `Grupo ${horario.idGrupo}`}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {horario.asignatura?.nombre || `Asignatura ${horario.idAsignatura}`}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      Código: {horario.asignatura?.codigo || 'N/A'}
                    </div>
                  </td>
                  
                  <td className="whitespace-nowrap px-3 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">
                          {horario.docente?.nombres?.charAt(0) || 'D'}
                          {horario.docente?.apellidos?.charAt(0) || 'C'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {horario.docente ? 
                            `${horario.docente.nombres} ${horario.docente.apellidos}` : 
                            `Docente ${horario.idDocente}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {horario.docente?.email || 'Sin correo'}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="whitespace-nowrap px-3 py-4">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {horario.aula?.nombre || `Aula ${horario.idAula}`}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      Capacidad: {horario.aula?.capacidad || 'N/A'}
                    </div>
                  </td>
                  
                  {showActions && (
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onEdit(horario)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(horario.id!)}
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

export default ProgramacionHorarioTable;
