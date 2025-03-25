import React, { useState, useEffect } from 'react'; // Añadir useEffect aquí

import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import axios from 'axios';
import io from "socket.io-client";
import { Edit, CheckCircle, Cancel } from '@mui/icons-material'; // Asegúrate de instalar el paquete de Material Icons

const socket = io("http://localhost:8080");

const Productos = ({ darkMode }) => {


  const [productos, setProductos] = useState([]);
  const [ultimoEnvio, setUltimoEnvio] = useState(null); // Para almacenar el tiempo del último envío
  const [nuevoProducto, setNuevoProducto] = useState({
    id: '',
    nombre: '',
    descripcion: '',
    precio: '',
    imagen: null,
    imagenFile: null, // Para la imagen principal
    imagenExtra1: null, // Imagen extra 1
    imagenFileExtra1: null, // Archivo de la imagen extra 1
    imagenExtra2: null, // Imagen extra 2
    imagenFileExtra2: null, // Archivo de la imagen extra 2
    proveedor: '',
    stockMinimo : '',
    stockMaximo: '',
    stock: '',
    estado: 'activo',
    categorias: '', // Asegúrate de que este campo esté en el objeto inicial
  });


  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  useEffect(() => {
    const fetchProductos = () => {
      axios.get("http://localhost:8080/api/producto/listarPro")
        .then(response => {
          const productosMapeados = response.data.map(producto => ({
            id: producto.idProducto,
            nombre: producto.nombre || "Sin nombre",
            descripcion: producto.descripcion || "Sin descripción",
            precio: producto.precio || 0,
            proveedor: producto.nombreProveedor || "Desconocido",
            categorias: producto.nombreCategoria || "Sin categoría",
            stock: producto.stockActual || 0,
            estado: producto.estado || "Desconocido",
          }));
          setProductos(productosMapeados);
        })
        .catch(error => console.error("Error al obtener productos:", error));
    };
  
    fetchProductos(); // Llamar una vez al inicio
  
    const interval = setInterval(fetchProductos, 5000); // 🔄 Actualiza cada 5 segundos
  
    return () => clearInterval(interval); // 🧹 Limpieza cuando el componente se desmonta
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

  // Traer datos de proveedores y categorías
  useEffect(() => {
    // Traer proveedores
    axios.get('http://localhost:8080/api/proveedor/listar')
      .then(response => {
        setProveedores(response.data);
      })
      .catch(error => {
        console.error('Error al obtener proveedores:', error);
      });

    // Traer categorías
    axios.get('http://localhost:8080/api/categoria/listar')
      .then(response => {
        setCategorias(response.data);
      })
      .catch(error => {
        console.error('Error al obtener categorías:', error);
      });
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
        imagen: imageUrl,  // Para la vista previa
        imagenFile: file,  // Guardar el archivo real para el backend
      }));
    }
  };

  const handleImageExtraChange1 = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setNuevoProducto((prev) => ({
        ...prev,
        imagenExtra1: imageUrl,  // Para la vista previa de la imagen extra 1
        imagenFileExtra1: file,  // Guardar el archivo real para el backend
      }));
    }
  };

  const handleImageExtraChange2 = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setNuevoProducto((prev) => ({
        ...prev,
        imagenExtra2: imageUrl,  // Para la vista previa de la imagen extra 2
        imagenFileExtra2: file,  // Guardar el archivo real para el backend
      }));
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Obtener la hora actual
    const horaActual = new Date().getTime();
  
    // Verificar que hayan pasado al menos 15 segundos desde el último envío
    if (ultimoEnvio && horaActual - ultimoEnvio < 15000) {
      alert("Debes esperar 15 segundos antes de registrar otro producto.");
      return; // Salir de la función si no han pasado 15 segundos
    }
  
    // Verificar que todos los campos requeridos estén presentes
    if (
      nuevoProducto.nombre &&
      nuevoProducto.precio &&
      nuevoProducto.imagenFile &&  // Asegurarse de que haya un archivo de imagen
      nuevoProducto.proveedor &&
      nuevoProducto.categorias &&
      nuevoProducto.stock &&
      nuevoProducto.stockMinimo &&
      nuevoProducto.stockMaximo
    ) {
      // Construir el objeto del producto que se enviará
      const productoAEnviar = {
        nombre: nuevoProducto.nombre,
        descripcion: nuevoProducto.descripcion || "Descripción del producto",
        precio: parseFloat(nuevoProducto.precio),
        estado: "Disponible", // Puedes modificar este campo si es necesario
        stockMinimo: nuevoProducto.stockMinimo, // O el valor que desees por defecto
        stockMaximo: nuevoProducto.stockMaximo, // O el valor que desees por defecto
        stockActual: parseInt(nuevoProducto.stock),
        categoria: {
          idCategoria: categorias.find(categoria => categoria.nombre === nuevoProducto.categorias)?.id || 1, // Obtiene el ID de la categoría
        },
        proveedor: {
          idProveedor: proveedores.find(proveedor => proveedor.nombre === nuevoProducto.proveedor)?.id || 1, // Obtiene el ID del proveedor
        },
      };
  
      // Crear FormData para enviar el archivo y los datos del producto
      const formData = new FormData();
      formData.append('producto', JSON.stringify(productoAEnviar)); // Agregar el producto como JSON
  
      // Agregar las imágenes al FormData
      if (nuevoProducto.imagenFile) {
        formData.append('imagenes', nuevoProducto.imagenFile); // Agregar el archivo de imagen principal
      }
      if (nuevoProducto.imagenFileExtra1) {
        formData.append('imagenes', nuevoProducto.imagenFileExtra1); // Agregar la imagen extra 1
      }
      if (nuevoProducto.imagenFileExtra2) {
        formData.append('imagenes', nuevoProducto.imagenFileExtra2); // Agregar la imagen extra 2
      }
  
      // Realizar la solicitud al backend
      axios.post("http://localhost:8080/api/producto/registrar", formData)
      .then(response => {
        const nuevoProductoConID = {
          ...response.data,
          id: response.data.idProducto || response.data.id, // Asegurar que tenga un ID único
        };
  
        setProductos((prev) => [...prev, nuevoProductoConID]);
  
        // Limpiar el formulario
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
          stockMinimo : '',
          stockMaximo: '',
          estado: 'activo',
          categorias: '',
        });
  
        // Actualizar la hora del último envío
        setUltimoEnvio(horaActual);
      })
      .catch(error => {
        console.error("Error al registrar el producto:", error);
      });
    }
  };


  const ProductPreview = ({ producto }) => {
    return (
      <div className="bg-[#000000] text-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-xl w-full sm:w-4/5 mx-auto max-w-md">
        <div className="relative">
          {producto.imagen ? (
            <img
              src={producto.imagen}
              alt="Producto"
              className="w-full h-40 object-cover"
            />
          ) : (
            <img
              src="https://via.placeholder.com/150"
              alt="Producto"
              className="w-full h-40 object-cover"
            />
          )}
        </div>
        <div className="p-4">
          <h2 className="text-lg font-semibold overflow-hidden text-ellipsis">
            {producto.nombre || "Nombre del Producto"}
          </h2>
          <p className="text-gray-400 mt-1 overflow-hidden text-ellipsis whitespace-normal max-h-64">
            {producto.descripcion || "Descripción del producto"}
          </p>
          <p className="text-xl font-bold mt-2 text-red-600">
            ${producto.precio ? `${producto.precio}` : "Precio"}
          </p>
        </div>
        <div className="flex justify-between p-4">
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded focus:outline-none transition"
          >
            Agregar al carrito
          </button>
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded focus:outline-none transition"
          >
            Info
          </button>
        </div>
      </div>
    );
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'nombre', headerName: 'Nombre', width: 200 },
    { field: 'precio', headerName: 'Precio', width: 100 },
    { field: 'proveedor', headerName: 'Proveedor', width: 180 },
    { field: 'stock', headerName: 'Stock', width: 100 },
    { field: 'estado', headerName: 'Estado', width: 130 },
    { field: 'categorias', headerName: 'Categoría', width: 200 },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 250,
      renderCell: (params) => (
        <div className="flex space-x-4">
          <Button
            variant="contained"
            color={params.row.estado === 'Disponible' ? 'error' : 'success'}
            startIcon={params.row.estado === 'Disponible' ? <Cancel /> : <CheckCircle />}
            onClick={() => handleChangeStatus(params.row.id)}
            size="small"
          >
            {params.row.estado === 'Disponible' ? 'Desactivar' : 'Activar'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Edit />}
            size="small"
          >
            Editar
          </Button>
        </div>
      ),
    },
  ];
  return (
    <div className={`p-6 shadow-md transition-colors duration-500 ${darkMode ? 'bg-fondo' : 'bg-gray-100'}`}>
      <div className="flex flex-col md:flex-row md:space-x-8 mb-6 space-y-4 md:space-y-0 items-center justify-center">
        <div className={`w-full md:w-1/2 p-4 rounded-lg shadow-md transition-colors duration-500 ${darkMode ? 'bg-bgper' : 'bg-white'} mt-9`}>
          <h1 className={`text-2xl font-semibold mb-10 transition-colors duration-500 ${darkMode ? 'text-white' : 'text-[#0087ff]'}`}>Apartado de Productos</h1>
          <h2 className={`text-xl font-semibold mb-4 transition-colors duration-500 ${darkMode ? 'text-yellow-300' : 'text-black'}`}>Añadir</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div className="flex flex-col">
                <label htmlFor="nombre" className={`mb-1 font-medium transition-colors duration-500 ${darkMode ? 'text-white' : 'text-black'} font-kanit`}>Nombre del Producto</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={nuevoProducto.nombre}
                  onChange={handleChange}
                  className={`border transition-colors duration-500 ${darkMode ? 'bg-[#2A2A2A] border-gray-300 text-white' : 'bg-white border-black text-black'}  p-1 focus:outline-none focus:ring-2 focus:ring-gray-500`}
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="precio" className={`mb-1 font-medium transition-colors duration-500 ${darkMode ? 'text-gray-200' : 'text-black'} font-kanit`}>Precio</label>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  value={nuevoProducto.precio}
                  onChange={handleChange}
                  className={`border  transition-colors duration-500 ${darkMode ? 'bg-[#2A2A2A] border-gray-300 text-white' : 'bg-white border-black text-black'}  p-1 focus:outline-none focus:ring-2 focus:ring-gray-500`}
                  required
                  min="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div className="flex flex-col">
                <label htmlFor="descripcion" className={`mb-1 font-medium  transition-colors duration-500${darkMode ? 'text-gray-200' : 'text-black'} font-kanit`}>Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={nuevoProducto.descripcion}
                  onChange={handleChange}
                  className={`border transition-colors duration-500 ${darkMode ? 'bg-[#2A2A2A] border-gray-300 text-white' : 'bg-white border-black text-black'}  p-1 focus:outline-none focus:ring-2 focus:ring-gray-500`}
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="proveedor" className={`mb-1 font-medium transition-colors duration-500 ${darkMode ? 'text-gray-200' : 'text-black'} font-kanit`}>Proveedor</label>
                <select
                  id="proveedor"
                  name="proveedor"
                  value={nuevoProducto.proveedor}
                  onChange={handleChange}
                  className={`border transition-colors duration-500 ${darkMode ? 'bg-[#2A2A2A] border-gray-300 text-white' : 'bg-white border-black text-black'}  p-1 focus:outline-none focus:ring-2 focus:ring-gray-500`}
                  required
                >
                  <option value="" className="font-kanit">Seleccione un proveedor</option>
                  {proveedores.map((proveedor) => (
                    <option key={proveedor.id} value={proveedor.nombre}>
                      {proveedor.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div className="flex flex-col">
                <label htmlFor="categorias" className={`mb-1 font-medium transition-colors duration-500 ${darkMode ? 'text-gray-200' : 'text-black'} font-kanit`}>Categoría</label>
                <select
                  id="categorias"
                  name="categorias"
                  value={nuevoProducto.categorias}
                  onChange={handleChange}
                  className={`border transition-colors duration-500 ${darkMode ? 'bg-[#2A2A2A] border-gray-300 text-white' : 'bg-white border-black text-black'}  p-1 focus:outline-none focus:ring-2 focus:ring-gray-500`}
                  required
                >
                  <option value="" className="font-kanit">Seleccione la categoría</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.nombre}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label htmlFor="estado" className={`mb-1 font-medium  transition-colors duration-500 ${darkMode ? 'text-gray-200' : 'text-black'} font-kanit`}>Estado</label>
                <select
                  id="estado"
                  name="estado"
                  value={nuevoProducto.estado}
                  onChange={handleChange}
                  className={`border transition-colors duration-500 ${darkMode ? 'bg-[#2A2A2A] border-gray-300 text-white' : 'bg-white border-black text-black'}  p-1 focus:outline-none focus:ring-2 focus:ring-gray-500`}
                  required
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="flex flex-col">
                <label htmlFor="stock" className={`mb-1 font-medium transition-colors duration-500 ${darkMode ? 'text-gray-200' : 'text-black'} font-kanit`}>Stock</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={nuevoProducto.stock}
                  onChange={handleChange}
                  className={`border transition-colors duration-500 ${darkMode ? 'bg-[#2A2A2A] border-gray-300 text-white' : 'bg-white border-black text-black'}  p-1 focus:outline-none focus:ring-2 focus:ring-gray-500`}
                  required
                  min="0"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="stockMinimo" className={`mb-1 font-medium transition-colors duration-500 ${darkMode ? 'text-gray-200' : 'text-black'} font-kanit`}>Stock Mínimo</label>
                <input
                  type="number"
                  id="stockMinimo"
                  name="stockMinimo"
                  value={nuevoProducto.stockMinimo}
                  onChange={handleChange}
                  className={`border transition-colors duration-500 ${darkMode ? 'bg-[#2A2A2A] border-gray-300 text-white' : 'bg-white border-black text-black'}  p-1 focus:outline-none focus:ring-2 focus:ring-gray-500`}
                  required
                  min="0"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="stockMaximo" className={`mb-1 font-medium transition-colors duration-500 ${darkMode ? 'text-gray-200' : 'text-black'} font-kanit`}>Stock Máximo</label>
                <input
                  type="number"
                  id="stockMaximo"
                  name="stockMaximo"
                  value={nuevoProducto.stockMaximo}
                  onChange={handleChange}
                  className={`border transition-colors duration-500 ${darkMode ? 'bg-[#2A2A2A] border-gray-300 text-white' : 'bg-white border-black text-black'}  p-1 focus:outline-none focus:ring-2 focus:ring-gray-500`}
                  required
                  min="0"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="imagen" className={`mb-1 font-medium transition-colors duration-500 ${darkMode ? 'text-gray-200' : 'text-black'} font-kanit`}>Imagen del Producto</label>
                <input
                  type="file"
                  id="imagen"
                  name="imagen"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={`border transition-colors duration-500 ${darkMode ? 'bg-[#2A2A2A] border-gray-300 text-white' : 'bg-white border-black text-black'}  p-1 focus:outline-none focus:ring-2 focus:ring-gray-500`}
                  required
                />
              </div>
              {/* Imagen Extra 1 */}
              <div className="flex flex-col">
                <label htmlFor="imagenExtra1" className={`mb-1 font-medium transition-colors duration-500 ${darkMode ? 'text-gray-200' : 'text-black'} font-kanit`}>Imagen Extra 1</label>
                <input
                  type="file"
                  id="imagenExtra1"
                  name="imagenExtra1"
                  accept="image/*"
                  onChange={handleImageExtraChange1}
                  className={`border transition-colors duration-500 ${darkMode ? 'bg-[#2A2A2A] border-gray-300 text-white' : 'bg-white border-black text-black'}  p-1 focus:outline-none focus:ring-2 focus:ring-gray-500`}
                />
              </div>
  
              {/* Imagen Extra 2 */}
              <div className="flex flex-col">
                <label htmlFor="imagenExtra2" className={`mb-1 font-medium transition-colors duration-500 ${darkMode ? 'text-gray-200' : 'text-black'} font-kanit`}>Imagen Extra 2</label>
                <input
                  type="file"
                  id="imagenExtra2"
                  name="imagenExtra2"
                  accept="image/*"
                  onChange={handleImageExtraChange2}
                  className={`border transition-colors duration-500 ${darkMode ? 'bg-[#2A2A2A] border-gray-300 text-white' : 'bg-white border-black text-black'}  p-1 focus:outline-none focus:ring-2 focus:ring-gray-500`}
                />
              </div>
            </div>
            <button
              type="submit"
              className={`flex items-center transition-colors duration-500 ${darkMode ? 'bg-[#FACD15] text-black' : '  bg-[#00f0ff] text-black'} px-4 py-2 font-kanit`}
            >
              <svg
                className="w-5 h-5 mr-2 transition-colors duration-500" 
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
               <circle cx="12" cy="12" r="10" fill={darkMode ? 'transition-colors duration-500 #FACD15' : ' transition-colors duration-500 #00f0ff'} />
                <line x1="12" y1="8" x2="12" y2="16" stroke="#000" strokeWidth={2} />
                <line x1="8" y1="12" x2="16" y2="12" stroke="#000" strokeWidth={2} />
              </svg>
              Agregar Producto
            </button>
          </form>
        </div>
        <div className="w-full md:w-1/3 lg:w-1/4 md:mt-0">
          <div className="mt-4 md:mt-0 bg-gradient-to-br rounded-3xl border border-gray-300 shadow-xl p-4 md:p-6 w-full">
            <h2 className="text-2xl font-bold mb-4 text-center text-white font-teko">
              Vista Previa
            </h2>
            <ProductPreview producto={nuevoProducto} />
          </div>
        </div>
      </div>
      <div className='flex justify-center w-full py-6'>
        <div className='w-full md:w-4/5 bg-center'>
          <div style={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={productos}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              disableSelectionOnClick
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#FFFFFF', // Color de fondo del encabezado
                  color: '#000000', // Color del texto del encabezado
                  fontWeight: 'bold', // Peso de la fuente
                },
                // Personalización de las celdas
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid rgba(224, 224, 224, 1)', // Color del borde de las celdas
                  color: '#FFFFFF', // Color del texto de las celdas
                  background: '#000000',
                },
                // Personalización del pie de página
                '& .MuiDataGrid-footerContainer': {
                  backgroundColor: '#FFFFFF', // Color de fondo del pie de página
                  color: '#000000', // Color del texto del pie de página
                },
                // Personalización de los botones del pie de página
                '& .MuiPagination-ul': {
                  backgroundColor: '#000000', // Color de fondo de la paginación
                  color: '#FFFFFF', // Color del texto de la paginación
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
  
};
export default Productos;
