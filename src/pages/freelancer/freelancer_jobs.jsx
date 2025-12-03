import React, { useState } from 'react';
import frenteClaro from '../../assets/imgs/frente_claro.png';
import frenteEscuro from '../../assets/imgs/frente_escuro.png';
import ThemeAwareImage from '../../components/ThemeAwareImage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';
import { getJobs, applyToJob } from '../../services/api';
import { useAlert } from '../../components/AlertProvider';
import { usePrompt } from '../../components/PromptProvider';
import { useEffect } from 'react';

const FreelancerJobs = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
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
        return () => { mounted = false };
    }, []);

    const handleApply = async (job) => {
        if (!user) { await alert('Faça login para aplicar'); return; }
        const cover = await prompt('Digite uma breve mensagem/carta de apresentação (opcional)');
        try {
            await applyToJob(job.id, user.id, cover || '');
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
                        {jobs.map(job => (
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
                                <button className="card-button" onClick={() => handleApply(job)}>Aplicar agora</button>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default FreelancerJobs;