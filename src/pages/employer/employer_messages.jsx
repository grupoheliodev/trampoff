import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';
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
    const messagesRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        getUsers('freelancer').then(list => {
            if (mounted) setUsers(list || []);
        }).catch(() => setUsers([]));
        return () => { mounted = false };
    }, []);

    useEffect(() => {
        if (!selectedUser) return;
        let mounted = true;
        getMessages(user.id, selectedUser.id).then((msgs) => {
            if (mounted) setMessages(msgs || []);
        }).catch(() => {
            if (mounted) setMessages([]);
        });
        return () => { mounted = false };
    }, [selectedUser, user.id]);

    useEffect(() => {
        // scroll to bottom when messages change
        const el = messagesRef.current;
        if (el) {
            setTimeout(() => { el.scrollTop = el.scrollHeight; }, 50);
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedUser) return;

        setLoading(true);
        sendMessage(user.id, selectedUser.id, newMessage)
            .then(() => getMessages(user.id, selectedUser.id))
            .then((msgs) => setMessages(msgs || []))
            .catch((err) => {
                console.error('Erro ao enviar mensagem', err);
                alert(err?.message || 'Erro ao enviar mensagem');
            })
            .finally(() => setLoading(false));
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
                                                    <div className="message-avatar"><img src={selectedUser.photo || perfilFreelancer} alt="avatar" /></div>
                                                )}
                                                <div className="message-content">
                                                    <p>{msg.content}</p>
                                                    <small>{new Date(msg.createdAt || (msg.timestamp && msg.timestamp.seconds * 1000) || Date.now()).toLocaleString()}</small>
                                                </div>
                                                {msg.senderId === user.id && (
                                                    <div className="message-avatar"><img src={user?.photo || perfilFreelancer} alt="avatar" /></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="chat-input">
                                        <input
                                            type="text"
                                            placeholder="Escreva sua mensagem..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        />
                                        <button onClick={handleSendMessage} disabled={loading}>
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
