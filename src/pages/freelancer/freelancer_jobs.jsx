import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';
import { getJobs, applyToJob } from '../../services/api';
import { useEffect } from 'react';

const FreelancerJobs = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

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

    const handleApply = (job) => {
        if (!user) { alert('Faça login para aplicar'); return; }
        const cover = window.prompt('Digite uma breve mensagem/carta de apresentação (opcional)');
        applyToJob(job.id, user.id, cover || '').then(() => {
            alert('Candidatura enviada!');
        }).catch(err => { alert(err?.message || 'Erro ao aplicar'); });
    };

    return (
        <div>
            <Header userType="freelancer" username={user?.name} onProfileClick={() => setShowModal(true)} />
            <ProfileModal show={showModal} onClose={() => setShowModal(false)} userType="freelancer" username={user?.name} onLogout={handleLogout} />

            <main className="main-content">
                <section>
                    <h2 className="section-title">Todos os Trabalhos Disponíveis</h2>
                    <div className="list-container">
                        {jobs.length === 0 && <p>Nenhuma vaga disponível no momento.</p>}
                        {jobs.map(job => (
                            <div className="card job-card" key={job.id}>
                                <h3 className="card-title">{job.title}</h3>
                                <p className="card-description">{job.description}</p>
                                <div className="card-meta">
                                    <span>Categoria: {job.category || 'Geral'}</span>
                                    <span>Orçamento: {job.budget || 'a combinar'}</span>
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