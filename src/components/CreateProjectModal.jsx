import React, { useState, useEffect } from 'react';

const modalStyle = {
  position: 'fixed',
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0,0,0,0.6)',
  zIndex: 3000
};

const boxStyle = {
  width: '600px',
  maxWidth: '95%',
  background: '#1f2937',
  color: '#fff',
  padding: '20px',
  borderRadius: 8,
  boxShadow: '0 6px 18px rgba(0,0,0,0.4)'
};

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  marginBottom: 10,
  borderRadius: 4,
  border: '1px solid #374151',
  background: '#111827',
  color: '#fff'
};

export default function CreateProjectModal({ show, onClose, onSave, ownerId }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!show) {
      setTitle(''); setDescription('');
    }
  }, [show]);

  if (!show) return null;

  const handleSave = async () => {
    if (!title || !ownerId) return;
    try {
      await onSave({ title, description });
      onClose();
    } catch (e) {
      console.error('Erro ao salvar projeto:', e);
      // Let caller handle error
    }
  };

  return (
    <div style={modalStyle}>
      <div style={boxStyle}>
        <h3 style={{ marginTop: 0 }}>Criar Projeto</h3>
        <label>Título</label>
        <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} />
        <label>Descrição</label>
        <textarea style={{ ...inputStyle, minHeight: 100 }} value={description} onChange={e => setDescription(e.target.value)} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <button className="card-button" onClick={onClose}>Cancelar</button>
          <button className="card-button" onClick={handleSave}>Salvar</button>
        </div>
      </div>
    </div>
  );
}
