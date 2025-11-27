import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../components/AlertProvider';
import logo from '../../assets/imgs/logo.png';
import logoLight from '../../assets/imgs/fotoclara.png';
import ThemeAwareImage from '../../components/ThemeAwareImage';

const FreelancerLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const alert = useAlert();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await login(email, password);
            navigate('/freelancer/home');
        } catch (error) {
            await alert('E-mail ou senha incorretos!');
        }
    };

    return (
        <div className="registration-page">
            <div className="registration-container">
                <ThemeAwareImage darkSrc={logo} lightSrc={logoLight} alt="Logo do Projeto" className="logo-small theme-adaptable" />
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