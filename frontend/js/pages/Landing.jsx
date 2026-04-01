import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { servicesApi, leadsApi, categoriesApi, reviewsApi } from '../api';
import Modal from '../components/Modal';

export default function Landing() {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [serviceDetails, setServiceDetails] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', service_id: '' });
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        servicesApi.getAll().then(res => setServices(res.data)).catch(err => console.error('Ошибка загрузки услуг:', err));
        categoriesApi.getAll().then(res => setCategories(res.data)).catch(err => console.error('Ошибка загрузки категорий:', err));
    }, []);

    const openServiceDetails = async (service) => {
        setSelectedService(service);
        try {
            const res = await servicesApi.getOne(service.id);
            setServiceDetails(res.data);
            setShowServiceModal(true);
        } catch (err) {
            alert('Ошибка загрузки деталей услуги');
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await reviewsApi.create({
                service_id: selectedService.id,
                ...reviewForm
            });
            alert('Спасибо! Ваш отзыв отправлен на модерацию.');
            setReviewForm({ rating: 5, comment: '' });
            // Refresh service details to update can_review / has_reviewed
            const res = await servicesApi.getOne(selectedService.id);
            setServiceDetails(res.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Ошибка при отправке отзыва');
        }
    };

    const openCreate = (service) => {
        setForm({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            message: '',
            service_id: service.id,
        });
        setError('');
        setSuccess(false);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await leadsApi.create(form);
            setSuccess(true);
            setTimeout(() => {
                setShowModal(false);
                setSuccess(false);
            }, 2000);
        } catch (err) {
            const msg = err.response?.data?.errors;
            if (typeof msg === 'object') {
                setError(Object.values(msg).flat().join('. '));
            } else {
                setError(err.response?.data?.message || 'Ошибка при отправке');
            }
        }
    };

    const update = (key, val) => setForm({ ...form, [key]: val });

    return (
        <div className="landing">
            {/* Hero */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Откройте мир <span className="accent">путешествий</span>
                    </h1>
                    <p className="hero-subtitle">
                        Туристический центр — ваш проводник к незабываемым впечатлениям.
                        Экскурсии, туры и приключения ждут вас!
                    </p>
                    <div className="hero-actions">
                        {user ? (
                            <Link
                                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                                className="btn btn-primary btn-lg"
                            >
                                Перейти в личный кабинет
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn btn-primary btn-lg">
                                    Начать сейчас
                                </Link>
                                <Link to="/login" className="btn btn-outline btn-lg">
                                    Войти
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                <div className="hero-decoration">
                    <div className="hero-orb hero-orb-1"></div>
                    <div className="hero-orb hero-orb-2"></div>
                    <div className="hero-orb hero-orb-3"></div>
                </div>
            </section>

            {/* Categories Filter */}
            {categories.length > 0 && (
                <div className="category-filter">
                    <div className="category-tabs">
                        <button 
                            className={`category-tab ${selectedCategory === null ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(null)}
                        >
                            Все
                        </button>
                        {categories.map(c => (
                            <button 
                                key={c.id}
                                className={`category-tab ${selectedCategory === c.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(c.id)}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Services */}
            {services.length > 0 && (
                <section className="section">
                    <h2 className="section-title">Наши услуги</h2>
                    <div className="services-grid">
                        {services.filter(s => !selectedCategory || s.category_id === selectedCategory).map((s) => (
                            <div key={s.id} className="service-card" onClick={() => openServiceDetails(s)} style={{ cursor: 'pointer' }}>
                                <div className="service-card-header">
                                    <div className="service-card-icon">🌍</div>
                                    <span className="service-category-badge">
                                        {s.category?.name || 'Без категории'}
                                    </span>
                                </div>
                                <div className="service-card-body">
                                    <h3>{s.name}</h3>
                                    <p>{s.description || 'Описание скоро появится'}</p>
                                </div>
                                <div className="service-card-footer">
                                    {s.price && (
                                        <div className="service-price">
                                            {Number(s.price).toLocaleString('ru-RU')} ₽
                                        </div>
                                    )}
                                    <div className="service-card-actions">
                                        <span className={`badge badge-${s.status === 'active' ? 'success' : 'muted'}`}>
                                            {s.status === 'active' ? 'Доступно' : 'Недоступно'}
                                        </span>
                                        {s.status === 'active' && (
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={(e) => { e.stopPropagation(); openCreate(s); }}
                                            >
                                                Заказать
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* CTA */}
            {!user && (
                <section className="section section-cta">
                    <h2>Готовы к приключениям?</h2>
                    <p>Зарегистрируйтесь и получите доступ к расширенным функциям личного кабинета</p>
                    <Link to="/register" className="btn btn-outline btn-lg">
                        Зарегистрироваться
                    </Link>
                </section>
            )}

            {/* Lead Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Оставить заявку"
            >
                {success ? (
                    <div className="alert alert-success">
                        Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.
                    </div>
                ) : (
                    <>
                        {error && <div className="alert alert-error">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Имя</label>
                                <input value={form.name} onChange={(e) => update('name', e.target.value)} required placeholder="Как к вам обращаться?" />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required placeholder="example@mail.com" />
                            </div>
                            <div className="form-group">
                                <label>Телефон</label>
                                <input value={form.phone} onChange={(e) => update('phone', e.target.value)} required placeholder="+7 (___) ___-__-__" />
                            </div>
                            <div className="form-group">
                                <label>Сообщение</label>
                                <textarea 
                                    value={form.message} 
                                    onChange={(e) => update('message', e.target.value)} 
                                    rows={3} 
                                    placeholder="Ваши пожелания или вопросы"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-block">
                                Отправить заявку
                            </button>
                        </form>
                    </>
                )}
            </Modal>

            {/* Service Details & Reviews Modal */}
            <Modal
                isOpen={showServiceModal}
                onClose={() => setShowServiceModal(false)}
                title={serviceDetails?.name}
            >
                {serviceDetails && (
                    <div className="service-details">
                        <p className="service-details-desc">{serviceDetails.description}</p>

                        {serviceDetails.price && (
                            <div className="service-details-price">
                                {Number(serviceDetails.price).toLocaleString('ru-RU')} ₽
                            </div>
                        )}

                        {/* Reviews Summary */}
                        <div className="reviews-section">
                            <div className="reviews-header">
                                <h4>Отзывы клиентов</h4>
                                {serviceDetails.reviews_count > 0 && (
                                    <div className="reviews-summary">
                                        <span className="reviews-avg">
                                            {'⭐'.repeat(Math.round(serviceDetails.avg_rating || 0))}
                                        </span>
                                        <span className="reviews-avg-number">
                                            {Number(serviceDetails.avg_rating || 0).toFixed(1)}
                                        </span>
                                        <span className="reviews-count">
                                            ({serviceDetails.reviews_count} {serviceDetails.reviews_count === 1 ? 'отзыв' : serviceDetails.reviews_count < 5 ? 'отзыва' : 'отзывов'})
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="reviews-list">
                                {serviceDetails.reviews?.length === 0 && (
                                    <div className="reviews-empty">
                                        <span className="reviews-empty-icon">💬</span>
                                        <p>Отзывов пока нет.</p>
                                    </div>
                                )}
                                {serviceDetails.reviews?.map(r => (
                                    <div key={r.id} className="review-card">
                                        <div className="review-card-header">
                                            <div className="review-author">
                                                <div className="review-avatar">
                                                    {r.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div className="review-author-info">
                                                    <span className="review-author-name">{r.user?.name || 'Аноним'}</span>
                                                    <span className="review-date">
                                                        {new Date(r.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="review-rating">
                                                {[1,2,3,4,5].map(star => (
                                                    <span key={star} className={`review-star ${star <= r.rating ? 'filled' : ''}`}>★</span>
                                                ))}
                                            </div>
                                        </div>
                                        {r.comment && (
                                            <p className="review-comment">{r.comment}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Review Form — only for non-admin users with completed leads */}
                        {user && user.role !== 'admin' && serviceDetails.can_review && (
                            <form onSubmit={handleReviewSubmit} className="review-form">
                                <h5>Оставить отзыв</h5>
                                <div className="form-group">
                                    <label>Оценка</label>
                                    <div className="star-select">
                                        {[1,2,3,4,5].map(v => (
                                            <button
                                                type="button"
                                                key={v}
                                                className={`star-btn ${v <= reviewForm.rating ? 'active' : ''}`}
                                                onClick={() => setReviewForm({...reviewForm, rating: v})}
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
                                        onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                                        rows={3}
                                        placeholder="Поделитесь вашим мнением..."
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-block">Отправить отзыв</button>
                            </form>
                        )}

                        {user && user.role !== 'admin' && serviceDetails.has_reviewed && (
                            <div className="review-notice">
                                <span>✅</span> Вы уже оставили отзыв на эту услугу. Спасибо!
                            </div>
                        )}

                        {user && user.role !== 'admin' && !serviceDetails.can_review && !serviceDetails.has_reviewed && (
                            <div className="review-notice">
                                <span>ℹ️</span> Оставить отзыв можно после выполнения заявки на эту услугу.
                            </div>
                        )}

                        {!user && (
                            <div className="review-notice">
                                <span>🔑</span> <Link to="/login">Войдите</Link>, чтобы оставить отзыв.
                            </div>
                        )}
                        
                        <div style={{ marginTop: '1.5rem' }}>
                            <button className="btn btn-primary btn-block" onClick={() => { setShowServiceModal(false); openCreate(serviceDetails); }}>
                                Заказать эту услугу
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
