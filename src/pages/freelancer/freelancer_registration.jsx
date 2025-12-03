import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/imgs/logo_escuro.png';
import logoLight from '../../assets/imgs/logo_claro.png';
import ThemeAwareImage from '../../components/ThemeAwareImage';

const FreelancerRegistration = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', portfolio: '', cad: '' });
    const [cadError, setCadError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    // Etapa de confirmação removida – cadastro direto
    const [infoMessage, setInfoMessage] = useState('');

    const onlyDigits = (v) => (v || '').toString().replace(/\D/g, '');

    const isValidCPF = (cpf) => {
        cpf = onlyDigits(cpf);
        if (cpf.length !== 11) return false;
        if (/^(\d)\1+$/.test(cpf)) return false; // sequências repetidas
        let sum = 0;
        for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i), 10) * (10 - i);
        let rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(9), 10)) return false;
        sum = 0;
        for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i), 10) * (11 - i);
        rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        return rev === parseInt(cpf.charAt(10), 10);
    };

    const isValidCNPJ = (cnpj) => {
        cnpj = onlyDigits(cnpj);
        if (cnpj.length !== 14) return false;
        if (/^(\d)\1+$/.test(cnpj)) return false;
        const calc = (slice, weights) => {
            let sum = 0;
            for (let i = 0; i < weights.length; i++) {
                sum += parseInt(slice.charAt(i), 10) * weights[i];
            }
            const r = sum % 11;
            return r < 2 ? 0 : 11 - r;
        };
        const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const digit1 = calc(cnpj.slice(0, 12), weights1);
        const digit2 = calc(cnpj.slice(0, 12) + digit1, weights2);
        return digit1 === parseInt(cnpj.charAt(12), 10) && digit2 === parseInt(cnpj.charAt(13), 10);
    };

    const isValidCpfCnpj = (value) => {
        const digits = onlyDigits(value);
        if (digits === '') return true; // permitir vazio
        if (digits.length === 11) return isValidCPF(digits);
        if (digits.length === 14) return isValidCNPJ(digits);
        return false;
    };

    const formatCpfCnpj = (value) => {
        const digits = onlyDigits(value);
        if (!digits) return '';
        // CPF
        if (digits.length <= 11) {
            const d = digits.slice(0, 11);
            const part1 = d.slice(0, 3);
            const part2 = d.slice(3, 6);
            const part3 = d.slice(6, 9);
            const part4 = d.slice(9, 11);
            let formatted = '';
            if (part1) formatted += part1;
            if (part2) formatted += `.${part2}`;
            if (part3) formatted += `.${part3}`;
            if (part4) formatted += `-${part4}`;
            return formatted;
        }

        // CNPJ
        const d = digits.slice(0, 14);
        const p1 = d.slice(0, 2);
        const p2 = d.slice(2, 5);
        const p3 = d.slice(5, 8);
        const p4 = d.slice(8, 12);
        const p5 = d.slice(12, 14);
        let formatted = '';
        if (p1) formatted += p1;
        if (p2) formatted += `.${p2}`;
        if (p3) formatted += `.${p3}`;
        if (p4) formatted += `/${p4}`;
        if (p5) formatted += `-${p5}`;
        return formatted;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onlyDigitsPhone = (v) => (v || '').toString().replace(/\D/g, '');

    const formatPhone = (value) => {
        const d = onlyDigitsPhone(value);
        if (!d) return '';
        if (d.length <= 2) return `(${d}`;
        if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
        if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6,10)}`;
        return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7,11)}`;
    };

    const handlePhoneChange = (e) => {
        const raw = e.target.value;
        const formatted = formatPhone(raw);
        setFormData(prev => ({ ...prev, phone: formatted }));
        const digits = onlyDigitsPhone(formatted);
        if (digits.length < 10) setPhoneError('Telefone inválido'); else setPhoneError('');
    };

    const handleCadChange = (e) => {
        const raw = e.target.value;
        const formatted = formatCpfCnpj(raw);
        setFormData(prev => ({ ...prev, cad: formatted }));
        if (formatted.trim() === '') {
            setCadError('');
            return;
        }
        if (!isValidCpfCnpj(formatted)) {
            setCadError('CPF/CNPJ inválido');
        } else {
            setCadError('');
        }
    };

    const [registrationError, setRegistrationError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setRegistrationError('');

        // Removida etapa de confirmação de e-mail
        // se campo cad preenchido, garantir validade
        if (formData.cad.trim() !== '' && !isValidCpfCnpj(formData.cad)) {
            setCadError('CPF/CNPJ inválido');
            return;
        }
        // validar telefone e confirmação de senha
        const phoneDigits = onlyDigitsPhone(formData.phone);
        if (!phoneDigits || phoneDigits.length < 10) {
            setPhoneError('Telefone inválido');
            return;
        }
        if (!formData.password) {
            setRegistrationError('Senha obrigatória');
            return;
        }
        try {
            await register({ name: formData.name, email: formData.email, password: formData.password, phone: formData.phone, cad: formData.cad, portfolio: formData.portfolio }, 'freelancer');
            navigate('/profile/setup');
            setInfoMessage('Cadastro realizado! E-mail verificado automaticamente.');
        } catch (error) {
            // Mostrar mensagem de erro mais útil quando disponível
            const msg = error?.message || 'Erro ao cadastrar. Tente novamente.';
            setRegistrationError(msg);
            console.error('Erro no cadastro (freelancer):', error);
        }
    };

    return (
        <div className="registration-page">
            <div className="registration-container">
                <ThemeAwareImage darkSrc={logo} lightSrc={logoLight} alt="Logo do Projeto" className="logo-large theme-adaptable" />
                <h1 className="registration-title">Cadastro de Freelancer</h1>
                <p className="registration-subtitle">Preencha os dados abaixo para começar a encontrar projetos.</p>
                <form id="freelancer-registration-form" className="registration-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Nome Completo</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            maxLength={40}
                            onChange={handleChange}
                            placeholder="Digite seu Nome"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input type="email" id="email" name="email" placeholder='Digite seu Email' onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="cad">CPF/CNPJ</label>
                        <input
                            type="text"
                            id="cad"
                            name="cad"
                            inputMode="numeric"
                            value={formData.cad}
                            onChange={handleCadChange}
                            placeholder="Digite seu CPF ou CNPJ"
                            maxLength={18}
                            required
                        />
                        {cadError && <small style={{ color: 'red' }}>{cadError}</small>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input type="password" id="password" name="password" placeholder="Digite sua senha" onChange={handleChange} required />
                    </div>
                    {/* Campo de confirmação de senha removido */}
                    <div className="form-group">
                        <label htmlFor="phone">Telefone</label>
                        <input type="text" id="phone" name="phone" inputMode="tel" value={formData.phone} onChange={handlePhoneChange} placeholder="(99) 99999-9999" maxLength={16} required />
                        {phoneError && <small style={{ color: 'red' }}>{phoneError}</small>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="portfolio">Link do Portfólio</label>
                        <input type="url" id="portfolio" name="portfolio" onChange={handleChange} />
                    </div>

                    <button type="submit" className="registration-button" disabled={!!cadError}>
                        Cadastrar
                    </button>
                    {infoMessage && <p style={{ color: 'var(--bali-hai)', marginTop: 8 }}>{infoMessage}</p>}
                    {registrationError && <p style={{ color: 'red', marginTop: 8 }}>{registrationError}</p>}
                </form>
                 <Link to="/freelancer/login" className="login_paragraph"><p>Já tem uma conta? Faça Login</p></Link>
            </div>
        </div>
    );
};

export default FreelancerRegistration;