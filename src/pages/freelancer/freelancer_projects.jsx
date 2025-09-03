import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/header';
import ProfileModal from '../../components/profilemodal';

const FreelancerProjects = () => {
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
                <section>
                    <h2 className="section-title">Meus Projetos</h2>
                    <div className="list-container">
                        <div className="card project-card">
                            <h3 className="card-title">Projeto de Otimização de SEO</h3>
                            <p className="card-description">Otimização de conteúdo e estrutura para ranqueamento em mecanismos de busca.</p>
                            <div className="card-meta">
                                <span>Status: Em Andamento</span>
                                <span>Prazo: 15/12/2025</span>
                            </div>
                            <button className="card-button">Ver Detalhes</button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default FreelancerProjects;