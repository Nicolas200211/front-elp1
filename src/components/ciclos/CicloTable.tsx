import React from 'react';
import type { Ciclo } from '../../api/config';

interface CicloTableProps {
  ciclos: Ciclo[];
  onEdit: (ciclo: Ciclo) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

const CicloTable: React.FC<CicloTableProps> = ({
  ciclos,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const formatDate = (dateString: string | undefined): string => {
    console.log('Formateando fecha:', dateString);
    if (!dateString) return 'No definida';
    
    try {
      // Asegurarse de que la fecha esté en formato ISO
      // Si viene en formato 'YYYY-MM-DD HH:MM:SS', convertirlo a 'YYYY-MM-DDTHH:MM:SS'
      const isoDateString = dateString.includes(' ') 
        ? dateString.replace(' ', 'T') 
        : dateString;
      
      console.log('Fecha convertida a ISO:', isoDateString);
      const date = new Date(isoDateString);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.warn('Fecha inválida:', dateString, 'ISO:', isoDateString);
        return 'Fecha inválida';
      }
      
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      
      const formattedDate = date.toLocaleString('es-ES', options);
      console.log('Fecha formateada:', formattedDate);
      return formattedDate;
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      console.log('Fecha que causó el error:', dateString);
      return 'Error en fecha';
    }
  };
  
  // Log de los ciclos recibidos
  console.log('Ciclos recibidos en la tabla:', ciclos);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (ciclos.length === 0) {
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay ciclos registrados</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza creando un nuevo ciclo académico.
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
                  Año - Período
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Fechas
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {ciclos.map((ciclo) => (
                <tr key={ciclo.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    <div className="font-medium">{ciclo.anio} - {ciclo.periodo}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div>Creado: {formatDate(ciclo.createdAt)}</div>
                    <div>Actualizado: {formatDate(ciclo.updatedAt)}</div>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex items-center space-x-2 justify-end">
                      <button
                        onClick={() => ciclo.id && onEdit(ciclo)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => ciclo.id && onDelete(ciclo.id)}
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

export default CicloTable;
