import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(form.email, form.password);
            navigate(user.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка входа');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <header className="auth-form__head">
                    <h1 className="auth-form__title">Вход</h1>
                    <p className="auth-form__subtitle">Войдите в свой аккаунт</p>
                </header>

                {error && (
                    <div className="auth-form__alert auth-form__alert--error" role="alert">
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="auth-form__field">
                        <label className="auth-form__label" htmlFor="login-email">
                            Email
                        </label>
                        <input
                            id="login-email"
                            className="auth-form__control"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="example@mail.com"
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="auth-form__field">
                        <label className="auth-form__label" htmlFor="login-password">
                            Пароль
                        </label>
                        <input
                            id="login-password"
                            className="auth-form__control"
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder="••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    <button type="submit" className="auth-form__submit" disabled={loading}>
                        {loading ? 'Вход…' : 'Войти'}
                    </button>
                </form>

                <p className="auth-footer">
                    Нет аккаунта?{' '}
                    <Link to="/register">Зарегистрируйтесь</Link>
                </p>
            </div>
        </div>
    );
}
