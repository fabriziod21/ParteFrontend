import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link } from 'react-router-dom';
import Image from 'react-bootstrap/Image';
import Dropdown from 'react-bootstrap/Dropdown';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Modal from 'react-bootstrap/Modal';
import img from '../imagenes/sd.jpeg';
import { useNavigate } from 'react-router-dom';
import "../estilos/NavButton.css"

function Navig({ user, cartItems, onCartShow, onCartClose, onLogout }) {
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

  const navigate = useNavigate(); // Define navigate here

  const handleLogoutClick = () => {
    onLogout(); 
    navigate('/login'); 
  };

  // Function to handle saving updated user data
  const handleSave = () => {

    console.log('Updated user data:', userData); // For debugging

    // Reset edit mode
    setIsProfileEditable(false);
  };

  return (
    <>
      <Navbar sticky="top" expand="lg" className="bg-body-tertiary navbar-shadow">
        <Container>
          <Navbar.Brand as={Link} to="/homepage">MorVic</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/homepage">Menu</Nav.Link>
              <Nav.Link as={Link} to="/catalogo">Catalogo</Nav.Link>
              <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                <NavDropdown.Item as={Link} to="#action/3.1">Action</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/login">Login</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/registro">Registro</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/historial">Historial</NavDropdown.Item>
              </NavDropdown>
            </Nav>
            <Nav className="ms-auto d-flex align-items-center">
              <div className="shopping-cart-container" onClick={onCartShow}>
                <ShoppingCartIcon className="shopping-cart-icon" />
              </div>
              <div className="profile-container">
                <Image
                  src={img}
                  roundedCircle
                  className="profile-image"
                  onClick={handleProfileShow}
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
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Offcanvas show={false} onHide={onCartClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Carrito de Compras</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {cartItems.length > 0 ? (
            <ul>
              {cartItems.map((item, index) => (
                <li key={index}>{item.title} - {item.price}</li>
              ))}
            </ul>
          ) : (
            <p>No items in the cart.</p>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      <Modal show={showProfileModal} onHide={handleProfileClose} className="profile-modal">
        <Modal.Header closeButton className="bg-white border-b border-gray-500">
          <Modal.Title className="text-lg font-semibold text-gray-800">Perfil de Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-fondo p-6">
          <Container className="text-center">
            <Image
              src={img}
              roundedCircle
              className="profile-modal__profile-image mb-4 mx-auto"
              style={{ width: '150px', height: '150px' }}
            />

            {/* Nombre Completo */}
            <label htmlFor="nombre" className="block mb-2 text-sm font-medium text-gray-200">Nombre Completo</label>
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
                className={`bg-bgper border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full pl-10 p-2.5 ${!isProfileEditable ? 'cursor-not-allowed opacity-50' : ''}`}
                placeholder="Escribe tu nombre"
              />
            </div>

            {/* Dirección */}
            <label htmlFor="direccion" className="block mb-2 text-sm font-medium text-gray-200">Dirección</label>
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
                className={`bg-bgper border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full pl-10 p-2.5 ${!isProfileEditable ? 'cursor-not-allowed opacity-50' : ''}`}
                placeholder="Escribe tu dirección"
              />
            </div>

            {/* Celular */}
            <label htmlFor="celular" className="block mb-2 text-sm font-medium text-gray-200">Celular</label>
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
                className={`bg-bgper border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full pl-10 p-2.5 ${!isProfileEditable ? 'cursor-not-allowed opacity-50' : ''}`}
                placeholder="Escribe tu número de celular"
              />
            </div>

            {/* Correo */}
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-200">Correo</label>
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
                className={`bg-bgper border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full pl-10 p-2.5 ${!isProfileEditable ? 'cursor-not-allowed opacity-50' : ''}`}
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
        <Modal.Footer className="bg-white border-b border-red-900">
          <button className="btn btn-danger" onClick={handleProfileClose}>
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>

    </>
  );
}

export default Navig;
