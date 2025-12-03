import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';
import { useAlert } from '../../components/AlertProvider';
import { getUsers, getMessages, sendMessage, createMessageNotification, markChatNotificationsRead, getMessageSummaries, getNotifications } from '../../services/api';
import { requestNotificationPermission, notify } from '../../components/notify';
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
    const lastMsgIdRef = useRef(null);
    const [lastActivity, setLastActivity] = useState({}); // { [userId]: timestamp }
    const [unreadMap, setUnreadMap] = useState({}); // { [userId]: true }
    const selectedIdRef = useRef(null);
    const lastActivityRef = useRef({});
    const lastSummaryRef = useRef({}); // { [otherUserId]: lastMessageId }
    const usersRef = useRef([]);

    // Helper: compute last message timestamp for each user (local fallback)
    const getLastMessageAtMap = () => {
        if (!user || !user.id) return {};
        try {
            const raw = localStorage.getItem('messages');
            const msgs = raw ? JSON.parse(raw) : [];
            const map = {};
            for (const m of msgs) {
                const a = String(m.senderId);
                const b = String(m.receiverId);
                if (a === String(user.id) || b === String(user.id)) {
                    const other = a === String(user.id) ? b : a;
                    const ts = new Date(m.createdAt || m.timestamp || Date.now()).getTime();
                    if (!map[other] || ts > map[other]) map[other] = ts;
                }
            }
            return map;
        } catch { return {}; }
    };

    const sortUsersByActivity = (list) => {
        const localMap = getLastMessageAtMap();
        const map = { ...localMap, ...(lastActivityRef.current || {}) };
        const copy = [...(list || [])];
        copy.sort((u1, u2) => {
            const t1 = map[String(u1.id)] || 0;
            const t2 = map[String(u2.id)] || 0;
            return t2 - t1;
        });
        return copy;
    };

    // Atualização de perfis via REST (independente do usuário selecionado)
    useEffect(() => {
        let mounted = true;
        const loadUsers = async () => {
            try {
                const list = await getUsers('freelancer');
                if (mounted) {
                    const sorted = sortUsersByActivity(list || []);
                    setUsers(sorted);
                    usersRef.current = sorted;
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
    }, []);

    // keep refs in sync with latest values (used by polling closure)
    useEffect(() => { selectedIdRef.current = selectedUser?.id ?? null; }, [selectedUser?.id]);
    useEffect(() => { lastActivityRef.current = lastActivity || {}; }, [lastActivity]);
    useEffect(() => { usersRef.current = users || []; }, [users]);

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

                    // Notification on new incoming messages from the other user
                    const last = enriched[enriched.length - 1];
                    const lastTs = last ? new Date(last.createdAt || (last.timestamp && last.timestamp.seconds * 1000) || Date.now()).getTime() : 0;
                    if (last) {
                        setLastActivity(prev => ({ ...prev, [String(selectedUser.id)]: lastTs }));
                    }
                    if (last && last.id !== lastMsgIdRef.current && user && String(last.senderId) !== String(user.id)) {
                        lastMsgIdRef.current = last.id;
                        if (document.hidden) {
                            requestNotificationPermission().then((granted) => {
                                if (granted) {
                                    notify({
                                        title: `Nova mensagem de ${selectedUser.name || selectedUser.email}`,
                                        body: String(last.content || '').slice(0, 120),
                                        tag: `chat-${user.id}-${selectedUser.id}`,
                                        data: { from: selectedUser.id, to: user.id },
                                    });
                                }
                            });
                        }
                        // Create a local notification entry for header badge
                        createMessageNotification({ ownerId: user.id, fromId: selectedUser.id, content: last.content || '' }).catch(() => {});
                        // Re-sort list based on activity so this chat stays first
                        setUsers(prev => sortUsersByActivity(prev));
                    } else if (last && last.id !== lastMsgIdRef.current) {
                        // update last seen even if it's our own message
                        lastMsgIdRef.current = last.id;
                        setUsers(prev => sortUsersByActivity(prev));
                    }
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
    }, [selectedUser?.id, user?.id, users]);

    // Ask for notification permission on first render
    useEffect(() => {
        requestNotificationPermission();
    }, []);

    useEffect(() => {
        // scroll to bottom when messages change
        const el = messagesRef.current;
        if (el) {
            setTimeout(() => { el.scrollTop = el.scrollHeight; }, 50);
        }
    }, [messages]);

    // Mark chat notifications as read when opening a conversation
    useEffect(() => {
        if (!selectedUser) return;
        markChatNotificationsRead({ ownerId: user.id, otherUserId: selectedUser.id })
            .then(() => {
                setUnreadMap(prev => ({ ...prev, [String(selectedUser.id)]: false }));
            })
            .catch(() => {});
    }, [selectedUser?.id, user?.id]);

    // Re-sort users on local message updates (fallback local mode)
    useEffect(() => {
        const onMessageUpdated = () => setUsers(prev => sortUsersByActivity(prev));
        window.addEventListener('trampoff:messages-updated', onMessageUpdated);
        window.addEventListener('storage', onMessageUpdated);
        return () => { window.removeEventListener('trampoff:messages-updated', onMessageUpdated); window.removeEventListener('storage', onMessageUpdated); };
    }, []);

    // Track unread per-contact via notifications list
    useEffect(() => {
        let mounted = true;
        const refresh = async () => {
            try {
                const notes = await getNotifications(user?.id);
                if (!mounted) return;
                const map = {};
                (notes || []).forEach(n => {
                    if (n.type === 'message' && !n.read && String(n.ownerId) === String(user?.id) && n.fromId != null) {
                        map[String(n.fromId)] = true;
                    }
                });
                setUnreadMap(map);
            } catch {}
        };
        refresh();
        const onUpdate = () => refresh();
        window.addEventListener('trampoff:notifications-updated', onUpdate);
        window.addEventListener('storage', onUpdate);
        const interval = setInterval(refresh, 4000);
        return () => { window.removeEventListener('trampoff:notifications-updated', onUpdate); window.removeEventListener('storage', onUpdate); clearInterval(interval); };
    }, [user?.id]);

    // Poll resumo de conversas para reordenar quando houver mensagem nova de outros usuários
    useEffect(() => {
        if (!user || !user.id) return;
        let mounted = true;
        const poll = async () => {
            try {
                const list = await getMessageSummaries(user.id);
                if (!mounted || !Array.isArray(list)) return;
                // Atualiza lastActivity por contato
                setLastActivity(prev => {
                    const next = { ...(prev || {}) };
                    for (const s of list) {
                        const ts = new Date(s.createdAt || s.lastAt || Date.now()).getTime();
                        next[String(s.otherUserId)] = ts;
                    }
                    return next;
                });
                // Detecta mensagens novas por contato e notifica/bumpa lista
                let changed = false;
                for (const s of list) {
                    const otherKey = String(s.otherUserId);
                    const lastId = s.id;
                    if (lastId && lastSummaryRef.current[otherKey] !== lastId) {
                        lastSummaryRef.current[otherKey] = lastId;
                        changed = true;
                        // Se a última mensagem veio do outro usuário e a conversa não está aberta, notifica
                        if (String(s.senderId) === otherKey && String(selectedIdRef.current || '') !== otherKey) {
                            const who = usersRef.current.find(u => String(u.id) === otherKey);
                            // badge local
                            createMessageNotification({ ownerId: user.id, fromId: s.otherUserId, content: s.content || '' }).catch(() => {});
                            if (document.hidden) {
                                requestNotificationPermission().then((granted) => {
                                    if (granted) {
                                        notify({
                                            title: `Nova mensagem de ${who?.name || who?.email || 'Contato'}`,
                                            body: String(s.content || '').slice(0, 120),
                                            tag: `chat-${user.id}-${s.otherUserId}`,
                                            data: { from: s.otherUserId, to: user.id },
                                        });
                                    }
                                });
                            }
                        }
                    }
                }
                if (changed) {
                    setUsers(prev => sortUsersByActivity(prev));
                }
            } catch (e) {
                // ignore
            }
        };
        poll();
        const interval = setInterval(poll, 2000);
        return () => { mounted = false; clearInterval(interval); };
    }, [user?.id]);

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

            // Update last activity to now for selected user to keep on top
            setLastActivity(prev => ({ ...prev, [String(selectedUser.id)]: Date.now() }));
            setUsers(prev => sortUsersByActivity(prev));

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
            <Header userType="employer" username={user?.name} profilePicture={user?.photo} onProfileClick={() => setShowModal(true)} />
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
                                            <div className="user-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span>{u.name || u.email}</span>
                                                {unreadMap[String(u.id)] && (
                                                    <span title="Novo" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e53935' }} />
                                                )}
                                            </div>
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
