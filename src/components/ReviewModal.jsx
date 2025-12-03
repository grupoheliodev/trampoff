import React, { useState, useEffect } from 'react';

const ReviewModal = ({ show, onClose, onSubmit, initialRating = 5, initialComment = '' , title = 'Avaliar'}) => {
    const [rating, setRating] = useState(initialRating);
    const [comment, setComment] = useState(initialComment);

    useEffect(() => {
        if (show) {
            setRating(initialRating);
            setComment(initialComment);
        }
    }, [show, initialRating, initialComment]);

    if (!show) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-card">
                <h3>{title}</h3>
                <label>Nota</label>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 6 }}>
                    {[1,2,3,4,5].map((n) => (
                        <button
                            key={n}
                            aria-label={`Nota ${n}`}
                            onClick={() => setRating(n)}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                fontSize: 20,
                                cursor: 'pointer',
                                color: n <= rating ? '#ffb400' : '#ccc'
                            }}
                        >
                            {n <= rating ? '★' : '☆'}
                        </button>
                    ))}
                    <span style={{ marginLeft: 8 }}>{rating}/5</span>
                </div>
                <label>Comentário</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                    <button className="card-button" onClick={onClose}>Cancelar</button>
                    <button className="card-button" onClick={() => onSubmit({ rating, comment })}>Enviar Avaliação</button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
