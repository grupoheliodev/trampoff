import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/imgs/logo.png';

const FreelancerRegistration = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', portfolio: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        register({ name: formData.name, email: formData.email, password: formData.password }, 'freelancer');
        navigate('/freelancer/home');
    };

    return (
        <div className="registration-page">
            <div className="registration-container">
                <img src={logo} alt="Logo do Projeto" className="logo-small" />
                <h1 className="registration-title">Cadastro de Freelancer</h1>
                <p className="registration-subtitle">Preencha os dados abaixo para começar a encontrar projetos.</p>
                <form id="freelancer-registration-form" className="registration-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Nome Completo</label>
                        <input type="text" id="name" name="name" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input type="email" id="email" name="email" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input type="password" id="password" name="password" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="portfolio">Link do Portfólio (opcional)</label>
                        <input type="url" id="portfolio" name="portfolio" onChange={handleChange} />
                    </div>
                    <button type="submit" className="registration-button">Cadastrar</button>
                </form>
                 <Link to="/freelancer/login" className="login_paragraph"><p>Já tem uma conta? Faça Login</p></Link>
            </div>
        </div>
    );
};

export default FreelancerRegistration;