import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../components/AlertProvider';
import logo from '../../assets/imgs/logo_escuro.png';
import logoLight from '../../assets/imgs/logo_claro.png';
import ThemeAwareImage from '../../components/ThemeAwareImage';

const EmployerLogin = () => {
    const navigate = useNavigate();
    const { login, resetPassword, socialLogin } = useAuth();
    const alert = useAlert();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [lockedUntil, setLockedUntil] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isResetMode, setIsResetMode] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        if (import.meta.env.DEV) {
            // Em desenvolvimento não restaura estado de bloqueio
            setLockedUntil(null);
            setAttempts(0);
            return;
        }
        const stored = localStorage.getItem('employer_login_lock');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.lockedUntil) {
                setLockedUntil(parsed.lockedUntil);
                setAttempts(parsed.attempts || 0);
            }
        }
    }, []);

    useEffect(() => {
        if (import.meta.env.DEV) return; // Não persiste bloqueio em desenvolvimento
        if (lockedUntil) {
            localStorage.setItem('employer_login_lock', JSON.stringify({
                lockedUntil,
                attempts,
            }));
        } else {
            localStorage.removeItem('employer_login_lock');
        }
    }, [lockedUntil, attempts]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isResetMode) {
            try {
                if (!email) {
                    await alert('Informe o e-mail para redefinir a senha.');
                    return;
                }
                if (!newPassword || newPassword.length < 4) {
                    await alert('A nova senha deve ter pelo menos 4 caracteres.');
                    return;
                }
                await resetPassword(email, newPassword);
                await alert('Senha redefinida com sucesso! Use a nova senha para entrar.');
                setIsResetMode(false);
                setNewPassword('');
            } catch (error) {
                await alert(error.message || 'Não foi possível redefinir a senha.');
            }
            return;
        }

        const now = Date.now();
        if (lockedUntil && now < lockedUntil) {
            const secondsLeft = Math.ceil((lockedUntil - now) / 1000);
            await alert(`Conta temporariamente bloqueada. Tente novamente em ${secondsLeft} segundos.`);
            return;
        }

        try {
            await login(email, password);
            setAttempts(0);
            setLockedUntil(null);
            navigate('/employer/home');
        } catch (error) {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= 3 && !import.meta.env.DEV) {
                const lockTimeMs = 5 * 60 * 1000; // 5 minutos (somente produção)
                const until = Date.now() + lockTimeMs;
                setLockedUntil(until);
                await alert('Você errou a senha 3 vezes. Login bloqueado por 5 minutos.');
            } else {
                await alert('E-mail ou senha incorretos!');
            }
        }
    };

    return (
        <div className="registration-page">
            <div className="registration-container login-horizontal">
                <div className="login-visual">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="btn btn-secondary"
                        style={{ alignSelf: 'flex-start', marginBottom: '0.75rem' }}
                        aria-label="Voltar"
                    >← Voltar</button>
                    <ThemeAwareImage darkSrc={logo} lightSrc={logoLight} alt="Logo do Projeto" className="logo-large theme-adaptable" />
                    <h1 className="registration-title">Login de Empregador</h1>
                    <p className="registration-subtitle">Entre para publicar vagas e acompanhar seus freelancers.</p>
                </div>
                <form className="registration-form login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input type="email" id="email" name="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    {!isResetMode && (
                        <div className="form-group password-group">
                            <label htmlFor="password">Senha</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(prev => !prev)}
                                >
                                    {showPassword ? 'Ocultar' : 'Mostrar'}
                                </button>
                            </div>
                        </div>
                    )}

                    {isResetMode && (
                        <div className="form-group password-group">
                            <label htmlFor="new-password">Nova senha</label>
                            <input
                                type="password"
                                id="new-password"
                                name="new-password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="registration-button">
                        {isResetMode ? 'Redefinir senha' : 'Login'}
                    </button>
                    <button
                        type="button"
                        className="link-button forgot-password-link"
                        onClick={() => setIsResetMode(prev => !prev)}
                    >
                        {isResetMode ? 'Voltar para login' : 'Esqueci minha senha'}
                    </button>
                </form>
                {!isResetMode && (
                    <div className="login-side-actions">
                        <Link to="/employer/registration" className="login_paragraph"><p>Não Possui Cadastro?<br/>Faça Agora</p></Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployerLogin;