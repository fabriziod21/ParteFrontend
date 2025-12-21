import React, { useState, useEffect, useRef, useCallback } from 'react';
import CardCat from "../Componentes/CardCat";
import api from '../services/api';
import "../estilos/Catalogo.css";

// Componente del carrusel con inercia y snap en wheel
const ProductsCarousel = ({ children }) => {
  const carouselRef = useRef(null);
  const dragState = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    velX: 0,
    rafId: null
  });

  const CARD_WIDTH = 300; // Ancho de cada card
  const GAP = 24; // 1.5rem gap
  const CARDS_PER_SCROLL = 4; // Saltar de 4 en 4

  // Inercia suave para arrastre
  const momentum = useCallback(() => {
    const state = dragState.current;
    const el = carouselRef.current;
    if (!el || Math.abs(state.velX) < 0.5) {
      if (state.rafId) cancelAnimationFrame(state.rafId);
      return;
    }
    el.scrollLeft += state.velX;
    state.velX *= 0.95;
    state.rafId = requestAnimationFrame(momentum);
  }, []);

  const onMouseDown = (e) => {
    const el = carouselRef.current;
    if (!el) return;

    const state = dragState.current;
    if (state.rafId) cancelAnimationFrame(state.rafId);

    state.isDown = true;
    state.startX = e.pageX;
    state.scrollLeft = el.scrollLeft;
    state.velX = 0;
    el.style.cursor = 'grabbing';
  };

  const onMouseMove = (e) => {
    const state = dragState.current;
    const el = carouselRef.current;
    if (!state.isDown || !el) return;

    e.preventDefault();
    const x = e.pageX;
    const walk = state.startX - x;
    el.scrollLeft = state.scrollLeft + walk;
    state.velX = (state.startX - x) * 0.1;
    state.startX = x;
    state.scrollLeft = el.scrollLeft;
  };

  const onMouseUp = () => {
    const state = dragState.current;
    const el = carouselRef.current;
    if (!el) return;

    state.isDown = false;
    el.style.cursor = 'grab';

    if (Math.abs(state.velX) > 0.5) {
      state.velX *= 8;
      momentum();
    }
  };

  // Wheel: saltar de 4 en 4 cards con animación suave
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      const state = dragState.current;
      if (state.rafId) cancelAnimationFrame(state.rafId);

      const scrollAmount = (CARD_WIDTH + GAP) * CARDS_PER_SCROLL;
      const direction = e.deltaY > 0 ? 1 : -1;
      const targetScroll = el.scrollLeft + (scrollAmount * direction);

      // Animación suave para el scroll de 4 en 4
      const startScroll = el.scrollLeft;
      const distance = targetScroll - startScroll;
      const duration = 400;
      let startTime = null;

      const animateScroll = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        el.scrollLeft = startScroll + (distance * easeOut);

        if (progress < 1) {
          state.rafId = requestAnimationFrame(animateScroll);
        }
      };

      state.rafId = requestAnimationFrame(animateScroll);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div
      ref={carouselRef}
      className="products-carousel"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {children}
    </div>
  );
};

// Componente de Skeleton Card para loading
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-image shimmer"></div>
    <div className="skeleton-content">
      <div className="skeleton-title shimmer"></div>
      <div className="skeleton-supplier shimmer"></div>
      <div className="skeleton-description shimmer"></div>
      <div className="skeleton-description short shimmer"></div>
      <div className="skeleton-footer">
        <div className="skeleton-price shimmer"></div>
        <div className="skeleton-button shimmer"></div>
      </div>
    </div>
  </div>
);

