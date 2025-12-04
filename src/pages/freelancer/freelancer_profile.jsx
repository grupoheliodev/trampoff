import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';
import { getReviewsForUser, getReviewStatsForUser, updateUserPhotoUrl } from '../../services/api';
import perfilFreelancer from '../../assets/imgs/perfil_freelancer.png';

const FreelancerProfile = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [profilePicture, setProfilePicture] = useState(perfilFreelancer);
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
            <Header userType="freelancer" username={user?.name} onProfileClick={() => setShowModal(true)} profilePicture={user?.photo || profilePicture} />
            <ProfileModal show={showModal} onClose={() => setShowModal(false)} userType="freelancer" username={user?.name} onLogout={handleLogout} />

            <main className="main-content">
                <section className="profile-section">
                    <h2 className="section-title">Meu Perfil</h2>
                    <div className="profile-card card">
                        <div className="profile-header">
                            <img src={profilePicture} alt="Foto grande do Freelancer" className="profile-photo-large"/>
                            <h3 className="profile-name-large">{user?.name || 'Nome do Freelancer'}</h3>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                                <input type="url" placeholder="Cole a URL da sua foto" value={photoUrlInput} onChange={(e) => setPhotoUrlInput(e.target.value)} style={{ flex: 1 }} />
                                <button className="card-button" type="button" onClick={handlePhotoUrlSave}>Salvar URL</button>
                            </div>
                            <div className="profile-info">
                                <p className="profile-tagline">Desenvolvedor Front-end | Especialista em UI/UX</p>
                                <p className="profile-location">São Paulo, Brasil</p>
                                <div className="rating-summary" style={{ marginTop: 8 }}>
                                    <strong style={{ fontSize: 18 }}>{reviewStats.count === 0 ? '—' : reviewStats.average.toFixed(1)}</strong>
                                    <span style={{ marginLeft: 8, color: '#666' }}>{reviewStats.count} avaliações</span>
                                </div>
                            </div>
                        </div>
                        <div className="profile-details">
                            <p className="profile-bio">
                                Um parágrafo curto sobre o freelancer, sua experiência e o que ele oferece. Este é o espaço para uma breve biografia ou um resumo profissional.
                            </p>
                            <div className="profile-section-details">
                                <h4>Habilidades</h4>
                                <ul className="skills-list">
                                    <li>HTML5</li>
                                    <li>CSS3</li>
                                    <li>JavaScript</li>
                                    <li>React</li>
                                    <li>Figma</li>
                                </ul>
                            </div>
                            <div className="profile-section-details">
                                <h4>Projetos Recentes</h4>
                                <div className="project-list">
                                    <div className="project-item">
                                        <h5>Landing Page de Produto</h5>
                                        <p>Criação de página de alta conversão para startup de tecnologia.</p>
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
                        <button className="card-button" onClick={() => navigate('/freelancer/settings')}>Editar Perfil</button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default FreelancerProfile;