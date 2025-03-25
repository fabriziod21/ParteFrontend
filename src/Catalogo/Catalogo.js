import React, { useState, useRef, useEffect } from 'react';
import Slider from "react-slick";
import CardCat from "../Componentes/CardCat";
import axios from 'axios'; // Para hacer peticiones HTTP

export function Catalogo({ onAddToCart }) {
  const [productos, setProductos] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state
  const sliderRef = useRef(null);

  // Fetch products from the API
  useEffect(() => {
    setLoading(true); // Set loading to true when the request starts
    axios.get('http://localhost:8080/api/producto/listar')
      .then(response => {
        console.log(response.data);
        setProductos(response.data);
        setLoading(false); // Set loading to false when the request is complete
      })
      .catch(error => {
        console.error("Error al obtener los productos", error);
        setLoading(false); // Set loading to false if an error occurs
      });
  }, []); // This will run once when the component is mounted

  const handleQuantityChange = (id, quantity) => {
    setQuantities(prev => ({ ...prev, [id]: quantity }));
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    centerMode: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          centerMode: false,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          centerMode: false,
        }
      }
    ],
  };

  // Agrupar productos por categoría, asegurándonos de que el producto tenga un idCategoria válido
  const categoriasAgrupadas = productos.reduce((acc, product) => {
    if (product.categoria && product.categoria.idCategoria) { // Verificación adicional
      const categoriaId = product.categoria.idCategoria;
      if (!acc[categoriaId]) {
        acc[categoriaId] = { ...product.categoria, productos: [] };
      }
      acc[categoriaId].productos.push(product);
    }
    return acc;
  }, {});

  const filteredCategories = selectedCategory 
    ? Object.values(categoriasAgrupadas).filter(categoria => categoria.idCategoria === selectedCategory)
    : Object.values(categoriasAgrupadas);

  return (
    <div className="min-h-screen bg-fondo flex flex-col">
      <div className="flex flex-col items-center mb-8 bg-black p-6">
        <h2 className="text-xl font-bold text-white mb-4">Filtrar por Categoría:</h2>
        <div className="flex flex-wrap justify-center space-x-4">
          {Object.values(categoriasAgrupadas).map((categoria) => (
            <button
              key={categoria.idCategoria}
              onClick={() => setSelectedCategory(categoria.idCategoria)}
              className={`px-4 py-2 border rounded ${selectedCategory === categoria.idCategoria ? 'bg-white text-black' : 'bg-bgper text-white'} `}>
              {categoria.nombre}
            </button>
          ))}
          <button
            onClick={() => setSelectedCategory(null)}
            className="px-4 py-2 border rounded bg-green-600 hover:bg-green-300 text-white">
            Mostrar Todos
          </button>
        </div>
      </div>

      {/* Show a loading spinner or message while products are loading */}
      {loading ? (
        <div className="text-center text-white text-xl">Cargando productos...</div>
      ) : (
        filteredCategories.map((categoria) => (
          <div key={categoria.idCategoria} className="mb-24">
            <h2 className="text-2xl font-bold mb-4 text-white text-center">{categoria.nombre}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 p-4 "> 
              {categoria.productos.map((product) => {
                const imgSrc = product.imagenes.length > 0 ? product.imagenes[0].imagen.url : ''; // Toma la primera imagen

                return (
                  <CardCat
                    id={product.idProducto}
                    key={product.idProducto}
                    title={product.nombre}
                    price={product.precio} // Convert price to string with two decimal places
                    imgSrc={product.imagenes.map(imagen => imagen.imagen.url)} // Pasar la primera imagen como `imgSrc`
                    description={product.descripcion}
                    stock={`${product.stockActual} unidades disponibles`} // Convert stock to string
                    supplier={product.proveedor.nombre}
                    quantity={quantities[product.idProducto] || 1}
                    onQuantityChange={(quantity) => handleQuantityChange(product.idProducto, quantity)}
                    onAddToCart={() => {
                      const quantity = quantities[product.idProducto] || 1;
                      onAddToCart({
                        id: product.idProducto,
                        title: product.nombre,
                        price: product.precio,
                        imgSrc: imgSrc, // Pasar la imagen seleccionada
                        description: product.descripcion,
                        stock: `${product.stockActual} unidades disponibles`,
                        supplier: product.proveedor.nombre,
                        quantity: quantity, // Pasar la cantidad individualmente
                      });
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
