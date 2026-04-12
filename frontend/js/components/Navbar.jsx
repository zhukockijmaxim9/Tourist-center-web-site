import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { isDisplayableAvatarUrl, clampAvatarStyle, AVATAR_GRADIENTS } from '../utils/avatar';
import { IconThemeMoon, IconThemeSun } from './icons/ThemeToggleIcons';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const userInitial = user?.name?.trim?.()?.[0]?.toUpperCase?.() || '·';
    const navAvatarImg = user && isDisplayableAvatarUrl(user.avatar_url);
    const navPreset = clampAvatarStyle(user?.avatar_style);
    const isLanding = location.pathname === '/';

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav
            className={`navbar ${isLanding ? 'navbar--hero' : ''}`}
            aria-label="Основная навигация"
        >
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand">
                    <span className="navbar-brand__word">ELVA</span>
                    <span className="navbar-brand__tag">главная</span>
                </Link>

                <div className="navbar-actions">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="navbar-icon-btn"
                        title="Сменить тему"
                        aria-label={
                            theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'
                        }
                    >
                        <span className="navbar-theme-icon-wrap">
                            {theme === 'light' ? (
                                <IconThemeMoon className="navbar-theme-svg" />
                            ) : (
                                <IconThemeSun className="navbar-theme-svg" />
                            )}
                        </span>
                    </button>
                    {user ? (
                        <>
                            <Link
                                to="/account"
                                className="navbar-link navbar-link--account"
                                title="Личный кабинет"
                            >
                                {navAvatarImg ? (
                                    <span className="nav-avatar nav-avatar--img" aria-hidden="true">
                                        <img src={user.avatar_url} alt="" />
                                    </span>
                                ) : (
                                    <span
                                        className="nav-avatar nav-avatar--preset"
                                        aria-hidden="true"
                                        style={{ background: AVATAR_GRADIENTS[navPreset] }}
                                    >
                                        {userInitial}
                                    </span>
                                )}
                                <span className="navbar-link__label">
                                    {user?.name || 'Кабинет'}
                                </span>
                            </Link>
                            <button
                                type="button"
                                className="navbar-link navbar-link--quiet"
                                onClick={handleLogout}
                            >
                                Выйти
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="navbar-link navbar-link--guest">
                                Войти
                            </Link>
                            <Link to="/register" className="navbar-cta">
                                Регистрация
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
