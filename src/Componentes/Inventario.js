import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from "recharts";
import api from "../services/api";
import img from "../imagenes/cvv.jpeg";
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Boxes,
  RefreshCw
} from "lucide-react";

function Inventario({ darkMode }) {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/api/producto/listar")
      .then((response) => {
        setProductos(response.data);
        if (response.data.length > 0) {
          setProductoSeleccionado(response.data[0]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los productos", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (productoSeleccionado) {
      api
        .get(`/api/kardex/recuperar/${productoSeleccionado.idProducto}`)
        .then((response) => {
          setMovimientos(response.data);
        })
        .catch((error) => {
          console.error("Hubo un error al obtener los movimientos", error);
        });
    }
  }, [productoSeleccionado]);

  const manejarCambioProducto = (event) => {
    const productoElegido = productos.find((prod) => prod.nombre === event.target.value);
    setProductoSeleccionado(productoElegido);
    setMovimientos([]);
  };

  const movimientosExistentes = movimientos.length > 0;
  const ultimoMovimiento = movimientosExistentes ? movimientos[movimientos.length - 1] : { stockResultante: 0 };
  const stockActual = ultimoMovimiento.stockResultante || 0;
  const stockMaximo = productoSeleccionado?.stockMaximo || 100;
  const stockMinimo = productoSeleccionado?.stockMinimo || 0;

  const porcentajeStock = Math.round((stockActual / stockMaximo) * 100);
  const stockExcedeLimiteMaximo = stockActual > stockMaximo;
  const stockBajoDelLimiteMinimo = stockActual < stockMinimo;

  // Preparar datos para el gráfico
  const chartData = movimientos.map((mov, index) => ({
    fecha: mov.fechaMovimiento,
    stock: mov.stockResultante,
    minimo: stockMinimo,
    maximo: stockMaximo
  }));

  // Calcular estadísticas
  const stockPromedio = movimientosExistentes
    ? Math.round(movimientos.reduce((acc, mov) => acc + mov.stockResultante, 0) / movimientos.length)
    : 0;

  const tendencia = movimientosExistentes && movimientos.length >= 2
    ? movimientos[movimientos.length - 1].stockResultante - movimientos[movimientos.length - 2].stockResultante
    : 0;

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
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '8px' }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, fontSize: '14px', fontWeight: '600' }}>
              {entry.name}: {entry.value} unidades
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Determinar estado del stock
  const getStockStatus = () => {
    if (stockExcedeLimiteMaximo) return { color: '#ef4444', text: 'Exceso', icon: AlertTriangle };
    if (stockBajoDelLimiteMinimo) return { color: '#f59e0b', text: 'Bajo', icon: AlertTriangle };
    return { color: '#22c55e', text: 'Optimo', icon: CheckCircle };
  };

  const stockStatus = getStockStatus();

  return (
    <div
      className="min-h-screen p-6 lg:p-8"
      style={{ background: darkMode ? '#0a0a0a' : '#f5f5f5' }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)' }}
          >
            <BarChart3 className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1
              className="text-2xl lg:text-3xl font-bold"
              style={{ color: darkMode ? '#ffffff' : '#1a1a1a', fontFamily: "'Playfair Display', serif" }}
            >
              Control de <span style={{ color: '#d4af37' }}>Inventario</span>
            </h1>
            <p style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '14px' }}>
              Monitorea y gestiona el stock de tus productos
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Izquierdo - Información del Producto */}
        <div className="lg:col-span-1 space-y-6">
          {/* Selector de Producto */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: darkMode
                ? 'linear-gradient(145deg, rgba(20, 20, 20, 0.9) 0%, rgba(15, 15, 15, 0.95) 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%)',
              border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`,
              boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Package size={20} style={{ color: '#d4af37' }} />
              <h3
                className="font-semibold"
                style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}
              >
                Seleccionar Producto
              </h3>
            </div>

            <select
              value={productoSeleccionado?.nombre || ""}
              onChange={manejarCambioProducto}
              className="w-full p-3 rounded-xl font-medium transition-all focus:outline-none"
              style={{
                background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: darkMode ? '#ffffff' : '#1a1a1a'
              }}
            >
              {productos.map((prod) => (
                <option key={prod.nombre} value={prod.nombre} style={{ background: '#1a1a1a', color: '#fff' }}>
                  {prod.nombre}
                </option>
              ))}
            </select>

            {/* Imagen del Producto */}
            {productoSeleccionado && (
              <div
                className="mt-4 rounded-xl overflow-hidden flex items-center justify-center"
                style={{
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  background: darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
                  height: '180px',
                  maxHeight: '180px'
                }}
              >
                <img
                  src={productoSeleccionado?.imagenes?.[0]?.imagen?.url || img}
                  alt={productoSeleccionado?.nombre}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                />
              </div>
            )}
          </div>

          {/* Estado del Stock */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: darkMode
                ? 'linear-gradient(145deg, rgba(20, 20, 20, 0.9) 0%, rgba(15, 15, 15, 0.95) 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%)',
              border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`,
              boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-semibold"
                style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}
              >
                Estado del Stock
              </h3>
              <div
                className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                style={{
                  background: `${stockStatus.color}20`,
                  color: stockStatus.color,
                  border: `1px solid ${stockStatus.color}40`
                }}
              >
                <stockStatus.icon size={12} />
                {stockStatus.text}
              </div>
            </div>

            {/* Barra de Progreso Circular */}
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={stockStatus.color}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(porcentajeStock / 100) * 352} 352`}
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-3xl font-bold"
                    style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}
                  >
                    {porcentajeStock}%
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
                  >
                    Capacidad
                  </span>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl" style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                <p className="text-xs mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Minimo</p>
                <p className="text-lg font-bold" style={{ color: '#f59e0b' }}>{stockMinimo}</p>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                <p className="text-xs mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Actual</p>
                <p className="text-lg font-bold" style={{ color: '#d4af37' }}>{stockActual}</p>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                <p className="text-xs mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Maximo</p>
                <p className="text-lg font-bold" style={{ color: '#22c55e' }}>{stockMaximo}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho - Gráfica y Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cards de Estadísticas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stock Actual */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: darkMode
                  ? 'linear-gradient(145deg, rgba(20, 20, 20, 0.9) 0%, rgba(15, 15, 15, 0.95) 100%)'
                  : 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%)',
                border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`,
                boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <Boxes size={20} style={{ color: '#d4af37' }} />
                <span
                  className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                  style={{
                    background: tendencia >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: tendencia >= 0 ? '#22c55e' : '#ef4444'
                  }}
                >
                  {tendencia >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(tendencia)}
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                {stockActual}
              </p>
              <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Stock Actual
              </p>
            </div>

            {/* Promedio */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: darkMode
                  ? 'linear-gradient(145deg, rgba(20, 20, 20, 0.9) 0%, rgba(15, 15, 15, 0.95) 100%)'
                  : 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%)',
                border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`,
                boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <TrendingUp size={20} style={{ color: '#22c55e' }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                {stockPromedio}
              </p>
              <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Promedio
              </p>
            </div>

            {/* Movimientos */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: darkMode
                  ? 'linear-gradient(145deg, rgba(20, 20, 20, 0.9) 0%, rgba(15, 15, 15, 0.95) 100%)'
                  : 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%)',
                border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`,
                boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <RefreshCw size={20} style={{ color: '#8b5cf6' }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                {movimientos.length}
              </p>
              <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Movimientos
              </p>
            </div>

            {/* Capacidad */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: darkMode
                  ? 'linear-gradient(145deg, rgba(20, 20, 20, 0.9) 0%, rgba(15, 15, 15, 0.95) 100%)'
                  : 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%)',
                border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`,
                boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <TrendingDown size={20} style={{ color: '#f59e0b' }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                {stockMaximo - stockActual}
              </p>
              <p className="text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Disponible
              </p>
            </div>
          </div>

          {/* Gráfica Principal */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: darkMode
                ? 'linear-gradient(145deg, rgba(20, 20, 20, 0.9) 0%, rgba(15, 15, 15, 0.95) 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%)',
              border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`,
              boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}
                >
                  Historial de Stock
                </h3>
                <p
                  className="text-sm"
                  style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
                >
                  {productoSeleccionado?.nombre || 'Selecciona un producto'}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#d4af37' }}></div>
                  <span style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5" style={{ background: '#ef4444' }}></div>
                  <span style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Maximo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5" style={{ background: '#f59e0b' }}></div>
                  <span style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Minimo</span>
                </div>
              </div>
            </div>

            <div style={{ height: '350px' }}>
              {!movimientosExistentes ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <Boxes size={48} style={{ color: 'rgba(212, 175, 55, 0.3)', marginBottom: '16px' }} />
                  <p style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                    No hay movimientos registrados para este producto
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="fecha"
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
                    <ReferenceLine
                      y={stockMaximo}
                      stroke="#ef4444"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                    />
                    <ReferenceLine
                      y={stockMinimo}
                      stroke="#f59e0b"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="stock"
                      name="Stock"
                      stroke="#d4af37"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorStock)"
                      dot={{ fill: '#d4af37', strokeWidth: 2, r: 4, stroke: darkMode ? '#0a0a0a' : '#ffffff' }}
                      activeDot={{ r: 6, stroke: '#d4af37', strokeWidth: 2, fill: darkMode ? '#0a0a0a' : '#ffffff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Tabla de Movimientos Recientes */}
          {movimientosExistentes && (
            <div
              className="rounded-2xl p-6"
              style={{
                background: darkMode
                  ? 'linear-gradient(145deg, rgba(20, 20, 20, 0.9) 0%, rgba(15, 15, 15, 0.95) 100%)'
                  : 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%)',
                border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`,
                boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}
              >
                Movimientos Recientes
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Fecha</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Tipo</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Cantidad</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Stock Resultante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.slice(-5).reverse().map((mov, index) => (
                      <tr
                        key={index}
                        style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}
                      >
                        <td className="py-3 px-4" style={{ color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>
                          {mov.fechaMovimiento}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              background: mov.tipoMovimiento === 'ENTRADA' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: mov.tipoMovimiento === 'ENTRADA' ? '#22c55e' : '#ef4444'
                            }}
                          >
                            {mov.tipoMovimiento || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                          {mov.cantidad || '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold" style={{ color: '#d4af37' }}>
                            {mov.stockResultante}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Inventario;
