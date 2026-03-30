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
                <div className="container" style={{ marginBottom: '2rem' }}>
                    <div className="category-tabs" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button 
                            className={`btn ${selectedCategory === null ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setSelectedCategory(null)}
                        >
                            Все
                        </button>
                        {categories.map(c => (
                            <button 
                                key={c.id}
                                className={`btn ${selectedCategory === c.id ? 'btn-primary' : 'btn-outline'}`}
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
                                <div className="service-card-icon">🌍</div>
                                <div className="service-category" style={{ fontSize: '1rem', color: '#555', fontWeight: '500', marginBottom: '0.4rem' }}>
                                    {s.category?.name || 'Без категории'}
                                </div>
                                <h3>{s.name}</h3>
                                <p>{s.description || 'Описание скоро появится'}</p>
                                {s.price && (
                                    <div className="service-price">
                                        {Number(s.price).toLocaleString('ru-RU')} ₽
                                    </div>
                                )}
                                <div className="service-card-footer">
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
                        <p>{serviceDetails.description}</p>
                        <hr />
                        <h4>Отзывы клиентов</h4>
                        <div className="reviews-list" style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                            {serviceDetails.reviews?.length === 0 && <p className="text-muted">Отзывов пока нет. Будьте первым!</p>}
                            {serviceDetails.reviews?.map(r => (
                                <div key={r.id} className="review-item" style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <strong>{r.user?.name}</strong>
                                        <span style={{ color: '#f39c12' }}>{'⭐'.repeat(r.rating)}</span>
                                    </div>
                                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>{r.comment}</p>
                                </div>
                            ))}
                        </div>

                        {user && user.role !== 'admin' ? (
                            <form onSubmit={handleReviewSubmit} style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                                <h5>Оставить отзыв</h5>
                                <div className="form-group">
                                    <label>Оценка</label>
                                    <select value={reviewForm.rating} onChange={(e) => setReviewForm({...reviewForm, rating: e.target.value})}>
                                        {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} ⭐</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Комментарий</label>
                                    <textarea 
                                        value={reviewForm.comment} 
                                        onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                                        rows={2}
                                        placeholder="Поделитесь вашим мнением..."
                                    />
                                </div>
                                <button type="submit" className="btn btn-outline btn-block">Отправить</button>
                            </form>
                        ) : (
                            <p className="text-muted small">Пожалуйста, <Link to="/login">войдите</Link>, чтобы оставить отзыв.</p>
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
