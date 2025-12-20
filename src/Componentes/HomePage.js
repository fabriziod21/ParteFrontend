import React, { useState } from "react";
import { Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import { FiTarget, FiEye, FiStar, FiZoomIn, FiX, FiArrowRight } from 'react-icons/fi';
import { Users, ShoppingBag, Clock, Trophy } from 'lucide-react';
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
  const [comments, setComments] = useState([]);

  const openLightbox = (image) => {
    setSelectedImage(image);
    setLightboxVisible(true);
  };

  const closeLightbox = () => {
    setLightboxVisible(false);
    setSelectedImage('');
  };

  const handleSubmitComment = (newComment) => {
    setComments([...comments, newComment]);
  };

  const valuesData = [
    { icon: Users, number: "1500+", title: "Clientes Satisfechos" },
    { icon: ShoppingBag, number: "20000+", title: "Productos Vendidos" },
    { icon: Clock, number: "10+", title: "Años de Experiencia" },
    { icon: Trophy, number: "15+", title: "Premios Ganados" }
  ];

  const testimonialsData = [
    { pic: profilePic1, name: "Carlos Rodriguez", text: "Excelente servicio y productos de alta calidad. Recomiendo totalmente!", date: "01/09/2023" },
    { pic: profilePic2, name: "Maria Garcia", text: "Siempre encuentro lo que necesito y a buenos precios.", date: "02/09/2023" },
    { pic: profilePic3, name: "Juan Martinez", text: "La atencion al cliente es excepcional. Estoy muy satisfecho.", date: "03/09/2023" },
    { pic: profilePic4, name: "Ana Lopez", text: "Sin duda volvere a comprar aqui. Me encanta su variedad.", date: "04/09/2023" }
  ];

  return (
    <Container fluid className="p-0" style={{ background: '#0a0a0a' }}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background" style={{ backgroundImage: `url(${ob})` }}></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            Descubre la <span>Elegancia</span> del Tiempo
          </h1>
          <p className="hero-subtitle">
            Relojes de alta calidad para cada ocasion. Precision, estilo y distincion en cada pieza.
          </p>
          <Link to="/catalogo" className="hero-cta">
            Ver Catalogo
            <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="mission-vision-section">
        <div className="mission-vision-container">
          <div className="section-header">
            <span className="section-badge">Quienes Somos</span>
            <h2 className="section-title">Nuestra <span>Esencia</span></h2>
          </div>

          <div className="mv-grid">
            {/* Mission Card */}
            <div className="mv-card">
              <div className="mv-card-image">
                <img src={ob} alt="Nuestra Mision" />
                <div className="mv-card-image-overlay"></div>
                <div className="mv-card-icon">
                  <FiTarget />
                </div>
              </div>
              <div className="mv-card-content">
                <h3 className="mv-card-title">Nuestra Mision</h3>
                <p className="mv-card-text">
                  Ofrecer productos de alta calidad a precios competitivos, brindando una experiencia unica
                  para todos nuestros clientes. Nos esforzamos por mejorar cada dia y asegurar que nuestros
                  clientes esten siempre satisfechos con la excelencia de nuestros relojes.
                </p>
              </div>
            </div>

            {/* Vision Card */}
            <div className="mv-card">
              <div className="mv-card-image">
                <img src={ob2} alt="Nuestra Vision" />
                <div className="mv-card-image-overlay"></div>
                <div className="mv-card-icon">
                  <FiEye />
                </div>
              </div>
              <div className="mv-card-content">
                <h3 className="mv-card-title">Nuestra Vision</h3>
                <p className="mv-card-text">
                  Continuar expandiendonos y adaptandonos a las nuevas necesidades del mercado, siempre con
                  un enfoque en la innovacion y la satisfaccion del cliente. Queremos ser lideres en nuestra
                  industria y un referente de calidad y elegancia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="values-container">
          <div className="section-header">
            <span className="section-badge">Por que Elegirnos</span>
            <h2 className="section-title">Nuestros <span>Logros</span></h2>
          </div>

          <div className="values-grid">
            {valuesData.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">
                  <value.icon />
                </div>
                <div className="value-number">{value.number}</div>
                <p className="value-title">{value.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          <div className="section-header">
            <span className="section-badge">Testimonios</span>
            <h2 className="section-title">Lo que Dicen <span>Nuestros Clientes</span></h2>
          </div>

          <div className="testimonials-track">
            {[...testimonialsData, ...testimonialsData].map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-header">
                  <img src={testimonial.pic} alt={testimonial.name} className="testimonial-avatar" />
                  <div className="testimonial-info">
                    <h4>{testimonial.name}</h4>
                    <span className="testimonial-date">{testimonial.date}</span>
                  </div>
                </div>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} />
                  ))}
                </div>
                <p className="testimonial-text">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section">
        <div className="gallery-container">
          <div className="section-header">
            <span className="section-badge">Galeria</span>
            <h2 className="section-title">Nuestra <span>Coleccion</span></h2>
          </div>

          <div className="gallery-grid">
            {[imgd, imgd2, imgd3].map((img, index) => (
              <div key={index} className="gallery-item" onClick={() => openLightbox(img)}>
                <img src={img} alt={`Galeria ${index + 1}`} />
                <div className="gallery-item-overlay">
                  <span>
                    <FiZoomIn /> Ver imagen
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment Form */}
      <FormularioComentario onSubmit={handleSubmitComment} />

      {/* Lightbox */}
      {lightboxVisible && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            <FiX />
          </button>
          <img
            src={selectedImage}
            alt="Imagen ampliada"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </Container>
  );
};

export default HomePage;
