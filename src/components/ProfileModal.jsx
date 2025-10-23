import React from 'react';
import { Link } from 'react-router-dom';
import perfilFreelancer from '../assets/imgs/perfil_freelancer.png';
import perfilEmployer from '../assets/imgs/perfil_employer.png';

const ProfileModal = ({ show, onClose, userType, username, onLogout }) => {
    // Não renderiza nada se não houver tipo de usuário (evita bugs no logout)
    if (!userType) return null;

    const isFreelancer = userType === 'freelancer';
    const profileLinks = isFreelancer ? {
        profile: "/freelancer/profile",
        settings: "/freelancer/settings"
    } : {
        profile: "/employer/profile",
        settings: "/employer/settings"
    };
    
    const profileImg = isFreelancer ? perfilFreelancer : perfilEmployer;
    const role = isFreelancer ? "Desenvolvedor(a)" : "Empresa de Tecnologia";

    // Adiciona a classe 'is-active' quando a propriedade 'show' for verdadeira
    const modalClassName = `profile-modal ${show ? 'is-active fade-in' : ''}`;

    return (
        <div className={modalClassName} onClick={onClose}>
            <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
                <span className="close-button" onClick={onClose}>&times;</span>
                <div className="modal-profile-header">
                    <img src={profileImg} alt="Foto de Perfil" className="modal-profile-photo" />
                    <h3 className="modal-profile-name">{username}</h3>
                    <p className="modal-profile-role">{role}</p>
                </div>
                <ul className="modal-profile-nav">
                    <li><Link to={profileLinks.profile}>Ver Perfil Completo</Link></li>
                    <li><Link to={profileLinks.settings}>Configurações da Conta</Link></li>
                    <li><Link to="/" onClick={onLogout}>Sair</Link></li>
                </ul>
            </div>
        </div>
    );
};

export default ProfileModal;