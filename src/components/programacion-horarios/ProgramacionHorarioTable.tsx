import { useState } from 'react';
import type { ProgramacionHorario, Grupo, Asignatura, Docente, Aula } from '../../api/config';

type HorarioFormData = {
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  turno: string;
  id_grupo: number;
  id_asignatura: number;
  id_docente: number;
  id_aula: number;
};
import { 
  FiEdit2, 
  FiTrash2, 
  FiCalendar
} from 'react-icons/fi';
import { DeleteModal } from '../modales/DeleteModal';
import ProgramacionHorarioForm from './ProgramacionHorarioForm';



interface CellRendererProps<T> {
  row: {
    original: T;
  };
  value: any;
}

interface Column<D> {
  Header: string;
  accessor: keyof D | string;
  Cell?: (props: CellRendererProps<D>) => React.ReactNode;
}

interface ProgramacionHorarioTableProps {
  data: ProgramacionHorario[];
  onEdit: (horario: ProgramacionHorario) => void;
  onDelete: (id: number) => Promise<void>;
  grupos: Grupo[];
  asignaturas: Asignatura[];
  docentes: Docente[];
  aulas: Aula[];
  isLoading?: boolean;
}

export const ProgramacionHorarioTable: React.FC<ProgramacionHorarioTableProps> = ({
  data,
  onEdit,
  onDelete,
  isLoading = false,
  grupos = [],
  asignaturas = [],
  docentes = [],
  aulas = [],
}) => {
  const [editingHorario, setEditingHorario] = useState<ProgramacionHorario | null>(null);
  const [deletingHorario, setDeletingHorario] = useState<ProgramacionHorario | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const columns: Column<ProgramacionHorario>[] = [
    {
      Header: 'ID',
      accessor: 'id',
      Cell: ({ value }) => <>{value || ''}</>,
    },
    {
      Header: 'Día',
      accessor: 'dia',
      Cell: ({ value }) => <>{value || ''}</>,
    },
    {
      Header: 'Hora Inicio',
      accessor: 'hora_inicio',
      Cell: ({ value }) => <>{typeof value === 'string' ? value.substring(0, 5) : ''}</>,
    },
    {
      Header: 'Hora Fin',
      accessor: 'hora_fin',
      Cell: ({ value }) => <>{typeof value === 'string' ? value.substring(0, 5) : ''}</>,
    },
    {
      Header: 'Turno',
      accessor: 'turno',
      Cell: ({ value }) => <>{value || ''}</>,
    },
    {
      Header: 'Grupo',
      accessor: 'grupo',
      Cell: ({ row }) => {
        // Usar el objeto grupo incluido en la respuesta de la API
        if (row.original.grupo && typeof row.original.grupo === 'object') {
          return <>{row.original.grupo.nombre || `ID: ${row.original.idGrupo || row.original.id_grupo}`}</>;
        }
        // Si no está incluido, buscar por ID
        const grupo = grupos.find(g => g.id === (row.original.idGrupo || row.original.id_grupo));
        return <>{grupo?.nombre || `ID: ${row.original.idGrupo || row.original.id_grupo}`}</>;
      },
    },
    {
      Header: 'Asignatura',
      accessor: 'asignatura',
      Cell: ({ row }) => {
        // Usar el objeto asignatura incluido en la respuesta de la API
        if (row.original.asignatura && typeof row.original.asignatura === 'object') {
          return <>{row.original.asignatura.nombre || `ID: ${row.original.idAsignatura || row.original.id_asignatura}`}</>;
        }
        // Si no está incluido, buscar por ID
        const asignatura = asignaturas.find(a => a.id === (row.original.idAsignatura || row.original.id_asignatura));
        return <>{asignatura?.nombre || `ID: ${row.original.idAsignatura || row.original.id_asignatura}`}</>;
      },
    },
    {
      Header: 'Docente',
      accessor: 'docente',
      Cell: ({ row }) => {
        // Usar el objeto docente incluido en la respuesta de la API
        if (row.original.docente && typeof row.original.docente === 'object') {
          const nombres = row.original.docente.nombres || '';
          const apellidos = row.original.docente.apellidos || '';
          return <>{`${nombres} ${apellidos}`.trim() || `ID: ${row.original.idDocente || row.original.id_docente}`}</>;
        }
        // Si no está incluido, buscar por ID
        const docente = docentes.find(d => d.id === (row.original.idDocente || row.original.id_docente));
        return <>{docente ? `${docente.nombres || ''} ${docente.apellidos || ''}`.trim() : `ID: ${row.original.idDocente || row.original.id_docente}`}</>;
      },
    },
    {
      Header: 'Aula',
      accessor: 'aula',
      Cell: ({ row }) => {
        // Usar el objeto aula incluido en la respuesta de la API
        if (row.original.aula && typeof row.original.aula === 'object') {
          return <>{row.original.aula.nombre || `ID: ${row.original.idAula || row.original.id_aula}`}</>;
        }
        // Si no está incluido, buscar por ID
        const aula = aulas.find(a => a.id === (row.original.idAula || row.original.id_aula));
        return <>{aula?.nombre || `ID: ${row.original.idAula || row.original.id_aula}`}</>;
      },
    },
  ];

  const handleEditClick = (horario: ProgramacionHorario) => {
    setEditingHorario(horario);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (horario: ProgramacionHorario) => {
    setDeletingHorario(horario);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingHorario?.id) {
      try {
        await onDelete(deletingHorario.id);
        setIsDeleteModalOpen(false);
        setDeletingHorario(null);
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  const handleSaveEdit = async (data: HorarioFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      if (editingHorario) {
        await onEdit({ ...editingHorario, ...data } as ProgramacionHorario);
        setIsEditModalOpen(false);
        setEditingHorario(null);
        return { success: true };
      }
      return { success: false, error: 'No se pudo actualizar el horario' };
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido al guardar' 
      };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay horarios programados</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza creando un nuevo horario.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 relative">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-75">
            <tr>
              {columns.map((column) => (
                <th key={column.Header} scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tl-2xl">
                  {column.Header}
                </th>
              ))}
              <th scope="col" className="relative px-6 py-4 rounded-tr-2xl">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.map((horario) => (
              <tr key={horario.id} className="group bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-sm">
                {columns.map((column) => {
                  const value = column.accessor in horario 
                    ? horario[column.accessor as keyof ProgramacionHorario] 
                    : '';
                  return (
                    <td key={column.Header} className="px-6 py-5 whitespace-nowrap">
                      {column.Cell 
                        ? column.Cell({ row: { original: horario }, value })
                        : String(value)}
                    </td>
                  );
                })}
                <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => handleEditClick(horario)}
                      className="text-blue-600 hover:text-blue-900 mr-3 focus:outline-none"
                      title="Editar"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(horario)}
                      className="text-red-600 hover:text-red-900 focus:outline-none"
                      title="Eliminar"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer */}
      <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-100 rounded-b-2xl">
        <div className="text-sm text-gray-500">
          Mostrando <span className="font-medium">{data.length}</span> de <span className="font-medium">{data.length}</span> horarios
        </div>
        <div className="flex space-x-2">
          <button 
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
          >
            Anterior
          </button>
          <button 
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Siguiente
          </button>
        </div>
      </div>
      
      {/* Modal de edición */}
      {isEditModalOpen && editingHorario && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Editar Programación de Horario</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <ProgramacionHorarioForm
                initialData={editingHorario}
                onSave={handleSaveEdit}
                onCancel={() => setIsEditModalOpen(false)}
                isEditing={true}
                grupos={grupos}
                asignaturas={asignaturas}
                docentes={docentes}
                aulas={aulas}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        scheduleName={`${deletingHorario?.dia || ''} ${deletingHorario?.hora_inicio || ''} - ${deletingHorario?.hora_fin || ''}`}
      />

    </div>
  );
};

export default ProgramacionHorarioTable;
