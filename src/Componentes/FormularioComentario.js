import React, { useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Estrellas from './Estrellas';
import api from '../services/api';
import "../estilos/CajaComentarios.css";

const FormularioComentario = ({ onSubmit }) => {
  const [newComment, setNewComment] = useState('');
  const [calificacion, setCalificacion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: "¿Cuáles son los métodos de pago disponibles?",
      answer: "Aceptamos tarjetas de crédito/débito (Visa, Mastercard, American Express), transferencias bancarias, Yape, Plin y pago contra entrega en Lima Metropolitana."
    },
    {
      question: "¿Cuánto tiempo tarda el envío?",
      answer: "Los envíos en Lima Metropolitana tardan de 1 a 3 días hábiles. Para provincias, el tiempo estimado es de 3 a 7 días hábiles dependiendo de la ubicación."
    },
    {
      question: "¿Tienen garantía los productos?",
      answer: "Sí, todos nuestros relojes cuentan con garantía de 1 año por defectos de fábrica. La garantía no cubre daños por mal uso o accidentes."
    },
    {
      question: "¿Puedo devolver un producto?",
      answer: "Tienes hasta 7 días después de recibir tu pedido para solicitar un cambio o devolución. El producto debe estar en perfectas condiciones y con su empaque original."
    },
    {
      question: "¿Los relojes son originales?",
      answer: "Garantizamos la autenticidad de todos nuestros productos. Trabajamos directamente con distribuidores autorizados y cada reloj viene con su certificado de autenticidad."
    },
    {
      question: "¿Realizan envíos internacionales?",
      answer: "Por el momento solo realizamos envíos dentro de Perú. Estamos trabajando para expandir nuestros servicios a otros países de Latinoamérica próximamente."
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const user = JSON.parse(sessionStorage.getItem('user'));

    if (newComment.trim() && user) {
      const commentData = {
        contenido: newComment,
        estrellas: calificacion,
        estado: "inactivo",
        fechaComentario: new Date().toISOString().split("T")[0],
        usuario: { idUsuario: user.idUsuario },
      };

      try {
        const response = await api.post('/api/comentarios/registrar', commentData);
        console.log('Comentario enviado:', response.data);
        onSubmit(response.data);
        setNewComment('');
        setCalificacion(0);
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      } catch (error) {
        console.error('Error al enviar el comentario:', error);
      }
    } else {
      alert('El comentario no puede estar vacío y debes estar logueado.');
    }
    setIsSubmitting(false);
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = "51937601412"; // Cambia por tu número de WhatsApp
    const message = "¡Hola! Me gustaría obtener más información sobre sus productos.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="contact-hero-content">
          <span className="contact-badge">Contáctanos</span>
          <h1 className="contact-hero-title">Estamos Aquí Para Ayudarte</h1>
          <p className="contact-hero-subtitle">
            ¿Tienes alguna pregunta o comentario? No dudes en contactarnos
          </p>
        </div>
      </div>

      {/* WhatsApp Contact Section */}
      <div className="whatsapp-section" data-aos="fade-up">
        <div className="whatsapp-container">
          <div className="whatsapp-content">
            <div className="whatsapp-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div className="whatsapp-text">
              <h3>¿Necesitas ayuda inmediata?</h3>
              <p>Contáctanos por WhatsApp y te responderemos en minutos</p>
            </div>
          </div>
          <button className="whatsapp-btn" onClick={handleWhatsAppClick}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Escribir por WhatsApp
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section" data-aos="fade-up">
        <div className="faq-header">
          <span className="faq-badge">FAQ</span>
          <h2 className="faq-title">Preguntas Frecuentes</h2>
          <p className="faq-subtitle">Encuentra respuestas a las dudas más comunes</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${openFaq === index ? 'active' : ''}`}
              onClick={() => toggleFaq(index)}
            >
              <div className="faq-question">
                <span className="faq-number">0{index + 1}</span>
                <h4>{faq.question}</h4>
                <div className="faq-toggle">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </div>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="contact-info-section" data-aos="fade-up">
        <div className="contact-info-grid">
          <div className="contact-info-card">
            <div className="contact-info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
              </svg>
            </div>
            <h4>Teléfono</h4>
            <p>+51 999 999 999</p>
            <span>Lun - Sab: 9am - 7pm</span>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <path d="M22 6l-10 7L2 6"/>
              </svg>
            </div>
            <h4>Email</h4>
            <p>contacto@luxurywatch.com</p>
            <span>Respuesta en 24h</span>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <h4>Ubicación</h4>
            <p>Lima, Perú</p>
            <span>Visitas con cita previa</span>
          </div>
        </div>
      </div>

      {/* Feedback Form Section */}
      <div className="feedback-section" data-aos="fade-up">
        <Row className="c feedback-form mx-auto g-4">
          {/* Formulario */}
          <Col xs={12} lg={6} data-aos="fade-right">
            <div className="cont">
              {/* Header */}
              <div className="feedback-header">
                <span className="subtitle">Comparte tu experiencia</span>
                <h2>Tu Opinión Cuenta</h2>
                <div className="divider"></div>
              </div>

              {/* Success Message */}
              {submitSuccess && (
                <div className="mb-4 p-3 rounded-lg text-center" style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  color: '#22c55e'
                }}>
                  <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ¡Gracias por tu comentario!
                </div>
              )}

              <Form onSubmit={handleSubmit} className="comment-form">
                {/* Textarea */}
                <div className="form-group-custom">
                  <label>Tu comentario</label>
                  <Form.Control
                    as="textarea"
                    value={newComment}
                    onChange={handleCommentChange}
                    placeholder="Cuéntanos tu experiencia con nuestros productos..."
                    required
                    rows={5}
                    maxLength={500}
                  />
                  <div className={`char-counter ${newComment.length > 450 ? (newComment.length > 480 ? 'limit' : 'warning') : ''}`}>
                    {newComment.length}/500
                  </div>
                </div>

                {/* Estrellas */}
                <div className="form-group-custom">
                  <label>Tu calificación</label>
                  <Estrellas value={calificacion} onChange={setCalificacion} />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="submit-btn w-100"
                  disabled={isSubmitting || !newComment.trim() || calificacion === 0}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Enviar Comentario
                    </>
                  )}
                </Button>
              </Form>
            </div>
          </Col>

          {/* Mapa */}
          <Col xs={12} lg={6} data-aos="fade-left">
            <div className="map-container">
              <iframe
                title="Ubicación de nuestra tienda"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.9664799940685!2d-77.03196122538858!3d-12.046373988139544!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8b5d35662c7%3A0x15f0bda5ccbd31eb!2sPlaza%20Mayor%20de%20Lima!5e0!3m2!1ses!2spe!4v1703180000000!5m2!1ses!2spe"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '500px' }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
              {/* Location Info Overlay */}
              <div className="location-info">
                <div className="icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div className="text">
                  <strong>Visítanos</strong>
                  <span>Centro de Lima, Perú</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Floating WhatsApp Button */}
      <button className="whatsapp-floating" onClick={handleWhatsAppClick} aria-label="Contactar por WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </button>
    </div>
  );
};

export default FormularioComentario;
