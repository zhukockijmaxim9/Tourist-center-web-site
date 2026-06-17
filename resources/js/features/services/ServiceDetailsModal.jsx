import React, { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { reviewsApi, servicesApi } from '../../api';
import Modal from '../../components/Modal';
import { useNotify } from '../../context/NotifyContext';
import { getServicePhotoUrl, serviceImageOnError } from '../../utils/serviceCardImage';

export default function ServiceDetailsModal({
    isOpen,
    service,
    user,
    onClose,
    onBook,
}) {
    const notify = useNotify();
    const [serviceDetails, setServiceDetails] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadDetails = async () => {
            if (!isOpen || !service?.id) {
                setServiceDetails(null);
                return;
            }

            try {
                const res = await servicesApi.getOne(service.id);
                if (!cancelled) {
                    setServiceDetails(res.data);
                }
            } catch (err) {
                if (!cancelled) {
                    notify.fromError(err, 'Ошибка загрузки деталей услуги');
                }
            }
        };

        loadDetails();

        return () => {
            cancelled = true;
        };
    }, [isOpen, service, notify]);

    useEffect(() => {
        if (!isOpen) {
            setReviewForm({ rating: 5, comment: '' });
        }
    }, [isOpen]);

    const reloadDetails = async () => {
        if (!service?.id) return;
        const res = await servicesApi.getOne(service.id);
        setServiceDetails(res.data);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!serviceDetails?.id || submittingReview) return;

        setSubmittingReview(true);
        try {
            await reviewsApi.create({
                service_id: serviceDetails.id,
                ...reviewForm,
            });
            notify.success('Спасибо! Ваш отзыв отправлен на модерацию.');
            setReviewForm({ rating: 5, comment: '' });
            await reloadDetails();
        } catch (err) {
            notify.fromError(err, 'Ошибка при отправке отзыва');
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={serviceDetails?.name || service?.name}
        >
            {serviceDetails ? (
                <div className="service-details">
                    <div className="service-details__media">
                        <img
                            src={getServicePhotoUrl(serviceDetails)}
                            alt=""
                            loading="lazy"
                            onError={serviceImageOnError}
                        />
                    </div>
                    <p className="service-details-desc">{serviceDetails.description}</p>

                    {serviceDetails.price ? (
                        <div className="service-details-price">
                            {Number(serviceDetails.price).toLocaleString('ru-RU')} ₽
                        </div>
                    ) : null}

                    <div className="reviews-section">
                        <div className="reviews-header">
                            <h4>Отзывы клиентов</h4>
                            {serviceDetails.reviews_count > 0 ? (
                                <div className="reviews-summary">
                                    <span className="reviews-avg">
                                        {'★'.repeat(Math.round(serviceDetails.avg_rating || 0))}
                                    </span>
                                    <span className="reviews-avg-number">
                                        {Number(serviceDetails.avg_rating || 0).toFixed(1)}
                                    </span>
                                    <span className="reviews-count">
                                        ({serviceDetails.reviews_count}{' '}
                                        {serviceDetails.reviews_count === 1
                                            ? 'отзыв'
                                            : serviceDetails.reviews_count < 5
                                                ? 'отзыва'
                                                : 'отзывов'})
                                    </span>
                                </div>
                            ) : null}
                        </div>

                        <div className="reviews-list">
                            {serviceDetails.reviews?.length === 0 ? (
                                <div className="reviews-empty">
                                    <span className="reviews-empty-icon">💬</span>
                                    <p>Отзывов пока нет.</p>
                                </div>
                            ) : null}
                            {serviceDetails.reviews?.map((review) => (
                                <div key={review.id} className="review-card">
                                    <div className="review-card-header">
                                        <div className="review-author">
                                            <div className="review-avatar">
                                                {review.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div className="review-author-info">
                                                <span className="review-author-name">{review.user?.name || 'Аноним'}</span>
                                                <span className="review-date">
                                                    {new Date(review.created_at).toLocaleDateString('ru-RU', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="review-rating">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span key={star} className={`review-star ${star <= review.rating ? 'filled' : ''}`}>★</span>
                                            ))}
                                        </div>
                                    </div>
                                    {review.comment ? <p className="review-comment">{review.comment}</p> : null}
                                </div>
                            ))}
                        </div>
                    </div>

                    {user && user.role === 'user' && serviceDetails.can_review ? (
                        <form onSubmit={handleReviewSubmit} className="review-form">
                            <h5>Оставить отзыв</h5>
                            <div className="form-group">
                                <label>Оценка</label>
                                <div className="star-select">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <button
                                            type="button"
                                            key={value}
                                            className={`star-btn ${value <= reviewForm.rating ? 'active' : ''}`}
                                            onClick={() => setReviewForm((current) => ({ ...current, rating: value }))}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Комментарий</label>
                                <textarea
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm((current) => ({ ...current, comment: e.target.value }))}
                                    rows={3}
                                    placeholder="Поделитесь вашим мнением..."
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-block" disabled={submittingReview}>
                                {submittingReview ? 'Отправка...' : 'Отправить отзыв'}
                            </button>
                        </form>
                    ) : null}

                    {user && user.role === 'user' && serviceDetails.has_reviewed ? (
                        <div className="review-notice">
                            <span>✅</span> Вы уже оставили отзыв на эту услугу. Спасибо!
                        </div>
                    ) : null}

                    {user && user.role === 'user' && !serviceDetails.can_review && !serviceDetails.has_reviewed ? (
                        <div className="review-notice">
                            <span>ℹ️</span> Оставить отзыв можно после выполнения заявки на эту услугу.
                        </div>
                    ) : null}

                    {!user ? (
                        <div className="review-notice">
                            <span>🔑</span> <Link href="/login">Войдите</Link>, чтобы оставить отзыв.
                        </div>
                    ) : null}

                    <div style={{ marginTop: '1.5rem' }}>
                        <button
                            className="btn btn-primary btn-block"
                            type="button"
                            onClick={() => onBook?.(serviceDetails)}
                        >
                            Заказать эту услугу
                        </button>
                    </div>
                </div>
            ) : null}
        </Modal>
    );
}