// Componente de Skeleton Grid para loading
const SkeletonGrid = ({ count = 8 }) => (
  <div className="skeleton-container">
    <div className="skeleton-header">
      <div className="skeleton-category-title shimmer"></div>
      <div className="skeleton-divider"></div>
    </div>
    <div className="skeleton-grid">
      {[...Array(count)].map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  </div>
);

// Componente de sección de categoría con toggle de vista propio
const CategorySection = ({ categoria, products, quantities, onAddToCart }) => {
  const [viewMode, setViewMode] = useState('carousel');
  const [visibleCount, setVisibleCount] = useState(16);
  const ITEMS_PER_PAGE = 16;

  const displayedProducts = viewMode === 'grid' ? products.slice(0, visibleCount) : products;
  const hasMore = viewMode === 'grid' && visibleCount < products.length;

  const renderProduct = (product) => {
    const imagenesArray = product.imagenes || [];
    const imgSrc = imagenesArray.length > 0
      ? (imagenesArray[0]?.imagen?.url || imagenesArray[0]?.url || '')
      : '';
    const allImages = imagenesArray.map(img => img?.imagen?.url || img?.url || '').filter(Boolean);

    return (
      <CardCat
        key={product.idProducto}
        id={product.idProducto}
        title={product.nombre || 'Sin nombre'}
        price={product.precio || 0}
        imgSrc={allImages.length > 0 ? allImages : [imgSrc]}
        description={product.descripcion || ''}
        stock={`${product.stockActual || 0} unidades disponibles`}
        supplier={product.proveedor?.nombre || 'Sin proveedor'}
        onAddToCart={() => {
          const quantity = quantities[product.idProducto] || 1;
          onAddToCart({
            id: product.idProducto,
            title: product.nombre,
            price: product.precio,
            imgSrc: imgSrc,
            description: product.descripcion,
            stock: `${product.stockActual || 0} unidades disponibles`,
            supplier: product.proveedor?.nombre || 'Sin proveedor',
            quantity: quantity,
          });
        }}
      />
    );
  };

  return (
    <div className="category-section">
      <div className="category-header">
        <h2 className="category-title">{categoria.nombre}</h2>
        <div className="category-divider"></div>
        <span className="category-count">{products.length} productos</span>
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'carousel' ? 'active' : ''}`}
            onClick={() => { setViewMode('carousel'); setVisibleCount(ITEMS_PER_PAGE); }}
            title="Vista carrusel"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="6" height="12" rx="1"/>
              <rect x="9" y="6" width="6" height="12" rx="1"/>
              <rect x="16" y="6" width="6" height="12" rx="1"/>
            </svg>
          </button>
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => { setViewMode('grid'); setVisibleCount(ITEMS_PER_PAGE); }}
            title="Vista catálogo"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </button>
        </div>
      </div>

      {viewMode === 'carousel' ? (
        <ProductsCarousel>
          {displayedProducts.map(renderProduct)}
        </ProductsCarousel>
      ) : (
        <>
          <div className="products-grid">
            {displayedProducts.map(renderProduct)}
          </div>
          {hasMore && (
            <div className="load-more-container">
              <button
                className="load-more-btn"
                onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
              >
                Ver más ({products.length - visibleCount} restantes)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export function Catalogo({ onAddToCart }) {
  const [productos, setProductos] = useState([]);
  const [quantities] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState('default');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/api/producto/listar')
      .then(response => {
        setProductos(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error al obtener los productos", error);
        setLoading(false);
      });
  }, []);

  // Obtener proveedores únicos
  const proveedores = [...new Set(productos.map(p => p.proveedor?.nombre).filter(Boolean))];

  // Calcular rango de precios real
  const maxPrice = productos.length > 0 ? Math.max(...productos.map(p => p.precio || 0)) : 50000;
  const minPrice = productos.length > 0 ? Math.min(...productos.map(p => p.precio || 0)) : 0;

  // Estadísticas rápidas
  const totalStock = productos.reduce((acc, p) => acc + (p.stockActual || 0), 0);
  const inStockCount = productos.filter(p => (p.stockActual || 0) > 0).length;

  // Agrupar productos por categoría
  const categoriasAgrupadas = productos.reduce((acc, product) => {
    const categoriaId = product.categoria?.idCategoria || 'sin-categoria';
    const categoriaNombre = product.categoria?.nombre || 'Todos los Productos';

    if (!acc[categoriaId]) {
      acc[categoriaId] = {
        idCategoria: categoriaId,
        nombre: categoriaNombre,
        productos: []
      };
    }
    acc[categoriaId].productos.push(product);
    return acc;
  }, {});

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedSupplier(null);
    setOnlyInStock(false);
    setPriceRange([minPrice, maxPrice]);
    setSortBy('default');
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = searchTerm || selectedCategory || selectedSupplier || onlyInStock ||
    priceRange[0] > minPrice || priceRange[1] < maxPrice || sortBy !== 'default';

  // Filtrar y ordenar productos
  const getFilteredProducts = (productos) => {
    let filtered = productos.filter(product => {
      const nombre = product.nombre || '';
      const descripcion = product.descripcion || '';
      const matchesSearch = nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = product.precio >= priceRange[0] && product.precio <= priceRange[1];
      const matchesSupplier = !selectedSupplier || product.proveedor?.nombre === selectedSupplier;
      const matchesStock = !onlyInStock || (product.stockActual || 0) > 0;
      return matchesSearch && matchesPrice && matchesSupplier && matchesStock;
    });

    // Ordenar
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.precio - b.precio);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.precio - a.precio);
        break;
      case 'name':
        filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'stock':
        filtered.sort((a, b) => (b.stockActual || 0) - (a.stockActual || 0));
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredCategories = selectedCategory
    ? Object.values(categoriasAgrupadas).filter(categoria => categoria.idCategoria === selectedCategory)
    : Object.values(categoriasAgrupadas);

  const totalProducts = filteredCategories.reduce((acc, cat) => acc + getFilteredProducts(cat.productos).length, 0);

  return (
    <div className="catalogo-page">
      {/* Hero Section Mejorado */}
      <div className="catalogo-hero">
        <div className="hero-background">
          <div className="hero-pattern"></div>
          <div className="hero-glow"></div>
        </div>
        <div className="hero-content">
          <span className="hero-subtitle">Descubre nuestra exclusiva</span>
          <h1 className="hero-title">Colección de Relojes</h1>
          <p className="hero-description">
            Piezas únicas que combinan artesanía tradicional con diseño contemporáneo
          </p>
          {/* Estadísticas rápidas */}
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">{productos.length}</span>
              <span className="stat-label">Productos</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">{Object.keys(categoriasAgrupadas).length}</span>
              <span className="stat-label">Categorías</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">{inStockCount}</span>
              <span className="stat-label">En Stock</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">{proveedores.length}</span>
              <span className="stat-label">Marcas</span>
            </div>
          </div>
        </div>
        <div className="hero-decoration">
          <svg viewBox="0 0 100 100" className="watch-icon">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            {/* Marcas de hora */}
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const x1 = 50 + 38 * Math.cos(angle);
              const y1 = 50 + 38 * Math.sin(angle);
              const x2 = 50 + 42 * Math.cos(angle);
              const y2 = 50 + 42 * Math.sin(angle);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={i % 3 === 0 ? "2" : "1"}/>;
            })}
            <line x1="50" y1="50" x2="50" y2="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="50" y1="50" x2="68" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="50" y1="50" x2="50" y2="32" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
            <circle cx="50" cy="50" r="4" fill="currentColor"/>
            <circle cx="50" cy="50" r="2" fill="#0a0a0a"/>
          </svg>
        </div>
      </div>

      {/* Filters Section Mejorado */}
      <div className="catalogo-filters">
        <div className="filters-container">
          {/* Search */}
          <div className="filter-group search-group">
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar relojes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm('')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Toggle filtros avanzados */}
          <button
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>
            </svg>
            Filtros
            {hasActiveFilters && <span className="filter-badge"></span>}
          </button>

          {/* Sort */}
          <div className="filter-group sort-group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="default">Ordenar por</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="name">Nombre A-Z</option>
              <option value="stock">Mayor Stock</option>
            </select>
          </div>
        </div>

        {/* Filtros expandibles */}
        <div className={`filters-expanded ${showFilters ? 'show' : ''}`}>
          {/* Categories */}
          <div className="filter-section">
            <span className="filter-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <path d="M22 6l-10 7L2 6"/>
              </svg>
              Categorías
            </span>
            <div className="category-buttons">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
              >
                Todos
              </button>
              {Object.values(categoriasAgrupadas).map((categoria) => (
                <button
                  key={categoria.idCategoria}
                  onClick={() => setSelectedCategory(categoria.idCategoria)}
                  className={`category-btn ${selectedCategory === categoria.idCategoria ? 'active' : ''}`}
                >
                  {categoria.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Proveedores/Marcas */}
          <div className="filter-section">
            <span className="filter-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              Marcas
            </span>
            <div className="category-buttons">
              <button
                onClick={() => setSelectedSupplier(null)}
                className={`category-btn ${selectedSupplier === null ? 'active' : ''}`}
              >
                Todas
              </button>
              {proveedores.map((proveedor) => (
                <button
                  key={proveedor}
                  onClick={() => setSelectedSupplier(proveedor)}
                  className={`category-btn ${selectedSupplier === proveedor ? 'active' : ''}`}
                >
                  {proveedor}
                </button>
              ))}
            </div>
          </div>

          {/* Rango de precios */}
          <div className="filter-section price-section">
            <span className="filter-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
              Rango de Precio
            </span>
            <div className="price-range-container">
              <div className="price-inputs">
                <div className="price-input-group">
                  <span className="price-currency">S/.</span>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="price-input"
                    min={minPrice}
                    max={priceRange[1]}
                  />
                </div>
                <span className="price-separator">—</span>
                <div className="price-input-group">
                  <span className="price-currency">S/.</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="price-input"
                    min={priceRange[0]}
                    max={maxPrice}
                  />
                </div>
              </div>
              <div className="price-slider-container">
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="price-slider"
                />
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="price-slider"
                />
              </div>
            </div>
          </div>

          {/* Disponibilidad */}
          <div className="filter-section">
            <label className="stock-toggle">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
              />
              <span className="stock-toggle-slider"></span>
              <span className="stock-toggle-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Solo productos en stock
              </span>
            </label>
          </div>

          {/* Botón limpiar filtros */}
          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearAllFilters}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Results count + Active filters */}
        <div className="results-header">
          <span className="results-count">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            {totalProducts} productos encontrados
          </span>
          {hasActiveFilters && (
            <div className="active-filters">
              {searchTerm && (
                <span className="active-filter-tag">
                  "{searchTerm}"
                  <button onClick={() => setSearchTerm('')}>&times;</button>
                </span>
              )}
              {selectedCategory && (
                <span className="active-filter-tag">
                  {categoriasAgrupadas[selectedCategory]?.nombre}
                  <button onClick={() => setSelectedCategory(null)}>&times;</button>
                </span>
              )}
              {selectedSupplier && (
                <span className="active-filter-tag">
                  {selectedSupplier}
                  <button onClick={() => setSelectedSupplier(null)}>&times;</button>
                </span>
              )}
              {onlyInStock && (
                <span className="active-filter-tag">
                  En stock
                  <button onClick={() => setOnlyInStock(false)}>&times;</button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Products Content */}
      <div className="catalogo-content">
        {loading ? (
          <div className="loading-skeleton">
            <SkeletonGrid count={4} />
            <SkeletonGrid count={4} />
          </div>
        ) : (
          // Categorías con toggle de vista independiente
          filteredCategories.map((categoria) => {
            const filteredProducts = getFilteredProducts(categoria.productos);
            if (filteredProducts.length === 0) return null;

            return (
              <CategorySection
                key={categoria.idCategoria}
                categoria={categoria}
                products={filteredProducts}
                quantities={quantities}
                onAddToCart={onAddToCart}
              />
            );
          })
        )}

        {!loading && totalProducts === 0 && (
          <div className="no-results">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
              <path d="M8 8l6 6M14 8l-6 6"/>
            </svg>
            <h3>No se encontraron productos</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
}
