import React, { useEffect, useState } from 'react';
import Modal from '../../components/Modal';
import { reviewsApi } from '../../api';
import { useNotify } from '../../context/NotifyContext';

export default function ReviewFormModal({ isOpen, lead, onClose, onSuccess }) {
    const notify = useNotify();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setRating(5);
            setComment('');
        }
    }, [isOpen]);

    if (!lead) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        setSubmitting(true);
        try {
            await reviewsApi.create({
                service_id: lead.service_id,
                lead_id: lead.id,
                rating,
                comment,
            });
            notify.success('Спасибо! Ваш отзыв отправлен на модерацию.');
            setRating(5);
            setComment('');
            onSuccess?.();
            onClose();
        } catch (err) {
            notify.fromError(err, 'Ошибка при отправке отзыва');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Оставить отзыв"
            contentClassName="modal-content--elva"
        >
            <div className="review-form-lead-info">
                <p className="review-form-lead-service">
                    Услуга: <strong>{lead.service?.name || '—'}</strong>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="review-form">
                <div className="form-group">
                    <label>Оценка</label>
                    <div className="star-select">
                        {[1, 2, 3, 4, 5].map((value) => (
                            <button
                                type="button"
                                key={value}
                                className={`star-btn ${value <= rating ? 'active' : ''}`}
                                onClick={() => setRating(value)}
                                aria-label={`Оценка ${value}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="review-comment">Комментарий</label>
                    <textarea
                        id="review-comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        placeholder="Поделитесь вашим мнением..."
                    />
                </div>
                <div className="user-dashboard-modal-actions">
                    <button type="button" className="btn btn-outline" onClick={onClose}>
                        Отмена
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Отправка...' : 'Отправить отзыв'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
