import React from 'react';
import AdSidebar from '../components/AdSidebar.jsx';

const PricingCard = ({ title, price, features }) => (
  <div className="pricing-card">
    <h3>{title}</h3>
    <p className="price">{price}</p>
    <ul>
      {features.map((f, i) => <li key={i}>{f}</li>)}
    </ul>
    <button className="primary-btn">Escolher Plano</button>
  </div>
);

const PremiumPage = () => {
  const proFeatures = ['Perfil em destaque', 'Suporte via chat', 'Relatórios avançados', 'Mais candidaturas por mês'];

  return (
    <div className="premium-page">
      <main className="premium-main">
        <section className="hero">
          <h1>Assine o Plano Premium</h1>
          <p>Melhore sua visibilidade e aumente suas chances com recursos avançados.</p>
        </section>

        <section className="pricing-section">
          <PricingCard title="Pro" price="R$ 49,90/mês" features={proFeatures} />
          <div className="payment-card">
            <h3>Pagamento (visual apenas)</h3>
            <div className="fake-form">
              <label>Nome no cartão</label>
              <input placeholder="Nome completo" />
              <label>Número do cartão</label>
              <input placeholder="0000 0000 0000 0000" />
              <div className="two-cols">
                <div>
                  <label>Validade</label>
                  <input placeholder="MM/AA" />
                </div>
                <div>
                  <label>CVV</label>
                  <input placeholder="123" />
                </div>
              </div>
              <button className="primary-btn large">Pagar e Ativar (visual)</button>
            </div>
          </div>
        </section>
      </main>

      <AdSidebar />
    </div>
  );
};

export default PremiumPage;
