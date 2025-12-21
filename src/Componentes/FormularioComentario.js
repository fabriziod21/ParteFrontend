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

  return (
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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.1801716716323!2d-122.41941538468157!3d37.77492927975976!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c1a45c6d3%3A0x203c7f6385a4e07d!2sSan%20Francisco%2C%20CA%2094103%2C%20EE.%20UU.!5e0!3m2!1ses!2ses!4v1695353157490!5m2!1ses!2ses"
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
                <span>San Francisco, CA 94103, EE. UU.</span>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default FormularioComentario;

