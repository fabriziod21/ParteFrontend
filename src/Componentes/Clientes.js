import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../services/api';
import LoadingScreen from './LoadingScreen';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Shield,
  ShieldOff,
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Eye,
  Crown,
  ChevronDown,
  Grid3X3,
  List
} from 'lucide-react';

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

// Badge de estado
const StatusBadge = ({ status }) => {
  const isActive = status === 'Activo';
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
      style={{
        background: isActive
          ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)'
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)',
        color: isActive ? '#22c55e' : '#ef4444',
        border: `1px solid ${isActive ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
      }}
    >
      {isActive ? <UserCheck size={12} /> : <UserX size={12} />}
      {isActive ? 'Activo' : 'Baneado'}
    </span>
  );
};

// Badge de rol
const RoleBadge = ({ role }) => {
  const isVendedor = role === 'vendedor';
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
      style={{
        background: isVendedor
          ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%)'
          : 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)',
        color: isVendedor ? '#d4af37' : '#8b5cf6',
        border: `1px solid ${isVendedor ? 'rgba(212, 175, 55, 0.4)' : 'rgba(139, 92, 246, 0.4)'}`,
      }}
    >
      {isVendedor ? <Crown size={12} /> : <Users size={12} />}
      {role}
    </span>
  );
};

const Clientes = ({ darkMode = true }) => {
  const [rows, setRows] = useState([]);
  const [visitasData, setVisitasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [expandedRow, setExpandedRow] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, statsRes] = await Promise.all([
          api.get('/api/usuarios/listar'),
          api.get('/api/usuarios/devolverEstadisticas')
        ]);
        setRows(usersRes.data);
        setVisitasData(statsRes.data);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleStatus = (user) => {
    const newStatus = user.estado === 'Baneado' ? 'Activo' : 'Baneado';
    const action = user.estado === 'Baneado' ? 'desbanear' : 'banear';

    Swal.fire({
      title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} usuario?`,
      text: `¿Estás seguro de que deseas ${action} a ${user.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: user.estado === 'Baneado' ? '#22c55e' : '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: user.estado === 'Baneado' ? 'Sí, desbanear' : 'Sí, banear',
      cancelButtonText: 'Cancelar',
      background: darkMode ? '#1a1a1a' : '#ffffff',
      color: darkMode ? '#ffffff' : '#1a1a1a'
    }).then((result) => {
      if (result.isConfirmed) {
        api.patch(`/api/usuarios/actualizar/${user.idUsuario}`)
          .then(() => {
            setRows(prevRows =>
              prevRows.map(row =>
                row.idUsuario === user.idUsuario ? { ...row, estado: newStatus } : row
              )
            );
            Swal.fire({
              title: '¡Actualizado!',
              text: `${user.nombre} ha sido ${user.estado === 'Baneado' ? 'desbaneado' : 'baneado'} correctamente.`,
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              background: darkMode ? '#1a1a1a' : '#ffffff',
              color: darkMode ? '#ffffff' : '#1a1a1a'
            });
          })
          .catch(() => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo actualizar el estado del usuario.',
              icon: 'error',
              background: darkMode ? '#1a1a1a' : '#ffffff',
              color: darkMode ? '#ffffff' : '#1a1a1a'
            });
          });
      }
    });
  };

  const handleRoleChange = (user, newRole) => {
    api.put(`/api/usuarios/actualizarRol/${user.idUsuario}`, { rol: newRole })
      .then(() => {
        setRows(prevRows =>
          prevRows.map(row =>
            row.idUsuario === user.idUsuario
              ? { ...row, rol: { ...row.rol, roles: newRole } }
              : row
          )
        );
        Swal.fire({
          title: 'Rol actualizado',
          text: `${user.nombre} ahora es ${newRole}`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: darkMode ? '#1a1a1a' : '#ffffff',
          color: darkMode ? '#ffffff' : '#1a1a1a'
        });
      })
      .catch(() => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo actualizar el rol.',
          icon: 'error',
          background: darkMode ? '#1a1a1a' : '#ffffff',
          color: darkMode ? '#ffffff' : '#1a1a1a'
        });
      });
  };

  // Filtrar usuarios
  const filteredUsers = rows.filter(user => {
    const matchesSearch = user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.telefono?.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && user.estado === 'Activo') ||
      (filterStatus === 'banned' && user.estado === 'Baneado');
    const matchesRole = filterRole === 'all' ||
      user.rol?.roles === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Estadísticas
  const stats = {
    total: rows.length,
    activos: rows.filter(u => u.estado === 'Activo').length,
    baneados: rows.filter(u => u.estado === 'Baneado').length,
    vendedores: rows.filter(u => u.rol?.roles === 'vendedor').length,
    clientes: rows.filter(u => u.rol?.roles === 'cliente').length
  };

  // Datos para gráfica de visitas
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const visitasChartData = meses.map((mes, index) => {
    const visita = visitasData.find(v => v.mes === index + 1);
    return {
      mes,
      visitas: visita ? visita.totalVisitas : 0
    };
  });

  // Datos para pie chart de roles
  const rolesData = [
    { name: 'Clientes', value: stats.clientes, color: '#8b5cf6' },
    { name: 'Vendedores', value: stats.vendedores, color: '#d4af37' }
  ];

  // Datos para pie chart de estados
  const estadosData = [
    { name: 'Activos', value: stats.activos, color: '#22c55e' },
    { name: 'Baneados', value: stats.baneados, color: '#ef4444' }
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
    return <LoadingScreen darkMode={darkMode} message="Cargando clientes..." />;
  }

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
            <Users className="w-7 h-7 text-black" />
          </div>
          <div>
            <h1
              className="text-2xl lg:text-3xl font-bold"
              style={{ color: darkMode ? '#ffffff' : '#1a1a1a', fontFamily: "'Playfair Display', serif" }}
            >
              Gestión de <span style={{ color: '#d4af37' }}>Clientes</span>
            </h1>
            <p style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '14px' }}>
              Administra usuarios, roles y permisos
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5 mb-8">
        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(212, 175, 55, 0.15)' }}
            >
              <Users size={24} style={{ color: '#d4af37' }} />
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
              <UserCheck size={24} style={{ color: '#22c55e' }} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Activos
              </p>
              <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>
                {stats.activos}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(239, 68, 68, 0.15)' }}
            >
              <UserX size={24} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Baneados
              </p>
              <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>
                {stats.baneados}
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
              <Crown size={24} style={{ color: '#d4af37' }} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Vendedores
              </p>
              <p className="text-2xl font-bold" style={{ color: '#d4af37' }}>
                {stats.vendedores}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(139, 92, 246, 0.15)' }}
            >
              <Users size={24} style={{ color: '#8b5cf6' }} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Clientes
              </p>
              <p className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>
                {stats.clientes}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Visits Chart */}
        <div className="lg:col-span-2 rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                Visitas Mensuales
              </h3>
              <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Actividad de usuarios durante el año
              </p>
            </div>
            <div
              className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37' }}
            >
              <Eye size={16} className="inline mr-1" />
              {visitasData.reduce((acc, v) => acc + v.totalVisitas, 0)} total
            </div>
          </div>
          <div style={{ height: '300px', width: '100%', minWidth: '0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitasChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                  vertical={false}
                />
                <XAxis
                  dataKey="mes"
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
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} cursor={{ stroke: 'rgba(212, 175, 55, 0.2)', strokeWidth: 1, fill: 'transparent' }} />
                <Area
                  type="monotone"
                  dataKey="visitas"
                  name="Visitas"
                  stroke="#d4af37"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorVisitas)"
                  dot={{ fill: '#d4af37', strokeWidth: 2, r: 4, stroke: darkMode ? '#0a0a0a' : '#ffffff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Charts */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h3 className="text-lg font-semibold mb-1" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
            Distribución
          </h3>
          <p className="text-sm mb-4" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Por rol y estado
          </p>

          {/* Roles Pie */}
          <div className="mb-2">
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
              Roles
            </p>
            <div style={{ height: '120px', width: '100%', minWidth: '0' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rolesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={5}
                    dataKey="value"
                    style={{ cursor: 'pointer', outline: 'none' }}
                  >
                    {rolesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" style={{ outline: 'none' }} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip darkMode={darkMode} />} cursor={false} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4">
              {rolesData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color }}></div>
                  <span className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Estados Pie */}
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
              Estados
            </p>
            <div style={{ height: '120px', width: '100%', minWidth: '0' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={estadosData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={5}
                    dataKey="value"
                    style={{ cursor: 'pointer', outline: 'none' }}
                  >
                    {estadosData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" style={{ outline: 'none' }} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip darkMode={darkMode} />} cursor={false} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4">
              {estadosData.map((item, index) => (
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
              placeholder="Buscar por nombre, correo o teléfono..."
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

          {/* Filter by status */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(34, 197, 94, 0.15)' }}
            >
              <UserCheck size={18} style={{ color: '#22c55e' }} />
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
              <option value="active">Activos</option>
              <option value="banned">Baneados</option>
            </select>
          </div>

          {/* Filter by role */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(212, 175, 55, 0.15)' }}
            >
              <Crown size={18} style={{ color: '#d4af37' }} />
            </div>
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3.5 rounded-xl focus:outline-none"
              style={{ ...selectStyle, minWidth: '140px' }}
            >
              <option value="all">Todos los roles</option>
              <option value="cliente">Clientes</option>
              <option value="vendedor">Vendedores</option>
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
              onClick={() => setViewMode('table')}
              className="p-2.5 transition-all"
              style={{
                background: viewMode === 'table' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                color: viewMode === 'table' ? '#d4af37' : (darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')
              }}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className="p-2.5 transition-all"
              style={{
                background: viewMode === 'cards' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                color: viewMode === 'cards' ? '#d4af37' : (darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')
              }}
            >
              <Grid3X3 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="rounded-2xl p-6" style={cardStyle}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
              Lista de Usuarios
            </h3>
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37' }}
            >
              {filteredUsers.length} usuarios
            </span>
          </div>
        </div>

        {currentUsers.length === 0 ? (
          <div className="text-center py-20">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(212, 175, 55, 0.1)' }}
            >
              <Users size={40} style={{ color: 'rgba(212, 175, 55, 0.4)' }} />
            </div>
            <p className="text-xl font-semibold mb-2" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
              No hay usuarios
            </p>
            <p style={{ color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
              {searchTerm || filterStatus !== 'all' || filterRole !== 'all'
                ? 'Intenta cambiar los filtros de búsqueda'
                : 'Los usuarios aparecerán aquí'}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View - Estilo Dashboard */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>ID</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Cliente</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Contacto</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Estado</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Rol</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user, index) => (
                  <tr
                    key={user.idUsuario}
                    className="transition-all hover:bg-opacity-50"
                    style={{
                      borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                      background: index % 2 === 0 ? 'transparent' : (darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)')
                    }}
                  >
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm" style={{ color: '#d4af37' }}>#{user.idUsuario}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)', color: '#0a0a0a' }}>
                          {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>{user.nombre || 'Usuario'}</p>
                          <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>{user.correo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p style={{ color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>{user.telefono || 'No disponible'}</p>
                        <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>{user.direccion || 'Sin dirección'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={user.estado} />
                    </td>
                    <td className="py-4 px-4">
                      <RoleBadge role={user.rol?.roles || 'cliente'} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className="p-2 rounded-lg transition-all hover:scale-105"
                        style={{
                          background: user.estado === 'Activo' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                          border: `1px solid ${user.estado === 'Activo' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                          color: user.estado === 'Activo' ? '#ef4444' : '#22c55e'
                        }}
                        title={user.estado === 'Activo' ? 'Banear usuario' : 'Desbanear usuario'}
                      >
                        {user.estado === 'Activo' ? <ShieldOff size={18} /> : <Shield size={18} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards View */
          <div className="space-y-4">
            {currentUsers.map((user, index) => (
              <div
                key={user.idUsuario}
                className="rounded-xl transition-all duration-300"
                style={{
                  background: darkMode
                    ? `linear-gradient(135deg, rgba(255,255,255,${0.02 + (index % 2) * 0.01}) 0%, rgba(255,255,255,${0.01 + (index % 2) * 0.01}) 100%)`
                    : `linear-gradient(135deg, rgba(0,0,0,${0.01 + (index % 2) * 0.01}) 0%, rgba(0,0,0,${0.005 + (index % 2) * 0.005}) 100%)`,
                  border: `1px solid ${user.estado === 'Activo'
                    ? 'rgba(34, 197, 94, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)'}`,
                }}
              >
                {/* Main Row */}
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedRow(expandedRow === user.idUsuario ? null : user.idUsuario)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* User info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
                          color: '#0a0a0a',
                          boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                        }}
                      >
                        {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-lg font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                            {user.nombre || 'Usuario'}
                          </h4>
                          <span className="text-sm opacity-50" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                            #{user.idUsuario}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <StatusBadge status={user.estado} />
                          <RoleBadge role={user.rol?.roles || 'cliente'} />
                        </div>
                      </div>
                    </div>

                    {/* Quick info */}
                    <div className="flex items-center gap-6">
                      <div className="hidden md:flex items-center gap-2">
                        <Mail size={14} style={{ color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }} />
                        <span className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                          {user.correo}
                        </span>
                      </div>
                      <ChevronDown
                        size={20}
                        style={{
                          color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                          transform: expandedRow === user.idUsuario ? 'rotate(180deg)' : 'rotate(0)',
                          transition: 'transform 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedRow === user.idUsuario && (
                  <div
                    className="px-5 pb-5 pt-2"
                    style={{ borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                      <div
                        className="p-4 rounded-xl"
                        style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Mail size={16} style={{ color: '#d4af37' }} />
                          <span className="text-xs uppercase tracking-wide" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                            Correo
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                          {user.correo || 'No disponible'}
                        </p>
                      </div>

                      <div
                        className="p-4 rounded-xl"
                        style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Phone size={16} style={{ color: '#d4af37' }} />
                          <span className="text-xs uppercase tracking-wide" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                            Teléfono
                          </span>
                        </div>
                        <p className="text-sm font-medium" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                          {user.telefono || 'No disponible'}
                        </p>
                      </div>

                      <div
                        className="p-4 rounded-xl md:col-span-2"
                        style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin size={16} style={{ color: '#d4af37' }} />
                          <span className="text-xs uppercase tracking-wide" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                            Dirección
                          </span>
                        </div>
                        <p className="text-sm font-medium" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                          {user.direccion || 'No disponible'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Change Role */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                          Cambiar rol:
                        </span>
                        <select
                          value={user.rol?.roles || 'cliente'}
                          onChange={(e) => handleRoleChange(user, e.target.value)}
                          className="px-3 py-2 rounded-lg text-sm focus:outline-none"
                          style={selectStyle}
                        >
                          <option value="cliente">Cliente</option>
                          <option value="vendedor">Vendedor</option>
                        </select>
                      </div>

                      {/* Toggle Status Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(user);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ml-auto"
                        style={{
                          background: user.estado === 'Activo'
                            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)'
                            : 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)',
                          color: user.estado === 'Activo' ? '#ef4444' : '#22c55e',
                          border: `1px solid ${user.estado === 'Activo' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)'}`,
                        }}
                      >
                        {user.estado === 'Activo' ? (
                          <>
                            <ShieldOff size={18} />
                            <span>Banear</span>
                          </>
                        ) : (
                          <>
                            <Shield size={18} />
                            <span>Desbanear</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredUsers.length > 0 && (
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
                de {filteredUsers.length} usuarios
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

export default Clientes;
