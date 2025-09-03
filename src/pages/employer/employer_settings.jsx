import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/header';
import ProfileModal from '../../components/profilemodal';
import perfilEmployer from '../../assets/imgs/perfil_employer.png';

const EmployerSettings = () => {
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
                <h1 className="section-title">Configurações da Conta</h1>
                <div className="card settings-section">
                    <h2 className="settings-title">Configurações de Perfil da Empresa</h2>
                    <form className="settings-form">
                        <div className="form-group profile-picture-upload">
                            <label>Logo da Empresa</label>
                            <div className="picture-preview">
                                <img src={perfilEmployer} alt="Logo Atual" className="modal-profile-photo" />
                                <input type="file" id="photo-upload" />
                                <label htmlFor="photo-upload" className="card-button upload-button">Alterar Logo</label>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="full-name">Nome da Empresa</label>
                            <input type="text" id="full-name" defaultValue={user?.name || 'Evil Corp'} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="tagline">Slogan da Empresa</label>
                            <input type="text" id="tagline" defaultValue="Empresa de Tecnologia | Inovação e Soluções" />
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

export default EmployerSettings;