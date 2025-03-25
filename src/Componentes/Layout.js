// src/Componentes/Layout.js
import React from 'react';
import Sidebar2, { SidebarItem } from './Sidebar2'; // Importa el Sidebar
import { Grid, Box, BarChart2, Users } from 'lucide-react'; // Íconos
import { Outlet } from 'react-router-dom'; // Para renderizar las rutas anidadas

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar2>
        <SidebarItem icon={<Grid />} text="Dashboard" to="/" />
        <SidebarItem icon={<Box />} text="Productos" to="/productos" />
        <SidebarItem icon={<BarChart2 />} text="Inventario" to="/inventario" />
        <SidebarItem icon={<Users />} text="Clientes" to="/clientes" />
      </Sidebar2>

      <div className="flex-1 p-6 overflow-auto">
        {/* Aquí el Outlet renderizará las páginas correspondientes según la ruta */}
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
