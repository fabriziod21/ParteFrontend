import React, { useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Estrellas from './Estrellas'; 
import axios from 'axios';  // Importamos Axios
import "../estilos/CajaComentarios.css";

const FormularioComentario = ({ onSubmit }) => {
  const [newComment, setNewComment] = useState('');
  const [calificacion, setCalificacion] = useState(0);

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Obtén el 'user' de sessionStorage
    const user = JSON.parse(sessionStorage.getItem('user'));  // Parseamos el objeto guardado en sessionStorage

    if (newComment.trim() && user) {
      const commentData = {
        contenido: newComment,  // Comentario que el usuario escribió
        estrellas: calificacion,
        estado:"inactivo", 
        fechaComentario: new Date().toISOString().split("T")[0], 
        usuario: { idUsuario: user.idUsuario },  // Usamos el idUsuario del objeto user
      };

      try {
        // Realizar la solicitud POST a tu API de Spring Boot
        const response = await axios.post('http://localhost:8080/api/comentarios/registrar', commentData);
        
        // Si la solicitud es exitosa, puedes hacer lo siguiente:
        console.log('Comentario enviado:', response.data);
        
        // Llamamos al onSubmit si es necesario
        onSubmit(response.data);

        // Limpiar campos del formulario
        setNewComment('');
        setCalificacion(0);
      } catch (error) {
        console.error('Error al enviar el comentario:', error);
      }
    } else {
      alert('El comentario no puede estar vacío y debes estar logueado.');
    }
  };

  return (
    <Row className="c feedback-form mt-4 no-gutters">
      <Col xs={12} md={6} className="p-2" data-aos="fade-up">
        <div className="cont text-white p-4 h-100 mt-20" data-aos="fade-right">
          <h2>¡Tu Opinión Cuenta!</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                value={newComment}
                onChange={handleCommentChange}
                placeholder="Escribe tu comentario aquí..."
                required
                rows={4}
                data-aos="zoom-in"
              />
            </Form.Group>
            <Estrellas value={calificacion} onChange={setCalificacion} />
            <Button type="submit" variant="danger" className="mt-2" data-aos="fade-up">Enviar</Button>
          </Form>
        </div>
      </Col>
      <Col xs={12} md={6} className="p-0" data-aos="fade-left">
        <iframe
          title="Ubicación de nuestra tienda en San Francisco"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.1801716716323!2d-122.41941538468157!3d37.77492927975976!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c1a45c6d3%3A0x203c7f6385a4e07d!2sSan%20Francisco%2C%20CA%2094103%2C%20EE.%20UU.!5e0!3m2!1ses!2ses!4v1695353157490!5m2!1ses!2ses"
          width="100%"
          height="500"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          data-aos="zoom-in" // Animación para el iframe
        ></iframe>
      </Col>
    </Row>
  );
};

export default FormularioComentario;

