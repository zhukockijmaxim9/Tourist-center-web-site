import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { servicesApi } from '../api';

export default function Landing() {
    const { user } = useAuth();
    const [services, setServices] = useState([]);

    useEffect(() => {
        servicesApi.getAll().then(res => setServices(res.data)).catch(() => {});
    }, []);

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
                                <span className={`badge badge-${s.status === 'active' ? 'success' : 'muted'}`}>
                                    {s.status === 'active' ? 'Доступно' : 'Недоступно'}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* CTA */}
            {!user && (
                <section className="section section-cta">
                    <h2>Готовы к приключениям?</h2>
                    <p>Зарегистрируйтесь и оставьте заявку на интересующую услугу</p>
                    <Link to="/register" className="btn btn-primary btn-lg">
                        Зарегистрироваться бесплатно
                    </Link>
                </section>
            )}
        </div>
    );
}
