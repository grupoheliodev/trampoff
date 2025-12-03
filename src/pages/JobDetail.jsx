import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import { useAuth } from '../context/AuthContext';
import { getJobs } from '../services/api';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const jobs = await getJobs();
        const found = (jobs || []).find(j => String(j.id) === String(id));
        if (!found) throw new Error('Vaga não encontrada');
        setJob(found);
      } catch (e) { setError(e.message || 'Erro ao carregar'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  return (
    <div className="page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header userType={user?.userType} username={user?.name} profilePicture={user?.photo} onProfileClick={() => navigate(user?.userType === 'freelancer' ? '/freelancer/profile' : '/employer/profile')} />
      <div className="container" style={{ paddingTop: 16, paddingBottom: 24 }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>Voltar</button>
        {loading && <div>Carregando...</div>}
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        {!loading && !error && job && (
          <div className="card" style={{ padding: 16, border: '1px solid var(--border-color)', borderRadius: 12 }}>
            <h2 style={{ marginTop: 0 }}>{job.title}</h2>
            <p style={{ color: 'var(--text-medium)' }}>{job.description}</p>
            {job.price != null && <div><strong>Preço:</strong> {job.price}</div>}
            {job.category && <div><strong>Categoria:</strong> {job.category}</div>}
            {job.status && <div><strong>Status:</strong> {job.status}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetail;