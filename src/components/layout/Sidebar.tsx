import { useState, type ReactNode } from 'react';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { FiChevronDown, FiChevronRight, FiHome, FiBook, FiCalendar, FiUsers, FiLayers, FiGrid, FiLogOut } from 'react-icons/fi';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactElement<{ className?: string }>;
  subItems?: NavItem[];
}

const navigation: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: <FiHome className="w-5 h-5" /> 
  },
  { 
    name: 'Académico', 
    href: '#', 
    icon: <FiBook className="w-5 h-5" />,
    subItems: [
      { name: 'Asignaturas', href: '/asignaturas', icon: <span className="w-1 h-1 rounded-full bg-current"></span> },
      { name: 'Ciclos', href: '/ciclos', icon: <span className="w-1 h-1 rounded-full bg-current"></span> },
      { name: 'Unidades Académicas', href: '/unidades-academicas', icon: <span className="w-1 h-1 rounded-full bg-current"></span> },
    ]
  },
  { 
    name: 'Personal', 
    href: '#', 
    icon: <FiUsers className="w-5 h-5" />,
    subItems: [
      { name: 'Docentes', href: '/docentes', icon: <span className="w-1 h-1 rounded-full bg-current"></span> },
      { name: 'Estudiantes', href: '/estudiantes', icon: <span className="w-1 h-1 rounded-full bg-current"></span> },
    ]
  },
  { 
    name: 'Gestión', 
    href: '#', 
    icon: <FiLayers className="w-5 h-5" />,
    subItems: [
      { name: 'Aulas', href: '/aulas', icon: <span className="w-1 h-1 rounded-full bg-current"></span> },
      { name: 'Grupos', href: '/grupos', icon: <span className="w-1 h-1 rounded-full bg-current"></span> },
      { name: 'Matrículas', href: '/matriculas', icon: <span className="w-1 h-1 rounded-full bg-current"></span> },
    ]
  },
  { 
    name: 'Horarios', 
    href: '#', 
    icon: <FiCalendar className="w-5 h-5" />,
    subItems: [
      { name: 'Programación General', href: '/programacion-general', icon: <span className="w-1 h-1 rounded-full bg-current"></span> },
      { name: 'Programación de Horarios', href: '/programacion-horarios', icon: <span className="w-1 h-1 rounded-full bg-current"></span> },
    ]
  },
];

interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  hasSubItems: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  children?: ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({
  item,
  isActive,
  hasSubItems,
  isExpanded,
  onToggle,
  children,
}) => {
  const ChevronIcon = isExpanded ? FiChevronDown : FiChevronRight;
  
  return (
    <div className="space-y-1">
      <Link
        to={item.href}
        onClick={(e: React.MouseEvent) => {
          if (hasSubItems) {
            e.preventDefault();
            onToggle();
          }
        }}
        className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-indigo-700 text-white'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
      >
        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
          {React.cloneElement(item.icon, {
            className: `h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`
          })}
        </span>
        <span className="ml-3">{item.name}</span>
        {hasSubItems && (
          <ChevronIcon className="ml-auto h-4 w-4 text-gray-400 group-hover:text-white transition-transform duration-200" />
        )}
      </Link>
      {children}
    </div>
  );
};

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (name: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const renderNavItem = (item: NavItem) => {
    const hasSubItems = !!item.subItems?.length;
    const isActive = location.pathname === item.href || 
      (item.subItems?.some(subItem => location.pathname.startsWith(subItem.href)) || false);
    const isExpanded = expandedItems[item.name] ?? isActive;

    return (
      <div key={item.name} className="space-y-1">
        <NavItem
          item={item}
          isActive={isActive}
          hasSubItems={hasSubItems}
          isExpanded={isExpanded}
          onToggle={() => toggleItem(item.name)}
        >
          {hasSubItems && isExpanded && (
            <div className="ml-8 mt-1 space-y-1">
              {item.subItems?.map((subItem) => (
                <Link
                  key={subItem.name}
                  to={subItem.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    location.pathname === subItem.href
                      ? 'text-indigo-200 bg-indigo-800/50'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center mr-2">
                    {subItem.icon}
                  </span>
                  {subItem.name}
                </Link>
              ))}
            </div>
          )}
        </NavItem>
      </div>
    );
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-700 bg-gray-800 h-screen sticky top-0">
        <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-between px-6 mb-8">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <FiGrid className="w-5 h-5" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-white">Sistema Académico</h1>
            </div>
          </div>
          <nav className="flex-1 px-3 space-y-1">
            {navigation.map(renderNavItem)}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center px-2 mb-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-medium">
                U
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Usuario</p>
              <p className="text-xs font-medium text-gray-400">Administrador</p>
            </div>
          </div>
          <button
            onClick={async () => {
              try {
                await logout();
                navigate('/login');
              } catch (error) {
                console.error('Error al cerrar sesión:', error);
              }
            }}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors duration-200"
          >
            <FiLogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};
        

export default Sidebar;
