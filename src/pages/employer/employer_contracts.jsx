import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';

const EmployerContracts = () => {
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
                <section>
                    <h2 className="section-title">Meus Contratos</h2>
                    <div className="list-container">
                        <div className="card contract-card">
                            <h3 className="card-title">Criação de Website Institucional</h3>
                            <p className="card-description">Contratado "Pedro Ramos". Prazo de entrega: 30 dias.</p>
                            <div className="card-meta">
                                <span>Status: Concluído</span>
                                <span>Avaliação: 5 estrelas</span>
                            </div>
                            <button className="card-button">Ver Avaliação</button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default EmployerContracts;