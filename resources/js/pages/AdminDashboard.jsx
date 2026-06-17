import React, { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { usersApi, servicesApi, leadsApi, categoriesApi, reviewsApi } from '../api';
import Modal from '../components/Modal';
import { ROLE_BADGES, ROLE_LABELS } from '../constants/roles';
import { LEAD_STATUS_LABELS } from '../constants/leadStatus';
import AdminCategoriesTab from '../features/admin/AdminCategoriesTab';
import AdminLeadsTab from '../features/admin/AdminLeadsTab';
import AdminReviewsTab from '../features/admin/AdminReviewsTab';
import AdminServicesTab from '../features/admin/AdminServicesTab';
import AdminUsersTab from '../features/admin/AdminUsersTab';
import LeadContactModal from '../features/leads/LeadContactModal';
import LeadEditModal from '../features/leads/LeadEditModal';
import useLeadWorkflow from '../features/leads/useLeadWorkflow';
import { useNotify, getErrorMessage } from '../context/NotifyContext';

const TABS = [
    { key: 'users', label: '👥 Пользователи' },
    { key: 'services', label: '🌌 Услуги' },
    { key: 'categories', label: '📃 Категории' },
    { key: 'leads', label: '📋 Заявки' },
    { key: 'reviews', label: '⭐ Отзывы' },
];

export default function AdminDashboard() {
    const notify = useNotify();
    const [tab, setTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({});
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [leadStatusFilter, setLeadStatusFilter] = useState('all');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false });
    const [query, setQuery] = useState({ users: '', services: '', categories: '', leads: '', reviews: '' });
    const [reviewSort, setReviewSort] = useState('best');
    const {
        leads,
        setLeads,
        leadNotes,
        editingLead,
        editForm,
        editError,
        leadContactModal,
        setEditForm,
        reloadLeads,
        openLeadEdit,
        closeLeadEdit,
        updateLeadStatus,
        saveEditedLead,
        addLeadNote,
        openLeadContact,
        closeLeadContact,
        actLead,
        confirmLead,
        assignLead,
        updatingStatusLeadId,
        savingLead,
        savingNote,
        claimingLeadId,
        acting,
        confirmingLeadId,
        assigningLeadId,
    } = useLeadWorkflow();

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        try {
            const [u, s, c, r] = await Promise.all([
                usersApi.getAll(),
                servicesApi.getAll(),
                categoriesApi.getAll(),
                reviewsApi.getAll(),
            ]);

            setUsers(u.data);
            setServices(s.data);
            setCategories(c.data);
            setReviews(r.data);
            await reloadLeads();
        } catch (err) {
            notify.fromError(err, 'Ошибка загрузки данных');
        }
    };

    const updateFormField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
    const q = (tabKey) => (query[tabKey] || '').trim().toLowerCase();
    const setQ = (tabKey, value) => setQuery((current) => ({ ...current, [tabKey]: value }));

    const userColumns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Имя' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Телефон' },
        {
            key: 'role',
            label: 'Роль',
            render: (value) => (
                <span className={`badge badge-${ROLE_BADGES[value] || 'muted'}`}>
                    {ROLE_LABELS[value] || value}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Статус',
            render: (value) => <span className={`badge badge-${value === 'active' ? 'success' : 'muted'}`}>{value}</span>,
        },
    ];

    const serviceColumns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Название' },
        { key: 'category', label: 'Категория', render: (value) => value?.name || '—' },
        { key: 'description', label: 'Описание', render: (value) => (value ? (value.length > 50 ? `${value.slice(0, 50)}…` : value) : '—') },
        { key: 'price', label: 'Цена', render: (value) => (value ? `${Number(value).toLocaleString('ru-RU')} ₽` : '—') },
        {
            key: 'status',
            label: 'Статус',
            render: (value) => <span className={`badge badge-${value === 'active' ? 'success' : 'muted'}`}>{value}</span>,
        },
    ];

    const categoryColumns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Название' },
        { key: 'description', label: 'Описание' },
    ];

    const reviewColumns = [
        { key: 'id', label: 'ID' },
        { key: 'service', label: 'Услуга', render: (value) => value?.name },
        { key: 'user', label: 'Автор', render: (value) => value?.name },
        { key: 'rating', label: 'Оценка', render: (value) => '⭐'.repeat(value) },
        { key: 'comment', label: 'Комментарий' },
    ];

    const openUserCreate = () => {
        setEditing(null);
        setForm({ name: '', email: '', phone: '', password: '', role: 'user', status: 'active' });
        setError('');
        setShowModal(true);
    };

    const openUserEdit = (user) => {
        setEditing(user);
        setForm({ name: user.name, email: user.email, phone: user.phone || '', password: '', role: user.role, status: user.status });
        setError('');
        setShowModal(true);
    };

    const submitUser = async (e) => {
        e.preventDefault();
        if (saving) return;
        setError('');
        setSaving(true);

        try {
            const data = { ...form };
            if (!data.password) delete data.password;

            if (editing) {
                await usersApi.update(editing.id, data);
                notify.success('Пользователь обновлён');
            } else {
                await usersApi.create(data);
                notify.success('Пользователь создан');
            }

            setShowModal(false);
            await loadAll();
        } catch (err) {
            handleError(err);
        } finally {
            setSaving(false);
        }
    };

    const deleteUser = async (user) => {
        setConfirmModal({
            isOpen: true,
            title: 'Удалить пользователя?',
            body: `Пользователь: ${user.name}`,
            confirmText: 'Удалить',
            danger: true,
            onConfirm: async () => {
                setConfirmLoading(true);
                try {
                    await usersApi.delete(user.id);
                    setConfirmModal({ isOpen: false });
                    notify.success('Пользователь удалён');
                    await loadAll();
                } catch (err) {
                    notify.fromError(err, 'Не удалось удалить пользователя');
                } finally {
                    setConfirmLoading(false);
                }
            },
        });
    };

    const openServiceCreate = () => {
        setEditing(null);
        setForm({ name: '', description: '', price: '', image: '', status: 'active', category_id: '' });
        setError('');
        setShowModal(true);
    };

    const openServiceEdit = (service) => {
        setEditing(service);
        setForm({
            name: service.name,
            description: service.description || '',
            price: service.price || '',
            image: service.image || '',
            status: service.status,
            category_id: service.category_id || '',
        });
        setError('');
        setShowModal(true);
    };

    const submitService = async (e) => {
        e.preventDefault();
        if (saving) return;
        setError('');
        setSaving(true);

        try {
            if (editing) {
                await servicesApi.update(editing.id, form);
                notify.success('Услуга обновлена');
            } else {
                await servicesApi.create(form);
                notify.success('Услуга создана');
            }

            setShowModal(false);
            await loadAll();
        } catch (err) {
            handleError(err);
        } finally {
            setSaving(false);
        }
    };

    const deleteService = async (service) => {
        setConfirmModal({
            isOpen: true,
            title: 'Удалить услугу?',
            body: `Услуга: "${service.name}"`,
            confirmText: 'Удалить',
            danger: true,
            onConfirm: async () => {
                setConfirmLoading(true);
                try {
                    await servicesApi.delete(service.id);
                    setConfirmModal({ isOpen: false });
                    notify.success('Услуга удалена');
                    await loadAll();
                } catch (err) {
                    notify.fromError(err, 'Не удалось удалить услугу');
                } finally {
                    setConfirmLoading(false);
                }
            },
        });
    };

    const openCategoryCreate = () => {
        setEditing(null);
        setForm({ name: '', description: '' });
        setError('');
        setShowModal(true);
    };

    const openCategoryEdit = (category) => {
        setEditing(category);
        setForm({ name: category.name, description: category.description || '' });
        setError('');
        setShowModal(true);
    };

    const submitCategory = async (e) => {
        e.preventDefault();
        if (saving) return;
        setError('');
        setSaving(true);

        try {
            if (editing) {
                await categoriesApi.update(editing.id, form);
                notify.success('Категория обновлена');
            } else {
                await categoriesApi.create(form);
                notify.success('Категория создана');
            }

            setShowModal(false);
            await loadAll();
        } catch (err) {
            handleError(err);
        } finally {
            setSaving(false);
        }
    };

    const deleteCategory = async (category) => {
        setConfirmModal({
            isOpen: true,
            title: 'Удалить категорию?',
            body: `Категория: "${category.name}". Это может отвязать услуги.`,
            confirmText: 'Удалить',
            danger: true,
            onConfirm: async () => {
                setConfirmLoading(true);
                try {
                    await categoriesApi.delete(category.id);
                    setConfirmModal({ isOpen: false });
                    notify.success('Категория удалена');
                    await loadAll();
                } catch (err) {
                    notify.fromError(err, 'Не удалось удалить категорию');
                } finally {
                    setConfirmLoading(false);
                }
            },
        });
    };

    const deleteReview = async (review) => {
        setConfirmModal({
            isOpen: true,
            title: 'Удалить отзыв?',
            body: 'Это действие нельзя отменить.',
            confirmText: 'Удалить',
            danger: true,
            onConfirm: async () => {
                setConfirmLoading(true);
                try {
                    await reviewsApi.delete(review.id);
                    setConfirmModal({ isOpen: false });
                    notify.success('Отзыв удалён');
                    await loadAll();
                } catch (err) {
                    notify.fromError(err, 'Не удалось удалить отзыв');
                } finally {
                    setConfirmLoading(false);
                }
            },
        });
    };

    const deleteLead = async (lead) => {
        setConfirmModal({
            isOpen: true,
            title: 'Удалить заявку?',
            body: `Заявка от: ${lead.name}`,
            confirmText: 'Удалить',
            danger: true,
            onConfirm: async () => {
                setConfirmLoading(true);
                try {
                    await leadsApi.delete(lead.id);
                    setConfirmModal({ isOpen: false });
                    notify.success('Заявка удалена');
                    await reloadLeads();
                } catch (err) {
                    notify.fromError(err, 'Не удалось удалить заявку');
                } finally {
                    setConfirmLoading(false);
                }
            },
        });
    };



    const handleError = (err) => {
        const message = err.response?.data?.errors;
        if (typeof message === 'object') {
            setError(Object.values(message).flat().join('. '));
        } else {
            setError(getErrorMessage(err, 'Ошибка'));
        }
    };

    const usersFiltered = users.filter((user) => {
        const needle = q('users');
        if (!needle) return true;
        return `${user.name || ''} ${user.email || ''} ${user.phone || ''} ${ROLE_LABELS[user.role] || user.role || ''}`.toLowerCase().includes(needle);
    });

    const managers = users.filter((user) => user.role === 'manager' && user.status === 'active');

    const servicesFiltered = services.filter((service) => {
        const needle = q('services');
        if (!needle) return true;
        return `${service.name || ''} ${service.description || ''} ${service.category?.name || ''}`.toLowerCase().includes(needle);
    });

    const categoriesFiltered = categories.filter((category) => {
        const needle = q('categories');
        if (!needle) return true;
        return `${category.name || ''} ${category.description || ''}`.toLowerCase().includes(needle);
    });

    const filteredLeads = leadStatusFilter === 'all'
        ? leads
        : leads.filter((lead) => lead.status === leadStatusFilter);

    const leadsFiltered = filteredLeads.filter((lead) => {
        const needle = q('leads');
        if (!needle) return true;
        const phone = lead.phone || lead.user?.phone || '';
        return `${lead.name || ''} ${lead.email || ''} ${phone} ${lead.service?.name || ''}`.toLowerCase().includes(needle);
    });

    const reviewsFiltered = reviews.filter((review) => {
        const needle = q('reviews');
        if (!needle) return true;
        return `${review.comment || ''} ${review.service?.name || ''} ${review.user?.name || ''}`.toLowerCase().includes(needle);
    });

    const reviewsSorted = [...reviewsFiltered].sort((a, b) => {
        const ratingA = Number(a?.rating || 0);
        const ratingB = Number(b?.rating || 0);
        if (ratingA !== ratingB) return reviewSort === 'worst' ? ratingA - ratingB : ratingB - ratingA;
        const dateA = a?.created_at ? Date.parse(a.created_at) : 0;
        const dateB = b?.created_at ? Date.parse(b.created_at) : 0;
        return dateB - dateA;
    });

    const leadCountByStatus = (status) => leads.filter((lead) => lead.status === status).length;

    const submitLead = async (e) => {
        e.preventDefault();
        await saveEditedLead((currentForm) => currentForm);
    };

    const activeStats = [
        { label: 'Пользователей', value: users.length, icon: '👥' },
        { label: 'Услуг', value: services.length, icon: '🌌' },
        { label: 'Заявок', value: leads.length, icon: '📋' },
    ];

    return (
        <div className="dashboard dashboard--admin">
            <div className="dashboard-header animate-in">
                <div>
                    <h1>Панель администратора</h1>
                    <p className="text-muted">
                        Управление пользователями, услугами и заявками.{' '}
                        <Link href="/account" className="dashboard-inline-link">
                            Личный кабинет
                        </Link>
                    </p>
                </div>
            </div>

            <div className="stats-grid animate-in" style={{ animationDelay: '0.1s' }}>
                {activeStats.map((item) => (
                    <div key={item.label} className="stats-card">
                        <div className="stats-card-icon">{item.icon}</div>
                        <div className="stats-card-info">
                            <span className="stats-value">{item.value}</span>
                            <span className="stats-label">{item.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="tabs">
                {TABS.map((item) => (
                    <button
                        key={item.key}
                        className={`tab ${tab === item.key ? 'tab-active' : ''}`}
                        onClick={() => setTab(item.key)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {tab === 'users' && (
                <AdminUsersTab
                    users={usersFiltered}
                    query={query.users}
                    onQueryChange={(value) => setQ('users', value)}
                    onCreate={openUserCreate}
                    columns={userColumns}
                    onEdit={openUserEdit}
                    onDelete={deleteUser}
                />
            )}

            {tab === 'services' && (
                <AdminServicesTab
                    services={servicesFiltered}
                    query={query.services}
                    onQueryChange={(value) => setQ('services', value)}
                    onCreate={openServiceCreate}
                    columns={serviceColumns}
                    onEdit={openServiceEdit}
                    onDelete={deleteService}
                />
            )}

            {tab === 'categories' && (
                <AdminCategoriesTab
                    categories={categoriesFiltered}
                    query={query.categories}
                    onQueryChange={(value) => setQ('categories', value)}
                    onCreate={openCategoryCreate}
                    columns={categoryColumns}
                    onEdit={openCategoryEdit}
                    onDelete={deleteCategory}
                />
            )}

            {tab === 'reviews' && (
                <AdminReviewsTab
                    reviews={reviewsSorted}
                    query={query.reviews}
                    onQueryChange={(value) => setQ('reviews', value)}
                    sort={reviewSort}
                    onSortChange={setReviewSort}
                    columns={reviewColumns}
                    onDelete={deleteReview}
                />
            )}

            {tab === 'leads' && (
                <AdminLeadsTab
                    leads={leads}
                    filteredLeads={leadsFiltered}
                    query={query.leads}
                    onQueryChange={(value) => setQ('leads', value)}
                    statusFilter={leadStatusFilter}
                    onStatusFilterChange={setLeadStatusFilter}
                    getLeadCountByStatus={leadCountByStatus}
                    managers={managers}
                    onStatusChange={updateLeadStatus}
                    onOpenContact={openLeadContact}
                    onOpenEdit={openLeadEdit}
                    onConfirm={confirmLead}
                    onDelete={deleteLead}
                    onAssignManager={assignLead}
                    updatingStatusLeadId={updatingStatusLeadId}
                    claimingLeadId={claimingLeadId}
                    confirmingLeadId={confirmingLeadId}
                    assigningLeadId={assigningLeadId}
                />
            )}

            {tab === 'users' && (
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={editing ? 'Редактировать' : 'Новый пользователь'}
                    contentClassName="modal-content--elva"
                    disableClose={saving}
                >
                    {error && <div className="alert alert-error">{error}</div>}
                    <form onSubmit={submitUser}>
                        <div className="form-group">
                            <label>Имя</label>
                            <input value={form.name || ''} onChange={(e) => updateFormField('name', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={form.email || ''} onChange={(e) => updateFormField('email', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Телефон</label>
                            <input value={form.phone || ''} onChange={(e) => updateFormField('phone', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>{editing ? 'Новый пароль (оставьте пустым)' : 'Пароль'}</label>
                            <input
                                type="password"
                                value={form.password || ''}
                                onChange={(e) => updateFormField('password', e.target.value)}
                                {...(!editing ? { required: true } : {})}
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Роль</label>
                                <select value={form.role || 'user'} onChange={(e) => updateFormField('role', e.target.value)}>
                                    <option value="user">Пользователь</option>
                                    <option value="manager">Менеджер</option>
                                    <option value="admin">Админ</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Статус</label>
                                <select value={form.status || 'active'} onChange={(e) => updateFormField('status', e.target.value)}>
                                    <option value="active">active</option>
                                    <option value="inactive">inactive</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
                            {saving ? 'Сохранение...' : 'Сохранить'}
                        </button>
                    </form>
                </Modal>
            )}

            {tab === 'services' && (
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={editing ? 'Редактировать' : 'Новая услуга'}
                    contentClassName="modal-content--elva"
                    disableClose={saving}
                >
                    {error && <div className="alert alert-error">{error}</div>}
                    <form onSubmit={submitService}>
                        <div className="form-group">
                            <label>Название</label>
                            <input value={form.name || ''} onChange={(e) => updateFormField('name', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Описание</label>
                            <textarea value={form.description || ''} onChange={(e) => updateFormField('description', e.target.value)} rows={3} />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Цена (₽)</label>
                                <input type="number" step="0.01" value={form.price || ''} onChange={(e) => updateFormField('price', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Категория</label>
                                <select value={form.category_id || ''} onChange={(e) => updateFormField('category_id', e.target.value)}>
                                    <option value="">Без категории</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Статус</label>
                                <select value={form.status || 'active'} onChange={(e) => updateFormField('status', e.target.value)}>
                                    <option value="active">active</option>
                                    <option value="inactive">inactive</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
                            {saving ? 'Сохранение...' : 'Сохранить'}
                        </button>
                    </form>
                </Modal>
            )}

            {tab === 'categories' && (
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={editing ? 'Редактировать категорию' : 'Новая категория'}
                    contentClassName="modal-content--elva"
                    disableClose={saving}
                >
                    {error && <div className="alert alert-error">{error}</div>}
                    <form onSubmit={submitCategory}>
                        <div className="form-group">
                            <label>Название</label>
                            <input value={form.name || ''} onChange={(e) => updateFormField('name', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Описание</label>
                            <textarea value={form.description || ''} onChange={(e) => updateFormField('description', e.target.value)} rows={3} />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
                            {saving ? 'Сохранение...' : 'Сохранить'}
                        </button>
                    </form>
                </Modal>
            )}

            <LeadEditModal
                lead={editingLead}
                notes={leadNotes}
                form={editForm}
                error={editError}
                onClose={closeLeadEdit}
                onSubmit={submitLead}
                onNoteChange={(value) => setEditForm((current) => ({ ...current, note: value }))}
                onAddNote={addLeadNote}
                isSaving={savingLead}
                isSavingNote={savingNote}
                title="Редактировать заявку"
                submitLabel="Сохранить статус"
            >
                <div className="form-group">
                    <label>Имя</label>
                    <input value={editForm.name || ''} onChange={(e) => setEditForm((current) => ({ ...current, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={editForm.email || ''} onChange={(e) => setEditForm((current) => ({ ...current, email: e.target.value }))} />
                </div>
                <div className="form-group">
                    <label>Телефон</label>
                    <input value={editForm.phone || ''} onChange={(e) => setEditForm((current) => ({ ...current, phone: e.target.value }))} required />
                </div>
                <div className="form-group">
                    <label>Услуга</label>
                    <select value={editForm.service_id || ''} onChange={(e) => setEditForm((current) => ({ ...current, service_id: e.target.value }))}>
                        <option value="">—</option>
                        {services.map((service) => (
                            <option key={service.id} value={service.id}>{service.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Статус</label>
                    <select value={editForm.status || 'new'} onChange={(e) => setEditForm((current) => ({ ...current, status: e.target.value }))}>
                        {Object.entries(LEAD_STATUS_LABELS).map(([status, label]) => (
                            <option key={status} value={status}>{label}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Сообщение</label>
                    <textarea value={editForm.message || ''} readOnly rows={2} />
                </div>
            </LeadEditModal>

            <Modal
                isOpen={!!confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false })}
                title={confirmModal.title || 'Подтверждение'}
                contentClassName="modal-content--elva"
                disableClose={confirmLoading}
            >
                <p style={{ marginTop: 0 }}>{confirmModal.body || 'Вы уверены?'}</p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button className="btn btn-outline" type="button" onClick={() => setConfirmModal({ isOpen: false })}>
                        Отмена
                    </button>
                    <button
                        className={`btn ${confirmModal.danger ? 'btn-danger' : 'btn-primary'}`}
                        type="button"
                        disabled={confirmLoading}
                        onClick={async () => {
                            try {
                                await confirmModal.onConfirm?.();
                            } catch (err) {
                                notify.fromError(err, 'Ошибка');
                            }
                        }}
                    >
                        {confirmLoading ? 'Удаление...' : (confirmModal.confirmText || 'Ок')}
                    </button>
                </div>
            </Modal>

            <LeadContactModal
                lead={leadContactModal.lead}
                isOpen={leadContactModal.isOpen}
                onClose={closeLeadContact}
                onPostpone={() => actLead('postpone')}
                onReject={() => actLead('reject')}
                onDone={() => actLead('done')}
                isActing={acting}
            />
        </div>
    );
}
