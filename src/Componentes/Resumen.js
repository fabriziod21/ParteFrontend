import React, { useEffect, useState, useRef } from 'react';
import {
  FaShop, FaUser, FaTruck, FaCreditCard, FaPlus, FaTrash, FaCheck,
  FaLocationDot, FaRoute, FaCartShopping, FaArrowLeft, FaShieldHalved,
  FaCircleCheck, FaClock, FaBox
} from "react-icons/fa6";
import { TbTruckDelivery } from "react-icons/tb";
import { FaCcVisa, FaCcMastercard, FaMoneyBillWave } from 'react-icons/fa';
import { HiOutlineShoppingBag } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from "../services/api";
import "../estilos/Resumen.css";

// Ubicación de tu tienda (Centro de Lima - Plaza Mayor)
const STORE_LOCATION = {
  lat: -12.0464,
  lng: -77.0428,
  address: "Plaza Mayor de Lima, Centro de Lima"
};

// Tarifas de envío por distancia (en km)
const SHIPPING_RATES = [
  { maxKm: 5, price: 5.00, label: "Zona cercana" },
  { maxKm: 10, price: 10.00, label: "Zona intermedia" },
  { maxKm: 20, price: 15.00, label: "Zona extendida" },
  { maxKm: 30, price: 20.00, label: "Zona lejana" },
  { maxKm: Infinity, price: 25.00, extraPerKm: 0.50, label: "Zona especial" }
];

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
  const [currentStep, setCurrentStep] = useState(1);

  // Estados para el cálculo de envío
  const [shippingCost, setShippingCost] = useState(0);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [shippingZone, setShippingZone] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Estados para el mapa interactivo
  const [customerMarker, setCustomerMarker] = useState(null);

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const directionsRendererRef = useRef(null);
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

  // Inicializar el mapa cuando se selecciona delivery
  useEffect(() => {
    if (deliveryOption === 'delivery' && mapContainerRef.current && window.google && !mapRef.current) {
      const timer = setTimeout(() => {
        initMap();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [deliveryOption]);

  const initMap = () => {
    if (!window.google || !window.google.maps || !mapContainerRef.current) return;

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: { lat: -12.0464, lng: -77.0428 },
      zoom: 13,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#242424" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242424" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#d4af37" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#38383a" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#4a4a4a" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#4a4a4a" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
        { featureType: "poi", elementType: "geometry", stylers: [{ color: "#2a2a2a" }] },
        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1a3a1a" }] },
        { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2a2a2a" }] },
      ],
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    mapRef.current = map;

    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#d4af37",
        strokeOpacity: 0.9,
        strokeWeight: 5,
      },
    });

    new window.google.maps.Marker({
      position: STORE_LOCATION,
      map: map,
      title: "Tienda MORVIC",
      icon: {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='40' height='40'%3E%3Cpath fill='%23d4af37' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'/%3E%3Ccircle cx='12' cy='9' r='3' fill='%23ffffff'/%3E%3C/svg%3E",
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 40),
      },
    });

    map.addListener('click', (e) => {
      handleMapClick(e.latLng, map);
    });
  };

  const handleMapClick = async (latLng, map) => {
    setIsCalculating(true);
    setAddressError('');

    if (customerMarkerRef.current) {
      customerMarkerRef.current.setMap(null);
    }

    const marker = new window.google.maps.Marker({
      position: latLng,
      map: map,
      title: "Punto de entrega",
      icon: {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='40' height='40'%3E%3Cpath fill='%2322c55e' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'/%3E%3Ccircle cx='12' cy='9' r='3' fill='%23ffffff'/%3E%3C/svg%3E",
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 40),
      },
      animation: window.google.maps.Animation.DROP,
    });

    customerMarkerRef.current = marker;
    setCustomerMarker({ lat: latLng.lat(), lng: latLng.lng() });

    const geocoder = new window.google.maps.Geocoder();

    try {
      const response = await geocoder.geocode({ location: latLng });
      if (response.results[0]) {
        const address = response.results[0].formatted_address;
        setDeliveryAddress(address);
        setSelectedPlace({
          formatted_address: address,
          geometry: { location: latLng }
        });
        calculateRouteAndShipping(latLng, map);
      }
    } catch (error) {
      console.error('Error en geocoding:', error);
      setAddressError('No se pudo obtener la dirección');
      setIsCalculating(false);
    }
  };

  const calculateRouteAndShipping = (destination, map) => {
    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: STORE_LOCATION,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          if (directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(result);
          }

          const route = result.routes[0];
          if (route && route.legs[0]) {
            const leg = route.legs[0];
            const distanceInKm = leg.distance.value / 1000;
            const durationText = leg.duration.text;

            setDistance(distanceInKm.toFixed(1));
            setDuration(durationText);

            const rate = calculateRate(distanceInKm);
            setShippingCost(rate.cost);
            setShippingZone(rate.zone);

            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(STORE_LOCATION);
            bounds.extend(destination);
            map.fitBounds(bounds, { padding: 50 });
          }
        } else {
          setAddressError('No se pudo calcular la ruta. Intenta con otro punto.');
          setShippingCost(0);
          setDistance(null);
        }
        setIsCalculating(false);
      }
    );
  };

  const calculateRate = (distanceKm) => {
    for (const rate of SHIPPING_RATES) {
      if (distanceKm <= rate.maxKm) {
        let cost = rate.price;
        if (rate.extraPerKm && distanceKm > 30) {
          cost += (distanceKm - 30) * rate.extraPerKm;
        }
        return { cost: parseFloat(cost.toFixed(2)), zone: rate.label };
      }
    }
    return { cost: 25.00, zone: "Zona especial" };
  };

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
    const shipping = deliveryOption === 'delivery' ? shippingCost : 0;
    return (parseFloat(subtotal) + parseFloat(calculateIGV(subtotal)) + shipping).toFixed(2);
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

  const handleDeliveryOptionChange = (option) => {
    setDeliveryOption(option);
    if (option === 'pickup') {
      setDeliveryAddress('');
      setShippingCost(0);
      setDistance(null);
      setDuration(null);
      setShippingZone('');
      setSelectedPlace(null);
    }
  };

  const handleSubmit = async () => {
    if (deliveryOption === 'delivery' && (!selectedPlace || shippingCost === 0)) {
      Swal.fire({
        title: 'Dirección requerida',
        text: 'Por favor selecciona una dirección válida para calcular el envío',
        icon: 'warning',
        background: '#0a0a0a',
        color: '#ffffff',
        confirmButtonColor: '#d4af37',
      });
      return;
    }

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
        costoEnvio: deliveryOption === "delivery" ? shippingCost : 0,
        distanciaKm: distance,
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
        title: '¡Pedido Confirmado!',
        html: `
          <div style="text-align: center;">
            <p style="font-size: 1.1rem; margin-bottom: 1rem;">Tu pedido #${response.data.idPedido} ha sido registrado exitosamente</p>
            <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem;">Recibirás una confirmación por correo electrónico</p>
          </div>
        `,
        icon: 'success',
        background: '#0a0a0a',
        color: '#ffffff',
        confirmButtonColor: '#d4af37',
        confirmButtonText: 'Continuar Comprando',
        timer: 5000,
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

  const removeFromCart = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  };

  const subtotal = calculateSubtotal();
  const igv = calculateIGV(subtotal);
  const total = calculateTotal(subtotal);

  return (
    <div className="checkout-page-v2">
      {/* Header */}
      <header className="checkout-header">
        <button className="back-btn" onClick={handleBackToCatalog}>
          <FaArrowLeft />
          <span>Volver al catálogo</span>
        </button>
        <div className="checkout-logo">
          <span className="logo-text">MORVIC</span>
          <span className="logo-sub">Checkout Seguro</span>
        </div>
        <div className="secure-badge">
          <FaShieldHalved />
          <span>Pago Seguro</span>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="checkout-progress">
        <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <span>Carrito</span>
        </div>
        <div className="progress-line"></div>
        <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <span>Entrega</span>
        </div>
        <div className="progress-line"></div>
        <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <span>Pago</span>
        </div>
      </div>

      <div className="checkout-layout">
        {/* Left Column - Main Content */}
        <div className="checkout-main">
          {/* Cart Items Section */}
          <section className="checkout-section">
            <div className="section-header">
              <FaCartShopping className="section-icon" />
              <h2>Tu Carrito</h2>
              <span className="item-count">{cartItems.length} productos</span>
            </div>

            <div className="cart-items-list">
              {cartItems.length > 0 ? (
                cartItems.map(item => {
                  const itemPrice = parseFloat(item.price.replace('$', ''));
                  const itemTotal = (itemPrice * item.quantity).toFixed(2);
                  return (
                    <div key={item.id} className="cart-item-card">
                      <div className="item-image">
                        <img src={item.imgSrc} alt={item.title} />
                      </div>
                      <div className="item-details">
                        <h4 className="item-name">{item.title}</h4>
                        <p className="item-price">{item.price}</p>
                      </div>
                      <div className="item-quantity">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <div className="item-total">
                        <span>S/.{itemTotal}</span>
                      </div>
                      <button className="remove-item-btn" onClick={() => removeFromCart(item.id)}>
                        <FaTrash />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="empty-cart">
                  <FaBox className="empty-icon" />
                  <h3>Tu carrito está vacío</h3>
                  <p>Agrega productos para continuar</p>
                  <button onClick={handleBackToCatalog} className="continue-shopping-btn">
                    Explorar Catálogo
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Delivery Section */}
          <section className="checkout-section">
            <div className="section-header">
              <FaTruck className="section-icon" />
              <h2>Método de Entrega</h2>
            </div>

            <div className="delivery-options-v2">
              <div
                className={`delivery-card ${deliveryOption === 'pickup' ? 'selected' : ''}`}
                onClick={() => handleDeliveryOptionChange('pickup')}
              >
                <div className="delivery-card-icon">
                  <FaShop />
                </div>
                <div className="delivery-card-content">
                  <h4>Recoger en Tienda</h4>
                  <p>Retira tu pedido en nuestra tienda</p>
                  <span className="delivery-price free">Gratis</span>
                </div>
                {deliveryOption === 'pickup' && <FaCircleCheck className="check-icon" />}
              </div>

              <div
                className={`delivery-card ${deliveryOption === 'delivery' ? 'selected' : ''}`}
                onClick={() => handleDeliveryOptionChange('delivery')}
              >
                <div className="delivery-card-icon">
                  <TbTruckDelivery />
                </div>
                <div className="delivery-card-content">
                  <h4>Delivery</h4>
                  <p>Envío a domicilio</p>
                  <span className="delivery-price">Desde S/.5.00</span>
                </div>
                {deliveryOption === 'delivery' && <FaCircleCheck className="check-icon" />}
              </div>
            </div>

            {/* Pickup Info */}
            {deliveryOption === 'pickup' && (
              <div className="pickup-info">
                <div className="store-location-card">
                  <FaLocationDot className="location-icon" />
                  <div>
                    <h4>Ubicación de la Tienda</h4>
                    <p>{STORE_LOCATION.address}</p>
                  </div>
                </div>

                <div className="responsible-section-v2">
                  <h4>Responsable(s) de Recoger</h4>
                  <p className="section-desc">Ingresa los nombres de las personas autorizadas</p>

                  {responsibles.map((responsible, index) => (
                    <div key={index} className="responsible-input-row">
                      <input
                        type="text"
                        value={responsible}
                        onChange={(e) => handleResponsibleChange(index, e.target.value)}
                        placeholder={`Nombre del responsable ${index + 1}`}
                        className="input-field"
                      />
                      {responsibles.length > 1 && (
                        <button onClick={() => removeResponsible(index)} className="remove-btn">
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  ))}

                  {responsibles.length < 2 && (
                    <button onClick={addResponsible} className="add-responsible-btn-v2">
                      <FaPlus /> Agregar otro responsable
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Map */}
            {deliveryOption === 'delivery' && (
              <div className="delivery-map-section-v2">
                <div className="map-instructions">
                  <FaRoute className="instruction-icon" />
                  <div>
                    <h4>Selecciona el punto de entrega</h4>
                    <p>Haz clic en el mapa para marcar tu ubicación</p>
                  </div>
                </div>

                <div className="map-wrapper">
                  <div className="map-container" ref={mapContainerRef}></div>
                  {isCalculating && (
                    <div className="map-overlay">
                      <div className="loader"></div>
                      <span>Calculando ruta...</span>
                    </div>
                  )}
                </div>

                {addressError && <p className="error-text">{addressError}</p>}

                {deliveryAddress && (
                  <div className="delivery-address-card">
                    <FaLocationDot className="address-icon" />
                    <div>
                      <span className="label">Dirección de entrega</span>
                      <span className="address">{deliveryAddress}</span>
                    </div>
                  </div>
                )}

                {distance && shippingCost > 0 && (
                  <div className="route-info-card">
                    <div className="route-stat">
                      <FaRoute className="stat-icon" />
                      <div>
                        <span className="stat-value">{distance} km</span>
                        <span className="stat-label">Distancia</span>
                      </div>
                    </div>
                    <div className="route-stat">
                      <FaClock className="stat-icon" />
                      <div>
                        <span className="stat-value">{duration}</span>
                        <span className="stat-label">Tiempo est.</span>
                      </div>
                    </div>
                    <div className="route-stat highlight">
                      <TbTruckDelivery className="stat-icon" />
                      <div>
                        <span className="stat-value">S/.{shippingCost.toFixed(2)}</span>
                        <span className="stat-label">{shippingZone}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Fecha de Entrega</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={handleDateChange}
                    className="input-field"
                  />
                  {errorMessage && <p className="error-text">{errorMessage}</p>}
                </div>
              </div>
            )}
          </section>

          {/* Payment Section */}
          <section className="checkout-section">
            <div className="section-header">
              <FaCreditCard className="section-icon" />
              <h2>Método de Pago</h2>
            </div>

            <div className="payment-options-v2">
              <div
                className={`payment-card ${paymentMethod === 'cash' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                <FaMoneyBillWave className="payment-icon" />
                <span>Efectivo</span>
                {paymentMethod === 'cash' && <FaCircleCheck className="check-icon" />}
              </div>

              <div
                className={`payment-card ${paymentMethod === 'card' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <FaCreditCard className="payment-icon" />
                <span>Tarjeta</span>
                {paymentMethod === 'card' && <FaCircleCheck className="check-icon" />}
              </div>
            </div>

            {paymentMethod === 'card' && (
              <div className="saved-cards-v2">
                <h4>Tarjetas Guardadas</h4>
                {savedCards.length > 0 ? (
                  <div className="cards-list">
                    {savedCards.map((card, index) => (
                      <div
                        key={index}
                        className={`saved-card ${selectedCardIndex === index ? 'selected' : ''}`}
                        onClick={() => selectCard(card, index)}
                      >
                        <span className="card-logo">{getCardLogo(card.number)}</span>
                        <span className="card-number">**** **** **** {card.number.slice(-4)}</span>
                        {selectedCardIndex === index ? (
                          <FaCheck className="selected-icon" />
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); deleteCard(index); }} className="delete-card-btn">
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-cards-text">No tienes tarjetas guardadas</p>
                )}
                <button onClick={() => setModalOpen(true)} className="add-card-btn-v2">
                  <FaPlus /> Agregar Nueva Tarjeta
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Right Column - Order Summary */}
        <aside className="checkout-sidebar">
          <div className="order-summary-card">
            <h3>Resumen del Pedido</h3>

            {/* Customer Info */}
            <div className="customer-info">
              <div className="customer-avatar">
                <FaUser />
              </div>
              <div className="customer-details">
                <span className="customer-name">{userDetails.nombre || 'Cliente'}</span>
                <span className="customer-email">{userDetails.correo || '-'}</span>
              </div>
            </div>

            <div className="summary-divider"></div>

            {/* Order Items Summary */}
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <span className="item-qty">{item.quantity}x</span>
                  <span className="item-name">{item.title}</span>
                  <span className="item-price">S/.{(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            {/* Totals */}
            <div className="summary-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>S/.{subtotal}</span>
              </div>
              <div className="total-row">
                <span>IGV (18%)</span>
                <span>S/.{igv}</span>
              </div>
              <div className="total-row">
                <span>Envío</span>
                <span className={deliveryOption !== 'delivery' ? 'free' : ''}>
                  {deliveryOption === 'delivery'
                    ? (shippingCost > 0 ? `S/.${shippingCost.toFixed(2)}` : 'Por calcular')
                    : 'Gratis'}
                </span>
              </div>
              <div className="total-row final">
                <span>Total</span>
                <span>S/.{total}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="submit-order-btn"
              disabled={isSubmitting || cartItems.length === 0 || (deliveryOption === 'delivery' && shippingCost === 0)}
            >
              {isSubmitting ? (
                <>
                  <span className="btn-loader"></span>
                  Procesando...
                </>
              ) : (
                <>
                  <HiOutlineShoppingBag />
                  Confirmar Pedido
                </>
              )}
            </button>

            {/* Security Info */}
            <div className="security-info">
              <FaShieldHalved />
              <span>Tus datos están protegidos con encriptación SSL</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Add Card Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Nueva Tarjeta</h3>
              <button className="close-modal" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Número de Tarjeta</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    value={cardInfo.number}
                    onChange={handleCardNumberChange}
                    placeholder="0000 0000 0000 0000"
                    className={`input-field ${validationErrors.number ? 'error' : ''}`}
                  />
                  {cardLogo && <span className="input-icon">{cardLogo}</span>}
                </div>
                {validationErrors.number && <p className="error-text">{validationErrors.number}</p>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha de Expiración</label>
                  <input
                    type="text"
                    value={cardInfo.expiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/AA"
                    className={`input-field ${validationErrors.expiry ? 'error' : ''}`}
                  />
                  {validationErrors.expiry && <p className="error-text">{validationErrors.expiry}</p>}
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    value={cardInfo.cvv}
                    onChange={handleCVCChange}
                    placeholder="123"
                    className={`input-field ${validationErrors.cvv ? 'error' : ''}`}
                  />
                  {validationErrors.cvv && <p className="error-text">{validationErrors.cvv}</p>}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
              <button onClick={saveCardInfo} className="btn-primary">Guardar Tarjeta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
