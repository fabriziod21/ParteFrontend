import React, { useState } from 'react';
import Sidebar2, { SidebarItem } from './Sidebar2';
import { Grid, Box, BarChart2, Users } from 'lucide-react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Productos from './Productos';
import Clientes from './Clientes';
import Inventario from './Inventario';
import Dashboard from './Dashboard';
import Footer from "./Footer";
import { MessageCircle, FileText, Package } from 'lucide-react';
import Coments from './Coments';
import { Image } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import img from '../imagenes/sd.jpeg';
import Container from 'react-bootstrap/Container';
import Dropdown from 'react-bootstrap/Dropdown';

const AdminHomePage = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isProfileEditable, setIsProfileEditable] = useState(false);
  const [userData, setUserData] = useState({
    nombre: user?.nombre || "",
    direccion: user?.direccion || "",
    celular: user?.telefono || "",
    email: user?.correo || "",
  });


  const handleProfileClose = () => setShowProfileModal(false);
  const handleProfileShow = () => setShowProfileModal(true);
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

  return (
    <div className={`flex h-screen transition-colors duration-500 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <Sidebar2
        isOpen={isOpen}
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
        className={`${isOpen ? 'block w-64' : 'hidden'} md:block md:w-64`}
      >
        <SidebarItem icon={<Grid />} text="Dashboard" to="/adminhomepage/dashboard" />
        <SidebarItem icon={<Box />} text="Productos" to="/adminhomepage/productos" />
        <SidebarItem icon={<BarChart2 />} text="Inventario" to="/adminhomepage/inventario" />
        <SidebarItem icon={<Users />} text="Clientes" to="/adminhomepage/clientes" />
        <SidebarItem icon={< MessageCircle />} text="Comentarios" to="/adminhomepage/coments" />
        <SidebarItem icon={< Package />} text="Proveedores y Categorias" to="" />
        <SidebarItem icon={< FileText />} text="Reportes" to="" />
      </Sidebar2>
      <div className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-21' : 'mr-0'} overflow-y-auto h-full`}>
        <nav className={`navbar navbar-expand-lg transition-colors duration-500 ${darkMode ? 'bg-dark text-white' : 'bg-light text-dark'} p-3`}>
          <div className="container-fluid d-flex justify-content-between align-items-center">
            <a className="navbar-brand" href="/"></a>

            <div className="d-flex align-items-center ms-auto">
              <div className="d-flex align-items-center me-3">
                <label htmlFor="darkModeSwitch" className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="darkModeSwitch"
                    className="sr-only peer"
                    checked={darkMode}
                    onChange={toggleDarkMode}
                  />
                  <div className={`group peer ring-0 bg-gradient-to-bl from-white via-cyan-500 to-cyan-700 rounded-full outline-none duration-1000 after:duration-300 w-20 h-10 shadow-md peer-focus:outline-none
    after:content-[''] after:rounded-full after:absolute after:bg-[#0D2B39] 
    peer-checked:after:rotate-180 after:bg-[conic-gradient(from_135deg,_#b2a9a9,_#b2a8a8,_#ffffff,_#d7dbd9_,_#ffffff,_#b2a8a8)] 
    after:outline-none after:h-8 after:w-8 after:top-1 after:left-1
    peer-checked:after:translate-x-9 peer-hover:after:scale-95 peer-checked:bg-gradient-to-r peer-checked:from-red-600 peer-checked:to-black`}>
                  </div>
                </label>

                <span
                  className={`ml-2 text-lg font-semibold transition-all ${darkMode ? 'text-red-600' : 'text-cyan-500'}`}
                  style={{ minWidth: '140px', textAlign: 'center' }}
                >
                  {darkMode ? 'Modo Oscuro' : 'Modo Claro'}
                </span>
              </div>

              <div className="profile-container d-flex align-items-center">
                <Image
                  src={img}
                  roundedCircle
                  className="profile-image me-2"
                  onClick={handleProfileShow}
                  style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                />
                <Dropdown className="dropdown-container">
                  <Dropdown.Toggle variant="link" className="p-0">
                    <span className="dropdown-arrow"></span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={handleProfileShow}>Perfil de Usuario</Dropdown.Item>
                    <Dropdown.Item onClick={handleLogoutClick}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </div>
        </nav>

        <Modal show={showProfileModal} onHide={handleProfileClose} className="profile-modal ">
          <Modal.Header closeButton className={`${darkMode ? 'bg-fondo text-white' : 'bg-white text-black'} `}>
            <Modal.Title className={`text-lg font-semibold ${darkMode ? ' text-white' : ' text-black'} `}>Perfil de Usuario</Modal.Title>
          </Modal.Header>
          <Modal.Body className={`${darkMode ? ' bg-bgper' : ' bg-white'} `}>
            <Container className="text-center">
              <Image
                src={img}
                roundedCircle
                className="profile-modal__profile-image mb-4 mx-auto"
                style={{ width: '150px', height: '150px' }}
              />


              <label htmlFor="nombre" className={`${darkMode ? ' text-white' : ' text-black'} block mb-2 text-sm font-medium `}>Nombre Completo</label>
              <div className="relative mb-4 flex items-center">
                <svg className="w-5 h-5 text-gray-500 absolute left-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM4 20c1.06-3.08 4-6 8-6s6.94 2.92 8 6H4z" />
                </svg>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={userData.nombre}
                  onChange={handleProfileChange}
                  readOnly={!isProfileEditable}
                  className={`${darkMode ? ' bg-bgper text-white border-white' : ' bg-white text-black border-black'} border  text-sm rounded-lg  block w-full pl-10 p-2.5 ${!isProfileEditable ? 'cursor-not-allowed opacity-50' : ''}`}
                  placeholder="Escribe tu nombre"
                />
              </div>


              <label htmlFor="direccion" className={`${darkMode ? ' text-white' : ' text-black'} block mb-2 text-sm font-medium `}>Dirección</label>
              <div className="relative mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5 absolute left-3 top-2.5 text-gray-500"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>

                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={userData.direccion}
                  onChange={handleProfileChange}
                  readOnly={!isProfileEditable}
                  className={`${darkMode ? ' bg-bgper text-white border-white' : ' bg-white text-black border-black'} border  text-sm rounded-lg  block w-full pl-10 p-2.5 ${!isProfileEditable ? 'cursor-not-allowed opacity-50' : ''}`}
                  placeholder="Escribe tu dirección"
                />
              </div>

              <label htmlFor="celular" className={`${darkMode ? ' text-white' : ' text-black'} block mb-2 text-sm font-medium `}>Celular</label>
              <div className="relative mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5 absolute left-3 top-3 text-gray-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                  />
                </svg>
                <input
                  type="text"
                  id="celular"
                  name="celular"
                  value={userData.celular}
                  onChange={handleProfileChange}
                  readOnly={!isProfileEditable}
                  className={`${darkMode ? ' bg-bgper text-white border-white' : ' bg-white text-black border-black'} border  text-sm rounded-lg  block w-full pl-10 p-2.5 ${!isProfileEditable ? 'cursor-not-allowed opacity-50' : ''}`}
                  placeholder="Escribe tu número de celular"
                />
              </div>


              <label htmlFor="email" className={`${darkMode ? ' text-white' : ' text-black'} block mb-2 text-sm font-medium `}>Correo</label>
              <div className="relative mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5 absolute left-3 top-3 text-gray-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25"
                  />
                </svg>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData.email}
                  onChange={handleProfileChange}
                  readOnly={!isProfileEditable}
                  className={`${darkMode ? ' bg-bgper text-white border-white' : ' bg-white text-black border-black'} border  text-sm rounded-lg  block w-full pl-10 p-2.5 ${!isProfileEditable ? 'cursor-not-allowed opacity-50' : ''}`}
                  placeholder="Escribe tu correo"
                />
              </div>

              <button
                className={`btno ${isProfileEditable ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'} 
                     px-4 py-2 rounded-md shadow-md 
                     transition duration-200 ease-in-out 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 
                     ${isProfileEditable ? 'hover:bg-green-600' : 'hover:bg-yellow-600'}`}
                onClick={isProfileEditable ? handleSave : toggleProfileEdit}
              >
                {isProfileEditable ? 'Guardar' : 'Editar'}
              </button>
            </Container>
          </Modal.Body>
          <Modal.Footer className={`${darkMode ? ' bg-bgper ' : ' bg-white '}  `}>
            <button className="btn btn-danger" onClick={handleProfileClose}>
              Cerrar
            </button>
          </Modal.Footer>
        </Modal>

        <Routes>
          <Route path="/productos" element={<Productos darkMode={darkMode} />} />
          <Route path="/clientes" element={<Clientes darkMode={darkMode} />} />
          <Route path="/inventario" element={<Inventario darkMode={darkMode} />} />
          <Route path="/dashboard" element={<Dashboard darkMode={darkMode} />} />
          <Route path="/coments" element={<Coments darkMode={darkMode} />} />
        </Routes>
        <div className={`bg-gray-900 text-white ${darkMode ? 'bg-gray-900' : 'bg-gray-800'}`}>
          <Footer darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;

