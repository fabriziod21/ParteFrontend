import React, { useContext, createContext, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LogOut, Settings, Watch } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const SidebarContext = createContext();

export default function Sidebar2({ children, isOpen, toggleSidebar, darkMode, user, onLogout }) {
  // Persistir estado en localStorage
  const [expanded, setExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebarExpanded');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const handleToggle = () => {
    const newState = !expanded;
    setExpanded(newState);
    localStorage.setItem('sidebarExpanded', JSON.stringify(newState));
    if (toggleSidebar) toggleSidebar();
  };

  // Sincronizar con prop isOpen solo en móvil
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setExpanded(isOpen);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  return (
    <aside
      className="h-screen lg:relative z-50 flex-shrink-0"
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        width: expanded ? '260px' : '72px',
        minWidth: expanded ? '260px' : '72px',
        transition: 'width 0.3s ease, min-width 0.3s ease'
      }}
    >
      <nav
        className="h-full flex flex-col"
        style={{
          background: darkMode
            ? 'linear-gradient(180deg, #0a0a0a 0%, #141414 50%, #0a0a0a 100%)'
            : 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 50%, #ffffff 100%)',
          borderRight: darkMode
            ? '1px solid rgba(212, 175, 55, 0.2)'
            : '1px solid rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}
      >
        {/* Header / Logo */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            borderBottom: darkMode ? '1px solid rgba(212, 175, 55, 0.15)' : '1px solid rgba(0, 0, 0, 0.08)',
            height: '72px',
            padding: expanded ? '0 16px' : '0 12px'
          }}
        >
          {expanded ? (
            <div className="flex items-center gap-3 w-full">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)' }}
              >
                <Watch className="w-5 h-5 text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <h2
                  className="font-bold text-lg tracking-wide"
                  style={{ color: '#d4af37', fontFamily: "'Playfair Display', serif" }}
                >
                  MORVIC
                </h2>
                <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Admin Panel</span>
              </div>
              <button
                onClick={handleToggle}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 hover:scale-105"
                style={{
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  color: '#d4af37',
                  transition: 'all 0.3s ease'
                }}
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleToggle}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
                transition: 'all 0.3s ease'
              }}
            >
              <Watch className="w-5 h-5 text-black" />
            </button>
          )}
        </div>

        {/* Menu Label */}
        <div
          className="flex-shrink-0"
          style={{
            height: expanded ? '48px' : '16px',
            padding: expanded ? '16px 20px' : '8px 0',
            overflow: 'hidden'
          }}
        >
          {expanded && (
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: darkMode ? 'rgba(212, 175, 55, 0.5)' : 'rgba(180, 140, 20, 0.7)' }}
            >
              Menu Principal
            </span>
          )}
        </div>

        {/* Menu Items */}
        <SidebarContext.Provider value={{ expanded, darkMode }}>
          <ul
            className="flex-1 space-y-1"
            style={{
              padding: expanded ? '0 12px' : '0 8px',
              overflowY: 'auto',
              overflowX: 'hidden',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {children}
          </ul>
        </SidebarContext.Provider>

        {/* Divider */}
        <div
          className="flex-shrink-0"
          style={{
            height: '1px',
            margin: '8px 16px',
            background: darkMode
              ? 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent)'
          }}
        />

        {/* Settings Link */}
        <div
          className="flex-shrink-0"
          style={{ padding: expanded ? '0 12px 8px' : '0 8px 8px' }}
        >
          <Link
            to="/adminhomepage/settings"
            className="flex items-center rounded-xl group"
            style={{
              color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
              height: '44px',
              padding: expanded ? '0 16px' : '0',
              justifyContent: expanded ? 'flex-start' : 'center',
              gap: expanded ? '12px' : '0',
              transition: 'all 0.3s ease'
            }}
          >
            <Settings size={20} className="flex-shrink-0 transition-colors group-hover:text-[#d4af37]" />
            {expanded && <span>Configuracion</span>}
          </Link>
        </div>

        {/* User Profile Section */}
        <div
          className="flex-shrink-0 rounded-xl"
          style={{
            margin: expanded ? '0 12px 12px' : '0 8px 8px',
            padding: expanded ? '12px' : '10px 8px',
            background: darkMode
              ? 'linear-gradient(145deg, rgba(20, 20, 20, 0.8) 0%, rgba(15, 15, 15, 0.9) 100%)'
              : 'linear-gradient(145deg, rgba(245, 245, 245, 0.9) 0%, rgba(235, 235, 235, 0.95) 100%)',
            border: darkMode ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)'
          }}
        >
          <div
            className="flex items-center"
            style={{
              gap: expanded ? '12px' : '0',
              justifyContent: expanded ? 'flex-start' : 'center'
            }}
          >
            <div className="relative flex-shrink-0">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
                  color: '#0a0a0a'
                }}
              >
                {user?.nombre?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div
                className="absolute w-2.5 h-2.5 rounded-full"
                style={{
                  bottom: '0',
                  right: '0',
                  background: '#22c55e',
                  border: darkMode ? '2px solid #141414' : '2px solid #f5f5f5'
                }}
              />
            </div>

            {expanded && (
              <>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {user?.nombre || 'Administrador'}
                  </h4>
                  <span className="text-xs truncate block" style={{ color: darkMode ? 'rgba(212, 175, 55, 0.7)' : 'rgba(180, 140, 20, 0.9)' }}>
                    {user?.correo || 'admin@morvic.com'}
                  </span>
                </div>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 hover:scale-105"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      transition: 'all 0.3s ease'
                    }}
                    title="Cerrar sesion"
                  >
                    <LogOut size={14} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Toggle Button */}
      <div className={`fixed bottom-6 left-6 lg:hidden ${expanded ? 'hidden' : 'block'}`}>
        <button
          onClick={handleToggle}
          className="p-4 rounded-full shadow-lg hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
            boxShadow: '0 8px 25px rgba(212, 175, 55, 0.4)',
            transition: 'all 0.3s ease'
          }}
        >
          <ChevronRight className="text-black" size={24} />
        </button>
      </div>

      {/* CSS para ocultar scrollbar */}
      <style>{`
        ul::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </aside>
  );
}

export function SidebarItem({ icon, text, to, alert }) {
  const { expanded, darkMode } = useContext(SidebarContext);
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <li className="relative group">
      <Link
        to={to}
        className="flex items-center rounded-xl"
        style={{
          background: isActive
            ? (darkMode
                ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%)')
            : 'transparent',
          border: isActive
            ? (darkMode ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(212, 175, 55, 0.4)')
            : '1px solid transparent',
          color: isActive ? '#d4af37' : (darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'),
          height: '44px',
          padding: expanded ? '0 16px' : '0',
          justifyContent: expanded ? 'flex-start' : 'center',
          gap: expanded ? '12px' : '0',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Icon Container */}
        <div
          className={`flex items-center justify-center flex-shrink-0 ${!isActive ? 'group-hover:text-[#d4af37]' : ''}`}
          style={{
            color: isActive ? '#d4af37' : 'inherit',
            width: '20px',
            height: '20px',
            transition: 'color 0.3s ease'
          }}
        >
          {React.cloneElement(icon, { size: 20, strokeWidth: isActive ? 2 : 1.5 })}
        </div>

        {/* Text */}
        {expanded && (
          <span className="font-medium whitespace-nowrap flex-1">
            {text}
          </span>
        )}

        {/* Active Indicator */}
        {isActive && expanded && (
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: '#d4af37' }}
          />
        )}

        {/* Alert Badge */}
        {alert && (
          <div
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: '#ef4444',
              top: expanded ? '50%' : '8px',
              right: expanded ? '16px' : '8px',
              transform: expanded ? 'translateY(-50%)' : 'none'
            }}
          />
        )}
      </Link>

      {/* Tooltip (when collapsed) */}
      {!expanded && (
        <div
          className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap invisible opacity-0 -translate-x-2 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 z-50 pointer-events-none"
          style={{
            background: darkMode ? '#1a1a1a' : '#ffffff',
            border: darkMode ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(212, 175, 55, 0.5)',
            color: '#d4af37',
            boxShadow: darkMode ? '0 4px 15px rgba(0, 0, 0, 0.5)' : '0 4px 15px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s ease'
          }}
        >
          {text}
        </div>
      )}
    </li>
  );
}
