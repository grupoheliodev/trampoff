import React, { useState, useEffect } from 'react';
import meusContratos from '../../assets/imgs/meus_contratos.png';
import contratoClaro from '../../assets/imgs/contrato_claro.png';
import contratoEscuro from '../../assets/imgs/contrato_escuro.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';
import { getContractsForUser, completeContract, createReview, getReviewsForUser } from '../../services/api';
import { useConfirm } from '../../components/ConfirmProvider';
import ReviewModal from '../../components/ReviewModal';
import { useAlert } from '../../components/AlertProvider';

const EmployerContracts = () => {
    const { user, logout } = useAuth();
    const confirm = useConfirm();
    const alert = useAlert();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [contracts, setContracts] = useState([]);
    const [reviewsMap, setReviewsMap] = useState({});
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [currentReviewTarget, setCurrentReviewTarget] = useState(null); // { contractId, targetUserId }
    const [theme, setTheme] = useState(() => (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme')) || localStorage.getItem('trampoff_theme') || 'dark');

    useEffect(() => {
        let mounted = true;
        getContractsForUser(user?.id).then(list => { if (mounted) setContracts(list || []); }).catch(() => setContracts([]));
        // carregar avaliações para o usuário (mapa por contractId)
        getReviewsForUser(user?.id).then(list => { if (mounted) {
            const map = {};
            (list || []).forEach(r => { if (r.contractId) map[r.contractId] = r; });
            setReviewsMap(map);
        }}).catch(() => {});
        return () => { mounted = false };
    }, [user]);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        const handleThemeChange = () => {
            const newTheme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('trampoff_theme') || 'dark';
            setTheme(newTheme);
        };
        window.addEventListener('trampoff:theme-changed', handleThemeChange);
        const observer = new MutationObserver(handleThemeChange);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => { 
            window.removeEventListener('trampoff:theme-changed', handleThemeChange);
            observer.disconnect();
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div>
            <Header userType="employer" username={user?.name} profilePicture={user?.photo} onProfileClick={() => setShowModal(true)} />
            <ProfileModal show={showModal} onClose={() => setShowModal(false)} userType="employer" username={user?.name} onLogout={handleLogout} />
            <main className="main-content">
                <section>
                    <h2 className="section-title">Meus Contratos</h2>

                    {contracts.length === 0 && (
                        <div className="contracts-hero" role="region" aria-label="Sem contratos">
                            <div className="contracts-hero-left">
                                <p className="contracts-empty-text">Nenhum contrato encontrado.</p>
                            </div>
                            <div className="contracts-hero-right">
                                <img src={theme === 'light' ? contratoClaro : contratoEscuro} alt="Meus contratos" className="contracts-illustration" />
                            </div>
                        </div>
                    )}

                    <div className="list-container">
                        {contracts.map(c => (
                            <div className="card contract-card" key={c.id}>
                                <h3 className="card-title">Contrato #{c.id}</h3>
                                <p className="card-description">Job: {c.jobId} — Freelancer: {c.freelancerId}</p>
                                <div className="card-meta">
                                    <span>Status: {c.status}</span>
                                    <span>Valor: {c.price}</span>
                                </div>
                                {c.status !== 'completed' && (
                                    <button className="card-button" onClick={async () => {
                                        const ok = await confirm({ title: 'Confirmar', message: 'Marcar contrato como concluído?' });
                                        if (!ok) return;
                                        try {
                                            const updated = await completeContract(c.id);
                                            setContracts(prev => prev.map(it => it.id === updated.id ? updated : it));
                                            await alert('Contrato finalizado.');
                                        } catch (err) {
                                            await alert(err?.message || 'Erro');
                                        }
                                    }}>Concluir Contrato</button>
                                )}

                                {c.status === 'completed' && !reviewsMap[c.id] && (
                                    <>
                                        <button className="card-button" onClick={() => {
                                            setCurrentReviewTarget({ contractId: c.id, targetUserId: c.freelancerId });
                                            setShowReviewModal(true);
                                        }}>Avaliar Freelancer</button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <ReviewModal show={showReviewModal} onClose={() => setShowReviewModal(false)} title="Avaliar Freelancer" onSubmit={async ({ rating, comment }) => {
                    if (!currentReviewTarget) return;
                    try {
                        await createReview({ reviewerId: user.id, targetUserId: currentReviewTarget.targetUserId, contractId: currentReviewTarget.contractId, rating, comment });
                        setReviewsMap(prev => ({ ...prev, [currentReviewTarget.contractId]: true }));
                        setShowReviewModal(false);
                        await alert('Avaliação registrada.');
                    } catch (e) {
                        await alert(e?.message || 'Erro ao registrar avaliação');
                    }
                }} />
            </main>
        </div>
    );
};

export default EmployerContracts;