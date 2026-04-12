import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { leadsApi, usersApi } from '../api';
import { isDisplayableAvatarUrl, clampAvatarStyle, AVATAR_GRADIENTS } from '../utils/avatar';

const AVATAR_PRESETS = AVATAR_GRADIENTS.map((_, i) => i);

function roleLabel(role) {
    if (role === 'super_admin') return 'Суперадминистратор';
    if (role === 'admin') return 'Администратор';
    return 'Клиент';
}

function roleHint(role) {
    if (role === 'super_admin') return 'Полный доступ к системе и пользователям.';
    if (role === 'admin') return 'Управление заявками, услугами и каталогом.';
    return 'Бронирование услуг и отслеживание ваших заявок.';
}

export default function Account() {
    const { user, updateProfile } = useAuth();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [avatarStyle, setAvatarStyle] = useState(0);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [stats, setStats] = useState({ leads: null, users: null, servicesHint: null });

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

    useEffect(() => {
        if (!user) return;
        setName(user.name || '');
        setPhone(user.phone || '');
        setAvatarStyle(clampAvatarStyle(user.avatar_style));
        setAvatarUrl(user.avatar_url || null);
    }, [user]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!user) return;
            try {
                if (isAdmin) {
                    const [u, l] = await Promise.all([usersApi.getAll(), leadsApi.getAll()]);
                    if (!cancelled) {
                        setStats({
                            leads: l.data?.length ?? 0,
                            users: u.data?.length ?? 0,
                            servicesHint: null,
                        });
                    }
                } else {
                    const l = await leadsApi.getAll();
                    if (!cancelled) {
                        setStats({
                            leads: l.data?.length ?? 0,
                            users: null,
                            servicesHint: null,
                        });
                    }
                }
            } catch {
                if (!cancelled) setStats({ leads: null, users: null, servicesHint: null });
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [user, isAdmin]);

    const userInitial = useMemo(
        () => (name || user?.name || '').trim()?.[0]?.toUpperCase() || '·',
        [name, user?.name],
    );

    const showImage = isDisplayableAvatarUrl(avatarUrl);

    const onAvatarFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Выберите файл изображения (JPG, PNG, WebP…).');
            return;
        }
        if (file.size > 200 * 1024) {
            setError('Файл слишком большой. Максимум 200 КБ.');
            return;
        }
        setError('');
        const reader = new FileReader();
        reader.onload = () => setAvatarUrl(reader.result);
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const clearAvatarPhoto = () => {
        setAvatarUrl(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setMessage('');
        try {
            await updateProfile({
                name: name.trim(),
                phone: phone.trim() || null,
                avatar_style: clampAvatarStyle(avatarStyle),
                avatar_url: showImage ? avatarUrl : null,
            });
            setMessage('Изменения сохранены.');
        } catch (err) {
            const msg = err.response?.data?.errors;
            if (typeof msg === 'object') {
                setError(Object.values(msg).flat().join('. '));
            } else {
                setError(err.response?.data?.message || 'Не удалось сохранить профиль.');
            }
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    const sidebarAvatarImg = isDisplayableAvatarUrl(user.avatar_url);

    return (
        <div className="account-page">
            <aside className="account-sidebar animate-in">
                <div className="account-sidebar__user">
                    {sidebarAvatarImg ? (
                        <span className="account-sidebar__avatar account-sidebar__avatar--img">
                            <img src={user.avatar_url} alt="" />
                        </span>
                    ) : (
                        <span
                            className="account-sidebar__avatar"
                            style={{ background: AVATAR_GRADIENTS[clampAvatarStyle(user.avatar_style)] }}
                        >
                            {(user.name || '?').trim().charAt(0).toUpperCase()}
                        </span>
                    )}
                    <div className="account-sidebar__who">
                        <span className="account-sidebar__who-name">{user.name}</span>
                        <span className="account-sidebar__who-email" title={user.email}>
                            {user.email}
                        </span>
                    </div>
                </div>
                <div className="account-sidebar__head">
                    <p className="account-sidebar__eyebrow">ELVA</p>
                    <h1 className="account-sidebar__title">Личный кабинет</h1>
                    <p className="account-sidebar__sub">Профиль и переходы</p>
                </div>
                <nav className="account-nav" aria-label="Разделы кабинета">
                    <NavLink to="/account" end className="account-nav__link">
                        <span className="account-nav__text">Профиль</span>
                    </NavLink>
                    {isAdmin ? (
                        <NavLink to="/admin" className="account-nav__link">
                            <span className="account-nav__text">Панель управления</span>
                        </NavLink>
                    ) : (
                        <NavLink to="/dashboard" className="account-nav__link">
                            <span className="account-nav__text">Услуги и заявки</span>
                        </NavLink>
                    )}
                    <Link to="/" className="account-nav__link account-nav__link--ghost">
                        <span className="account-nav__text">На главную</span>
                    </Link>
                </nav>
                <div className="account-quick" aria-label="Быстрый доступ">
                    <NavLink
                        to={isAdmin ? '/admin' : '/dashboard'}
                        className="account-quick-card"
                    >
                        <span className="account-quick-card__label">
                            {isAdmin ? 'Администрирование' : 'Каталог и заявки'}
                        </span>
                        <span className="account-quick-card__hint">
                            {isAdmin ? 'Заявки, услуги, пользователи' : 'Выбрать услугу и оставить заявку'}
                        </span>
                        <span className="account-quick-card__go" aria-hidden="true">
                            Перейти
                        </span>
                    </NavLink>
                </div>
            </aside>

            <div className="account-main animate-in" style={{ animationDelay: '0.08s' }}>
                <nav className="account-breadcrumb" aria-label="Навигация">
                    <Link to="/">Главная</Link>
                    <span className="account-breadcrumb__sep" aria-hidden="true">
                        /
                    </span>
                    <span className="account-breadcrumb__current">Личный кабинет</span>
                </nav>

                <header className="account-hero account-hero--compact">
                    <div className="account-hero__text">
                        <p className="account-hero__accent">Здравствуйте</p>
                        <h2 className="account-hero__name">{name || user.name}</h2>
                        <div className="account-hero__row">
                            <div className="account-role-pill" data-role={user.role}>
                                {roleLabel(user.role)}
                            </div>
                            <p className="account-hero__hint">{roleHint(user.role)}</p>
                        </div>
                    </div>
                </header>

                <section className="account-stats" aria-label="Краткая статистика">
                    {stats.leads != null && (
                        <div className="account-stat-card">
                            <span className="account-stat-card__value">{stats.leads}</span>
                            <span className="account-stat-card__label">
                                {isAdmin ? 'Заявок в системе' : 'Ваших заявок'}
                            </span>
                        </div>
                    )}
                    {isAdmin && stats.users != null && (
                        <div className="account-stat-card">
                            <span className="account-stat-card__value">{stats.users}</span>
                            <span className="account-stat-card__label">Пользователей</span>
                        </div>
                    )}
                    <div className="account-stat-card account-stat-card--muted">
                        <span className="account-stat-card__value account-stat-card__value--sm">
                            {user.status === 'active' ? 'Активен' : user.status || '—'}
                        </span>
                        <span className="account-stat-card__label">Статус аккаунта</span>
                    </div>
                </section>

                <section className="account-card">
                    <div className="account-card__head">
                        <h3 className="account-card__title">Данные профиля</h3>
                        <p className="account-card__lead">
                            Имя и телефон подставляются в заявки. Смена email — через поддержку.
                        </p>
                    </div>

                    {message && <div className="account-alert account-alert--ok">{message}</div>}
                    {error && <div className="account-alert account-alert--err">{error}</div>}

                    <form className="account-form" onSubmit={handleSubmit}>
                        <div className="account-form-split">
                            <div className="account-form-split__visual">
                                <p className="account-form-split__kicker">Фото в шапке сайта</p>
                                <div
                                    className={`account-avatar-large account-avatar-large--form ${
                                        showImage ? 'account-avatar-large--has-img' : ''
                                    }`}
                                    style={
                                        showImage
                                            ? undefined
                                            : { background: AVATAR_GRADIENTS[clampAvatarStyle(avatarStyle)] }
                                    }
                                >
                                    {showImage ? (
                                        <img src={avatarUrl} alt="" className="account-avatar-large__img" />
                                    ) : (
                                        <span className="account-avatar-large__initial">{userInitial}</span>
                                    )}
                                </div>
                                <p className="account-avatar-block__hint account-avatar-block__hint--tight">
                                    До 200 КБ. Без фото — инициалы и оттенок ниже.
                                </p>
                                <div className="account-avatar-block__actions">
                                    <label className="btn btn-outline account-file-btn">
                                        Загрузить
                                        <input type="file" accept="image/*" className="account-file-btn__input" onChange={onAvatarFile} />
                                    </label>
                                    {showImage && (
                                        <button type="button" className="btn btn-outline" onClick={clearAvatarPhoto}>
                                            Убрать
                                        </button>
                                    )}
                                </div>
                                <p className="account-preset-label">Оттенок</p>
                                <div className="account-preset-row" role="group" aria-label="Оттенок аватара">
                                    {AVATAR_PRESETS.map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            className={`account-preset ${
                                                clampAvatarStyle(avatarStyle) === p ? 'is-active' : ''
                                            }`}
                                            style={{ background: AVATAR_GRADIENTS[p] }}
                                            title={`Вариант ${p + 1}`}
                                            onClick={() => setAvatarStyle(p)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="account-form-split__fields">
                                <label className="account-field">
                                    <span className="account-field__label">Email</span>
                                    <input
                                        className="account-field__input account-field__input--readonly"
                                        value={user.email}
                                        readOnly
                                        tabIndex={-1}
                                        aria-readonly="true"
                                    />
                                </label>
                                <div className="account-form__grid account-form__grid--tight">
                                    <label className="account-field">
                                        <span className="account-field__label">Имя</span>
                                        <input
                                            className="account-field__input"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            maxLength={255}
                                            autoComplete="name"
                                        />
                                    </label>
                                    <label className="account-field">
                                        <span className="account-field__label">Телефон</span>
                                        <input
                                            className="account-field__input"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+7 …"
                                            autoComplete="tel"
                                        />
                                    </label>
                                </div>
                                <div className="account-form__footer">
                                    <button type="submit" className="btn btn-primary account-save-btn" disabled={saving}>
                                        {saving ? 'Сохранение…' : 'Сохранить'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}
