import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Importa o nosso hook!

import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';
import poltronaClaro from '../../assets/imgs/poltrona_claro.png';
import poltronaEscuro from '../../assets/imgs/poltrona_escuro.png';
import ThemeAwareImage from '../../components/ThemeAwareImage';

const FreelancerHome = () => {
  const { user, logout } = useAuth(); // Acede à informação do usuário e à função de logout
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Se não houver usuário, você pode redirecionar (descomente se quiser forçar o login)
  // useEffect(() => {
  //   if (!user) {
  //     navigate('/freelancer/login');
  //   }
  // }, [user, navigate]);

  return (
    <div>
      <Header
        userType="freelancer"
        username={user?.name}
        onProfileClick={() => setShowModal(true)}
      />
      <ProfileModal
        show={showModal}
        onClose={() => setShowModal(false)}
        userType="freelancer"
        username={user?.name}
        onLogout={handleLogout}
      />
      
          <main className="main-content">
          <section className="welcome-section">
            <div className="welcome-content">
              <h1 className="welcome-title">Bem-vindo(a), {user?.name || 'Freelancer'}!</h1>
              <p className="welcome-subtitle">Confira as últimas oportunidades de projetos que combinam com você.</p>
            </div>
            <div className="welcome-illustration">
              <div className="hero-illustration">
                <ThemeAwareImage darkSrc={poltronaEscuro} lightSrc={poltronaClaro} alt="Ilustração de oportunidades para freelancers" />
              </div>
            </div>
          </section>
        {/* ... resto do conteúdo da página ... */}
      </main>
    </div>
  );
};

export default FreelancerHome;