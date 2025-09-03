import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';

const FreelancerJobs = () => {
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
                    <h2 className="section-title">Todos os Trabalhos Disponíveis</h2>
                    <div className="list-container">
                        <div className="card job-card">
                            <h3 className="card-title">Projeto de Design Gráfico</h3>
                            <p className="card-description">Criação de identidade visual para uma nova startup de tecnologia.</p>
                            <div className="card-meta">
                                <span>Categoria: Design</span>
                                <span>Orçamento: R$ 3.500</span>
                            </div>
                            <button className="card-button">Aplicar agora</button>
                        </div>
                         <div className="card job-card">
                            <h3 className="card-title">Desenvolvedor Front-end para E-commerce</h3>
                            <p className="card-description">Projeto de curta duração para otimização de performance e implementação de novas funcionalidades em loja virtual.</p>
                            <div className="card-meta">
                                <span>Categoria: Desenvolvimento Web</span>
                                <span>Orçamento: R$ 2.500 - 3.000</span>
                            </div>
                            <button className="card-button">Aplicar agora</button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default FreelancerJobs;