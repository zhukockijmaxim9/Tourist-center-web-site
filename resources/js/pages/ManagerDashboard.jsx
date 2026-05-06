import React, { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { LEAD_STATUS_LABELS } from '../constants/leadStatus';
import LeadBoard from '../features/leads/LeadBoard';
import LeadContactModal from '../features/leads/LeadContactModal';
import LeadEditModal from '../features/leads/LeadEditModal';
import LeadStatusFilters from '../features/leads/LeadStatusFilters';
import useLeadWorkflow from '../features/leads/useLeadWorkflow';

export default function ManagerDashboard() {
    const [query, setQuery] = useState('');
    const [leadStatusFilter, setLeadStatusFilter] = useState('all');
    const {
        leads,
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
    } = useLeadWorkflow({
        createEditForm: (lead) => ({
            status: lead.status || 'new',
            message: lead.message || '',
            note: '',
        }),
    });

    useEffect(() => {
        reloadLeads();
    }, []);

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

    const submitLead = async (e) => {
        e.preventDefault();
        await saveEditedLead((form) => ({ status: form.status }));
    };

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

                <LeadStatusFilters
                    currentFilter={leadStatusFilter}
                    onChange={setLeadStatusFilter}
                    getCount={leadCountByStatus}
                    totalCount={leads.length}
                />

                {leadsFiltered.length === 0 ? (
                    <div className="empty-state">Назначенных заявок пока нет</div>
                ) : (
                    <LeadBoard
                        leads={leadsFiltered}
                        onStatusChange={updateLeadStatus}
                        onOpenContact={openLeadContact}
                        onOpenEdit={openLeadEdit}
                        onConfirm={confirmLead}
                        editButtonLabel="Заметки"
                    />
                )}
            </section>

            <LeadEditModal
                lead={editingLead}
                notes={leadNotes}
                form={editForm}
                error={editError}
                onClose={closeLeadEdit}
                onSubmit={submitLead}
                onNoteChange={(value) => setEditForm((current) => ({ ...current, note: value }))}
                onAddNote={addLeadNote}
                title="Заявка и заметки"
                submitLabel="Сохранить статус"
            >
                <div className="form-group">
                    <label>Статус</label>
                    <select
                        value={editForm.status || 'new'}
                        onChange={(e) => setEditForm((current) => ({ ...current, status: e.target.value }))}
                    >
                        {Object.entries(LEAD_STATUS_LABELS).map(([status, label]) => (
                            <option key={status} value={status}>{label}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Сообщение клиента</label>
                    <textarea value={editForm.message || ''} readOnly rows={2} />
                </div>
            </LeadEditModal>

            <LeadContactModal
                lead={leadContactModal.lead}
                isOpen={leadContactModal.isOpen}
                onClose={closeLeadContact}
                onPostpone={() => actLead('postpone')}
                onReject={() => actLead('reject')}
                onDone={() => actLead('done')}
            />
        </div>
    );
}
