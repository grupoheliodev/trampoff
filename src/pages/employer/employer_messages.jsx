import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/header';
import ProfileModal from '../../components/profilemodal';

const EmployerMessages = () => {
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
                    <h2 className="section-title">Mensagens</h2>
                    <div className="messages-container">
                        <div className="message-list card">
                            <h4>Conversas Recentes</h4>
                        </div>
                        <div className="chat-box card">
                            <div className="chat-messages"></div>
                            <div className="chat-input">
                                <input type="text" placeholder="Escreva sua mensagem..." />
                                <button>Enviar</button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default EmployerMessages;