import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import "../estilos/Lupa.css";

const DetallesProducto = ({ onAddToCart }) => {
  const location = useLocation();
  const { imgSrcArray, title, description, price, stock, supplier, id } = location.state || {};
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [currentImage, setCurrentImage] = useState(imgSrcArray && imgSrcArray[0]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setPosition({ x, y });
    setCursorPosition({ x: e.pageX - left, y: e.pageY - top });
  };

  const handleImageClick = (img) => {
    setCurrentImage(img);
  };

  if (!title) {
    return <div className="text-white">Cargando...</div>;
  }

  const numericPrice = parseFloat(price);

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-fondo text-white px-4">
      <div className="flex flex-col lg:flex-row items-center bg-bgper p-6 lg:p-8 rounded-lg shadow-lg w-full max-w-5xl ">
        <div className="flex-1 text-center lg:mb-0 justify-center items-center">
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <p className="text-gray-400">{description}</p>
          <p className="text-xl font-bold mt-2 text-red-600">Precio: S/.{numericPrice.toFixed(2)}</p>
          <p className="mt-2">Stock: {stock} unidades disponibles</p>
          <p className="mt-2">Proveedor: {supplier}</p>

          <button 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
            onClick={() => onAddToCart({ imgSrc: currentImage, title, description, price: numericPrice, stock, supplier, quantity: 1, id })}
          >
            Agregar al carrito
          </button>
        </div>

        <div 
          className='img-magnifier-container relative w-full lg:w-1/2 h-64 lg:h-80 '
          onMouseEnter={() => setShowMagnifier(true)}
          onMouseLeave={() => setShowMagnifier(false)}
          onMouseMove={handleMouseMove}
        >
          <img 
            src={currentImage} 
            alt={title} 
            className="magnifier-img w-full h-full object-cover rounded-lg" 
          />
          
          {showMagnifier && (
            <div
              className="magnifier-image"
              style={{
                backgroundImage: `url(${currentImage})`,
                backgroundPosition: `${position.x}% ${position.y}%`,
                backgroundSize: '300%',
                width: '250px',
                height: '250px',
                border: '2px solid white',
                borderRadius: '8px',
                position: 'absolute',
                left: `${cursorPosition.x - 125}px`, 
                top: `${cursorPosition.y - 125}px`,   
                pointerEvents: 'none',
                zIndex: 10,
              }}
            />
          )}
        </div>

        <div className="flex-col-reverse w-full lg:w-1/4 p-4">
          <div className="flex flex-col gap-4">
            {Array.isArray(imgSrcArray) && imgSrcArray.map((img, index) => (
              <div 
                key={index} 
                className="relative w-full h-24 rounded-lg blur-sm cursor-pointer transition-transform duration-300 hover:scale-105 hover:blur-none hover:overflow-hidden"
                onClick={() => handleImageClick(img)}
              >
                <img 
                  src={img} 
                  alt={`Vista ${index + 1}`} 
                  className="w-full h-full object-cover rounded-lg transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallesProducto;
