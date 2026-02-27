import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../services/api';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  MessageSquare,
  Star,
  Search,
  Filter,
  ToggleLeft,
  ToggleRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Award,
  ThumbsUp
} from 'lucide-react';

// Componente para mostrar las estrellas mejorado
const StarRating = ({ rating, size = 18, darkMode }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <div
          key={star}
          className="relative"
          style={{
            width: size,
            height: size,
          }}
        >
          <Star
            size={size}
            fill={star <= rating ? '#d4af37' : 'transparent'}
            stroke={star <= rating ? '#d4af37' : (darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')}
            style={{
              filter: star <= rating ? 'drop-shadow(0 0 4px rgba(212, 175, 55, 0.5))' : 'none'
            }}
          />
        </div>
      ))}
      <span
        className="ml-2 text-sm font-semibold"
        style={{ color: '#d4af37' }}
      >
        {rating}.0
      </span>
    </div>
  );
};

// Badge de estado mejorado
const StatusBadge = ({ isActive }) => {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
      style={{
        background: isActive
          ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)'
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)',
        color: isActive ? '#22c55e' : '#ef4444',
        border: `1px solid ${isActive ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
        boxShadow: isActive
          ? '0 0 20px rgba(34, 197, 94, 0.2)'
          : '0 0 20px rgba(239, 68, 68, 0.2)'
      }}
    >
      {isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
      {isActive ? 'Visible' : 'Oculto'}
    </span>
  );
};

// Custom Tooltip para gráficas
const CustomTooltip = ({ active, payload, label, darkMode }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: darkMode
            ? 'linear-gradient(145deg, rgba(20, 20, 20, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%)'
            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 245, 245, 0.98) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        <p style={{ color: '#d4af37', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color || (darkMode ? '#fff' : '#000'), fontSize: '13px' }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Coments = ({ darkMode }) => {
  const [comments, setComments] = useState([]);
  const [filterRating, setFilterRating] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortBy, setSortBy] = useState('fecha');

  // Cargar comentarios desde el backend
  useEffect(() => {
    api.get('/api/comentarios/listar')
      .then(response => setComments(response.data))
      .catch(error => console.error('Error cargando comentarios:', error));
  }, []);

  // Cambiar estado de comentario
  const toggleCommentStatus = (id) => {
    const commentToToggle = comments.find(comment => comment.idComentario === id);
    const activeComments = comments.filter(comment => comment.estado === 'Activo').length;

    if (commentToToggle.estado === 'Inactivo' && activeComments >= 4) {
      Swal.fire({
        icon: 'warning',
        title: '¡Límite alcanzado!',
        text: 'Solo puedes tener 4 comentarios visibles en la página principal.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#d4af37',
        background: darkMode ? '#1a1a1a' : '#ffffff',
        color: darkMode ? '#ffffff' : '#1a1a1a'
      });
      return;
    }

    api.patch(`/api/comentarios/actualizar/${id}`)
      .then(() => {
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.idComentario === id
              ? { ...comment, estado: comment.estado === 'Activo' ? 'Inactivo' : 'Activo' }
              : comment
          )
        );

        Swal.fire({
          icon: 'success',
          title: commentToToggle.estado === 'Activo' ? 'Comentario oculto' : 'Comentario visible',
          text: commentToToggle.estado === 'Activo'
            ? 'El comentario ya no aparecerá en la página principal'
            : 'El comentario ahora es visible en la página principal',
          timer: 2000,
          showConfirmButton: false,
          background: darkMode ? '#1a1a1a' : '#ffffff',
          color: darkMode ? '#ffffff' : '#1a1a1a'
        });
      })
      .catch(error => {
        console.error('Error cambiando estado:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cambiar el estado del comentario',
          confirmButtonColor: '#d4af37',
          background: darkMode ? '#1a1a1a' : '#ffffff',
          color: darkMode ? '#ffffff' : '#1a1a1a'
        });
      });
  };

  // Filtrar y ordenar comentarios
  const filteredComments = comments
    .filter(comment => {
      const matchesRating = filterRating === 0 || comment.estrellas === filterRating;
      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'active' && comment.estado === 'Activo') ||
        (filterStatus === 'inactive' && comment.estado === 'Inactivo');
      const matchesSearch = comment.nombreUsuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.contenido?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRating && matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'fecha') return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
      if (sortBy === 'estrellas') return b.estrellas - a.estrellas;
      if (sortBy === 'nombre') return a.nombreUsuario?.localeCompare(b.nombreUsuario);
      return 0;
    });

  const indexOfLastComment = currentPage * itemsPerPage;
  const indexOfFirstComment = indexOfLastComment - itemsPerPage;
  const currentComments = filteredComments.slice(indexOfFirstComment, indexOfLastComment);
  const totalPages = Math.ceil(filteredComments.length / itemsPerPage);

  const formatDate = (fechaComentario) => {
    const date = new Date(fechaComentario);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Estadísticas
  const stats = {
    total: comments.length,
    activos: comments.filter(c => c.estado === 'Activo').length,
    inactivos: comments.filter(c => c.estado === 'Inactivo').length,
    promedio: comments.length > 0
      ? (comments.reduce((acc, c) => acc + (c.estrellas || 0), 0) / comments.length).toFixed(1)
      : 0,
    positivos: comments.filter(c => c.estrellas >= 4).length,
    negativos: comments.filter(c => c.estrellas <= 2).length
  };

  // Datos para gráfica de barras (distribución por estrellas)
  const starDistribution = [
    { name: '5 ★', cantidad: comments.filter(c => c.estrellas === 5).length, fill: '#22c55e' },
    { name: '4 ★', cantidad: comments.filter(c => c.estrellas === 4).length, fill: '#84cc16' },
    { name: '3 ★', cantidad: comments.filter(c => c.estrellas === 3).length, fill: '#eab308' },
    { name: '2 ★', cantidad: comments.filter(c => c.estrellas === 2).length, fill: '#f97316' },
    { name: '1 ★', cantidad: comments.filter(c => c.estrellas === 1).length, fill: '#ef4444' }
  ];

  // Datos para gráfica de pie (estado de comentarios)
  const statusData = [
    { name: 'Visibles', value: stats.activos, color: '#22c55e' },
    { name: 'Ocultos', value: stats.inactivos, color: '#ef4444' }
  ];

  // Datos para gráfica de satisfacción
  const satisfactionData = [
    { name: 'Positivos', value: stats.positivos, color: '#22c55e' },
    { name: 'Neutrales', value: comments.filter(c => c.estrellas === 3).length, color: '#eab308' },
    { name: 'Negativos', value: stats.negativos, color: '#ef4444' }
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

  return (
    <div
      className="min-h-screen p-6 lg:p-8"
      style={{ background: darkMode ? '#0a0a0a' : '#f5f5f5' }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
              boxShadow: '0 8px 24px rgba(212, 175, 55, 0.3)'
            }}
          >
            <MessageSquare className="w-7 h-7 text-black" />
          </div>
          <div>
            <h1
              className="text-2xl lg:text-3xl font-bold"
              style={{ color: darkMode ? '#ffffff' : '#1a1a1a', fontFamily: "'Playfair Display', serif" }}
            >
              Gestión de <span style={{ color: '#d4af37' }}>Comentarios</span>
            </h1>
            <p style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '14px' }}>
              Administra las reseñas y opiniones de tus clientes
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-8">
        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(212, 175, 55, 0.15)' }}
            >
              <MessageSquare size={24} style={{ color: '#d4af37' }} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Total
              </p>
              <p className="text-2xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(34, 197, 94, 0.15)' }}
            >
              <CheckCircle size={24} style={{ color: '#22c55e' }} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Visibles
              </p>
              <p className="text-2xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                {stats.activos}<span className="text-sm font-normal opacity-50">/4</span>
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(212, 175, 55, 0.15)' }}
            >
              <Award size={24} style={{ color: '#d4af37' }} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Promedio
              </p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                  {stats.promedio}
                </p>
                <Star size={18} fill="#d4af37" stroke="#d4af37" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(34, 197, 94, 0.15)' }}
            >
              <ThumbsUp size={24} style={{ color: '#22c55e' }} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Positivos
              </p>
              <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>
                {stats.positivos}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Bar Chart - Distribución de estrellas */}
        <div className="lg:col-span-2 rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                Distribución de Calificaciones
              </h3>
              <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Cantidad de reseñas por estrellas
              </p>
            </div>
            <div
              className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37' }}
            >
              <TrendingUp size={16} className="inline mr-1" />
              {stats.total} reseñas
            </div>
          </div>
          <div style={{ height: '280px', width: '100%', minWidth: '0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={starDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: 12 }}
                  axisLine={{ stroke: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: 12 }}
                  axisLine={{ stroke: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} cursor={{ fill: 'transparent' }} />
                <Bar
                  dataKey="cantidad"
                  name="Cantidad"
                  radius={[8, 8, 0, 0]}
                  style={{ cursor: 'pointer' }}
                >
                  {starDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      style={{ outline: 'none' }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Charts */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h3 className="text-lg font-semibold mb-1" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            Estado y Satisfacción
          </h3>
          <p className="text-sm mb-4" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Visibilidad y sentimiento
          </p>

          {/* Status Pie */}
          <div style={{ height: '140px', width: '100%', minWidth: '0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={5}
                  dataKey="value"
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" style={{ outline: 'none' }} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 mb-4">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: item.color }}></div>
                <span className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Satisfaction Pie */}
          <div style={{ height: '140px', width: '100%', minWidth: '0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={satisfactionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={5}
                  dataKey="value"
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  {satisfactionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" style={{ outline: 'none' }} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-4">
            {satisfactionData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: item.color }}></div>
                <span className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-2xl p-6 mb-6" style={cardStyle}>
        <div className="flex flex-col xl:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
            />
            <input
              type="text"
              placeholder="Buscar por usuario o contenido..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl focus:outline-none transition-all"
              style={{
                ...selectStyle,
                background: darkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(250, 250, 250, 0.8)',
              }}
            />
          </div>

          {/* Filter by rating */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(212, 175, 55, 0.15)' }}
            >
              <Star size={18} style={{ color: '#d4af37' }} />
            </div>
            <select
              value={filterRating}
              onChange={(e) => {
                setFilterRating(parseInt(e.target.value, 10));
                setCurrentPage(1);
              }}
              className="px-4 py-3.5 rounded-xl focus:outline-none"
              style={{ ...selectStyle, minWidth: '160px' }}
            >
              <option value={0}>Todas</option>
              <option value={5}>5 Estrellas</option>
              <option value={4}>4 Estrellas</option>
              <option value={3}>3 Estrellas</option>
              <option value={2}>2 Estrellas</option>
              <option value={1}>1 Estrella</option>
            </select>
          </div>

          {/* Filter by status */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(34, 197, 94, 0.15)' }}
            >
              <Filter size={18} style={{ color: '#22c55e' }} />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3.5 rounded-xl focus:outline-none"
              style={{ ...selectStyle, minWidth: '140px' }}
            >
              <option value="all">Todos</option>
              <option value="active">Visibles</option>
              <option value="inactive">Ocultos</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(139, 92, 246, 0.15)' }}
            >
              <TrendingUp size={18} style={{ color: '#8b5cf6' }} />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3.5 rounded-xl focus:outline-none"
              style={{ ...selectStyle, minWidth: '150px' }}
            >
              <option value="fecha">Más recientes</option>
              <option value="estrellas">Mejor valorados</option>
              <option value="nombre">Por nombre</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Comments Alert */}
      {stats.activos >= 4 && (
        <div
          className="rounded-xl p-4 mb-6 flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}
        >
          <AlertCircle size={24} style={{ color: '#f59e0b' }} />
          <div>
            <p className="font-semibold" style={{ color: '#f59e0b' }}>Límite de comentarios visibles alcanzado</p>
            <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
              Desactiva un comentario existente para poder activar otro nuevo
            </p>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="rounded-2xl p-6" style={cardStyle}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
              Lista de Comentarios
            </h3>
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37' }}
            >
              {filteredComments.length} resultados
            </span>
          </div>
        </div>

        {currentComments.length === 0 ? (
          <div className="text-center py-20">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(212, 175, 55, 0.1)' }}
            >
              <MessageSquare size={40} style={{ color: 'rgba(212, 175, 55, 0.4)' }} />
            </div>
            <p className="text-xl font-semibold mb-2" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
              No hay comentarios
            </p>
            <p style={{ color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
              {searchTerm || filterRating || filterStatus !== 'all'
                ? 'Intenta cambiar los filtros de búsqueda'
                : 'Los comentarios de tus clientes aparecerán aquí'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentComments.map((comment, index) => (
              <div
                key={comment.idComentario}
                className="p-6 rounded-xl transition-all duration-300"
                style={{
                  background: darkMode
                    ? `linear-gradient(135deg, rgba(255,255,255,${0.02 + (index % 2) * 0.01}) 0%, rgba(255,255,255,${0.01 + (index % 2) * 0.01}) 100%)`
                    : `linear-gradient(135deg, rgba(0,0,0,${0.01 + (index % 2) * 0.01}) 0%, rgba(0,0,0,${0.005 + (index % 2) * 0.005}) 100%)`,
                  border: `1px solid ${comment.estado === 'Activo'
                    ? 'rgba(34, 197, 94, 0.2)'
                    : (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}`,
                }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  {/* User info and content */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
                          color: '#0a0a0a',
                          boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                        }}
                      >
                        {comment.nombreUsuario?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                            {comment.nombreUsuario || 'Usuario'}
                          </h4>
                          <StatusBadge isActive={comment.estado === 'Activo'} />
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <StarRating rating={comment.estrellas} darkMode={darkMode} />
                          <span
                            className="flex items-center gap-1.5 text-sm"
                            style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
                          >
                            <Calendar size={14} />
                            {formatDate(comment.fechaCreacion)}
                          </span>
                        </div>

                        <div
                          className="p-4 rounded-xl"
                          style={{
                            background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                            borderLeft: '3px solid #d4af37'
                          }}
                        >
                          <p
                            className="text-sm leading-relaxed italic"
                            style={{ color: darkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }}
                          >
                            "{comment.contenido}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="flex lg:flex-col items-center gap-3 lg:ml-4">
                    <button
                      onClick={() => toggleCommentStatus(comment.idComentario)}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                      style={{
                        background: comment.estado === 'Activo'
                          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)'
                          : 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)',
                        color: comment.estado === 'Activo' ? '#ef4444' : '#22c55e',
                        border: `1px solid ${comment.estado === 'Activo' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)'}`,
                        boxShadow: comment.estado === 'Activo'
                          ? '0 4px 15px rgba(239, 68, 68, 0.2)'
                          : '0 4px 15px rgba(34, 197, 94, 0.2)'
                      }}
                    >
                      {comment.estado === 'Activo' ? (
                        <>
                          <ToggleRight size={20} />
                          <span>Ocultar</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={20} />
                          <span>Mostrar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredComments.length > 0 && (
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6"
            style={{ borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Mostrar
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg text-sm focus:outline-none"
                style={selectStyle}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <span className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                de {filteredComments.length} comentarios
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2.5 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
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
                      className="w-10 h-10 rounded-lg text-sm font-bold transition-all hover:scale-105"
                      style={{
                        background: currentPage === page
                          ? 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)'
                          : darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        border: currentPage === page
                          ? 'none'
                          : `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`,
                        color: currentPage === page ? '#0a0a0a' : (darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
                        boxShadow: currentPage === page ? '0 4px 15px rgba(212, 175, 55, 0.3)' : 'none'
                      }}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2.5 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
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
    </div>
  );
};

export default Coments;
