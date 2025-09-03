import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/header';
import ProfileModal from '../../components/profilemodal';
import perfilEmployer from '../../assets/imgs/perfil_employer.png';

const EmployerProfile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div>
            <Header userType="employer" username={user?.name} onProfileClick={() => setShowModal(true)} />
            <ProfileModal show={showModal} onClose={() => setShowModal(false)} userType="employer" username={user?.name} onLogout={handleLogout} />
            <main className="main-content">
                <section className="profile-section">
                    <h2 className="section-title">Meu Perfil</h2>
                    <div className="profile-card card">
                        <div className="profile-header">
                            <img src={perfilEmployer} alt="Ícone do Empregador" className="profile-photo-large" />
                            <div className="profile-info">
                                <h3 className="profile-name-large">{user?.name || 'Nome da Empresa'}</h3>
                                <p className="profile-tagline">Empresa de Tecnologia | Inovação e Soluções</p>
                                <p className="profile-location">São Paulo, Brasil</p>
                            </div>
                        </div>
                        <div className="profile-details">
                            <p className="profile-bio">
                                Aqui entra uma breve descrição sobre a empresa, sua missão, seus valores e o que ela busca em seus colaboradores e projetos.
                            </p>
                            <div className="profile-section-details">
                                <h4>Áreas de Contratação</h4>
                                <ul className="skills-list">
                                    <li>Desenvolvimento Web</li>
                                    <li>Design Gráfico</li>
                                    <li>Marketing Digital</li>
                                    <li>Consultoria de TI</li>
                                </ul>
                            </div>
                            <div className="profile-section-details">
                                <h4>Projetos Publicados</h4>
                                <div className="project-list">
                                    <div className="project-item">
                                        <h5>Desenvolvimento de Aplicativo Mobile</h5>
                                        <p>Criação da versão 1.0 do nosso aplicativo de serviços.</p>
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

export default EmployerProfile;