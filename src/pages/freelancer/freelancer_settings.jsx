import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';
import { useConfirm } from '../../components/ConfirmProvider';
import perfilFreelancer from '../../assets/imgs/perfil_freelancer.png';
// useAuth already imported above

const FreelancerSettings = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(user?.plan || 'Free');
    const confirm = useConfirm();

    useEffect(() => {
        setCurrentPlan(user?.plan || 'Free');
    }, [user]);

    const savePlanInternal = (plan) => {
        // atualizar localStorage 'trampoff_users' se existir
        try {
            const raw = localStorage.getItem('trampoff_users');
            if (raw) {
                const users = JSON.parse(raw);
                const idx = users.findIndex(u => u.id === user?.id || (u.email && user?.email && u.email.toLowerCase() === user.email.toLowerCase()));
                if (idx !== -1) {
                    users[idx] = { ...users[idx], plan };
                    localStorage.setItem('trampoff_users', JSON.stringify(users));
                }
            }
        } catch (e) {
            // ignore
        }
        // atualizar user no contexto
        const updated = { ...user, plan };
        updateUser && updateUser(updated);
        setCurrentPlan(plan);
    };

    const confirmAndSavePlan = async (plan) => {
        const prices = { Free: 'R$0,00', Basic: 'R$19,90', Pro: 'R$49,90' };
        const amount = prices[plan] || 'R$0,00';
        const ok = await confirm({ title: 'Confirmar compra', message: `Você está prestes a assinar o plano ${plan} por ${amount}. Confirma a cobrança e ativação do plano?` });
        if (!ok) return;
        // simular cobrança
        const processingMsg = `Processando cobrança de ${amount}...`;
        // mostrar feedback simples
        alert(processingMsg);
        setTimeout(() => {
            // simular sucesso
            savePlanInternal(plan);
            alert(`Pagamento confirmado. Plano ${plan} ativado.`);
        }, 1200);
    };

    // Profile form state and handlers
    const [fullName, setFullName] = useState(user?.name || '');
    const [tagline, setTagline] = useState('Desenvolvedor Front-end | Especialista em UI/UX');
    const [location, setLocation] = useState('São Paulo, Brasil');

    const [billingAddress, setBillingAddress] = useState('');

    useEffect(() => {
        setFullName(user?.name || '');
    }, [user]);

    const handleSaveProfile = (e) => {
        e.preventDefault();
        const updated = { ...user, name: fullName, tagline, location };
        // salvar em trampoff_users
        try {
            const raw = localStorage.getItem('trampoff_users');
            if (raw) {
                const users = JSON.parse(raw);
                const idx = users.findIndex(u => u.id === user?.id || (u.email && user?.email && u.email.toLowerCase() === user.email.toLowerCase()));
                if (idx !== -1) {
                    users[idx] = { ...users[idx], ...updated };
                    localStorage.setItem('trampoff_users', JSON.stringify(users));
                }
            }
        } catch (e) { /* noop */ }
        updateUser && updateUser(updated);
        alert('Perfil atualizado.');
    };

    // Payment methods
    const addPaymentMethod = () => {
        const card = window.prompt('Digite os 4 últimos dígitos do cartão (ex: 1234):');
        if (!card) return;
        try {
            const raw = localStorage.getItem('trampoff_payment_methods');
            const pm = raw ? JSON.parse(raw) : {};
            const arr = pm[user?.id] || [];
            arr.push({ id: Date.now(), last4: card, brand: 'Visa' });
            pm[user?.id] = arr;
            localStorage.setItem('trampoff_payment_methods', JSON.stringify(pm));
            alert('Cartão adicionado (visual).');
        } catch (e) { console.error(e); alert('Falha ao adicionar cartão'); }
    };

    const handleSavePayment = (e) => {
        e.preventDefault();
        const updated = { ...user, billingAddress };
        try {
            const raw = localStorage.getItem('trampoff_users');
            if (raw) {
                const users = JSON.parse(raw);
                const idx = users.findIndex(u => u.id === user?.id || (u.email && user?.email && u.email.toLowerCase() === user.email.toLowerCase()));
                if (idx !== -1) {
                    users[idx] = { ...users[idx], ...updated };
                    localStorage.setItem('trampoff_users', JSON.stringify(users));
                }
            }
        } catch (e) { /* noop */ }
        updateUser && updateUser(updated);
        alert('Informações de pagamento salvas (visual).');
    };

    const clearLocalData = async () => {
        const confirmed = await confirm({ title: 'Confirmar limpeza', message: 'Confirma limpar todos os dados locais? Isso removerá usuários e mensagens salvos e fará logout.' });
        if (!confirmed) return;
        try {
            localStorage.removeItem('trampoff_users');
            localStorage.removeItem('trampoff_messages');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        } catch (e) {
            console.error('Erro ao limpar localStorage', e);
        }
        alert('Dados locais removidos. Você será deslogado.');
        logout();
        navigate('/');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div>
            <Header userType="freelancer" username={user?.name} onProfileClick={() => setShowModal(true)} />
            <ProfileModal show={showModal} onClose={() => setShowModal(false)} userType="freelancer" username={user?.name} onLogout={handleLogout} />

            <main className="main-content">
                <h1 className="section-title">Configurações da Conta</h1>

                <div className="card settings-section">
                    <h2 className="settings-title">Configurações de Perfil</h2>
                    <form className="settings-form" onSubmit={handleSaveProfile}>
                        <div className="form-group profile-picture-upload">
                            <label>Foto de Perfil</label>
                            <div className="picture-preview">
                                <img src={perfilFreelancer} alt="Foto de Perfil Atual" className="modal-profile-photo" />
                                <input type="file" id="photo-upload" accept="image/*" onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            const img = document.querySelector('.modal-profile-photo');
                                            if (img) img.src = event.target.result;
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }} />
                                <label htmlFor="photo-upload" className="card-button upload-button">Alterar Foto</label>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="full-name">Nome Completo</label>
                            <input type="text" id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="tagline">Título Profissional</label>
                            <input type="text" id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="location">Localização</label>
                            <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
                        </div>
                        <button type="submit" className="card-button">Salvar Alterações de Perfil</button>
                    </form>
                </div>

                <div className="card settings-section">
                    <h2 className="settings-title">Configurações de Pagamento</h2>
                    <div className="form-group">
                        <label>Métodos de Pagamento Salvos</label>
                        <div className="payment-method-list">
                            {/* listar métodos salvos do localStorage */}
                            {(() => {
                                try {
                                    const raw = localStorage.getItem('trampoff_payment_methods');
                                    const pm = raw ? JSON.parse(raw) : {};
                                    const arr = pm[user?.id] || [];
                                    return arr.map((c) => (
                                        <div className="payment-method" key={c.id}>
                                            <span>{c.brand} **** **** **** {c.last4}</span>
                                            <button className="remove-button" onClick={async () => {
                                                const r = await confirm({ title: 'Remover cartão', message: 'Remover este cartão?' });
                                                if (!r) return;
                                                const raw2 = localStorage.getItem('trampoff_payment_methods');
                                                const pm2 = raw2 ? JSON.parse(raw2) : {};
                                                pm2[user?.id] = (pm2[user?.id] || []).filter(x => x.id !== c.id);
                                                localStorage.setItem('trampoff_payment_methods', JSON.stringify(pm2));
                                                alert('Cartão removido (visual).');
                                            }}>Remover</button>
                                        </div>
                                    ));
                                } catch (e) { return null }
                            })()}
                        </div>
                        <button type="button" className="card-button" onClick={addPaymentMethod}>Adicionar Novo Cartão</button>
                    </div>
                    <form className="settings-form" onSubmit={handleSavePayment}>
                        <div className="form-group">
                            <label htmlFor="billing-address">Endereço de Faturamento</label>
                            <input type="text" id="billing-address" placeholder="Sua rua, nº" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} />
                        </div>
                        <button type="submit" className="card-button">Salvar Informações de Pagamento</button>
                    </form>
                </div>

                <div className="card settings-section">
                    <h2 className="settings-title">Seu Plano</h2>
                    <p>Plano atual: <strong>{currentPlan}</strong></p>
                    <div className="plan-options">
                        <div className="plan-card">
                            <h3>Free</h3>
                            <p>Recursos básicos, grátis.</p>
                            <button className="card-button" onClick={() => confirmAndSavePlan('Free')}>Selecionar Free</button>
                        </div>
                        <div className="plan-card">
                            <h3>Basic</h3>
                            <p>Destaque simples no fluxo — R$19,90/mês (visual)</p>
                            <button className="card-button" onClick={() => confirmAndSavePlan('Basic')}>Ativar Basic</button>
                        </div>
                        <div className="plan-card">
                            <h3>Pro</h3>
                            <p>Recursos avançados e prioridade — R$49,90/mês (visual)</p>
                            <button className="card-button" onClick={() => confirmAndSavePlan('Pro')}>Ativar Pro</button>
                        </div>
                    </div>
                </div>

                <div className="card settings-section reset-card">
                    <h2 className="settings-title">Dados Locais</h2>
                    <p>Limpe todos os dados salvos localmente (usuários, mensagens, token).</p>
                    <button className="reset-button" onClick={clearLocalData}>Limpar Dados Locais</button>
                </div>
            </main>
        </div>
    );
};

export default FreelancerSettings;