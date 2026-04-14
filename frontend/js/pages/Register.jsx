import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../context/NotifyContext';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(form);
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.errors;
            if (typeof msg === 'object') {
                setError(Object.values(msg).flat().join('. '));
            } else {
                setError(getErrorMessage(err, 'Ошибка регистрации'));
            }
        } finally {
            setLoading(false);
        }
    };

    const update = (key, val) => setForm({ ...form, [key]: val });

    return (
        <div className="auth-page">
            <div className="auth-card">
                <header className="auth-form__head">
                    <h1 className="auth-form__title">Регистрация</h1>
                    <p className="auth-form__subtitle">Создайте новый аккаунт</p>
                </header>

                {error && (
                    <div className="auth-form__alert auth-form__alert--error" role="alert">
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="auth-form__field">
                        <label className="auth-form__label" htmlFor="reg-name">
                            Имя
                        </label>
                        <input
                            id="reg-name"
                            className="auth-form__control"
                            type="text"
                            value={form.name}
                            onChange={(e) => update('name', e.target.value)}
                            placeholder="Иван Иванов"
                            required
                            autoComplete="name"
                        />
                    </div>
                    <div className="auth-form__field">
                        <label className="auth-form__label" htmlFor="reg-email">
                            Email
                        </label>
                        <input
                            id="reg-email"
                            className="auth-form__control"
                            type="email"
                            value={form.email}
                            onChange={(e) => update('email', e.target.value)}
                            placeholder="example@mail.com"
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="auth-form__field">
                        <label className="auth-form__label" htmlFor="reg-phone">
                            Телефон
                        </label>
                        <input
                            id="reg-phone"
                            className="auth-form__control"
                            type="tel"
                            value={form.phone}
                            onChange={(e) => update('phone', e.target.value)}
                            placeholder="+7 999 123 45 67"
                            autoComplete="tel"
                        />
                    </div>
                    <div className="auth-form__field">
                        <label className="auth-form__label" htmlFor="reg-password">
                            Пароль
                        </label>
                        <input
                            id="reg-password"
                            className="auth-form__control"
                            type="password"
                            value={form.password}
                            onChange={(e) => update('password', e.target.value)}
                            placeholder="Минимум 6 символов"
                            required
                            autoComplete="new-password"
                        />
                    </div>
                    <button type="submit" className="auth-form__submit" disabled={loading}>
                        {loading ? 'Создание…' : 'Зарегистрироваться'}
                    </button>
                </form>

                <p className="auth-footer">
                    Уже есть аккаунт? <Link to="/login">Войдите</Link>
                </p>
            </div>
        </div>
    );
}
