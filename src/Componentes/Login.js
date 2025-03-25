import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Elimina el sessionStorage al montar el componente
  useEffect(() => {
    sessionStorage.clear(); // Elimina todo el sessionStorage
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const loginData = {
      correo: email,
      contrasena: password,
    };
  
    try {
      const response = await axios.post('http://localhost:8080/api/usuarios/login', loginData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const user = response.data;
      // Guarda el usuario en sessionStorage
      sessionStorage.setItem('user', JSON.stringify(user));
      onLogin(user);
  
      // Redirige según el rol del usuario
      if (user.rol && user.rol.roles === "cliente") { // Asegúrate de que "rol" exista y se compare correctamente
        navigate('/homepage', { replace: true });
      } else {
        navigate('/adminhomepage/dashboard', { replace: true });
      }
    } catch (err) {
      // Manejo de errores, revisa si hay respuesta desde el backend
      const errorMsg =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Email o contraseña incorrectos';
      setError(errorMsg);
      console.error('Error al iniciar sesión:', err);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-500 transition duration-200"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
