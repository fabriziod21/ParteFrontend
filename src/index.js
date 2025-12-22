import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import Navig from './Componentes/Navig';
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from './Componentes/Footer';
import { Catalogo } from './Catalogo/Catalogo';
import Carga from './Componentes/Carga';
import { Historial } from './Historial/Historial';
import CartOffCanvas from './Componentes/CartOfCanvas';
import "./estilos/NavButton.css"
import 'bootstrap-icons/font/bootstrap-icons.css';
import "./index.css"
import AuthPage from './Componentes/AuthPage';
import AdminHomePage from './Componentes/AdminHomePage';
import 'aos/dist/aos.css';
import { ThemeProvider } from './Componentes/ThemeContext';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import DetallesProducto from './Componentes/DetallesProducto';
import Resumen from './Componentes/Resumen';
import HomePage from './Componentes/HomePage';
import Historia from './Componentes/Historia';













const App = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    const savedCartItems = localStorage.getItem('cartItems');
    return savedCartItems ? JSON.parse(savedCartItems) : [];
  });
  const [showCart, setShowCart] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Rutas donde no se debe mostrar la navbar
  const noNavbarRoutes = ['/login', '/registro', '/reports', '/settings', '/', "/resumen"];
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Mostrar la navbar según la ruta
  const shouldShowNavbar = !noNavbarRoutes.includes(location.pathname) && !isAdminRoute;

  const navigate = useNavigate();

  // Manejar el loading
  useEffect(() => {
    const loadingRoutes = [
      '/catalogo',
      '/historial',
    ];

    // Solo establece loading si estamos en una de las rutas definidas
    setLoading(loadingRoutes.includes(location.pathname));

    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // Tiempo de carga de 500 ms

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser)); // Guardar usuario en localStorage
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCartItems([]); // Limpiar elementos del carrito al cerrar sesión
    localStorage.removeItem('cartItems'); // Limpiar carrito del localStorage
    navigate('/login'); // Redirigir a la página de inicio de sesión
  };

  const handleAddToCart = (item) => {
    const formattedItem = {
        ...item,
        price: `$${item.price.toFixed(2)}`, // Ensure price is stored as a formatted string
    };

    setCartItems((prevItems) => {
        const existingItemIndex = prevItems.findIndex((prevItem) => prevItem.id === item.id);

        let updatedItems;
        if (existingItemIndex !== -1) {
            updatedItems = [...prevItems];
            updatedItems[existingItemIndex].quantity += 1;
        } else {
            updatedItems = [...prevItems, { ...formattedItem, quantity: 1 }];
        }

        localStorage.setItem('cartItems', JSON.stringify(updatedItems)); // Update localStorage
        return updatedItems;
    });

    setShowCart(true);
};


  const handleCartClose = () => setShowCart(false);
  const handleCartShow = () => setShowCart(true);

  const handleRemoveFromCart = (itemId) => {
    const updatedItems = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems)); // Actualizar localStorage
  };

  const increaseQuantity = (itemId) => {
    const updatedItems = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems)); // Actualizar localStorage
  };

  const decreaseQuantity = (itemId) => {
    const updatedItems = cartItems
      .map((item) => {
        if (item.id === itemId && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      })
      .filter((item) => item.quantity > 0); // Eliminar items con cantidad 0

    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems)); // Actualizar localStorage
  };

  const total = cartItems.reduce((acc, item) => {
    // Ensure price is a string and remove the '$' symbol
    const itemPrice = typeof item.price === 'string'
        ? parseFloat(item.price.replace('$', '')) // Remove '$' and convert to float
        : item.price; // If it's not a string, assume it's already a number

    return acc + itemPrice * item.quantity; // Calculate total
}, 0).toFixed(2); // Format total to 2 decimal places


  return (
    <div className="app-container">
      {shouldShowNavbar && (
        <Navig cartItems={cartItems} onCartShow={handleCartShow} onCartClose={handleCartClose} onLogout={handleLogout} user={user} />
        
      )}



      {/* Elimina TransitionGroup si no se necesita. Asegura una navegación más limpia */}
      <div className={`transition-wrapper ${loading ? 'loading' : ''}`}>
        <CSSTransition
          in={!loading}
          key={location.key}
          timeout={1000}
          classNames="fade"
          unmountOnExit
        >
          <div>
            {/* Contenido principal */}
            <main className={`main-content ${loading && !isAdminRoute ? 'hidden' : ''}`}>
              <Routes location={location}>
                <Route path="/" element={<Navigate to="/adminhomepage/dashboard" />} />
                <Route path="/homepage" element={<HomePage />} />
                <Route path="/catalogo" element={<Catalogo onAddToCart={handleAddToCart}  />} />
                <Route path="/login" element={<AuthPage onLogin={handleLogin} />} />
                <Route path="/registro" element={<AuthPage onLogin={handleLogin} />} />
                <Route path="/historial" element={<Historial />} />
                <Route path="/historia" element={<Historia />} />
                <Route path='/resumen' element={<Resumen/>} />
                <Route path="/detalles/:id" element={<DetallesProducto onAddToCart={handleAddToCart}  />} />
                {/* Rutas de administración */}

                <Route path="/adminhomepage/*" element={<AdminHomePage user={user}  onLogout={handleLogout} />} />

              </Routes>
            </main>

            {/* Carga solo para rutas no administrativas */}
            {loading && !isAdminRoute && (
              <div className="transition-overlay show">
                <Carga />
              </div>
            )}

            {/* Footer solo visible cuando se muestra la navbar - siempre oscuro en cliente */}
            {shouldShowNavbar && <Footer darkMode={true} />}

            {/* Off-Canvas del carrito */}
            <CartOffCanvas
              show={showCart}
              onHide={handleCartClose}
              cartItems={cartItems}
              onRemove={handleRemoveFromCart}
              increaseQuantity={increaseQuantity}
              decreaseQuantity={decreaseQuantity}
              total={total}
            />
          </div>
        </CSSTransition>
      </div>
    </div>
  );
};


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <ThemeProvider>
      <App />
      </ThemeProvider>
  </Router>
);