import React, { useState, useEffect } from 'react';
import { usersApi, servicesApi, leadsApi, categoriesApi, reviewsApi } from '../api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const TABS = [
    { key: 'users', label: '👥 Пользователи' },
    { key: 'services', label: '🌍 Услуги' },
    { key: 'categories', label: '📁 Категории' },
    { key: 'leads', label: '📋 Заявки' },
    { key: 'reviews', label: '⭐ Отзывы' },
];

export default function AdminDashboard() {
    const [tab, setTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [services, setServices] = useState([]);
    const [leads, setLeads] = useState([]);
    const [categories, setCategories] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [leadNotes, setLeadNotes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({});
    const [error, setError] = useState('');

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        try {
            const [u, s, l, c, r] = await Promise.all([
                usersApi.getAll(),
                servicesApi.getAll(),
                leadsApi.getAll(),
                categoriesApi.getAll(),
                reviewsApi.getAll(),
            ]);
            setUsers(u.data);
            setServices(s.data);
            setLeads(l.data);
            setCategories(c.data);
            setReviews(r.data);
        } catch (err) {
            alert('Ошибка загрузки данных: ' + (err.response?.data?.message || err.message));
        }
    };

    const update = (key, val) => setForm({ ...form, [key]: val });

    // ─── Users ──────────────────────────────────────
    const userColumns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Имя' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Телефон' },
        {
            key: 'role',
            label: 'Роль',
            render: (val) => <span className={`badge badge-${val === 'admin' ? 'warning' : 'primary'}`}>{val}</span>,
        },
        {
            key: 'status',
            label: 'Статус',
            render: (val) => <span className={`badge badge-${val === 'active' ? 'success' : 'muted'}`}>{val}</span>,
        },
    ];

    const openUserCreate = () => {
        setEditing(null);
        setForm({ name: '', email: '', phone: '', password: '', role: 'user', status: 'active' });
        setError('');
        setShowModal(true);
    };

    const openUserEdit = (u) => {
        setEditing(u);
        setForm({ name: u.name, email: u.email, phone: u.phone || '', password: '', role: u.role, status: u.status });
        setError('');
        setShowModal(true);
    };

    const submitUser = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = { ...form };
            if (!data.password) delete data.password;
            if (editing) {
                await usersApi.update(editing.id, data);
            } else {
                await usersApi.create(data);
            }
            setShowModal(false);
            loadAll();
        } catch (err) {
            handleError(err);
        }
    };

    const deleteUser = async (u) => {
        if (!confirm(`Удалить пользователя ${u.name}?`)) return;
        await usersApi.delete(u.id);
        loadAll();
    };

    // ─── Services ───────────────────────────────────
    const serviceColumns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Название' },
        { key: 'category', label: 'Категория', render: (v) => v?.name || '—' },
        { key: 'description', label: 'Описание', render: (v) => v ? (v.length > 50 ? v.slice(0, 50) + '…' : v) : '—' },
        { key: 'price', label: 'Цена', render: (v) => v ? `${Number(v).toLocaleString('ru-RU')} ₽` : '—' },
        {
            key: 'status',
            label: 'Статус',
            render: (val) => <span className={`badge badge-${val === 'active' ? 'success' : 'muted'}`}>{val}</span>,
        },
    ];

    const openServiceCreate = () => {
        setEditing(null);
        setForm({ name: '', description: '', price: '', image: '', status: 'active', category_id: '' });
        setError('');
        setShowModal(true);
    };

    const openServiceEdit = (s) => {
        setEditing(s);
        setForm({ name: s.name, description: s.description || '', price: s.price || '', image: s.image || '', status: s.status, category_id: s.category_id || '' });
        setError('');
        setShowModal(true);
    };

    const submitService = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editing) {
                await servicesApi.update(editing.id, form);
            } else {
                await servicesApi.create(form);
            }
            setShowModal(false);
            loadAll();
        } catch (err) {
            handleError(err);
        }
    };

    const deleteService = async (s) => {
        if (!confirm(`Удалить услугу "${s.name}"?`)) return;
        await servicesApi.delete(s.id);
        loadAll();
    };

    // ─── Categories ─────────────────────────────────
    const categoryColumns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Название' },
        { key: 'description', label: 'Описание' },
    ];

    const openCategoryCreate = () => {
        setEditing(null);
        setForm({ name: '', description: '' });
        setError('');
        setShowModal(true);
    };

    const openCategoryEdit = (c) => {
        setEditing(c);
        setForm({ name: c.name, description: c.description || '' });
        setError('');
        setShowModal(true);
    };

    const submitCategory = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editing) {
                await categoriesApi.update(editing.id, form);
            } else {
                await categoriesApi.create(form);
            }
            setShowModal(false);
            loadAll();
        } catch (err) {
            handleError(err);
        }
    };

    const deleteCategory = async (c) => {
        if (!confirm(`Удалить категорию "${c.name}"? Это может отвязать услуги.`)) return;
        await categoriesApi.delete(c.id);
        loadAll();
    };

    // ─── Reviews ────────────────────────────────────
    const reviewColumns = [
        { key: 'id', label: 'ID' },
        { key: 'service', label: 'Услуга', render: (v) => v?.name },
        { key: 'user', label: 'Автор', render: (v) => v?.name },
        { key: 'rating', label: 'Оценка', render: (v) => '⭐'.repeat(v) },
        { key: 'comment', label: 'Комментарий' },
    ];

    const deleteReview = async (r) => {
        if (!confirm('Удалить отзыв?')) return;
        await reviewsApi.delete(r.id);
        loadAll();
    };

    // ─── Leads ──────────────────────────────────────
    const leadColumns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Имя' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Телефон' },
        {
            key: 'service',
            label: 'Услуга',
            render: (val) => val?.name || '—',
        },
        {
            key: 'user',
            label: 'Пользователь',
            render: (val) => val?.name || 'Гость',
        },
        {
            key: 'status',
            label: 'Статус',
            render: (val) => (
                <span className={`badge badge-${val === 'done' ? 'success' : val === 'cancelled' ? 'danger' : val === 'in_progress' ? 'warning' : 'primary'}`}>
                    {val}
                </span>
            ),
        },
        { key: 'created_at', label: 'Дата', render: (v) => new Date(v).toLocaleDateString('ru-RU') },
    ];

    const openLeadEdit = async (l) => {
        setEditing(l);
        setForm({
            name: l.name,
            email: l.email || '',
            phone: l.phone,
            message: l.message || '',
            service_id: l.service_id || '',
            status: l.status,
            note: '',
        });
        setError('');
        setShowModal(true);
        // Load notes
        try {
            const res = await leadsApi.getNotes(l.id);
            setLeadNotes(res.data);
        } catch (err) {
            console.error('Ошибка загрузки заметок:', err);
            setLeadNotes([]);
        }
    };

    const addLeadNote = async () => {
        if (!form.note) return;
        try {
            await leadsApi.addNote(editing.id, { note: form.note });
            setForm({ ...form, note: '' });
            const res = await leadsApi.getNotes(editing.id);
            setLeadNotes(res.data);
        } catch (err) { handleError(err); }
    };

    const submitLead = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await leadsApi.update(editing.id, form);
            setShowModal(false);
            loadAll();
        } catch (err) {
            handleError(err);
        }
    };

    const deleteLead = async (l) => {
        if (!confirm('Удалить заявку?')) return;
        await leadsApi.delete(l.id);
        loadAll();
    };

    // ─── Error helper ───────────────────────────────
    const handleError = (err) => {
        const msg = err.response?.data?.errors;
        if (typeof msg === 'object') {
            setError(Object.values(msg).flat().join('. '));
        } else {
            setError(err.response?.data?.message || 'Ошибка');
        }
    };

    // ─── Render ─────────────────────────────────────
    return (
        <div className="dashboard">
            <div className="dashboard-header animate-in">
                <div>
                    <h1>Панель администратора</h1>
                    <p className="text-muted">Управление пользователями, услугами и заявками</p>
                </div>
            </div>

            <div className="stats-grid animate-in" style={{ animationDelay: '0.1s' }}>
                <div className="stats-card">
                    <div className="stats-card-icon">👥</div>
                    <div className="stats-card-info">
                        <span className="stats-value">{users.length}</span>
                        <span className="stats-label">Пользователей</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon">🌍</div>
                    <div className="stats-card-info">
                        <span className="stats-value">{services.length}</span>
                        <span className="stats-label">Услуг</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon">📋</div>
                    <div className="stats-card-info">
                        <span className="stats-value">{leads.length}</span>
                        <span className="stats-label">Заявок</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        className={`tab ${tab === t.key ? 'tab-active' : ''}`}
                        onClick={() => setTab(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Users Tab */}
            {tab === 'users' && (
                <section className="dashboard-section">
                    <div className="section-header">
                        <h2>Пользователи ({users.length})</h2>
                        <button className="btn btn-primary" onClick={openUserCreate}>+ Добавить</button>
                    </div>
                    <DataTable columns={userColumns} data={users} onEdit={openUserEdit} onDelete={deleteUser} />
                </section>
            )}

            {/* Services Tab */}
            {tab === 'services' && (
                <section className="dashboard-section">
                    <div className="section-header">
                        <h2>Услуги ({services.length})</h2>
                        <button className="btn btn-primary" onClick={openServiceCreate}>+ Добавить</button>
                    </div>
                    <DataTable columns={serviceColumns} data={services} onEdit={openServiceEdit} onDelete={deleteService} />
                </section>
            )}

            {/* Categories Tab */}
            {tab === 'categories' && (
                <section className="dashboard-section">
                    <div className="section-header">
                        <h2>Категории ({categories.length})</h2>
                        <button className="btn btn-primary" onClick={openCategoryCreate}>+ Добавить</button>
                    </div>
                    <DataTable columns={categoryColumns} data={categories} onEdit={openCategoryEdit} onDelete={deleteCategory} />
                </section>
            )}

            {/* Reviews Tab */}
            {tab === 'reviews' && (
                <section className="dashboard-section">
                    <div className="section-header">
                        <h2>Отзывы ({reviews.length})</h2>
                    </div>
                    <DataTable columns={reviewColumns} data={reviews} onDelete={deleteReview} />
                </section>
            )}

            {/* Leads Tab */}
            {tab === 'leads' && (
                <section className="dashboard-section">
                    <div className="section-header">
                        <h2>Заявки ({leads.length})</h2>
                    </div>
                    <DataTable columns={leadColumns} data={leads} onEdit={openLeadEdit} onDelete={deleteLead} />
                </section>
            )}

            {/* ─── Modals ─── */}

            {/* User Modal */}
            {tab === 'users' && (
                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Редактировать' : 'Новый пользователь'}>
                    {error && <div className="alert alert-error">{error}</div>}
                    <form onSubmit={submitUser}>
                        <div className="form-group">
                            <label>Имя</label>
                            <input value={form.name || ''} onChange={(e) => update('name', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={form.email || ''} onChange={(e) => update('email', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Телефон</label>
                            <input value={form.phone || ''} onChange={(e) => update('phone', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>{editing ? 'Новый пароль (оставьте пустым)' : 'Пароль'}</label>
                            <input type="password" value={form.password || ''} onChange={(e) => update('password', e.target.value)} {...(!editing ? { required: true } : {})} />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Роль</label>
                                <select value={form.role || 'user'} onChange={(e) => update('role', e.target.value)}>
                                    <option value="user">user</option>
                                    <option value="admin">admin</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Статус</label>
                                <select value={form.status || 'active'} onChange={(e) => update('status', e.target.value)}>
                                    <option value="active">active</option>
                                    <option value="inactive">inactive</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block">Сохранить</button>
                    </form>
                </Modal>
            )}

            {/* Service Modal */}
            {tab === 'services' && (
                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Редактировать' : 'Новая услуга'}>
                    {error && <div className="alert alert-error">{error}</div>}
                    <form onSubmit={submitService}>
                        <div className="form-group">
                            <label>Название</label>
                            <input value={form.name || ''} onChange={(e) => update('name', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Описание</label>
                            <textarea value={form.description || ''} onChange={(e) => update('description', e.target.value)} rows={3} />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Цена (₽)</label>
                                <input type="number" step="0.01" value={form.price || ''} onChange={(e) => update('price', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Категория</label>
                                <select value={form.category_id || ''} onChange={(e) => update('category_id', e.target.value)}>
                                    <option value="">Без категории</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Статус</label>
                                <select value={form.status || 'active'} onChange={(e) => update('status', e.target.value)}>
                                    <option value="active">active</option>
                                    <option value="inactive">inactive</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block">Сохранить</button>
                    </form>
                </Modal>
            )}

            {/* Lead Modal */}
            {tab === 'leads' && (
                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Редактировать заявку">
                    {error && <div className="alert alert-error">{error}</div>}
                    <form onSubmit={submitLead}>
                        <div className="form-group">
                            <label>Имя</label>
                            <input value={form.name || ''} onChange={(e) => update('name', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={form.email || ''} onChange={(e) => update('email', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Телефон</label>
                            <input value={form.phone || ''} onChange={(e) => update('phone', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Услуга</label>
                            <select value={form.service_id || ''} onChange={(e) => update('service_id', e.target.value)}>
                                <option value="">—</option>
                                {services.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Статус</label>
                            <select value={form.status || 'new'} onChange={(e) => update('status', e.target.value)}>
                                <option value="new">new</option>
                                <option value="in_progress">in_progress</option>
                                <option value="done">done</option>
                                <option value="cancelled">cancelled</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Сообщение</label>
                            <textarea value={form.message || ''} readOnly rows={2} />
                        </div>

                        {/* Notes Section */}
                        <div className="notes-section" style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                            <h4>Внутренние заметки</h4>
                            <div className="notes-list" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
                                {leadNotes.length === 0 && <p className="text-muted small">Заметок пока нет</p>}
                                {leadNotes.map(n => (
                                    <div key={n.id} className="note-item" style={{ fontSize: '0.9rem', marginBottom: '0.5rem', padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{n.user?.name} <small style={{ fontWeight: 'normal' }}>{new Date(n.created_at).toLocaleString()}</small></div>
                                        <div>{n.note}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="form-group">
                                <textarea 
                                    value={form.note || ''} 
                                    onChange={(e) => update('note', e.target.value)} 
                                    placeholder="Новая заметка..." 
                                    rows={2}
                                />
                                <button type="button" className="btn btn-outline btn-sm" onClick={addLeadNote} style={{ marginTop: '0.5rem' }}>
                                    Добавить заметку
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1.5rem' }}>Сохранить статус</button>
                    </form>
                </Modal>
            )}

            {/* Category Modal */}
            {tab === 'categories' && (
                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Редактировать категорию' : 'Новая категория'}>
                    {error && <div className="alert alert-error">{error}</div>}
                    <form onSubmit={submitCategory}>
                        <div className="form-group">
                            <label>Название</label>
                            <input value={form.name || ''} onChange={(e) => update('name', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Описание</label>
                            <textarea value={form.description || ''} onChange={(e) => update('description', e.target.value)} rows={3} />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block">Сохранить</button>
                    </form>
                </Modal>
            )}
        </div>
    );
}
