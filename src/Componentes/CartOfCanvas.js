import React from 'react';
import PropTypes from 'prop-types';
import { Offcanvas } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import "../estilos/Carrito.css";

const CartOffCanvas = ({ show, onHide, cartItems = [], onRemove, increaseQuantity, decreaseQuantity, total = 0 }) => {
  const navigate = useNavigate();

  const handleCheckout = () => {
    onHide();
    navigate('/resumen');
  };

  const parsePrice = (price) => {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      return parseFloat(price.replace(/[^0-9.-]+/g, '')) || 0;
    }
    return 0;
  };

  const formatTotal = (value) => {
    const num = typeof value === 'number' ? value : parseFloat(value) || 0;
    return num.toFixed(2);
  };

  return (
    <Offcanvas show={show} onHide={onHide} placement="end" className="cart-offcanvas">
      {/* Header */}
      <div className="cart-header">
        <div className="cart-header-content">
          <div className="cart-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </div>
          <div>
            <h2 className="cart-title">Mi Carrito</h2>
            <span className="cart-count">{cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'}</span>
          </div>
        </div>
        <button className="cart-close-btn" onClick={onHide}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="cart-body">
        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <h3 className="cart-empty-title">Tu carrito está vacío</h3>
            <p className="cart-empty-text">Agrega productos para comenzar tu compra</p>
            <button className="cart-browse-btn" onClick={onHide}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              Seguir comprando
            </button>
          </div>
        ) : (
          <div className="cart-items">
            {cartItems.map((item) => {
              const itemPrice = parsePrice(item.price);
              const itemTotal = itemPrice * item.quantity;

              return (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    <img src={item.imgSrc} alt={item.title} />
                  </div>
                  <div className="cart-item-content">
                    <div className="cart-item-header">
                      <h4 className="cart-item-title">{item.title}</h4>
                      <button
                        className="cart-item-remove"
                        onClick={() => onRemove(item.id)}
                        aria-label={`Eliminar ${item.title}`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                    <div className="cart-item-price">
                      <span className="price-unit">S/.{itemPrice.toFixed(2)}</span>
                    </div>
                    <div className="cart-item-footer">
                      <div className="cart-item-quantity">
                        <button
                          className="qty-btn"
                          onClick={() => decreaseQuantity(item.id)}
                          disabled={item.quantity <= 1}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14"/>
                          </svg>
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => increaseQuantity(item.id)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14"/>
                          </svg>
                        </button>
                      </div>
                      <div className="cart-item-total">
                        <span className="total-label">Total:</span>
                        <span className="total-value">S/.{itemTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {cartItems.length > 0 && (
        <div className="cart-footer">
          <div className="cart-summary">
            <div className="summary-row">
              <span className="summary-label">Subtotal</span>
              <span className="summary-value">S/.{formatTotal(total)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Envío</span>
              <span className="summary-value free">Gratis</span>
            </div>
            <div className="summary-row total">
              <span className="summary-label">Total</span>
              <span className="summary-value">S/.{formatTotal(total)}</span>
            </div>
          </div>
          <button className="cart-checkout-btn" onClick={handleCheckout}>
            <span>Proceder al pago</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <button className="cart-continue-btn" onClick={onHide}>
            Seguir comprando
          </button>
        </div>
      )}
    </Offcanvas>
  );
};

CartOffCanvas.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  cartItems: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    imgSrc: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
  })),
  onRemove: PropTypes.func.isRequired,
  increaseQuantity: PropTypes.func.isRequired,
  decreaseQuantity: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired,
};

export default CartOffCanvas;
