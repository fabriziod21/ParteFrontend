import React, { useState } from 'react';
import '../estilos/Footer.css';

const Footer = ({ darkMode = false }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className={`luxury-footer ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Decorative top border */}
      <div className="footer-border"></div>

      <div className="footer-content">
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-section brand-section">
            <div className="brand-logo">
              <span className="brand-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
              </span>
              <h3 className="brand-name">
                <span className="gold">Mor</span>Vic
              </h3>
            </div>
            <p className="brand-description">
              En MorVic, combinamos elegancia y precisión. Nuestros relojes son diseñados para quienes valoran la artesanía y el tiempo.
            </p>
            <div className="social-icons">
              <span className="social-icon" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </span>
              <span className="social-icon" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="18" cy="6" r="1"/>
                </svg>
              </span>
              <span className="social-icon" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                </svg>
              </span>
              <span className="social-icon" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="section-title">Enlaces Rápidos</h4>
            <ul className="footer-links">
              <li><a href="/">Nuestra Colección</a></li>
              <li><a href="/">Historia</a></li>
              <li><a href="/">Atención al Cliente</a></li>
              <li><a href="/">Términos y Condiciones</a></li>
              <li><a href="/">Política de Privacidad</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4 className="section-title">Contacto</h4>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                </span>
                <span>+92 312 132 4083</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <span>contacto@morvic.com</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </span>
                <span>Lima, Perú</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="footer-section newsletter-section">
            <h4 className="section-title">Newsletter</h4>
            <p className="newsletter-text">
              Suscríbete para recibir novedades exclusivas y ofertas especiales.
            </p>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </form>
            {subscribed && (
              <p className="success-message">¡Gracias por suscribirte!</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="copyright">
            © {new Date().getFullYear()} <span className="gold">MorVic</span>. Todos los derechos reservados.
          </p>
          <div className="footer-bottom-links">
            <a href="/">Privacidad</a>
            <span className="separator">|</span>
            <a href="/">Términos</a>
            <span className="separator">|</span>
            <a href="/">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
