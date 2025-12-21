import React from 'react';
import { Watch } from 'lucide-react';

const LoadingScreen = ({ darkMode = true, message = 'Cargando...' }) => {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: darkMode
          ? 'linear-gradient(135deg, #0a0a0a 0%, #141414 50%, #0a0a0a 100%)'
          : 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 50%, #f5f5f5 100%)'
      }}
    >
      <div className="text-center">
        {/* Logo animado */}
        <div className="relative mb-8">
          {/* Anillo exterior giratorio */}
          <div
            className="w-24 h-24 rounded-full mx-auto animate-spin"
            style={{
              background: 'conic-gradient(from 0deg, transparent, #d4af37, transparent)',
              animationDuration: '1.5s'
            }}
          />

          {/* Contenedor central */}
          <div
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: darkMode ? '#0a0a0a' : '#ffffff',
                boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)'
              }}
            >
              {/* Icono con pulso */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center animate-pulse"
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
                  boxShadow: '0 8px 25px rgba(212, 175, 55, 0.4)'
                }}
              >
                <Watch className="w-7 h-7 text-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Texto con animación */}
        <div className="space-y-3">
          <h2
            className="text-xl font-bold tracking-wide"
            style={{
              color: '#d4af37',
              fontFamily: "'Playfair Display', serif",
              textShadow: '0 2px 10px rgba(212, 175, 55, 0.3)'
            }}
          >
            MORVIC
          </h2>

          <p
            className="text-sm font-medium"
            style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
          >
            {message}
          </p>

          {/* Barra de progreso animada */}
          <div className="flex justify-center mt-4">
            <div
              className="w-32 h-1 rounded-full overflow-hidden"
              style={{ background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
            >
              <div
                className="h-full rounded-full animate-loading-bar"
                style={{
                  background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
                  width: '50%'
                }}
              />
            </div>
          </div>
        </div>

        {/* Estilos de animación */}
        <style>{`
          @keyframes loading-bar {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(200%);
            }
          }

          .animate-loading-bar {
            animation: loading-bar 1.2s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
};

export default LoadingScreen;
