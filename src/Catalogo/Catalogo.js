import React, { useState, useEffect } from 'react';
import CardCat from "../Componentes/CardCat";
import api from '../services/api';
import "../estilos/Catalogo.css";

export function Catalogo({ onAddToCart }) {
  const [productos, setProductos] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('default');

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

  const handleQuantityChange = (id, quantity) => {
    setQuantities(prev => ({ ...prev, [id]: quantity }));
  };

  // Agrupar productos por categoría
  const categoriasAgrupadas = productos.reduce((acc, product) => {
    if (product.categoria && product.categoria.idCategoria) {
      const categoriaId = product.categoria.idCategoria;
      if (!acc[categoriaId]) {
        acc[categoriaId] = { ...product.categoria, productos: [] };
      }
      acc[categoriaId].productos.push(product);
    }
    return acc;
  }, {});

  // Filtrar y ordenar productos
  const getFilteredProducts = (productos) => {
    let filtered = productos.filter(product => {
      const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = product.precio >= priceRange[0] && product.precio <= priceRange[1];
      return matchesSearch && matchesPrice;
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
      {/* Hero Section */}
      <div className="catalogo-hero">
        <div className="hero-content">
          <span className="hero-subtitle">Descubre nuestra exclusiva</span>
          <h1 className="hero-title">Colección de Relojes</h1>
          <p className="hero-description">
            Piezas únicas que combinan artesanía tradicional con diseño contemporáneo
          </p>
        </div>
        <div className="hero-decoration">
          <svg viewBox="0 0 100 100" className="watch-icon">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1"/>
            <line x1="50" y1="50" x2="50" y2="20" stroke="currentColor" strokeWidth="2"/>
            <line x1="50" y1="50" x2="70" y2="50" stroke="currentColor" strokeWidth="2"/>
            <circle cx="50" cy="50" r="3" fill="currentColor"/>
          </svg>
        </div>
      </div>

      {/* Filters Section */}
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
            </div>
          </div>

          {/* Categories */}
          <div className="filter-group categories-group">
            <span className="filter-label">Categorías:</span>
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

          {/* Sort */}
          <div className="filter-group sort-group">
            <span className="filter-label">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="default">Por defecto</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="name">Nombre A-Z</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="results-count">
          <span>{totalProducts} productos encontrados</span>
        </div>
      </div>

      {/* Products Grid */}
      <div className="catalogo-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner">
              <svg viewBox="0 0 50 50" className="spinner">
                <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="3"/>
              </svg>
            </div>
            <p className="loading-text">Cargando colección...</p>
          </div>
        ) : (
          filteredCategories.map((categoria) => {
            const filteredProducts = getFilteredProducts(categoria.productos);
            if (filteredProducts.length === 0) return null;

            return (
              <div key={categoria.idCategoria} className="category-section">
                <div className="category-header">
                  <h2 className="category-title">{categoria.nombre}</h2>
                  <div className="category-divider"></div>
                  <span className="category-count">{filteredProducts.length} productos</span>
                </div>

                <div className="products-grid">
                  {filteredProducts.map((product) => {
                    const imgSrc = product.imagenes.length > 0 ? product.imagenes[0].imagen.url : '';

                    return (
                      <CardCat
                        id={product.idProducto}
                        key={product.idProducto}
                        title={product.nombre}
                        price={product.precio}
                        imgSrc={product.imagenes.map(imagen => imagen.imagen.url)}
                        description={product.descripcion}
                        stock={`${product.stockActual} unidades disponibles`}
                        supplier={product.proveedor.nombre}
                        quantity={quantities[product.idProducto] || 1}
                        onQuantityChange={(quantity) => handleQuantityChange(product.idProducto, quantity)}
                        onAddToCart={() => {
                          const quantity = quantities[product.idProducto] || 1;
                          onAddToCart({
                            id: product.idProducto,
                            title: product.nombre,
                            price: product.precio,
                            imgSrc: imgSrc,
                            description: product.descripcion,
                            stock: `${product.stockActual} unidades disponibles`,
                            supplier: product.proveedor.nombre,
                            quantity: quantity,
                          });
                        }}
                      />
                    );
                  })}
                </div>
              </div>
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
