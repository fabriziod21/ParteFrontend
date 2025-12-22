import React, { useEffect } from 'react';
import AOS from 'aos';
import '../estilos/Historia.css';

const Historia = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const timeline = [
    {
      year: '2010',
      title: 'El Comienzo',
      description: 'MORVIC nace como un pequeno taller de relojeria en el corazon de Lima, con la vision de ofrecer relojes de calidad excepcional.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      )
    },
    {
      year: '2013',
      title: 'Primera Expansion',
      description: 'Abrimos nuestra primera tienda fisica en el centro comercial mas prestigioso de la ciudad, marcando el inicio de nuestra expansion.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      year: '2016',
      title: 'Alianzas Estrategicas',
      description: 'Establecemos alianzas con las marcas de relojes mas reconocidas a nivel mundial, convirtiéndonos en distribuidores autorizados.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    },
    {
      year: '2019',
      title: 'Era Digital',
      description: 'Lanzamos nuestra plataforma de e-commerce, permitiendo a clientes de todo el pais acceder a nuestra coleccion exclusiva.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      )
    },
    {
      year: '2023',
      title: 'Reconocimiento Nacional',
      description: 'Somos reconocidos como la mejor tienda de relojes de lujo del pais, con mas de 10,000 clientes satisfechos.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="8" r="7"/>
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
        </svg>
      )
    },
    {
      year: '2024',
      title: 'Hacia el Futuro',
      description: 'Continuamos innovando y expandiendonos, siempre manteniendo nuestro compromiso con la excelencia y la satisfaccion del cliente.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      )
    }
  ];

  const values = [
    {
      title: 'Excelencia',
      description: 'Nos esforzamos por ofrecer productos y servicios de la mas alta calidad.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )
    },
    {
      title: 'Confianza',
      description: 'Construimos relaciones duraderas basadas en la transparencia y honestidad.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      )
    },
    {
      title: 'Innovacion',
      description: 'Buscamos constantemente nuevas formas de mejorar la experiencia del cliente.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      )
    },
    {
      title: 'Pasion',
      description: 'Amamos lo que hacemos y eso se refleja en cada detalle de nuestro trabajo.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="historia-container">
      {/* Hero Section */}
      <section className="historia-hero">
        <div className="historia-hero-bg"></div>
        <div className="historia-hero-overlay"></div>
        <div className="historia-hero-content" data-aos="fade-up">
          <div className="historia-hero-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <h1 className="historia-hero-title">Nuestra Historia</h1>
          <p className="historia-hero-subtitle">
            Mas de una decada dedicados a la excelencia en relojeria de lujo
          </p>
        </div>
        <div className="historia-hero-scroll">
          <span>Descubre mas</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="historia-intro">
        <div className="historia-intro-content" data-aos="fade-up">
          <h2>El Legado de MORVIC</h2>
          <p>
            Desde nuestros humildes comienzos en 2010, MORVIC se ha convertido en sinonimo de
            elegancia, precision y exclusividad en el mundo de la relojeria. Nuestra pasion
            por los relojes de lujo nos ha llevado a construir una de las colecciones mas
            prestigiosas del pais, siempre manteniendo nuestro compromiso con la calidad
            y la satisfaccion del cliente.
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="historia-timeline">
        <h2 className="timeline-title" data-aos="fade-up">Nuestro Recorrido</h2>
        <div className="timeline-container">
          {timeline.map((item, index) => (
            <div
              key={index}
              className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
              data-aos={index % 2 === 0 ? 'fade-right' : 'fade-left'}
              data-aos-delay={index * 100}
            >
              <div className="timeline-content">
                <div className="timeline-icon">{item.icon}</div>
                <span className="timeline-year">{item.year}</span>
                <h3 className="timeline-item-title">{item.title}</h3>
                <p className="timeline-description">{item.description}</p>
              </div>
              <div className="timeline-dot"></div>
            </div>
          ))}
          <div className="timeline-line"></div>
        </div>
      </section>

      {/* Values Section */}
      <section className="historia-values">
        <h2 className="values-title" data-aos="fade-up">Nuestros Valores</h2>
        <p className="values-subtitle" data-aos="fade-up" data-aos-delay="100">
          Los pilares que guian cada decision que tomamos
        </p>
        <div className="values-grid">
          {values.map((value, index) => (
            <div
              key={index}
              className="value-card"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="value-icon">{value.icon}</div>
              <h3 className="value-title">{value.title}</h3>
              <p className="value-description">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="historia-stats">
        <div className="stats-grid">
          <div className="stat-item" data-aos="zoom-in" data-aos-delay="0">
            <span className="stat-number">14+</span>
            <span className="stat-label">Anos de Experiencia</span>
          </div>
          <div className="stat-item" data-aos="zoom-in" data-aos-delay="100">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Clientes Satisfechos</span>
          </div>
          <div className="stat-item" data-aos="zoom-in" data-aos-delay="200">
            <span className="stat-number">50+</span>
            <span className="stat-label">Marcas Premium</span>
          </div>
          <div className="stat-item" data-aos="zoom-in" data-aos-delay="300">
            <span className="stat-number">100%</span>
            <span className="stat-label">Autenticidad Garantizada</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="historia-cta" data-aos="fade-up">
        <h2>Se Parte de Nuestra Historia</h2>
        <p>Descubre nuestra coleccion exclusiva de relojes de lujo</p>
        <a href="/catalogo" className="cta-button">
          Ver Catalogo
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </section>
    </div>
  );
};

export default Historia;
