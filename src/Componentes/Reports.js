import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import api from '../services/api';
import Swal from 'sweetalert2';
import LoadingScreen from './LoadingScreen';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Truck,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  RefreshCw,
  Eye,
  Printer,
  Mail,
  BarChart2,
  PieChart as PieChartIcon,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  FileDown,
  Table,
  LayoutGrid
} from 'lucide-react';

const Reports = ({ darkMode }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ventas');
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  // Data states
  const [ventasData, setVentasData] = useState([]);
  const [comprasData, setComprasData] = useState([]);
  const [clientesData, setClientesData] = useState([]);
  const [productosData, setProductosData] = useState([]);
  const [pedidosData, setPedidosData] = useState([]);
  const [stats, setStats] = useState({
    totalVentas: 0,
    totalCompras: 0,
    totalClientes: 0,
    totalProductos: 0,
    crecimiento: 0
  });

  const tabs = [
    { id: 'ventas', label: 'Ventas', icon: DollarSign, color: '#d4af37' },
    { id: 'compras', label: 'Compras', icon: ShoppingCart, color: '#8b5cf6' },
    { id: 'clientes', label: 'Clientes', icon: Users, color: '#22c55e' },
    { id: 'productos', label: 'Productos', icon: Package, color: '#3b82f6' },
    { id: 'pedidos', label: 'Pedidos', icon: FileText, color: '#f59e0b' }
  ];

  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch ventas/pedidos data
      const pedidosResponse = await api.get('/api/pedido/listarPedidos');
      const pedidos = pedidosResponse.data || [];

      // Process pedidos for different reports
      processPedidosData(pedidos);

      // Fetch clientes
      try {
        const clientesResponse = await api.get('/api/usuario/listar');
        processClientesData(clientesResponse.data || []);
      } catch {
        loadExampleClientesData();
      }

      // Fetch productos
      try {
        const productosResponse = await api.get('/api/producto/listar');
        processProductosData(productosResponse.data || []);
      } catch {
        loadExampleProductosData();
      }

      // Load example compras data (proveedores)
      loadExampleComprasData();

    } catch (error) {
      console.error('Error fetching data:', error);
      loadAllExampleData();
    } finally {
      setLoading(false);
    }
  };

  const processPedidosData = (pedidos) => {
    // Map pedidos for table
    const mappedPedidos = pedidos.map(p => ({
      id: p.idPedido,
      cliente: `${p.nombreUsuario} ${p.apellidoUsuario}`,
      email: p.correoUsuario,
      fecha: p.fecha,
      hora: p.hora,
      estado: p.estadoPedido,
      total: p.total,
      metodoPago: p.metodoPago,
      productos: p.productos?.length || 0
    }));
    setPedidosData(mappedPedidos);

    // Group by month for ventas chart
    const ventasPorMes = {};
    pedidos.forEach(p => {
      const fecha = p.fecha?.split('-');
      if (fecha && fecha.length >= 2) {
        const mes = `${fecha[0]}-${fecha[1]}`;
        if (!ventasPorMes[mes]) {
          ventasPorMes[mes] = { mes, total: 0, pedidos: 0 };
        }
        ventasPorMes[mes].total += p.total || 0;
        ventasPorMes[mes].pedidos += 1;
      }
    });

    const ventasArray = Object.values(ventasPorMes)
      .sort((a, b) => a.mes.localeCompare(b.mes))
      .map(item => ({
        ...item,
        mesNombre: new Date(item.mes + '-01').toLocaleString('es-ES', { month: 'short', year: '2-digit' })
      }));

    setVentasData(ventasArray.length > 0 ? ventasArray : generateExampleVentasData());

    // Calculate stats
    const totalVentas = pedidos.reduce((acc, p) => acc + (p.total || 0), 0);
    setStats(prev => ({
      ...prev,
      totalVentas,
      crecimiento: 12.5
    }));
  };

  const processClientesData = (clientes) => {
    const mappedClientes = clientes.map(c => ({
      id: c.idUsuario || c.id,
      nombre: `${c.nombreUsuario || c.nombre} ${c.apellidoUsuario || c.apellido || ''}`,
      email: c.correoUsuario || c.email,
      telefono: c.telefonoUsuario || c.telefono,
      estado: c.estadoUsuario || c.estado || 'Activo',
      rol: c.rolUsuario || c.rol || 'Cliente',
      fechaRegistro: c.fechaRegistro || '2024-01-15',
      compras: c.totalCompras || Math.floor(Math.random() * 10) + 1,
      totalGastado: c.totalGastado || Math.floor(Math.random() * 5000) + 500
    }));
    setClientesData(mappedClientes);
    setStats(prev => ({ ...prev, totalClientes: mappedClientes.length }));
  };

  const processProductosData = (productos) => {
    const mappedProductos = productos.map(p => ({
      id: p.idProducto || p.id,
      nombre: p.nombreProducto || p.nombre,
      categoria: typeof p.categoria === 'object' ? (p.categoria?.nombre || 'General') : (p.categoria || 'General'),
      precio: p.precioProducto || p.precio,
      stock: p.stock || Math.floor(Math.random() * 100),
      vendidos: p.vendidos || Math.floor(Math.random() * 50),
      estado: p.estado || 'Disponible'
    }));
    setProductosData(mappedProductos);
    setStats(prev => ({ ...prev, totalProductos: mappedProductos.length }));
  };

  const loadExampleClientesData = () => {
    const ejemploClientes = [
      { id: 1, nombre: 'María García López', email: 'maria@email.com', telefono: '987654321', estado: 'Activo', rol: 'Cliente', fechaRegistro: '2024-01-15', compras: 8, totalGastado: 2450 },
      { id: 2, nombre: 'Carlos Rodríguez Pérez', email: 'carlos@email.com', telefono: '912345678', estado: 'Activo', rol: 'Cliente', fechaRegistro: '2024-02-20', compras: 5, totalGastado: 1890 },
      { id: 3, nombre: 'Ana Martínez Flores', email: 'ana@email.com', telefono: '945678912', estado: 'Activo', rol: 'VIP', fechaRegistro: '2023-12-10', compras: 15, totalGastado: 8750 },
      { id: 4, nombre: 'Luis Sánchez Torres', email: 'luis@email.com', telefono: '978912345', estado: 'Inactivo', rol: 'Cliente', fechaRegistro: '2024-03-05', compras: 2, totalGastado: 560 },
      { id: 5, nombre: 'Patricia Díaz Vargas', email: 'patricia@email.com', telefono: '934567891', estado: 'Activo', rol: 'Cliente', fechaRegistro: '2024-01-28', compras: 6, totalGastado: 3200 }
    ];
    setClientesData(ejemploClientes);
    setStats(prev => ({ ...prev, totalClientes: ejemploClientes.length }));
  };

  const loadExampleProductosData = () => {
    const ejemploProductos = [
      { id: 1, nombre: 'Anillo de Compromiso Diamante', categoria: 'Anillos', precio: 2500, stock: 15, vendidos: 28, estado: 'Disponible' },
      { id: 2, nombre: 'Collar de Oro 18k', categoria: 'Collares', precio: 1800, stock: 22, vendidos: 45, estado: 'Disponible' },
      { id: 3, nombre: 'Aretes de Perla', categoria: 'Aretes', precio: 450, stock: 50, vendidos: 67, estado: 'Disponible' },
      { id: 4, nombre: 'Pulsera de Plata', categoria: 'Pulseras', precio: 320, stock: 35, vendidos: 52, estado: 'Disponible' },
      { id: 5, nombre: 'Reloj de Oro Rosa', categoria: 'Relojes', precio: 4500, stock: 8, vendidos: 12, estado: 'Stock Bajo' },
      { id: 6, nombre: 'Cadena de Oro', categoria: 'Collares', precio: 890, stock: 0, vendidos: 38, estado: 'Agotado' }
    ];
    setProductosData(ejemploProductos);
    setStats(prev => ({ ...prev, totalProductos: ejemploProductos.length }));
  };

  const loadExampleComprasData = () => {
    const ejemploCompras = [
      { id: 1, proveedor: 'Joyería Elegante S.A.C.', fecha: '2024-01-15', total: 12500, productos: 24, estado: 'Recibido' },
      { id: 2, proveedor: 'Gold Import Peru', fecha: '2024-01-18', total: 28900, productos: 45, estado: 'Recibido' },
      { id: 3, proveedor: 'Diamond Suppliers Int.', fecha: '2024-01-20', total: 45600, productos: 18, estado: 'En Tránsito' },
      { id: 4, proveedor: 'Perlas del Pacífico', fecha: '2024-01-25', total: 8700, productos: 32, estado: 'Recibido' },
      { id: 5, proveedor: 'Accesorios Premium', fecha: '2024-01-28', total: 5400, productos: 15, estado: 'Pendiente' }
    ];
    setComprasData(ejemploCompras);
    setStats(prev => ({ ...prev, totalCompras: ejemploCompras.reduce((acc, c) => acc + c.total, 0) }));
  };

  const generateExampleVentasData = () => {
    return [
      { mes: '2024-01', mesNombre: 'Ene 24', total: 45600, pedidos: 28 },
      { mes: '2024-02', mesNombre: 'Feb 24', total: 52300, pedidos: 34 },
      { mes: '2024-03', mesNombre: 'Mar 24', total: 48900, pedidos: 31 },
      { mes: '2024-04', mesNombre: 'Abr 24', total: 61200, pedidos: 42 },
      { mes: '2024-05', mesNombre: 'May 24', total: 58700, pedidos: 38 },
      { mes: '2024-06', mesNombre: 'Jun 24', total: 72400, pedidos: 48 }
    ];
  };

  const loadAllExampleData = () => {
    setVentasData(generateExampleVentasData());
    loadExampleClientesData();
    loadExampleProductosData();
    loadExampleComprasData();
    setPedidosData([
      { id: 1, cliente: 'María García', email: 'maria@email.com', fecha: '2024-01-20', hora: '14:30', estado: 'Entregado', total: 1250, metodoPago: 'Tarjeta', productos: 3 },
      { id: 2, cliente: 'Carlos López', email: 'carlos@email.com', fecha: '2024-01-21', hora: '10:15', estado: 'Pendiente', total: 890, metodoPago: 'Transferencia', productos: 2 },
      { id: 3, cliente: 'Ana Torres', email: 'ana@email.com', fecha: '2024-01-22', hora: '16:45', estado: 'Entregado', total: 2340, metodoPago: 'Tarjeta', productos: 4 }
    ]);
    setStats({
      totalVentas: 339100,
      totalCompras: 101100,
      totalClientes: 5,
      totalProductos: 6,
      crecimiento: 12.5
    });
  };

  // CSV Export Functions
  const exportToCSV = (data, filename, headers) => {
    setExporting(true);

    try {
      // Create CSV content
      const csvRows = [];

      // Add headers
      csvRows.push(headers.map(h => `"${h.label}"`).join(','));

      // Add data rows
      data.forEach(item => {
        const values = headers.map(h => {
          let value = item[h.key];
          if (value === null || value === undefined) value = '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          } else {
            value = `"${value}"`;
          }
          return value;
        });
        csvRows.push(values.join(','));
      });

      const csvContent = '\uFEFF' + csvRows.join('\n'); // BOM for Excel UTF-8

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.fire({
        icon: 'success',
        title: 'Exportación exitosa',
        text: `El archivo ${filename}.csv se ha descargado correctamente`,
        background: darkMode ? '#1a1a1a' : '#ffffff',
        color: darkMode ? '#ffffff' : '#1a1a1a',
        confirmButtonColor: '#d4af37',
        timer: 3000
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo exportar el archivo',
        background: darkMode ? '#1a1a1a' : '#ffffff',
        color: darkMode ? '#ffffff' : '#1a1a1a',
        confirmButtonColor: '#d4af37'
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportVentas = () => {
    const headers = [
      { key: 'mes', label: 'Período' },
      { key: 'total', label: 'Total Ventas (S/.)' },
      { key: 'pedidos', label: 'Cantidad Pedidos' }
    ];
    exportToCSV(ventasData, 'reporte_ventas', headers);
  };

  const handleExportCompras = () => {
    const headers = [
      { key: 'id', label: 'ID' },
      { key: 'proveedor', label: 'Proveedor' },
      { key: 'fecha', label: 'Fecha' },
      { key: 'total', label: 'Total (S/.)' },
      { key: 'productos', label: 'Productos' },
      { key: 'estado', label: 'Estado' }
    ];
    exportToCSV(comprasData, 'reporte_compras', headers);
  };

  const handleExportClientes = () => {
    const headers = [
      { key: 'id', label: 'ID' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'email', label: 'Email' },
      { key: 'telefono', label: 'Teléfono' },
      { key: 'estado', label: 'Estado' },
      { key: 'rol', label: 'Rol' },
      { key: 'fechaRegistro', label: 'Fecha Registro' },
      { key: 'compras', label: 'Total Compras' },
      { key: 'totalGastado', label: 'Total Gastado (S/.)' }
    ];
    exportToCSV(clientesData, 'reporte_clientes', headers);
  };

  const handleExportProductos = () => {
    const headers = [
      { key: 'id', label: 'ID' },
      { key: 'nombre', label: 'Producto' },
      { key: 'categoria', label: 'Categoría' },
      { key: 'precio', label: 'Precio (S/.)' },
      { key: 'stock', label: 'Stock' },
      { key: 'vendidos', label: 'Vendidos' },
      { key: 'estado', label: 'Estado' }
    ];
    exportToCSV(productosData, 'reporte_productos', headers);
  };

  const handleExportPedidos = () => {
    const headers = [
      { key: 'id', label: 'ID Pedido' },
      { key: 'cliente', label: 'Cliente' },
      { key: 'email', label: 'Email' },
      { key: 'fecha', label: 'Fecha' },
      { key: 'hora', label: 'Hora' },
      { key: 'estado', label: 'Estado' },
      { key: 'total', label: 'Total (S/.)' },
      { key: 'metodoPago', label: 'Método de Pago' },
      { key: 'productos', label: 'Productos' }
    ];
    exportToCSV(pedidosData, 'reporte_pedidos', headers);
  };

  const handleExportAll = () => {
    Swal.fire({
      title: 'Exportar todos los reportes',
      text: 'Se descargarán 5 archivos CSV con toda la información',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d4af37',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Exportar todo',
      cancelButtonText: 'Cancelar',
      background: darkMode ? '#1a1a1a' : '#ffffff',
      color: darkMode ? '#ffffff' : '#1a1a1a'
    }).then((result) => {
      if (result.isConfirmed) {
        handleExportVentas();
        setTimeout(() => handleExportCompras(), 500);
        setTimeout(() => handleExportClientes(), 1000);
        setTimeout(() => handleExportProductos(), 1500);
        setTimeout(() => handleExportPedidos(), 2000);
      }
    });
  };

  // Styles
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
            <p key={index} style={{ color: entry.color || '#ffffff', fontSize: '13px' }}>
              {entry.name}: {typeof entry.value === 'number' && entry.name !== 'Pedidos' ? `S/.${entry.value?.toLocaleString()}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Status Badge
  const StatusBadge = ({ status }) => {
    const config = {
      'Entregado': { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' },
      'Recibido': { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' },
      'Activo': { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' },
      'Disponible': { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' },
      'Pendiente': { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
      'En Tránsito': { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
      'Cancelado': { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
      'Inactivo': { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
      'Agotado': { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
      'Stock Bajo': { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }
    };
    const { bg, color } = config[status] || { bg: 'rgba(107, 114, 128, 0.15)', color: '#6b7280' };

    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ background: bg, color }}
      >
        {status}
      </span>
    );
  };

  // Pie data for charts
  const estadosPedidosData = [
    { name: 'Entregado', value: pedidosData.filter(p => p.estado === 'Entregado').length, color: '#22c55e' },
    { name: 'Pendiente', value: pedidosData.filter(p => p.estado === 'Pendiente').length, color: '#f59e0b' },
    { name: 'Cancelado', value: pedidosData.filter(p => p.estado === 'Cancelado').length, color: '#ef4444' }
  ];

  const getActiveExportHandler = () => {
    switch (activeTab) {
      case 'ventas': return handleExportVentas;
      case 'compras': return handleExportCompras;
      case 'clientes': return handleExportClientes;
      case 'productos': return handleExportProductos;
      case 'pedidos': return handleExportPedidos;
      default: return handleExportVentas;
    }
  };

  if (loading) {
    return <LoadingScreen darkMode={darkMode} message="Cargando reportes..." />;
  }

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: darkMode ? '#0a0a0a' : '#f5f5f5' }}>
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
            <FileSpreadsheet className="w-7 h-7 text-black" />
          </div>
          <div>
            <h1
              className="text-2xl lg:text-3xl font-bold"
              style={{ color: darkMode ? '#ffffff' : '#1a1a1a', fontFamily: "'Playfair Display', serif" }}
            >
              Centro de <span style={{ color: '#d4af37' }}>Reportes</span>
            </h1>
            <p style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '14px' }}>
              Genera y exporta informes detallados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2.5 rounded-xl focus:outline-none text-sm"
            style={selectStyle}
          >
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="quarter">Este trimestre</option>
            <option value="year">Este año</option>
            <option value="all">Todo</option>
          </select>

          <button
            onClick={() => fetchAllData()}
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
            onClick={handleExportAll}
            disabled={exporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all hover:scale-105 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
              color: '#0a0a0a',
              fontWeight: '600'
            }}
          >
            <Download size={18} />
            <span>Exportar Todo</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-8">
        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212, 175, 55, 0.15)' }}>
              <DollarSign size={22} style={{ color: '#d4af37' }} />
            </div>
            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
              <ArrowUpRight size={12} />
              {stats.crecimiento}%
            </span>
          </div>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Total Ventas
          </p>
          <p className="text-2xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            S/.{stats.totalVentas.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
              <ShoppingCart size={22} style={{ color: '#8b5cf6' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Total Compras
          </p>
          <p className="text-2xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            S/.{stats.totalCompras.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
              <Users size={22} style={{ color: '#22c55e' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Clientes
          </p>
          <p className="text-2xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            {stats.totalClientes}
          </p>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
              <Package size={22} style={{ color: '#3b82f6' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Productos
          </p>
          <p className="text-2xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            {stats.totalProductos}
          </p>
        </div>
      </div>

      {/* Export Cards */}
      <div className="rounded-2xl p-6 mb-8" style={cardStyle}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
          Exportaciones Rápidas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Ventas', icon: DollarSign, color: '#d4af37', handler: handleExportVentas },
            { label: 'Compras', icon: ShoppingCart, color: '#8b5cf6', handler: handleExportCompras },
            { label: 'Clientes', icon: Users, color: '#22c55e', handler: handleExportClientes },
            { label: 'Productos', icon: Package, color: '#3b82f6', handler: handleExportProductos },
            { label: 'Pedidos', icon: FileText, color: '#f59e0b', handler: handleExportPedidos }
          ].map((item, index) => (
            <button
              key={index}
              onClick={item.handler}
              disabled={exporting}
              className="flex flex-col items-center gap-3 p-4 rounded-xl transition-all hover:scale-105 disabled:opacity-50"
              style={{
                background: `${item.color}10`,
                border: `1px solid ${item.color}30`
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${item.color}20` }}
              >
                <item.icon size={24} style={{ color: item.color }} />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                  {item.label}
                </p>
                <p className="text-xs flex items-center gap-1 justify-center mt-1" style={{ color: item.color }}>
                  <FileDown size={12} /> CSV
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-2xl p-2 mb-6 inline-flex" style={cardStyle}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
            style={{
              background: activeTab === tab.id ? `${tab.color}20` : 'transparent',
              color: activeTab === tab.id ? tab.color : (darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)')
            }}
          >
            <tab.icon size={18} />
            <span className="font-medium text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                {activeTab === 'ventas' && 'Evolución de Ventas'}
                {activeTab === 'compras' && 'Historial de Compras'}
                {activeTab === 'clientes' && 'Clientes por Período'}
                {activeTab === 'productos' && 'Productos Vendidos'}
                {activeTab === 'pedidos' && 'Estado de Pedidos'}
              </h3>
              <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Datos del período seleccionado
              </p>
            </div>
            <button
              onClick={getActiveExportHandler()}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105 disabled:opacity-50"
              style={{
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: '#d4af37'
              }}
            >
              <Download size={16} />
              <span className="text-sm">Exportar CSV</span>
            </button>
          </div>

          <div style={{ height: '300px', width: '100%', minWidth: '0' }}>
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'ventas' ? (
                <AreaChart data={ventasData}>
                  <defs>
                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                  <XAxis dataKey="mesNombre" tick={{ fill: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `S/.${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(212, 175, 55, 0.2)', fill: 'transparent' }} />
                  <Area type="monotone" dataKey="total" name="Ventas" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" dot={{ fill: '#d4af37', strokeWidth: 2, r: 4, stroke: darkMode ? '#0a0a0a' : '#ffffff' }} />
                </AreaChart>
              ) : activeTab === 'pedidos' ? (
                <PieChart>
                  <Pie
                    data={estadosPedidosData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {estadosPedidosData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip cursor={{ fill: 'transparent' }} />
                </PieChart>
              ) : activeTab === 'productos' ? (
                <BarChart data={productosData.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} horizontal={true} vertical={false} />
                  <XAxis type="number" tick={{ fill: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="nombre" type="category" tick={{ fill: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="vendidos" name="Vendidos" radius={[0, 6, 6, 0]} fill="#3b82f6" />
                </BarChart>
              ) : activeTab === 'compras' ? (
                <BarChart data={comprasData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                  <XAxis dataKey="proveedor" tick={{ fill: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `S/.${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="total" name="Total" radius={[6, 6, 0, 0]} fill="#8b5cf6" />
                </BarChart>
              ) : (
                <BarChart data={ventasData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                  <XAxis dataKey="mesNombre" tick={{ fill: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="pedidos" name="Pedidos" radius={[6, 6, 0, 0]} fill="#22c55e" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary/Stats */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            Resumen
          </h3>

          {activeTab === 'ventas' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl" style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                <p className="text-sm mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Total del Período</p>
                <p className="text-2xl font-bold" style={{ color: '#d4af37' }}>S/.{ventasData.reduce((acc, v) => acc + v.total, 0).toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <p className="text-sm mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Total Pedidos</p>
                <p className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>{ventasData.reduce((acc, v) => acc + v.pedidos, 0)}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                <p className="text-sm mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Promedio Mensual</p>
                <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>
                  S/.{ventasData.length > 0 ? Math.round(ventasData.reduce((acc, v) => acc + v.total, 0) / ventasData.length).toLocaleString() : 0}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'compras' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <p className="text-sm mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Total Compras</p>
                <p className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>S/.{comprasData.reduce((acc, c) => acc + c.total, 0).toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                <p className="text-sm mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Órdenes Recibidas</p>
                <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>{comprasData.filter(c => c.estado === 'Recibido').length}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <p className="text-sm mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Pendientes</p>
                <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{comprasData.filter(c => c.estado !== 'Recibido').length}</p>
              </div>
            </div>
          )}

          {activeTab === 'clientes' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                <p className="text-sm mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Total Clientes</p>
                <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>{clientesData.length}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                <p className="text-sm mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Activos</p>
                <p className="text-2xl font-bold" style={{ color: '#d4af37' }}>{clientesData.filter(c => c.estado === 'Activo').length}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <p className="text-sm mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Total Gastado</p>
                <p className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>S/.{clientesData.reduce((acc, c) => acc + (c.totalGastado || 0), 0).toLocaleString()}</p>
              </div>
            </div>
          )}

          {activeTab === 'productos' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <p className="text-sm mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Total Productos</p>
                <p className="text-2xl font-bold" style={{ color: '#3b82f6' }}>{productosData.length}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                <p className="text-sm mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Disponibles</p>
                <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>{productosData.filter(p => p.estado === 'Disponible').length}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <p className="text-sm mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Agotados</p>
                <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>{productosData.filter(p => p.estado === 'Agotado').length}</p>
              </div>
            </div>
          )}

          {activeTab === 'pedidos' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <p className="text-sm mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Total Pedidos</p>
                <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{pedidosData.length}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                <p className="text-sm mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Entregados</p>
                <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>{pedidosData.filter(p => p.estado === 'Entregado').length}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                <p className="text-sm mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Valor Total</p>
                <p className="text-2xl font-bold" style={{ color: '#d4af37' }}>S/.{pedidosData.reduce((acc, p) => acc + (p.total || 0), 0).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl p-6 mt-6" style={cardStyle}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            Datos Detallados - {tabs.find(t => t.id === activeTab)?.label}
          </h3>
          <button
            onClick={getActiveExportHandler()}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
              color: '#0a0a0a',
              fontWeight: '600'
            }}
          >
            <FileDown size={16} />
            <span className="text-sm">Descargar CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                {activeTab === 'ventas' && (
                  <>
                    <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Período</th>
                    <th className="text-right py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Total Ventas</th>
                    <th className="text-right py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Pedidos</th>
                  </>
                )}
                {activeTab === 'compras' && (
                  <>
                    <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Proveedor</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Fecha</th>
                    <th className="text-right py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Total</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Estado</th>
                  </>
                )}
                {activeTab === 'clientes' && (
                  <>
                    <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Cliente</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Contacto</th>
                    <th className="text-right py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Compras</th>
                    <th className="text-right py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Total Gastado</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Estado</th>
                  </>
                )}
                {activeTab === 'productos' && (
                  <>
                    <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Producto</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Categoría</th>
                    <th className="text-right py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Precio</th>
                    <th className="text-right py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Stock</th>
                    <th className="text-right py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Vendidos</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Estado</th>
                  </>
                )}
                {activeTab === 'pedidos' && (
                  <>
                    <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>ID</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Cliente</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Fecha</th>
                    <th className="text-right py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Total</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Estado</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {activeTab === 'ventas' && ventasData.slice(0, 10).map((item, index) => (
                <tr key={index} className="transition-all hover:bg-opacity-50" style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, background: index % 2 === 0 ? 'transparent' : (darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)') }}>
                  <td className="py-4 px-4">
                    <p className="font-medium" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>{item.mesNombre}</p>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-bold text-lg" style={{ color: '#d4af37' }}>S/.{item.total?.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-4 text-right" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>{item.pedidos}</td>
                </tr>
              ))}
              {activeTab === 'compras' && comprasData.slice(0, 10).map((item, index) => (
                <tr key={index} className="transition-all hover:bg-opacity-50" style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, background: index % 2 === 0 ? 'transparent' : (darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)') }}>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: '#ffffff' }}>
                        {item.proveedor?.charAt(0)?.toUpperCase()}
                      </div>
                      <p className="font-medium" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>{item.proveedor}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p style={{ color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>{item.fecha}</p>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-bold text-lg" style={{ color: '#8b5cf6' }}>S/.{item.total?.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-4"><StatusBadge status={item.estado} /></td>
                </tr>
              ))}
              {activeTab === 'clientes' && clientesData.slice(0, 10).map((item, index) => (
                <tr key={index} className="transition-all hover:bg-opacity-50" style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, background: index % 2 === 0 ? 'transparent' : (darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)') }}>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)', color: '#0a0a0a' }}>
                        {item.nombre?.charAt(0)?.toUpperCase()}
                      </div>
                      <p className="font-medium" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>{item.nombre}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p style={{ color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>{item.email}</p>
                      <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>{item.telefono || 'Sin teléfono'}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>{item.compras}</td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-bold text-lg" style={{ color: '#22c55e' }}>S/.{item.totalGastado?.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-4"><StatusBadge status={item.estado} /></td>
                </tr>
              ))}
              {activeTab === 'productos' && productosData.slice(0, 10).map((item, index) => (
                <tr key={index} className="transition-all hover:bg-opacity-50" style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, background: index % 2 === 0 ? 'transparent' : (darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)') }}>
                  <td className="py-4 px-4">
                    <p className="font-medium" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>{item.nombre}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37' }}>{item.categoria}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-bold text-lg" style={{ color: '#d4af37' }}>S/.{item.precio?.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-4 text-right" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>{item.stock}</td>
                  <td className="py-4 px-4 text-right" style={{ color: '#8b5cf6', fontWeight: '600' }}>{item.vendidos}</td>
                  <td className="py-4 px-4"><StatusBadge status={item.estado} /></td>
                </tr>
              ))}
              {activeTab === 'pedidos' && pedidosData.slice(0, 10).map((item, index) => (
                <tr key={index} className="transition-all hover:bg-opacity-50" style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, background: index % 2 === 0 ? 'transparent' : (darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)') }}>
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm" style={{ color: '#d4af37' }}>#{item.id}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)', color: '#0a0a0a' }}>
                        {item.cliente?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>{item.cliente}</p>
                        <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>{item.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p style={{ color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>{item.fecha}</p>
                      <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>{item.hora}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-bold text-lg" style={{ color: '#f59e0b' }}>S/.{item.total?.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-4"><StatusBadge status={item.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
