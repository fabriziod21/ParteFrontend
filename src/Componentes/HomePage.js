import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiPlay, FiStar, FiZoomIn, FiX, FiCheck, FiTruck, FiShield, FiAward, FiClock } from 'react-icons/fi';
import AOS from 'aos';
import imgd from "../imagenes/re1.jpg";
import imgd2 from "../imagenes/re2.jpeg";
import imgd3 from "../imagenes/re3.jpeg";
import profilePic1 from "../imagenes/32.jpg";
import profilePic2 from "../imagenes/cs.jpeg";
import profilePic3 from "../imagenes/cxxx.jpeg";
import profilePic4 from "../imagenes/bbb.jpeg";
import FormularioComentario from './FormularioComentario';
import ob from "../imagenes/t1.jpg";
import ob2 from "../imagenes/mn2.jpeg";
import "../estilos/Homepage.css";

const HomePage = () => {
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const statsRef = useRef(null);
  const [countersVisible, setCountersVisible] = useState(false);
  const [counts, setCounts] = useState({ clients: 0, products: 0, years: 0, brands: 0 });

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
    });
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Counter animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !countersVisible) {
          setCountersVisible(true);
          animateCounters();
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [countersVisible]);

  const animateCounters = () => {
    const targets = { clients: 1500, products: 20000, years: 10, brands: 50 };
    const duration = 2000;
    const start = Date.now();

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCounts({
        clients: Math.floor(targets.clients * eased),
        products: Math.floor(targets.products * eased),
        years: Math.floor(targets.years * eased),
        brands: Math.floor(targets.brands * eased),
      });

      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };

  // Auto rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    { img: profilePic1, name: "Carlos Rodríguez", role: "Empresario", text: "La calidad de los relojes es excepcional. El servicio al cliente superó todas mis expectativas. Definitivamente volveré a comprar." },
    { img: profilePic2, name: "María García", role: "Diseñadora", text: "Encontré el reloj perfecto para cada ocasión. La variedad es impresionante y los precios muy competitivos." },
    { img: profilePic3, name: "Juan Martínez", role: "Arquitecto", text: "Atención personalizada de primera. Me ayudaron a elegir un reloj que refleja perfectamente mi estilo." },
    { img: profilePic4, name: "Ana López", role: "Médico", text: "Calidad premium en cada detalle. El empaque y la presentación son dignos de una joyería de lujo internacional." },
  ];

  const benefits = [
    { icon: FiTruck, title: "Envío Express", desc: "Gratis en pedidos +S/.500" },
    { icon: FiShield, title: "Garantía 2 Años", desc: "Cobertura total incluida" },
    { icon: FiAward, title: "100% Original", desc: "Certificado de autenticidad" },
    { icon: FiClock, title: "Soporte 24/7", desc: "Atención personalizada" },
  ];

  return (
    <div className="home-wrapper">

      {/* ==================== HERO SECTION ==================== */}
      <section className="hero">
        <div
          className="hero-bg"
          style={{
            backgroundImage: `url(${ob})`,
            transform: `translateY(${scrollY * 0.5}px)`
          }}
        />
        <div className="hero-overlay" />

        {/* Floating elements */}
        <div className="hero-float-elements">
          <div className="float-circle float-1" />
          <div className="float-circle float-2" />
          <div className="float-circle float-3" />
        </div>

        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-tag">
              <span className="tag-dot" />
              Nueva Colección 2024
            </div>

            <h1 className="hero-title">
              Relojes de
              <span className="gold-text"> Lujo</span>
              <br />
              Para Quienes
              <span className="gold-text"> Exigen Más</span>
            </h1>

            <p className="hero-desc">
              Descubre nuestra exclusiva selección de relojes premium.
              Cada pieza representa la perfecta fusión entre artesanía
              tradicional y tecnología de vanguardia.
            </p>

            <div className="hero-actions">
              <Link to="/catalogo" className="btn-primary">
                <span>Ver Colección</span>
                <FiArrowRight />
              </Link>
              <button className="btn-outline">
                <FiPlay />
                <span>Ver Video</span>
              </button>
            </div>

            <div className="hero-trust">
              <div className="trust-avatars">
                <img src={profilePic1} alt="" />
                <img src={profilePic2} alt="" />
                <img src={profilePic3} alt="" />
                <img src={profilePic4} alt="" />
              </div>
              <div className="trust-text">
                <strong>+1,500</strong> clientes satisfechos
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-wrapper">
              <img src={imgd} alt="Reloj Premium" className="hero-watch" />
              <div className="hero-image-glow" />
            </div>

            {/* Floating cards */}
            <div className="float-card card-1">
              <FiCheck className="card-icon" />
              <span>Envío Gratis</span>
            </div>
            <div className="float-card card-2">
              <FiShield className="card-icon" />
              <span>Garantía 2 Años</span>
            </div>
            <div className="float-card card-3">
              <div className="card-price">S/. 2,499</div>
              <div className="card-label">Desde</div>
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="scroll-mouse">
            <div className="scroll-wheel" />
          </div>
          <span>Scroll</span>
        </div>
      </section>

      {/* ==================== BENEFITS BAR ==================== */}
      <section className="benefits-bar">
        <div className="benefits-container">
          {benefits.map((b, i) => (
            <div key={i} className="benefit-item">
              <b.icon className="benefit-icon" />
              <div className="benefit-text">
                <strong>{b.title}</strong>
                <span>{b.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== ABOUT / PARALLAX SECTION ==================== */}
      <section className="about-section">
        <div
          className="about-bg"
          style={{
            backgroundImage: `url(${ob2})`,
            transform: `translateY(${(scrollY - 800) * 0.3}px)`
          }}
        />
        <div className="about-overlay" />

        <div className="about-container">
          <div className="about-content">
            <span className="section-tag">Nuestra Historia</span>
            <h2 className="home-section-title">
              Más de <span className="gold-text">10 Años</span>
              <br />de Excelencia
            </h2>
            <p className="about-text">
              Desde 2014, nos hemos dedicado a ofrecer la más selecta colección
              de relojes de las mejores marcas del mundo. Nuestra pasión por la
              relojería y el compromiso con la excelencia nos ha convertido en
              el destino preferido de los amantes de los relojes finos.
            </p>

            <div className="about-features">
              <div className="about-feature">
                <div className="feature-number">01</div>
                <div className="feature-info">
                  <h4>Misión</h4>
                  <p>Ofrecer relojes de la más alta calidad con un servicio excepcional y personalizado.</p>
                </div>
              </div>
              <div className="about-feature">
                <div className="feature-number">02</div>
                <div className="feature-info">
                  <h4>Visión</h4>
                  <p>Ser el referente número uno en relojería de lujo en toda Latinoamérica.</p>
                </div>
              </div>
            </div>

            <Link to="/catalogo" className="btn-gold">
              Explorar Catálogo
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== STATS SECTION ==================== */}
      <section className="stats-section" ref={statsRef}>
        <div className="stats-container">
          <div className="stat-box">
            <div className="stat-number">{counts.clients.toLocaleString()}+</div>
            <div className="stat-label">Clientes Felices</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-box">
            <div className="stat-number">{counts.products.toLocaleString()}+</div>
            <div className="stat-label">Relojes Vendidos</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-box">
            <div className="stat-number">{counts.years}+</div>
            <div className="stat-label">Años de Experiencia</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-box">
            <div className="stat-number">{counts.brands}+</div>
            <div className="stat-label">Marcas Premium</div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURED PRODUCTS ==================== */}
      <section className="featured-section">
        <div className="featured-container">
          <div className="section-header">
            <span className="section-tag">Destacados</span>
            <h2 className="home-section-title">
              Colección <span className="gold-text">Premium</span>
            </h2>
            <p className="section-desc">
              Las piezas más exclusivas seleccionadas para ti
            </p>
          </div>

          <div className="featured-grid">
            <div className="featured-card featured-large" onClick={() => { setSelectedImage(imgd); setLightboxVisible(true); }}>
              <img src={imgd} alt="Colección Clásica" />
              <div className="featured-overlay">
                <span className="featured-tag">Bestseller</span>
                <h3>Colección Clásica</h3>
                <p>Elegancia atemporal</p>
                <button className="featured-btn">
                  <FiZoomIn />
                </button>
              </div>
            </div>

            <div className="featured-card" onClick={() => { setSelectedImage(imgd2); setLightboxVisible(true); }}>
              <img src={imgd2} alt="Edición Limitada" />
              <div className="featured-overlay">
                <span className="featured-tag">Exclusivo</span>
                <h3>Edición Limitada</h3>
                <p>Solo 100 unidades</p>
                <button className="featured-btn">
                  <FiZoomIn />
                </button>
              </div>
            </div>

            <div className="featured-card" onClick={() => { setSelectedImage(imgd3); setLightboxVisible(true); }}>
              <img src={imgd3} alt="Sport Collection" />
              <div className="featured-overlay">
                <span className="featured-tag">Nuevo</span>
                <h3>Sport Collection</h3>
                <p>Rendimiento extremo</p>
                <button className="featured-btn">
                  <FiZoomIn />
                </button>
              </div>
            </div>
          </div>

          <div className="featured-cta">
            <Link to="/catalogo" className="btn-primary large">
              Ver Todo el Catálogo
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          <div className="section-header center">
            <span className="section-tag">Testimonios</span>
            <h2 className="home-section-title">
              Lo que Dicen <span className="gold-text">Nuestros Clientes</span>
            </h2>
          </div>

          <div className="testimonials-wrapper">
            <div className="testimonial-main">
              <div className="quote-icon">"</div>
              <p className="testimonial-text">{testimonials[activeTestimonial].text}</p>
              <div className="testimonial-author">
                <img src={testimonials[activeTestimonial].img} alt={testimonials[activeTestimonial].name} />
                <div className="author-info">
                  <strong>{testimonials[activeTestimonial].name}</strong>
                  <span>{testimonials[activeTestimonial].role}</span>
                </div>
                <div className="author-stars">
                  {[...Array(5)].map((_, i) => <FiStar key={i} />)}
                </div>
              </div>
            </div>

            <div className="testimonial-nav">
              {testimonials.map((t, i) => (
                <button
                  key={i}
                  className={`nav-thumb ${i === activeTestimonial ? 'active' : ''}`}
                  onClick={() => setActiveTestimonial(i)}
                >
                  <img src={t.img} alt={t.name} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CTA FINAL ==================== */}
      <section className="cta-section">
        <div
          className="cta-bg"
          style={{
            backgroundImage: `url(${ob})`,
            transform: `translateY(${(scrollY - 2500) * 0.2}px)`
          }}
        />
        <div className="cta-overlay" />

        <div className="cta-container">
          <h2 className="cta-title">
            ¿Listo para Encontrar<br />
            <span className="gold-text">Tu Reloj Perfecto?</span>
          </h2>
          <p className="cta-desc">
            Explora nuestra colección y descubre la pieza que definirá tu estilo
          </p>
          <div className="cta-actions">
            <Link to="/catalogo" className="btn-primary large">
              Explorar Ahora
              <FiArrowRight />
            </Link>
            <Link to="/contacto" className="btn-outline light">
              Contactar
            </Link>
          </div>
        </div>
      </section>

      {/* Formulario de comentarios */}
      <FormularioComentario onSubmit={() => {}} />

      {/* Lightbox */}
      {lightboxVisible && (
        <div className="lightbox" onClick={() => setLightboxVisible(false)}>
          <button className="lightbox-close">
            <FiX />
          </button>
          <img src={selectedImage} alt="Ampliada" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default HomePage;
