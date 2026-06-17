import React from 'react';
import { LEAD_STATUS_COLORS, LEAD_STATUS_LABELS, LEAD_STATUSES } from '../../constants/leadStatus';

export default function LeadBoard({
    leads,
    onStatusChange,
    onOpenContact,
    onOpenEdit,
    onConfirm,
    onDelete,
    onAssignManager,
    managers = [],
    showManagerInfo = false,
    editButtonLabel = '✏️',
    updatingStatusLeadId = null,
    claimingLeadId = null,
    confirmingLeadId = null,
    assigningLeadId = null,
}) {
    return (
        <div className="leads-list">
            {leads.map((lead) => (
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
                            {showManagerInfo && (
                                <div className="lead-info-item">
                                    <span className="lead-info-label">Менеджер</span>
                                    <span className="lead-info-value">{lead.assigned_to?.name || 'Не назначен'}</span>
                                </div>
                            )}
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
                            onChange={(e) => onStatusChange(lead, e.target.value)}
                            disabled={updatingStatusLeadId === lead.id}
                        >
                            {LEAD_STATUSES.map((status) => (
                                <option key={status} value={status}>{LEAD_STATUS_LABELS[status]}</option>
                            ))}
                        </select>
                        {onAssignManager && (
                            <select
                                className="lead-status-select"
                                value={lead.assigned_to_user_id || ''}
                                onChange={(e) => onAssignManager(lead, e.target.value)}
                                disabled={assigningLeadId === lead.id}
                            >
                                <option value="">Не назначен</option>
                                {managers.map((manager) => (
                                    <option key={manager.id} value={manager.id}>{manager.name}</option>
                                ))}
                            </select>
                        )}
                        <div className="lead-action-buttons">
                            {(lead.status === 'new' || (lead.status === 'in_progress' && !lead.phone)) && (
                                <button className="btn btn-sm btn-primary" type="button" onClick={() => onOpenContact(lead)} disabled={claimingLeadId === lead.id}>
                                    {claimingLeadId === lead.id ? 'Захват...' : 'Работать с заявкой'}
                                </button>
                            )}
                            {lead.status === 'in_progress' && lead.phone && onConfirm && (
                                <button className="btn btn-sm btn-primary" type="button" onClick={() => onConfirm(lead)} disabled={confirmingLeadId === lead.id}>
                                    {confirmingLeadId === lead.id ? 'Подтверждение...' : 'Подтвердить'}
                                </button>
                            )}
                            <button className="btn btn-sm btn-outline" type="button" onClick={() => onOpenEdit(lead)}>
                                {editButtonLabel}
                            </button>
                            {onDelete && (
                                <button className="btn btn-sm btn-danger" type="button" onClick={() => onDelete(lead)}>
                                    🗑️
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
