import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';

const EmployerWorkers = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div>
            <Header userType="employer" username={user?.name} profilePicture={user?.photo} onProfileClick={() => setShowModal(true)} />
            <ProfileModal show={showModal} onClose={() => setShowModal(false)} userType="employer" username={user?.name} onLogout={handleLogout} />
            <main className="main-content">
                <section>
                    <h2 className="section-title">Trabalhadores Disponíveis</h2>
                    <div className="list-container">
                        <div className="card worker-card">
                            <h3 className="card-title">Ana Souza</h3>
                            <p className="card-description">Especialista em marketing digital e estratégias de SEO.</p>
                            <div className="card-meta">
                                <span>Habilidades: SEO, Conteúdo, Social Media</span>
                                <span>Localização: São Paulo, Brasil</span>
                            </div>
                            <button className="card-button">Ver Perfil</button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default EmployerWorkers;