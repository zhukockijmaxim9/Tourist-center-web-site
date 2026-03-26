import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { servicesApi, leadsApi } from '../api';
import Modal from '../components/Modal';

export default function Landing() {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', service_id: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        servicesApi.getAll().then(res => setServices(res.data)).catch(() => {});
    }, []);

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

            {/* Services */}
            {services.length > 0 && (
                <section className="section">
                    <h2 className="section-title">Наши услуги</h2>
                    <div className="services-grid">
                        {services.map((s) => (
                            <div key={s.id} className="service-card">
                                <div className="service-card-icon">🌍</div>
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
                                            onClick={() => openCreate(s)}
                                        >
                                            Оставить заявку
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
        </div>
    );
}
