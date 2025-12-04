import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { unifiedSearch } from '../services/api';
import Header from '../components/Header.jsx';
import { useAuth } from '../context/AuthContext';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [results, setResults] = useState({ users: [], jobs: [], projects: [], messages: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || localStorage.getItem('trampoff_last_search') || '';
    setQ(query);
    if (!query || query.trim().length < 1) { setResults({ users: [], jobs: [], projects: [], messages: [] }); return; }
    const run = async () => {
      setLoading(true); setError('');
      try {
        const data = await unifiedSearch(query);
        setResults({
          users: data.users || [],
          jobs: data.jobs || [],
          projects: data.projects || [],
          messages: data.messages || [],
        });
        try { localStorage.setItem('trampoff_last_search', query); } catch (e) {}
      } catch (e) {
        setError(e.message || 'Erro na busca');
      } finally { setLoading(false); }
    };
    run();
  }, [location.search]);

  const onSubmit = (e) => {
    e.preventDefault();
    const query = q.trim();
    try { localStorage.setItem('trampoff_last_search', query); } catch (e) {}
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const onBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      const base = (user?.userType || '').toLowerCase() === 'freelancer' ? '/freelancer/home' : '/employer/home';
      navigate(base);
    }
  };

  const highlight = (text, term) => {
    const t = String(text || '');
    const q = String(term || '').trim();
    if (!q) return t;
    try {
      const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
      return t.split(re).map((part, idx) => re.test(part) ? (<mark key={idx}>{part}</mark>) : part);
    } catch (e) { return t; }
  };

  const goToResult = (r) => {
    if (r.type === 'user') {
      const isFreelancer = String(r.item.userType || '').toLowerCase() === 'freelancer';
      const base = isFreelancer ? '/employer/messages' : '/freelancer/messages';
      const meIsFreelancer = (user?.userType || '').toLowerCase() === 'freelancer';
      const targetBase = meIsFreelancer ? '/freelancer/messages' : '/employer/messages';
      navigate(`${targetBase}?userId=${encodeURIComponent(r.item.id)}`);
      return;
    }
    if (r.type === 'job') {
      navigate(`/jobs/${encodeURIComponent(r.item.id)}`);
      return;
    }
    if (r.type === 'project') {
      navigate(`/projects/${encodeURIComponent(r.item.id)}`);
      return;
    }
    if (r.type === 'message') {
      const otherId = String(r.item.senderId) === String(user?.id) ? r.item.receiverId : r.item.senderId;
      const meIsFreelancer = (user?.userType || '').toLowerCase() === 'freelancer';
      const base = meIsFreelancer ? '/freelancer/messages' : '/employer/messages';
      navigate(`${base}?userId=${encodeURIComponent(otherId)}`);
      return;
    }
  };

  return (
    <div className="page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header userType={user?.userType} username={user?.name} profilePicture={user?.photo} onProfileClick={() => navigate(user?.userType === 'freelancer' ? '/freelancer/profile' : '/employer/profile')} />
      <div className="container" style={{ paddingTop: 16, paddingBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <button className="btn btn-secondary" onClick={onBack}>Voltar</button>
          <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, flex: 1 }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} type="text" placeholder="Buscar..." style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)' }} />
            <button className="btn btn-primary" type="submit">Buscar</button>
          </form>
        </div>
        {loading && <div>Carregando...</div>}
        {error && <div style={{ color: 'crimson' }}>{error}</div>}

        {!loading && !error && (
          (results.users.length + results.jobs.length + results.projects.length + results.messages.length === 0)
            ? <div style={{ marginTop: 16 }}>Nenhum resultado encontrado</div>
            : (
              <ul className="results-list" style={{ listStyle: 'none', padding: 0 }}>
                {results.users.map((u) => (
                  <li key={`user-${u.id}`} className="result-item" onClick={() => goToResult({ type: 'user', item: u })} style={{ padding: '12px 14px', border: '1px solid var(--border-color)', borderRadius: 12, marginBottom: 10, cursor: 'pointer' }}>
                    <div style={{ fontWeight: 700 }}>{highlight(u.name || u.email, q)}</div>
                    <div style={{ color: 'var(--text-medium)' }}>{u.userType || u.role}</div>
                  </li>
                ))}
                {results.jobs.map((j) => (
                  <li key={`job-${j.id}`} className="result-item" onClick={() => goToResult({ type: 'job', item: j })} style={{ padding: '12px 14px', border: '1px solid var(--border-color)', borderRadius: 12, marginBottom: 10, cursor: 'pointer' }}>
                    <div style={{ fontWeight: 700 }}>{highlight(j.title, q)}</div>
                    <div style={{ color: 'var(--text-medium)' }}>{highlight(j.description, q)}</div>
                  </li>
                ))}
                {results.projects.map((p) => (
                  <li key={`project-${p.id}`} className="result-item" onClick={() => goToResult({ type: 'project', item: p })} style={{ padding: '12px 14px', border: '1px solid var(--border-color)', borderRadius: 12, marginBottom: 10, cursor: 'pointer' }}>
                    <div style={{ fontWeight: 700 }}>{highlight(p.title, q)}</div>
                    <div style={{ color: 'var(--text-medium)' }}>{highlight(p.description, q)}</div>
                  </li>
                ))}
                {results.messages.map((m) => (
                  <li key={`message-${m.id}`} className="result-item" onClick={() => goToResult({ type: 'message', item: m })} style={{ padding: '12px 14px', border: '1px solid var(--border-color)', borderRadius: 12, marginBottom: 10, cursor: 'pointer' }}>
                    <div style={{ fontWeight: 700 }}>Mensagem</div>
                    <div style={{ color: 'var(--text-medium)' }}>{highlight(String(m.content || m.conteudo || '').slice(0, 120), q)}</div>
                  </li>
                ))}
              </ul>
            )
        )}
      </div>
    </div>
  );
};

export default SearchResults;