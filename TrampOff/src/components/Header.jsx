import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/imgs/logo.png';
import perfilFreelancer from '../assets/imgs/perfil_freelancer.png';
import perfilEmployer from '../assets/imgs/perfil_employer.png';

const Header = ({ userType, username, onProfileClick }) => {
    const isFreelancer = userType === 'freelancer';
    const navLinks = isFreelancer ? [
        { path: '/freelancer/home', label: 'Início' },
        { path: '/freelancer/projects', label: 'Meus Projetos' },
        { path: '/freelancer/jobs', label: 'Trabalhos Disponíveis' },
        { path: '/freelancer/messages', label: 'Mensagens' },
    ] : [
        { path: '/employer/home', label: 'Início' },
        { path: '/employer/workers', label: 'Trabalhadores Disponíveis' },
        { path: '/employer/contracts', label: 'Meus Contratos' },
        { path: '/employer/messages', label: 'Mensagens' },
    ];
    
    const profileImg = isFreelancer ? perfilFreelancer : perfilEmployer;

    return (
        <header className="main-header">
            <div className="logo-container">
                <img src={logo} alt="Logo do Projeto" className="logo" />
            </div>
            <nav className="main-nav">
                <ul>
                    {navLinks.map(link => (
                        <li key={link.path}>
                            <NavLink to={link.path} className={({ isActive }) => isActive ? "active" : ""}>{link.label}</NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="search-profile-container">
                <div className="search-bar">
                    <input type="text" placeholder="Buscar..." />
                    <button type="submit">🔍</button>
                </div>
                <div className="profile-area" onClick={onProfileClick}>
                    <span className="profile-name">Olá, {username || 'Usuário'}!</span>
                    <div className="profile-photo">
                        <img src={profileImg} alt="Foto de Perfil" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;