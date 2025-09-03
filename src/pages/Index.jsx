import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/imgs/logo.png';
import freelancerIcon from '../assets/imgs/freelancer_icon.png';
import employerIcon from '../assets/imgs/employer_icon.png';

const Index = () => {
    return (
        <div className="selection-page">
            <div className="selection-container">
                <img src={logo} alt="Logo do Projeto" className="logo-large" />
                <h1 className="selection-title">Como você quer usar a plataforma?</h1>
                <p className="selection-subtitle">Escolha a opção que melhor te representa.</p>

                <div className="selection-options">
                    <div className="selection-card">
                        <img src={freelancerIcon} alt="Ícone Freelancer" className="card-icon" />
                        <h2 className="card-title">Sou um Freelancer</h2>
                        <p className="card-description">Encontre projetos, construa sua carreira e receba por seu trabalho.</p>
                        <Link to="/freelancer/login" className="selection-button">Entrar como Freelancer</Link>
                    </div>

                    <div className="selection-card">
                        <img src={employerIcon} alt="Ícone Empregador" className="card-icon" />
                        <h2 className="card-title">Sou um Empregador</h2>
                        <p className="card-description">Contrate talentos, gerencie contratos e impulsione seus projetos.</p>
                        <Link to="/employer/login" className="selection-button">Entrar como Empregador</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;