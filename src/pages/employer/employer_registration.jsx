import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/imgs/logo.png';

const EmployerRegistration = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({ company_name: '', email: '', password: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        register({ name: formData.company_name, email: formData.email, password: formData.password }, 'employer');
        navigate('/employer/home');
    };

    return (
        <div className="registration-page">
            <div className="registration-container">
                <img src={logo} alt="Logo do Projeto" className="logo-small" />
                <h1 className="registration-title">Cadastro de Empregador</h1>
                <p className="registration-subtitle">Preencha os dados abaixo para começar a contratar talentos.</p>
                <form className="registration-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="company_name">Nome da Empresa</label>
                        <input type="text" id="company_name" name="company_name" onChange={handleChange} required />
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
                        <label htmlFor="description">Resumo da Empresa</label>
                        <textarea id="description" name="description" rows="4" onChange={handleChange}></textarea>
                    </div>
                    <button type="submit" className="registration-button">Cadastrar</button>
                </form>
                <Link to="/employer/login" className="login_paragraph"><p>Já tem uma conta? Faça Login</p></Link>
            </div>
        </div>
    );
};

export default EmployerRegistration;