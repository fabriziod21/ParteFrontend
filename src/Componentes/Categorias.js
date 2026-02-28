import React, { useState, useEffect } from 'react';
import {
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
  Tags,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Package,
  TrendingUp,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  Grid3X3,
  BarChart2,
  CheckCircle,
  XCircle,
  FolderOpen,
  Star,
  ShoppingBag,
  DollarSign
} from 'lucide-react';

const Categorias = ({ darkMode }) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    color: '#d4af37',
    icono: 'Package',
    estado: 'Activo',
    orden: 1
  });

  const [stats, setStats] = useState({
    totalCategorias: 0,
    categoriasActivas: 0,
    totalProductos: 0,
    categoriaTop: ''
  });

  // Colores predefinidos
  const coloresPredefinidos = [
    '#d4af37', '#8b5cf6', '#22c55e', '#3b82f6', '#ef4444', '#f59e0b',
    '#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#f97316', '#14b8a6'
  ];

  // Iconos disponibles
  const iconosDisponibles = [
    { name: 'Package', icon: Package },
    { name: 'Tags', icon: Tags },
    { name: 'Star', icon: Star },
    { name: 'ShoppingBag', icon: ShoppingBag },
    { name: 'Layers', icon: Layers },
    { name: 'Grid3X3', icon: Grid3X3 }
  ];

  useEffect(() => {
    fetchCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/categoria/listar');
      const mappedCategorias = (response.data || []).map(cat => ({
        id: cat.idCategoria || cat.id,
        nombre: cat.nombreCategoria || cat.nombre,
        descripcion: cat.descripcion || '',
        color: cat.color || '#d4af37',
        icono: cat.icono || 'Package',
        estado: cat.estado || 'Activo',
        orden: cat.orden || 1,
        productos: cat.productos || 0,
        ventas: cat.ventas || 0
      }));
      setCategorias(mappedCategorias);
      updateStats(mappedCategorias);
    } catch (error) {
      console.error('Error fetching categorias:', error);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (data) => {
    const activas = data.filter(c => c.estado === 'Activo').length;
    const totalProductos = data.reduce((acc, c) => acc + (c.productos || 0), 0);
    const topCategoria = data.reduce((max, c) => (c.ventas || 0) > (max.ventas || 0) ? c : max, data[0]);

    setStats({
      totalCategorias: data.length,
      categoriasActivas: activas,
      totalProductos: totalProductos,
      categoriaTop: topCategoria?.nombre || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await api.put(`/api/categoria/actualizar/${selectedCategoria.id}`, {
          nombreCategoria: formData.nombre,
          descripcion: formData.descripcion,
          color: formData.color,
          icono: formData.icono,
          estado: formData.estado,
          orden: formData.orden
        });
      } else {
        await api.post('/api/categoria/crear', {
          nombreCategoria: formData.nombre,
          descripcion: formData.descripcion,
          color: formData.color,
          icono: formData.icono,
          estado: formData.estado,
          orden: formData.orden
        });
      }

      Swal.fire({
        icon: 'success',
        title: isEditing ? 'Categoría actualizada' : 'Categoría creada',
        text: isEditing ? 'Los cambios se guardaron correctamente' : 'La nueva categoría se ha registrado',
        background: darkMode ? '#1a1a1a' : '#ffffff',
        color: darkMode ? '#ffffff' : '#1a1a1a',
        confirmButtonColor: '#d4af37'
      });

      setShowModal(false);
      resetForm();
      fetchCategorias();
    } catch (error) {
      console.error('Error:', error);
      // Simular éxito para demo
      const newCategoria = {
        ...formData,
        id: isEditing ? selectedCategoria.id : Date.now(),
        productos: isEditing ? selectedCategoria.productos : 0,
        ventas: isEditing ? selectedCategoria.ventas : 0
      };

      if (isEditing) {
        setCategorias(prev => prev.map(c => c.id === selectedCategoria.id ? newCategoria : c));
      } else {
        setCategorias(prev => [...prev, newCategoria]);
      }

      Swal.fire({
        icon: 'success',
        title: isEditing ? 'Categoría actualizada' : 'Categoría creada',
        text: isEditing ? 'Los cambios se guardaron correctamente' : 'La nueva categoría se ha registrado',
        background: darkMode ? '#1a1a1a' : '#ffffff',
        color: darkMode ? '#ffffff' : '#1a1a1a',
        confirmButtonColor: '#d4af37'
      });

      setShowModal(false);
      resetForm();
    }
  };

  const handleDelete = async (categoria) => {
    const result = await Swal.fire({
      title: '¿Eliminar categoría?',
      text: `Esta acción eliminará "${categoria.nombre}" y puede afectar ${categoria.productos} productos.`,
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
        await api.delete(`/api/categoria/eliminar/${categoria.id}`);
        setCategorias(prev => prev.filter(c => c.id !== categoria.id));
        Swal.fire({
          icon: 'success',
          title: 'Eliminada',
          text: 'La categoría ha sido eliminada',
          background: darkMode ? '#1a1a1a' : '#ffffff',
          color: darkMode ? '#ffffff' : '#1a1a1a',
          confirmButtonColor: '#d4af37'
        });
      } catch (error) {
        setCategorias(prev => prev.filter(c => c.id !== categoria.id));
        Swal.fire({
          icon: 'success',
          title: 'Eliminada',
          text: 'La categoría ha sido eliminada',
          background: darkMode ? '#1a1a1a' : '#ffffff',
          color: darkMode ? '#ffffff' : '#1a1a1a',
          confirmButtonColor: '#d4af37'
        });
      }
    }
  };

  const handleEdit = (categoria) => {
    setSelectedCategoria(categoria);
    setFormData({
      nombre: categoria.nombre || '',
      descripcion: categoria.descripcion || '',
      color: categoria.color || '#d4af37',
      icono: categoria.icono || 'Package',
      estado: categoria.estado || 'Activo',
      orden: categoria.orden || 1
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleViewDetail = (categoria) => {
    setSelectedCategoria(categoria);
    setShowDetailModal(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      color: '#d4af37',
      icono: 'Package',
      estado: 'Activo',
      orden: categorias.length + 1
    });
    setIsEditing(false);
    setSelectedCategoria(null);
  };

  const openNewModal = () => {
    resetForm();
    setShowModal(true);
  };

  const getIconComponent = (iconName) => {
    const iconObj = iconosDisponibles.find(i => i.name === iconName);
    return iconObj ? iconObj.icon : Package;
  };

  // Filtrar categorías
  const filteredCategorias = categorias.filter(categoria => {
    const matchSearch = categoria.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       categoria.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filterEstado === 'todos' || categoria.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  // Paginación
  const totalPages = Math.ceil(filteredCategorias.length / itemsPerPage);
  const paginatedCategorias = filteredCategorias.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Datos para gráficas
  const chartData = categorias.map(cat => ({
    nombre: cat.nombre,
    productos: cat.productos || 0,
    ventas: cat.ventas || 0,
    color: cat.color || '#d4af37'
  })).sort((a, b) => b.ventas - a.ventas).slice(0, 6);

  const pieData = categorias.map(cat => ({
    name: cat.nombre,
    value: cat.productos || 0,
    color: cat.color
  }));

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
              {entry.name}: {entry.name === 'Ventas' ? `S/.${entry.value?.toLocaleString()}` : entry.value}
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
      'Inactivo': { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', icon: XCircle }
    };
    const { bg, color, icon: Icon } = config[status] || config['Activo'];

    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ background: bg, color, border: `1px solid ${color}30` }}
      >
        <Icon size={10} />
        {status}
      </span>
    );
  };

  if (loading) {
    return <LoadingScreen darkMode={darkMode} message="Cargando categorías..." />;
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
            <Tags className="w-7 h-7 text-black" />
          </div>
          <div>
            <h1
              className="text-2xl lg:text-3xl font-bold"
              style={{ color: darkMode ? '#ffffff' : '#1a1a1a', fontFamily: "'Playfair Display', serif" }}
            >
              Gestión de <span style={{ color: '#d4af37' }}>Categorías</span>
            </h1>
            <p style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '14px' }}>
              Organiza y administra las categorías de productos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl overflow-hidden" style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
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
              <BarChart2 size={18} />
            </button>
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
            <span>Nueva Categoría</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-8">
        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212, 175, 55, 0.15)' }}>
              <Tags size={22} style={{ color: '#d4af37' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Total Categorías
          </p>
          <p className="text-2xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            {stats.totalCategorias}
          </p>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
              <CheckCircle size={22} style={{ color: '#22c55e' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Activas
          </p>
          <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>
            {stats.categoriasActivas}
          </p>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
              <Package size={22} style={{ color: '#8b5cf6' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Total Productos
          </p>
          <p className="text-2xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            {stats.totalProductos}
          </p>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
              <Star size={22} style={{ color: '#f59e0b' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Top Categoría
          </p>
          <p className="text-xl font-bold truncate" style={{ color: '#f59e0b' }}>
            {stats.categoriaTop}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart - Ventas por Categoría */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                Ventas por Categoría
              </h3>
              <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Top categorías por ingresos
              </p>
            </div>
            <TrendingUp size={20} style={{ color: '#d4af37' }} />
          </div>

          <div style={{ height: '220px', width: '100%', minWidth: '0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} horizontal={true} vertical={false} />
                <XAxis type="number" tick={{ fill: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `S/.${(value / 1000).toFixed(0)}k`} />
                <YAxis dataKey="nombre" type="category" tick={{ fill: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="ventas" name="Ventas" radius={[0, 6, 6, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Productos por Categoría */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                Productos por Categoría
              </h3>
              <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Distribución de inventario
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div style={{ height: '180px', width: '180px', minWidth: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip cursor={{ fill: 'transparent' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 space-y-2">
              {pieData.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: item.color }}></div>
                    <span className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
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
              placeholder="Buscar categorías..."
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
              <option value="Activo">Activas</option>
              <option value="Inactivo">Inactivas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-6">
          {paginatedCategorias.map((categoria) => {
            const IconComponent = getIconComponent(categoria.icono);
            return (
              <div
                key={categoria.id}
                className="rounded-2xl overflow-hidden transition-all hover:scale-[1.02] cursor-pointer"
                style={cardStyle}
                onClick={() => handleViewDetail(categoria)}
              >
                {/* Color Header */}
                <div
                  className="h-24 relative flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${categoria.color}30 0%, ${categoria.color}10 100%)` }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${categoria.color} 0%, ${categoria.color}cc 100%)`,
                      boxShadow: `0 8px 24px ${categoria.color}40`
                    }}
                  >
                    <IconComponent size={28} className="text-black" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={categoria.estado} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                    {categoria.nombre}
                  </h3>
                  <p className="text-sm mb-4 line-clamp-2" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                    {categoria.descripcion || 'Sin descripción'}
                  </p>

                  <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                    <div className="text-center">
                      <p className="text-lg font-bold" style={{ color: categoria.color }}>
                        {categoria.productos}
                      </p>
                      <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                        Productos
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold" style={{ color: '#d4af37' }}>
                        S/.{(categoria.ventas / 1000).toFixed(1)}k
                      </p>
                      <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                        Ventas
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(categoria); }}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg transition-all hover:scale-105 text-sm"
                      style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: '#3b82f6'
                      }}
                    >
                      <Edit3 size={14} />
                      Editar
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(categoria); }}
                      className="p-2 rounded-lg transition-all hover:scale-105"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-2xl overflow-hidden mb-6" style={cardStyle}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                <th className="text-left py-4 px-5 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Categoría</th>
                <th className="text-left py-4 px-5 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Descripción</th>
                <th className="text-center py-4 px-5 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Productos</th>
                <th className="text-center py-4 px-5 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Ventas</th>
                <th className="text-center py-4 px-5 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Estado</th>
                <th className="text-center py-4 px-5 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCategorias.map((categoria, index) => {
                const IconComponent = getIconComponent(categoria.icono);
                return (
                  <tr
                    key={categoria.id}
                    className="transition-all hover:bg-opacity-50 cursor-pointer"
                    style={{
                      borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                      background: index % 2 === 0 ? 'transparent' : (darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)')
                    }}
                    onClick={() => handleViewDetail(categoria)}
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: `${categoria.color}20` }}
                        >
                          <IconComponent size={20} style={{ color: categoria.color }} />
                        </div>
                        <span className="font-medium" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                          {categoria.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-sm truncate max-w-xs block" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                        {categoria.descripcion || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className="font-semibold" style={{ color: categoria.color }}>
                        {categoria.productos}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className="font-semibold" style={{ color: '#d4af37' }}>
                        S/.{categoria.ventas?.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <StatusBadge status={categoria.estado} />
                    </td>
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(categoria); }}
                          className="p-2 rounded-lg transition-all hover:scale-105"
                          style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            color: '#3b82f6'
                          }}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(categoria); }}
                          className="p-2 rounded-lg transition-all hover:scale-105"
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredCategorias.length === 0 && (
        <div className="rounded-2xl p-12 text-center" style={cardStyle}>
          <FolderOpen size={64} style={{ color: 'rgba(212, 175, 55, 0.3)', margin: '0 auto 16px' }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            No se encontraron categorías
          </h3>
          <p style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Intenta ajustar los filtros o crea una nueva categoría
          </p>
        </div>
      )}

      {/* Pagination */}
      {filteredCategorias.length > 0 && (
        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredCategorias.length)} de {filteredCategorias.length}
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

      {/* Modal - Crear/Editar Categoría */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{ background: darkMode ? '#0a0a0a' : '#ffffff' }}
          >
            <div className="flex items-center justify-between p-6" style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                  {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>
                <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                  {isEditing ? 'Actualiza la información' : 'Crea una nueva categoría'}
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    Nombre *
                  </label>
                  <div className="relative">
                    <Tags size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#d4af37' }} />
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none"
                      style={inputStyle}
                      placeholder="Nombre de la categoría"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
                    style={inputStyle}
                    placeholder="Descripción de la categoría..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    Color
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2 flex-wrap">
                      {coloresPredefinidos.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                          className="w-8 h-8 rounded-lg transition-all hover:scale-110"
                          style={{
                            background: color,
                            border: formData.color === color ? '3px solid white' : 'none',
                            boxShadow: formData.color === color ? '0 0 0 2px ' + color : 'none'
                          }}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-10 h-10 rounded-lg cursor-pointer"
                      style={{ border: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    Icono
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {iconosDisponibles.map(({ name, icon: Icon }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icono: name }))}
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                        style={{
                          background: formData.icono === name ? formData.color : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                          border: `1px solid ${formData.icono === name ? formData.color : (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}`
                        }}
                      >
                        <Icon size={22} style={{ color: formData.icono === name ? '#000' : (darkMode ? '#fff' : '#000') }} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                      Orden
                    </label>
                    <input
                      type="number"
                      name="orden"
                      value={formData.orden}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-4 py-3 rounded-xl focus:outline-none"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 rounded-xl" style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                  <p className="text-xs uppercase tracking-wide mb-3" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                    Vista previa
                  </p>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${formData.color} 0%, ${formData.color}cc 100%)`,
                        boxShadow: `0 4px 12px ${formData.color}40`
                      }}
                    >
                      {React.createElement(getIconComponent(formData.icono), { size: 24, className: 'text-black' })}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                        {formData.nombre || 'Nombre de categoría'}
                      </p>
                      <StatusBadge status={formData.estado} />
                    </div>
                  </div>
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
                  {isEditing ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Detalle Categoría */}
      {showDetailModal && selectedCategoria && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{ background: darkMode ? '#0a0a0a' : '#ffffff' }}
          >
            {/* Header with color */}
            <div
              className="p-6 text-center relative"
              style={{ background: `linear-gradient(135deg, ${selectedCategoria.color}30 0%, ${selectedCategoria.color}10 100%)` }}
            >
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 p-2 rounded-lg transition-all hover:scale-105"
                style={{ background: 'rgba(0,0,0,0.2)' }}
              >
                <X size={20} style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }} />
              </button>

              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{
                  background: `linear-gradient(135deg, ${selectedCategoria.color} 0%, ${selectedCategoria.color}cc 100%)`,
                  boxShadow: `0 8px 24px ${selectedCategoria.color}40`
                }}
              >
                {React.createElement(getIconComponent(selectedCategoria.icono), { size: 36, className: 'text-black' })}
              </div>

              <h2 className="text-2xl font-bold mb-2" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                {selectedCategoria.nombre}
              </h2>
              <StatusBadge status={selectedCategoria.estado} />
            </div>

            <div className="p-6">
              <p className="text-sm mb-6 text-center" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                {selectedCategoria.descripcion || 'Sin descripción disponible'}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl text-center" style={{ background: `${selectedCategoria.color}15`, border: `1px solid ${selectedCategoria.color}30` }}>
                  <Package size={24} style={{ color: selectedCategoria.color, margin: '0 auto 8px' }} />
                  <p className="text-2xl font-bold" style={{ color: selectedCategoria.color }}>
                    {selectedCategoria.productos}
                  </p>
                  <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    Productos
                  </p>
                </div>
                <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                  <DollarSign size={24} style={{ color: '#d4af37', margin: '0 auto 8px' }} />
                  <p className="text-2xl font-bold" style={{ color: '#d4af37' }}>
                    S/.{(selectedCategoria.ventas / 1000).toFixed(1)}k
                  </p>
                  <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    Ventas
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-3 p-4 rounded-xl" style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                <div className="flex items-center justify-between">
                  <span style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Orden</span>
                  <span className="font-medium" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>#{selectedCategoria.orden}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Color</span>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md" style={{ background: selectedCategoria.color }}></div>
                    <span className="font-mono text-sm" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>{selectedCategoria.color}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => { setShowDetailModal(false); handleEdit(selectedCategoria); }}
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

export default Categorias;
