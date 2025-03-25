import React, { useEffect, useState } from 'react';
import { FaShop } from "react-icons/fa6";
import { TbTruckDelivery } from "react-icons/tb";
import { FaCcVisa, FaCcMastercard } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import "../estilos/Boton.css"
import axios from "axios";
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
  const [submitError, setSubmitError] = useState('');
  const [cardError, setCardError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);



  const navigate = useNavigate(); // Initialize the navigate function


  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => {
        setIsModalOpen(false);
      }, 3000); // 3 segundos

      return () => clearTimeout(timer); // Limpiar el temporizador si el componente se desmonta
    }
  }, [isModalOpen]);

  const SuccessModal = ({ onClose }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        <h4 className="text-lg font-semibold mb-4">Pedido Completado!</h4>
        <p className="mb-4">Tu pedido ha sido completado exitosamente.</p>
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
  
  const handleBackToCatalog = () => {
    navigate('/catalogo'); // Replace '/catalog' with your catalog route
  };

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');

        const subtotal = calculateSubtotal();
    const igv = calculateIGV(subtotal);
    const total = calculateTotal(subtotal);
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
      errors.number = 'Número de tarjeta inválido (solo Visa o MasterCard)';
    }

    if (!expiryRegex.test(cardInfo.expiry)) {
      errors.expiry = 'Fecha de expiración inválida (formato MM/AA)';
    }

    if (!cvvRegex.test(cardInfo.cvv)) {
      errors.cvv = 'CVV inválido (3 dígitos)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const today = new Date();
    const selectedDateTime = new Date(selectedDate);
  
    // Check if the selected date is today and the time is after 11 AM
    const currentTime = today.getHours();
    if (selectedDateTime.toDateString() === today.toDateString() && currentTime >= 11) {
      setErrorMessage('Solo disponible hoy hasta las 11 AM.');
      setDeliveryDate('');
    } else if (selectedDateTime < today) { // Check for past dates
      setErrorMessage('No se puede seleccionar una fecha anterior a hoy.');
      setDeliveryDate('');
    } else {
      setErrorMessage('');
      setDeliveryDate(selectedDate);
    }
  };  

  const validateDeliveryInfo = () => {
    const errors = {};
    if (deliveryOption === 'delivery') {
      if (!deliveryAddress) {
        errors.address = 'La dirección de entrega es obligatoria.';
      }
      if (!deliveryDate) {
        errors.date = 'La fecha de entrega es obligatoria.';
      }
    }
    setValidationErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true); // Deshabilitar el botón mientras se procesa
  
    const user = JSON.parse(sessionStorage.getItem('user')) || {}; // Optimización: solo acceder al sessionStorage una vez
  
    // Calcula el subtotal, IGV y total
    const subtotal = calculateSubtotal();
    const igv = calculateIGV(subtotal);
    const total = calculateTotal(subtotal);
  
    const fechaPeru = new Date().toLocaleDateString("es-PE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
  }).split("/").reverse().join("-");

    const pedidoData = {
      pedido: {
        fecha: fechaPeru, // Formato: YYYY-MM-DD
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Formato: HH:mm
        metodoPago: paymentMethod === "cash" ? "Efectivo" : "Tarjeta",
        total: total,
        estado: "Pendiente", // Puede ser "Pendiente", "Enviado", "Entregado", etc.
        direccionEntrega: deliveryAddress,
        fechaEntrega: deliveryDate,
        tipoEntrega: deliveryOption === "delivery" ? "delivery" : "recoge en tienda",
        responsableRecojo1: responsibles[0] || "",
        responsableRecojo2: responsibles[1] || "",
        usuario: { 
          idUsuario: userDetails.idUsuario,
          correo: userDetails.correo, 
          nombre: userDetails.nombre,
          direccion:userDetails.direccion,
          telefono:userDetails.telefono,
          
        },
      },
     
      detallesPedido: cartItems.map(item => {
        const itemPrice = parseFloat(item.price.replace('$', '')) || 0;
        const itemTotal = itemPrice * item.quantity;
  
        return {
          producto: { 
            idProducto: item.id,
            nombre: item.title
           }, // Asegúrate de que el producto tenga el campo idProducto
          cantidad: item.quantity,
          importe: itemTotal.toFixed(2), // Aquí se usa el total del item
        };
      }),
    };
  
    try {

      const response = await axios.post("http://localhost:8080/api/pedido/registrar", pedidoData);
      console.log("Pedido registrado con éxito:", response.data.idPedido);
  
      // Mostrar la alerta de éxito
      Swal.fire({
        title: 'Compra exitosa!',
        text: 'Tu pedido se ha realizado con éxito.',
        icon: 'success',
        background: '#000000',
        color: '#ffffff',
        confirmButtonColor: '#4CAF50',
        confirmButtonText: 'Aceptar',
        timer: 3000,
        timerProgressBar: true,
      }).then(() => {
        navigate("/catalogo"); // Redirige al catálogo o donde sea necesario
      });
      
    } catch (error) {
      console.error("Error:", error);
      // Mostrar la alerta de error
      Swal.fire({
        title: 'Error!',
        text: 'Hubo un error al registrar el pedido. Intenta nuevamente.',
        icon: 'error',
        background: '#000000',
        color: '#ffffff',
        confirmButtonColor: '#F44336',
      });
    } finally {
      setIsSubmitting(false); // Volver a habilitar el botón
    }
  };
  
  

  
  const saveCardInfo = () => {
    if (validateCardInfo()) {
      const newCards = [...savedCards, cardInfo];
      localStorage.setItem('savedCards', JSON.stringify(newCards));
      setSavedCards(newCards);
      alert('Información de tarjeta guardada!');
      setCardInfo({ number: '', expiry: '', cvv: '' });
      setModalOpen(false);
      setCardLogo(null);
    }
  };

  const selectCard = (card, index) => {
    setCardInfo(card);
    setSelectedCardIndex(index);
    setCardLogo(getCardLogo(card.number));
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
    let logo;
    if (number.startsWith('4')) {
      logo = <FaCcVisa className="text-blue-600" />;
    } else if (number.startsWith('5')) {
      logo = <FaCcMastercard className="text-red-600" />;
    }
    return logo ? (
      <div className="bg-white flex items-center justify-center" style={{ height: "10px", width: '15px', padding: '0' }}>
        {logo}
      </div>
    ) : null;
  };
  const subtotal = calculateSubtotal();
  const igv = calculateIGV(subtotal);
  const total = calculateTotal(subtotal);
  return (
    <div className='bg-fondo'>
      <div className="p-6 max-w-screen-2xl mx-auto ">
        {/* Breadcrumb Navigation */}
        <nav className="mt-3">
          <ul className="flex space-x-2 text-white text-xl font-kanit">
            <li>
              <button onClick={handleBackToCatalog} className="hover:underline">
                Catálogo
              </button>
            </li>
            <li>&gt;</li>
            <li>
              <button className="hover:underline">
                Resumen
              </button>
            </li>
          </ul>
        </nav>
    </div>
      <div className="p-6 max-w-screen-2xl mx-auto ">
        <h2 className='text-white text-2xl mb-3 font-kanit underline'>Apartado de Pedido :</h2>
        <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
          <div className="flex-1 p-6  rounded-lg shadow-lg bg-bgper text-white">
            <h3 className="text-2xl font-bold mb-4 border-b border-gray-400 pb-2 font-kanit">Identificación</h3>

            <div className="mb-2">
              <p className="font-teko text-lg text-yellow-300 ">
                <strong>Nombre:</strong> <span className="text-white font-kanit ml-2">{userDetails.nombre}</span>
              </p>
              <br></br>
              <p className="font-teko text-lg text-yellow-300">
                <strong>Celular:</strong> <span className="text-white font-kanit ml-2">{userDetails.telefono}</span>
              </p>
              <br></br>
              <p className="font-teko text-lg text-yellow-300">
                <strong>Dirección:</strong> <span className="text-white font-kanit ml-2">{userDetails.direccion}</span>
              </p>
              <br></br>
              <p className='font-teko text-lg text-yellow-300'>
                <strong>Correo:</strong> <span className="text-white font-kanit ml-2">{userDetails.correo}</span>
              </p>
            </div>
          </div>
          <div className="flex-1 p-4 rounded-lg shadow bg-bgper">
            <label className="block mb-4 text-white text-2xl border-b border-white pb-2 font-kanit"><strong>Opciones de Entrega:</strong></label>
            <div className="flex flex-col space-y-4 mb-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setDeliveryOption('pickup');
                    setDeliveryAddress('');
                    setResponsibles(['']);
                  }}
                  className={`flex items-center p-3 border rounded-lg font-teko text-xl ${deliveryOption === 'pickup' ? 'bg-yellow-400 text-black' : 'bg-white'}`}
                >
                  <FaShop className='mr-2' />
                  Recoger en tienda
                </button>
                <button
                  onClick={() => setDeliveryOption('delivery')}
                  className={`flex items-center p-3 border rounded-lg font-teko text-xl ${deliveryOption === 'delivery' ? 'bg-yellow-400 text-black' : 'bg-white'}`}
                >
                  <TbTruckDelivery className='mr-2' />
                  Delivery
                </button>
              </div>
              {deliveryOption === 'delivery' && (
                <>
                  <label className="block mt-4 text-white font-kanit">Dirección de Entrega:</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Ingresa tu dirección"
                    className={`w-full p-2 border ${validationErrors.address ? 'border-red-500' : 'border-gray-400'} rounded`}
                  />
                  {validationErrors.address && <p className="text-red-500">{validationErrors.address}</p>}
                  <label className="block mt-4 text-white font-kanit">Fecha de Entrega:</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={handleDateChange}
                    className={`w-full p-2 border ${validationErrors.date ? 'border-red-500' : 'border-gray-400'} rounded`}
                  />
                  {validationErrors.date && <p className="text-red-500">{validationErrors.date}</p>}
                  {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                </>
              )}
              <div className="mt-4">
                <label className='text-white font-kanit'>Responsables de Recoger:</label>
                {responsibles.map((responsible, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="text"
                      value={responsible}
                      onChange={(e) => handleResponsibleChange(index, e.target.value)}
                      placeholder="Nombre del Responsable"
                      className="flex-1 p-2 border border-gray-400 rounded"
                    />
                    <button type="button" onClick={() => removeResponsible(index)} className="ml-2 text-red-500">X</button>
                  </div>
                ))}
                {responsibles.length < 2 && (
                  <button
                    onClick={addResponsible}
                    className="mt-2 text-blue-700 hover:underline ml-2"
                  >
                    Agregar Responsable
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 p-4 rounded-lg shadow mt-6 md:mt-0 bg-bgper ">
            <h3 className="text-2xl  text-white border-b border-white pb-2 mb-3 font-kanit"><strong>Método de Pago</strong></h3>
            {submitError && <p className="text-red-500">{submitError}</p>}
            <label className="flex items-center text-white font-kanit">
              <input
                type="radio"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={() => setPaymentMethod('cash')}
                className="mr-2"
              />
              Efectivo
            </label>
            <label className="flex items-center text-white font-kanit">
              <input
                type="radio"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
                className="mr-2"
              />
              Tarjeta
            </label>
            {paymentMethod === 'card' && (
              <div className="mt-4">
                <h4 className="text-md font-semibold text-white font-kanit">Tarjetas Guardadas</h4>
                {cardError && <p className="text-red-500 mb-2">{cardError}</p>}
                {savedCards.length > 0 ? (
                  <ul>
                    {savedCards.map((card, index) => (
                      <li key={index} className={`flex justify-between items-center border-b py-2  ${selectedCardIndex === index ? 'bg-green-400' : ''}`}>
                        <div className="flex items-center text-white">
                          {getCardLogo(card.number)}
                          <span className='ml-2'>**** **** **** {card.number.slice(-2)}</span>
                        </div>
                        <div>
                          <button
                            onClick={() => selectCard(card, index)}
                            className="text-blue-500 mr-2"
                          >
                            {selectedCardIndex === index ? 'Seleccionado' : 'Seleccionar'}
                          </button>
                          <button
                            onClick={() => {
                              if (selectedCardIndex === index) {
                                setSelectedCardIndex(null);
                              } else {
                                deleteCard(index);
                              }
                            }}
                            className="text-red-500"
                          >
                            {selectedCardIndex === index ? 'Deseleccionar' : 'Eliminar'}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-white mt-2 '>No hay tarjetas guardadas.</p>
                )}
               <button
  onClick={() => {
    setCardInfo({ number: '', expiry: '', cvv: '' }); // Reset card info
    setModalOpen(true);
  }}
  className="mt-2 text-blue-500 hover:underline"
>
  Agregar Nueva Tarjeta
</button>
              </div>
            )}
          </div>
        </div>
        <div className="p-6 rounded-lg shadow-lg mt-6 bg-bgper text-white">
  <h3 className="text-2xl font-bold mb-4 text-center font-kanit">Resumen de Compra</h3>
  {cartItems.length > 0 ? (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="p-3 font-kanit text-left">Imagen</th>
            <th className="p-3 font-kanit text-left">Nombre del Producto</th>
            <th className="p-3 font-kanit text-center">Cantidad</th>
            <th className="p-3 font-kanit text-center">Precio</th>
            <th className="p-3 font-kanit text-center">Importe</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map(item => {
            const itemPrice = parseFloat(item.price.replace('$', ''));
            const itemTotal = (itemPrice * item.quantity).toFixed(2);
            return (
              <tr key={item.id} className="border-b border-gray-400 text-center hover:bg-gray-700">
                <td className="p-3">
                  <img src={item.imgSrc} alt={item.title} className="w-16 h-16 rounded" />
                </td>
                <td className="p-3 font-kanit text-lg text-left">{item.title}</td>
                <td className="p-3 font-teko text-lg text-center">{item.quantity}</td>
                <td className="p-3 font-kanit text-lg text-center">{item.price}</td>
                <td className="p-3 font-kanit text-lg text-center">${itemTotal}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="text-lg text-center">No hay productos en el carrito.</p>
  )}
  <div className="mt-4">
    <div className="flex justify-between border-t border-gray-400 pt-2">
      <span className="text-xl font-kanit">Subtotal:</span>
      <span className="text-xl font-kanit">${subtotal}</span>
    </div>
    <div className="flex justify-between mt-1">
      <span className="text-xl font-kanit">IGV (18%):</span>
      <span className="text-xl font-kanit">${igv}</span>
    </div>
    <div className="flex justify-between mt-1">
      <span className="text-xl font-kanit">Costo de Envío:</span>
      <span className="text-xl font-kanit">${deliveryOption === 'delivery' ? '2.00' : '0.00'}</span>
    </div>
    <div className="flex justify-between border-t border-gray-400 pt-2 mt-4">
      <strong className="text-xl font-kanit">Total:</strong>
      <strong className="text-xl font-kanit">${total}</strong>
    </div>
  </div>
  <div className="flex justify-center mt-6">
  <button
        onClick={handleSubmit}
        className="button"
        disabled={isSubmitting}  // Deshabilita el botón mientras se envía
      >
        {isSubmitting ? 'Procesando...' : 'Completar Pedido'}
      </button>
  </div>
</div>
        {modalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-80">
              <h4 className="text-lg font-semibold mb-4">Agregar Nueva Tarjeta</h4>
              <label className="block mt-2">Número de Tarjeta:</label>
              <input
                type="text"
                name="number"
                value={cardInfo.number}
                onChange={handleCardNumberChange}
                placeholder="xxxx-xxxx-xxxx-xxxx"
                className={`w-full p-2 border ${validationErrors.number ? 'border-red-500' : 'border-gray-400'} rounded`}
              />
              {validationErrors.number && <p className="text-red-500">{validationErrors.number}</p>}
              <label className="block mt-2">Fecha de Expiración:</label>
              <input
                type="text"
                name="expiry"
                value={cardInfo.expiry}
                onChange={handleExpiryChange}
                placeholder="MM/AA"
                className={`w-full p-2 border ${validationErrors.expiry ? 'border-red-500' : 'border-gray-400'} rounded`}
              />
              {validationErrors.expiry && <p className="text-red-500">{validationErrors.expiry}</p>}
              <label className="block mt-2">CVV:</label>
              <input
                type="text"
                name="cvv"
                value={cardInfo.cvv}
                onChange={handleCVCChange}
                placeholder="123"
                className={`w-full p-2 border ${validationErrors.cvv ? 'border-red-500' : 'border-gray-400'} rounded`}
              />
              {validationErrors.cvv && <p className="text-red-500">{validationErrors.cvv}</p>}

              <div className="flex justify-between mt-4">
                <button
                  onClick={saveCardInfo}
                  className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                >
                  Guardar Tarjeta
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                >
                  Cerrar
                </button>
              </div>
            </div> 
          </div>       
        )}
      </div>
      
    </div>
  );
};
export default Checkout;
