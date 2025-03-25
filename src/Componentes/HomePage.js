import imgd from "../imagenes/re1.jpg";
import imgd2 from "../imagenes/re2.jpeg";
import imgd3 from "../imagenes/re3.jpeg";
import profilePic1 from "../imagenes/32.jpg";
import profilePic2 from "../imagenes/cs.jpeg";
import profilePic3 from "../imagenes/cxxx.jpeg";
import profilePic4 from "../imagenes/bbb.jpeg";
import FormularioComentario from './Componentes/FormularioComentario';
import ob from "../imagenes/t1.jpg"
import ob2 from "../imagenes/mn2.jpeg"
import Container from 'react-bootstrap/Container';
import React from "react";
import { useState } from "react";

const HomePage = () => {
    const [lightboxVisible, setLightboxVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [fadeClass, setFadeClass] = useState('');
    const [comments, setComments] = useState([]);
  
    const openLightbox = (image) => {
      setSelectedImage(image);
      setLightboxVisible(true);
      setTimeout(() => setFadeClass('fade-in'), 10000); // Delay to allow for the class to take effect
    };
  
    const closeLightbox = () => {
      setFadeClass('fade-out'); // Add the fade-out class
      setTimeout(() => {
        setLightboxVisible(false);
        setSelectedImage('');
        setFadeClass(''); // Reset after animation
      }, 300); // Match this with the duration of your fade-out animation
    };
  
    const handleSubmitComment = (newComment) => {
      setComments([...comments, newComment]);
    };
  
    return (
      <Container fluid className="homepage-container p-0">
        <Container fluid className="p-0">
          <div className="img-container relative h-[60vh] lg:h-[80vh] overflow-hidden">
            {/* Imagen de fondo con superposición */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60 flex flex-col items-center justify-center text-white text-center p-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 shadow-lg">Descubre la Elegancia del Tiempo</h1>
              <p className="text-lg md:text-xl lg:text-2xl font-medium shadow-md">
                Relojes de alta calidad para cada ocasión
              </p>
            </div>
            {/* Botón Ver Ofertas */}
            <div className="absolute bottom-10 right-10 lg:right-20">
              <a href="/" className="custom-red-button-unique relative inline-block px-8 py-4 bg-red-600 text-white text-lg font-bold rounded-full hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-2xl">
                Ver Ofertas
              </a>
            </div>
          </div>
          {/* Contenedor 1 */}
          <div className="contenedor1 bg- black-100 p-8 flex flex-col lg:flex-row items-center lg:items-start lg:justify-between space-y-6 lg:space-y-0">
            <div className="texto-objetivo lg:w-1/2 space-y-4">
              <h2 className="text-3xl font-bold text-red-800">Nuestra Misión</h2>
              <p className="text-lg text-white-600">
                Nuestro objetivo es ofrecer productos de alta calidad a precios competitivos,
                brindando una experiencia única para todos nuestros clientes. Nos esforzamos por
                mejorar cada día y asegurar que nuestros clientes estén siempre satisfechos.
              </p>
            </div>
            <div className="imagen-derecha lg:w-1/2 flex justify-center lg:justify-end">
              <img className="rounded-lg shadow-lg max-w-full" src={ob} alt="Misión" />
            </div>
          </div>
  
          {/* Contenedor 2 */}
          <div className="contenedor2 bg-black-100 p-8 flex flex-col lg:flex-row-reverse items-center lg:items-start lg:justify-between space-y-6 lg:space-y-0">
            <div className="imagen-izquierda lg:w-1/2 flex justify-center lg:justify-start">
              <img className="rounded-lg shadow-lg max-w-full" src={ob2} alt="Objetivo" />
            </div>
            <div className="texto-objetivo lg:w-1/2 space-y-4">
              <h2 className="text-3xl font-bold text-red-800">Nuestro Objetivo</h2>
              <p className="text-lg text-white-600">
                Continuar expandiéndonos y adaptándonos a las nuevas necesidades del mercado,
                siempre con un enfoque en la innovación y la satisfacción del cliente. Queremos
                ser líderes en nuestra industria y un referente de calidad.
              </p>
            </div>
          </div>
  
          {/* Recuadros de valores */}
          <div className="contenedor">
            <h2 className="text-center">Nuestros Valores</h2>
          </div>
          <div className="values-container">
            {["Clientes Satisfechos", "Productos Vendidos", "Años de Experiencia", "Premios Ganados"].map((title, index) => (
              <div key={index} className="value-box">
                <h3>{title}</h3>
                <p>{[1500, 20000, 10, 15][index]}+</p>
              </div>
            ))}
          </div>
  
          {/* Desplazamiento de Comentarios */}
          <div className="comments-carousel">
            <h2>Comentarios de Nuestros Clientes</h2>
            <div className="comments-slider">
              <div className="image-slider">
                {[
                  { pic: profilePic1, text: "Excelente servicio y productos de alta calidad. ¡Recomiendo!", date: "01/09/2023" },
                  { pic: profilePic2, text: "Siempre encuentro lo que necesito y a buenos precios.", date: "02/09/2023" },
                  { pic: profilePic3, text: "La atención al cliente es excepcional. Estoy muy satisfecho.", date: "03/09/2023" },
                  { pic: profilePic4, text: "Sin duda volveré a comprar aquí. Me encanta su variedad.", date: "04/09/2023" },
                ].map((comment, index) => (
                  <div key={index} className="slider-item">
                    <div className="comment-box">
                      <img src={comment.pic} alt={`Cliente ${index + 1}`} className="profile-pic" />
                      <div className="comment-content">
                        <div className="stars">⭐⭐⭐⭐⭐</div>
                        <p>"{comment.text}"</p>
                        <footer>- Cliente {index + 1} <span className="comment-date">{comment.date}</span></footer>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Duplicar para el efecto continuo */}
                {[
                  { pic: profilePic1, text: "Excelente servicio y productos de alta calidad. ¡Recomiendo!", date: "01/09/2023" },
                  { pic: profilePic2, text: "Siempre encuentro lo que necesito y a buenos precios.", date: "02/09/2023" },
                  { pic: profilePic3, text: "La atención al cliente es excepcional. Estoy muy satisfecho.", date: "03/09/2023" },
                  { pic: profilePic4, text: "Sin duda volveré a comprar aquí. Me encanta su variedad.", date: "04/09/2023" },
                ].map((comment, index) => (
                  <div key={index + 4} className="slider-item">
                    <div className="comment-box">
                      <img src={comment.pic} alt={`Cliente ${index + 1}`} className="profile-pic" />
                      <div className="comment-content">
                        <div className="stars">⭐⭐⭐⭐⭐</div>
                        <p>"{comment.text}"</p>
                        <footer>- Cliente {index + 1} <span className="comment-date">{comment.date}</span></footer>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="gallery-container">
            <h2 className="text-center">Nuestra Galería</h2>
            <div className="gallery">
              {[imgd, imgd2, imgd3].map((img, index) => (
                <div key={index} className="gallery-item" onClick={() => openLightbox(img)}>
                  <img src={img} alt={`Galería ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
  
          <FormularioComentario onSubmit={handleSubmitComment} />
  
          {lightboxVisible && (
            <div className="imagen-light" onClick={closeLightbox}>
              <img
                className={`agregar-imagen ${fadeClass}`}
                src={selectedImage}
                alt="Imagen ampliada"
                onClick={(e) => e.stopPropagation()} // Prevent click on image from closing the lightbox
              />
            </div>
          )}
        </Container>
  
  
      </Container>
    );
  };

  export default HomePage;