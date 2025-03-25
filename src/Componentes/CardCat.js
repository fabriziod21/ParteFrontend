import React from 'react';
import { Link } from 'react-router-dom';

const CardCat = ({ imgSrc, title, description, price, stock, supplier, onAddToCart, id }) => {
  return (
    <div className="bg-[#000000] w-4/5 h-full text-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-xl">
      <div className="relative">
        {/* Contenedor con borde para la imagen */}
        <div className="border-16 border-[#000000] rounded-lg overflow-hidden">
          <img 
            src={imgSrc && imgSrc.length > 0 ? imgSrc[0] : ''} // Solo la primera imagen del arreglo
            alt="Producto" 
            className="w-full h-40 object-cover" 
          />
        </div>
      </div>
      <div className="p-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-gray-400 mt-1">{description}</p>
        <p className="text-xl font-bold mt-2 text-red-600">S/.{price}</p>
      </div>
      <div className="flex justify-between p-4">
        <button 
          className="bg-red-600 hover:bg-red-700 text-white font-semibold  rounded focus:outline-none transition"
          onClick={() => onAddToCart({ imgSrc, title, description, price, stock, supplier, quantity: 1 })}
        >
          Agregar al carrito
        </button>
        <Link 
          to={`/detalles/${id}`} 
          state={{ imgSrcArray: imgSrc, title, description, price, stock, supplier, id }} // Pasar el arreglo completo de imágenes a la página de detalles
        >
          <button
            className="bg-fuchsia-500 text-white font-semibold py-2 px-4 rounded focus:outline-none transition"
          >
            Info
          </button>
        </Link>
      </div>
    </div>
  );
};

export default CardCat;
