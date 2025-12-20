import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';
import { Modal } from 'react-bootstrap';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  Package,
  Eye,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CreditCard,
  MapPin,
  Mail,
  Phone,
  User,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Dashboard = ({ darkMode }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderData, setOrderData] = useState([]);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [chartData, setChartData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [stats, setStats] = useState({
    totalVentas: 0,
    totalPedidos: 0,
    promedioMensual: 0,
    clientesActivos: 0
  });

  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Fetch chart data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/pedido/listarPedMes');
        const dataFromBackend = response.data;

        const formattedData = dataFromBackend.map(item => {
          const [year, month] = item.mes.split('-');
          const fecha = new Date(year, month - 1);
          const mes = fecha.toLocaleString('default', { month: 'short' });
          return {
            mes: mes.charAt(0).toUpperCase() + mes.slice(1),
            ventas: item.totalPedidos,
            ingresos: item.totalPedidos * 150 // Ejemplo de cálculo
          };
        });

        setChartData(formattedData);

        // Calcular estadísticas
        const total = formattedData.reduce((acc, curr) => acc + curr.ventas, 0);
        const promedio = formattedData.length > 0 ? Math.round(total / formattedData.length) : 0;
        setStats(prev => ({
          ...prev,
          totalPedidos: total,
          promedioMensual: promedio,
          totalVentas: total * 150
        }));
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };

    fetchData();
  }, []);

  // Fetch orders
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
          productos: order.productos,
        }));
        setOrderData(mappedOrders);
        setStats(prev => ({ ...prev, clientesActivos: new Set(mappedOrders.map(o => o.idUsu)).size }));
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orderData.filter(item =>
    item.cliente?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
    item.id?.toString().includes(orderSearchTerm)
  );

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: 'linear-gradient(145deg, rgba(20, 20, 20, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}
        >
          <p style={{ color: '#d4af37', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, fontSize: '13px' }}>
              {entry.name}: {entry.name === 'Ingresos' ? `$${entry.value.toLocaleString()}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const config = {
      'Entregado': { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', icon: CheckCircle },
      'Pendiente': { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', icon: Clock },
      'Cancelado': { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', icon: XCircle }
    };
    const { bg, color, icon: Icon } = config[status] || config['Pendiente'];

    return (
      <span
        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
        style={{ background: bg, color, border: `1px solid ${color}30` }}
      >
        <Icon size={12} />
        {status}
      </span>
    );
  };

  // Pie chart data
  const pieData = [
    { name: 'Entregado', value: orderData.filter(o => o.estado === 'Entregado').length, color: '#22c55e' },
    { name: 'Pendiente', value: orderData.filter(o => o.estado === 'Pendiente').length, color: '#f59e0b' },
    { name: 'Cancelado', value: orderData.filter(o => o.estado === 'Cancelado').length, color: '#ef4444' }
  ];

  const cardStyle = {
    background: darkMode
      ? 'linear-gradient(145deg, rgba(20, 20, 20, 0.9) 0%, rgba(15, 15, 15, 0.95) 100%)'
      : 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%)',
    border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.08)'}`,
    boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0,0,0,0.06)'
  };

  return (
    <div
      className="min-h-screen p-6 lg:p-8"
      style={{ background: darkMode ? '#0a0a0a' : '#f5f5f5' }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)' }}
          >
            <LayoutDashboard className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1
              className="text-2xl lg:text-3xl font-bold"
              style={{ color: darkMode ? '#ffffff' : '#1a1a1a', fontFamily: "'Playfair Display', serif" }}
            >
              Panel de <span style={{ color: '#d4af37' }}>Control</span>
            </h1>
            <p style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '14px' }}>
              Bienvenido al dashboard administrativo
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Total Ventas */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(212, 175, 55, 0.15)' }}
            >
              <DollarSign size={24} style={{ color: '#d4af37' }} />
            </div>
            <span
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
              style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}
            >
              <ArrowUpRight size={12} />
              +12.5%
            </span>
          </div>
          <p className="text-sm mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Total Ventas
          </p>
          <p className="text-3xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            ${stats.totalVentas.toLocaleString()}
          </p>
        </div>

        {/* Total Pedidos */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(139, 92, 246, 0.15)' }}
            >
              <ShoppingCart size={24} style={{ color: '#8b5cf6' }} />
            </div>
            <span
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
              style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}
            >
              <ArrowUpRight size={12} />
              +8.2%
            </span>
          </div>
          <p className="text-sm mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Total Pedidos
          </p>
          <p className="text-3xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            {stats.totalPedidos}
          </p>
        </div>

        {/* Promedio Mensual */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(34, 197, 94, 0.15)' }}
            >
              <TrendingUp size={24} style={{ color: '#22c55e' }} />
            </div>
            <span
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
            >
              <ArrowDownRight size={12} />
              -2.1%
            </span>
          </div>
          <p className="text-sm mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Promedio Mensual
          </p>
          <p className="text-3xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            {stats.promedioMensual}
          </p>
        </div>

        {/* Clientes Activos */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(59, 130, 246, 0.15)' }}
            >
              <Users size={24} style={{ color: '#3b82f6' }} />
            </div>
            <span
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
              style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}
            >
              <ArrowUpRight size={12} />
              +5.3%
            </span>
          </div>
          <p className="text-sm mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Clientes Activos
          </p>
          <p className="text-3xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            {stats.clientesActivos}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3
                className="text-lg font-semibold"
                style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}
              >
                Ventas Mensuales
              </h3>
              <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Resumen de ventas del año
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#d4af37' }}></div>
                <span style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Ventas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#8b5cf6' }}></div>
                <span style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Ingresos</span>
              </div>
            </div>
          </div>

          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                  vertical={false}
                />
                <XAxis
                  dataKey="mes"
                  tick={{ fill: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 12 }}
                  axisLine={{ stroke: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 12 }}
                  axisLine={{ stroke: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  name="Ventas"
                  stroke="#d4af37"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorVentas)"
                  dot={{ fill: '#d4af37', strokeWidth: 2, r: 4, stroke: darkMode ? '#0a0a0a' : '#ffffff' }}
                />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  name="Ingresos"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIngresos)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}
          >
            Estado de Pedidos
          </h3>
          <p className="text-sm mb-6" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Distribucion actual
          </p>

          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: darkMode ? '#1a1a1a' : '#ffffff',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 mt-4">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color }}></div>
                  <span style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', fontSize: '14px' }}>
                    {item.name}
                  </span>
                </div>
                <span className="font-semibold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl p-6" style={cardStyle}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}
            >
              Ultimos Pedidos
            </h3>
            <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
              Gestion de pedidos recientes
            </p>
          </div>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
            />
            <input
              type="text"
              placeholder="Buscar pedido..."
              value={orderSearchTerm}
              onChange={(e) => setOrderSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl w-full lg:w-80 focus:outline-none transition-all"
              style={{
                background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                color: darkMode ? '#ffffff' : '#1a1a1a'
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>ID</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Cliente</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Fecha</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Estado</th>
                <th className="text-right py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Total</th>
                <th className="text-center py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((order, index) => (
                <tr
                  key={order.id}
                  className="transition-all hover:bg-opacity-50"
                  style={{
                    borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                    background: index % 2 === 0 ? 'transparent' : (darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)')
                  }}
                >
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm" style={{ color: '#d4af37' }}>#{order.id}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)', color: '#0a0a0a' }}
                      >
                        {order.cliente?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                          {order.cliente}
                        </p>
                        <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                          {order.correo}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p style={{ color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>{order.fecha}</p>
                      <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>{order.hora}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={order.estado} />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-bold text-lg" style={{ color: '#d4af37' }}>
                      S/.{order.total?.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => openModal(order)}
                      className="p-2 rounded-lg transition-all hover:scale-105"
                      style={{
                        background: 'rgba(212, 175, 55, 0.1)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: '#d4af37'
                      }}
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} style={{ color: 'rgba(212, 175, 55, 0.3)', margin: '0 auto 16px' }} />
            <p style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
              No se encontraron pedidos
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6"
            style={{ borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Mostrar
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-lg text-sm focus:outline-none"
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`,
                  color: darkMode ? '#ffffff' : '#1a1a1a'
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <span className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                de {filteredOrders.length} registros
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`,
                  color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                }}
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: Math.ceil(filteredOrders.length / itemsPerPage) }, (_, i) => i + 1)
                .filter(page => {
                  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
                  if (totalPages <= 5) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  return false;
                })
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span style={{ color: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className="w-9 h-9 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                      style={{
                        background: currentPage === page
                          ? 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)'
                          : darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        border: currentPage === page
                          ? 'none'
                          : `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`,
                        color: currentPage === page ? '#0a0a0a' : (darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)')
                      }}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredOrders.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(filteredOrders.length / itemsPerPage)}
                className="p-2 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`,
                  color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal show={isModalOpen} onHide={closeModal} centered size="lg">
        <div
          style={{
            background: darkMode ? '#0a0a0a' : '#ffffff',
            borderRadius: '16px',
            overflow: 'hidden'
          }}
        >
          {/* Modal Header */}
          <div
            className="flex items-center justify-between p-6"
            style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}
          >
            <div>
              <h3 className="text-xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                Detalles del Pedido <span style={{ color: '#d4af37' }}>#{selectedOrder?.id}</span>
              </h3>
              <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                {selectedOrder?.fecha} - {selectedOrder?.hora}
              </p>
            </div>
            <button
              onClick={closeModal}
              className="p-2 rounded-lg transition-all hover:scale-105"
              style={{ background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
            >
              <X size={20} style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            {selectedOrder && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Client Info */}
                  <div
                    className="p-5 rounded-xl"
                    style={{
                      background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                    }}
                  >
                    <h4 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#d4af37' }}>
                      <User size={18} /> Informacion del Cliente
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User size={16} style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} />
                        <span style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>{selectedOrder.cliente}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail size={16} style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} />
                        <span style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>{selectedOrder.correo}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone size={16} style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} />
                        <span style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>{selectedOrder.telefono}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin size={16} style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} />
                        <span style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>{selectedOrder.direccion}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div
                    className="p-5 rounded-xl"
                    style={{
                      background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                    }}
                  >
                    <h4 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#d4af37' }}>
                      <ShoppingCart size={18} /> Informacion del Pedido
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Metodo de Pago</span>
                        <span className="flex items-center gap-2" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                          <CreditCard size={16} /> {selectedOrder.metodoPago}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Estado</span>
                        <StatusBadge status={selectedOrder.estado} />
                      </div>
                      <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                        <span className="font-semibold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>Total</span>
                        <span className="text-2xl font-bold" style={{ color: '#d4af37' }}>
                          S/.{selectedOrder.total?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <h4 className="font-semibold mb-4" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                  Productos ({selectedOrder.productos?.length || 0})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedOrder.productos?.map((producto, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-xl"
                      style={{
                        background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                      }}
                    >
                      <img
                        src={producto.imagenes?.[0]}
                        alt={producto.nombre}
                        className="w-16 h-16 rounded-lg object-cover"
                        style={{ border: '1px solid rgba(212, 175, 55, 0.2)' }}
                      />
                      <div className="flex-1">
                        <p className="font-medium" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                          {producto.nombre}
                        </p>
                        <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                          ${producto.precio} x {producto.cantidad}
                        </p>
                      </div>
                      <p className="font-bold" style={{ color: '#d4af37' }}>
                        ${(producto.precio * producto.cantidad).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
