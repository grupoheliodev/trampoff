import React, { useState, useEffect } from 'react';
import pranchetaClaro from '../../assets/imgs/prancheta_clara.png';
import pranchetaEscura from '../../assets/imgs/prancheta_escura.png';
import ThemeAwareImage from '../../components/ThemeAwareImage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';
import { getContractsForUser, completeContract, createReview, getReviewsForUser } from '../../services/api';
import { useConfirm } from '../../components/ConfirmProvider';
import { useAlert } from '../../components/AlertProvider';
import ReviewModal from '../../components/ReviewModal';

const FreelancerContracts = () => {
    const { user, logout } = useAuth();
    const confirm = useConfirm();
    const alert = useAlert();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [contracts, setContracts] = useState([]);
    const [reviewsMap, setReviewsMap] = useState({});
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [currentReviewTarget, setCurrentReviewTarget] = useState(null);

    useEffect(() => {
        let mounted = true;
        getContractsForUser(user?.id).then(list => { if (mounted) setContracts(list || []); }).catch(() => setContracts([]));
        getReviewsForUser(user?.id).then(list => { if (mounted) {
            const map = {};
            (list || []).forEach(r => { if (r.contractId) map[r.contractId] = r; });
            setReviewsMap(map);
        }}).catch(() => {});
        return () => { mounted = false };
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div>
            <Header userType="freelancer" username={user?.name} profilePicture={user?.photo} onProfileClick={() => setShowModal(true)} />
            <ProfileModal show={showModal} onClose={() => setShowModal(false)} userType="freelancer" username={user?.name} onLogout={handleLogout} />

            <main className="main-content">
                <section>
                    <h2 className="section-title">Meus Contratos</h2>

                    <div className="contracts-hero" role="region" aria-label="Contratos">
                        <div className="contracts-hero-left">
                            {contracts.length === 0 ? (
                                <p className="contracts-empty-text">Nenhum contrato encontrado.</p>
                            ) : (
                                <p className="contracts-empty-text">Você tem {contracts.length} contrato{contracts.length > 1 ? 's' : ''}.</p>
                            )}
                        </div>
                        <div className="contracts-hero-right">
                            <ThemeAwareImage lightSrc={pranchetaClaro} darkSrc={pranchetaEscura} alt="Meus contratos" className="contracts-illustration theme-adaptable" />
                        </div>
                    </div>

                    <div className="list-container">
                        {contracts.map(c => (
                            <div className="card contract-card" key={c.id}>
                                <h3 className="card-title">Contrato #{c.id}</h3>
                                <p className="card-description">Job: {c.jobId} — Contratante: {c.employerId}</p>
                                <div className="card-meta">
                                    <span>Status: {c.status}</span>
                                    <span>Valor: {c.price}</span>
                                </div>
                                {c.status !== 'completed' && <button className="card-button" onClick={async () => {
                                    const ok = await confirm({ title: 'Confirmar', message: 'Marcar contrato como concluído?' });
                                    if (!ok) return;
                                    try {
                                        const updated = await completeContract(c.id);
                                        setContracts(prev => prev.map(it => it.id === updated.id ? updated : it));
                                        await alert('Contrato finalizado.');
                                    } catch (err) {
                                        await alert(err?.message || 'Erro');
                                    }
                                }}>Concluir Contrato</button>}

                                {c.status === 'completed' && !reviewsMap[c.id] && (
                                    <>
                                        <button className="card-button" onClick={() => {
                                            setCurrentReviewTarget({ contractId: c.id, targetUserId: c.employerId });
                                            setShowReviewModal(true);
                                        }}>Avaliar Contratante</button>
                                    </>
                                )}

                            </div>
                        ))}
                    </div>
                </section>

                <ReviewModal show={showReviewModal} onClose={() => setShowReviewModal(false)} title="Avaliar Contratante" onSubmit={async ({ rating, comment }) => {
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

export default FreelancerContracts;
