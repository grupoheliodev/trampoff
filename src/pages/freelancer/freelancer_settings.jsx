import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';
import { useConfirm } from '../../components/ConfirmProvider';
import { useAlert } from '../../components/AlertProvider';
import perfilFreelancer from '../../assets/imgs/perfil_freelancer.png';
import CardForm from '../../components/CardForm';
// useAuth already imported above

const FreelancerSettings = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(user?.plan || 'Free');
    const confirm = useConfirm();
    const alert = useAlert();

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
        const processingMsg = `Processando cobrança de ${amount}...`;
        await alert(processingMsg);
        // aplicar plano
        savePlanInternal(plan);
        await alert(`Pagamento confirmado. Plano ${plan} ativado.`);
    };

    // Profile form state and handlers
    const [fullName, setFullName] = useState(user?.name || '');
    const [tagline, setTagline] = useState('Desenvolvedor Front-end | Especialista em UI/UX');
    const [location, setLocation] = useState('São Paulo, Brasil');
    const [profilePhoto, setProfilePhoto] = useState(user?.photo || perfilFreelancer);
    const [photoUrlInput, setPhotoUrlInput] = useState('');

    const [billingAddress, setBillingAddress] = useState('');

    useEffect(() => {
        setFullName(user?.name || '');
        setProfilePhoto(user?.photo || perfilFreelancer);
    }, [user]);

    const handleSaveProfile = async (e) => {
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
        await alert('Perfil atualizado.');
    };

    // Payment methods
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [showAddCard, setShowAddCard] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('trampoff_payment_methods');
            const pm = raw ? JSON.parse(raw) : {};
            setPaymentMethods(pm[user?.id] || []);
        } catch (e) { setPaymentMethods([]); }
    }, [user?.id]);

    const savePaymentMethods = (arr) => {
        try {
            const raw = localStorage.getItem('trampoff_payment_methods');
            const pm = raw ? JSON.parse(raw) : {};
            pm[user?.id] = arr;
            localStorage.setItem('trampoff_payment_methods', JSON.stringify(pm));
            setPaymentMethods(arr);
        } catch (e) { console.error('savePaymentMethods', e); }
    };

    const addPaymentMethod = async (card) => {
        try {
            const arr = [...(paymentMethods || [])];
            arr.push(card);
            savePaymentMethods(arr);
            setShowAddCard(false);
            await alert('Cartão adicionado (visual).');
        } catch (e) { console.error(e); await alert('Falha ao adicionar cartão'); }
    };

    const handleSavePayment = async (e) => {
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
        await alert('Informações de pagamento salvas (visual).');
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
        await alert('Dados locais removidos. Você será deslogado.');
        logout();
        navigate('/');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div>
            <Header userType="freelancer" username={user?.name} profilePicture={user?.photo} onProfileClick={() => setShowModal(true)} />
            <ProfileModal show={showModal} onClose={() => setShowModal(false)} userType="freelancer" username={user?.name} onLogout={handleLogout} />

            <main className="main-content">
                <h1 className="section-title">Configurações da Conta</h1>

                <div className="card settings-section">
                    <h2 className="settings-title">Configurações de Perfil</h2>
                    <form className="settings-form" onSubmit={handleSaveProfile}>
                        <div className="form-group profile-picture-upload">
                            <label>Foto de Perfil</label>
                            <div className="picture-preview">
                                <img src={profilePhoto} alt="Foto de Perfil Atual" className="modal-profile-photo" />
                                <div style={{ display:'flex', gap:8, marginTop:8, alignItems:'center' }}>
                                    <input
                                        type="url"
                                        placeholder="Cole a URL da sua foto"
                                        value={photoUrlInput}
                                        onChange={(e) => setPhotoUrlInput(e.target.value)}
                                        style={{ flex:1 }}
                                    />
                                    <button
                                        type="button"
                                        className="card-button upload-button"
                                        onClick={async () => {
                                            if (!user?.id || !photoUrlInput) return;
                                            try {
                                                const { updateUserPhotoUrl } = await import('../../services/api.js');
                                                await updateUserPhotoUrl(user.id, photoUrlInput);
                                                setProfilePhoto(photoUrlInput);
                                                updateUser && updateUser({ ...user, photo: photoUrlInput });
                                                await alert('Foto de perfil atualizada com URL.');
                                            } catch (err) {
                                                console.error(err);
                                                await alert('Falha ao salvar a URL da foto.');
                                            }
                                        }}
                                    >Salvar URL</button>
                                </div>
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
                            {paymentMethods.length === 0 && <div className="payment-method">Nenhum cartão salvo.</div>}
                            {paymentMethods.map((c) => (
                                <div className="payment-method" key={c.id}>
                                    <span>{(c.brand || '').toUpperCase()} **** **** **** {c.last4} — {c.holder || ''} <small style={{color:'var(--text-medium)'}}>({c.expiry})</small></span>
                                    <button className="remove-button" onClick={async () => {
                                        const confirmed = await confirm({ title: 'Remover cartão', message: 'Remover este cartão salvo?' });
                                        if (!confirmed) return;
                                        const remaining = paymentMethods.filter(x => x.id !== c.id);
                                        savePaymentMethods(remaining);
                                    }}>Remover</button>
                                </div>
                            ))}
                        </div>
                        {!showAddCard && <button className="card-button" type="button" onClick={() => setShowAddCard(true)}>Adicionar Novo Cartão</button>}
                        {showAddCard && (
                            <div style={{marginTop:12}}>
                                <CardForm onAdd={addPaymentMethod} onCancel={() => setShowAddCard(false)} />
                            </div>
                        )}
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
                        <div className={`plan-card ${currentPlan === 'Free' ? 'active-plan' : ''}`}>
                            <div>
                                <h3>Free</h3>
                                <p>Recursos básicos, grátis.</p>
                            </div>
                            <div>
                                <button
                                    className="card-button"
                                    onClick={() => confirmAndSavePlan('Free')}
                                    disabled={currentPlan === 'Free'}
                                    aria-disabled={currentPlan === 'Free'}
                                    title={currentPlan === 'Free' ? 'Plano atualmente ativo' : 'Selecionar Free'}
                                >
                                    {currentPlan === 'Free' ? 'Ativo' : 'Selecionar Free'}
                                </button>
                            </div>
                        </div>

                        <div className={`plan-card ${currentPlan === 'Basic' ? 'active-plan' : ''}`}>
                            <div>
                                <h3>Basic</h3>
                                <p>Destaque simples no fluxo — R$19,90/mês (visual)</p>
                            </div>
                            <div>
                                <button
                                    className="card-button"
                                    onClick={() => confirmAndSavePlan('Basic')}
                                    disabled={currentPlan === 'Basic'}
                                    aria-disabled={currentPlan === 'Basic'}
                                    title={currentPlan === 'Basic' ? 'Plano atualmente ativo' : 'Ativar Basic'}
                                >
                                    {currentPlan === 'Basic' ? 'Ativo' : 'Ativar Basic'}
                                </button>
                            </div>
                        </div>

                        <div className={`plan-card ${currentPlan === 'Pro' ? 'active-plan' : ''}`}>
                            <div>
                                <h3>Pro</h3>
                                <p>Recursos avançados e prioridade — R$49,90/mês (visual)</p>
                            </div>
                            <div>
                                <button
                                    className="card-button"
                                    onClick={() => confirmAndSavePlan('Pro')}
                                    disabled={currentPlan === 'Pro'}
                                    aria-disabled={currentPlan === 'Pro'}
                                    title={currentPlan === 'Pro' ? 'Plano atualmente ativo' : 'Ativar Pro'}
                                >
                                    {currentPlan === 'Pro' ? 'Ativo' : 'Ativar Pro'}
                                </button>
                            </div>
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