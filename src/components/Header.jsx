import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { getUsers, getJobs, getNotifications, unifiedSearch } from '../services/api';
import logo from '../assets/imgs/logojovialescuro.png';
import perfilFreelancer from '../assets/imgs/perfil_freelancer.png';
import perfilEmployer from '../assets/imgs/perfil_employer.png';

import ThemeAwareImage from './ThemeAwareImage';
import logoLight from '../assets/imgs/logojovialclara.png';

const Header = ({ userType, username, onProfileClick, profilePicture }) => {
    const { user } = useAuth();
    const isFreelancer = userType === 'freelancer' || (user && user.userType === 'freelancer');
    const navLinks = isFreelancer ? [
        { path: '/freelancer/home', label: 'Início' },
        { path: '/freelancer/projects', label: 'Meus Projetos' },
        { path: '/freelancer/jobs', label: 'Trabalhos Disponíveis' },
        { path: '/freelancer/contracts', label: 'Meus Contratos' },
        { path: '/freelancer/messages', label: 'Mensagens' },
    ] : [
        { path: '/employer/home', label: 'Início' },
        { path: '/employer/workers', label: 'Trabalhadores Disponíveis' },
        { path: '/employer/contracts', label: 'Meus Contratos' },
        { path: '/employer/messages', label: 'Mensagens' },
    ];
    
    const profileImg = profilePicture || user?.photo || (isFreelancer ? perfilFreelancer : perfilEmployer);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [unread, setUnread] = useState(0);
    const debounceRef = useRef(null);
    const navigate = useNavigate();
    const [theme, setTheme] = useState(() => (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme')) || localStorage.getItem('trampoff_theme') || 'dark');
    const [installPrompt, setInstallPrompt] = useState(null);
    const [installEligible, setInstallEligible] = useState(() => {
        try { return localStorage.getItem('trampoff_pwa_prompted') !== 'yes'; } catch (e) { return true; }
    });
    const [isScrolled, setIsScrolled] = useState(false);
    const hamburgerRef = useRef(null);
    const panelRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 24);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // PWA: capture beforeinstallprompt and expose Install button
    useEffect(() => {
        const onBeforeInstall = (e) => {
            // Show only once per device/user unless manually reset
            if (!installEligible) return;
            e.preventDefault();
            setInstallPrompt(e);
        };
        const onAppInstalled = () => {
            try { localStorage.setItem('trampoff_pwa_prompted', 'yes'); } catch (e) {}
            setInstallPrompt(null);
            setInstallEligible(false);
        };
        window.addEventListener('beforeinstallprompt', onBeforeInstall);
        window.addEventListener('appinstalled', onAppInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', onBeforeInstall);
            window.removeEventListener('appinstalled', onAppInstalled);
        };
    }, [installEligible]);

    // load unread notifications count for badge
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                if (!user || !user.id) { if (mounted) setUnread(0); return; }
                const notes = await getNotifications(user.id).catch(() => []);
                if (!mounted) return;
                const count = (notes || []).filter(n => !n.read).length;
                setUnread(count || 0);
            } catch (e) {
                if (mounted) setUnread(0);
            }
        };
        load();
        const onUpdated = () => load();
        window.addEventListener('trampoff:notifications-updated', onUpdated);
        window.addEventListener('storage', onUpdated);
        return () => { mounted = false; window.removeEventListener('trampoff:notifications-updated', onUpdated); window.removeEventListener('storage', onUpdated); };
    }, [user]);

    // debounce search across backend unified search (users, jobs, projects, messages)
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!query || query.trim().length < 2) {
            setResults([]);
            return;
        }
        debounceRef.current = setTimeout(async () => {
            try {
                const q = query.trim();
                const data = await unifiedSearch(q);
                const list = [];
                for (const u of (data.users||[])) list.push({ type: 'user', item: u, role: u.role || (u.userType === 'freelancer' ? 'Freelancer' : 'Empregador') });
                for (const j of (data.jobs||[])) list.push({ type: 'job', item: j });
                for (const p of (data.projects||[])) list.push({ type: 'project', item: p });
                for (const m of (data.messages||[])) list.push({ type: 'message', item: m });
                setResults(list);
                setOpen(true);
            } catch (e) {
                setResults([]);
            }
        }, 250);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [query]);

    // close search results when clicking outside
    useEffect(() => {
        const onClick = (e) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    // Focus trap for mobile menu
    useEffect(() => {
        if (!mobileOpen) return;
        const panel = panelRef.current;
        if (!panel) return;
        const focusable = Array.from(panel.querySelectorAll('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])')).filter(el => el.offsetParent !== null);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        try { if (first) first.focus(); } catch (e) {}

        const onKey = (e) => {
            if (e.key !== 'Tab') return;
            if (focusable.length === 0) { e.preventDefault(); return; }
            const active = document.activeElement;
            const idx = focusable.indexOf(active);
            if (e.shiftKey) {
                if (active === first || idx === 0) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (active === last || idx === focusable.length - 1) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [mobileOpen]);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        try {
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('trampoff_theme', next);
        } catch (e) {}
    };

    const handleSelectUser = (u) => {
        // navigate to messages with query param userId
        const base = isFreelancer ? '/freelancer/messages' : '/employer/messages';
        navigate(`${base}?userId=${encodeURIComponent(u.id)}`);
        setOpen(false);
        setQuery('');
    };

    const handleSelectJob = (j) => {
        // navigate to jobs list or job detail page if exists
        const base = isFreelancer ? '/freelancer/jobs' : '/employer/home';
        navigate(base);
        setOpen(false);
        setQuery('');
    };

    const goHome = () => {
        const base = isFreelancer ? '/freelancer/home' : '/employer/home';
        navigate(base);
    };

    return (
        <header className={`main-header ${isScrolled ? 'is-scrolled' : ''}`}>
            <button className="logo-button" onClick={goHome} aria-label="Ir para a página inicial">
                <ThemeAwareImage
                    darkSrc={logo}
                    lightSrc={logoLight}
                    alt="Logo do Projeto"
                    className="logo theme-adaptable"
                />
            </button>

            <div className="header-row">
                <nav className="main-nav" aria-label="Main navigation">
                    <button ref={hamburgerRef} className={`hamburger ${mobileOpen ? 'is-open' : ''}`} aria-controls="mobile-menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(s => !s)} aria-label="Abrir menu">
                        <span className="hamburger-box">
                            <span className="hamburger-inner"></span>
                        </span>
                    </button>
                    <ul className="desktop-links">
                        {navLinks.map(link => (
                            <li key={link.path}>
                                <NavLink to={link.path} className={({ isActive }) => isActive ? "active" : ""} onClick={() => setMobileOpen(false)}>
                                    {link.label}
                                    {String(link.label).toLowerCase().includes('mensag') && unread > 0 && (
                                        <span className="nav-badge" aria-hidden>{unread > 9 ? '9+' : unread}</span>
                                    )}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                    {mobileOpen && (
                        <div id="mobile-menu" className="mobile-nav-overlay" role="menu" aria-label="Menu móvel" onClick={() => { setMobileOpen(false); try { hamburgerRef.current && hamburgerRef.current.focus(); } catch(e){} }}>
                            <div ref={panelRef} className="mobile-nav-panel" role="presentation" onClick={(e) => e.stopPropagation()}>
                                    <ul>
                                        {navLinks.map(link => (
                                            <li key={link.path} style={{ marginBottom: 6 }}>
                                                <NavLink to={link.path} className={({ isActive }) => isActive ? "active" : ""} onClick={() => setMobileOpen(false)}>
                                                    {link.label}
                                                </NavLink>
                                            </li>
                                        ))}
                                        <li className="mobile-separator" aria-hidden></li>
                                        <li className="mobile-logout-wrap" aria-hidden>
                                            <button
                                                className="card-button mobile-logout"
                                                onClick={() => { setMobileOpen(false); try { hamburgerRef.current && hamburgerRef.current.focus(); } catch(e){}; /* placeholder for logout */ }}
                                                aria-label="Sair"
                                            >
                                                Sair
                                            </button>
                                        </li>
                                    </ul>
                            </div>
                        </div>
                    )}
                </nav>

                <div className="header-controls">
                    {installPrompt && installEligible && (
                        <button
                            className="btn btn-secondary"
                            onClick={async () => {
                                try {
                                    await installPrompt.prompt();
                                    const choice = await installPrompt.userChoice;
                                    // Mark as prompted regardless of outcome to avoid duplicate prompts
                                    try { localStorage.setItem('trampoff_pwa_prompted', 'yes'); } catch (e) {}
                                    setInstallPrompt(null);
                                    setInstallEligible(false);
                                } catch (e) {}
                            }}
                            title="Instalar aplicativo"
                        >Instalar</button>
                    )}
                    <div ref={containerRef} className="search-bar" style={{ position: 'relative' }}>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const q = (query || '').trim();
                                    if (q.length >= 1) {
                                        try { localStorage.setItem('trampoff_last_search', q); } catch (err) {}
                                        navigate(`/search?q=${encodeURIComponent(q)}`);
                                    }
                                }
                            }}
                            type="text"
                            placeholder="Buscar..."
                            aria-label="buscar"
                        />
                                                <button type="button" onClick={() => {
                                                        const q = (query || '').trim();
                                                        if (q.length >= 1) {
                                                            try { localStorage.setItem('trampoff_last_search', q); } catch (err) {}
                                                            navigate(`/search?q=${encodeURIComponent(q)}`);
                                                        }
                                                        else setOpen(s => !s);
                                                    }} aria-label="Abrir busca">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                <path d="M21 21l-4.35-4.35" stroke="#0f1724" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="11" cy="11" r="6" stroke="#0f1724" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        {open && (
                            <div className="search-results">
                                <ul>
                                    {results.length === 0 && (
                                        <li>Nenhum resultado encontrado</li>
                                    )}
                                    {results.map((r, idx) => (
                                        <li key={idx} onClick={() => {
                                            if (r.type === 'user') return handleSelectUser(r.item);
                                            if (r.type === 'job') return handleSelectJob(r.item);
                                            if (r.type === 'project') { navigate(isFreelancer ? '/freelancer/projects' : '/employer/home'); setOpen(false); setQuery(''); return; }
                                            if (r.type === 'message') {
                                                const otherId = String(r.item.senderId) === String(user?.id) ? r.item.receiverId : r.item.senderId;
                                                const base = isFreelancer ? '/freelancer/messages' : '/employer/messages';
                                                navigate(`${base}?userId=${encodeURIComponent(otherId)}`);
                                                setOpen(false); setQuery(''); return; }
                                        }}>
                                            {r.type === 'user' && (
                                                <div>
                                                    <strong>{r.item.name || r.item.email}</strong>
                                                    <div className="result-meta">{r.role}</div>
                                                </div>
                                            )}
                                            {r.type === 'job' && (
                                                <div>
                                                    <strong>{r.item.title}</strong>
                                                    <div className="result-meta">{r.item.description}</div>
                                                </div>
                                            )}
                                            {r.type === 'project' && (
                                                <div>
                                                    <strong>{r.item.title}</strong>
                                                    <div className="result-meta">{r.item.description}</div>
                                                </div>
                                            )}
                                            {r.type === 'message' && (
                                                <div>
                                                    <strong>Mensagem</strong>
                                                    <div className="result-meta">{String(r.item.content).slice(0,80)}</div>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    {/* theme toggle removido conforme solicitado */}
                    <button className="profile-button" onClick={onProfileClick}>
                        <span className="profile-name">{username || 'Perfil'}</span>
                        <div className="profile-photo">
                            <img src={profileImg} alt="Foto de Perfil" />
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;