import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjects, getProjectApplications, getUsers, updateProject, applyToProject } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../components/AlertProvider';

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const alert = useAlert();
  const [project, setProject] = useState(null);
  const [applications, setApplications] = useState([]);
  const [applicantsMap, setApplicantsMap] = useState({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const projects = await getProjects();
        const p = (projects || []).find(x => String(x.id) === String(id));
        if (!p) {
          alert('Projeto não encontrado');
          navigate('/');
          return;
        }
        if (mounted) setProject(p);
        const apps = await getProjectApplications(p.id);
        if (mounted) setApplications(apps || []);
        // load users and map
        const users = await getUsers('freelancer');
        const map = {};
        (users || []).forEach(u => { map[String(u.id)] = u; });
        if (mounted) setApplicantsMap(map);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { mounted = false };
  }, [id]);

  const handleEdit = async (updates) => {
    if (!project) return;
    try {
      const updated = await updateProject(project.id, updates);
      setProject(updated);
      alert('Projeto atualizado');
    } catch (e) {
      alert(e?.message || 'Erro');
    }
  };

  const handleApply = async () => {
    if (!user) { alert('Faça login para se inscrever'); return; }
    try {
      await applyToProject(project.id, user.id, 'Inscrição via página do projeto');
      alert('Inscrição enviada');
    } catch (e) {
      alert(e?.message || 'Erro');
    }
  };

  if (!project) return <div className="main-content"><p>Carregando...</p></div>;

  const isOwner = String(project.ownerId) === String(user?.id);

  return (
    <div className="main-content" style={{ padding: 20 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h1>{project.title}</h1>
        <p>{project.description}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {isOwner ? (
            <button className="card-button" onClick={() => handleEdit({ title: project.title, description: project.description })}>Editar</button>
          ) : (
            <button className="card-button" onClick={handleApply}>Inscrever-se</button>
          )}
          <button className="card-button" onClick={() => navigate(-1)}>Voltar</button>
        </div>

        <h3 style={{ marginTop: 24 }}>Inscrições</h3>
        {applications.length === 0 && <p>Nenhuma inscrição.</p>}
        {applications.map(a => (
          <div key={a.id} className="card" style={{ marginBottom: 8 }}>
            <strong>{(applicantsMap[String(a.userId)] && applicantsMap[String(a.userId)].name) || `Usuário ${a.userId}`}</strong>
            <div style={{ color: '#666' }}>{(applicantsMap[String(a.userId)] && applicantsMap[String(a.userId)].email) || ''}</div>
            <div style={{ marginTop: 6 }}>{a.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
