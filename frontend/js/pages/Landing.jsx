import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { servicesApi, leadsApi, categoriesApi, reviewsApi } from '../api';
import Modal from '../components/Modal';
import { getServicePhotoUrl, serviceImageOnError } from '../utils/serviceCardImage';

export default function Landing() {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [serviceDetails, setServiceDetails] = useState(null);
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        service_id: '',
    });
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        servicesApi.getAll().then((res) => setServices(res.data)).catch((err) => console.error('Ошибка загрузки услуг:', err));
        categoriesApi.getAll().then((res) => setCategories(res.data)).catch((err) => console.error('Ошибка загрузки категорий:', err));
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
            await leadsApi.create({
                name: form.name,
                email: form.email,
                phone: form.phone,
                message: form.message.trim() || null,
                service_id: form.service_id,
            });
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

    const filteredServices = services.filter(
        (s) => !selectedCategory || s.category_id === selectedCategory,
    );

    return (
        <div className="landing">
            <section className="hero hero--fade-white">
                <div className="hero__photo-stack" aria-hidden="true">
                    <div className="hero__photo hero__photo--light" />
                    <div className="hero__photo hero__photo--dark" />
                </div>
                <div className="hero-content">
                    <div className="hero-brand">
                        <p className="hero-brand__text">ELVA</p>
                    </div>
                    <h1 className="hero-title">
                        где время замедляется, а пространство наполняется спокойствием.
                    </h1>
                    <p className="hero-subtitle">
                        where time slows down and space becomes peaceful.
                    </p>
                    <div className="hero-actions">
                        {user ? (
                            <Link
                                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                                className="btn btn-lg btn--hero-wire"
                            >
                                Перейти в личный кабинет
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn btn-lg btn--hero-wire">
                                    Начать сейчас
                                </Link>
                                <Link to="/login" className="btn btn-lg btn--hero-wire">
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

            {/* Services */}
            {services.length > 0 && (
                <section
                    className="services-section"
                    aria-labelledby={
                        categories.length > 0
                            ? 'services-heading services-filter-heading'
                            : 'services-heading'
                    }
                >
                    <div className="services-section__inner">

                        <div className="services-section__head">
                            <h2 id="services-heading" className="services-section__title">
                                Наши услуги
                            </h2>
                            <span className="services-section__rule" aria-hidden="true" />
                        </div>
                        {categories.length > 0 && (
                            <div
                                className="services-filter"
                                role="toolbar"
                                aria-label="Категории услуг"
                            >
                                <div className="services-filter__track">
                                    <div className="services-filter__chips">
                                        <button
                                            type="button"
                                            className={`services-filter__chip ${
                                                selectedCategory === null ? 'is-active' : ''
                                            }`}
                                            onClick={() => setSelectedCategory(null)}
                                            aria-pressed={selectedCategory === null}
                                        >
                                            Все
                                        </button>
                                        {categories.map((c) => (
                                            <button
                                                type="button"
                                                key={c.id}
                                                className={`services-filter__chip ${
                                                    selectedCategory === c.id ? 'is-active' : ''
                                                }`}
                                                onClick={() => setSelectedCategory(c.id)}
                                                aria-pressed={selectedCategory === c.id}
                                            >
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <h3
                                    key={
                                        selectedCategory === null
                                            ? 'filter-all'
                                            : `filter-${selectedCategory}`
                                    }
                                    className="services-filter__heading"
                                    id="services-filter-heading"
                                    aria-live="polite"
                                >
                                    {selectedCategory === null
                                        ? 'Все направления'
                                        : categories.find((c) => c.id === selectedCategory)?.name ??
                                          'Категория'}
                                </h3>
                            </div>
                        )}
                        {filteredServices.length === 0 ? (
                            <p className="services-section__empty">
                                В этой категории пока нет услуг.
                            </p>
                        ) : (
                            <div className="services-grid services-grid--showcase">
                                {filteredServices.map((s) => (
                                    <article
                                        key={s.id}
                                        className="service-showcase"
                                        onClick={() => openServiceDetails(s)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                openServiceDetails(s);
                                            }
                                        }}
                                    >
                                        <div className="service-showcase__media service-showcase__media--photo">
                                            <img
                                                className="service-showcase__photo"
                                                src={getServicePhotoUrl(s)}
                                                alt=""
                                                loading="lazy"
                                                onError={serviceImageOnError}
                                            />
                                            <span
                                                className={`service-showcase__badge service-showcase__badge--overlay ${
                                                    s.status === 'active'
                                                        ? 'service-showcase__badge--on'
                                                        : 'service-showcase__badge--off'
                                                }`}
                                            >
                                                {s.status === 'active' ? 'Доступно' : 'Недоступно'}
                                            </span>
                                            <span className="service-showcase__category">
                                                {s.category?.name || 'Без категории'}
                                            </span>
                                        </div>
                                        <h3 className="service-showcase__title">{s.name}</h3>
                                        <p className="service-showcase__desc">
                                            {s.description || 'Описание скоро появится'}
                                        </p>
                                        <div className="service-showcase__bottom">
                                            {s.price ? (
                                                <p className="service-showcase__price">
                                                    {Number(s.price).toLocaleString('ru-RU')} ₽
                                                </p>
                                            ) : (
                                                <p className="service-showcase__price service-showcase__price--muted">
                                                    Цена по запросу
                                                </p>
                                            )}
                                            <div className="service-showcase__actions">
                                                {s.status === 'active' && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-sm btn--service-showcase"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openCreate(s);
                                                        }}
                                                    >
                                                        Заказать
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {!user && (
                <section className="section section-cta">
                    <h2>Готовы к приключениям?</h2>
                    <p>Зарегистрируйтесь и получите доступ к расширенным функциям личного кабинета</p>
                    <Link to="/register" className="btn btn-outline btn-lg">
                        Зарегистрироваться
                    </Link>
                </section>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} variant="booking">
                {success ? (
                    <div className="booking-success">
                        <h2 className="booking-success__title">Спасибо, что выбираете нас!</h2>
                        <p className="booking-success__text">
                            Наш менеджер свяжется с вами для подтверждения бронирования в течение 15–30 минут
                        </p>
                    </div>
                ) : (
                    <>
                        <header className="booking-form__head">
                            <h2 className="booking-form__title">Бронирование</h2>
                            <p className="booking-form__subtitle">
                                Заполните форму, и мы свяжемся с вами для подтверждения бронирования в течение
                                15–30 минут
                            </p>
                        </header>
                        {error && <div className="booking-form__alert booking-form__alert--error">{error}</div>}
                        <form className="booking-form" onSubmit={handleSubmit} noValidate>
                            <div className="booking-form__field">
                                <label className="booking-form__label" htmlFor="booking-name">
                                    ФИО
                                </label>
                                <input
                                    id="booking-name"
                                    className="booking-form__control"
                                    value={form.name}
                                    onChange={(e) => update('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                />
                            </div>
                            <div className="booking-form__field">
                                <label className="booking-form__label" htmlFor="booking-email">
                                    Электронная почта
                                </label>
                                <input
                                    id="booking-email"
                                    className="booking-form__control"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => update('email', e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                            <div className="booking-form__field">
                                <label className="booking-form__label" htmlFor="booking-phone">
                                    Номер телефона
                                </label>
                                <div className="booking-form__phone-row">
                                    <span className="booking-form__phone-prefix" aria-hidden="true">
                                        +7
                                    </span>
                                    <input
                                        id="booking-phone"
                                        className="booking-form__control booking-form__control--phone"
                                        value={form.phone}
                                        onChange={(e) => update('phone', e.target.value)}
                                        required
                                        autoComplete="tel"
                                        placeholder=""
                                    />
                                </div>
                            </div>
                            <div className="booking-form__field">
                                <label className="booking-form__label" htmlFor="booking-comment">
                                    Комментарий
                                </label>
                                <textarea
                                    id="booking-comment"
                                    className="booking-form__control booking-form__control--textarea"
                                    value={form.message}
                                    onChange={(e) => update('message', e.target.value)}
                                    rows={2}
                                />
                            </div>
                            <button type="submit" className="booking-form__submit">
                                оставить заявку
                            </button>
                        </form>
                    </>
                )}
            </Modal>

            <Modal
                isOpen={showServiceModal}
                onClose={() => setShowServiceModal(false)}
                title={serviceDetails?.name}
            >
                {serviceDetails && (
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

                        {serviceDetails.price && (
                            <div className="service-details-price">
                                {Number(serviceDetails.price).toLocaleString('ru-RU')} ₽
                            </div>
                        )}

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
