import React, { useState } from 'react';
import frenteClaro from '../../assets/imgs/frente_claro.png';
import frenteEscuro from '../../assets/imgs/frente_escuro.png';
import ThemeAwareImage from '../../components/ThemeAwareImage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';
import { getJobs, applyToJob } from '../../services/api';
import JobApplyModal from '../../components/JobApplyModal';
import { useAlert } from '../../components/AlertProvider';
import { usePrompt } from '../../components/PromptProvider';
import { useEffect } from 'react';

const FreelancerJobs = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [appliedJobIds, setAppliedJobIds] = useState([]);
    const alert = useAlert();
    const prompt = usePrompt();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const [jobs, setJobs] = useState([]);
    useEffect(() => {
        let mounted = true;
        getJobs().then(list => { if (mounted) setJobs(list || []); }).catch(() => setJobs([]));
        // carregar candidaturas existentes para desabilitar botão
        try {
            const apps = JSON.parse(localStorage.getItem('trampoff_applications')) || [];
            const ids = (apps || []).filter(a => String(a.userId) === String(user?.id) && a.jobId != null).map(a => a.jobId);
            if (mounted) setAppliedJobIds(ids);
        } catch {
            // ignore
        }
        return () => { mounted = false };
    }, [user]);

    const handleApply = async (job) => {
        if (!user) { await alert('Faça login para aplicar'); return; }
        setSelectedJob(job);
        setShowApplyModal(true);
    };

    const handleSubmitApplication = async (message) => {
        if (!user || !selectedJob) return;
        try {
            await applyToJob(selectedJob.id, user.id, message);
            setAppliedJobIds(prev => Array.from(new Set([...(prev || []), selectedJob.id])));
            setShowApplyModal(false);
            setSelectedJob(null);
            await alert('Candidatura enviada!');
        } catch (err) {
            await alert(err?.message || 'Erro ao aplicar');
        }
    };

    return (
        <div>
            <Header userType="freelancer" username={user?.name} profilePicture={user?.photo} onProfileClick={() => setShowModal(true)} />
            <ProfileModal show={showModal} onClose={() => setShowModal(false)} userType="freelancer" username={user?.name} onLogout={handleLogout} />

            <main className="main-content">
                <section>
                    <h2 className="section-title">Todos os Trabalhos Disponíveis</h2>
                    {/* Ilustração da página Trabalhos Disponíveis */}
                    <div className="jobs-hero">
                        <ThemeAwareImage darkSrc={frenteEscuro} lightSrc={frenteClaro} alt="Trabalhos disponíveis" className="jobs-illustration theme-adaptable" />
                    </div>
                    <div className="list-container">
                        {jobs.length === 0 && <p>Nenhuma vaga disponível no momento.</p>}
                        {jobs.filter(job => !appliedJobIds.includes(job.id)).map(job => (
                            <div className="card job-card" key={job.id}>
                                <h3 className="card-title">{job.title}</h3>
                                <p className="card-description">{job.description}</p>
                                <div className="card-meta">
                                    <span>Categoria: {job.category || 'Geral'}</span>
                                    <span>
                                        Orçamento:{' '}
                                        {job.budget !== undefined && job.budget !== null && job.budget !== ''
                                            ? Number(job.budget).toLocaleString('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL',
                                            })
                                            : 'a combinar'}
                                    </span>
                                </div>
                                <button className="card-button" onClick={() => handleApply(job)} disabled={appliedJobIds.includes(job.id)}>
                                    {appliedJobIds.includes(job.id) ? 'Já aplicado' : 'Aplicar agora'}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
                <section>
                    <h2 className="section-title">Vagas já aplicadas</h2>
                    <div className="list-container">
                        {jobs.filter(job => appliedJobIds.includes(job.id)).length === 0 && <p>Você ainda não aplicou em nenhuma vaga.</p>}
                        {jobs.filter(job => appliedJobIds.includes(job.id)).map(job => (
                            <div className="card job-card" key={`applied-${job.id}`}>
                                <h3 className="card-title">{job.title}</h3>
                                <p className="card-description">{job.description}</p>
                                <div className="card-meta">
                                    <span>Categoria: {job.category || 'Geral'}</span>
                                    <span>
                                        Orçamento:{' '}
                                        {job.budget !== undefined && job.budget !== null && job.budget !== ''
                                            ? Number(job.budget).toLocaleString('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL',
                                            })
                                            : 'a combinar'}
                                    </span>
                                </div>
                                <button className="card-button" disabled>
                                    Já aplicado
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <JobApplyModal
                open={showApplyModal}
                job={selectedJob}
                onCancel={() => { setShowApplyModal(false); setSelectedJob(null); }}
                onSubmit={handleSubmitApplication}
            />
        </div>
    );
};

export default FreelancerJobs;