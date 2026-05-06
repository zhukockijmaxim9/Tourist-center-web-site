import React, { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { leadsApi } from '../api';
import Modal from '../components/Modal';
import { useNotify, getErrorMessage } from '../context/NotifyContext';

const LEAD_STATUS_LABELS = {
    new: 'Новая',
    in_progress: 'В работе',
    confirmed: 'Подтверждена',
    done: 'Выполнено',
    cancelled: 'Отменено',
};

const LEAD_STATUSES = ['new', 'in_progress', 'confirmed', 'done', 'cancelled'];

const LEAD_STATUS_COLORS = {
    new: 'primary',
    in_progress: 'warning',
    confirmed: 'purple',
    done: 'success',
    cancelled: 'danger',
};

export default function ManagerDashboard() {
    const notify = useNotify();
    const [leads, setLeads] = useState([]);
    const [leadNotes, setLeadNotes] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ status: 'new', note: '' });
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [leadStatusFilter, setLeadStatusFilter] = useState('all');
    const [leadContactModal, setLeadContactModal] = useState({ isOpen: false, lead: null });

    useEffect(() => {
        loadLeads();
    }, []);

    const loadLeads = async () => {
        try {
            const res = await leadsApi.getAll();
            setLeads(res.data);
        } catch (err) {
            notify.fromError(err, 'Не удалось загрузить заявки');
        }
    };

    const updateLeadStatus = async (lead, status) => {
        if (lead.status === status) return;

        try {
            const res = await leadsApi.update(lead.id, { status });
            const updatedLead = res.data;
            setLeads((current) => current.map((item) => (item.id === lead.id ? { ...item, ...updatedLead } : item)));

            if (editing?.id === lead.id) {
                setEditing((current) => (current ? { ...current, ...updatedLead } : current));
                setForm((current) => ({ ...current, status: updatedLead.status }));
            }
        } catch (err) {
            notify.fromError(err, 'Не удалось обновить статус заявки');
        }
    };

    const openLeadEdit = async (lead) => {
        setEditing(lead);
        setForm({ status: lead.status || 'new', note: '' });
        setError('');

        try {
            const res = await leadsApi.getNotes(lead.id);
            setLeadNotes(res.data);
        } catch (err) {
            notify.fromError(err, 'Не удалось загрузить заметки');
            setLeadNotes([]);
        }
    };

    const submitLead = async (e) => {
        e.preventDefault();
        if (!editing) return;

        try {
            const res = await leadsApi.update(editing.id, { status: form.status });
            const updatedLead = res.data;
            setLeads((current) => current.map((item) => (item.id === editing.id ? { ...item, ...updatedLead } : item)));
            setEditing(null);
        } catch (err) {
            setError(getErrorMessage(err, 'Не удалось сохранить заявку'));
        }
    };

    const addLeadNote = async () => {
        if (!editing || !form.note.trim()) return;

        try {
            await leadsApi.addNote(editing.id, { note: form.note.trim() });
            setForm((current) => ({ ...current, note: '' }));
            const res = await leadsApi.getNotes(editing.id);
            setLeadNotes(res.data);
        } catch (err) {
            setError(getErrorMessage(err, 'Не удалось добавить заметку'));
        }
    };

    const openLeadContact = async (lead) => {
        try {
            const res = await leadsApi.claim(lead.id);
            const claimed = res.data;
            setLeads((current) => current.map((item) => (item.id === claimed.id ? { ...item, ...claimed } : item)));
            setLeadContactModal({ isOpen: true, lead: claimed });
        } catch (err) {
            notify.fromError(err, 'Не удалось взять заявку в работу');
        }
    };

    const closeLeadContact = () => setLeadContactModal({ isOpen: false, lead: null });

    const actLead = async (action) => {
        const lead = leadContactModal.lead;
        if (!lead) return;

        try {
            if (action === 'postpone') {
                await leadsApi.release(lead.id);
                notify.info('Заявка отложена');
            }

            if (action === 'reject') {
                const res = await leadsApi.update(lead.id, { status: 'cancelled' });
                await leadsApi.release(lead.id);
                setLeads((current) => current.map((item) => (item.id === lead.id ? { ...item, ...res.data } : item)));
                notify.success('Заявка отклонена');
            }

            if (action === 'done') {
                const res = await leadsApi.update(lead.id, { status: 'done' });
                await leadsApi.release(lead.id);
                setLeads((current) => current.map((item) => (item.id === lead.id ? { ...item, ...res.data } : item)));
                notify.success('Заявка отмечена как выполненная');
            }

            closeLeadContact();
            loadLeads();
        } catch (err) {
            notify.fromError(err, 'Не удалось обновить заявку');
        }
    };

    const confirmLead = async (lead) => {
        try {
            const res = await leadsApi.confirm(lead.id);
            const updatedLead = res.data;
            setLeads((current) => current.map((item) => (item.id === lead.id ? { ...item, ...updatedLead } : item)));
        } catch (err) {
            notify.fromError(err, 'Не удалось подтвердить заявку');
        }
    };

    const leadCountByStatus = (status) => leads.filter((lead) => lead.status === status).length;
    const normalizedQuery = query.trim().toLowerCase();

    const filteredByStatus = leadStatusFilter === 'all'
        ? leads
        : leads.filter((lead) => lead.status === leadStatusFilter);

    const leadsFiltered = filteredByStatus.filter((lead) => {
        if (!normalizedQuery) return true;
        const phone = lead.phone || lead.user?.phone || '';
        return `${lead.name || ''} ${lead.email || ''} ${phone} ${lead.service?.name || ''}`.toLowerCase().includes(normalizedQuery);
    });

    return (
        <div className="dashboard dashboard--admin">
            <div className="dashboard-header animate-in">
                <div>
                    <h1>Панель менеджера</h1>
                    <p className="text-muted">
                        Ваши назначенные заявки.{' '}
                        <Link href="/account" className="dashboard-inline-link">
                            Личный кабинет
                        </Link>
                    </p>
                </div>
            </div>

            <div className="stats-grid animate-in" style={{ animationDelay: '0.1s' }}>
                <div className="stats-card">
                    <div className="stats-card-icon">📋</div>
                    <div className="stats-card-info">
                        <span className="stats-value">{leads.length}</span>
                        <span className="stats-label">Назначено</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon">⏳</div>
                    <div className="stats-card-info">
                        <span className="stats-value">{leadCountByStatus('in_progress')}</span>
                        <span className="stats-label">В работе</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon">✅</div>
                    <div className="stats-card-info">
                        <span className="stats-value">{leadCountByStatus('done')}</span>
                        <span className="stats-label">Выполнено</span>
                    </div>
                </div>
            </div>

            <section className="dashboard-section">
                <div className="section-header">
                    <div>
                        <h2>Мои заявки ({leadsFiltered.length})</h2>
                        <input
                            className="input input-sm"
                            placeholder="Поиск: имя, email, телефон, услуга..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{ marginTop: '0.8rem', maxWidth: 520 }}
                        />
                    </div>
                </div>

                <div className="lead-filters">
                    <button
                        className={`lead-filter-btn ${leadStatusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setLeadStatusFilter('all')}
                        type="button"
                    >
                        Все <span className="lead-filter-count">{leads.length}</span>
                    </button>
                    {LEAD_STATUSES.map((status) => (
                        <button
                            key={status}
                            className={`lead-filter-btn lead-filter-${LEAD_STATUS_COLORS[status]} ${leadStatusFilter === status ? 'active' : ''}`}
                            onClick={() => setLeadStatusFilter(status)}
                            type="button"
                        >
                            {LEAD_STATUS_LABELS[status]} <span className="lead-filter-count">{leadCountByStatus(status)}</span>
                        </button>
                    ))}
                </div>

                {leadsFiltered.length === 0 ? (
                    <div className="empty-state">Назначенных заявок пока нет</div>
                ) : (
                    <div className="leads-list">
                        {leadsFiltered.map((lead) => (
                            <div key={lead.id} className="lead-row">
                                <div className="lead-row-main">
                                    <div className="lead-contact">
                                        <span className="lead-contact-name">{lead.name}</span>
                                        <span className="lead-contact-detail">{lead.email}</span>
                                        <span className="lead-contact-detail">{lead.phone || lead.user?.phone || 'Телефон скрыт'}</span>
                                    </div>
                                    <div className="lead-info">
                                        <div className="lead-info-item">
                                            <span className="lead-info-label">Услуга</span>
                                            <span className="lead-info-value">{lead.service?.name || '—'}</span>
                                        </div>
                                        <div className="lead-info-item">
                                            <span className="lead-info-label">Клиент</span>
                                            <span className="lead-info-value">{lead.user?.name || 'Гость'}</span>
                                        </div>
                                        <div className="lead-info-item">
                                            <span className="lead-info-label">Дата</span>
                                            <span className="lead-info-value">{new Date(lead.created_at).toLocaleDateString('ru-RU')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="lead-row-actions">
                                    <select
                                        className={`lead-status-select lead-status-${LEAD_STATUS_COLORS[lead.status]}`}
                                        value={lead.status}
                                        onChange={(e) => updateLeadStatus(lead, e.target.value)}
                                    >
                                        {LEAD_STATUSES.map((status) => (
                                            <option key={status} value={status}>{LEAD_STATUS_LABELS[status]}</option>
                                        ))}
                                    </select>
                                    <div className="lead-action-buttons">
                                        {(lead.status === 'new' || (lead.status === 'in_progress' && !lead.phone)) && (
                                            <button className="btn btn-sm btn-primary" type="button" onClick={() => openLeadContact(lead)}>
                                                Работать с заявкой
                                            </button>
                                        )}
                                        {lead.status === 'in_progress' && lead.phone && (
                                            <button className="btn btn-sm btn-primary" type="button" onClick={() => confirmLead(lead)}>
                                                Подтвердить
                                            </button>
                                        )}
                                        <button className="btn btn-sm btn-outline" type="button" onClick={() => openLeadEdit(lead)}>
                                            Заметки
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <Modal
                isOpen={!!editing}
                onClose={() => setEditing(null)}
                title="Заявка и заметки"
                contentClassName="modal-content--elva"
            >
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={submitLead}>
                    <div className="form-group">
                        <label>Статус</label>
                        <select value={form.status || 'new'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                            {LEAD_STATUSES.map((status) => (
                                <option key={status} value={status}>{LEAD_STATUS_LABELS[status]}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Сообщение клиента</label>
                        <textarea value={editing?.message || ''} readOnly rows={2} />
                    </div>

                    <div className="notes-section" style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                        <h4>Внутренние заметки</h4>
                        <div className="notes-list" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
                            {leadNotes.length === 0 && <p className="text-muted small">Заметок пока нет</p>}
                            {leadNotes.map((note) => (
                                <div key={note.id} className="note-item" style={{ fontSize: '0.9rem', marginBottom: '0.5rem', padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px' }}>
                                    <div style={{ fontWeight: 'bold' }}>
                                        {note.user?.name} <small style={{ fontWeight: 'normal' }}>{new Date(note.created_at).toLocaleString('ru-RU')}</small>
                                    </div>
                                    <div>{note.note}</div>
                                </div>
                            ))}
                        </div>
                        <div className="form-group">
                            <textarea
                                value={form.note || ''}
                                onChange={(e) => setForm({ ...form, note: e.target.value })}
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

            <Modal
                isOpen={!!leadContactModal.isOpen}
                onClose={closeLeadContact}
                title="Связаться по телефону"
                contentClassName="modal-content--elva"
            >
                <div style={{ display: 'grid', gap: '1.2rem' }}>
                    <div className="alert" style={{ margin: 0 }}>
                        <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>
                            {leadContactModal.lead?.name || 'Клиент'}
                        </div>
                        <div style={{ fontSize: '1.7rem', letterSpacing: '0.02em' }}>
                            {leadContactModal.lead?.phone || leadContactModal.lead?.user?.phone || 'Телефон недоступен'}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button type="button" className="btn btn-outline" onClick={() => actLead('postpone')}>
                            Отложить
                        </button>
                        <button type="button" className="btn btn-danger" onClick={() => actLead('reject')}>
                            Отклонить
                        </button>
                        <button type="button" className="btn btn-primary" onClick={() => actLead('done')}>
                            Выполнено
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
