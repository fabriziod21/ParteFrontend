import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import Navig from './Componentes/Navig';
import Registro from './Componentes/Registro';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Footer from './Componentes/Footer';
import { Catalogo } from './Catalogo/Catalogo';
import Carga from './Componentes/Carga';
import { Historial } from './Historial/Historial';
import CartOffCanvas from './Componentes/CartOfCanvas';
import "./estilos/NavButton.css"
import 'bootstrap-icons/font/bootstrap-icons.css';
import imgd from "./imagenes/re1.jpg";
import imgd2 from "./imagenes/re2.jpeg";
import imgd3 from "./imagenes/re3.jpeg";
import profilePic1 from "./imagenes/32.jpg";
import profilePic2 from "./imagenes/cs.jpeg";
import profilePic3 from "./imagenes/cxxx.jpeg";
import profilePic4 from "./imagenes/bbb.jpeg";
import FormularioComentario from './Componentes/FormularioComentario';
import ob from "./imagenes/t1.jpg"
import ob2 from "./imagenes/mn2.jpeg"
import "./index.css"
import Login from './Componentes/Login';
import AdminHomePage from './Componentes/AdminHomePage';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles
import { ThemeProvider } from './Componentes/ThemeContext';
import fo from "./imagenes/def.gif";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import DetallesProducto from './Componentes/DetallesProducto';
import Resumen from './Componentes/Resumen';
import api from './services/api';
import Estrellas from './Componentes/Estrellas';
import { Handshake, Lightbulb, Award, Globe } from 'lucide-react';


