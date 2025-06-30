import { FiAlertTriangle, FiX } from 'react-icons/fi';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  scheduleName: string;
}

export function DeleteModal({ isOpen, onClose, onConfirm, scheduleName }: DeleteModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 z-50 transition-opacity duration-300"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3">
                <FiAlertTriangle size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Confirmar eliminación</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
              aria-label="Cerrar"
            >
              <FiX size={24} />
            </button>
          </div>
          
          <div className="my-6">
            <p className="text-gray-600 mb-2">
              ¿Estás seguro de que deseas eliminar el horario de:
            </p>
            <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-lg">
              {scheduleName}
            </p>
            <p className="mt-3 text-sm text-red-600">
              Esta acción no se puede deshacer.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center"
            >
              <FiAlertTriangle className="mr-2" size={16} />
              Sí, eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
