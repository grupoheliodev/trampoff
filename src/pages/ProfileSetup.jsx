import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUser } from '../services/api';

const ProfileSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState(user?.title || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [languages, setLanguages] = useState((user?.languages || []).join(', '));
  const [skills, setSkills] = useState((user?.skills || []).join(', '));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { setMsg(''); }, [title, bio, languages, skills]);

  const save = async () => {
    if (!user || !user.id) { setMsg('Usuário não autenticado'); return; }
    setSaving(true);
    try {
      const data = await updateUser(user.id, {
        title,
        bio,
        languages: languages.split(',').map(s => s.trim()).filter(Boolean),
        skills: skills.split(',').map(s => s.trim()).filter(Boolean)
      });
      setMsg('Perfil atualizado com sucesso');
      // Redirecionar para home conforme tipo de usuário
      const type = (user?.userType || '').toLowerCase();
      const target = type === 'employer' || type === 'contratante' ? '/employer/home' : '/freelancer/home';
      // Dar um pequeno delay para o usuário ver a confirmação
      setTimeout(() => navigate(target), 600);
    } catch (e) {
      setMsg(e.message || 'Erro ao salvar');
    } finally { setSaving(false); }
  };

  return (
    <div className="page profile-setup container" style={{ maxWidth: 720, margin: '24px auto' }}>
      <h2>Complete seu Perfil</h2>
      <p>Preencha suas linguagens, habilidades e título profissional. Estas informações aparecerão no seu perfil.</p>
      <div className="form-group">
        <label>Título Profissional</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="Ex: Desenvolvedor Fullstack" />
      </div>
      <div className="form-group">
        <label>Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Resumo profissional"></textarea>
      </div>
      <div className="form-group">
        <label>Linguagens (separadas por vírgula)</label>
        <input value={languages} onChange={(e) => setLanguages(e.target.value)} type="text" placeholder="Ex: JavaScript, Python" />
      </div>
      <div className="form-group">
        <label>Habilidades (separadas por vírgula)</label>
        <input value={skills} onChange={(e) => setSkills(e.target.value)} type="text" placeholder="Ex: React, Node.js" />
      </div>
      <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
      {msg && <div style={{ marginTop: 12 }}>{msg}</div>}
    </div>
  );
};

export default ProfileSetup;
