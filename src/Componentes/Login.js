import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiLogIn, FiWatch } from 'react-icons/fi';
import '../estilos/Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const loginData = {
      correo: email,
      contrasena: password,
    };

    try {
      const response = await api.post('/api/usuarios/login', loginData);

      const user = response.data;
      sessionStorage.setItem('user', JSON.stringify(user));

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      onLogin(user);

      if (user.rol && user.rol.roles === "cliente") {
        navigate('/homepage', { replace: true });
      } else {
        navigate('/adminhomepage/dashboard', { replace: true });
      }
    } catch (err) {
      const errorMsg =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Email o contrasena incorrectos';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="login-page">
      {/* Decorative Elements */}
      <div className="login-decoration login-decoration-1"></div>
      <div className="login-decoration login-decoration-2"></div>

      {/* Login Card */}
      <div className="login-card">
        {/* Brand Section */}
        <div className="login-brand">
          <div className="login-logo">
            <FiWatch />
          </div>
          <h1 className="login-brand-name">MORVIC</h1>
          <p className="login-brand-tagline">Relojes de Lujo</p>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="login-form-group">
            <label className="login-label">Correo Electronico</label>
            <div className="login-input-wrapper">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="login-input"
                required
              />
              <FiMail className="login-input-icon" />
            </div>
          </div>

          {/* Password Field */}
          <div className="login-form-group">
            <label className="login-label">Contrasena</label>
            <div className="login-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contrasena"
                className="login-input"
                required
                style={{ paddingRight: '3rem' }}
              />
              <FiLock className="login-input-icon" />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="login-remember">
            <label className="login-remember-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="login-checkbox-custom">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <span className="login-remember-label">Recordarme</span>
            </label>
            <Link to="/recuperar" className="login-forgot-link">
              Olvidaste tu contrasena?
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="login-error">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="login-spinner"></span>
                Ingresando...
              </>
            ) : (
              <>
                <FiLogIn />
                Iniciar Sesion
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="login-register">
          <span className="login-register-text">
            No tienes una cuenta?
            <Link to="/registro" className="login-register-link">
              Registrate
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
