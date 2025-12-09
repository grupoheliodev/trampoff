import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

const STORAGE_KEY = 'school_events';

const SchoolEvents = () => {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [school, setSchool] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEvents(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const save = (next) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (e) {}
    setEvents(next);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title || !date || !school) return;
    const next = [{ id: Date.now(), title, date, school }, ...events];
    save(next);
    setTitle(''); setDate(''); setSchool('');
  };

  const handleRemove = (id) => {
    const next = events.filter(ev => ev.id !== id);
    save(next);
  };

  return (
    <div>
      <Header />
      <main className="main-content">
        <section>
          <h2 className="section-title">Eventos Escolares</h2>
          <div className="card" style={{ padding: 12, maxWidth: 720 }}>
            <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input placeholder="Título do Evento" value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: '1 1 240px' }} />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <input placeholder="Escola" value={school} onChange={(e) => setSchool(e.target.value)} />
              <button type="submit">Adicionar</button>
            </form>
            <div style={{ marginTop: 12 }}>
              {events.length === 0 && <p>Nenhum evento cadastrado.</p>}
              {events.map(ev => (
                <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <div>
                    <strong>{ev.title}</strong>
                    <div style={{ fontSize: 12, color: '#666' }}>{ev.school} — {new Date(ev.date).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <button onClick={() => handleRemove(ev.id)} style={{ background: 'transparent', border: 'none', color: '#e53935' }}>Remover</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SchoolEvents;
