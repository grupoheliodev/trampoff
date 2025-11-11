import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';
import { createJob, getContractsForUser, getJobs, getApplicationsForJob, updateApplication, createContract, getUsers, sendMessage } from '../../services/api';
import { useEffect } from 'react';

const EmployerHome = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [contracts, setContracts] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [openProposalsJob, setOpenProposalsJob] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [applicants, setApplicants] = useState({});

    useEffect(() => {
        let mounted = true;
        getContractsForUser(user?.id).then(list => { if (mounted) setContracts(list || []); }).catch(() => setContracts([]));
        getJobs().then(list => { if (mounted) setJobs(list || []); }).catch(() => setJobs([]));
        return () => { mounted = false };
    }, [user]);

    const loadProposals = async (jobId) => {
        try {
            const apps = await getApplicationsForJob(jobId);
            setProposals(apps || []);
            // buscar dados dos usuários que aplicaram
            const userIds = Array.from(new Set((apps || []).map(a => a.userId)));
            const allUsers = await getUsers();
            const map = {};
            userIds.forEach(id => { map[id] = allUsers.find(u => u.id === id) || { id, name: 'Usuário' }; });
            setApplicants(map);
        } catch (e) {
            setProposals([]);
            setApplicants({});
        }
    };

    const handleCreateJob = () => {
        const title = window.prompt('Título da vaga');
        if (!title) return;
        const description = window.prompt('Descrição') || '';
        const category = window.prompt('Categoria') || '';
        const budget = window.prompt('Orçamento (ex: R$ 3000)') || '';
        createJob(user.id, { title, description, category, budget }).then(j => {
            setJobs(prev => [j, ...prev]);
            alert('Vaga criada (local)');
        }).catch(err => alert(err?.message || 'Erro ao criar vaga'));
    };

    const handleViewProposals = (job) => {
        if (openProposalsJob === job.id) {
            setOpenProposalsJob(null);
            setProposals([]);
            return;
        }
        setOpenProposalsJob(job.id);
        loadProposals(job.id);
    };

    const handleAcceptProposal = async (app, job) => {
        try {
            await updateApplication(app.id, { status: 'accepted' });
            // tentar extrair número do orçamento (ex: 'R$ 3000')
            let price = 0;
            if (job.budget) {
                const m = String(job.budget).replace(/[^0-9.,]/g, '').replace(',', '.');
                price = parseFloat(m) || 0;
            }
            const contract = await createContract({ jobId: job.id, employerId: user.id, freelancerId: app.userId, price });
            // notificar freelancer
            await sendMessage(user.id, app.userId, `Sua proposta para "${job.title}" foi aceita. Contrato criado (ID: ${contract.id}).`);
            // atualizar listas
            const updatedContracts = await getContractsForUser(user.id);
            setContracts(updatedContracts);
            await loadProposals(job.id);
            alert('Proposta aceita e contrato criado (local)');
        } catch (e) {
            alert(e?.message || 'Erro ao aceitar proposta');
        }
    };

    const handleRejectProposal = async (app, job) => {
        try {
            await updateApplication(app.id, { status: 'rejected' });
            await sendMessage(user.id, app.userId, `Sua proposta para "${job.title}" foi recusada.`);
            await loadProposals(job.id);
            alert('Proposta recusada');
        } catch (e) {
            alert(e?.message || 'Erro ao recusar proposta');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div>
            <Header userType="employer" username={user?.name} onProfileClick={() => setShowModal(true)} />
            <ProfileModal show={showModal} onClose={() => setShowModal(false)} userType="employer" username={user?.name} onLogout={handleLogout} />

            <main className="main-content">
                <section className="welcome-section">
                    <h1 className="welcome-title">Bem-vindo(a), {user?.name || 'Empregador'}!</h1>
                    <p className="welcome-subtitle">Gerencie seus projetos e encontre os melhores talentos.</p>
                </section>
                <section>
                    <div style={{ marginBottom: 12 }}>
                        <button className="card-button" onClick={handleCreateJob}>Criar Nova Vaga</button>
                    </div>
                    <h2 className="section-title">Meus Contratos Ativos</h2>
                    <div className="list-container">
                        {contracts.length === 0 && <p>Você não possui contratos ativos.</p>}
                        {contracts.map(c => (
                            <div className="card contract-card" key={c.id}>
                                <h3 className="card-title">Contrato: {c.jobId}</h3>
                                <p className="card-description">Freelancer ID: {c.freelancerId} — Orçamento: {c.price}</p>
                                <div className="card-meta">
                                    <span>Status: {c.status}</span>
                                    <span>Data: {new Date(c.agreedAt).toLocaleDateString()}</span>
                                </div>
                                <button className="card-button">Ver Detalhes</button>
                            </div>
                        ))}
                    </div>
                    <h2 className="section-title">Vagas Publicadas</h2>
                    <div className="list-container">
                        {jobs.map(j => (
                            <div className="card job-card" key={j.id}>
                                <h3 className="card-title">{j.title}</h3>
                                <p className="card-description">{j.description}</p>
                                <div className="card-meta">
                                    <span>Categoria: {j.category}</span>
                                    <span>Orçamento: {j.budget}</span>
                                </div>
                                <div style={{ marginTop: 8 }}>
                                    <button className="card-button" onClick={() => handleViewProposals(j)}>{openProposalsJob === j.id ? 'Fechar Propostas' : 'Ver Propostas'}</button>
                                </div>
                                {openProposalsJob === j.id && (
                                    <div className="proposals-list" style={{ marginTop: 12 }}>
                                        <h4>Propostas</h4>
                                        {proposals.length === 0 && <p>Nenhuma proposta encontrada.</p>}
                                        {proposals.map(p => (
                                            <div key={p.id} className="card proposal-card" style={{ marginBottom: 8 }}>
                                                <strong>{(applicants[p.userId] && applicants[p.userId].name) || p.userId}</strong>
                                                <p>{p.coverLetter}</p>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button className="card-button" onClick={() => handleAcceptProposal(p, j)}>Aceitar</button>
                                                    <button className="card-button" onClick={() => handleRejectProposal(p, j)}>Recusar</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default EmployerHome;