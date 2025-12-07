import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/imgs/logojovialescuro.png';
import logoLight from '../assets/imgs/logojovialclara.png';
import freelancerIcon from '../assets/imgs/freelancer_icon.png';
import employerIcon from '../assets/imgs/employer_icon.png';
import ThemeAwareImage from '../components/ThemeAwareImage';

const Index = () => {
    return (
        <div className="selection-page">
            <div className="selection-container">
                <ThemeAwareImage darkSrc={logo} lightSrc={logoLight} className="logo-large theme-adaptable" alt="Logo do Projeto" />
                <h1 className="selection-title">Como você quer usar a plataforma?</h1>
                <p className="selection-subtitle">TrampOff conecta freelancers e empregadores em contratos seguros, com chat integrado e gestão simples de projetos e pagamentos.</p>

                <div className="selection-options selection-row">
                    <div className="selection-card">
                        <ThemeAwareImage darkSrc={freelancerIcon} lightSrc={freelancerIcon} className="card-icon theme-adaptable" alt="Ícone Freelancer" />
                        <h2 className="card-title">Sou um Freelancer</h2>
                        <p className="card-description">Encontre projetos, construa sua carreira e receba por seu trabalho.</p>
                        <Link to="/freelancer/login" className="selection-button">Entrar como Freelancer</Link>
                    </div>

                    <div className="selection-card">
                        <ThemeAwareImage darkSrc={employerIcon} lightSrc={employerIcon} className="card-icon theme-adaptable" alt="Ícone Empregador" />
                        <h2 className="card-title">Sou um Empregador</h2>
                        <p className="card-description">Contrate talentos, gerencie contratos e impulsione seus projetos.</p>
                        <Link to="/employer/login" className="selection-button">Entrar como Empregador</Link>
                    </div>
                </div>
                {/* Botão de instalação removido aqui para evitar duplicidade no mobile */}
            </div>
        </div>
    );
};

export default Index;