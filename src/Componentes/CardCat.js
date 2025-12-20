import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../estilos/CardCat.css';

const CardCat = ({ imgSrc, title, description, price, stock, supplier, onAddToCart, id }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    onAddToCart({ imgSrc, title, description, price, stock, supplier, quantity: 1 });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="product-image-container">
        <img
          src={imgSrc && imgSrc.length > 0 ? imgSrc[0] : ''}
          alt={title}
          className="product-image"
        />
        <div className="product-overlay">
          <Link
            to={`/detalles/${id}`}
            state={{ imgSrcArray: imgSrc, title, description, price, stock, supplier, id }}
            className="quick-view-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Ver detalles
          </Link>
        </div>
        {/* Badge */}
        <div className="product-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="product-content">
        <div className="product-header">
          <h3 className="product-title">{title}</h3>
          <span className="product-supplier">{supplier}</span>
        </div>

        <p className="product-description">
          {description && description.length > 80
            ? `${description.substring(0, 80)}...`
            : description}
        </p>

        <div className="product-footer">
          <div className="product-price">
            <span className="currency">S/.</span>
            <span className="amount">{parseFloat(price).toFixed(2)}</span>
          </div>

          <button
            className={`add-to-cart-btn ${addedToCart ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={addedToCart}
          >
            {addedToCart ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Agregado
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Agregar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardCat;
