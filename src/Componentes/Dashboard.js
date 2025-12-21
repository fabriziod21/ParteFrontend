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
  Cell,
  LineChart,
  Line
} from 'recharts';
import api from '../services/api';
import { Modal } from 'react-bootstrap';
import LoadingScreen from './LoadingScreen';
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
  ChevronRight,
  Target,
  Award,
  Bell,
  Activity,
  Zap,
  Star,
  AlertTriangle,
  RefreshCw,
  Download,
  Filter,
  MessageSquare,
  UserPlus,
  ShoppingBag,
  Flame,
  Crown
} from 'lucide-react';

const Dashboard = ({ darkMode }) => {
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderData, setOrderData] = useState([]);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [chartData, setChartData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [dateFilter, setDateFilter] = useState('month');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [topProducts, setTopProducts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    totalVentas: 0,
    totalPedidos: 0,
    promedioMensual: 0,
    clientesActivos: 0,
    ticketPromedio: 0,
    tasaConversion: 0,
    ventasHoy: 0,
    pedidosHoy: 0,
    ventasMesAnterior: 0,
    pedidosMesAnterior: 0,
    metaMensual: 50000,
    comentariosNuevos: 0
  });

  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // Fetch chart data
        const chartResponse = await api.get('/api/pedido/listarPedMes');
        const dataFromBackend = chartResponse.data;

        const formattedData = dataFromBackend
          .filter(item => item.mes)
          .map(item => {
            const mesStr = String(item.mes);
            let year, month;

            if (mesStr.includes('-')) {
              [year, month] = mesStr.split('-');
            } else if (mesStr.includes('/')) {
              [month, year] = mesStr.split('/');
            } else {
              month = mesStr;
              year = new Date().getFullYear();
            }

            const monthNum = parseInt(month, 10);
            const yearNum = parseInt(year, 10);

            if (isNaN(monthNum) || isNaN(yearNum)) return null;

            const fecha = new Date(yearNum, monthNum - 1);
            const mesNombre = fecha.toLocaleString('es-ES', { month: 'short' });
            const totalPedidos = item.total_pedidos || item.totalPedidos || 0;

            return {
              mes: mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1),
              mesNum: monthNum,
              ventas: totalPedidos,
              ingresos: totalPedidos * 150
            };
          })
          .filter(item => item !== null);

        setChartData(formattedData);

        // Calculate stats
        const total = formattedData.reduce((acc, curr) => acc + curr.ventas, 0);
        const promedio = formattedData.length > 0 ? Math.round(total / formattedData.length) : 0;

        // Get current and previous month data for comparison
        const currentMonth = new Date().getMonth() + 1;
        const currentMonthData = formattedData.find(d => d.mesNum === currentMonth);
        const prevMonthData = formattedData.find(d => d.mesNum === currentMonth - 1);

        setStats(prev => ({
          ...prev,
          totalPedidos: total,
          promedioMensual: promedio,
          totalVentas: total * 150,
          ventasMesAnterior: prevMonthData ? prevMonthData.ingresos : 0,
          pedidosMesAnterior: prevMonthData ? prevMonthData.ventas : 0,
          ventasHoy: currentMonthData ? Math.round(currentMonthData.ingresos / 30) : 0,
          pedidosHoy: currentMonthData ? Math.round(currentMonthData.ventas / 30) : 0
        }));

        // Fetch orders
        const ordersResponse = await api.get('/api/pedido/listarPedidos');
        const mappedOrders = ordersResponse.data.map(order => ({
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

        // Calculate ticket promedio
        const totalVentasOrders = mappedOrders.reduce((acc, o) => acc + (o.total || 0), 0);
        const ticketProm = mappedOrders.length > 0 ? totalVentasOrders / mappedOrders.length : 0;

        // Get unique clients
        const uniqueClients = new Set(mappedOrders.map(o => o.idUsu)).size;

        // Generate top products from orders
        const productCount = {};
        mappedOrders.forEach(order => {
          order.productos?.forEach(prod => {
            if (productCount[prod.nombre]) {
              productCount[prod.nombre].cantidad += prod.cantidad;
              productCount[prod.nombre].ingresos += prod.precio * prod.cantidad;
            } else {
              productCount[prod.nombre] = {
                nombre: prod.nombre,
                imagen: prod.imagenes?.[0],
                cantidad: prod.cantidad,
                ingresos: prod.precio * prod.cantidad,
                precio: prod.precio
              };
            }
          });
        });

        const sortedProducts = Object.values(productCount)
          .sort((a, b) => b.cantidad - a.cantidad)
          .slice(0, 5);
        setTopProducts(sortedProducts);

        // Generate recent activity
        const activities = mappedOrders.slice(0, 8).map(order => ({
          type: 'order',
          icon: ShoppingCart,
          title: `Nuevo pedido #${order.id}`,
          description: order.cliente,
          time: `${order.fecha} ${order.hora}`,
          color: '#d4af37'
        }));
        setRecentActivity(activities);

        // Generate alerts
        const pendingOrders = mappedOrders.filter(o => o.estado === 'Pendiente').length;
        const generatedAlerts = [];

        if (pendingOrders > 0) {
          generatedAlerts.push({
            type: 'warning',
            icon: Clock,
            title: `${pendingOrders} pedidos pendientes`,
            description: 'Requieren atención',
            color: '#f59e0b'
          });
        }

        if (sortedProducts.some(p => p.cantidad > 20)) {
          generatedAlerts.push({
            type: 'success',
            icon: Flame,
            title: 'Producto en tendencia',
            description: sortedProducts[0]?.nombre,
            color: '#22c55e'
          });
        }

        setAlerts(generatedAlerts);

        setStats(prev => ({
          ...prev,
          clientesActivos: uniqueClients,
          ticketPromedio: ticketProm,
          tasaConversion: uniqueClients > 0 ? ((mappedOrders.length / (uniqueClients * 3)) * 100).toFixed(1) : 0
        }));

        setLastUpdate(new Date());

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [dateFilter]);

  const filteredOrders = orderData.filter(item =>
    item.cliente?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
    item.id?.toString().includes(orderSearchTerm)
  );

  // Calculate percentage changes
  const calcChange = (current, previous) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous * 100).toFixed(1);
    return { value: Math.abs(change), isPositive: change >= 0 };
  };

  const ventasChange = calcChange(stats.totalVentas, stats.ventasMesAnterior * 6);
  const pedidosChange = calcChange(stats.totalPedidos, stats.pedidosMesAnterior * 6);

  // Progress towards goal
  const goalProgress = Math.min((stats.totalVentas / stats.metaMensual) * 100, 100);

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
              {entry.name}: {entry.name === 'Ingresos' ? `S/.${entry.value.toLocaleString()}` : entry.value}
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

  // Weekly data (simulated from monthly)
  const weeklyData = [
    { dia: 'Lun', ventas: Math.round(stats.pedidosHoy * 0.8) },
    { dia: 'Mar', ventas: Math.round(stats.pedidosHoy * 1.2) },
    { dia: 'Mie', ventas: Math.round(stats.pedidosHoy * 0.9) },
    { dia: 'Jue', ventas: Math.round(stats.pedidosHoy * 1.4) },
    { dia: 'Vie', ventas: Math.round(stats.pedidosHoy * 1.8) },
    { dia: 'Sab', ventas: Math.round(stats.pedidosHoy * 2.2) },
    { dia: 'Dom', ventas: Math.round(stats.pedidosHoy * 1.5) }
  ];

  // Hourly data (peak hours)
  const hourlyData = [
    { hora: '10am', pedidos: 5 },
    { hora: '12pm', pedidos: 12 },
    { hora: '2pm', pedidos: 8 },
    { hora: '4pm', pedidos: 15 },
    { hora: '6pm', pedidos: 22 },
    { hora: '8pm', pedidos: 18 },
    { hora: '10pm', pedidos: 10 }
  ];

  const cardStyle = {
    background: darkMode
      ? 'linear-gradient(145deg, rgba(20, 20, 20, 0.9) 0%, rgba(15, 15, 15, 0.95) 100%)'
      : 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%)',
    border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.08)'}`,
    boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0,0,0,0.06)'
  };

  const selectStyle = {
    background: darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(250, 250, 250, 0.95)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    color: darkMode ? '#ffffff' : '#1a1a1a',
    cursor: 'pointer'
  };

  if (loading) {
    return <LoadingScreen darkMode={darkMode} message="Cargando dashboard..." />;
  }

  return (
    <div
      className="min-h-screen p-6 lg:p-8"
      style={{ background: darkMode ? '#0a0a0a' : '#f5f5f5' }}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
              boxShadow: '0 8px 24px rgba(212, 175, 55, 0.3)'
            }}
          >
            <LayoutDashboard className="w-7 h-7 text-black" />
          </div>
          <div>
            <h1
              className="text-2xl lg:text-3xl font-bold"
              style={{ color: darkMode ? '#ffffff' : '#1a1a1a', fontFamily: "'Playfair Display', serif" }}
            >
              Panel de <span style={{ color: '#d4af37' }}>Control</span>
            </h1>
            <p className="flex items-center gap-2" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '14px' }}>
              <Clock size={14} />
              Última actualización: {lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl focus:outline-none text-sm"
            style={selectStyle}
          >
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="year">Este año</option>
          </select>

          <button
            onClick={() => setLastUpdate(new Date())}
            className="p-2.5 rounded-xl transition-all hover:scale-105"
            style={{
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: '#d4af37'
            }}
          >
            <RefreshCw size={18} />
          </button>

          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
              color: '#0a0a0a',
              fontWeight: '600'
            }}
          >
            <Download size={16} />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* Goal Progress */}
      <div className="rounded-2xl p-5 mb-6" style={cardStyle}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(212, 175, 55, 0.15)' }}
            >
              <Target size={24} style={{ color: '#d4af37' }} />
            </div>
            <div>
              <p className="text-sm mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Meta mensual de ventas
              </p>
              <p className="text-xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                S/.{stats.totalVentas.toLocaleString()} <span style={{ color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontWeight: 'normal' }}>/ S/.{stats.metaMensual.toLocaleString()}</span>
              </p>
            </div>
          </div>

          <div className="flex-1 lg:max-w-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold" style={{ color: goalProgress >= 100 ? '#22c55e' : '#d4af37' }}>
                {goalProgress.toFixed(1)}% completado
              </span>
              {goalProgress >= 100 && (
                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
                  <CheckCircle size={12} /> ¡Meta alcanzada!
                </span>
              )}
            </div>
            <div
              className="h-3 rounded-full overflow-hidden"
              style={{ background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${goalProgress}%`,
                  background: goalProgress >= 100
                    ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                    : 'linear-gradient(90deg, #d4af37 0%, #f59e0b 100%)'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-8">
        {/* Total Ventas */}
        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(212, 175, 55, 0.15)' }}
            >
              <DollarSign size={22} style={{ color: '#d4af37' }} />
            </div>
            <span
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
              style={{
                background: ventasChange.isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: ventasChange.isPositive ? '#22c55e' : '#ef4444'
              }}
            >
              {ventasChange.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {ventasChange.value}%
            </span>
          </div>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Total Ventas
          </p>
          <p className="text-2xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            S/.{stats.totalVentas.toLocaleString()}
          </p>
          {/* Mini sparkline */}
          <div className="mt-3 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <Line type="monotone" dataKey="ventas" stroke="#d4af37" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Total Pedidos */}
        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(139, 92, 246, 0.15)' }}
            >
              <ShoppingCart size={22} style={{ color: '#8b5cf6' }} />
            </div>
            <span
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
              style={{
                background: pedidosChange.isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: pedidosChange.isPositive ? '#22c55e' : '#ef4444'
              }}
            >
              {pedidosChange.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {pedidosChange.value}%
            </span>
          </div>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Total Pedidos
          </p>
          <p className="text-2xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            {stats.totalPedidos}
          </p>
          <div className="mt-3 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <Line type="monotone" dataKey="ventas" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Promedio */}
        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(34, 197, 94, 0.15)' }}
            >
              <CreditCard size={22} style={{ color: '#22c55e' }} />
            </div>
            <span
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
              style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}
            >
              <TrendingUp size={12} />
              Estable
            </span>
          </div>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Ticket Promedio
          </p>
          <p className="text-2xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            S/.{stats.ticketPromedio.toFixed(2)}
          </p>
          <div className="mt-3 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <Line type="monotone" dataKey="ventas" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clientes Activos */}
        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(59, 130, 246, 0.15)' }}
            >
              <Users size={22} style={{ color: '#3b82f6' }} />
            </div>
            <span
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
              style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}
            >
              <ArrowUpRight size={12} />
              +{stats.clientesActivos > 5 ? 3 : 1}
            </span>
          </div>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Clientes Activos
          </p>
          <p className="text-2xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            {stats.clientesActivos}
          </p>
          <div className="mt-3 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <Line type="monotone" dataKey="ventas" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-8">
        <div className="rounded-xl p-4" style={{ ...cardStyle, background: darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          <div className="flex items-center gap-3">
            <CheckCircle size={20} style={{ color: '#22c55e' }} />
            <div>
              <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Entregados</p>
              <p className="text-lg font-bold" style={{ color: '#22c55e' }}>{pieData[0].value}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ ...cardStyle, background: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <div className="flex items-center gap-3">
            <Clock size={20} style={{ color: '#f59e0b' }} />
            <div>
              <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Pendientes</p>
              <p className="text-lg font-bold" style={{ color: '#f59e0b' }}>{pieData[1].value}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ ...cardStyle, background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div className="flex items-center gap-3">
            <XCircle size={20} style={{ color: '#ef4444' }} />
            <div>
              <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Cancelados</p>
              <p className="text-lg font-bold" style={{ color: '#ef4444' }}>{pieData[2].value}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ ...cardStyle, background: darkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <div className="flex items-center gap-3">
            <Activity size={20} style={{ color: '#8b5cf6' }} />
            <div>
              <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Conversión</p>
              <p className="text-lg font-bold" style={{ color: '#8b5cf6' }}>{stats.tasaConversion}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                Ventas Mensuales
              </h3>
              <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Resumen de ventas e ingresos del año
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

          <div style={{ height: '320px', width: '100%', minWidth: '0' }}>
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
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                <XAxis dataKey="mes" tick={{ fill: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 12 }} axisLine={{ stroke: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} tickLine={false} />
                <YAxis tick={{ fill: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 12 }} axisLine={{ stroke: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(212, 175, 55, 0.2)', strokeWidth: 1, fill: 'transparent' }} />
                <Area type="monotone" dataKey="ventas" name="Ventas" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" dot={{ fill: '#d4af37', strokeWidth: 2, r: 4, stroke: darkMode ? '#0a0a0a' : '#ffffff' }} />
                <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorIngresos)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                Top Productos
              </h3>
              <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Más vendidos
              </p>
            </div>
            <Crown size={20} style={{ color: '#d4af37' }} />
          </div>

          {topProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package size={40} style={{ color: 'rgba(212, 175, 55, 0.3)', margin: '0 auto 12px' }} />
              <p style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Sin datos aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{
                      background: index === 0 ? 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)' : darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      color: index === 0 ? '#0a0a0a' : (darkMode ? '#ffffff' : '#1a1a1a')
                    }}
                  >
                    {index + 1}
                  </div>
                  {product.imagen ? (
                    <img src={product.imagen} alt={product.nombre} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                      <Package size={16} style={{ color: '#d4af37' }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                      {product.nombre}
                    </p>
                    <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                      {product.cantidad} vendidos
                    </p>
                  </div>
                  <p className="font-bold text-sm" style={{ color: '#d4af37' }}>
                    S/.{product.ingresos.toFixed(0)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Bar Chart */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h3 className="text-lg font-semibold mb-2" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            Ventas Semanales
          </h3>
          <p className="text-sm mb-4" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Distribución por día
          </p>
          <div style={{ height: '200px', width: '100%', minWidth: '0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                <XAxis dataKey="dia" tick={{ fill: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="ventas" name="Ventas" radius={[6, 6, 0, 0]} fill="#d4af37" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Chart */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h3 className="text-lg font-semibold mb-2" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            Horarios Pico
          </h3>
          <p className="text-sm mb-4" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Pedidos por hora
          </p>
          <div style={{ height: '200px', width: '100%', minWidth: '0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorHora" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                <XAxis dataKey="hora" tick={{ fill: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(139, 92, 246, 0.2)', fill: 'transparent' }} />
                <Area type="monotone" dataKey="pedidos" name="Pedidos" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorHora)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h3 className="text-lg font-semibold mb-2" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            Estado de Pedidos
          </h3>
          <p className="text-sm mb-4" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Distribución actual
          </p>
          <div style={{ height: '160px', width: '100%', minWidth: '0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={5} dataKey="value" style={{ cursor: 'pointer', outline: 'none' }}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" style={{ outline: 'none' }} />
                  ))}
                </Pie>
                <Tooltip cursor={false} contentStyle={{ background: darkMode ? '#1a1a1a' : '#ffffff', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }}></div>
                <span className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                <Activity size={20} style={{ color: '#8b5cf6' }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                  Actividad Reciente
                </h3>
                <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                  Últimos movimientos
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Activity size={32} style={{ color: 'rgba(139, 92, 246, 0.3)', margin: '0 auto 8px' }} />
                <p style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Sin actividad reciente</p>
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${activity.color}20` }}>
                    <activity.icon size={16} style={{ color: activity.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                      {activity.title}
                    </p>
                    <p className="text-xs truncate" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                      {activity.description}
                    </p>
                  </div>
                  <p className="text-xs flex-shrink-0" style={{ color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                    {activity.time.split(' ')[1]}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                <Bell size={20} style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                  Alertas
                </h3>
                <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                  Notificaciones importantes
                </p>
              </div>
            </div>
            {alerts.length > 0 && (
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#ef4444', color: '#ffffff' }}>
                {alerts.length}
              </span>
            )}
          </div>

          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle size={40} style={{ color: '#22c55e', margin: '0 auto 12px' }} />
                <p className="font-medium" style={{ color: '#22c55e' }}>¡Todo en orden!</p>
                <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>No hay alertas pendientes</p>
              </div>
            ) : (
              alerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl"
                  style={{
                    background: `${alert.color}10`,
                    border: `1px solid ${alert.color}30`
                  }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${alert.color}20` }}>
                    <alert.icon size={18} style={{ color: alert.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: alert.color }}>
                      {alert.title}
                    </p>
                    <p className="text-xs mt-1" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                      {alert.description}
                    </p>
                  </div>
                  <button className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: alert.color, color: '#ffffff' }}>
                    Ver
                  </button>
                </div>
              ))
            )}

            {/* Quick Actions */}
            <div className="pt-4 mt-4" style={{ borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
              <p className="text-xs uppercase tracking-wide mb-3" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Acciones rápidas
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center gap-2 p-3 rounded-xl transition-all hover:scale-105" style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                  <ShoppingBag size={16} style={{ color: '#d4af37' }} />
                  <span className="text-sm" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>Nuevo pedido</span>
                </button>
                <button className="flex items-center gap-2 p-3 rounded-xl transition-all hover:scale-105" style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                  <Package size={16} style={{ color: '#8b5cf6' }} />
                  <span className="text-sm" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>Agregar producto</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl p-6" style={cardStyle}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
              Últimos Pedidos
            </h3>
            <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
              Gestión de pedidos recientes
            </p>
          </div>

          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }} />
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
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)', color: '#0a0a0a' }}>
                        {order.cliente?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>{order.cliente}</p>
                        <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>{order.correo}</p>
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
                    <span className="font-bold text-lg" style={{ color: '#d4af37' }}>S/.{order.total?.toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button onClick={() => openModal(order)} className="p-2 rounded-lg transition-all hover:scale-105" style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#d4af37' }}>
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
            <p style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>No se encontraron pedidos</p>
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6" style={{ borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Mostrar</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="px-3 py-1.5 rounded-lg text-sm focus:outline-none"
                style={selectStyle}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <span className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>de {filteredOrders.length} registros</span>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100" style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`, color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
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
                        background: currentPage === page ? 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)' : darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        border: currentPage === page ? 'none' : `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`,
                        color: currentPage === page ? '#0a0a0a' : (darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)')
                      }}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}

              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredOrders.length / itemsPerPage)))} disabled={currentPage === Math.ceil(filteredOrders.length / itemsPerPage)} className="p-2 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100" style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`, color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal show={isModalOpen} onHide={closeModal} centered size="lg">
        <div style={{ background: darkMode ? '#0a0a0a' : '#ffffff', borderRadius: '16px', overflow: 'hidden' }}>
          <div className="flex items-center justify-between p-6" style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
            <div>
              <h3 className="text-xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                Detalles del Pedido <span style={{ color: '#d4af37' }}>#{selectedOrder?.id}</span>
              </h3>
              <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                {selectedOrder?.fecha} - {selectedOrder?.hora}
              </p>
            </div>
            <button onClick={closeModal} className="p-2 rounded-lg transition-all hover:scale-105" style={{ background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <X size={20} style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }} />
            </button>
          </div>

          <div className="p-6">
            {selectedOrder && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="p-5 rounded-xl" style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                    <h4 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#d4af37' }}>
                      <User size={18} /> Información del Cliente
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

                  <div className="p-5 rounded-xl" style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                    <h4 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#d4af37' }}>
                      <ShoppingCart size={18} /> Información del Pedido
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Método de Pago</span>
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
                        <span className="text-2xl font-bold" style={{ color: '#d4af37' }}>S/.{selectedOrder.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <h4 className="font-semibold mb-4" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                  Productos ({selectedOrder.productos?.length || 0})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedOrder.productos?.map((producto, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                      <img src={producto.imagenes?.[0]} alt={producto.nombre} className="w-16 h-16 rounded-lg object-cover" style={{ border: '1px solid rgba(212, 175, 55, 0.2)' }} />
                      <div className="flex-1">
                        <p className="font-medium" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>{producto.nombre}</p>
                        <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>S/.{producto.precio} x {producto.cantidad}</p>
                      </div>
                      <p className="font-bold" style={{ color: '#d4af37' }}>S/.{(producto.precio * producto.cantidad).toFixed(2)}</p>
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
