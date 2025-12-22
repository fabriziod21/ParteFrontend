import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Modal from 'react-bootstrap/Modal';
import Image from 'react-bootstrap/Image';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import img from '../imagenes/sd.jpeg';
import "../estilos/Navig.css";

function Navig({ user, cartItems, onCartShow, onCartClose, onLogout }) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isProfileEditable, setIsProfileEditable] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userData, setUserData] = useState({
    nombre: user?.nombre || "",
    direccion: user?.direccion || "",
    celular: user?.telefono || "",
    email: user?.correo || "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProfileClose = () => setShowProfileModal(false);
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

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  const handleSave = () => {
    console.log('Updated user data:', userData);
    setIsProfileEditable(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <Navbar
        sticky="top"
        expand="lg"
        className={`luxury-navbar ${scrolled ? 'scrolled' : ''}`}
      >
        <Container>
          {/* Brand Logo */}
          <Navbar.Brand as={Link} to="/homepage" className="brand-logo">
            <span className="brand-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </span>
            <span className="brand-text"><span className="gold">Mor</span>Vic</span>
          </Navbar.Brand>

          {/* Mobile Toggle */}
          <Navbar.Toggle aria-controls="navbar-nav" className="navbar-toggler-custom">
            <span className="toggler-icon"></span>
          </Navbar.Toggle>

          <Navbar.Collapse id="navbar-nav">
            {/* Main Navigation */}
            <Nav className="mx-auto nav-links">
              <Nav.Link
                as={Link}
                to="/homepage"
                className={`nav-link-custom ${isActive('/homepage') ? 'active' : ''}`}
              >
                <span className="link-text">Inicio</span>
                <span className="link-underline"></span>
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/catalogo"
                className={`nav-link-custom ${isActive('/catalogo') ? 'active' : ''}`}
              >
                <span className="link-text">Catálogo</span>
                <span className="link-underline"></span>
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/historial"
                className={`nav-link-custom ${isActive('/historial') ? 'active' : ''}`}
              >
                <span className="link-text">Historial</span>
                <span className="link-underline"></span>
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/historia"
                className={`nav-link-custom ${isActive('/historia') ? 'active' : ''}`}
              >
                <span className="link-text">Historia</span>
                <span className="link-underline"></span>
              </Nav.Link>
            </Nav>

            {/* Right Side Actions */}
            <Nav className="nav-actions">
              {/* Admin Panel Button */}
              {user && (
                <button className="admin-panel-btn" onClick={() => navigate('/adminhomepage/dashboard')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  <span className="btn-text">Admin</span>
                </button>
              )}

              {/* Cart Button */}
              <button className="cart-btn" onClick={onCartShow}>
                <ShoppingCartIcon />
                {cartItems.length > 0 && (
                  <span className="cart-badge">{cartItems.length}</span>
                )}
              </button>

              {/* User Profile */}
              {user ? (
                <div
                  className="user-profile"
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <div className="profile-trigger">
                    <Image
                      src={img}
                      roundedCircle
                      className="profile-avatar"
                    />
                    <span className="profile-name">{user?.nombre?.split(' ')[0] || 'Usuario'}</span>
                    <svg className={`dropdown-arrow ${showDropdown ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </div>

                  <div className={`profile-dropdown ${showDropdown ? 'show' : ''}`}>
                    <div className="dropdown-header">
                      <Image src={img} roundedCircle className="dropdown-avatar" />
                      <div className="dropdown-user-info">
                        <span className="dropdown-name">{user?.nombre || 'Usuario'}</span>
                        <span className="dropdown-email">{user?.correo || 'correo@ejemplo.com'}</span>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={handleProfileShow}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      Mi Perfil
                    </button>
                    <button className="dropdown-item" onClick={() => navigate('/historial')}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 8v4l3 3"/>
                        <circle cx="12" cy="12" r="10"/>
                      </svg>
                      Mis Pedidos
                    </button>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout" onClick={handleLogoutClick}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login" className="auth-btn login-btn">Ingresar</Link>
                  <Link to="/registro" className="auth-btn register-btn">Registrarse</Link>
                </div>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Cart Offcanvas */}
      <Offcanvas show={false} onHide={onCartClose} placement="end" className="cart-offcanvas">
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
            <p>No hay productos en el carrito.</p>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Profile Modal */}
      <Modal show={showProfileModal} onHide={handleProfileClose} className="profile-modal-luxury" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Mi Perfil
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="profile-content">
            <div className="profile-image-container">
              <Image
                src={img}
                roundedCircle
                className="profile-image-large"
              />
              <button className="change-photo-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
            </div>

            <div className="profile-form">
              <div className="form-group">
                <label>Nombre Completo</label>
                <div className="input-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input
                    type="text"
                    name="nombre"
                    value={userData.nombre}
                    onChange={handleProfileChange}
                    readOnly={!isProfileEditable}
                    placeholder="Tu nombre completo"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <div className="input-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <input
                    type="text"
                    name="direccion"
                    value={userData.direccion}
                    onChange={handleProfileChange}
                    readOnly={!isProfileEditable}
                    placeholder="Tu dirección"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <div className="input-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <input
                    type="text"
                    name="celular"
                    value={userData.celular}
                    onChange={handleProfileChange}
                    readOnly={!isProfileEditable}
                    placeholder="Tu número de teléfono"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Correo Electrónico</label>
                <div className="input-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleProfileChange}
                    readOnly={!isProfileEditable}
                    placeholder="Tu correo electrónico"
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="modal-btn cancel-btn" onClick={handleProfileClose}>
            Cancelar
          </button>
          <button
            className={`modal-btn ${isProfileEditable ? 'save-btn' : 'edit-btn'}`}
            onClick={isProfileEditable ? handleSave : toggleProfileEdit}
          >
            {isProfileEditable ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Guardar
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Editar
              </>
            )}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Navig;
