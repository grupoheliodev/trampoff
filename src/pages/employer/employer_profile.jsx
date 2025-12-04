import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';
import { getReviewsForUser, getReviewStatsForUser, updateUserPhotoUrl } from '../../services/api';
import perfilEmployer from '../../assets/imgs/perfil_employer.png';

const EmployerProfile = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [profilePicture, setProfilePicture] = useState(perfilEmployer);
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState({ count: 0, average: 0 });

    useEffect(() => {
        let mounted = true;
        if (!user?.id) return;
        getReviewsForUser(user?.id).then(list => { if (mounted) setReviews(list || []); }).catch(() => setReviews([]));
        getReviewStatsForUser(user?.id).then(stats => { if (mounted) setReviewStats(stats || { count: 0, average: 0 }); }).catch(() => setReviewStats({ count:0, average:0 }));
        return () => { mounted = false };
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const [photoUrlInput, setPhotoUrlInput] = useState('');
    const handlePhotoUrlSave = async () => {
        if (!user?.id || !photoUrlInput) return;
        try {
            await updateUserPhotoUrl(user.id, photoUrlInput);
            setProfilePicture(photoUrlInput);
            updateUser({ ...user, photo: photoUrlInput });
        } catch (e) {
            console.error('Erro ao salvar URL da foto:', e);
            alert('Não foi possível salvar a URL da foto.');
        }
    };

    return (
        <div>
            <Header userType="employer" username={user?.name} onProfileClick={() => setShowModal(true)} profilePicture={user?.photo || profilePicture} />
            <ProfileModal show={showModal} onClose={() => setShowModal(false)} userType="employer" username={user?.name} onLogout={handleLogout} />
            <main className="main-content">
                <section className="profile-section">
                    <h2 className="section-title">Meu Perfil</h2>
                    <div className="profile-card card">
                        <div className="profile-header">
                            <img src={profilePicture} alt="Ícone do Empregador" className="profile-photo-large" />
                            <h3 className="profile-name-large">{user?.name || 'Nome da Empresa'}</h3>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                                <input type="url" placeholder="Cole a URL da sua foto" value={photoUrlInput} onChange={(e) => setPhotoUrlInput(e.target.value)} style={{ flex: 1 }} />
                                <button className="card-button" type="button" onClick={handlePhotoUrlSave}>Salvar URL</button>
                            </div>
                            <div className="profile-info">
                                <p className="profile-tagline">Empresa de Tecnologia | Inovação e Soluções</p>
                                <p className="profile-location">São Paulo, Brasil</p>
                                <div className="rating-summary" style={{ marginTop: 8 }}>
                                    <strong style={{ fontSize: 18 }}>{reviewStats.count === 0 ? '—' : reviewStats.average.toFixed(1)}</strong>
                                    <span style={{ marginLeft: 8, color: '#666' }}>{reviewStats.count} avaliações</span>
                                </div>
                            </div>
                        </div>
                        <div className="profile-details">
                            <p className="profile-bio">
                                Aqui entra uma breve descrição sobre a empresa, sua missão, seus valores e o que ela busca em seus colaboradores e projetos.
                            </p>
                            <div className="profile-section-details">
                                <h4>Áreas de Contratação</h4>
                                <ul className="skills-list">
                                    <li>Desenvolvimento Web</li>
                                    <li>Design Gráfico</li>
                                    <li>Marketing Digital</li>
                                    <li>Consultoria de TI</li>
                                </ul>
                            </div>
                            <div className="profile-section-details">
                                <h4>Projetos Publicados</h4>
                                <div className="project-list">
                                    <div className="project-item">
                                        <h5>Desenvolvimento de Aplicativo Mobile</h5>
                                        <p>Criação da versão 1.0 do nosso aplicativo de serviços.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="profile-section-details">
                                <h4>Avaliações Recebidas</h4>
                                {reviews.length === 0 && <p>Sem avaliações ainda.</p>}
                                {reviews.map(r => (
                                    <div key={r.id} className="review-item">
                                        <strong>Nota: {r.rating}</strong>
                                        <p>{r.comment}</p>
                                        <small>{new Date(r.createdAt).toLocaleDateString()}</small>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button className="card-button" onClick={() => navigate('/employer/settings')}>Editar Perfil</button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default EmployerProfile;