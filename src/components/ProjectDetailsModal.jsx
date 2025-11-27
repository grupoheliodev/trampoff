import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const backdrop = {
  position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
};
const container = { background: '#fff', color: '#111', width: '800px', maxWidth: '96%', borderRadius: 8, padding: 20 };

export default function ProjectDetailsModal({ show, onClose, project, onSave, fullScreen=false, isOwner=false, onApply, isApplied=false }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (project) {
      setTitle(project.title || '');
      setDescription(project.description || '');
    }
  }, [project]);

  const navigate = useNavigate();

  if (!show || !project) return null;

  const handleSave = async () => {
    if (onSave) {
      await onSave(project.id, { title, description });
    }
    setEditing(false);
  };

  const styleContainer = fullScreen ? { ...container, width: '98%', height: '92%', overflow: 'auto' } : container;

  return (
    <div style={backdrop}>
      <div style={styleContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{editing ? 'Editar Projeto' : 'Detalhes do Projeto'}</h3>
          <div>
            <button className="card-button" onClick={onClose}>Fechar</button>
            {fullScreen ? null : (
              isOwner ? (
                <button className="card-button" onClick={() => setEditing(e => !e)}>{editing ? 'Cancelar' : 'Editar'}</button>
              ) : (
                <button className="card-button" onClick={() => {
                  // navigate to dedicated route for full-screen view
                  try {
                    navigate(`/projects/${project.id}`);
                    if (onClose) onClose();
                  } catch (e) {
                    window.open(`/projects/${project.id}`, '_blank');
                  }
                }}>Abrir em Tela Maior</button>
              )
            )}
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          {editing ? (
            <div>
              <label>Título</label>
              <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
              <label>Descrição</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', minHeight: 120, padding: 8 }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button className="card-button" onClick={() => setEditing(false)}>Cancelar</button>
                <button className="card-button" onClick={handleSave}>Salvar</button>
              </div>
            </div>
          ) : (
            <div>
              <h4>{project.title}</h4>
              <p>{project.description}</p>
              <div style={{ color: '#666', fontSize: 13 }}>Criado em: {new Date(project.createdAt).toLocaleString()}</div>
              {onApply && (
                <div style={{ marginTop: 12 }}>
                  {isApplied ? (
                    <button className="card-button" disabled>Já inscrito</button>
                  ) : (
                    <button className="card-button" onClick={() => onApply(project.id)}>Inscrever-se neste projeto</button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
