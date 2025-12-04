import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';
import engrenatemClaro from '../../assets/imgs/engrenagem_claro.png';
import engrenatemEscuro from '../../assets/imgs/engrenagem_escuro.png';
import ThemeAwareImage from '../../components/ThemeAwareImage';
import { createJob, getContractsForUser, getJobs, getApplicationsForJob, updateApplication, createContract, getUsers, sendMessage, getProjectApplications, getProjects, getNotifications, markNotificationRead } from '../../services/api';
import { useEffect } from 'react';
import { useAlert } from '../../components/AlertProvider';
import { useConfirm } from '../../components/ConfirmProvider';
import { usePrompt } from '../../components/PromptProvider';

const EmployerHome = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const alert = useAlert();
    const confirm = useConfirm();
    const prompt = usePrompt();
    const [contracts, setContracts] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [projectApplications, setProjectApplications] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [projectApplicantsMap, setProjectApplicantsMap] = useState({});
    const [openProposalsJob, setOpenProposalsJob] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [applicants, setApplicants] = useState({});

    useEffect(() => {
        let mounted = true;
        getContractsForUser(user?.id).then(list => { if (mounted) setContracts(list || []); }).catch(() => setContracts([]));
        getJobs().then(list => { if (mounted) setJobs(list || []); }).catch(() => setJobs([]));
        // load project applications for projects owned by this user
        (async () => {
            try {
                const projects = await getProjects(user?.id);
                const allApps = [];
                for (const p of projects) {
                    const apps = await getProjectApplications(p.id);
                    apps.forEach(a => allApps.push({ project: p, application: a }));
                }
                if (mounted) setProjectApplications(allApps);
                // map applicant IDs to user objects (freelancers)
                try {
                    const allUsers = await getUsers('freelancer');
                    const map = {};
                    (allUsers || []).forEach(u => { map[String(u.id)] = u; });
                    if (mounted) setProjectApplicantsMap(map);
                } catch (e) {
                    if (mounted) setProjectApplicantsMap({});
                }
            } catch (e) {
                if (mounted) setProjectApplications([]);
            }
        })();
        // load notifications
        getNotifications(user?.id).then(list => { if (mounted) setNotifications(list || []); }).catch(() => setNotifications([]));
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

    const handleCreateJob = async () => {
        const title = await prompt('Título da vaga');
        if (!title) return;
        const description = await prompt('Descrição') || '';
        const category = await prompt('Categoria') || '';
        const budget = await prompt({ message: 'Orçamento', title: 'Orçamento', mask: 'money', defaultValue: '' }) || '';
        try {
            const j = await createJob(user.id, { title, description, category, budget });
            setJobs(prev => [j, ...prev]);
            await alert('Vaga criada.');
        } catch (err) {
            await alert(err?.message || 'Erro ao criar vaga');
        }
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
            const ok = await confirm({
                title: 'Confirmar Aceite',
                message: 'Ao aceitar a proposta, a empresa reterá 10% do valor do contrato como taxa de serviço. Deseja continuar?'
            });
            if (!ok) return;
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
            await alert('Proposta aceita e contrato criado.');
        } catch (e) {
            await alert(e?.message || 'Erro ao aceitar proposta');
        }
    };

    const handleRejectProposal = async (app, job) => {
        try {
            await updateApplication(app.id, { status: 'rejected' });
            await sendMessage(user.id, app.userId, `Sua proposta para "${job.title}" foi recusada.`);
            await loadProposals(job.id);
            await alert('Proposta recusada');
        } catch (e) {
            await alert(e?.message || 'Erro ao recusar proposta');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div>
            <Header userType="employer" username={user?.name} profilePicture={user?.photo} onProfileClick={() => setShowModal(true)} />
            <ProfileModal show={showModal} onClose={() => setShowModal(false)} userType="employer" username={user?.name} onLogout={handleLogout} />

            <main className="main-content">
                <section className="welcome-section">
                    <div className="welcome-content">
                        <h1 className="welcome-title">Bem-vindo(a), {user?.name || 'Empregador'}!</h1>
                        <p className="welcome-subtitle">Gerencie seus projetos e encontre os melhores talentos.</p>
                    </div>
                        <div className="welcome-illustration">
                            <div className="hero-illustration">
                                <ThemeAwareImage darkSrc={engrenatemEscuro} lightSrc={engrenatemClaro} alt="Ilustração de contratos e gestão para empregadores" className="theme-adaptable" />
                            </div>
                        </div>
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
                                <p className="card-description">
                                    Freelancer ID: {c.freelancerId} — Orçamento:{' '}
                                    {c.price != null
                                        ? Number(c.price).toLocaleString('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                        })
                                        : 'não informado'}
                                </p>
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
                                    <span>
                                        Orçamento:{' '}
                                        {j.budget !== undefined && j.budget !== null && j.budget !== ''
                                            ? Number(j.budget).toLocaleString('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL',
                                            })
                                            : 'a combinar'}
                                    </span>
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
                    <h2 className="section-title">Inscrições em Projetos</h2>
                    <div className="list-container">
                        {projectApplications.length === 0 && <p>Nenhuma inscrição em projetos.</p>}
                        {projectApplications.map(pa => {
                            const u = projectApplicantsMap[String(pa.application.userId)];
                            return (
                                <div key={pa.application.id} className="card project-application-card">
                                    <h4>{pa.project.title}</h4>
                                    <p>Usuário: {u ? `${u.name} (${u.email})` : pa.application.userId}</p>
                                    {u && u.phone && <p>Telefone: {u.phone}</p>}
                                    <p>Mensagem: {pa.application.message}</p>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="card-button" onClick={() => sendMessage(user.id, pa.application.userId, `Olá, vi sua inscrição para o projeto \"${pa.project.title}\".`)}>Falar com candidato</button>
                                        <button className="card-button" onClick={async () => { await markNotificationRead(pa.application.id).catch(()=>{}); await alert('Notificação marcada'); }}>Marcar como lida</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <h2 className="section-title">Notificações</h2>
                    <div className="list-container">
                        {notifications.length === 0 && <p>Sem notificações.</p>}
                        {notifications.map(n => (
                            <div key={n.id} className="card notification-card">
                                <p><strong>{n.type}</strong> — {JSON.stringify(n.data)}</p>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {!n.read && <button className="card-button" onClick={async () => { await markNotificationRead(n.id); n.read = true; setNotifications(s => s.map(x => x.id === n.id ? { ...x, read: true } : x)); }}>Marcar lida</button>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default EmployerHome;