import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';
import perfilFreelancer from '../../assets/imgs/perfil_freelancer.png';

const FreelancerProfile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div>
            <Header userType="freelancer" username={user?.name} onProfileClick={() => setShowModal(true)} />
            <ProfileModal show={showModal} onClose={() => setShowModal(false)} userType="freelancer" username={user?.name} onLogout={handleLogout} />

            <main className="main-content">
                <section className="profile-section">
                    <h2 className="section-title">Meu Perfil</h2>
                    <div className="profile-card card">
                        <div className="profile-header">
                            <img src={perfilFreelancer} alt="Foto grande do Freelancer" className="profile-photo-large"/>
                            <div className="profile-info">
                                <h3 className="profile-name-large">{user?.name || 'Nome do Freelancer'}</h3>
                                <p className="profile-tagline">Desenvolvedor Front-end | Especialista em UI/UX</p>
                                <p className="profile-location">São Paulo, Brasil</p>
                            </div>
                        </div>
                        <div className="profile-details">
                            <p className="profile-bio">
                                Um parágrafo curto sobre o freelancer, sua experiência e o que ele oferece. Este é o espaço para uma breve biografia ou um resumo profissional.
                            </p>
                            <div className="profile-section-details">
                                <h4>Habilidades</h4>
                                <ul className="skills-list">
                                    <li>HTML5</li>
                                    <li>CSS3</li>
                                    <li>JavaScript</li>
                                    <li>React</li>
                                    <li>Figma</li>
                                </ul>
                            </div>
                            <div className="profile-section-details">
                                <h4>Projetos Recentes</h4>
                                <div className="project-list">
                                    <div className="project-item">
                                        <h5>Landing Page de Produto</h5>
                                        <p>Criação de página de alta conversão para startup de tecnologia.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button className="card-button">Editar Perfil</button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default FreelancerProfile;