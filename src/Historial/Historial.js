import React, { useEffect, useState } from 'react';
import api from '../services/api';
import "../estilos/Historial.css";
import { Modal } from 'react-bootstrap';

const ORDERS_PER_PAGE = 25;

export function Historial() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalSpent: 0, completedOrders: 0, canceledOrders: 0, pendingOrders: 0 });
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleShowConfirmModal = (orderId) => {
    setOrderToCancel(orderId);
    setShowConfirmModal(true);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      const response = await api.put(`/api/pedido/cancelar/${orderToCancel}`);
      if (response.status === 200) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.idPedido === orderToCancel ? { ...order, estado: 'Cancelado' } : order
          )
        );
        setSummary((prevState) => ({
          ...prevState,
          canceledOrders: prevState.canceledOrders + 1,
          pendingOrders: prevState.pendingOrders - 1,
        }));
        setShowModal(false);
        setShowConfirmModal(false);
        setOrderToCancel(null);
      }
    } catch (error) {
      console.error('Error al cancelar el pedido:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = sessionStorage.getItem('user');
        if (!userData) {
          console.error("No hay usuario en sessionStorage");
          setLoading(false);
          return;
        }

        const user = JSON.parse(userData);
        const userId = user.idUsuario;

        const response = await api.get('/api/pedido/listar');
        const fetchedOrders = response.data;

        const userOrders = fetchedOrders.filter(order => order.idUsuario === userId);

        const groupedOrders = {};
        let totalSpent = 0;

        userOrders.forEach(order => {
          if (groupedOrders[order.idPedido]) {
            groupedOrders[order.idPedido].items.push({
              name: order.nombreProducto,
              price: order.precioProducto,
              cantidad: order.cantidad,
              importe: order.importe,
              image: order.urlImagen,
            });
          } else {
            groupedOrders[order.idPedido] = {
              idPedido: order.idPedido,
              fecha: order.fecha,
              estado: order.estado,
              metodoPago: order.metodoPago,
              total: order.total,
              items: [{
                name: order.nombreProducto,
                price: order.precioProducto,
                cantidad: order.cantidad,
                importe: order.importe,
                image: order.urlImagen,
              }],
            };
          }
        });

        const groupedOrdersArray = Object.values(groupedOrders);
        totalSpent = groupedOrdersArray.reduce((acc, order) => acc + order.total, 0);

        setOrders(groupedOrdersArray);

        const completedOrders = groupedOrdersArray.filter(order => order.estado === 'Entregado' || order.estado === 'Enviado').length;
        const canceledOrders = groupedOrdersArray.filter(order => order.estado === 'Cancelado').length;
        const pendingOrders = groupedOrdersArray.filter(order => order.estado === 'Pendiente').length;

        setSummary({ totalSpent, completedOrders, canceledOrders, pendingOrders });
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Pagination
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const endIndex = startIndex + ORDERS_PER_PAGE;
  const currentOrders = orders.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusClass = (estado) => {
    switch (estado) {
      case 'Entregado': return 'delivered';
      case 'Enviado': return 'shipped';
      case 'Pendiente': return 'pending';
      case 'Cancelado': return 'canceled';
      default: return 'pending';
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'Entregado':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        );
      case 'Enviado':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13"/>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
            <circle cx="5.5" cy="18.5" r="2.5"/>
            <circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
        );
      case 'Cancelado':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M15 9l-6 6M9 9l6 6"/>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        );
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return (
      <div className="pagination">
        <button
          className="pagination-btn nav"
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/>
          </svg>
        </button>
        <button
          className="pagination-btn nav"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        {startPage > 1 && (
          <>
            <button className="pagination-btn" onClick={() => goToPage(1)}>1</button>
            {startPage > 2 && <span className="pagination-ellipsis">...</span>}
          </>
        )}

        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
          <button
            key={page}
            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
            onClick={() => goToPage(page)}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
            <button className="pagination-btn" onClick={() => goToPage(totalPages)}>{totalPages}</button>
          </>
        )}

        <button
          className="pagination-btn nav"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        <button
          className="pagination-btn nav"
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 17l5-5-5-5M6 17l5-5-5-5"/>
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="historial-page">
      {/* Header */}
      <div className="historial-header">
        <h1 className="historial-title">Mi Historial</h1>
        <p className="historial-subtitle">Revisa el estado de tus órdenes y compras anteriores</p>
      </div>

      {/* Summary Cards */}
      <div className="historial-summary">
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon total">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div className="summary-label">Total Gastado</div>
            <div className="summary-value gold">S/.{summary.totalSpent.toFixed(2)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-icon delivered">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <div className="summary-label">Entregadas</div>
            <div className="summary-value green">{summary.completedOrders}</div>
          </div>
          <div className="summary-card">
            <div className="summary-icon pending">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div className="summary-label">Pendientes</div>
            <div className="summary-value yellow">{summary.pendingOrders}</div>
          </div>
          <div className="summary-card">
            <div className="summary-icon canceled">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M15 9l-6 6M9 9l6 6"/>
              </svg>
            </div>
            <div className="summary-label">Canceladas</div>
            <div className="summary-value red">{summary.canceledOrders}</div>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="orders-section">
        <div className="orders-header">
          <h2 className="orders-title">Mis Órdenes</h2>
          {orders.length > 0 && (
            <span className="orders-count">
              Mostrando {startIndex + 1}-{Math.min(endIndex, orders.length)} de {orders.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="historial-loading">
            <div className="loading-spinner">
              <svg viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="100" strokeDashoffset="25"/>
              </svg>
            </div>
            <p className="loading-text">Cargando historial...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-orders">
            <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="2"/>
              <path d="M9 14l2 2 4-4"/>
            </svg>
            <h3 className="empty-title">No hay órdenes</h3>
            <p className="empty-text">Aún no has realizado ninguna compra</p>
          </div>
        ) : (
          <>
            {currentOrders.map(order => (
              <div key={order.idPedido} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <span className="order-id">Orden #{order.idPedido}</span>
                    <span className="order-date">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <path d="M16 2v4M8 2v4M3 10h18"/>
                      </svg>
                      {order.fecha}
                    </span>
                  </div>
                  <div className={`order-status ${getStatusClass(order.estado)}`}>
                    {getStatusIcon(order.estado)}
                    {order.estado}
                  </div>
                </div>

                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-qty">{item.cantidad}</span>
                      </div>
                      <span className="item-price">S/.{item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <span className="order-total-label">Total:</span>
                    <span className="order-total-amount">S/.{order.total.toFixed(2)}</span>
                  </div>
                  <div className="order-actions">
                    <button className="btn-view-details" onClick={() => handleShowModal(order)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {renderPagination()}
          </>
        )}
      </div>

      {/* Order Details Modal - Professional Design */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered className="order-modal">
        <div className="modal-detail-header">
          <div className="modal-detail-title-section">
            <div className="modal-order-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="2"/>
              </svg>
            </div>
            <div>
              <h2 className="modal-detail-title">Pedido #{selectedOrder?.idPedido}</h2>
              <p className="modal-detail-date">{selectedOrder?.fecha}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={handleCloseModal}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="modal-detail-body">
          {/* Status Banner */}
          <div className={`status-banner ${getStatusClass(selectedOrder?.estado)}`}>
            <div className="status-banner-icon">
              {getStatusIcon(selectedOrder?.estado)}
            </div>
            <div className="status-banner-info">
              <span className="status-banner-label">Estado del pedido</span>
              <span className="status-banner-value">{selectedOrder?.estado}</span>
            </div>
            <div className="status-banner-payment">
              <span className="status-banner-label">Método de pago</span>
              <span className="status-banner-value">{selectedOrder?.metodoPago}</span>
            </div>
          </div>

          {/* Products Section */}
          <div className="modal-products-section">
            <div className="modal-section-header">
              <h3 className="modal-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>
                </svg>
                Productos ({selectedOrder?.items.length})
              </h3>
            </div>

            <div className="modal-products-list">
              {selectedOrder?.items.map((item, index) => (
                <div key={index} className="modal-product-card">
                  <div className="modal-product-image-container">
                    <img src={item.image} alt={item.name} className="modal-product-img" />
                  </div>
                  <div className="modal-product-content">
                    <h4 className="modal-product-title">{item.name}</h4>
                    <div className="modal-product-meta">
                      <div className="meta-item">
                        <span className="meta-label">Cantidad</span>
                        <span className="meta-value">{item.cantidad}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Precio unit.</span>
                        <span className="meta-value">S/.{item.price.toFixed(2)}</span>
                      </div>
                      <div className="meta-item highlight">
                        <span className="meta-label">Importe</span>
                        <span className="meta-value">S/.{item.importe.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Section */}
          <div className="modal-invoice-section">
            <div className="modal-section-header">
              <h3 className="modal-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                </svg>
                Resumen de facturación
              </h3>
            </div>

            <div className="invoice-breakdown">
              <div className="invoice-row">
                <span className="invoice-label">Subtotal</span>
                <span className="invoice-value">S/.{selectedOrder?.items.reduce((acc, item) => acc + item.importe, 0).toFixed(2)}</span>
              </div>
              <div className="invoice-row">
                <span className="invoice-label">IGV (18%)</span>
                <span className="invoice-value">S/.{(selectedOrder?.items.reduce((acc, item) => acc + item.importe, 0) * 0.18).toFixed(2)}</span>
              </div>
              <div className="invoice-row total">
                <span className="invoice-label">Total</span>
                <span className="invoice-value">S/.{selectedOrder?.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-detail-footer">
          {selectedOrder?.estado === 'Pendiente' && (
            <button className="btn-cancel-order" onClick={() => handleShowConfirmModal(selectedOrder.idPedido)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M15 9l-6 6M9 9l6 6"/>
              </svg>
              Cancelar pedido
            </button>
          )}
          <button className="btn-close-modal" onClick={handleCloseModal}>Cerrar</button>
        </div>
      </Modal>

      {/* Confirm Cancel Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered className="confirm-modal">
        <div className="confirm-modal-content">
          <div className="confirm-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <path d="M12 9v4M12 17h.01"/>
            </svg>
          </div>
          <h3 className="confirm-title">¿Cancelar pedido?</h3>
          <p className="confirm-text">Esta acción no se puede deshacer. El pedido será cancelado permanentemente.</p>
          <div className="confirm-actions">
            <button className="btn-confirm-back" onClick={() => setShowConfirmModal(false)}>
              No, volver
            </button>
            <button className="btn-confirm-cancel" onClick={handleCancelOrder}>
              Sí, cancelar pedido
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
