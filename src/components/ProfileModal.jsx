import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import perfilFreelancer from '../assets/imgs/perfil_freelancer.png';
import perfilEmployer from '../assets/imgs/perfil_employer.png';
import { useAuth } from '../context/AuthContext';

const ProfileModal = ({ show, onClose, userType, username, onLogout }) => {
    const auth = useAuth();
    if (!auth) return null;
    const { user, updateUser } = auth;
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
    
    const fallbackImg = isFreelancer ? perfilFreelancer : perfilEmployer;
    const role = isFreelancer ? "Desenvolvedor(a)" : "Empresa de Tecnologia";

    // Adiciona a classe 'is-active' quando a propriedade 'show' for verdadeira
    const modalClassName = `profile-modal ${show ? 'is-active fade-in' : ''}`;

    const [preview, setPreview] = useState(user?.photo || fallbackImg);

    useEffect(() => {
        setPreview(user?.photo || fallbackImg);
    }, [user, fallbackImg]);

    const handleFile = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            setPreview(dataUrl);
            // atualizar user no contexto e localStorage
            if (user) {
                const updated = { ...user, photo: dataUrl };
                updateUser && updateUser(updated);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className={modalClassName} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="profile-title">
            <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose} aria-label="Fechar">×</button>
                <div className="modal-profile-header">
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={preview} alt="Foto de Perfil" className="modal-profile-photo theme-adaptable" />
                        <label className="modal-edit-photo" style={{ position: 'absolute', right: -6, bottom: -6, background: 'var(--saffron)', borderRadius: '50%', padding: 6, cursor: 'pointer' }} aria-label="Editar foto">
                            <input aria-label="Selecionar foto de perfil" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files && e.target.files[0])} />
                            ✎
                        </label>
                    </div>
                    <h3 id="profile-title" className="modal-profile-name">{username}</h3>
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