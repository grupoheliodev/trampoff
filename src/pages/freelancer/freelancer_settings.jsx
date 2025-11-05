import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';
import perfilFreelancer from '../../assets/imgs/perfil_freelancer.png';

const FreelancerSettings = () => {
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
                <h1 className="section-title">Configurações da Conta</h1>

                <div className="card settings-section">
                    <h2 className="settings-title">Configurações de Perfil</h2>
                    <form className="settings-form">
                        <div className="form-group profile-picture-upload">
                            <label>Foto de Perfil</label>
                            <div className="picture-preview">
                                <img src={perfilFreelancer} alt="Foto de Perfil Atual" className="modal-profile-photo" />
                                <input type="file" id="photo-upload" accept="image/*" onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            const img = document.querySelector('.modal-profile-photo');
                                            if (img) img.src = event.target.result;
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }} />
                                <label htmlFor="photo-upload" className="card-button upload-button">Alterar Foto</label>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="full-name">Nome Completo</label>
                            <input type="text" id="full-name" defaultValue={user?.name || 'Ana Souza'} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="tagline">Título Profissional</label>
                            <input type="text" id="tagline" defaultValue="Desenvolvedor Front-end | Especialista em UI/UX" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="location">Localização</label>
                            <input type="text" id="location" defaultValue="São Paulo, Brasil" />
                        </div>
                        <button type="submit" className="card-button">Salvar Alterações de Perfil</button>
                    </form>
                </div>

                <div className="card settings-section">
                    <h2 className="settings-title">Configurações de Pagamento</h2>
                    <div className="form-group">
                        <label>Métodos de Pagamento Salvos</label>
                        <div className="payment-method-list">
                            <div className="payment-method">
                                <span>Visa **** **** **** 1234</span>
                                <button className="remove-button">Remover</button>
                            </div>
                        </div>
                        <button className="card-button">Adicionar Novo Cartão</button>
                    </div>
                    <form className="settings-form">
                        <div className="form-group">
                            <label htmlFor="billing-address">Endereço de Faturamento</label>
                            <input type="text" id="billing-address" placeholder="Sua rua, nº" />
                        </div>
                        <button type="submit" className="card-button">Salvar Informações de Pagamento</button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default FreelancerSettings;