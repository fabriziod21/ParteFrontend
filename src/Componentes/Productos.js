import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Package,
  Plus,
  Upload,
  Eye,
  ShoppingCart,
  Tag,
  DollarSign,
  Layers,
  FileText,
  Truck,
  BarChart3,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Edit3,
  Watch,
  Box,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Productos = ({ darkMode }) => {
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [nuevoProducto, setNuevoProducto] = useState({
    id: '',
    nombre: '',
    descripcion: '',
    precio: '',
    imagen: null,
    imagenFile: null,
    imagenExtra1: null,
    imagenFileExtra1: null,
    imagenExtra2: null,
    imagenFileExtra2: null,
    proveedor: '',
    stockMinimo: '',
    stockMaximo: '',
    stock: '',
    estado: 'activo',
    categorias: '',
  });

  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProductos = () => {
      api.get("/api/producto/listarPro")
        .then(response => {
          const productosMapeados = response.data.map(producto => ({
            id: producto.idProducto,
            nombre: producto.nombre || "Sin nombre",
            descripcion: producto.descripcion || "Sin descripcion",
            precio: producto.precio || 0,
            proveedor: producto.nombreProveedor || "Desconocido",
            categorias: producto.nombreCategoria || "Sin categoria",
            stock: producto.stockActual || 0,
            estado: producto.estado || "Desconocido",
          }));
          setProductos(productosMapeados);
        })
        .catch(error => console.error("Error al obtener productos:", error));
    };

    fetchProductos();
    const interval = setInterval(fetchProductos, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChangeStatus = (id) => {
    setProductos((prev) =>
      prev.map((producto) =>
        producto.id === id
          ? { ...producto, estado: producto.estado === 'Disponible' ? 'No Disponible' : 'Disponible' }
          : producto
      )
    );
  };

  useEffect(() => {
    api.get('/api/proveedor/listar')
      .then(response => setProveedores(response.data))
      .catch(error => console.error('Error al obtener proveedores:', error));

    api.get('/api/categoria/listar')
      .then(response => setCategorias(response.data))
      .catch(error => console.error('Error al obtener categorias:', error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setNuevoProducto((prev) => ({
        ...prev,
        imagen: imageUrl,
        imagenFile: file,
      }));
    }
  };

  const handleImageExtraChange1 = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setNuevoProducto((prev) => ({
        ...prev,
        imagenExtra1: imageUrl,
        imagenFileExtra1: file,
      }));
    }
  };

  const handleImageExtraChange2 = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setNuevoProducto((prev) => ({
        ...prev,
        imagenExtra2: imageUrl,
        imagenFileExtra2: file,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (
      nuevoProducto.nombre &&
      nuevoProducto.precio &&
      nuevoProducto.imagenFile &&
      nuevoProducto.proveedor &&
      nuevoProducto.categorias &&
      nuevoProducto.stock &&
      nuevoProducto.stockMinimo &&
      nuevoProducto.stockMaximo
    ) {
      setIsSubmitting(true);
      const productoAEnviar = {
        nombre: nuevoProducto.nombre,
        descripcion: nuevoProducto.descripcion || "Descripcion del producto",
        precio: parseFloat(nuevoProducto.precio),
        estado: "Disponible",
        stockMinimo: parseInt(nuevoProducto.stockMinimo),
        stockMaximo: parseInt(nuevoProducto.stockMaximo),
        stockActual: parseInt(nuevoProducto.stock),
        categoria: {
          idCategoria: categorias.find(categoria => categoria.nombre === nuevoProducto.categorias)?.idCategoria || 1,
        },
        proveedor: {
          idProveedor: proveedores.find(proveedor => proveedor.nombre === nuevoProducto.proveedor)?.idProveedor || 1,
        },
      };

      const formData = new FormData();
      formData.append('producto', JSON.stringify(productoAEnviar));

      if (nuevoProducto.imagenFile) {
        formData.append('imagenes', nuevoProducto.imagenFile);
      }
      if (nuevoProducto.imagenFileExtra1) {
        formData.append('imagenes', nuevoProducto.imagenFileExtra1);
      }
      if (nuevoProducto.imagenFileExtra2) {
        formData.append('imagenes', nuevoProducto.imagenFileExtra2);
      }

      console.log("Producto JSON:", JSON.stringify(productoAEnviar));
      console.log("Imagen:", nuevoProducto.imagenFile?.name);

      api.post("/api/producto/registrar", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
        .then(response => {
          const nuevoProductoConID = {
            id: response.data.idProducto || response.data.id,
            nombre: response.data.nombre || "Sin nombre",
            descripcion: response.data.descripcion || "Sin descripcion",
            precio: response.data.precio || 0,
            proveedor: response.data.proveedor?.nombre || nuevoProducto.proveedor || "Desconocido",
            categorias: response.data.categoria?.nombre || nuevoProducto.categorias || "Sin categoria",
            stock: response.data.stockActual || 0,
            estado: response.data.estado || "Disponible",
          };

          setProductos((prev) => [...prev, nuevoProductoConID]);

          setNuevoProducto({
            nombre: '',
            descripcion: '',
            precio: '',
            imagen: null,
            imagenFile: null,
            imagenExtra1: null,
            imagenFileExtra1: null,
            imagenExtra2: null,
            imagenFileExtra2: null,
            proveedor: '',
            stock: '',
            stockMinimo: '',
            stockMaximo: '',
            estado: 'activo',
            categorias: '',
          });

          setIsSubmitting(false);
        })
        .catch(error => {
          console.error("Error al registrar el producto:", error);
          console.error("Respuesta del servidor:", error.response?.data);
          setIsSubmitting(false);
        });
    }
  };

  // Filtered products
  const filteredProducts = productos.filter(item =>
    item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.proveedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categorias?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id?.toString().includes(searchTerm)
  );

  // Card styles
  const cardStyle = {
    background: darkMode
      ? 'linear-gradient(145deg, rgba(20, 20, 20, 0.9) 0%, rgba(15, 15, 15, 0.95) 100%)'
      : 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%)',
    border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.08)'}`,
    boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0,0,0,0.06)'
  };

  const inputStyle = {
    background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.1)'}`,
    color: darkMode ? '#ffffff' : '#1a1a1a'
  };

  // Product Preview Component - Similar to CardCat
  const ProductPreview = ({ producto }) => {
    return (
      <div
        className="rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
        style={{
          background: 'linear-gradient(145deg, rgba(20, 20, 20, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Image Container */}
        <div
          className="relative overflow-hidden"
          style={{ height: '200px', background: '#0a0a0a' }}
        >
          {producto.imagen ? (
            <img
              src={producto.imagen}
              alt="Producto"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <Watch size={48} style={{ color: 'rgba(212, 175, 55, 0.3)' }} />
              <span className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Sin imagen
              </span>
            </div>
          )}

          {/* Overlay */}
          <div
            className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 100%)' }}
          >
            <span
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{ background: 'rgba(212, 175, 55, 0.9)', color: '#0a0a0a' }}
            >
              <Eye size={16} />
              Vista previa
            </span>
          </div>

          {/* Badge */}
          <div
            className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(10, 10, 10, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}
          >
            <Watch size={18} style={{ color: '#d4af37' }} />
          </div>

          {/* Category Badge */}
          {producto.categorias && (
            <div
              className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: 'rgba(212, 175, 55, 0.9)',
                color: '#0a0a0a'
              }}
            >
              {producto.categorias}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Header */}
          <div className="mb-3">
            <h3
              className="text-lg font-semibold truncate"
              style={{ color: '#ffffff', fontFamily: "'Playfair Display', serif" }}
            >
              {producto.nombre || "Nombre del Producto"}
            </h3>
            {producto.proveedor && (
              <span
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: '#d4af37' }}
              >
                {producto.proveedor}
              </span>
            )}
          </div>

          {/* Description */}
          <p
            className="text-sm mb-4 line-clamp-2"
            style={{ color: 'rgba(255,255,255,0.6)', minHeight: '40px' }}
          >
            {producto.descripcion || "Descripcion del producto aqui..."}
          </p>

          {/* Footer */}
          <div
            className="flex items-center justify-between pt-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-baseline gap-1">
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>S/.</span>
              <span className="text-2xl font-bold" style={{ color: '#d4af37' }}>
                {producto.precio ? parseFloat(producto.precio).toFixed(2) : "0.00"}
              </span>
            </div>

            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: 'transparent',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                color: '#d4af37'
              }}
            >
              <ShoppingCart size={16} />
              Agregar
            </button>
          </div>

          {/* Stock info */}
          {producto.stock && (
            <div className="mt-3 flex items-center gap-2">
              <div
                className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min((producto.stock / (producto.stockMaximo || 100)) * 100, 100)}%`,
                    background: 'linear-gradient(90deg, #d4af37, #b8962e)'
                  }}
                />
              </div>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {producto.stock} uds
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const isActive = status === 'Disponible';
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
        style={{
          background: isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: isActive ? '#22c55e' : '#ef4444',
          border: `1px solid ${isActive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
        }}
      >
        {isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
        {status}
      </span>
    );
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
            <Package className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1
              className="text-2xl lg:text-3xl font-bold"
              style={{ color: darkMode ? '#ffffff' : '#1a1a1a', fontFamily: "'Playfair Display', serif" }}
            >
              Gestion de <span style={{ color: '#d4af37' }}>Productos</span>
            </h1>
            <p style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '14px' }}>
              Administra el catalogo de productos
            </p>
          </div>
        </div>
      </div>

      {/* Form and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Form Card */}
        <div className="lg:col-span-2 rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(212, 175, 55, 0.15)' }}
            >
              <Plus size={20} style={{ color: '#d4af37' }} />
            </div>
            <div>
              <h2
                className="text-lg font-semibold"
                style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}
              >
                Agregar Nuevo Producto
              </h2>
              <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Complete los campos para registrar un producto
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Nombre */}
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: '#d4af37' }}
                >
                  <Tag size={14} />
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={nuevoProducto.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                  style={inputStyle}
                  placeholder="Ej: Rolex Submariner"
                  required
                />
              </div>

              {/* Precio */}
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: '#d4af37' }}
                >
                  <DollarSign size={14} />
                  Precio (S/.)
                </label>
                <input
                  type="number"
                  name="precio"
                  value={nuevoProducto.precio}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                  style={inputStyle}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Descripcion */}
            <div className="mb-4">
              <label
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-2"
                style={{ color: '#d4af37' }}
              >
                <FileText size={14} />
                Descripcion
              </label>
              <textarea
                name="descripcion"
                value={nuevoProducto.descripcion}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all resize-none"
                style={{ ...inputStyle, minHeight: '80px' }}
                placeholder="Descripcion detallada del producto..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Proveedor */}
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: '#d4af37' }}
                >
                  <Truck size={14} />
                  Proveedor
                </label>
                <select
                  name="proveedor"
                  value={nuevoProducto.proveedor}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                  style={inputStyle}
                  required
                >
                  <option value="">Seleccione un proveedor</option>
                  {proveedores.map((proveedor) => (
                    <option key={proveedor.id} value={proveedor.nombre}>
                      {proveedor.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Categoria */}
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: '#d4af37' }}
                >
                  <Layers size={14} />
                  Categoria
                </label>
                <select
                  name="categorias"
                  value={nuevoProducto.categorias}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                  style={inputStyle}
                  required
                >
                  <option value="">Seleccione una categoria</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.nombre}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Stock */}
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: '#d4af37' }}
                >
                  <Box size={14} />
                  Stock Actual
                </label>
                <input
                  type="number"
                  name="stock"
                  value={nuevoProducto.stock}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                  style={inputStyle}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              {/* Stock Minimo */}
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: '#d4af37' }}
                >
                  <BarChart3 size={14} />
                  Stock Minimo
                </label>
                <input
                  type="number"
                  name="stockMinimo"
                  value={nuevoProducto.stockMinimo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                  style={inputStyle}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              {/* Stock Maximo */}
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: '#d4af37' }}
                >
                  <BarChart3 size={14} />
                  Stock Maximo
                </label>
                <input
                  type="number"
                  name="stockMaximo"
                  value={nuevoProducto.stockMaximo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                  style={inputStyle}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Images */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Imagen Principal */}
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: '#d4af37' }}
                >
                  <ImageIcon size={14} />
                  Imagen Principal
                </label>
                <div
                  className="relative rounded-xl overflow-hidden cursor-pointer group"
                  style={{
                    ...inputStyle,
                    height: '100px'
                  }}
                >
                  <input
                    type="file"
                    name="imagen"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    required
                  />
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    {nuevoProducto.imagen ? (
                      <img src={nuevoProducto.imagen} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload size={24} style={{ color: 'rgba(212, 175, 55, 0.5)' }} />
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          Subir imagen
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Imagen Extra 1 */}
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: 'rgba(212, 175, 55, 0.7)' }}
                >
                  <ImageIcon size={14} />
                  Imagen Extra 1
                </label>
                <div
                  className="relative rounded-xl overflow-hidden cursor-pointer"
                  style={{
                    ...inputStyle,
                    height: '100px'
                  }}
                >
                  <input
                    type="file"
                    name="imagenExtra1"
                    accept="image/*"
                    onChange={handleImageExtraChange1}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    {nuevoProducto.imagenExtra1 ? (
                      <img src={nuevoProducto.imagenExtra1} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload size={24} style={{ color: 'rgba(255,255,255,0.2)' }} />
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          Opcional
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Imagen Extra 2 */}
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: 'rgba(212, 175, 55, 0.7)' }}
                >
                  <ImageIcon size={14} />
                  Imagen Extra 2
                </label>
                <div
                  className="relative rounded-xl overflow-hidden cursor-pointer"
                  style={{
                    ...inputStyle,
                    height: '100px'
                  }}
                >
                  <input
                    type="file"
                    name="imagenExtra2"
                    accept="image/*"
                    onChange={handleImageExtraChange2}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    {nuevoProducto.imagenExtra2 ? (
                      <img src={nuevoProducto.imagenExtra2} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload size={24} style={{ color: 'rgba(255,255,255,0.2)' }} />
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          Opcional
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: isSubmitting
                  ? 'linear-gradient(135deg, #888 0%, #666 100%)'
                  : 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
                color: '#0a0a0a',
                boxShadow: isSubmitting ? 'none' : '0 8px 25px rgba(212, 175, 55, 0.3)'
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                  Registrando...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Registrar Producto
                </>
              )}
            </button>
          </form>
        </div>

        {/* Preview Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="rounded-2xl p-6" style={cardStyle}>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(212, 175, 55, 0.15)' }}
                >
                  <Eye size={20} style={{ color: '#d4af37' }} />
                </div>
                <div>
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}
                  >
                    Vista Previa
                  </h2>
                  <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                    Asi se vera en el catalogo
                  </p>
                </div>
              </div>

              <ProductPreview producto={nuevoProducto} />
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl p-6" style={cardStyle}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(212, 175, 55, 0.15)' }}
            >
              <Layers size={20} style={{ color: '#d4af37' }} />
            </div>
            <div>
              <h2
                className="text-lg font-semibold"
                style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}
              >
                Catalogo de Productos
              </h2>
              <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                {productos.length} productos registrados
              </p>
            </div>
          </div>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
            />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
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
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Producto</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Precio</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Proveedor</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Stock</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Estado</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Categoria</th>
                <th className="text-center py-4 px-4 text-xs font-semibold uppercase" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((producto, index) => (
                <tr
                  key={producto.id}
                  className="transition-all hover:bg-opacity-50"
                  style={{
                    borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                    background: index % 2 === 0 ? 'transparent' : (darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)')
                  }}
                >
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm" style={{ color: '#d4af37' }}>#{producto.id}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(212, 175, 55, 0.15)' }}
                      >
                        <Watch size={16} style={{ color: '#d4af37' }} />
                      </div>
                      <span className="font-medium" style={{ color: darkMode ? '#ffffff' : '#1a1a1a' }}>
                        {producto.nombre}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold" style={{ color: '#d4af37' }}>
                      S/.{parseFloat(producto.precio).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                      {producto.proveedor}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className="px-2 py-1 rounded-md text-sm font-medium"
                      style={{
                        background: producto.stock > 10 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: producto.stock > 10 ? '#22c55e' : '#f59e0b'
                      }}
                    >
                      {producto.stock}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={producto.estado} />
                  </td>
                  <td className="py-4 px-4">
                    <span style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                      {producto.categorias}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleChangeStatus(producto.id)}
                        className="p-2 rounded-lg transition-all hover:scale-105"
                        style={{
                          background: producto.estado === 'Disponible' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                          border: `1px solid ${producto.estado === 'Disponible' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                          color: producto.estado === 'Disponible' ? '#ef4444' : '#22c55e'
                        }}
                        title={producto.estado === 'Disponible' ? 'Desactivar' : 'Activar'}
                      >
                        {producto.estado === 'Disponible' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      </button>
                      <button
                        className="p-2 rounded-lg transition-all hover:scale-105"
                        style={{
                          background: 'rgba(212, 175, 55, 0.15)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          color: '#d4af37'
                        }}
                        title="Editar"
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} style={{ color: 'rgba(212, 175, 55, 0.3)', margin: '0 auto 16px' }} />
            <p style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
              No se encontraron productos
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredProducts.length > 0 && (
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
                de {filteredProducts.length} registros
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

              {Array.from({ length: Math.ceil(filteredProducts.length / itemsPerPage) }, (_, i) => i + 1)
                .filter(page => {
                  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
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
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredProducts.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(filteredProducts.length / itemsPerPage)}
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
    </div>
  );
};

export default Productos;
