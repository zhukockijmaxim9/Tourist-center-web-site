import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { servicesApi, leadsApi, categoriesApi } from '../api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { getServicePhotoUrl, serviceImageOnError } from '../utils/serviceCardImage';

const LEAD_STATUS_RU = {
    new: 'Новая',
    in_progress: 'В работе',
    confirmed: 'Подтверждена',
    done: 'Выполнено',
    cancelled: 'Отменена',
};

function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function UserDashboard() {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [leads, setLeads] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', service_id: '' });
    const [error, setError] = useState('');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false });
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [query, setQuery] = useState('');
    const [onlyActive, setOnlyActive] = useState(true);
    const [leadStatusFilter, setLeadStatusFilter] = useState('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [sRes, lRes, cRes] = await Promise.all([
                servicesApi.getAll(),
                leadsApi.getAll(),
                categoriesApi.getAll(),
            ]);
            setServices(sRes.data);
            setLeads(lRes.data);
            setCategories(cRes.data);
        } catch (err) {
            alert('Ошибка загрузки данных: ' + (err.response?.data?.message || err.message));
        }
    };

    const openCreate = (service) => {
        setEditingLead(null);
        setForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            message: '',
            service_id: service?.id || (services.length > 0 ? services[0].id : ''),
        });
        setError('');
        setShowModal(true);
    };

    const openEdit = (lead) => {
        setEditingLead(lead);
        setForm({
            name: lead.name,
            email: lead.email || '',
            phone: lead.phone,
            message: lead.message || '',
            service_id: lead.service_id || '',
        });
        setError('');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingLead) {
                await leadsApi.update(editingLead.id, form);
            } else {
                await leadsApi.create(form);
            }
            setShowModal(false);
            loadData();
        } catch (err) {
            const msg = err.response?.data?.errors;
            if (typeof msg === 'object') {
                setError(Object.values(msg).flat().join('. '));
            } else {
                setError(err.response?.data?.message || 'Ошибка');
            }
        }
    };

    const handleDelete = async (lead) => {
        setConfirmModal({
            isOpen: true,
            title: 'Удалить заявку?',
            body: 'Вы уверены? Это действие нельзя отменить.',
            confirmText: 'Удалить',
            danger: true,
            onConfirm: async () => {
                await leadsApi.delete(lead.id);
                setConfirmModal({ isOpen: false });
                loadData();
            },
        });
    };

    const update = (key, val) => setForm({ ...form, [key]: val });

    const leadColumns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Имя' },
        { key: 'phone', label: 'Телефон' },
        {
            key: 'service',
            label: 'Услуга',
            render: (val) => val?.name || '—',
        },
        {
            key: 'status',
            label: 'Статус',
            render: (val) => (
                <span className={`badge badge-${val === 'done' ? 'success' : val === 'cancelled' ? 'danger' : 'primary'}`}>
                    {LEAD_STATUS_RU[val] || val}
                </span>
            ),
        },
        { key: 'created_at', label: 'Дата', render: (val) => new Date(val).toLocaleDateString('ru-RU') },
    ];

    const normalizedQuery = query.trim().toLowerCase();

    const filteredLeads =
        leadStatusFilter === 'all'
            ? leads
            : leads.filter((l) => l.status === leadStatusFilter);

    const leadStatusLabels = [
        { id: 'all', label: 'Все' },
        { id: 'new', label: LEAD_STATUS_RU.new },
        { id: 'in_progress', label: LEAD_STATUS_RU.in_progress },
        { id: 'confirmed', label: LEAD_STATUS_RU.confirmed },
        { id: 'done', label: LEAD_STATUS_RU.done },
        { id: 'cancelled', label: LEAD_STATUS_RU.cancelled },
    ];

    const leadFilterHeading =
        leadStatusFilter === 'all'
            ? 'Все заявки'
            : leadStatusLabels.find((x) => x.id === leadStatusFilter)?.label ?? 'Заявки';

    const filteredServices = services
        .filter((s) => (selectedCategory === 'all' ? true : s.category_id === Number(selectedCategory)))
        .filter((s) => (onlyActive ? s.status === 'active' : true))
        .filter((s) => {
            if (!normalizedQuery) return true;
            const name = (s.name || '').toLowerCase();
            const desc = (s.description || '').toLowerCase();
            const cat = (s.category?.name || '').toLowerCase();
            return name.includes(normalizedQuery) || desc.includes(normalizedQuery) || cat.includes(normalizedQuery);
        });

    const servicesShown = filteredServices.length;
    const servicesTotal = services.length;

    return (
        <div className="dashboard dashboard--user">
            <header className="user-dashboard-hero animate-in">
                <div className="user-dashboard-hero__inner">
                    <p className="user-dashboard-eyebrow">ELVA</p>
                    <h1 className="user-dashboard-hero__title">С возвращением, {user?.name}</h1>
                    <p className="user-dashboard-hero__lead">
                        Каталог услуг и ваши заявки в одном месте. Обновите профиль или аватар в любой момент.
                    </p>
                    <div className="user-dashboard-hero__actions">
                        <Link to="/account" className="btn btn-outline user-dashboard-hero__link">
                            Личный кабинет
                        </Link>
                        <button
                            type="button"
                            className="btn btn-outline user-dashboard-hero__link"
                            onClick={() => scrollToSection('user-leads')}
                        >
                            К заявкам
                        </button>
                    </div>
                </div>
            </header>

            <nav className="user-dashboard-rail" aria-label="Переход по разделам страницы">
                <button
                    type="button"
                    className="user-dashboard-rail__btn"
                    onClick={() => scrollToSection('user-services')}
                >
                    Услуги
                </button>
                <button
                    type="button"
                    className="user-dashboard-rail__btn"
                    onClick={() => scrollToSection('user-leads')}
                >
                    Заявки
                    {leads.length > 0 && (
                        <span className="user-dashboard-rail__count">{leads.length}</span>
                    )}
                </button>
            </nav>

            <section
                id="user-services"
                className="dashboard-section user-dashboard-panel animate-in"
                style={{ animationDelay: '0.08s' }}
                aria-labelledby="user-services-heading"
            >
                <div className="user-dashboard-section-head section-header">
                    <div className="user-dashboard-section-head__titles">
                        <p className="user-dashboard-eyebrow user-dashboard-eyebrow--muted">Каталог</p>
                        <h2 className="user-dashboard-section-title" id="user-services-heading">
                            Услуги
                        </h2>
                    </div>
                    <div className="user-dashboard-toolbar">
                        <div className="service-search service-search--enhanced user-dashboard-toolbar__search">
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Название, описание, категория…"
                                aria-label="Поиск по услугам"
                            />
                        </div>
                        <button
                            type="button"
                            className={`services-filter__chip services-filter__chip--toggle ${
                                onlyActive ? 'is-active' : ''
                            }`}
                            onClick={() => setOnlyActive((v) => !v)}
                            title="Показывать только доступные"
                        >
                            {onlyActive ? 'Доступные' : 'Все статусы'}
                        </button>
                    </div>
                </div>

                {servicesTotal > 0 && (
                    <p className="user-dashboard-services-meta" role="status">
                        Показано{' '}
                        <strong>{servicesShown}</strong>
                        {' из '}
                        <strong>{servicesTotal}</strong>
                        {onlyActive ? ' (только доступные)' : ''}
                    </p>
                )}

                {categories.length > 0 && (
                    <div
                        className="services-filter user-dashboard-services-filter"
                        role="toolbar"
                        aria-label="Категории услуг"
                    >
                        <div className="services-filter__track">
                            <div className="services-filter__chips">
                                <button
                                    type="button"
                                    className={`services-filter__chip ${selectedCategory === 'all' ? 'is-active' : ''}`}
                                    onClick={() => setSelectedCategory('all')}
                                    aria-pressed={selectedCategory === 'all'}
                                >
                                    Все
                                </button>
                                {categories.map((c) => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        className={`services-filter__chip ${
                                            String(selectedCategory) === String(c.id) ? 'is-active' : ''
                                        }`}
                                        onClick={() => setSelectedCategory(String(c.id))}
                                        aria-pressed={String(selectedCategory) === String(c.id)}
                                    >
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <h3 className="services-filter__heading user-dashboard-services-filter__heading" aria-live="polite">
                            {selectedCategory === 'all'
                                ? 'Все категории'
                                : categories.find((c) => String(c.id) === String(selectedCategory))?.name ??
                                  'Категория'}
                        </h3>
                    </div>
                )}

                <div className="services-grid services-grid--showcase">
                    {filteredServices.map((s) => {
                        const isActive = s.status === 'active';
                        return (
                            <article
                                key={s.id}
                                className={`service-showcase ${isActive ? '' : 'service-showcase--inactive-dash'}`}
                                onClick={() => isActive && openCreate(s)}
                                onKeyDown={(e) => {
                                    if (!isActive) return;
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        openCreate(s);
                                    }
                                }}
                                role={isActive ? 'button' : undefined}
                                tabIndex={isActive ? 0 : undefined}
                                aria-label={isActive ? `Оформить заявку: ${s.name}` : undefined}
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
                                            isActive ? 'service-showcase__badge--on' : 'service-showcase__badge--off'
                                        }`}
                                    >
                                        {isActive ? 'Доступно' : 'Недоступно'}
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
                                        {isActive && (
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
                        );
                    })}
                    {services.length === 0 && (
                        <p className="user-dashboard-placeholder">Услуги пока не добавлены — загляните позже.</p>
                    )}
                    {services.length > 0 && filteredServices.length === 0 && (
                        <p className="user-dashboard-placeholder">По выбранным фильтрам ничего не найдено.</p>
                    )}
                </div>
            </section>

            <section
                id="user-leads"
                className="dashboard-section user-dashboard-panel user-dashboard-panel--leads animate-in"
                style={{ animationDelay: '0.16s' }}
                aria-labelledby="user-leads-heading"
            >
                <div className="user-dashboard-section-head section-header">
                    <div className="user-dashboard-section-head__titles">
                        <p className="user-dashboard-eyebrow user-dashboard-eyebrow--muted">Заявки</p>
                        <h2 className="user-dashboard-section-title" id="user-leads-heading">
                            Мои заявки
                        </h2>
                        {leads.length > 0 && (
                            <p className="user-dashboard-leads-meta">Всего в списке: {leads.length}</p>
                        )}
                    </div>
                    <button type="button" className="btn btn-primary user-dashboard-btn-new" onClick={() => openCreate()}>
                        Новая заявка
                    </button>
                </div>

                {leads.length > 0 && (
                    <div
                        className="services-filter user-dashboard-leads-filter"
                        role="toolbar"
                        aria-label="Фильтр по статусу заявки"
                    >
                        <div className="services-filter__track">
                            <div className="services-filter__chips">
                                {leadStatusLabels.map(({ id, label }) => (
                                    <button
                                        key={id}
                                        type="button"
                                        className={`services-filter__chip ${leadStatusFilter === id ? 'is-active' : ''}`}
                                        onClick={() => setLeadStatusFilter(id)}
                                        aria-pressed={leadStatusFilter === id}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <h3 className="services-filter__heading user-dashboard-leads-filter__heading" aria-live="polite">
                            {leadFilterHeading}
                        </h3>
                    </div>
                )}

                {leads.length === 0 ? (
                    <div className="user-dashboard-empty-leads">
                        <p className="user-dashboard-empty-leads__title">Пока нет заявок</p>
                        <p className="user-dashboard-empty-leads__text">
                            Выберите услугу выше и оформите заявку — мы свяжемся с вами по указанным контактам.
                        </p>
                        <button type="button" className="btn btn-primary" onClick={() => openCreate()}>
                            Создать заявку
                        </button>
                    </div>
                ) : (
                    <div className="user-dashboard-table-shell">
                        {filteredLeads.length === 0 ? (
                            <p className="user-dashboard-placeholder user-dashboard-placeholder--table">
                                Нет заявок с выбранным статусом.
                            </p>
                        ) : (
                            <DataTable
                                columns={leadColumns}
                                data={filteredLeads}
                                onEdit={openEdit}
                                onDelete={handleDelete}
                            />
                        )}
                    </div>
                )}
            </section>

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingLead ? 'Редактировать заявку' : 'Новая заявка'}
                contentClassName="modal-content--elva"
            >
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Имя</label>
                        <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Телефон</label>
                        <input value={form.phone} onChange={(e) => update('phone', e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Услуга</label>
                        <select value={form.service_id} onChange={(e) => update('service_id', e.target.value)} required>
                            <option value="">Выберите услугу</option>
                            {services.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Сообщение</label>
                        <textarea value={form.message} onChange={(e) => update('message', e.target.value)} rows={3} />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">
                        {editingLead ? 'Сохранить' : 'Отправить'}
                    </button>
                </form>
            </Modal>

            {/* Confirm Modal */}
            <Modal
                isOpen={!!confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false })}
                title={confirmModal.title || 'Подтверждение'}
                contentClassName="modal-content--elva"
            >
                <p className="user-dashboard-confirm-text">{confirmModal.body || 'Вы уверены?'}</p>
                <div className="user-dashboard-modal-actions">
                    <button className="btn btn-outline" type="button" onClick={() => setConfirmModal({ isOpen: false })}>
                        Отмена
                    </button>
                    <button
                        className={`btn ${confirmModal.danger ? 'btn-danger' : 'btn-primary'}`}
                        type="button"
                        onClick={async () => {
                            try {
                                await confirmModal.onConfirm?.();
                            } catch (err) {
                                alert(err.response?.data?.message || err.message || 'Ошибка');
                            }
                        }}
                    >
                        {confirmModal.confirmText || 'Ок'}
                    </button>
                </div>
            </Modal>
        </div>
    );
}
