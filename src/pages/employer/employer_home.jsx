import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';

const EmployerHome = () => {
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
                <section className="welcome-section">
                    <h1 className="welcome-title">Bem-vindo(a), {user?.name || 'Empregador'}!</h1>
                    <p className="welcome-subtitle">Gerencie seus projetos e encontre os melhores talentos.</p>
                </section>
                <section>
                    <h2 className="section-title">Meus Contratos Ativos</h2>
                    <div className="list-container">
                        <div className="card contract-card">
                            <h3 className="card-title">Desenvolvimento de Aplicativo Mobile</h3>
                            <p className="card-description">Contrato com o freelancer "João Silva" para criar a versão 1.0 do app.</p>
                            <div className="card-meta">
                                <span>Status: Em Andamento</span>
                                <span>Orçamento: R$ 5.000</span>
                            </div>
                            <button className="card-button">Ver Detalhes</button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default EmployerHome;