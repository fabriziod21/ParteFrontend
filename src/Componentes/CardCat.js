import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../estilos/CardCat.css';

const CardCat = ({ imgSrc, title, description, price, stock, supplier, onAddToCart, id, isNew }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAddedAnimation, setShowAddedAnimation] = useState(false);

  // Parsear el stock para obtener el número
  const stockNumber = typeof stock === 'string'
    ? parseInt(stock.match(/\d+/)?.[0] || '0')
    : (stock || 0);

  // Determinar el badge a mostrar
  const getBadgeInfo = () => {
    if (stockNumber === 0) return { type: 'out-of-stock', text: 'Agotado' };
    if (stockNumber <= 3) return { type: 'low-stock', text: `¡Últimas ${stockNumber}!` };
    if (isNew) return { type: 'new', text: 'Nuevo' };
    return null;
  };

  const badgeInfo = getBadgeInfo();

  // Cargar favoritos del localStorage
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(id));
  }, [id]);

  // Cambiar imagen en hover si hay múltiples imágenes
  useEffect(() => {
    let interval;
    if (isHovered && imgSrc && imgSrc.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % imgSrc.length);
      }, 1500);
    } else {
      setCurrentImageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, imgSrc]);

  const handleAddToCart = () => {
    if (stockNumber === 0) return;

    onAddToCart({ imgSrc, title, description, price, stock, supplier, quantity: 1 });
    setAddedToCart(true);
    setShowAddedAnimation(true);

    setTimeout(() => setShowAddedAnimation(false), 600);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let newFavorites;

    if (isFavorite) {
      newFavorites = favorites.filter(fav => fav !== id);
    } else {
      newFavorites = [...favorites, id];
    }

    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const currentImage = imgSrc && imgSrc.length > 0 ? imgSrc[currentImageIndex] : '';

  return (
    <div
      className={`product-card ${showAddedAnimation ? 'cart-animation' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="product-image-container">
        <img
          src={currentImage}
          alt={title}
          className={`product-image ${isHovered ? 'zoomed' : ''}`}
        />

        {/* Indicadores de imagen */}
        {imgSrc && imgSrc.length > 1 && (
          <div className="image-indicators">
            {imgSrc.map((_, index) => (
              <span
                key={index}
                className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        )}

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

        {/* Badge dinámico */}
        {badgeInfo && (
          <div className={`product-status-badge ${badgeInfo.type}`}>
            {badgeInfo.type === 'out-of-stock' && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M15 9l-6 6M9 9l6 6"/>
              </svg>
            )}
            {badgeInfo.type === 'low-stock' && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            )}
            {badgeInfo.type === 'new' && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            )}
            <span>{badgeInfo.text}</span>
          </div>
        )}

        {/* Botón de favorito */}
        <button
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={toggleFavorite}
          title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <svg viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>

        {/* Badge del reloj (solo si no hay otro badge) */}
        {!badgeInfo && (
          <div className="product-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
        )}
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

        {/* Stock indicator */}
        <div className="stock-indicator">
          <div className={`stock-bar ${stockNumber === 0 ? 'empty' : stockNumber <= 3 ? 'low' : 'available'}`}>
            <div
              className="stock-fill"
              style={{ width: `${Math.min((stockNumber / 20) * 100, 100)}%` }}
            />
          </div>
          <span className={`stock-text ${stockNumber === 0 ? 'out' : stockNumber <= 3 ? 'low' : ''}`}>
            {stockNumber === 0 ? 'Sin stock' : `${stockNumber} disponibles`}
          </span>
        </div>

        <div className="product-footer">
          <div className="product-price">
            <span className="currency">S/.</span>
            <span className="amount">{parseFloat(price).toFixed(2)}</span>
          </div>

          <button
            className={`add-to-cart-btn ${addedToCart ? 'added' : ''} ${stockNumber === 0 ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={addedToCart || stockNumber === 0}
          >
            {addedToCart ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Agregado
              </>
            ) : stockNumber === 0 ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M15 9l-6 6M9 9l6 6"/>
                </svg>
                Agotado
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
