import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';
import { useAlert } from '../../components/AlertProvider';
import { getUsers, getMessages, sendMessage } from '../../services/api';
import perfilFreelancer from '../../assets/imgs/perfil_freelancer.png';


const EmployerMessages = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const alert = useAlert();
    const messagesRef = useRef(null);
    const inputRef = useRef(null);
    const composingRef = useRef(false);
    const [isComposing, setIsComposing] = useState(false);

    // Atualização de perfis via REST
    useEffect(() => {
        let mounted = true;
        const loadUsers = async () => {
            try {
                const list = await getUsers('freelancer');
                if (mounted) setUsers(list || []);
                if (selectedUser && list.length > 0) {
                    const updated = list.find(u => u.id === selectedUser.id);
                    if (updated) setSelectedUser(updated);
                }
            } catch (e) {
                setUsers([]);
            }
        };
        loadUsers();
        const interval = setInterval(loadUsers, 2000);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [selectedUser]);

    // support opening conversation via ?userId= in URL
    const location = useLocation();
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const uid = params.get('userId');
        if (uid && users && users.length > 0) {
            const found = users.find(u => String(u.id) === String(uid));
            if (found) setSelectedUser(found);
        }
    }, [location.search, users]);

    // Atualização de mensagens via REST
    useEffect(() => {
        if (!selectedUser) return;
        let mounted = true;
        const loadMessages = async () => {
            try {
                const msgs = await getMessages(user.id, selectedUser.id);
                if (mounted) {
                    const enriched = (msgs || []).map(m => ({
                        ...m,
                        senderPhoto: m.senderId === user.id ? (user?.photo || perfilFreelancer) : (users.find(u => String(u.id) === String(m.senderId))?.photo || perfilFreelancer)
                    }));
                    setMessages(enriched);
                }
            } catch (e) {
                if (mounted) setMessages([]);
            }
        };
        loadMessages();
        const interval = setInterval(loadMessages, 1500);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [selectedUser, user.id]);

    useEffect(() => {
        // scroll to bottom when messages change
        const el = messagesRef.current;
        if (el) {
            setTimeout(() => { el.scrollTop = el.scrollHeight; }, 50);
        }
    }, [messages]);

    const handleSendMessage = async () => {
        // Do not send while IME composition is in progress
        if (composingRef.current) return;
        const content = (newMessage || '').trim();
        if (!content || !selectedUser) return;
        // clear input immediately so it disappears from typing area
        setNewMessage('');
        setLoading(true);
        try {
            // optimistic UI: append locally immediately and include senderPhoto
            const temp = {
                id: `tmp-${Date.now()}`,
                senderId: user.id,
                receiverId: selectedUser.id,
                content,
                createdAt: new Date().toISOString(),
                senderPhoto: user?.photo || perfilFreelancer,
            };
            setMessages(prev => [...(prev || []), temp]);

            // send to backend (localStorage or API)
            await sendMessage(user.id, selectedUser.id, content);

            // Ensure messages are up-to-date and enrich with photos when possible
            const msgs = await getMessages(user.id, selectedUser.id) || [];
            const enriched = (msgs || []).map(m => ({
                ...m,
                senderPhoto: m.senderId === user.id ? (user?.photo || perfilFreelancer) : (users.find(u => String(u.id) === String(m.senderId))?.photo || perfilFreelancer)
            }));
            setMessages(enriched);
        } catch (err) {
            console.error('Erro ao enviar mensagem', err);
            await alert(err?.message || 'Erro ao enviar mensagem');
        } finally {
            setLoading(false);
            // ensure input regains focus for fast subsequent messages
            try { if (inputRef.current) inputRef.current.focus(); } catch(e){}
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div>
            <Header userType="employer" username={user?.name} onProfileClick={() => setShowModal(true)} />
            <ProfileModal show={showModal} onClose={() => setShowModal(false)} userType="employer" username={user?.name} onLogout={handleLogout} />
            <main className="main-content">
                <section>
                    <h2 className="section-title">Mensagens</h2>
                    <div className="messages-container">
                        <div className="message-list card">
                            <h4>Conversas Recentes</h4>
                            <ul>
                                {users.map((u) => (
                                    <li
                                        key={u.id}
                                        onClick={() => setSelectedUser(u)}
                                        className={selectedUser?.id === u.id ? 'selected user-list-item' : 'user-list-item'}
                                    >
                                        <div className="user-avatar"><img src={u.photo || perfilFreelancer} alt="avatar" /></div>
                                        <div className="user-info">
                                            <div className="user-name">{u.name || u.email}</div>
                                            <div className="user-sub">{u.tagline || ''}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="chat-box card">
                            {selectedUser ? (
                                <>
                                    <h4>Conversa com {selectedUser.name || selectedUser.email}</h4>
                                    <div className="chat-messages" ref={messagesRef}>
                                        {messages.map((msg) => (
                                            <div key={msg.id} className={`message ${msg.senderId === user.id ? 'sent' : 'received'}`}>
                                                {msg.senderId !== user.id && (
                                                    <div className="message-avatar"><img src={msg.senderPhoto || selectedUser?.photo || perfilFreelancer} alt="avatar" /></div>
                                                )}
                                                <div className="message-content">
                                                    <p>{msg.content}</p>
                                                    <small>{new Date(msg.createdAt || (msg.timestamp && msg.timestamp.seconds * 1000) || Date.now()).toLocaleString()}</small>
                                                </div>
                                                {msg.senderId === user.id && (
                                                    <div className="message-avatar"><img src={msg.senderPhoto || user?.photo || perfilFreelancer} alt="avatar" /></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="chat-input">
                                        <input
                                            type="text"
                                            placeholder="Escreva sua mensagem..."
                                            value={newMessage}
                                            ref={inputRef}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onCompositionStart={() => { composingRef.current = true; setIsComposing(true); }}
                                            onCompositionEnd={() => { composingRef.current = false; setIsComposing(false); }}
                                            onKeyDown={(e) => { if (e.key === 'Enter' && !composingRef.current) { e.preventDefault(); handleSendMessage(); } }}
                                            autoComplete="off"
                                        />
                                        <button type="button" onClick={() => { if (composingRef.current) return; handleSendMessage(); }} disabled={loading || isComposing}>
                                            {loading ? 'Enviando...' : 'Enviar'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <p>Selecione um usuário para iniciar uma conversa.</p>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default EmployerMessages;
