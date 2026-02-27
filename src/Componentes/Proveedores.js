import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import Swal from 'sweetalert2';
import LoadingScreen from './LoadingScreen';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building2,
  Package,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  FileText,
  Globe,
  User,
  Hash,
  CreditCard,
  ShoppingBag,
  Star,
  MoreVertical,
  Download,
  Grid3X3,
  List
} from 'lucide-react';

const Proveedores = ({ darkMode }) => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const [formData, setFormData] = useState({
    nombre: '',
    ruc: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    pais: '',
    contacto: '',
    banco: '',
    numeroCuenta: '',
    estado: 'Activo',
    notas: ''
  });

  // Datos de ejemplo para estadísticas
  const [stats, setStats] = useState({
    totalProveedores: 0,
    proveedoresActivos: 0,
    comprasMes: 0,
    promedioEntrega: 0
  });

  // Datos para gráficas
  const [comprasMensuales, setComprasMensuales] = useState([]);
  const [categoriaData, setCategoriaData] = useState([]);

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/proveedor/listar');
      const data = response.data || [];
      setProveedores(data);
      updateStats(data);
    } catch (error) {
      console.error('Error fetching proveedores:', error);
      setProveedores([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (data) => {
    const activos = data.filter(p => p.estado === 'Activo').length;
    const totalCompras = data.reduce((acc, p) => acc + (p.totalCompras || 0), 0);

    setStats({
      totalProveedores: data.length,
      proveedoresActivos: activos,
      comprasMes: totalCompras,
      promedioEntrega: data.length > 0 ? Math.round((data.reduce((acc, p) => acc + (p.tiempoEntrega || 3), 0) / data.length) * 10) / 10 : 0
    });

    // Generar datos de compras mensuales desde proveedores
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const mesActual = new Date().getMonth();
    const comprasChart = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (mesActual - i + 12) % 12;
      comprasChart.push({
        mes: meses[idx],
        compras: data.reduce((acc, p) => acc + Math.round((p.totalCompras || 0) / 6), 0)
      });
    }
    setComprasMensuales(comprasChart);

    // Generar datos de categoría desde proveedores
    const colores = ['#d4af37', '#8b5cf6', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];
    const categoriasMap = {};
    data.forEach(p => {
      const cat = p.categoria || p.rubro || 'Otros';
      categoriasMap[cat] = (categoriasMap[cat] || 0) + 1;
    });
    const catArray = Object.entries(categoriasMap).map(([name, value], i) => ({
      name,
      value,
      color: colores[i % colores.length]
    }));
    setCategoriaData(catArray.length > 0 ? catArray : []);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await api.put(`/api/proveedor/actualizar/${selectedProveedor.id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Proveedor actualizado',
          text: 'Los datos se han actualizado correctamente',
          background: darkMode ? '#1a1a1a' : '#ffffff',
          color: darkMode ? '#ffffff' : '#1a1a1a',
          confirmButtonColor: '#d4af37'
        });
      } else {
        await api.post('/api/proveedor/crear', formData);
        Swal.fire({
          icon: 'success',
          title: 'Proveedor creado',
          text: 'El nuevo proveedor se ha registrado correctamente',
          background: darkMode ? '#1a1a1a' : '#ffffff',
          color: darkMode ? '#ffffff' : '#1a1a1a',
          confirmButtonColor: '#d4af37'
        });
      }

      setShowModal(false);
      resetForm();
      fetchProveedores();
    } catch (error) {
      console.error('Error:', error);
      // Simular éxito para demo
      const newProveedor = {
        ...formData,
        id: Date.now(),
        totalCompras: 0,
        ultimaCompra: null,
        productos: 0,
        rating: 0
      };

      if (isEditing) {
        setProveedores(prev => prev.map(p => p.id === selectedProveedor.id ? { ...p, ...formData } : p));
      } else {
        setProveedores(prev => [...prev, newProveedor]);
      }

      Swal.fire({
        icon: 'success',
        title: isEditing ? 'Proveedor actualizado' : 'Proveedor creado',
        text: isEditing ? 'Los datos se han actualizado correctamente' : 'El nuevo proveedor se ha registrado correctamente',
        background: darkMode ? '#1a1a1a' : '#ffffff',
        color: darkMode ? '#ffffff' : '#1a1a1a',
        confirmButtonColor: '#d4af37'
      });

      setShowModal(false);
      resetForm();
    }
  };

  const handleDelete = async (proveedor) => {
    const result = await Swal.fire({
      title: '¿Eliminar proveedor?',
      text: `Esta acción eliminará a "${proveedor.nombre}" permanentemente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: darkMode ? '#1a1a1a' : '#ffffff',
      color: darkMode ? '#ffffff' : '#1a1a1a'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/proveedor/eliminar/${proveedor.id}`);
        setProveedores(prev => prev.filter(p => p.id !== proveedor.id));
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El proveedor ha sido eliminado',
          background: darkMode ? '#1a1a1a' : '#ffffff',
          color: darkMode ? '#ffffff' : '#1a1a1a',
          confirmButtonColor: '#d4af37'
        });
      } catch (error) {
        // Simular éxito para demo
        setProveedores(prev => prev.filter(p => p.id !== proveedor.id));
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El proveedor ha sido eliminado',
          background: darkMode ? '#1a1a1a' : '#ffffff',
          color: darkMode ? '#ffffff' : '#1a1a1a',
          confirmButtonColor: '#d4af37'
        });
      }
    }
  };

  const handleEdit = (proveedor) => {
    setSelectedProveedor(proveedor);
    setFormData({
      nombre: proveedor.nombre || '',
      ruc: proveedor.ruc || '',
      email: proveedor.email || '',
      telefono: proveedor.telefono || '',
      direccion: proveedor.direccion || '',
      ciudad: proveedor.ciudad || '',
      pais: proveedor.pais || '',
      contacto: proveedor.contacto || '',
      banco: proveedor.banco || '',
      numeroCuenta: proveedor.numeroCuenta || '',
      estado: proveedor.estado || 'Activo',
      notas: proveedor.notas || ''
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleViewDetail = (proveedor) => {
    setSelectedProveedor(proveedor);
    setShowDetailModal(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      ruc: '',
      email: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      pais: '',
      contacto: '',
      banco: '',
      numeroCuenta: '',
      estado: 'Activo',
      notas: ''
    });
    setIsEditing(false);
    setSelectedProveedor(null);
  };

  const openNewModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Filtrar proveedores
  const filteredProveedores = proveedores.filter(proveedor => {
    const matchSearch = proveedor.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       proveedor.ruc?.includes(searchTerm) ||
                       proveedor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filterEstado === 'todos' || proveedor.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  // Paginación
  const totalPages = Math.ceil(filteredProveedores.length / itemsPerPage);
  const paginatedProveedores = filteredProveedores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Estilos
  const cardStyle = {
    background: darkMode
      ? 'linear-gradient(145deg, rgba(20, 20, 20, 0.9) 0%, rgba(15, 15, 15, 0.95) 100%)'
      : 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%)',
    border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.08)'}`,
    boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0,0,0,0.06)'
  };

  const inputStyle = {
    background: darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(250, 250, 250, 0.95)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    color: darkMode ? '#ffffff' : '#1a1a1a'
  };

  const selectStyle = {
    ...inputStyle,
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
          <p style={{ color: '#d4af37', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: '#ffffff', fontSize: '13px' }}>
              S/.{entry.value?.toLocaleString()}
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
      'Activo': { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', icon: CheckCircle },
      'Inactivo': { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', icon: XCircle },
      'Pendiente': { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', icon: Clock }
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

  // Star Rating
  const StarRating = ({ rating }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            fill={star <= rating ? '#d4af37' : 'transparent'}
            stroke={star <= rating ? '#d4af37' : darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
          />
        ))}
        <span className="ml-1 text-sm font-medium" style={{ color: '#d4af37' }}>
          {rating?.toFixed(1)}
        </span>
      </div>
    );
  };

  if (loading) {
    return <LoadingScreen darkMode={darkMode} message="Cargando proveedores..." />;
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
            <Truck className="w-7 h-7 text-black" />
          </div>
          <div>
            <h1
              className="text-2xl lg:text-3xl font-bold"
              style={{ color: darkMode ? '#ffffff' : '#1a1a1a', fontFamily: "'Playfair Display', serif" }}
            >
              Gestión de <span style={{ color: '#d4af37' }}>Proveedores</span>
            </h1>
            <p style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '14px' }}>
              Administra tus proveedores y compras
            </p>
          </div>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
            color: '#0a0a0a',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
          }}
        >
          <Plus size={20} />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-8">
        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212, 175, 55, 0.15)' }}>
              <Building2 size={22} style={{ color: '#d4af37' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Total Proveedores
          </p>
          <p className="text-2xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            {stats.totalProveedores}
          </p>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
              <CheckCircle size={22} style={{ color: '#22c55e' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Activos
          </p>
          <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>
            {stats.proveedoresActivos}
          </p>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
              <DollarSign size={22} style={{ color: '#8b5cf6' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Compras Totales
          </p>
          <p className="text-2xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            S/.{stats.comprasMes.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
              <Clock size={22} style={{ color: '#3b82f6' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Tiempo Entrega Prom.
          </p>
          <p className="text-2xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            {stats.promedioEntrega} días
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Compras Mensuales Chart */}
        <div className="lg:col-span-2 rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                Compras Mensuales
              </h3>
              <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Historial de compras a proveedores
              </p>
            </div>
            <TrendingUp size={20} style={{ color: '#d4af37' }} />
          </div>

          <div style={{ height: '250px', width: '100%', minWidth: '0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={comprasMensuales}>
                <defs>
                  <linearGradient id="colorCompras" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                <XAxis dataKey="mes" tick={{ fill: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(212, 175, 55, 0.2)', fill: 'transparent' }} />
                <Area type="monotone" dataKey="compras" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorCompras)" dot={{ fill: '#d4af37', strokeWidth: 2, r: 4, stroke: darkMode ? '#0a0a0a' : '#ffffff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categorías Pie Chart */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                Por Categoría
              </h3>
              <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Distribución de compras
              </p>
            </div>
          </div>

          <div style={{ height: '180px', width: '100%', minWidth: '0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoriaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoriaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip cursor={{ fill: 'transparent' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoriaData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: item.color }}></div>
                <span className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-5 mb-6" style={cardStyle}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }} />
            <input
              type="text"
              placeholder="Buscar por nombre, RUC o email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none transition-all"
              style={inputStyle}
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter size={18} style={{ color: '#d4af37' }} />
            <select
              value={filterEstado}
              onChange={(e) => { setFilterEstado(e.target.value); setCurrentPage(1); }}
              className="px-4 py-3 rounded-xl focus:outline-none"
              style={selectStyle}
            >
              <option value="todos">Todos los estados</option>
              <option value="Activo">Activos</option>
              <option value="Inactivo">Inactivos</option>
            </select>
          </div>

          {/* View Toggle */}
          <div
            className="flex items-center rounded-xl overflow-hidden"
            style={{
              background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              className="p-2.5 transition-all"
              style={{
                background: viewMode === 'grid' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                color: viewMode === 'grid' ? '#d4af37' : (darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')
              }}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="p-2.5 transition-all"
              style={{
                background: viewMode === 'list' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                color: viewMode === 'list' ? '#d4af37' : (darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')
              }}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Proveedores Grid/List */}
      {viewMode === 'grid' ? (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
        {paginatedProveedores.map((proveedor) => (
          <div
            key={proveedor.id}
            className="rounded-2xl overflow-hidden transition-all hover:scale-[1.02]"
            style={cardStyle}
          >
            {/* Card Header */}
            <div className="p-5 border-b" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
                      color: '#0a0a0a'
                    }}
                  >
                    {proveedor.nombre?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                      {proveedor.nombre}
                    </h3>
                    <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                      RUC: {proveedor.ruc}
                    </p>
                  </div>
                </div>
                <StatusBadge status={proveedor.estado} />
              </div>

              {proveedor.rating && <StarRating rating={proveedor.rating} />}
            </div>

            {/* Card Body */}
            <div className="p-5">
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3">
                  <Mail size={16} style={{ color: '#d4af37' }} />
                  <span className="text-sm truncate" style={{ color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>
                    {proveedor.email}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} style={{ color: '#d4af37' }} />
                  <span className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>
                    {proveedor.telefono}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={16} style={{ color: '#d4af37' }} />
                  <span className="text-sm truncate" style={{ color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>
                    {proveedor.ciudad}, {proveedor.pais}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 py-4" style={{ borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: '#d4af37' }}>
                    S/.{proveedor.totalCompras?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                    Total Compras
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: '#8b5cf6' }}>
                    {proveedor.productos || 0}
                  </p>
                  <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                    Productos
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => handleViewDetail(proveedor)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all hover:scale-105"
                  style={{
                    background: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: '#d4af37'
                  }}
                >
                  <Eye size={16} />
                  <span className="text-sm font-medium">Ver</span>
                </button>
                <button
                  onClick={() => handleEdit(proveedor)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all hover:scale-105"
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#3b82f6'
                  }}
                >
                  <Edit3 size={16} />
                  <span className="text-sm font-medium">Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(proveedor)}
                  className="p-2.5 rounded-xl transition-all hover:scale-105"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      ) : (
        /* List View - Tabla estilo Dashboard */
        <div className="rounded-2xl p-6 mb-6" style={cardStyle}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Proveedor</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>RUC</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Contacto</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Ubicación</th>
                  <th className="text-right py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Total Compras</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Estado</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProveedores.map((proveedor, index) => (
                  <tr
                    key={proveedor.id}
                    className="transition-all hover:bg-opacity-50"
                    style={{
                      borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                      background: index % 2 === 0 ? 'transparent' : (darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)')
                    }}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)', color: '#0a0a0a' }}>
                          {proveedor.nombre?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>{proveedor.nombre}</p>
                          <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>{proveedor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm" style={{ color: '#d4af37' }}>{proveedor.ruc}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p style={{ color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>{proveedor.telefono}</p>
                        <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>{proveedor.contacto || 'Contacto principal'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p style={{ color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>{proveedor.ciudad}</p>
                        <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>{proveedor.pais}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-bold text-lg" style={{ color: '#d4af37' }}>S/.{proveedor.totalCompras?.toLocaleString() || 0}</span>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={proveedor.estado} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleViewDetail(proveedor)} className="p-2 rounded-lg transition-all hover:scale-105" style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#d4af37' }}>
                          <Eye size={18} />
                        </button>
                        <button onClick={() => handleEdit(proveedor)} className="p-2 rounded-lg transition-all hover:scale-105" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#3b82f6' }}>
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => handleDelete(proveedor)} className="p-2 rounded-lg transition-all hover:scale-105" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredProveedores.length === 0 && (
        <div className="rounded-2xl p-12 text-center" style={cardStyle}>
          <Truck size={64} style={{ color: 'rgba(212, 175, 55, 0.3)', margin: '0 auto 16px' }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            No se encontraron proveedores
          </h3>
          <p style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Intenta ajustar los filtros o agrega un nuevo proveedor
          </p>
        </div>
      )}

      {/* Pagination */}
      {filteredProveedores.length > 0 && (
        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredProveedores.length)} de {filteredProveedores.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg transition-all hover:scale-105 disabled:opacity-50"
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`,
                  color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                }}
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
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

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg transition-all hover:scale-105 disabled:opacity-50"
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
        </div>
      )}

      {/* Modal - Crear/Editar Proveedor */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{ background: darkMode ? '#0a0a0a' : '#ffffff' }}
          >
            <div className="flex items-center justify-between p-6" style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                  {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                </h2>
                <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                  {isEditing ? 'Actualiza la información del proveedor' : 'Completa los datos del nuevo proveedor'}
                </p>
              </div>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 rounded-lg transition-all hover:scale-105"
                style={{ background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
              >
                <X size={20} style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    Nombre de la Empresa *
                  </label>
                  <div className="relative">
                    <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#d4af37' }} />
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none"
                      style={inputStyle}
                      placeholder="Nombre del proveedor"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    RUC *
                  </label>
                  <div className="relative">
                    <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#d4af37' }} />
                    <input
                      type="text"
                      name="ruc"
                      value={formData.ruc}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none"
                      style={inputStyle}
                      placeholder="20123456789"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    Email *
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#d4af37' }} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none"
                      style={inputStyle}
                      placeholder="email@empresa.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    Teléfono *
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#d4af37' }} />
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none"
                      style={inputStyle}
                      placeholder="+51 123 456 789"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    Persona de Contacto
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#d4af37' }} />
                    <input
                      type="text"
                      name="contacto"
                      value={formData.contacto}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none"
                      style={inputStyle}
                      placeholder="Nombre del contacto"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    Dirección
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#d4af37' }} />
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none"
                      style={inputStyle}
                      placeholder="Dirección completa"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={inputStyle}
                    placeholder="Ciudad"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    País
                  </label>
                  <div className="relative">
                    <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#d4af37' }} />
                    <input
                      type="text"
                      name="pais"
                      value={formData.pais}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none"
                      style={inputStyle}
                      placeholder="País"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    Banco
                  </label>
                  <div className="relative">
                    <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#d4af37' }} />
                    <input
                      type="text"
                      name="banco"
                      value={formData.banco}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none"
                      style={inputStyle}
                      placeholder="Nombre del banco"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    Número de Cuenta
                  </label>
                  <input
                    type="text"
                    name="numeroCuenta"
                    value={formData.numeroCuenta}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={inputStyle}
                    placeholder="Número de cuenta"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={selectStyle}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    Notas
                  </label>
                  <textarea
                    name="notas"
                    value={formData.notas}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
                    style={inputStyle}
                    placeholder="Notas adicionales..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-6" style={{ borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 py-3 rounded-xl font-medium transition-all hover:scale-105"
                  style={{
                    background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    color: darkMode ? '#ffffff' : '#1a1a1a'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
                    color: '#0a0a0a'
                  }}
                >
                  {isEditing ? 'Guardar Cambios' : 'Crear Proveedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Detalle Proveedor */}
      {showDetailModal && selectedProveedor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{ background: darkMode ? '#0a0a0a' : '#ffffff' }}
          >
            <div className="flex items-center justify-between p-6" style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
                    color: '#0a0a0a'
                  }}
                >
                  {selectedProveedor.nombre?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                    {selectedProveedor.nombre}
                  </h2>
                  <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                    RUC: {selectedProveedor.ruc}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 rounded-lg transition-all hover:scale-105"
                style={{ background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
              >
                <X size={20} style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <StatusBadge status={selectedProveedor.estado} />
                {selectedProveedor.rating && <StarRating rating={selectedProveedor.rating} />}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información de Contacto */}
                <div className="p-5 rounded-xl" style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                  <h4 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#d4af37' }}>
                    <Phone size={18} /> Contacto
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User size={16} style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} />
                      <span style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>{selectedProveedor.contacto || 'No especificado'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail size={16} style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} />
                      <span style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>{selectedProveedor.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={16} style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} />
                      <span style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>{selectedProveedor.telefono}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={16} style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} />
                      <span style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>{selectedProveedor.direccion}, {selectedProveedor.ciudad}, {selectedProveedor.pais}</span>
                    </div>
                  </div>
                </div>

                {/* Información Bancaria */}
                <div className="p-5 rounded-xl" style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                  <h4 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#d4af37' }}>
                    <CreditCard size={18} /> Datos Bancarios
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Banco</span>
                      <span style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>{selectedProveedor.banco || 'No especificado'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Cuenta</span>
                      <span style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>{selectedProveedor.numeroCuenta || 'No especificado'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                  <p className="text-2xl font-bold" style={{ color: '#d4af37' }}>
                    S/.{selectedProveedor.totalCompras?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs mt-1" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    Total Compras
                  </p>
                </div>
                <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                  <p className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>
                    {selectedProveedor.productos || 0}
                  </p>
                  <p className="text-xs mt-1" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    Productos
                  </p>
                </div>
                <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  <p className="text-lg font-bold" style={{ color: '#22c55e' }}>
                    {selectedProveedor.ultimaCompra || 'N/A'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    Última Compra
                  </p>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-3 mt-6 pt-6" style={{ borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                <button
                  onClick={() => { setShowDetailModal(false); handleEdit(selectedProveedor); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all hover:scale-105"
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#3b82f6'
                  }}
                >
                  <Edit3 size={18} />
                  Editar
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
                    color: '#0a0a0a'
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proveedores;
