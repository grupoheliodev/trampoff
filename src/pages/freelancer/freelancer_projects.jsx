import React, { useState } from 'react';
import chaoClaro from '../../assets/imgs/chao_claro.png';
import chaoEscuro from '../../assets/imgs/chao_escuro.png';
import ThemeAwareImage from '../../components/ThemeAwareImage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';
import { createProject, getProjects, applyToProject, updateProject, getProjectApplications } from '../../services/api';
import CreateProjectModal from '../../components/CreateProjectModal';
import ProjectDetailsModal from '../../components/ProjectDetailsModal';
import { useEffect } from 'react';
import { useAlert } from '../../components/AlertProvider';
import { usePrompt } from '../../components/PromptProvider';

const FreelancerProjects = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [availableProjects, setAvailableProjects] = useState([]);
    const [appliedProjectIds, setAppliedProjectIds] = useState([]);
    const alert = useAlert();
    const prompt = usePrompt();

    const [projects, setProjects] = useState([]);

    useEffect(() => {
        let mounted = true;
        getProjects(user?.id).then(list => { if (mounted) setProjects(list || []); }).catch(() => setProjects([]));
        // fetch all projects for availability
        getProjects().then(async (list) => {
            if (!mounted) return;
            const others = (list || []).filter(p => String(p.ownerId) !== String(user?.id));
            setAvailableProjects(others);
            try {
                // build applied-projects set for current user
                const checks = await Promise.all(others.map(async (p) => {
                    try {
                        const apps = await getProjectApplications(p.id);
                        return apps && apps.some(a => String(a.userId) === String(user?.id));
                    } catch (e) { return false; }
                }));
                const ids = others.filter((_, idx) => checks[idx]).map(p => p.id);
                setAppliedProjectIds(ids);
            } catch (e) {
                setAppliedProjectIds([]);
            }
        }).catch(() => setAvailableProjects([]));
        return () => { mounted = false };
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleCreateProject = async (payload) => {
        if (!user) { await alert('Faça login para criar projeto'); return; }
        try {
            const p = await createProject(user.id, payload);
            setProjects(prev => [p, ...prev]);
            setAvailableProjects(prev => prev.filter(a => String(a.id) !== String(p.id)));
            await alert('Projeto criado com sucesso.');
        } catch (err) {
            await alert(err?.message || 'Erro ao criar projeto');
            throw err;
        }
    };

    const handleOpenDetails = (p) => {
        setSelectedProject(p);
    };

    const handleApplyToProject = async (projectId) => {
        if (!user) { await alert('Faça login para se inscrever'); return; }
        try {
            await applyToProject(projectId, user.id, 'Quero participar deste projeto');
            await alert('Inscrição enviada com sucesso. O proprietário será notificado.');
            setAppliedProjectIds(prev => Array.from(new Set([...(prev || []), projectId])));
        } catch (err) {
            await alert(err?.message || 'Erro ao se inscrever');
        }
    };

    const handleSaveProject = async (id, updates) => {
        try {
            const updated = await updateProject(id, updates);
            setProjects(prev => prev.map(p => String(p.id) === String(id) ? updated : p));
            setAvailableProjects(prev => prev.map(p => String(p.id) === String(id) ? updated : p));
            await alert('Projeto atualizado');
        } catch (e) {
            await alert(e?.message || 'Erro ao atualizar projeto');
        }
    };

    return (
        <div>
            <Header userType="freelancer" username={user?.name} profilePicture={user?.photo} onProfileClick={() => setShowModal(true)} />
            <ProfileModal show={showModal} onClose={() => setShowModal(false)} userType="freelancer" username={user?.name} onLogout={handleLogout} />

            <main className="main-content">
                <section>
                    <h2 className="section-title">Meus Projetos</h2>
                    {/* Estado vazio: texto em cima, ilustração única no meio e botão embaixo */}
                    {projects.length === 0 && (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                <p>Você ainda não tem projeto.</p>
                            </div>
                            <div className="projects-hero" role="region" aria-label="Sem projetos">
                                <div className="projects-hero-inner">
                                    <ThemeAwareImage lightSrc={chaoClaro} darkSrc={chaoEscuro} alt="Meus projetos" className="projects-illustration theme-adaptable" />
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <button className="card-button" onClick={() => setShowCreateModal(true)}>CRIAR NOVO PROJETO</button>
                            </div>
                        </>
                    )}
                    <div className="list-container">
                        {projects.length > 0 && projects.map(p => (
                            <div className="card project-card" key={p.id}>
                                <h3 className="card-title">{p.title}</h3>
                                <p className="card-description">{p.description}</p>
                                <div className="card-meta">
                                    <span>Criado em: {new Date(p.createdAt).toLocaleDateString()}</span>
                                </div>
                                <button className="card-button" onClick={() => handleOpenDetails(p)}>Ver Detalhes</button>
                            </div>
                        ))}
                    </div>
                    {/* Available projects (others) */}
                    <h2 className="section-title">Projetos Disponíveis</h2>
                    <div className="list-container">
                        {availableProjects.length === 0 && <p>Nenhum projeto disponível no momento.</p>}
                        {availableProjects.map(p => (
                            <div className="card project-card" key={p.id}>
                                <h3 className="card-title">{p.title}</h3>
                                <p className="card-description">{p.description}</p>
                                <div className="card-meta"><span>Criado em: {new Date(p.createdAt).toLocaleDateString()}</span></div>
                                <div style={{ marginTop: 8 }}>
                                    <button className="card-button" onClick={() => { setSelectedProject(p); }}>Ver Detalhes</button>
                                    {appliedProjectIds && appliedProjectIds.includes(p.id) ? (
                                        <button className="card-button" disabled>Já inscrito</button>
                                    ) : (
                                        <button className="card-button" onClick={() => handleApplyToProject(p.id)}>Inscrever-se</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <CreateProjectModal show={showCreateModal} onClose={() => setShowCreateModal(false)} onSave={handleCreateProject} ownerId={user?.id} />
            <ProjectDetailsModal show={!!selectedProject} onClose={() => setSelectedProject(null)} project={selectedProject} onSave={handleSaveProject} isOwner={selectedProject && String(selectedProject.ownerId) === String(user?.id)} onApply={handleApplyToProject} isApplied={selectedProject && appliedProjectIds && appliedProjectIds.includes(selectedProject.id)} />
        </div>
    );
};

export default FreelancerProjects;