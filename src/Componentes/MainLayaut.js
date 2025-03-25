// MainLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navig from './Navig';
import Footer from './Footer';
import CartOffCanvas from './CartOfCanvas';
import Carga from './Carga';

const MainLayout = ({ user, onLogin, onLogout, onAddToCart }) => {
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    const savedCartItems = localStorage.getItem('cartItems');
    return savedCartItems ? JSON.parse(savedCartItems) : [];
  });
  const [showCart, setShowCart] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const noNavbarRoutes = ['/login', '/registro', '/adminhomepage', '/reports', '/settings'];
  const shouldShowNavbar = !noNavbarRoutes.includes(location.pathname);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [location.key]);

  const handleCartClose = () => setShowCart(false);
  const handleCartShow = () => setShowCart(true);

  const handleRemoveFromCart = (itemId) => {
    const updatedItems = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };

  const increaseQuantity = (itemId) => {
    const updatedItems = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };

  const decreaseQuantity = (itemId) => {
    const updatedItems = cartItems.map((item) => {
      if (item.id === itemId && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    });
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };

  const total = cartItems
    .reduce((acc, item) => {
      const itemPrice = parseFloat(item.price.replace('$', ''));
      return acc + itemPrice * item.quantity;
    }, 0)
    .toFixed(2);

  return (
    <div className="app-container">
      {shouldShowNavbar && <Navig cartItems={cartItems} onCartShow={handleCartShow} onLogout={onLogout} user={user} />}
      
      <main className={`main-content ${loading ? 'hidden' : ''}`}>
        <Outlet />
      </main>

      {loading && (
        <div className={`transition-overlay show`}>
          <Carga />
        </div>
      )}

      {shouldShowNavbar && <Footer />}

      <CartOffCanvas
        show={showCart}
        onHide={handleCartClose}
        cartItems={cartItems}
        onRemove={handleRemoveFromCart}
        increaseQuantity={increaseQuantity}
        decreaseQuantity={decreaseQuantity}
        total={total}
      />
    </div>
  );
};

export default MainLayout;