const HomePage = () => {
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [fadeClass, setFadeClass] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [comments, setComments] = useState([
  ]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false, // Permitir que las animaciones se repitan
    });
  }, []);

  useEffect(() => {
    // Llamada a la API para obtener los comentarios
    api.get("/api/comentarios/listarActivos")
      .then((response) => {
        const fetchedComments = response.data.map(comment => ({
          pic: "default-profile.png", // Puedes cambiar esto si la API provee imágenes
          text: comment.contenido,
          date: comment.fechaCreacion,
          nombre: comment.nombreUsuario,
          estrellas: comment.estrellas
        }));
        setComments(fetchedComments);
      })
      .catch((error) => {
        console.error("Error al obtener los comentarios:", error);
      });
  }, []);


  const openLightbox = (image) => {
    setSelectedImage(image);
    setLightboxVisible(true);
    setTimeout(() => setFadeClass('fade-in'), 100);
  };

  const closeLightbox = () => {
    setFadeClass('fade-out');
    setTimeout(() => {
      setLightboxVisible(false);
      setSelectedImage('');
      setFadeClass('');
    }, 300);
  };

  const handleSubmitComment = (newComment) => {
    setComments([...comments, newComment]);
  };

  const totalSlides = comments.length;

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  useEffect(() => {
    document.body.style.backgroundColor = 'rgb(27, 25, 24)';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  return (
    <Container fluid className="homepage-container p-0">
    {/* Hero Section */}
    <Container fluid className="p-0 ">
      <div className="relative h-[100vh] lg:h-[100vh] overflow-hidden bg-fixed bg-center bg-cover" style={{ backgroundImage: `url(${fo})` }}>
        {/* Capa de contenido con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60 flex flex-col items-center justify-center text-white text-center p-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4" data-aos="fade-up">
            Descubre la Elegancia del Tiempo
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl font-medium" data-aos="fade-up" data-aos-delay="100">
            Relojes de alta calidad para cada ocasión
          </p>
          <div className="lg:right-20" data-aos="fade-up" data-aos-delay="400">
            <a href="/catalogo" className="bto">
              <span className="span1"></span>
              <span className="span2"></span>
              <span className="span3"></span>
              <span className="span4"></span>
              Ver ofertas
            </a>
          </div>
        </div>
      </div>

      {/* Misión Section */}
      <div className="w-full max-w-screen-2xl mx-auto bg-bgper p-6 lg:p-20 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 border border-gray-400 rounded-lg overflow-hidden">
        <div className="flex flex-col justify-center space-y-6">
          <h2 className="text-3xl lg:text-5xl font-bold text-red-600 tracking-wide text-center" data-aos="fade-right">Nuestra Misión</h2>
          <p className="text-lg lg:text-xl text-white leading-relaxed text-center" data-aos="fade-right">
            Nuestro objetivo es ofrecer productos de alta calidad a precios competitivos, brindando una experiencia única para todos nuestros clientes. Nos esforzamos por mejorar cada día y asegurar que nuestros clientes estén siempre satisfechos.
          </p>
        </div>
        <div className="flex justify-center lg:justify-end">
          <img className="rounded-lg shadow-2xl max-w-full object-cover h-64 lg:h-80 hover:scale-105 transition-transform duration-300 ease-in-out" src={ob} alt="Misión" />
        </div>
      </div>

      {/* Objetivo Section */}
      <div className="w-full max-w-screen-2xl mx-auto bg-bgper p-6 lg:p-20 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-0 border border-gray-400 rounded-lg overflow-hidden">
        <div className="flex justify-center lg:justify-start">
          <img className="rounded-lg shadow-2xl max-w-full object-cover h-64 lg:h-80 hover:scale-105 transition-transform duration-300 ease-in-out" src={ob2} alt="Objetivo" />
        </div>
        <div className="flex flex-col justify-center space-y-6">
          <h2 className="text-3xl lg:text-5xl font-bold text-red-600 tracking-wide text-center" data-aos="fade-left">Nuestro Objetivo</h2>
          <p className="text-lg lg:text-xl text-white leading-relaxed text-center" data-aos="fade-left">
            Continuar expandiéndonos y adaptándonos a las nuevas necesidades del mercado, siempre con un enfoque en la innovación y la satisfacción del cliente.
          </p>
        </div>
      </div>

      {/* Valores Section */}
      <div className="w-full max-w-screen-2xl mx-auto bg-bgper p-6 lg:p-20 text-center mt-12 rounded-lg border border-gray-400" data-aos="fade-up">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Nuestros Valores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: "Compromiso", description: "Siempre dedicados a satisfacer a nuestros clientes.", icon: Handshake },
            { title: "Innovación", description: "Buscamos mejorar y adaptarnos constantemente.", icon: Lightbulb },
            { title: "Calidad", description: "Productos de excelencia que superan expectativas.", icon: Award },
            { title: "Responsabilidad", description: "Actuamos de manera ética y responsable.", icon: Globe },
          ].map((value, index) => (
            <div key={index} className="bg-black p-8 rounded-lg shadow-lg flex flex-col items-center" data-aos="zoom-in" data-aos-delay={`${index * 100}`}>
              <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8962e] shadow-lg">
                <value.icon className="w-8 h-8 text-black" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
              <p className="text-md text-gray-300">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonios Section */}
      <div className="w-full max-w-screen-2xl mx-auto py-16 lg:py-24 mt-12" data-aos="fade-up">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#d4af37] text-sm font-semibold tracking-[0.3em] uppercase mb-4 block">Testimonios</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Lo Que Dicen Nuestros Clientes
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mt-6"></div>
        </div>

        {/* Carrusel de testimonios */}
        <div className="relative max-w-4xl mx-auto px-4">
          {/* Icono de comillas decorativo */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-[#d4af37] opacity-20 text-8xl font-serif z-0">
            "
          </div>

          <div className="overflow-hidden relative z-10">
            <div
              className="flex transition-all duration-700 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {comments.map((comment, index) => (
                <div key={index} className="min-w-full px-4">
                  <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] rounded-2xl p-8 lg:p-12 border border-[#d4af37]/20 shadow-2xl">
                    {/* Estrellas */}
                    <div className="flex justify-center gap-1 mb-8">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < comment.estrellas ? 'text-[#d4af37]' : 'text-gray-600'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    {/* Texto del comentario */}
                    <blockquote className="text-center mb-8">
                      <p className="text-gray-300 text-lg lg:text-xl leading-relaxed italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                        "{comment.text}"
                      </p>
                    </blockquote>

                    {/* Línea divisoria */}
                    <div className="w-16 h-px bg-[#d4af37]/40 mx-auto mb-8"></div>

                    {/* Info del cliente */}
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] rounded-full blur-md opacity-40"></div>
                        <img
                          src={comment.pic}
                          alt={comment.nombre}
                          className="relative w-16 h-16 rounded-full object-cover border-2 border-[#d4af37] shadow-lg"
                        />
                      </div>
                      <h4 className="text-white font-semibold text-lg tracking-wide">{comment.nombre}</h4>
                      <span className="text-[#d4af37]/70 text-sm mt-1">{comment.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botones de navegación */}
          <button
            className="absolute left-0 lg:-left-16 top-1/2 transform -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-[#1a1a1a] border border-[#d4af37]/30 text-[#d4af37] rounded-full shadow-lg hover:bg-[#d4af37] hover:text-black transition-all duration-300 group z-20"
            onClick={handlePrev}
          >
            <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="absolute right-0 lg:-right-16 top-1/2 transform -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-[#1a1a1a] border border-[#d4af37]/30 text-[#d4af37] rounded-full shadow-lg hover:bg-[#d4af37] hover:text-black transition-all duration-300 group z-20"
            onClick={handleNext}
          >
            <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Indicadores */}
          <div className="flex justify-center gap-3 mt-10">
            {comments.map((_, index) => (
              <button
                key={index}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? "w-8 h-2 bg-gradient-to-r from-[#d4af37] to-[#f4d03f]"
                    : "w-2 h-2 bg-gray-600 hover:bg-gray-500"
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Galería Section */}
      <div className="w-full max-w-screen-2xl mx-auto bg-bgper p-6 lg:p-20 mt-12 rounded-lg border border-gray-400" data-aos="fade-up">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 text-center">Nuestra Galería</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[imgd, imgd2, imgd3].map((img, index) => (
            <div key={index} className="relative overflow-hidden rounded-lg shadow-lg" onClick={() => openLightbox(img)} data-aos="zoom-in" data-aos-delay={`${index * 100}`}>
              <img src={img} alt={`Galería ${index + 1}`} className="object-cover w-full h-full hover:scale-110 transition-transform duration-300 ease-in-out" />
            </div>
          ))}
        </div>
      </div>

      {/* Comentarios Formulario */}
      <FormularioComentario onSubmit={handleSubmitComment} data-aos="fade-up" data-aos-delay="400" />

      {lightboxVisible && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={closeLightbox}>
          <img className={`rounded-lg max-w-full max-h-full object-contain ${fadeClass}`} src={selectedImage} alt="Imagen ampliada" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </Container>
  </Container>
);
};
  
export default HomePage;













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
      '/registro',
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
                <Route path="/registro" element={<Registro />} />
                <Route path="/historial" element={<Historial />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
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