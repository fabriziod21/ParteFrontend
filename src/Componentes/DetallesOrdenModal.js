import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FiAlertTriangle } from "react-icons/fi"; // Ícono de advertencia

function DetallesOrdenModal({ showModal, handleCloseModal, selectedOrder, handleCancelOrder }) {
  return (
    <Modal show={showModal} onHide={handleCloseModal} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>Detalles del Pedido #{selectedOrder?.idPedido}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-fondo text-white">
        {/* Información General */}
        <div className="mb-4">
          <h5><strong>Fecha:</strong> {selectedOrder?.fecha}</h5>
          <h5>
            <strong>Estado:</strong>{" "}
            <span className={`
              ${selectedOrder?.estado === 'Cancelado' ? 'text-red-500' 
                : selectedOrder?.estado === 'Pendiente' ? 'text-yellow-500' 
                : selectedOrder?.estado === 'Entregado' ? 'text-green-400' 
                : 'text-green-400'}`}
            >
              {selectedOrder?.estado}
            </span>
          </h5>
        </div>
        
        <hr className="my-3 border-gray-500" />

        {/* Lista de Productos */}
        <h5 className="mb-3"><strong>Productos:</strong></h5>
        <div className="grid gap-4">
          {selectedOrder?.items.map((item, index) => (
            <div key={index} className="flex items-center bg-bgper p-4 rounded-lg shadow">
              {/* Imagen del producto */}
              <img src={item.image} alt={item.name} className="w-36 h-36 object-cover rounded-md mr-4" />
              
              {/* Detalles del producto */}
              <div className="flex flex-col">
                <div className='underline'><strong>{item.name}</strong></div>
                <div>Cantidad: {item.cantidad}</div>
                <div>Precio: S/. {item.price.toFixed(2)}</div>
                <div>Importe: S/. {item.importe.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>

        <hr className="my-4 border-gray-500" />

        {/* Totales */}
        <div className="text-lg">
          <div><strong>Total (Sin IGV):</strong> S/. {selectedOrder?.items.reduce((acc, item) => acc + item.importe, 0).toFixed(2)}</div>
          <div><strong>IGV (18%):</strong> S/. {(selectedOrder?.items.reduce((acc, item) => acc + item.importe, 0) * 0.18).toFixed(2)}</div>
          <div><strong>Total con IGV:</strong> S/. {selectedOrder?.total.toFixed(2)}</div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="danger" onClick={handleCloseModal}>Cerrar</Button>

        {/* Solo mostrar el botón de cancelar si el estado es 'Pendiente' */}
        {selectedOrder?.estado === 'Pendiente' && (
          <Button variant="warning" onClick={() => handleCancelOrder(selectedOrder.idPedido)} className="d-flex align-items-center">
            <FiAlertTriangle className="ms-2 me-2" />
            Cancelar Compra
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default DetallesOrdenModal;
