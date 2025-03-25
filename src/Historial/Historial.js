import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../estilos/Historial.css";
import { Button, Modal } from 'react-bootstrap';
import DetallesOrdenModal from '../Componentes/DetallesOrdenModal';

function Separator({ className }) {
  return <hr className={`my-4 ${className}`} />;
}

export function Historial() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({ totalSpent: 0, completedOrders: 0, canceledOrders: 0, pendingOrders: 0 });
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

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
      const response = await axios.put(`http://localhost:8080/api/pedido/cancelar/${orderToCancel}`);
      if (response.status === 200) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.idPedido === orderToCancel ? { ...order, estado: 'Cancelado' } : order
          )
        );
        setSummary((prevState) => ({
          ...prevState,
          canceledOrders: prevState.canceledOrders + 1,
          completedOrders: prevState.completedOrders - 1,
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
          return;
        }

        const user = JSON.parse(userData);
        const userId = user.idUsuario; // Extrae el idUsuario del usuario autenticado

        const response = await axios.get('http://localhost:8080/api/pedido/listar');
        const fetchedOrders = response.data;

        // Filtrar pedidos que pertenecen al usuario autenticado
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

        // Calcular el total gastado por el usuario autenticado
        totalSpent = groupedOrdersArray.reduce((acc, order) => acc + order.total, 0);

        setOrders(groupedOrdersArray);

        const completedOrders = groupedOrdersArray.filter(order => order.estado === 'Entregado' || order.estado === 'Enviado').length;
        const canceledOrders = groupedOrdersArray.filter(order => order.estado === 'Cancelado').length;
        const pendingOrders = groupedOrdersArray.filter(order => order.estado === 'Pendiente').length;

        setSummary({ totalSpent, completedOrders, canceledOrders, pendingOrders });
      } catch (error) {
        console.error('Error al obtener los pedidos:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-fondo text-white px-4 md:px-6 py-8">
      <div className="max-w-6xl mx-auto w-full flex-grow">
        <div>
          <h2 className="text-xl font-semibold mb-4">Órdenes de Compra</h2>
          <div className="grid gap-4">
            {orders.map(order => (
              <div key={order.idPedido} className="bg-bgper rounded-lg p-4 shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">Orden #{order.idPedido} - {order.fecha}</div>
                  <div className={`text-sm font-medium ${order.estado === 'Entregado' ? 'text-green-400' : order.estado === 'Cancelado' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {order.estado}
                  </div>
                </div>
                <div className="grid gap-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div>{item.name}</div>
                        <div className="ml-2 w-4 h-4 flex items-center justify-center bg-blue-700 text-white rounded-full text-sm font-bold">
                          {item.cantidad}
                        </div>
                      </div>
                      <div>S/.{item.price.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                <Separator className="my-16" />
                <div className="text-lg font-bold text-gray-300">Total: S/.{order.total.toFixed(2)}</div>
                <Button className="mt-4" variant="warning" onClick={() => handleShowModal(order)}>
                  Ver más
                </Button>
              </div>
            ))}
          </div>
          <div className="max-w-6xl mx-auto w-full flex-grow text-center">
            <br />
            <div className="bg-bgper p-4 rounded-lg shadow mb-6">
              <h3 className="text-lg font-semibold mb-2">Resumen de Compras</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-black p-3 rounded-lg">
                  <h4 className="text-sm text-gray-400">Órdenes Entregadas</h4>
                  <p className="text-lg font-bold text-green-400">{summary.completedOrders}</p>
                </div>
                <div className="bg-black p-3 rounded-lg">
                  <h4 className="text-sm text-gray-400">Órdenes Pendientes</h4>
                  <p className="text-lg font-bold text-yellow-400">{summary.pendingOrders}</p>
                </div>
                <div className="bg-black p-3 rounded-lg">
                  <h4 className="text-sm text-gray-400">Órdenes Canceladas</h4>
                  <p className="text-lg font-bold text-red-400">{summary.canceledOrders}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirmar Cancelación</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>¿Estás seguro de que deseas cancelar este pedido?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>No, volver</Button>
            <Button variant="danger" onClick={handleCancelOrder}>Sí, cancelar pedido</Button>
          </Modal.Footer>
        </Modal>

        <DetallesOrdenModal
          showModal={showModal}
          handleCloseModal={handleCloseModal}
          selectedOrder={selectedOrder}
          handleCancelOrder={handleShowConfirmModal}
        />
      </div>
    </div>
  );
}
