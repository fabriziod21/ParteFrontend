import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'tailwindcss/tailwind.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  Filler,
} from 'chart.js';
import { DataGrid } from '@mui/x-data-grid';
import Kpi from '../Reutilizables/kpi';
import { Modal, Button, Badge } from 'react-bootstrap'; // Importar Modal y Button de react-bootstrap
import axios from 'axios';
import { FaUserAlt, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaCreditCard } from 'react-icons/fa'; // Font Awesome Icons
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  Filler
);

const Dashboard = ({ darkMode }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderData, setOrderData] = useState([]); // Almacenará los pedidos
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [xAxisData, setXAxisData] = useState([]);
  const [seriesData, setSeriesData] = useState([]);

  // Función para abrir y cerrar el modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Función para obtener los datos del backend
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/pedido/listarPedMes');
      const dataFromBackend = response.data;
    
      // Transformar los datos recibidos para adaptarlos al formato necesario
      const meses = dataFromBackend.map(item => {
        const [year, month] = item.mes.split('-'); // Descomponer el string "YYYY-MM"
        const fecha = new Date(year, month - 1); // Restar 1 al mes para que coincida con el índice de JavaScript
  
        const mes = fecha.toLocaleString('default', { month: 'long' }); // Obtener el nombre del mes
        return `${mes}`; // Formato: "Mes" (ejemplo: "Marzo")
      });
  
      const totalPedidos = dataFromBackend.map(item => item.totalPedidos);
  
      // Verificar los valores antes de actualizar el estado
      console.log(meses, totalPedidos);
    
      // Actualizar los estados con los datos recibidos
      setXAxisData(meses);
      setSeriesData(totalPedidos);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  };
  
  

  // Llamar a fetchData al montar el componente
  useEffect(() => {
    fetchData();
  }, []);

  // Datos para el gráfico
  const data = {
    labels: xAxisData,
    datasets: [
      {
        label: 'Ventas Anuales',
        data: seriesData,
        borderColor: darkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 191, 255, 0.2)',
        borderWidth: 0.3,
        fill: true,
      },
    ],
  };

  // Configuración de opciones del gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500,
      easing: 'easeInOutQuad',
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Meses',
          color: darkMode ? '#FFFFFF' : '#000000', // Texto blanco en modo oscuro, negro en modo claro
        },
        ticks: {
          color: darkMode ? '#FFFFFF' : '#000000', // Texto blanco en modo oscuro, negro en modo claro
        },
      },
      y: {
        title: {
          display: true,
          text: 'Ventas (USD)',
          color: darkMode ? '#FFFFFF' : '#000000', // Texto blanco en modo oscuro, negro en modo claro
        },
        beginAtZero: true,
        ticks: {
          color: darkMode ? '#FFFFFF' : '#000000', // Texto blanco en modo oscuro, negro en modo claro
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: darkMode ? '#FFFFFF' : '#000000', // Texto blanco en modo oscuro, negro en modo claro
        },
      },
      title: {
        color: darkMode ? '#FFFFFF' : '#000000', // Texto blanco en modo oscuro, negro en modo claro
      },
    },
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/pedido/listarPedidos');
        const mappedOrders = response.data.map(order => ({
          id: order.idPedido,
          idUsu: order.idUsuario,
          cliente: `${order.nombreUsuario} ${order.apellidoUsuario}`,
          correo: order.correoUsuario,
          telefono: order.telefonoUsuario,
          direccion: order.direccionUsuario,
          estadoUsu: order.estadoUsuario,
          metodoPago: order.metodoPago,
          fecha: order.fecha,
          estadoP: order.estadoPedido,
          hora: order.hora,
          estado: order.estadoPedido,
          total: order.total,
          productos: order.productos, // Guardamos los productos asociados al pedido
        }));
        setOrderData(mappedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrderData = orderData.filter(item =>
    item.cliente.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
    item.empleado.toLowerCase().includes(orderSearchTerm.toLowerCase())
  );

  const orderColumns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'cliente', headerName: 'Nombre del Cliente', width: 250 },
    { field: 'empleado', headerName: 'Nombre del Empleado', width: 250 },
    { field: 'fecha', headerName: 'Fecha', width: 270 },
    { field: 'hora', headerName: 'Hora', width: 270 },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 280,
      renderCell: (params) => {
        let colorClass;
        switch (params.value) {
          case 'Entregado':
            colorClass = 'bg-green-500 text-white'; // Verde para Completado, blanco para texto
            break;
          case 'Pendiente':
            colorClass = 'bg-yellow-500 text-black'; // Amarillo para Pendiente, negro para texto
            break;
          case 'Cancelado':
            colorClass = 'bg-red-500 text-white'; // Rojo para Cancelado, blanco para texto
            break;
          default:
            colorClass = 'bg-gray-300 text-black'; // Color por defecto
            break;
        }

        return (
          <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-full ${colorClass}`}>
            {params.value}
          </span>
        );
      },
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 150,
      renderCell: (params) => (
        <div className="flex justify-center">
          <button
            className="btn btn-warning px-2 text-sm mt-2"
            onClick={() => { setSelectedOrder(params.row); openModal(); }} // Al hacer clic, abrir el modal
          >
            Ver Más
          </button>
        </div>
      ),
    },
  ];

  const kpis = [
    {
      title: 'Total Ventas',
      value: '$45,000',
      description: 'Última actualización: Hoy',
      color: 'border-red-600',
    },
    {
      title: 'Promedio Mensual',
      value: '$3,750',
      description: 'Última actualización: Hoy',
      color: 'border-red-600',
    },
    {
      title: 'Mejor Mes',
      value: 'Diciembre',
      description: 'Última actualización: Hoy',
      color: 'border-red-600',
    },
    {
      title: 'Peor Mes',
      value: 'Marzo',
      description: 'Última actualización: Hoy',
      color: 'border-red-600',
    },
  ];

  return (
    <div className={`min-h-screen flex flex-col items-center p-8 transition-colors duration-500 ${darkMode ? 'bg-fondo text-white' : 'bg-white text-black'}`}>
      {/* Encabezado */}
      <header className={`w-full p-4 flex justify-between items-center mb-8 rounded-lg shadow-lg transition-colors duration-500 ${darkMode ? 'bg-bgper text-white' : 'bg-gray-200 text-black'}`}>
        <h1 className="text-2xl font-bold font-kanit">Dashboard de Ventas</h1>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10 w-full mb-8 font-kanit">
        {/* Mapear y mostrar los KPIs usando el componente KPIWidget */}
        {kpis.map((kpi, index) => (
          <Kpi
            key={index}
            title={kpi.title}
            value={kpi.value}
            description={kpi.description}
            color={kpi.color}
            isDarkMode={darkMode} // Pasar el estado del modo oscuro
          />
        ))}
      </div>

      {/* Contenedor del gráfico */}
      <div
        className={`${darkMode ? 'bg-bgper' : 'bg-gray-50 rounded-3xl shadow-sm'} rounded-3xl h-128 p-3 w-full max-w-full mb-8 transition-colors duration-500`}
        style={{ height: '600px' }} // Ajusta la altura según sea necesario
      >
        <Line data={data} options={options} />
      </div>

      {/* Tabla de Últimos Pedidos */}
      <div className={`w-full mb-8 ${darkMode ? 'bg-bgper' : 'bg-gray-50'} rounded-3xl p-3 shadow-lg transition-colors duration-500`}>
        <h2 className="text-xl font-bold mb-4 font-kanit">Últimos Pedidos</h2>
        <input
          type="text"
          placeholder="Buscar pedido..."
          value={orderSearchTerm}
          onChange={(e) => setOrderSearchTerm(e.target.value)}
          className={`p-2 border rounded-md w-full mb-4 ${darkMode ? 'bg-bgper text-white' : 'bg-gray-200 text-black'}`} // Estilo del input
        />
        <div style={{ height: 475, width: '100%' }}>
          <DataGrid
            rows={filteredOrderData}
            columns={orderColumns}
            pageSize={7}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 7,
                },
              },
            }}
            pageSizeOptions={[8]}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid',
                borderColor: darkMode ? '#ffffff' : '#000000',
                color: darkMode ? '#ffffff' : '#000000',
                fontFamily: 'font-kanit',
              },
              '& .MuiDataGrid-row': {
                height: '60px', // Aumentar la altura de la fila
              },
              '& .MuiDataGrid-footerContainer': {
                fontFamily: 'font-kanit', // Estilo para la parte baja (footer)
                backgroundColor: darkMode ? '#ffffff' : '#f5f5f5', // Color de fondo oscuro o claro
                borderTop: '1px solid', // Borde superior
                borderColor: darkMode ? '#ffffff' : '#000000', // Color del borde
              },
              '& .MuiTypography-root': { // Estilo para el texto en el footer
                fontFamily: 'font-kanit',
                color: darkMode ? '#ffffff' : '#000000', // Color del texto
              },
            }}
          />
        </div>
      </div>
      <Modal show={isModalOpen} onHide={closeModal} centered size="xl">
        <Modal.Header closeButton className="bg-gray-200">
          <Modal.Title className="text-xl font-bold">Detalles del Pedido</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-gray-50 p-6">
          {selectedOrder && (
            <>
              {/* Contenedor para la Información del Cliente y Pedido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                {/* Información del Cliente */}
                <div className="p-6 bg-gray-100 border border-gray-300 rounded-lg">
                  <h6 className="text-lg font-semibold text-gray-700 mb-4">Información del Cliente</h6>
                  <div className="space-y-4"> {/* Aumento el espacio entre líneas */}
                    <div className="flex items-center mb-4">
                      <FaUserAlt className="text-gray-600 w-5 h-5 mr-3" />
                      <p><strong>ID Usuario:</strong> {selectedOrder.idUsu}</p>
                    </div>
                    <div className="flex items-center mb-4">
                      <FaUserAlt className="text-gray-600 w-5 h-5 mr-3" />
                      <p><strong>Cliente:</strong> {selectedOrder.cliente}</p>
                    </div>
                    <div className="flex items-center mb-4">
                      <FaEnvelope className="text-gray-600 w-5 h-5 mr-3" />
                      <p><strong>Correo:</strong> {selectedOrder.correo}</p>
                    </div>
                    <div className="flex items-center mb-4">
                      <FaPhoneAlt className="text-gray-600 w-5 h-5 mr-3" />
                      <p><strong>Teléfono:</strong> {selectedOrder.telefono}</p>
                    </div>
                    <div className="flex items-center mb-4">
                      <FaMapMarkerAlt className="text-gray-600 w-5 h-5 mr-3" />
                      <p><strong>Dirección:</strong> {selectedOrder.direccion}</p>
                    </div>
                    <div className="flex items-center mb-4">
                      <p><strong>Estado del Usuario: </strong>
                        <Badge bg={selectedOrder.estadoUsu === 'activo' ? 'success' : 'danger'}>
                          {selectedOrder.estadoUsu}
                        </Badge>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información del Pedido */}
                <div className="p-6 bg-white border border-gray-300 rounded-lg">
                  <h6 className="text-lg font-semibold text-gray-700 mb-4">Información del Pedido</h6>
                  <div className="space-y-4"> {/* Aumento el espacio entre líneas */}
                    <div className="flex items-center mb-4">
                      <p><strong>ID Pedido:</strong> {selectedOrder.id}</p>
                    </div>
                    <div className="flex items-center mb-4">
                      <p><strong>Método de Pago:</strong> {selectedOrder.metodoPago}</p>
                    </div>
                    <div className="flex items-center mb-4">
                      <p><strong>Fecha:</strong> {selectedOrder.fecha}</p>
                    </div>
                    <div className="flex items-center mb-4">
                      <p><strong>Hora:</strong> {selectedOrder.hora}</p>
                    </div>
                    <div className="flex items-center mb-4">
                      <p><strong>Estado del Pedido: </strong>
                        <Badge
                          bg={
                            selectedOrder.estado === 'Pendiente' ? 'warning' :
                              selectedOrder.estado === 'Entregado' ? 'success' :
                                'primary'
                          }
                        >
                          {selectedOrder.estado}
                        </Badge>

                      </p>
                    </div>
                    <div className="flex items-center mb-4">
                      <p><strong>Total:</strong> S/.{selectedOrder.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

              </div>

              <h5 className="font-semibold text-lg mb-4">Productos:</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedOrder.productos.map((producto, index) => (
                  <div key={index} className="flex flex-col bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-shrink-0">
                        {/* Imagen del producto */}
                        <img
                          src={producto.imagenes[0]}
                          alt={`${producto.nombre} imagen`}
                          className="w-24 h-auto rounded-lg border-2 border-gray-300 shadow-sm"
                        />
                      </div>
                      <div className="flex-1 pl-4">
                        <strong className="text-lg">{producto.nombre}</strong>
                        <p className="text-sm text-gray-600 mt-1">{producto.descripcion}</p>
                        <p className="text-lg font-semibold mt-2">${producto.precio} x {producto.cantidad}</p>
                      </div>
                    </div>
                    {/* Línea de separación entre productos */}
                    <div className="border-t mt-3 pt-3">
                      <p className="text-sm text-gray-500">Subtotal: ${(producto.precio * producto.cantidad).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-gray-200">
          <Button variant="secondary" onClick={closeModal}>Cerrar</Button>
        </Modal.Footer>
      </Modal>


    </div>
  );
};

export default Dashboard;
