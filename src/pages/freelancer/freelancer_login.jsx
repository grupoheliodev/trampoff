import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/imgs/logo.png';

const FreelancerLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        const savedCredentialsRaw = localStorage.getItem('freelancerCredentials');
        const savedUsername = localStorage.getItem('username'); // Recupera o nome correto

        if (savedCredentialsRaw) {
            const savedCredentials = JSON.parse(savedCredentialsRaw);
            if (email === savedCredentials.email && password === savedCredentials.password) {
                login(savedUsername, 'freelancer');
                navigate('/freelancer/home');
            } else {
                alert('E-mail ou senha incorretos!');
            }
        } else {
            alert('Nenhum freelancer cadastrado. Por favor, cadastre-se primeiro.');
        }
    };

    return (
        <div className="registration-page">
            <div className="registration-container">
                <img src={logo} alt="Logo do Projeto" className="logo-small" />
                <h1 className="registration-title">Login de Freelancer</h1>
                <form id="freelancer-login-form" className="registration-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input type="email" id="email" name="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input type="password" id="password" name="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                   <button type="submit" className="registration-button">Login</button>
                </form>
                <Link to="/freelancer/registration" className="login_paragraph"><p>Não Possui Cadastro?<br/>Faça Agora</p></Link>
            </div>
        </div>
    );
};

export default FreelancerLogin;