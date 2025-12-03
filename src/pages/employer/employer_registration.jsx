import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/imgs/logo_escuro.png';
import logoLight from '../../assets/imgs/logo_claro.png';
import ThemeAwareImage from '../../components/ThemeAwareImage';

const EmployerRegistration = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({ company_name: '', email: '', password: '', phone: '', cnpj: '', description: '' });
    const [cnpjError, setCnpjError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    // Etapa de confirmação removida – processo direto
    const [infoMessage, setInfoMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onlyDigits = (v) => (v || '').toString().replace(/\D/g, '');

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

    const formatCpfCnpj = (value) => {
        const digits = onlyDigits(value);
        if (!digits) return '';
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

    const handleCnpjChange = (e) => {
        const raw = e.target.value;
        const formatted = formatCpfCnpj(raw);
        setFormData(prev => ({ ...prev, cnpj: formatted }));
        if (formatted.trim() === '') {
            setCnpjError('');
            return;
        }
        if (!isValidCNPJ(formatted)) setCnpjError('CNPJ inválido'); else setCnpjError('');
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

    const [registrationError, setRegistrationError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setRegistrationError('');

        // Removida etapa de confirmação de e-mail

        // validar CNPJ
        if (!formData.cnpj || !isValidCNPJ(formData.cnpj)) {
            setCnpjError('CNPJ inválido');
            return;
        }
        // validar telefone
        const phoneDigits = onlyDigitsPhone(formData.phone);
        if (!phoneDigits || phoneDigits.length < 10) {
            setPhoneError('Telefone inválido');
            return;
        }
        // validar confirmação de senha
        if (!formData.password) {
            setRegistrationError('Senha obrigatória');
            return;
        }

        try {
            await register({ name: formData.company_name, email: formData.email, password: formData.password, companyName: formData.company_name, phone: formData.phone, cnpj: formData.cnpj, description: formData.description }, 'contratante');
            setInfoMessage('Cadastro realizado! E-mail verificado automaticamente.');
        } catch (error) {
            const msg = error?.message || 'Erro ao cadastrar. Tente novamente.';
            setRegistrationError(msg);
            console.error('Erro no cadastro (employer):', error);
        }
    };

    return (
        <div className="registration-page">
            <div className="registration-container">
                <ThemeAwareImage darkSrc={logo} lightSrc={logoLight} alt="Logo do Projeto" className="logo-large theme-adaptable" />
                <h1 className="registration-title">Cadastro de Empregador</h1>
                <p className="registration-subtitle">Preencha os dados abaixo para começar a contratar talentos.</p>
                <form className="registration-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="company_name">Nome da Empresa</label>
                        <input
                            type="text"
                            id="company_name"
                            name="company_name"
                            maxLength={40}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input type="email" id="email" name="email" onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="cnpj">CNPJ</label>
                        <input type="text" id="cnpj" name="cnpj" inputMode="numeric" value={formData.cnpj} onChange={handleCnpjChange} placeholder="Digite o CNPJ" maxLength={18} required />
                        {cnpjError && <small style={{ color: 'red' }}>{cnpjError}</small>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input type="password" id="password" name="password" onChange={handleChange} required />
                    </div>
                    {/* Campo de confirmação de senha removido */}
                    <div className="form-group">
                        <label htmlFor="phone">Telefone</label>
                        <input type="text" id="phone" name="phone" inputMode="tel" value={formData.phone} onChange={handlePhoneChange} placeholder="(99) 99999-9999" maxLength={16} required />
                        {phoneError && <small style={{ color: 'red' }}>{phoneError}</small>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Resumo da Empresa</label>
                        <textarea id="description" name="description" rows="4" onChange={handleChange}></textarea>
                    </div>

                    <button type="submit" className="registration-button">
                        Cadastrar
                    </button>
                    {infoMessage && <p style={{ color: 'var(--bali-hai)', marginTop: 8 }}>{infoMessage}</p>}
                    {registrationError && <p style={{ color: 'red', marginTop: 8 }}>{registrationError}</p>}
                </form>
                <Link to="/employer/login" className="login_paragraph"><p>Já tem uma conta? Faça Login</p></Link>
            </div>
        </div>
    );
};

export default EmployerRegistration;