// src/Componentes/Sidebar.js
import React, { useContext, createContext, useState } from 'react';
import { MoreVertical, ChevronLast, ChevronFirst } from 'lucide-react';
import { Link } from 'react-router-dom';

const SidebarContext = createContext();

export default function Sidebar2({ children, isOpen, toggleSidebar, darkMode }) {
  const [expanded, setExpanded] = useState(isOpen);

  const handleToggle = () => {
    toggleSidebar();
    setExpanded(!expanded);
  };

  React.useEffect(() => {
    setExpanded(isOpen);
  }, [isOpen]);

  return (
    <aside className={`h-screen fixed lg:relative transition-all ${expanded ? 'left-0' : '-left-full'} lg:left-0 z-50`}>
      <nav className={`h-full flex flex-col transition-colors duration-500 ${darkMode ? 'bg-bgper text-white' : 'bg-white text-black'} border-r shadow-sm lg:shadow-none`}>
        <div className="p-4 pb-4 flex justify-center items-center">
          <img
            src="https://img.logoipsum.com/243.svg"
            className={`overflow-hidden transition-all ${expanded ? 'w-40 h-20' : 'w-0'}`}
            alt="Logo"
          />
        
          <button
            onClick={handleToggle}
            className={`p-1.5 rounded-lg `}
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">
            {children}
          </ul>
        </SidebarContext.Provider>

        <div className="border-t flex p-3">
          <img
            src="https://ui-avatars.com/api/?background=c7d2fe&color=3730a3&bold=true"
            alt="User Avatar"
            className="w-10 h-10 rounded-md"
          />
          <div className={`flex justify-between items-center overflow-hidden transition-all ${expanded ? 'w-52 ml-3' : 'w-0'}`}>
            <div className="leading-4">
              <h4 className="font-semibold">John Doe</h4>
              <span className="text-xs text-gray-600">johndoe@gmail.com</span>
            </div>
            <MoreVertical size={20} />
          </div>
        </div>
      </nav>

      {/* Botón para abrir la barra lateral en móviles */}
      <div className={`fixed bottom-4 left-4 lg:hidden ${expanded ? 'hidden' : 'block'}`}>
        <button
          onClick={handleToggle}
          className="p-2 rounded-full bg-red-600 text-white shadow-md hover:bg-black transition-colors"
        >
          <ChevronLast />
        </button>
      </div>
    </aside>
  );
}

// Componente para un elemento de la barra lateral
export function SidebarItem({ icon, text, active, alert, to }) {
  const { expanded } = useContext(SidebarContext);

  return (
    <li className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors duration-500 group ${active ? 'bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800' : 'hover:bg-indigo-50 text-gray-600'}`}>
      <Link to={to} className="flex items-center w-full" onClick={(e) => e.stopPropagation()}>
        {icon}
        <span className={`overflow-hidden transition-all ${expanded ? 'w-52 ml-8' : 'w-0'}`}>{text}</span>
      </Link>

      {alert && (
        <div className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${expanded ? '' : 'top-2'}`} />
      )}

      {!expanded && (
        <div className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible opacity-20 -translate-x-3 transition-all duration-500 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}>
          {text}
        </div>
      )}
    </li>
  );
}
