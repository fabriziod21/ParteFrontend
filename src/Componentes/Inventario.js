import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import api from "../services/api";
import img from "../imagenes/cvv.jpeg";
import Swal from "sweetalert2";
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
  RefreshCw,
  Plus,
  X,
  Truck,
  ArrowDown,
  ArrowUp,
  Clock
} from "lucide-react";

function Inventario({ darkMode }) {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [cantidad, setCantidad] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cardStyle = {
    background: darkMode
      ? 'linear-gradient(145deg, rgba(20, 20, 20, 0.9) 0%, rgba(15, 15, 15, 0.95) 100%)'
      : 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%)',
    border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`,
    boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0,0,0,0.08)'
  };

  const textPrimary = darkMode ? '#ffffff' : '#1a1a1a';
  const textSecondary = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

  const fetchProductos = useCallback(() => {
    api.get("/api/producto/listar")
      .then((response) => {
        setProductos(response.data);
        if (!productoSeleccionado && response.data.length > 0) {
          setProductoSeleccionado(response.data[0]);
        } else if (productoSeleccionado) {
          const updated = response.data.find(p => p.idProducto === productoSeleccionado.idProducto);
          if (updated) setProductoSeleccionado(updated);
        }
      })
      .catch((error) => console.error("Error al obtener productos", error));
  }, [productoSeleccionado]);

  useEffect(() => {
    fetchProductos();
    api.get("/api/proveedor/listar")
      .then((response) => setProveedores(response.data))
      .catch((error) => console.error("Error al obtener proveedores", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (productoSeleccionado) {
      api.get(`/api/kardex/recuperar/${productoSeleccionado.idProducto}`)
        .then((response) => setMovimientos(response.data))
        .catch(() => setMovimientos([]));
    }
  }, [productoSeleccionado]);

  const manejarCambioProducto = (event) => {
    const productoElegido = productos.find((prod) => prod.nombre === event.target.value);
    setProductoSeleccionado(productoElegido);
    setMovimientos([]);
  };

  const handleAbastecimiento = async () => {
    if (!cantidad || parseInt(cantidad) <= 0) {
      Swal.fire("Error", "Ingresa una cantidad valida mayor a 0.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/kardex/entrada", {
        idProducto: productoSeleccionado.idProducto,
        cantidad: parseInt(cantidad),
        idProveedor: proveedorId ? parseInt(proveedorId) : null
      });

      Swal.fire("Exito", `Se registraron ${cantidad} unidades de entrada.`, "success");
      setShowModal(false);
      setCantidad("");
      setProveedorId("");

      // Recargar datos
      fetchProductos();
      const resp = await api.get(`/api/kardex/recuperar/${productoSeleccionado.idProducto}`);
      setMovimientos(resp.data);
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "No se pudo registrar la entrada.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const movimientosExistentes = movimientos.length > 0;
  const ultimoMovimiento = movimientosExistentes ? movimientos[movimientos.length - 1] : { stockResultante: 0 };
  const stockActual = ultimoMovimiento.stockResultante || 0;
  const stockMaximo = productoSeleccionado?.stockMaximo || 100;
  const stockMinimo = productoSeleccionado?.stockMinimo || 0;

  const porcentajeStock = Math.min(Math.round((stockActual / stockMaximo) * 100), 100);
  const stockExcedeLimiteMaximo = stockActual > stockMaximo;
  const stockBajoDelLimiteMinimo = stockActual < stockMinimo;

  const chartData = movimientos.map((mov) => ({
    fecha: mov.fechaMovimiento,
    stock: mov.stockResultante,
  }));

  const stockPromedio = movimientosExistentes
    ? Math.round(movimientos.reduce((acc, mov) => acc + mov.stockResultante, 0) / movimientos.length)
    : 0;

  const tendencia = movimientosExistentes && movimientos.length >= 2
    ? movimientos[movimientos.length - 1].stockResultante - movimientos[movimientos.length - 2].stockResultante
    : 0;

  const totalEntradas = movimientos.filter(m => m.tipoMovimiento === 'Entrada').length;
  const totalSalidas = movimientos.filter(m => m.tipoMovimiento === 'Salida').length;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'linear-gradient(145deg, rgba(20, 20, 20, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '8px' }}>{label}</p>
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

  const getStockStatus = () => {
    if (stockExcedeLimiteMaximo) return { color: '#ef4444', text: 'Exceso', icon: AlertTriangle };
    if (stockBajoDelLimiteMinimo) return { color: '#f59e0b', text: 'Bajo', icon: AlertTriangle };
    return { color: '#22c55e', text: 'Optimo', icon: CheckCircle };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: darkMode ? '#0a0a0a' : '#f5f5f5' }}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)' }}
          >
            <BarChart3 className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: textPrimary, fontFamily: "'Playfair Display', serif" }}>
              Control de <span style={{ color: '#d4af37' }}>Inventario</span>
            </h1>
            <p style={{ color: textSecondary, fontSize: '14px' }}>
              Monitorea y gestiona el stock de tus productos
            </p>
          </div>
        </div>
        {productoSeleccionado && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
              color: '#000',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
            }}
          >
            <Plus size={18} />
            Abastecer
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Izquierdo */}
        <div className="lg:col-span-1 space-y-6">
          {/* Selector de Producto */}
          <div className="rounded-2xl p-6" style={cardStyle}>
            <div className="flex items-center gap-3 mb-4">
              <Package size={20} style={{ color: '#d4af37' }} />
              <h3 className="font-semibold" style={{ color: textPrimary }}>Seleccionar Producto</h3>
            </div>
            <select
              value={productoSeleccionado?.nombre || ""}
              onChange={manejarCambioProducto}
              className="w-full p-3 rounded-xl font-medium transition-all focus:outline-none"
              style={{
                background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: textPrimary
              }}
            >
              {productos.map((prod) => (
                <option key={prod.idProducto} value={prod.nombre} style={{ background: '#1a1a1a', color: '#fff' }}>
                  {prod.nombre}
                </option>
              ))}
            </select>

            {productoSeleccionado && (
              <div
                className="mt-4 rounded-xl overflow-hidden flex items-center justify-center"
                style={{
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  background: darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
                  height: '180px'
                }}
              >
                <img
                  src={productoSeleccionado?.imagenes?.[0]?.imagen?.url || img}
                  alt={productoSeleccionado?.nombre}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </div>
            )}
          </div>

          {/* Estado del Stock */}
          <div className="rounded-2xl p-6" style={cardStyle}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: textPrimary }}>Estado del Stock</h3>
              <div
                className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                style={{ background: `${stockStatus.color}20`, color: stockStatus.color, border: `1px solid ${stockStatus.color}40` }}
              >
                <stockStatus.icon size={12} />
                {stockStatus.text}
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} strokeWidth="8" fill="none" />
                  <circle cx="64" cy="64" r="56" stroke={stockStatus.color} strokeWidth="8" fill="none" strokeLinecap="round"
                    strokeDasharray={`${(porcentajeStock / 100) * 352} 352`} style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold" style={{ color: textPrimary }}>{porcentajeStock}%</span>
                  <span className="text-xs" style={{ color: textSecondary }}>Capacidad</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Minimo', value: stockMinimo, color: '#f59e0b' },
                { label: 'Actual', value: stockActual, color: '#d4af37' },
                { label: 'Maximo', value: stockMaximo, color: '#22c55e' }
              ].map((item) => (
                <div key={item.label} className="text-center p-3 rounded-xl" style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                  <p className="text-xs mb-1" style={{ color: textSecondary }}>{item.label}</p>
                  <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel Derecho */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cards de Estadisticas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Boxes, iconColor: '#d4af37', value: stockActual, label: 'Stock Actual', badge: tendencia },
              { icon: TrendingUp, iconColor: '#22c55e', value: totalEntradas, label: 'Entradas' },
              { icon: TrendingDown, iconColor: '#ef4444', value: totalSalidas, label: 'Salidas' },
              { icon: RefreshCw, iconColor: '#8b5cf6', value: stockPromedio, label: 'Promedio' }
            ].map((stat, i) => (
              <div key={i} className="rounded-2xl p-5" style={cardStyle}>
                <div className="flex items-center justify-between mb-3">
                  <stat.icon size={20} style={{ color: stat.iconColor }} />
                  {stat.badge !== undefined && (
                    <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1" style={{
                      background: stat.badge >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: stat.badge >= 0 ? '#22c55e' : '#ef4444'
                    }}>
                      {stat.badge >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {Math.abs(stat.badge)}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold" style={{ color: textPrimary }}>{stat.value}</p>
                <p className="text-xs" style={{ color: textSecondary }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Grafica Principal */}
          <div className="rounded-2xl p-6" style={cardStyle}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: textPrimary }}>Historial de Stock</h3>
                <p className="text-sm" style={{ color: textSecondary }}>{productoSeleccionado?.nombre || 'Selecciona un producto'}</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#d4af37' }}></div>
                  <span style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5" style={{ background: '#ef4444' }}></div>
                  <span style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Max</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5" style={{ background: '#f59e0b' }}></div>
                  <span style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Min</span>
                </div>
              </div>
            </div>

            <div style={{ height: '300px' }}>
              {!movimientosExistentes ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <Boxes size={48} style={{ color: 'rgba(212, 175, 55, 0.3)', marginBottom: '16px' }} />
                  <p style={{ color: textSecondary }}>No hay movimientos registrados</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                    <XAxis dataKey="fecha" tick={{ fill: textSecondary, fontSize: 12 }} axisLine={{ stroke: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} tickLine={false} />
                    <YAxis tick={{ fill: textSecondary, fontSize: 12 }} axisLine={{ stroke: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={stockMaximo} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} />
                    <ReferenceLine y={stockMinimo} stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} />
                    <Area type="monotone" dataKey="stock" name="Stock" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorStock)"
                      dot={{ fill: '#d4af37', strokeWidth: 2, r: 4, stroke: darkMode ? '#0a0a0a' : '#ffffff' }}
                      activeDot={{ r: 6, stroke: '#d4af37', strokeWidth: 2, fill: darkMode ? '#0a0a0a' : '#ffffff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Timeline de Movimientos */}
          <div className="rounded-2xl p-6" style={cardStyle}>
            <h3 className="text-lg font-semibold mb-6" style={{ color: textPrimary }}>
              Kardex - Movimientos
            </h3>

            {!movimientosExistentes ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Clock size={40} style={{ color: 'rgba(212, 175, 55, 0.3)', marginBottom: '12px' }} />
                <p style={{ color: textSecondary }}>Sin movimientos registrados</p>
              </div>
            ) : (
              <div className="relative" style={{ paddingLeft: '40px' }}>
                {/* Linea vertical del timeline */}
                <div style={{
                  position: 'absolute',
                  left: '15px',
                  top: '0',
                  bottom: '0',
                  width: '2px',
                  background: darkMode ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0,0,0,0.1)'
                }} />

                {[...movimientos].reverse().map((mov, index) => {
                  const esEntrada = mov.tipoMovimiento === 'Entrada';
                  const color = esEntrada ? '#22c55e' : '#ef4444';
                  const IconMov = esEntrada ? ArrowDown : ArrowUp;

                  return (
                    <div key={index} className="relative mb-4" style={{ minHeight: '60px' }}>
                      {/* Nodo del timeline */}
                      <div style={{
                        position: 'absolute',
                        left: '-33px',
                        top: '4px',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: `${color}15`,
                        border: `2px solid ${color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <IconMov size={14} style={{ color }} />
                      </div>

                      {/* Contenido */}
                      <div
                        className="rounded-xl p-4 transition-all"
                        style={{
                          background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                        }}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-bold"
                              style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
                            >
                              {esEntrada ? 'ENTRADA' : 'SALIDA'}
                            </span>
                            <span className="text-sm font-semibold" style={{ color: textPrimary }}>
                              {esEntrada ? '+' : '-'}{mov.cantidad} unidades
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs" style={{ color: textSecondary }}>
                            <span>{mov.fechaMovimiento}</span>
                            {mov.horaMovimiento && <span>{mov.horaMovimiento}</span>}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Truck size={14} style={{ color: '#d4af37' }} />
                          <span className="text-sm" style={{ color: textSecondary }}>
                            Stock resultante: <span className="font-bold" style={{ color: '#d4af37' }}>{mov.stockResultante}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Abastecimiento */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="rounded-2xl p-6 w-full"
            style={{
              maxWidth: '450px',
              background: darkMode ? '#141414' : '#ffffff',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
                  <Plus size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: textPrimary }}>Abastecer Producto</h3>
                  <p className="text-xs" style={{ color: textSecondary }}>{productoSeleccionado?.nombre}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg transition-all" style={{ color: textSecondary }}>
                <X size={20} />
              </button>
            </div>

            {/* Info actual */}
            <div className="rounded-xl p-4 mb-5" style={{ background: darkMode ? 'rgba(212,175,55,0.05)' : 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs" style={{ color: textSecondary }}>Stock actual</p>
                  <p className="text-xl font-bold" style={{ color: '#d4af37' }}>{stockActual}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: textSecondary }}>Minimo</p>
                  <p className="text-xl font-bold" style={{ color: '#f59e0b' }}>{stockMinimo}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: textSecondary }}>Maximo</p>
                  <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{stockMaximo}</p>
                </div>
              </div>
            </div>

            {/* Campo cantidad */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>Cantidad a ingresar</label>
              <input
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="Ej: 50"
                className="w-full p-3 rounded-xl focus:outline-none transition-all"
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  color: textPrimary
                }}
              />
            </div>

            {/* Selector proveedor */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>Proveedor (opcional)</label>
              <select
                value={proveedorId}
                onChange={(e) => setProveedorId(e.target.value)}
                className="w-full p-3 rounded-xl focus:outline-none transition-all"
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  color: textPrimary
                }}
              >
                <option value="" style={{ background: '#1a1a1a', color: '#fff' }}>Seleccionar proveedor...</option>
                {proveedores.map((prov) => (
                  <option key={prov.idProveedor} value={prov.idProveedor} style={{ background: '#1a1a1a', color: '#fff' }}>
                    {prov.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl font-semibold transition-all"
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: textSecondary,
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleAbastecimiento}
                disabled={submitting || !cantidad}
                className="flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                  background: submitting ? 'rgba(34,197,94,0.5)' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#fff',
                  opacity: (!cantidad) ? 0.5 : 1
                }}
              >
                {submitting ? 'Registrando...' : 'Confirmar Entrada'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventario;
