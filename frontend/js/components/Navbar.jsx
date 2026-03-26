import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">🏔️</span>
                    <span className="logo-text">Tourist Center</span>
                </Link>

                <div className="navbar-actions">
                    {user ? (
                        <>
                            <Link
                                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                                className="nav-link"
                            >
                                <span className="nav-avatar">{user.name[0]}</span>
                                {user.name}
                            </Link>
                            <button className="btn btn-ghost" onClick={handleLogout}>
                                Выйти
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost">Войти</Link>
                            <Link to="/register" className="btn btn-primary">Регистрация</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
