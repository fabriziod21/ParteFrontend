import React, { useEffect, useState } from 'react';
import { FaShop, FaUser, FaTruck, FaCreditCard, FaPlus, FaTrash, FaCheck } from "react-icons/fa6";
import { TbTruckDelivery } from "react-icons/tb";
import { FaCcVisa, FaCcMastercard, FaMoneyBillWave } from 'react-icons/fa';
import { HiOutlineShoppingBag } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from "../services/api";
import "../estilos/Resumen.css";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [deliveryOption, setDeliveryOption] = useState('pickup');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [responsibles, setResponsibles] = useState(['']);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cardInfo, setCardInfo] = useState({ number: '', expiry: '', cvv: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [savedCards, setSavedCards] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [cardLogo, setCardLogo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUserDetails(JSON.parse(storedUser));
    }

    const storedItems = localStorage.getItem('cartItems');
    if (storedItems) {
      setCartItems(JSON.parse(storedItems));
    }

    loadSavedCards();
  }, []);

  const loadSavedCards = () => {
    const cards = JSON.parse(localStorage.getItem('savedCards')) || [];
    setSavedCards(cards);
  };

  const handleBackToCatalog = () => {
    navigate('/catalogo');
  };

  const handleResponsibleChange = (index, value) => {
    const newResponsibles = [...responsibles];
    newResponsibles[index] = value;
    setResponsibles(newResponsibles);
  };

  const addResponsible = () => {
    if (responsibles.length < 2) {
      setResponsibles([...responsibles, '']);
    }
  };

  const removeResponsible = (index) => {
    const newResponsibles = responsibles.filter((_, i) => i !== index);
    setResponsibles(newResponsibles);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = parseFloat(item.price.replace('$', '')) || 0;
      return total + itemPrice * item.quantity;
    }, 0).toFixed(2);
  };

  const calculateIGV = (subtotal) => {
    return (subtotal * 0.18).toFixed(2);
  };

  const calculateTotal = (subtotal) => {
    let shippingCost = deliveryOption === 'delivery' ? 2 : 0;
    return (parseFloat(subtotal) + parseFloat(calculateIGV(subtotal)) + shippingCost).toFixed(2);
  };

  const handleCardNumberChange = (e) => {
    const { value } = e.target;
    const formattedValue = value.replace(/\D/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim()
      .slice(0, 19);
    setCardInfo({ ...cardInfo, number: formattedValue });

    if (formattedValue.startsWith('4')) {
      setCardLogo(<FaCcVisa className="text-blue-600" />);
    } else if (formattedValue.startsWith('5')) {
      setCardLogo(<FaCcMastercard className="text-red-600" />);
    } else {
      setCardLogo(null);
    }
  };

  const handleExpiryChange = (e) => {
    const { value } = e.target;
    const formattedValue = value.replace(/\D/g, '')
      .replace(/(.{2})/, '$1/')
      .slice(0, 5);
    setCardInfo({ ...cardInfo, expiry: formattedValue });
  };

  const handleCVCChange = (e) => {
    const { value } = e.target;
    const formattedValue = value.replace(/\D/g, '').slice(0, 3);
    setCardInfo({ ...cardInfo, cvv: formattedValue });
  };

  const validateCardInfo = () => {
    const errors = {};
    const cardNumberRegex = /^(4\d{3}|5[1-5]\d{2}) \d{4} \d{4} \d{4}$/;
    const cvvRegex = /^\d{3}$/;
    const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;

    if (!cardNumberRegex.test(cardInfo.number)) {
      errors.number = 'Numero de tarjeta invalido (solo Visa o MasterCard)';
    }
    if (!expiryRegex.test(cardInfo.expiry)) {
      errors.expiry = 'Fecha de expiracion invalida (formato MM/AA)';
    }
    if (!cvvRegex.test(cardInfo.cvv)) {
      errors.cvv = 'CVV invalido (3 digitos)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const today = new Date();
    const selectedDateTime = new Date(selectedDate);
    const currentTime = today.getHours();

    if (selectedDateTime.toDateString() === today.toDateString() && currentTime >= 11) {
      setErrorMessage('Solo disponible hoy hasta las 11 AM.');
      setDeliveryDate('');
    } else if (selectedDateTime < today) {
      setErrorMessage('No se puede seleccionar una fecha anterior a hoy.');
      setDeliveryDate('');
    } else {
      setErrorMessage('');
      setDeliveryDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const subtotal = calculateSubtotal();
    const total = calculateTotal(subtotal);

    const fechaPeru = new Date().toLocaleDateString("es-PE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).split("/").reverse().join("-");

    const pedidoData = {
      pedido: {
        fecha: fechaPeru,
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        metodoPago: paymentMethod === "cash" ? "Efectivo" : "Tarjeta",
        total: total,
        estado: "Pendiente",
        direccionEntrega: deliveryAddress,
        fechaEntrega: deliveryDate,
        tipoEntrega: deliveryOption === "delivery" ? "delivery" : "recoge en tienda",
        responsableRecojo1: responsibles[0] || "",
        responsableRecojo2: responsibles[1] || "",
        usuario: {
          idUsuario: userDetails.idUsuario,
          correo: userDetails.correo,
          nombre: userDetails.nombre,
          direccion: userDetails.direccion,
          telefono: userDetails.telefono,
        },
      },
      detallesPedido: cartItems.map(item => {
        const itemPrice = parseFloat(item.price.replace('$', '')) || 0;
        const itemTotal = itemPrice * item.quantity;
        return {
          producto: {
            idProducto: item.id,
            nombre: item.title
          },
          cantidad: item.quantity,
          importe: itemTotal.toFixed(2),
        };
      }),
    };

    try {
      const response = await api.post("/api/pedido/registrar", pedidoData);
      console.log("Pedido registrado con exito:", response.data.idPedido);

      Swal.fire({
        title: 'Compra exitosa!',
        text: 'Tu pedido se ha realizado con exito.',
        icon: 'success',
        background: '#0a0a0a',
        color: '#ffffff',
        confirmButtonColor: '#d4af37',
        confirmButtonText: 'Aceptar',
        timer: 3000,
        timerProgressBar: true,
      }).then(() => {
        localStorage.removeItem('cartItems');
        navigate("/catalogo");
      });

    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: 'Error!',
        text: 'Hubo un error al registrar el pedido. Intenta nuevamente.',
        icon: 'error',
        background: '#0a0a0a',
        color: '#ffffff',
        confirmButtonColor: '#dc3545',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveCardInfo = () => {
    if (validateCardInfo()) {
      const newCards = [...savedCards, cardInfo];
      localStorage.setItem('savedCards', JSON.stringify(newCards));
      setSavedCards(newCards);
      setCardInfo({ number: '', expiry: '', cvv: '' });
      setModalOpen(false);
      setCardLogo(null);
    }
  };

  const selectCard = (card, index) => {
    setCardInfo(card);
    setSelectedCardIndex(index);
  };

  const deleteCard = (index) => {
    const newCards = savedCards.filter((_, i) => i !== index);
    localStorage.setItem('savedCards', JSON.stringify(newCards));
    setSavedCards(newCards);
    if (selectedCardIndex === index) {
      setCardInfo({ number: '', expiry: '', cvv: '' });
      setCardLogo(null);
      setSelectedCardIndex(null);
    }
  };

  const getCardLogo = (number) => {
    if (number.startsWith('4')) {
      return <FaCcVisa className="text-blue-500" />;
    } else if (number.startsWith('5')) {
      return <FaCcMastercard className="text-red-500" />;
    }
    return null;
  };

  const subtotal = calculateSubtotal();
  const igv = calculateIGV(subtotal);
  const total = calculateTotal(subtotal);

  return (
    <div className="checkout-page">
      {/* Breadcrumb */}
      <nav className="checkout-breadcrumb">
        <ul>
          <li>
            <button onClick={handleBackToCatalog}>Catalogo</button>
          </li>
          <li>&gt;</li>
          <li>
            <button>Resumen del Pedido</button>
          </li>
        </ul>
      </nav>

      <div className="checkout-container">
        <h1 className="checkout-title">Finalizar Compra</h1>

        {/* Cards Grid */}
        <div className="checkout-grid">
          {/* User Info Card */}
          <div className="checkout-card">
            <div className="checkout-card-header">
              <div className="checkout-card-icon">
                <FaUser />
              </div>
              <h3 className="checkout-card-title">Identificacion</h3>
            </div>
            <div className="user-info-item">
              <span className="user-info-label">Nombre</span>
              <span className="user-info-value">{userDetails.nombre || '-'}</span>
            </div>
            <div className="user-info-item">
              <span className="user-info-label">Celular</span>
              <span className="user-info-value">{userDetails.telefono || '-'}</span>
            </div>
            <div className="user-info-item">
              <span className="user-info-label">Direccion</span>
              <span className="user-info-value">{userDetails.direccion || '-'}</span>
            </div>
            <div className="user-info-item">
              <span className="user-info-label">Correo</span>
              <span className="user-info-value">{userDetails.correo || '-'}</span>
            </div>
          </div>

          {/* Delivery Options Card */}
          <div className="checkout-card">
            <div className="checkout-card-header">
              <div className="checkout-card-icon">
                <FaTruck />
              </div>
              <h3 className="checkout-card-title">Opciones de Entrega</h3>
            </div>

            <div className="delivery-options">
              <button
                className={`delivery-option-btn ${deliveryOption === 'pickup' ? 'active' : ''}`}
                onClick={() => {
                  setDeliveryOption('pickup');
                  setDeliveryAddress('');
                }}
              >
                <FaShop />
                Recoger en tienda
              </button>
              <button
                className={`delivery-option-btn ${deliveryOption === 'delivery' ? 'active' : ''}`}
                onClick={() => setDeliveryOption('delivery')}
              >
                <TbTruckDelivery />
                Delivery
              </button>
            </div>

            {deliveryOption === 'delivery' && (
              <>
                <div className="checkout-form-group">
                  <label className="checkout-label">Direccion de Entrega</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Ingresa tu direccion"
                    className={`checkout-input ${validationErrors.address ? 'error' : ''}`}
                  />
                  {validationErrors.address && <p className="error-message">{validationErrors.address}</p>}
                </div>
                <div className="checkout-form-group">
                  <label className="checkout-label">Fecha de Entrega</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={handleDateChange}
                    className={`checkout-input ${validationErrors.date ? 'error' : ''}`}
                  />
                  {validationErrors.date && <p className="error-message">{validationErrors.date}</p>}
                  {errorMessage && <p className="error-message">{errorMessage}</p>}
                </div>
              </>
            )}

            <div className="responsible-section">
              <label className="checkout-label">Responsables de Recoger</label>
              {responsibles.map((responsible, index) => (
                <div key={index} className="responsible-item">
                  <input
                    type="text"
                    value={responsible}
                    onChange={(e) => handleResponsibleChange(index, e.target.value)}
                    placeholder="Nombre del responsable"
                    className="checkout-input"
                  />
                  {responsibles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeResponsible(index)}
                      className="responsible-remove-btn"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
              {responsibles.length < 2 && (
                <button onClick={addResponsible} className="add-responsible-btn">
                  <FaPlus /> Agregar Responsable
                </button>
              )}
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="checkout-card">
            <div className="checkout-card-header">
              <div className="checkout-card-icon">
                <FaCreditCard />
              </div>
              <h3 className="checkout-card-title">Metodo de Pago</h3>
            </div>

            <div className="payment-methods">
              <div
                className={`payment-method-option ${paymentMethod === 'cash' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                <div className="payment-radio"></div>
                <span className="payment-method-label">Efectivo</span>
                <FaMoneyBillWave className="payment-method-icon" />
              </div>
              <div
                className={`payment-method-option ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="payment-radio"></div>
                <span className="payment-method-label">Tarjeta</span>
                <FaCreditCard className="payment-method-icon" />
              </div>
            </div>

            {paymentMethod === 'card' && (
              <div className="saved-cards-section">
                <h4 className="saved-cards-title">Tarjetas Guardadas</h4>
                {savedCards.length > 0 ? (
                  savedCards.map((card, index) => (
                    <div
                      key={index}
                      className={`saved-card-item ${selectedCardIndex === index ? 'selected' : ''}`}
                    >
                      <div className="saved-card-info">
                        <span className="saved-card-logo">{getCardLogo(card.number)}</span>
                        <span className="saved-card-number">**** **** **** {card.number.slice(-4)}</span>
                      </div>
                      <div className="saved-card-actions">
                        <button
                          onClick={() => selectCard(card, index)}
                          className="card-action-btn select"
                        >
                          {selectedCardIndex === index ? <FaCheck /> : 'Seleccionar'}
                        </button>
                        {selectedCardIndex !== index && (
                          <button
                            onClick={() => deleteCard(index)}
                            className="card-action-btn delete"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    No hay tarjetas guardadas.
                  </p>
                )}
                <button
                  onClick={() => {
                    setCardInfo({ number: '', expiry: '', cvv: '' });
                    setModalOpen(true);
                  }}
                  className="add-card-btn"
                >
                  <FaPlus /> Agregar Nueva Tarjeta
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="order-summary-section">
          <div className="order-summary-header">
            <h2 className="order-summary-title">Resumen de Compra</h2>
            <p className="order-summary-subtitle">{cartItems.length} producto(s) en tu carrito</p>
          </div>

          {cartItems.length > 0 ? (
            <>
              <div className="products-table-container">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio</th>
                      <th>Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map(item => {
                      const itemPrice = parseFloat(item.price.replace('$', ''));
                      const itemTotal = (itemPrice * item.quantity).toFixed(2);
                      return (
                        <tr key={item.id}>
                          <td>
                            <img src={item.imgSrc} alt={item.title} className="product-table-image" />
                          </td>
                          <td className="product-table-name">{item.title}</td>
                          <td>{item.quantity}</td>
                          <td>{item.price}</td>
                          <td>S/.{itemTotal}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="order-totals">
                <div className="order-total-row">
                  <span className="order-total-label">Subtotal</span>
                  <span className="order-total-value">S/.{subtotal}</span>
                </div>
                <div className="order-total-row">
                  <span className="order-total-label">IGV (18%)</span>
                  <span className="order-total-value">S/.{igv}</span>
                </div>
                <div className="order-total-row">
                  <span className="order-total-label">Costo de Envio</span>
                  <span className={`order-total-value ${deliveryOption !== 'delivery' ? 'free' : ''}`}>
                    {deliveryOption === 'delivery' ? 'S/.2.00' : 'Gratis'}
                  </span>
                </div>
                <div className="order-total-row final">
                  <span className="order-total-label">Total</span>
                  <span className="order-total-value">S/.{total}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="empty-cart-message">No hay productos en el carrito.</p>
          )}

          <div className="checkout-submit-container">
            <button
              onClick={handleSubmit}
              className="checkout-submit-btn"
              disabled={isSubmitting || cartItems.length === 0}
            >
              <HiOutlineShoppingBag />
              {isSubmitting ? 'Procesando...' : 'Completar Pedido'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Card Modal */}
      {modalOpen && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal">
            <div className="checkout-modal-header">
              <h4 className="checkout-modal-title">Agregar Nueva Tarjeta</h4>
              <button className="checkout-modal-close" onClick={() => setModalOpen(false)}>
                X
              </button>
            </div>
            <div className="checkout-modal-body">
              <div className="checkout-form-group">
                <label className="checkout-label">Numero de Tarjeta</label>
                <div className="card-input-wrapper">
                  <input
                    type="text"
                    value={cardInfo.number}
                    onChange={handleCardNumberChange}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className={`checkout-input ${validationErrors.number ? 'error' : ''}`}
                  />
                  {cardLogo && <span className="card-logo">{cardLogo}</span>}
                </div>
                {validationErrors.number && <p className="error-message">{validationErrors.number}</p>}
              </div>
              <div className="checkout-form-group">
                <label className="checkout-label">Fecha de Expiracion</label>
                <input
                  type="text"
                  value={cardInfo.expiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/AA"
                  className={`checkout-input ${validationErrors.expiry ? 'error' : ''}`}
                />
                {validationErrors.expiry && <p className="error-message">{validationErrors.expiry}</p>}
              </div>
              <div className="checkout-form-group">
                <label className="checkout-label">CVV</label>
                <input
                  type="text"
                  value={cardInfo.cvv}
                  onChange={handleCVCChange}
                  placeholder="123"
                  className={`checkout-input ${validationErrors.cvv ? 'error' : ''}`}
                />
                {validationErrors.cvv && <p className="error-message">{validationErrors.cvv}</p>}
              </div>
            </div>
            <div className="checkout-modal-footer">
              <button onClick={() => setModalOpen(false)} className="modal-btn secondary">
                Cancelar
              </button>
              <button onClick={saveCardInfo} className="modal-btn primary">
                Guardar Tarjeta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
