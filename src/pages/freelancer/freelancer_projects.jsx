import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';
import { createProject, getProjects } from '../../services/api';
import { useEffect } from 'react';

const FreelancerProjects = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const [projects, setProjects] = useState([]);

    useEffect(() => {
        let mounted = true;
        getProjects(user?.id).then(list => { if (mounted) setProjects(list || []); }).catch(() => setProjects([]));
        return () => { mounted = false };
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleCreateProject = () => {
        if (!user) { alert('Faça login para criar projeto'); return; }
        const title = window.prompt('Título do projeto');
        if (!title) return;
        const description = window.prompt('Descrição do projeto') || '';
        createProject(user.id, { title, description }).then(p => {
            setProjects(prev => [p, ...prev]);
            alert('Projeto criado (local)');
        }).catch(err => alert(err?.message || 'Erro ao criar projeto'));
    };

    return (
        <div>
            <Header userType="freelancer" username={user?.name} onProfileClick={() => setShowModal(true)} />
            <ProfileModal show={showModal} onClose={() => setShowModal(false)} userType="freelancer" username={user?.name} onLogout={handleLogout} />

            <main className="main-content">
                <section>
                    <h2 className="section-title">Meus Projetos</h2>
                    <div style={{ marginBottom: 12 }}>
                        <button className="card-button" onClick={handleCreateProject}>Criar Novo Projeto</button>
                    </div>
                    <div className="list-container">
                        {projects.length === 0 && <p>Você ainda não tem projetos.</p>}
                        {projects.map(p => (
                            <div className="card project-card" key={p.id}>
                                <h3 className="card-title">{p.title}</h3>
                                <p className="card-description">{p.description}</p>
                                <div className="card-meta">
                                    <span>Criado em: {new Date(p.createdAt).toLocaleDateString()}</span>
                                </div>
                                <button className="card-button">Ver Detalhes</button>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default FreelancerProjects;