import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import "../estilos/DetallesProducto.css";

const DetallesProducto = ({ onAddToCart }) => {
  const location = useLocation();
  const { imgSrcArray, title, description, price, stock, supplier, id } = location.state || {};
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [currentImage, setCurrentImage] = useState(imgSrcArray && imgSrcArray[0]);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

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

  const handleAddToCart = () => {
    onAddToCart({
      imgSrc: currentImage,
      title,
      description,
      price: numericPrice,
      stock,
      supplier,
      quantity,
      id
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (!title) {
    return (
      <div className="loading-page">
        <div className="loading-content">
          <div className="loading-spinner">
            <svg viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="3"/>
            </svg>
          </div>
          <p>Cargando producto...</p>
        </div>
      </div>
    );
  }

  const numericPrice = parseFloat(price);

  return (
    <div className="product-details-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/catalogo" className="breadcrumb-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Volver al catálogo
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{title}</span>
      </div>

      <div className="product-details-container">
        {/* Image Gallery */}
        <div className="product-gallery">
          {/* Thumbnails */}
          <div className="gallery-thumbnails">
            {Array.isArray(imgSrcArray) && imgSrcArray.map((img, index) => (
              <button
                key={index}
                className={`thumbnail ${currentImage === img ? 'active' : ''}`}
                onClick={() => handleImageClick(img)}
              >
                <img src={img} alt={`Vista ${index + 1}`} />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div
            className="main-image-container"
            onMouseEnter={() => setShowMagnifier(true)}
            onMouseLeave={() => setShowMagnifier(false)}
            onMouseMove={handleMouseMove}
          >
            <img
              src={currentImage}
              alt={title}
              className="main-image"
            />

            {/* Magnifier */}
            {showMagnifier && (
              <div
                className="magnifier"
                style={{
                  backgroundImage: `url(${currentImage})`,
                  backgroundPosition: `${position.x}% ${position.y}%`,
                  left: `${cursorPosition.x - 100}px`,
                  top: `${cursorPosition.y - 100}px`,
                }}
              />
            )}

            {/* Zoom hint */}
            <div className="zoom-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
                <path d="M11 8v6M8 11h6"/>
              </svg>
              Pasa el mouse para zoom
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          {/* Header */}
          <div className="info-header">
            <span className="product-brand">{supplier}</span>
            <h1 className="product-title">{title}</h1>
            <div className="product-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="star filled" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
              <span className="rating-text">5.0 (24 reseñas)</span>
            </div>
          </div>

          {/* Price */}
          <div className="price-section">
            <div className="price-main">
              <span className="currency">S/.</span>
              <span className="amount">{numericPrice.toFixed(2)}</span>
            </div>
            <span className="price-note">Precio incluye IGV</span>
          </div>

          {/* Stock */}
          <div className="stock-section">
            <div className="stock-indicator available">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <span>En stock - {stock}</span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="quantity-section">
            <span className="section-label">Cantidad:</span>
            <div className="quantity-selector">
              <button className="qty-btn" onClick={decrementQuantity}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14"/>
                </svg>
              </button>
              <span className="qty-value">{quantity}</span>
              <button className="qty-btn" onClick={incrementQuantity}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="actions-section">
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
                  Agregado al carrito
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  Agregar al carrito
                </>
              )}
            </button>
            <button className="wishlist-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          {/* Features */}
          <div className="features-section">
            <div className="feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              <div className="feature-text">
                <strong>Envío gratis</strong>
                <span>En pedidos mayores a S/.500</span>
              </div>
            </div>
            <div className="feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <div className="feature-text">
                <strong>Garantía de 2 años</strong>
                <span>Cobertura internacional</span>
              </div>
            </div>
            <div className="feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              <div className="feature-text">
                <strong>Original garantizado</strong>
                <span>Certificado de autenticidad</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="product-tabs">
        <div className="tabs-header">
          <button
            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Descripción
          </button>
          <button
            className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            Especificaciones
          </button>
          <button
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reseñas
          </button>
        </div>
        <div className="tabs-content">
          {activeTab === 'description' && (
            <div className="tab-panel">
              <p>{description}</p>
              <p className="description-extra">
                Este reloj representa la perfecta fusión entre tradición relojera y diseño contemporáneo.
                Cada detalle ha sido cuidadosamente elaborado para ofrecer una experiencia única de elegancia y precisión.
              </p>
            </div>
          )}
          {activeTab === 'specs' && (
            <div className="tab-panel specs-panel">
              <div className="spec-row">
                <span className="spec-label">Marca</span>
                <span className="spec-value">{supplier}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Modelo</span>
                <span className="spec-value">{title}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Material de la caja</span>
                <span className="spec-value">Acero inoxidable</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Resistencia al agua</span>
                <span className="spec-value">50 metros</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Tipo de movimiento</span>
                <span className="spec-value">Cuarzo japonés</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Garantía</span>
                <span className="spec-value">2 años</span>
              </div>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="tab-panel reviews-panel">
              <div className="review-summary">
                <div className="review-score">
                  <span className="score-number">5.0</span>
                  <div className="score-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="star" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="score-count">24 reseñas</span>
                </div>
              </div>
              <div className="reviews-list">
                <div className="review-item">
                  <div className="review-header">
                    <div className="reviewer-avatar">JC</div>
                    <div className="reviewer-info">
                      <span className="reviewer-name">Juan Carlos</span>
                      <span className="review-date">Hace 2 días</span>
                    </div>
                    <div className="review-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="star small" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="review-text">Excelente producto, la calidad es impresionante y llegó antes de lo esperado. Muy recomendado.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetallesProducto;
