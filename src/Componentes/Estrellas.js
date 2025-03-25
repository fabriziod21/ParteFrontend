import React from 'react';
import '../estilos/Estrellas.css'; // Asegúrate de crear este archivo para el estilo

const Estrellas = ({ value, onChange }) => {
  const manejarCalificacion = (valor) => {
    onChange(valor);
  };

  return (
    <div className="calificacion">
      {[...Array(5)].map((_, index) => {
        const valor = index + 1;
        return (
          <span
            key={valor}
            className={`estrella ${valor <= value ? 'estrella-activa' : ''}`}
            onClick={() => manejarCalificacion(valor)}
            onMouseEnter={() => manejarCalificacion(valor)}
            onMouseLeave={() => manejarCalificacion(value)}
          >
            ★
          </span>
        );
      })}
      <p>Calificación: {value} {value ? 'estrella(s)' : ''}</p>
    </div>
  );
};

export default Estrellas;