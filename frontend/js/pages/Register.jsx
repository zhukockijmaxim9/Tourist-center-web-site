import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
                setError(msg || 'Ошибка регистрации');
            }
        } finally {
            setLoading(false);
        }
    };

    const update = (key, val) => setForm({ ...form, [key]: val });

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Регистрация</h1>
                <p className="auth-subtitle">Создайте новый аккаунт</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="reg-name">Имя</label>
                        <input
                            id="reg-name"
                            type="text"
                            value={form.name}
                            onChange={(e) => update('name', e.target.value)}
                            placeholder="Иван Иванов"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-email">Email</label>
                        <input
                            id="reg-email"
                            type="email"
                            value={form.email}
                            onChange={(e) => update('email', e.target.value)}
                            placeholder="example@mail.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-phone">Телефон</label>
                        <input
                            id="reg-phone"
                            type="text"
                            value={form.phone}
                            onChange={(e) => update('phone', e.target.value)}
                            placeholder="+7 999 123 45 67"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-password">Пароль</label>
                        <input
                            id="reg-password"
                            type="password"
                            value={form.password}
                            onChange={(e) => update('password', e.target.value)}
                            placeholder="Минимум 6 символов"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Создание...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <p className="auth-footer">
                    Уже есть аккаунт? <Link to="/login">Войдите</Link>
                </p>
            </div>
        </div>
    );
}
