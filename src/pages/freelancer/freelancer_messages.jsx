import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';

// Mock data for users (employers)
const mockUsers = [
    { id_usuario: 1, nome: 'João Silva' },
    { id_usuario: 2, nome: 'Maria Santos' },
    { id_usuario: 3, nome: 'Carlos Oliveira' },
    { id_usuario: 4, nome: 'Ana Pereira' },
];

// Mock data for messages
const mockMessages = {
    '1-1': [
        { id: 1, content: 'Olá, estou interessado no seu trabalho!', senderId: 1, receiverId: 1, timestamp: { seconds: Date.now() / 1000 } },
        { id: 2, content: 'Obrigado! Podemos discutir os detalhes?', senderId: 1, receiverId: 1, timestamp: { seconds: Date.now() / 1000 + 60 } },
    ],
    '1-2': [
        { id: 3, content: 'Preciso de um freelancer para um projeto.', senderId: 2, receiverId: 1, timestamp: { seconds: Date.now() / 1000 + 120 } },
        { id: 4, content: 'Claro, qual é o projeto?', senderId: 1, receiverId: 2, timestamp: { seconds: Date.now() / 1000 + 180 } },
    ],
    '1-3': [
        { id: 5, content: 'Seu portfólio parece ótimo!', senderId: 3, receiverId: 1, timestamp: { seconds: Date.now() / 1000 + 240 } },
    ],
    '1-4': [
        { id: 6, content: 'Olá, tudo bem?', senderId: 4, receiverId: 1, timestamp: { seconds: Date.now() / 1000 + 300 } },
    ],
};

const FreelancerMessages = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [users, setUsers] = useState(mockUsers);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedUser) {
            const key = `${user.id_usuario}-${selectedUser.id_usuario}`;
            setMessages(mockMessages[key] || []);
        }
    }, [selectedUser, user.id_usuario]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedUser) return;

        setLoading(true);
        // Simulate sending message
        setTimeout(() => {
            const newMsg = {
                id: Date.now(),
                content: newMessage,
                senderId: user.id_usuario,
                receiverId: selectedUser.id_usuario,
                timestamp: { seconds: Date.now() / 1000 }
            };
            const key = `${user.id_usuario}-${selectedUser.id_usuario}`;
            const updatedMessages = [...(mockMessages[key] || []), newMsg];
            mockMessages[key] = updatedMessages;
            setMessages(updatedMessages);
            setNewMessage('');
            setLoading(false);
        }, 500); // Simulate delay
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div>
            <Header userType="freelancer" username={user?.name} onProfileClick={() => setShowModal(true)} />
            <ProfileModal show={showModal} onClose={() => setShowModal(false)} userType="freelancer" username={user?.name} onLogout={handleLogout} />

            <main className="main-content">
                <section>
                    <h2 className="section-title">Mensagens</h2>
                    <div className="messages-container">
                        <div className="message-list card">
                            <h4>Conversas Recentes</h4>
                            <ul>
                                {users.map((u) => (
                                    <li
                                        key={u.id_usuario}
                                        onClick={() => setSelectedUser(u)}
                                        className={selectedUser?.id_usuario === u.id_usuario ? 'selected' : ''}
                                    >
                                        {u.nome}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="chat-box card">
                            {selectedUser ? (
                                <>
                                    <h4>Conversa com {selectedUser.nome}</h4>
                                    <div className="chat-messages">
                                        {messages.map((msg) => (
                                            <div key={msg.id} className={`message ${msg.senderId === user.id ? 'sent' : 'received'}`}>
                                                <p>{msg.content}</p>
                                                <small>{new Date(msg.timestamp.seconds * 1000).toLocaleString()}</small>
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

export default FreelancerMessages;
