import React from 'react';

const AdSidebar = () => {
  return (
    <aside className="ad-sidebar">
      <div className="ad-card">
        <h4>Anúncio</h4>
        <p>Conheça nossos serviços premium para aumentar suas chances de contratação.</p>
        <button className="ad-cta">Saiba mais</button>
      </div>

      <div className="ad-card small">
        <h5>Destaque</h5>
        <p>Coloque seu perfil em destaque por 7 dias.</p>
        <button className="ad-cta small">Ativar</button>
      </div>

      <div className="ad-card banner">
        <p className="banner-text">Promo: 50% OFF no primeiro mês!</p>
      </div>
    </aside>
  );
};

export default AdSidebar;
