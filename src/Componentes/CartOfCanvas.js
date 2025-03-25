import React from 'react';
import PropTypes from 'prop-types';
import { Offcanvas, Button, ListGroup, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Actualiza la importación
import "../estilos/Carrito.css";
import 'bootstrap-icons/font/bootstrap-icons.css';

const CartOffCanvas = ({ show, onHide, cartItems = [], onRemove, increaseQuantity, decreaseQuantity, total }) => {
  const navigate = useNavigate(); // Crea una función de navegación

  const handleCheckout = () => {
    onHide();
    // Redirige a la página de checkout (ajusta la ruta según sea necesario)
    navigate('/resumen');
  };

  return (
    <Offcanvas show={show} onHide={onHide} placement="end" className="bg-black text-white">
      <Offcanvas.Header className="bg-dark d-flex justify-content-between align-items-center">
        <Offcanvas.Title className="p-3">Carrito de Compras</Offcanvas.Title>
        <Button 
          onClick={onHide} 
          style={{ 
            color: 'white', 
            background: 'transparent', 
            border: 'none', 
            fontSize: '24px',
            padding: '0',
          }} 
          aria-label="Cerrar"
        >
          &times; 
        </Button>
      </Offcanvas.Header>

      <Offcanvas.Body>
        <ListGroup>
          {cartItems.length === 0 ? (
            <ListGroup.Item className="bg-dark text-white">Carrito vacío</ListGroup.Item>
          ) : (
            cartItems.map((item) => {
              const itemPrice = parseFloat(item.price.replace('$', ''));
              const itemTotal = itemPrice * item.quantity;

              return (
                <ListGroup.Item key={item.id} className="d-flex align-items-center p-4 bg-dark text-white">
                  <Image src={item.imgSrc} alt={item.title} thumbnail style={{ width: '50px', marginRight: '20px' }} />
                  <div className="flex-grow-1">
                    <strong className="text-lg">{item.title}</strong>
                    <div className="mt-2">
                      <span className="text-sm text-blue-50">Precio:</span>
                      <span className="text-blue-50"> ${isNaN(itemPrice) ? 'N/A' : itemPrice.toFixed(2)}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-sm text-blue-50">Total:</span>
                      <span className="text-green-600 text-xl"> ${isNaN(itemTotal) ? 'N/A' : itemTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <Button variant="secondary" onClick={() => decreaseQuantity(item.id)} aria-label={`Disminuir cantidad de ${item.title}`}>-</Button>
                    <span className="mx-2">{item.quantity}</span>
                    <Button variant="secondary" onClick={() => increaseQuantity(item.id)} aria-label={`Aumentar cantidad de ${item.title}`}>+</Button>
                    <Button variant="danger" className="ms-2" onClick={() => onRemove(item.id)} aria-label={`Eliminar ${item.title}`}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </ListGroup.Item>
              );
            })
          )}
        </ListGroup>
        <hr className="bg-white" />
        <h5 className='text-xl'>Total del Carrito:<h5 className='text-2xl'>${total}</h5> </h5>
        <button className="animated-button" onClick={handleCheckout}>
          <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
          </svg>
          <span className="text">Comprar</span>
          <span className="circle"></span>
          <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
          </svg>
        </button>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

CartOffCanvas.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  cartItems: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.string.isRequired,
    imgSrc: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
  })),
  onRemove: PropTypes.func.isRequired,
  increaseQuantity: PropTypes.func.isRequired,
  decreaseQuantity: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired,
};

export default CartOffCanvas;
