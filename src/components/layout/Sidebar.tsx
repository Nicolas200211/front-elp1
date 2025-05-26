import React from 'react';
import { Link, useLocation } from 'react-router';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { name: 'Asignaturas', href: '/asignaturas', icon: '📚' },
  { name: 'Aulas', href: '/aulas', icon: '🏢' },
  { name: 'Ciclos', href: '/ciclos', icon: '🔄' },
  { name: 'Docentes', href: '/docentes', icon: '👨‍🏫' },
  { name: 'Estudiantes', href: '/estudiantes', icon: '👥' },
  { name: 'Grupos', href: '/grupos', icon: '👥' },
  { name: 'Matrículas', href: '/matriculas', icon: '📝' },
  { name: 'Programación General', href: '/programacion-general', icon: '📋' },
  { name: 'Programación de Horarios', href: '/programacion-horarios', icon: '📅' },
  { name: 'Unidades Académicas', href: '/unidades-academicas', icon: '🏛️' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-gray-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-white text-xl font-bold">Pontificia</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    location.pathname === item.href
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex bg-gray-700 p-4">
            <div className="flex items-center">
              <div>
                <div className="text-base font-medium text-white">Usuario</div>
                <div className="text-sm font-medium text-gray-400">Administrador</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
