import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

// Componente para mostrar las estrellas
const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(i < rating ? '★' : '☆');
  }
  return <span>{stars.join(' ')}</span>;
};

const Coments = ({ darkMode }) => {
  const [comments, setComments] = useState([]);
  const [filterRating, setFilterRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 5;

  // Cargar comentarios desde el backend
  useEffect(() => {
    axios.get('http://localhost:8080/api/comentarios/listar')
      .then(response => setComments(response.data))
      .catch(error => console.error('Error cargando comentarios:', error));
  }, []);

  // Cambiar estado de comentario en el backend
  const toggleCommentStatus = (id) => {
    const commentToToggle = comments.find(comment => comment.idComentario === id);
    const activeComments = comments.filter(comment => comment.estado === 'Activo').length;
  
    if (commentToToggle.estado === 'Inactivo' && activeComments >= 4) {
      Swal.fire({
        icon: 'error',
        title: '¡Límite alcanzado!',
        text: 'No puedes activar más de 4 comentarios.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
  
    axios.patch(`http://localhost:8080/api/comentarios/actualizar/${id}`)
      .then(() => {
        setComments(prevComments => {
          const updatedComments = prevComments.map(comment =>
            comment.idComentario === id
              ? { ...comment, estado: comment.estado === 'Activo' ? 'Inactivo' : 'Activo' }
              : comment
          );
          return updatedComments;
        });
      })
      .catch(error => {
        console.error('Error cambiando estado:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cambiar el estado del comentario',
        });
      });
  };

  const filteredComments = filterRating === 0
    ? comments
    : comments.filter(comment => comment.estrellas === filterRating);

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = filteredComments.slice(indexOfFirstComment, indexOfLastComment);
  const totalPages = Math.ceil(filteredComments.length / commentsPerPage);

  const formatDate = (fechaComentario) => {
    const date = new Date(fechaComentario);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const handleFilterChange = (e) => {
    setFilterRating(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  return (
    <div className={`flex flex-col min-h-screen p-4 transition-colors duration-500 ${darkMode ? 'bg-fondo text-white' : 'bg-white text-black'}`}>
      <h1 className="text-2xl font-bold mb-4">Gestionar Comentarios</h1>

      {/* Filtro de estrellas */}
      <div className="mb-4">
        <label htmlFor="filterRating" className="mr-2">Filtrar por calificación (estrellas):</label>
        <select
          id="filterRating"
          value={filterRating}
          onChange={handleFilterChange}
          className={`p-2 rounded-md transition-colors duration-500 ${darkMode ? 'bg-black text-white' : 'bg-white text-black'} border ${darkMode ? 'border-black' : 'border-gray-300'}`}
        >
          <option value={0}>Todas</option>
          <option value={1}>1 estrella</option>
          <option value={2}>2 estrellas</option>
          <option value={3}>3 estrellas</option>
          <option value={4}>4 estrellas</option>
          <option value={5}>5 estrellas</option>
        </select>
      </div>

      {/* Lista de comentarios */}
      <div className="flex-1 mb-10">
        <h2 className="text-xl mb-2">Comentarios:</h2>
        <ul className="space-y-4">
          {currentComments.length === 0 ? (
            <li className="text-center">No hay comentarios para mostrar.</li>
          ) : (
            currentComments.map((comment) => (
              <li key={comment.idComentario} className={`p-4 rounded-lg shadow-lg flex flex-col space-y-2 transition-colors duration-500 ${darkMode ? 'bg-bgper text-white' : 'bg-white text-black'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-lg">{comment.nombreUsuario}</span>
                    <p className="text-sm">{formatDate(comment.fechaCreacion)}</p>
                  </div>
                  <button
                    onClick={() => toggleCommentStatus(comment.idComentario)}
                    className={`ml-4 px-4 py-2 ${comment.estado === 'Activo' ? (darkMode ? 'bg-red-700' : 'bg-red-500') : (darkMode ? 'bg-green-700' : 'bg-green-500')} text-white rounded-md`}
                  >
                    {comment.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
                <p>{comment.contenido}</p>
                <StarRating rating={comment.estrellas} />
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Paginación */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 transition-colors duration-500 ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-300 text-black'} rounded-md mr-2`}
        >
          Anterior
        </button>
        <span className="self-center">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 transition-colors duration-500 ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-300 text-black'} rounded-md ml-2`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Coments;
