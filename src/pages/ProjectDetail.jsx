import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import { useAuth } from '../context/AuthContext';
import { getProjects, getUsers, sendMessage } from '../services/api';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [owner, setOwner] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const projects = await getProjects();
        const found = (projects || []).find(p => String(p.id) === String(id));
        if (!found) throw new Error('Projeto não encontrado');
        setProject(found);
        // carregar criador do projeto
        try {
          const employers = await getUsers('employer');
          const freelancers = await getUsers('freelancer');
          const all = [...(employers||[]), ...(freelancers||[])];
          const creator = all.find(u => String(u.id) === String(found.ownerId));
          setOwner(creator || null);
        } catch (_) { setOwner(null); }
      } catch (e) { setError(e.message || 'Erro ao carregar'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleMessageOwner = async () => {
    if (!user) { setError('Faça login para enviar mensagem'); return; }
    if (!owner) { setError('Criador do projeto não encontrado'); return; }
    setSending(true);
    try {
      await sendMessage(user.id, owner.id, `Olá ${owner.name || 'criador'}, vi seu projeto "${project.title}" e gostaria de conversar.`);
      navigate(`/employer_messages`);
    } catch (e) {
      setError(e?.message || 'Falha ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header userType={user?.userType} username={user?.name} profilePicture={user?.photo} onProfileClick={() => navigate(user?.userType === 'freelancer' ? '/freelancer/profile' : '/employer/profile')} />
      <div className="container" style={{ paddingTop: 16, paddingBottom: 24 }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>Voltar</button>
        {loading && <div>Carregando...</div>}
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        {!loading && !error && project && (
          <div className="card" style={{ padding: 16, border: '1px solid var(--border-color)', borderRadius: 12 }}>
            <h2 style={{ marginTop: 0 }}>{project.title}</h2>
            <p style={{ color: 'var(--text-medium)' }}>{project.description}</p>
            {owner && (
              <div className="card" style={{ padding: 12, marginTop: 12 }}>
                <div style={{ fontWeight: 600 }}>Criado por: {owner.name || owner.companyName || `Usuário ${owner.id}`}</div>
                <div style={{ color: 'var(--text-medium)' }}>{owner.email || ''}</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <button className="card-button" disabled={sending} onClick={handleMessageOwner}>
                    {sending ? 'Enviando...' : 'Enviar mensagem'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;