import React from 'react'

const categories = [
  'Front-end',
  'Back-end',
  'Fullstack',
  'Desenvolvimento Mobile',
  'E-commerce',
  'Website Corporativo',
  'APIs & Integrações',
  'Dados & Analytics',
]

export default function Services() {
  const handleCategoryClick = () => {
    const section = document.getElementById('servicos');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="servicos" className="services" aria-labelledby="servicos-title">
      <div className="container">
        <h2 id="servicos-title">🛠️ Serviços</h2>
        <p className="section-subtitle">
          Explore as categorias mais populares e encontre o profissional ideal para seu projeto.
        </p>

        <div className="services__grid">
          {categories.map((c) => (
            <button key={c} className="pill" type="button" aria-label={c} onClick={handleCategoryClick}>
              {c}
            </button>
          ))}
        </div>

        <div className="services__cta">
          <a href="#" className="btn btn--light"><span>📤 Enviar Projeto</span></a>
        </div>
      </div>
    </section>
  )
}
