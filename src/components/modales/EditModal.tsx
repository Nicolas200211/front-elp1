import { useState, useEffect, type ReactNode } from 'react';
import { FiX } from 'react-icons/fi';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
}

const sizeClasses = {
  sm: 'max-w-[32rem]',
  md: 'max-w-[48rem]',
  lg: 'max-w-[64rem]',
  xl: 'max-w-[80rem]',
};

export function EditModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  isLoading = false,
}: EditModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  if (!isMounted) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${isVisible ? 'bg-black/50' : 'bg-transparent pointer-events-none'}`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-white rounded-lg shadow-2xl transform transition-all duration-200 ease-in-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        } w-[95vw] ${sizeClasses[size]} max-h-[90vh] flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClose}
            disabled={isLoading}
          >
            <span className="sr-only">Cerrar</span>
            <FiX className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="h-full overflow-y-auto pr-2 -mr-2">
            {children}
          </div>
        </div>
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}
