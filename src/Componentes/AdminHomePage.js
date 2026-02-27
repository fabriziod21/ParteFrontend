import React, { useState } from 'react';
import Sidebar2, { SidebarItem } from './Sidebar2';
import {
  Grid,
  Box,
  BarChart2,
  Users,
  MessageCircle,
  FileText,
  Sun,
  Moon,
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  MapPin,
  Phone,
  Mail,
  Edit3,
  Save,
  X,
  Truck,
  Tags,
  FileSpreadsheet,
  ShoppingBag
} from 'lucide-react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Productos from './Productos';
import Clientes from './Clientes';
import Inventario from './Inventario';
import Dashboard from './Dashboard';
import Footer from "./Footer";
import Coments from './Coments';
import Proveedores from './Proveedores';
import Categorias from './Categorias';
import Reports from './Reports';
import Modal from 'react-bootstrap/Modal';
const AdminHomePage = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isProfileEditable, setIsProfileEditable] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState({
    nombre: user?.nombre || "",
    direccion: user?.direccion || "",
    celular: user?.telefono || "",
    email: user?.correo || "",
  });

  const handleProfileClose = () => {
    setShowProfileModal(false);
    setIsProfileEditable(false);
  };
  const handleProfileShow = () => {
    setShowProfileModal(true);
    setShowDropdown(false);
  };
  const toggleProfileEdit = () => setIsProfileEditable(prev => !prev);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  const handleSave = () => {
    console.log('Updated user data:', userData);
    setIsProfileEditable(false);
  };

  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem('darkMode', newMode);
      return newMode;
    });
  };

  // Estilos reutilizables
  const navStyle = {
    background: darkMode
      ? 'linear-gradient(180deg, #0a0a0a 0%, #141414 100%)'
      : 'linear-gradient(180deg, #ffffff 0%, #f8f8f8 100%)',
    borderBottom: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0,0,0,0.08)'}`,
    boxShadow: darkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0,0,0,0.05)'
  };

  const inputStyle = {
    background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`,
    color: darkMode ? '#ffffff' : '#1a1a1a'
  };

  return (
    <div className={`flex h-screen transition-colors duration-500 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <Sidebar2
        isOpen={isOpen}
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
        user={user}
        onLogout={handleLogoutClick}
        className={`${isOpen ? 'block w-64' : 'hidden'} md:block md:w-64`}
      >
        <SidebarItem icon={<Grid />} text="Dashboard" to="/adminhomepage/dashboard" />
        <SidebarItem icon={<Box />} text="Productos" to="/adminhomepage/productos" />
        <SidebarItem icon={<BarChart2 />} text="Inventario" to="/adminhomepage/inventario" />
        <SidebarItem icon={<Users />} text="Clientes" to="/adminhomepage/clientes" />
        <SidebarItem icon={<MessageCircle />} text="Comentarios" to="/adminhomepage/coments" />
        <SidebarItem icon={<Truck />} text="Proveedores" to="/adminhomepage/proveedores" />
        <SidebarItem icon={<Tags />} text="Categorias" to="/adminhomepage/categorias" />
        <SidebarItem icon={<FileSpreadsheet />} text="Reportes" to="/adminhomepage/reportes" />
      </Sidebar2>
      <div className={`flex-1 transition-all duration-300 overflow-y-auto h-full`}>
        {/* Navigation Bar - Luxury Style */}
        <nav className="sticky top-0 z-40 px-6 py-4" style={navStyle}>
          <div className="flex items-center justify-between">
            {/* Left Side - Search */}
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
                />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-xl w-64 focus:outline-none transition-all focus:w-80"
                  style={{
                    ...inputStyle,
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="relative w-14 h-8 rounded-full transition-all duration-300 flex items-center"
                style={{
                  background: darkMode
                    ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
                    : 'linear-gradient(135deg, #e8e8e8 0%, #d0d0d0 100%)',
                  border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(0,0,0,0.1)'}`,
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div
                  className="absolute w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    background: darkMode
                      ? 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)'
                      : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    left: darkMode ? '26px' : '2px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  {darkMode ? (
                    <Moon size={14} className="text-black" />
                  ) : (
                    <Sun size={14} className="text-white" />
                  )}
                </div>
              </button>

              {/* Notifications */}
              <button
                className="relative p-2.5 rounded-xl transition-all hover:scale-105"
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`
                }}
              >
                <Bell size={20} style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }} />
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: '#ef4444', color: '#ffffff' }}
                >
                  3
                </span>
              </button>

              {/* Store Button */}
              <button
                onClick={() => navigate('/homepage')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  color: '#a78bfa'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0.15) 100%)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <ShoppingBag size={18} />
                <span className="hidden md:inline text-sm font-semibold">Tienda</span>
              </button>

              {/* Divider */}
              <div
                className="h-8 w-px mx-2"
                style={{ background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
              />

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:scale-[1.02]"
                  style={{
                    background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.08)'}`
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
                      color: '#0a0a0a'
                    }}
                  >
                    {user?.nombre?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}
                    >
                      {user?.nombre || 'Administrador'}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
                    >
                      Admin
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className="hidden md:block transition-transform"
                    style={{
                      color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                      transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDropdown(false)}
                    />
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden z-50"
                      style={{
                        background: darkMode
                          ? 'linear-gradient(145deg, rgba(20, 20, 20, 0.98) 0%, rgba(15, 15, 15, 0.99) 100%)'
                          : 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%)',
                        border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`,
                        boxShadow: darkMode
                          ? '0 20px 40px rgba(0, 0, 0, 0.5)'
                          : '0 10px 30px rgba(0,0,0,0.1)'
                      }}
                    >
                      {/* User Info */}
                      <div
                        className="px-4 py-3"
                        style={{
                          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                        }}
                      >
                        <p
                          className="font-semibold text-sm"
                          style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}
                        >
                          {user?.nombre || 'Administrador'}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: '#d4af37' }}
                        >
                          {user?.correo || 'admin@morvic.com'}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={handleProfileShow}
                          className="w-full flex items-center gap-3 px-4 py-2.5 transition-all"
                          style={{ color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = darkMode ? 'rgba(212, 175, 55, 0.1)' : 'rgba(0,0,0,0.05)';
                            e.currentTarget.style.color = '#d4af37';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
                          }}
                        >
                          <User size={18} />
                          <span className="text-sm">Mi Perfil</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            navigate('/adminhomepage/settings');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 transition-all"
                          style={{ color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = darkMode ? 'rgba(212, 175, 55, 0.1)' : 'rgba(0,0,0,0.05)';
                            e.currentTarget.style.color = '#d4af37';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
                          }}
                        >
                          <Settings size={18} />
                          <span className="text-sm">Configuracion</span>
                        </button>
                      </div>

                      {/* Logout */}
                      <div
                        style={{
                          borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                        }}
                      >
                        <button
                          onClick={handleLogoutClick}
                          className="w-full flex items-center gap-3 px-4 py-3 transition-all"
                          style={{ color: '#ef4444' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <LogOut size={18} />
                          <span className="text-sm font-medium">Cerrar Sesion</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Profile Modal - Luxury Style */}
        <Modal show={showProfileModal} onHide={handleProfileClose} centered>
          <div
            style={{
              background: darkMode ? '#0a0a0a' : '#ffffff',
              borderRadius: '20px',
              overflow: 'hidden',
              border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`
            }}
          >
            {/* Modal Header */}
            <div
              className="relative px-6 py-8 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)',
                borderBottom: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`
              }}
            >
              {/* Close Button */}
              <button
                onClick={handleProfileClose}
                className="absolute top-4 right-4 p-2 rounded-lg transition-all hover:scale-105"
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                }}
              >
                <X size={18} style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }} />
              </button>

              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mx-auto"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
                    color: '#0a0a0a',
                    boxShadow: '0 8px 30px rgba(212, 175, 55, 0.4)'
                  }}
                >
                  {user?.nombre?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div
                  className="absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    background: '#22c55e',
                    border: `3px solid ${darkMode ? '#0a0a0a' : '#ffffff'}`
                  }}
                />
              </div>

              <h3
                className="text-xl font-bold"
                style={{ color: darkMode ? '#ffffff' : '#1a1a1a', fontFamily: "'Playfair Display', serif" }}
              >
                {user?.nombre || 'Administrador'}
              </h3>
              <p className="text-sm" style={{ color: '#d4af37' }}>
                Administrador del Sistema
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Nombre */}
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: '#d4af37' }}
                >
                  <User size={14} />
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={userData.nombre}
                  onChange={handleProfileChange}
                  readOnly={!isProfileEditable}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                  style={{
                    ...inputStyle,
                    opacity: isProfileEditable ? 1 : 0.7,
                    cursor: isProfileEditable ? 'text' : 'not-allowed'
                  }}
                  placeholder="Escribe tu nombre"
                />
              </div>

              {/* Direccion */}
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: '#d4af37' }}
                >
                  <MapPin size={14} />
                  Direccion
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={userData.direccion}
                  onChange={handleProfileChange}
                  readOnly={!isProfileEditable}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                  style={{
                    ...inputStyle,
                    opacity: isProfileEditable ? 1 : 0.7,
                    cursor: isProfileEditable ? 'text' : 'not-allowed'
                  }}
                  placeholder="Escribe tu direccion"
                />
              </div>

              {/* Celular */}
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: '#d4af37' }}
                >
                  <Phone size={14} />
                  Celular
                </label>
                <input
                  type="text"
                  name="celular"
                  value={userData.celular}
                  onChange={handleProfileChange}
                  readOnly={!isProfileEditable}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                  style={{
                    ...inputStyle,
                    opacity: isProfileEditable ? 1 : 0.7,
                    cursor: isProfileEditable ? 'text' : 'not-allowed'
                  }}
                  placeholder="Escribe tu celular"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: '#d4af37' }}
                >
                  <Mail size={14} />
                  Correo Electronico
                </label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleProfileChange}
                  readOnly={!isProfileEditable}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                  style={{
                    ...inputStyle,
                    opacity: isProfileEditable ? 1 : 0.7,
                    cursor: isProfileEditable ? 'text' : 'not-allowed'
                  }}
                  placeholder="Escribe tu correo"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="flex items-center justify-between gap-3 p-6"
              style={{
                borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
              }}
            >
              <button
                onClick={handleProfileClose}
                className="flex-1 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                }}
              >
                Cancelar
              </button>

              <button
                onClick={isProfileEditable ? handleSave : toggleProfileEdit}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                style={{
                  background: isProfileEditable
                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                    : 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
                  color: isProfileEditable ? '#ffffff' : '#0a0a0a',
                  boxShadow: isProfileEditable
                    ? '0 4px 15px rgba(34, 197, 94, 0.3)'
                    : '0 4px 15px rgba(212, 175, 55, 0.3)'
                }}
              >
                {isProfileEditable ? (
                  <>
                    <Save size={18} />
                    Guardar
                  </>
                ) : (
                  <>
                    <Edit3 size={18} />
                    Editar Perfil
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>

        <Routes>
          <Route path="/productos" element={<Productos darkMode={darkMode} />} />
          <Route path="/clientes" element={<Clientes darkMode={darkMode} />} />
          <Route path="/inventario" element={<Inventario darkMode={darkMode} />} />
          <Route path="/dashboard" element={<Dashboard darkMode={darkMode} />} />
          <Route path="/coments" element={<Coments darkMode={darkMode} />} />
          <Route path="/proveedores" element={<Proveedores darkMode={darkMode} />} />
          <Route path="/categorias" element={<Categorias darkMode={darkMode} />} />
          <Route path="/reportes" element={<Reports darkMode={darkMode} />} />
        </Routes>
        <div className={`bg-gray-900 text-white ${darkMode ? 'bg-gray-900' : 'bg-gray-800'}`}>
          <Footer darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;

