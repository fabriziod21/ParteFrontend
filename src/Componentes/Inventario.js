import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import img from "../imagenes/cvv.jpeg"; // Imagen por defecto en caso de no tener la imagen del producto

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Inventario() {
  const [productos, setProductos] = useState([]); // Productos disponibles
  const [productoSeleccionado, setProductoSeleccionado] = useState(null); // Producto seleccionado
  const [movimientos, setMovimientos] = useState([]); // Movimientos del producto seleccionado

  // Cargar productos desde la API
  useEffect(() => {
    console.log("Buscando productos...");
    axios
      .get("http://localhost:8080/api/producto/listar")
      .then((response) => {
        console.log("Productos cargados:", response.data);
        setProductos(response.data);
        // Selecciona el primer producto si hay productos disponibles
        if (response.data.length > 0) {
          setProductoSeleccionado(response.data[0]);
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los productos", error);
      });
  }, []);

  // Cargar movimientos de un producto seleccionado solo cuando se elija un producto
  useEffect(() => {
    if (productoSeleccionado) {
      console.log(`Buscando movimientos para el producto: ${productoSeleccionado.nombre}`);
      axios
        .get(`http://localhost:8080/api/kardex/recuperar/${productoSeleccionado.idProducto}`)
        .then((response) => {
          console.log(`Movimientos para ${productoSeleccionado.nombre} cargados:`, response.data);
          setMovimientos(response.data); // Actualiza los movimientos con la respuesta de la API
        })
        .catch((error) => {
          console.error("Hubo un error al obtener los movimientos", error);
        });
    }
  }, [productoSeleccionado]); // Este efecto se ejecutará cuando se cambie el producto seleccionado

  // Manejo del cambio de producto seleccionado
  const manejarCambioProducto = (event) => {
    const productoElegido = productos.find((prod) => prod.nombre === event.target.value);
    setProductoSeleccionado(productoElegido);
    setMovimientos([]); // Limpiamos los movimientos cuando cambiamos de producto
  };

  // Verifica si los movimientos existen antes de acceder a la longitud
  const movimientosExistentes = movimientos.length > 0;

  // Lógica para cambiar el color de la línea dependiendo de si el stock es bajo o alto
  const ultimoMovimiento = movimientosExistentes ? movimientos[movimientos.length - 1] : { stockResultante: 0 };
  const stockExcedeLimiteMaximo = ultimoMovimiento.stockResultante > productoSeleccionado?.stockMaximo;
  const stockBajoDelLimiteMinimo = ultimoMovimiento.stockResultante < productoSeleccionado?.stockMinimo;

  // Datos para el gráfico solo si hay movimientos
  const data = movimientosExistentes ? {
    labels: movimientos?.map((mov) => mov.fechaMovimiento) || [], // Fechas de los movimientos
    datasets: [
      {
        label: "Stock Actual",
        data: movimientos?.map((mov) => mov.stockResultante) || [ultimoMovimiento.stockResultante], // Stock resultante después de cada movimiento
        borderColor: stockExcedeLimiteMaximo ? "#F44336" : stockBajoDelLimiteMinimo ? "#FFEB3B" : "#4CAF50",
        backgroundColor: stockExcedeLimiteMaximo ? "rgba(244, 67, 54, 0.2)" : stockBajoDelLimiteMinimo ? "rgba(255, 235, 59, 0.2)" : "rgba(76, 175, 80, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: stockExcedeLimiteMaximo ? "#F44336" : stockBajoDelLimiteMinimo ? "#FFEB3B" : "#4CAF50",
      },
      ...(productoSeleccionado?.stockMinimo && movimientosExistentes ? [
        {
          label: "Límite Mínimo",
          data: movimientos?.map(() => productoSeleccionado?.stockMinimo) || [],
          borderColor: "#FF9800",
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointRadius: 0,
        },
      ] : []),
      ...(productoSeleccionado?.stockMaximo && movimientosExistentes ? [
        {
          label: "Límite Máximo",
          data: movimientos?.map(() => productoSeleccionado?.stockMaximo) || [],
          borderColor: "#F44336",
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointRadius: 0,
        },
      ] : []),
    ],
  } : null; // Si no hay movimientos, no se generan datos para la gráfica

  const options = {
    responsive: true,
    animation: {
      duration: 0,
      easing: "easeInOutQuad",
    },
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `Estado de Inventario de ${productoSeleccionado?.nombre}`,
        font: {
          size: 18,
          weight: "bold",
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (tooltipItem) => {
            return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
          },
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="inventario bg-fondo text-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-5 md:p-16 gap-6">
      {/* Columna 1: Información del Producto y Agregar/Quitar Stock */}
      <div className="flex flex-col bg-bgper p-6 rounded-lg shadow-xl">
        <h1 className="text-2xl font-semibold mb-4">Inventario de {productoSeleccionado?.nombre}</h1>
        <label htmlFor="productos" className="mb-2 text-lg font-medium">
          Selecciona un producto:
        </label>
        <select
          id="productos"
          value={productoSeleccionado?.nombre || ""}
          onChange={manejarCambioProducto}
          className="mb-6 p-3 bg-zinc-700 text-white rounded-md w-full"
        >
          {productos.map((prod) => (
            <option key={prod.nombre} value={prod.nombre}>
              {prod.nombre}
            </option>
          ))}
        </select>

        <h3 className="text-xl font-semibold mb-2">Resumen de Movimientos</h3>
        <p>Límite Máximo: {productoSeleccionado?.stockMaximo}</p>
        <p>Stock Actual: {ultimoMovimiento.stockResultante}</p>
        <p className="mb-6">Límite Mínimo: {productoSeleccionado?.stockMinimo}</p>
       

        <div className="flex justify-center items-center mb-4 ">
          <img
            src={productoSeleccionado?.imagenes[0]?.imagen?.url || img}
            alt={`Imagen de ${productoSeleccionado?.nombre}`}
            className="w-full h-72 rounded-xl"
          />
        </div>

        {/* Aquí agregarías los botones para agregar o quitar stock */}
      </div>

      {/* Columna 2: Gráfico de Inventario */}
      <div className="flex justify-center items-center bg-bgper rounded-lg shadow-xl p-6 lg:col-span-2">
        {!movimientosExistentes ? (
          <p>No hay movimientos registrados para este producto.</p>
        ) : (
          <Line data={data} options={options} />
        )}
      </div>
    </div>
  );
}

export default Inventario;
