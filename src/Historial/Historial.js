import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import "../estilos/Historial.css";
import { Modal } from 'react-bootstrap';

const ORDERS_PER_PAGE = 10;

export function Historial() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalSpent: 0, completedOrders: 0, canceledOrders: 0, pendingOrders: 0 });
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [expandedOrder, setExpandedOrder] = useState(null);

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

  // Filtered and sorted orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Filter by search term
    if (searchTerm) {
      result = result.filter(order =>
        order.idPedido.toString().includes(searchTerm) ||
        order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(order => order.estado === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.fecha) - new Date(a.fecha);
      } else if (sortOrder === 'oldest') {
        return new Date(a.fecha) - new Date(b.fecha);
      } else if (sortOrder === 'highest') {
        return b.total - a.total;
      } else {
        return a.total - b.total;
      }
    });

    return result;
  }, [orders, searchTerm, statusFilter, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const endIndex = startIndex + ORDERS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortOrder]);

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

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
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
      <div className="hist-pagination">
        <button
          className="hist-pagination-btn nav"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Anterior
        </button>

        <div className="hist-pagination-pages">
          {startPage > 1 && (
            <>
              <button className="hist-pagination-btn" onClick={() => goToPage(1)}>1</button>
              {startPage > 2 && <span className="hist-pagination-ellipsis">...</span>}
            </>
          )}

          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
            <button
              key={page}
              className={`hist-pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => goToPage(page)}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="hist-pagination-ellipsis">...</span>}
              <button className="hist-pagination-btn" onClick={() => goToPage(totalPages)}>{totalPages}</button>
            </>
          )}
        </div>

        <button
          className="hist-pagination-btn nav"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Siguiente
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    );
  };

  const getTimelineProgress = (estado) => {
    switch (estado) {
      case 'Pendiente': return 25;
      case 'Enviado': return 66;
      case 'Entregado': return 100;
      case 'Cancelado': return 0;
      default: return 0;
    }
  };

  return (
    <div className="hist-container">
      {/* Hero Section */}
      <div className="hist-hero">
        <div className="hist-hero-content">
          <div className="hist-hero-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="2"/>
              <path d="M9 14l2 2 4-4"/>
            </svg>
          </div>
          <h1 className="hist-hero-title">Mi Historial de Compras</h1>
          <p className="hist-hero-subtitle">Gestiona y revisa todas tus órdenes en un solo lugar</p>
        </div>
        <div className="hist-hero-pattern"></div>
      </div>

      {/* Stats Dashboard */}
      <div className="hist-stats-section">
        <div className="hist-stats-grid">
          <div className="hist-stat-card gold">
            <div className="hist-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div className="hist-stat-content">
              <span className="hist-stat-value">S/.{summary.totalSpent.toFixed(2)}</span>
              <span className="hist-stat-label">Total Invertido</span>
            </div>
            <div className="hist-stat-glow"></div>
          </div>

          <div className="hist-stat-card green">
            <div className="hist-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <path d="M22 4L12 14.01l-3-3"/>
              </svg>
            </div>
            <div className="hist-stat-content">
              <span className="hist-stat-value">{summary.completedOrders}</span>
              <span className="hist-stat-label">Completadas</span>
            </div>
          </div>

          <div className="hist-stat-card yellow">
            <div className="hist-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div className="hist-stat-content">
              <span className="hist-stat-value">{summary.pendingOrders}</span>
              <span className="hist-stat-label">En Proceso</span>
            </div>
          </div>

          <div className="hist-stat-card red">
            <div className="hist-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M15 9l-6 6M9 9l6 6"/>
              </svg>
            </div>
            <div className="hist-stat-content">
              <span className="hist-stat-value">{summary.canceledOrders}</span>
              <span className="hist-stat-label">Canceladas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="hist-filters-section">
        <div className="hist-filters-wrapper">
          <div className="hist-search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por ID o producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="hist-search-input"
            />
            {searchTerm && (
              <button className="hist-search-clear" onClick={() => setSearchTerm('')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>

          <div className="hist-filter-group">
            <label className="hist-filter-label">Estado</label>
            <div className="hist-filter-buttons">
              <button
                className={`hist-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                Todos
              </button>
              <button
                className={`hist-filter-btn ${statusFilter === 'Pendiente' ? 'active pending' : ''}`}
                onClick={() => setStatusFilter('Pendiente')}
              >
                Pendiente
              </button>
              <button
                className={`hist-filter-btn ${statusFilter === 'Enviado' ? 'active shipped' : ''}`}
                onClick={() => setStatusFilter('Enviado')}
              >
                Enviado
              </button>
              <button
                className={`hist-filter-btn ${statusFilter === 'Entregado' ? 'active delivered' : ''}`}
                onClick={() => setStatusFilter('Entregado')}
              >
                Entregado
              </button>
              <button
                className={`hist-filter-btn ${statusFilter === 'Cancelado' ? 'active canceled' : ''}`}
                onClick={() => setStatusFilter('Cancelado')}
              >
                Cancelado
              </button>
            </div>
          </div>

          <div className="hist-sort-box">
            <label className="hist-filter-label">Ordenar por</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="hist-sort-select"
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="highest">Mayor precio</option>
              <option value="lowest">Menor precio</option>
            </select>
          </div>
        </div>

        {filteredOrders.length > 0 && (
          <div className="hist-results-info">
            <span>{filteredOrders.length} {filteredOrders.length === 1 ? 'orden encontrada' : 'órdenes encontradas'}</span>
            {(searchTerm || statusFilter !== 'all') && (
              <button className="hist-clear-filters" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="hist-orders-section">
        {loading ? (
          <div className="hist-loading">
            <div className="hist-loading-spinner">
              <div className="hist-spinner-ring"></div>
              <div className="hist-spinner-ring"></div>
              <div className="hist-spinner-ring"></div>
            </div>
            <p className="hist-loading-text">Cargando tu historial...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="hist-empty">
            <div className="hist-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="2"/>
              </svg>
            </div>
            <h3 className="hist-empty-title">
              {searchTerm || statusFilter !== 'all' ? 'No se encontraron resultados' : 'Sin órdenes aún'}
            </h3>
            <p className="hist-empty-text">
              {searchTerm || statusFilter !== 'all'
                ? 'Intenta con otros filtros de búsqueda'
                : 'Cuando realices tu primera compra, aparecerá aquí'}
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button className="hist-empty-btn" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                Ver todas las órdenes
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="hist-orders-list">
              {currentOrders.map((order, index) => (
                <div
                  key={order.idPedido}
                  className={`hist-order-card ${expandedOrder === order.idPedido ? 'expanded' : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Order Header */}
                  <div className="hist-order-header" onClick={() => toggleOrderExpand(order.idPedido)}>
                    <div className="hist-order-main">
                      <div className="hist-order-id-section">
                        <span className="hist-order-number">#{order.idPedido}</span>
                        <span className="hist-order-date">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2"/>
                            <path d="M16 2v4M8 2v4M3 10h18"/>
                          </svg>
                          {order.fecha}
                        </span>
                      </div>

                      <div className="hist-order-preview">
                        <div className="hist-order-images">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="hist-preview-img" style={{ zIndex: 3 - idx }}>
                              <img src={item.image} alt={item.name} />
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="hist-preview-more">+{order.items.length - 3}</div>
                          )}
                        </div>
                        <span className="hist-items-count">
                          {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                        </span>
                      </div>
                    </div>

                    <div className="hist-order-right">
                      <div className={`hist-order-status ${getStatusClass(order.estado)}`}>
                        {getStatusIcon(order.estado)}
                        <span>{order.estado}</span>
                      </div>
                      <div className="hist-order-total">
                        <span className="hist-total-label">Total</span>
                        <span className="hist-total-amount">S/.{order.total.toFixed(2)}</span>
                      </div>
                      <button className="hist-expand-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <div className="hist-order-body">
                    {/* Timeline */}
                    {order.estado !== 'Cancelado' && (
                      <div className="hist-timeline">
                        <div className="hist-timeline-bar">
                          <div
                            className="hist-timeline-progress"
                            style={{ width: `${getTimelineProgress(order.estado)}%` }}
                          ></div>
                        </div>
                        <div className="hist-timeline-steps">
                          <div className={`hist-timeline-step ${getTimelineProgress(order.estado) >= 25 ? 'completed' : ''}`}>
                            <div className="hist-step-dot"></div>
                            <span>Confirmado</span>
                          </div>
                          <div className={`hist-timeline-step ${getTimelineProgress(order.estado) >= 66 ? 'completed' : ''}`}>
                            <div className="hist-step-dot"></div>
                            <span>Enviado</span>
                          </div>
                          <div className={`hist-timeline-step ${getTimelineProgress(order.estado) >= 100 ? 'completed' : ''}`}>
                            <div className="hist-step-dot"></div>
                            <span>Entregado</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Products */}
                    <div className="hist-products-grid">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="hist-product-item">
                          <div className="hist-product-img">
                            <img src={item.image} alt={item.name} />
                          </div>
                          <div className="hist-product-info">
                            <h4 className="hist-product-name">{item.name}</h4>
                            <div className="hist-product-meta">
                              <span className="hist-product-qty">Cant: {item.cantidad}</span>
                              <span className="hist-product-price">S/.{item.price.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="hist-product-total">
                            S/.{item.importe.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="hist-order-footer">
                      <div className="hist-payment-info">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="4" width="22" height="16" rx="2"/>
                          <path d="M1 10h22"/>
                        </svg>
                        <span>{order.metodoPago}</span>
                      </div>
                      <div className="hist-order-actions">
                        {order.estado === 'Pendiente' && (
                          <button
                            className="hist-btn-cancel"
                            onClick={(e) => { e.stopPropagation(); handleShowConfirmModal(order.idPedido); }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <path d="M15 9l-6 6M9 9l6 6"/>
                            </svg>
                            Cancelar
                          </button>
                        )}
                        <button
                          className="hist-btn-details"
                          onClick={(e) => { e.stopPropagation(); handleShowModal(order); }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {renderPagination()}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered className="hist-modal">
        <div className="hist-modal-header">
          <div className="hist-modal-title-section">
            <div className="hist-modal-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="2"/>
              </svg>
            </div>
            <div>
              <h2 className="hist-modal-title">Pedido #{selectedOrder?.idPedido}</h2>
              <p className="hist-modal-date">{selectedOrder?.fecha}</p>
            </div>
          </div>
          <button className="hist-modal-close" onClick={handleCloseModal}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="hist-modal-body">
          {/* Status Banner */}
          <div className={`hist-status-banner ${getStatusClass(selectedOrder?.estado)}`}>
            <div className="hist-status-icon">
              {getStatusIcon(selectedOrder?.estado)}
            </div>
            <div className="hist-status-info">
              <span className="hist-status-label">Estado del pedido</span>
              <span className="hist-status-value">{selectedOrder?.estado}</span>
            </div>
            <div className="hist-status-payment">
              <span className="hist-status-label">Método de pago</span>
              <span className="hist-status-value">{selectedOrder?.metodoPago}</span>
            </div>
          </div>

          {/* Products Section */}
          <div className="hist-modal-section">
            <h3 className="hist-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>
              </svg>
              Productos ({selectedOrder?.items.length})
            </h3>

            <div className="hist-modal-products">
              {selectedOrder?.items.map((item, index) => (
                <div key={index} className="hist-modal-product">
                  <div className="hist-modal-product-img">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="hist-modal-product-info">
                    <h4 className="hist-modal-product-name">{item.name}</h4>
                    <div className="hist-modal-product-meta">
                      <div className="hist-meta-item">
                        <span className="hist-meta-label">Cantidad</span>
                        <span className="hist-meta-value">{item.cantidad}</span>
                      </div>
                      <div className="hist-meta-item">
                        <span className="hist-meta-label">Precio unit.</span>
                        <span className="hist-meta-value">S/.{item.price.toFixed(2)}</span>
                      </div>
                      <div className="hist-meta-item highlight">
                        <span className="hist-meta-label">Subtotal</span>
                        <span className="hist-meta-value">S/.{item.importe.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Section */}
          <div className="hist-modal-section">
            <h3 className="hist-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
              </svg>
              Resumen de facturación
            </h3>

            <div className="hist-invoice">
              <div className="hist-invoice-row">
                <span className="hist-invoice-label">Subtotal</span>
                <span className="hist-invoice-value">
                  S/.{selectedOrder?.items.reduce((acc, item) => acc + item.importe, 0).toFixed(2)}
                </span>
              </div>
              <div className="hist-invoice-row">
                <span className="hist-invoice-label">IGV (18%)</span>
                <span className="hist-invoice-value">
                  S/.{(selectedOrder?.items.reduce((acc, item) => acc + item.importe, 0) * 0.18).toFixed(2)}
                </span>
              </div>
              <div className="hist-invoice-row total">
                <span className="hist-invoice-label">Total</span>
                <span className="hist-invoice-value">S/.{selectedOrder?.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hist-modal-footer">
          {selectedOrder?.estado === 'Pendiente' && (
            <button className="hist-btn-cancel-modal" onClick={() => handleShowConfirmModal(selectedOrder.idPedido)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M15 9l-6 6M9 9l6 6"/>
              </svg>
              Cancelar pedido
            </button>
          )}
          <button className="hist-btn-close" onClick={handleCloseModal}>Cerrar</button>
        </div>
      </Modal>

      {/* Confirm Cancel Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered className="hist-confirm-modal">
        <div className="hist-confirm-content">
          <div className="hist-confirm-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <path d="M12 9v4M12 17h.01"/>
            </svg>
          </div>
          <h3 className="hist-confirm-title">¿Cancelar este pedido?</h3>
          <p className="hist-confirm-text">Esta acción no se puede deshacer. El pedido será cancelado permanentemente.</p>
          <div className="hist-confirm-actions">
            <button className="hist-btn-back" onClick={() => setShowConfirmModal(false)}>
              No, volver
            </button>
            <button className="hist-btn-confirm-cancel" onClick={handleCancelOrder}>
              Sí, cancelar pedido
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
