import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import '../estilos/AuthPage.css';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Login states
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    showPassword: false,
    rememberMe: false,
    error: '',
    isLoading: false
  });

  // Register states
  const [registerData, setRegisterData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
    error: '',
    success: '',
    isLoading: false
  });

  // Check URL to determine initial view
  useEffect(() => {
    if (location.pathname === '/registro') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location.pathname]);

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setLoginData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
    }
    sessionStorage.clear();
  }, []);

  // Toggle between login and register with animation
  const toggleAuthMode = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      // Clear errors when switching
      setLoginData(prev => ({ ...prev, error: '' }));
      setRegisterData(prev => ({ ...prev, error: '', success: '' }));
    }, 300);
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginData(prev => ({ ...prev, error: '', isLoading: true }));

    try {
      const response = await api.post('/api/usuarios/login', {
        correo: loginData.email,
        contrasena: loginData.password,
      });

      const user = response.data;
      sessionStorage.setItem('user', JSON.stringify(user));

      if (loginData.rememberMe) {
        localStorage.setItem('rememberedEmail', loginData.email);
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
      const errorMsg = err.response?.data?.message || 'Email o contrasena incorrectos';
      setLoginData(prev => ({ ...prev, error: errorMsg }));
    } finally {
      setLoginData(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterData(prev => ({ ...prev, error: '', success: '', isLoading: true }));

    // Validations
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterData(prev => ({ ...prev, error: 'Las contrasenas no coinciden', isLoading: false }));
      return;
    }

    if (registerData.password.length < 6) {
      setRegisterData(prev => ({ ...prev, error: 'La contrasena debe tener al menos 6 caracteres', isLoading: false }));
      return;
    }

    try {
      await api.post('/api/usuarios/registro', {
        nombre: registerData.nombre,
        apellido: registerData.apellido,
        correo: registerData.email,
        telefono: registerData.telefono,
        direccion: registerData.direccion,
        contrasena: registerData.password,
      });

      setRegisterData(prev => ({
        ...prev,
        success: 'Cuenta creada exitosamente!',
        isLoading: false
      }));

      // Switch to login after successful registration
      setTimeout(() => {
        setLoginData(prev => ({ ...prev, email: registerData.email }));
        toggleAuthMode();
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al crear la cuenta';
      setRegisterData(prev => ({ ...prev, error: errorMsg, isLoading: false }));
    }
  };

  return (
    <div className="auth-page">
      {/* Background Elements */}
      <div className="auth-bg-gradient"></div>
      <div className="auth-bg-pattern"></div>
      <div className="auth-decoration auth-decoration-1"></div>
      <div className="auth-decoration auth-decoration-2"></div>
      <div className="auth-decoration auth-decoration-3"></div>

      {/* Main Container */}
      <div className={`auth-container ${isLogin ? 'login-active' : 'register-active'}`}>

        {/* Overlay Panel */}
        <div className="auth-overlay-container">
          <div className="auth-overlay">
            {/* Panel izquierdo - Visible cuando register-active, lleva a LOGIN */}
            <div className="auth-overlay-panel auth-overlay-left">
              <div className="overlay-content">
                <div className="overlay-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                </div>
                <h2>Ya tienes cuenta?</h2>
                <p>Inicia sesion para acceder a tu cuenta y explorar nuestra exclusiva coleccion</p>
                <button className="overlay-btn" onClick={toggleAuthMode}>
                  <span>Iniciar Sesion</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                </button>
              </div>
            </div>
            {/* Panel derecho - Visible cuando login-active, lleva a REGISTRO */}
            <div className="auth-overlay-panel auth-overlay-right">
              <div className="overlay-content">
                <div className="overlay-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                </div>
                <h2>Nuevo Aqui?</h2>
                <p>Crea una cuenta y descubre el mundo de la relojeria de lujo</p>
                <button className="overlay-btn" onClick={toggleAuthMode}>
                  <span>Crear Cuenta</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Forms Container */}
        <div className="auth-forms-container">
          {/* Login Form */}
          <div className={`auth-form-wrapper login-form-wrapper ${isAnimating ? 'animating' : ''}`}>
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="form-header">
                <div className="form-logo">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                    <circle cx="12" cy="12" r="2"/>
                  </svg>
                </div>
                <h1>MORVIC</h1>
                <p>Iniciar Sesion</p>
              </div>

              <div className="form-group">
                <label>Correo Electronico</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="ejemplo@correo.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Contrasena</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type={loginData.showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Ingresa tu contrasena"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setLoginData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                  >
                    {loginData.showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={loginData.rememberMe}
                    onChange={(e) => setLoginData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                  />
                  <span className="checkmark"></span>
                  <span>Recordarme</span>
                </label>
                <a href="#" className="forgot-link">Olvidaste tu contrasena?</a>
              </div>

              {loginData.error && (
                <div className="form-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <span>{loginData.error}</span>
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={loginData.isLoading}>
                {loginData.isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Ingresando...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                      <polyline points="10 17 15 12 10 7"/>
                      <line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                    Iniciar Sesion
                  </>
                )}
              </button>

              <div className="form-footer mobile-only">
                <span>No tienes cuenta?</span>
                <button type="button" onClick={toggleAuthMode}>Registrate</button>
              </div>
            </form>
          </div>

          {/* Register Form */}
          <div className={`auth-form-wrapper register-form-wrapper ${isAnimating ? 'animating' : ''}`}>
            <form className="auth-form" onSubmit={handleRegister}>
              <div className="form-header">
                <div className="form-logo">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                    <circle cx="12" cy="12" r="2"/>
                  </svg>
                </div>
                <h1>MORVIC</h1>
                <p>Crear Cuenta</p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nombre</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input
                      type="text"
                      value={registerData.nombre}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Apellido</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input
                      type="text"
                      value={registerData.apellido}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, apellido: e.target.value }))}
                      placeholder="Tu apellido"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Correo Electronico</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="ejemplo@correo.com"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Telefono</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <input
                      type="tel"
                      value={registerData.telefono}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, telefono: e.target.value }))}
                      placeholder="999 999 999"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Direccion</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <input
                      type="text"
                      value={registerData.direccion}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, direccion: e.target.value }))}
                      placeholder="Tu direccion"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contrasena</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input
                      type={registerData.showPassword ? 'text' : 'password'}
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Min. 6 caracteres"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setRegisterData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                    >
                      {registerData.showPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirmar</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input
                      type={registerData.showConfirmPassword ? 'text' : 'password'}
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Repite contrasena"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setRegisterData(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                    >
                      {registerData.showConfirmPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {registerData.error && (
                <div className="form-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <span>{registerData.error}</span>
                </div>
              )}

              {registerData.success && (
                <div className="form-success">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <span>{registerData.success}</span>
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={registerData.isLoading}>
                {registerData.isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="8.5" cy="7" r="4"/>
                      <line x1="20" y1="8" x2="20" y2="14"/>
                      <line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                    Crear Cuenta
                  </>
                )}
              </button>

              <div className="form-footer mobile-only">
                <span>Ya tienes cuenta?</span>
                <button type="button" onClick={toggleAuthMode}>Inicia Sesion</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
