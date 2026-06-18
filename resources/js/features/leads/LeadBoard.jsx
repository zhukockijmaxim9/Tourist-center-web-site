import React, { useState } from 'react';
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
    onOpenDetails,
}) {
    const [hoveredId, setHoveredId] = useState(null);

    return (
        <div className="leads-table-shell">
            <div className="leads-table-header">
                <div className="leads-table-col leads-col-name">Имя</div>
                <div className="leads-table-col leads-col-phone">Телефон</div>
                <div className="leads-table-col leads-col-service">Услуга</div>
                {showManagerInfo && (
                    <div className="leads-table-col leads-col-manager">Менеджер</div>
                )}
                <div className="leads-table-col leads-col-status">Статус</div>
                <div className="leads-table-col leads-col-date">Дата</div>
                <div className="leads-table-col leads-col-actions">Действия</div>
            </div>
            <div className="leads-table-body">
                {leads.map((lead) => (
                    <div
                        key={lead.id}
                        className={`leads-table-row ${hoveredId === lead.id ? 'hovered' : ''}`}
                        onMouseEnter={() => setHoveredId(lead.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => onOpenDetails?.(lead)}
                        style={{ cursor: onOpenDetails ? 'pointer' : 'default' }}
                    >
                        <div className="leads-table-col leads-col-name" title={lead.name}>
                            <span className="leads-table-cell-text">{lead.name}</span>
                        </div>
                        <div className="leads-table-col leads-col-phone" title={lead.phone || lead.user?.phone || ''}>
                            <span className="leads-table-cell-text">
                                {lead.phone || lead.user?.phone || '—'}
                            </span>
                        </div>
                        <div className="leads-table-col leads-col-service" title={lead.service?.name || ''}>
                            <span className="leads-table-cell-text">{lead.service?.name || '—'}</span>
                        </div>
                        <div className="leads-table-col leads-col-manager" title={lead.assigned_to?.name || ''} onClick={(e) => e.stopPropagation()}>
                            {onAssignManager && (
                                <select
                                    className="lead-status-select"
                                    value={lead.assigned_to_user_id || ''}
                                    onChange={(e) => onAssignManager(lead, e.target.value)}
                                    disabled={assigningLeadId === lead.id}
                                    style={{ marginTop: '0.4rem' }}
                                >
                                    <option value="">Не назначен</option>
                                    {managers.map((manager) => (
                                        <option key={manager.id} value={manager.id}>{manager.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div className="leads-table-col leads-col-status" onClick={(e) => e.stopPropagation()}>
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
                        </div>
                        <div className="leads-table-col leads-col-date">
                            <span className="leads-table-cell-text">
                                {new Date(lead.created_at).toLocaleDateString('ru-RU')}
                            </span>
                        </div>
                        <div className="leads-table-col leads-col-actions" onClick={(e) => e.stopPropagation()}>
                            <div className="lead-action-buttons">
                                {(lead.status === 'new' || (lead.status === 'in_progress' && !lead.phone)) && (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        type="button"
                                        onClick={() => onOpenContact(lead)}
                                        disabled={claimingLeadId === lead.id}
                                    >
                                        {claimingLeadId === lead.id ? 'Захват...' : 'Работать'}
                                    </button>
                                )}
                                {lead.status === 'in_progress' && lead.phone && onConfirm && (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        type="button"
                                        onClick={() => onConfirm(lead)}
                                        disabled={confirmingLeadId === lead.id}
                                    >
                                        {confirmingLeadId === lead.id ? '...' : 'Подтвердить'}
                                    </button>
                                )}
                                <button
                                    className="btn btn-sm btn-outline"
                                    type="button"
                                    onClick={() => onOpenEdit(lead)}
                                >
                                    {editButtonLabel}
                                </button>
                                {onDelete && (
                                    <button
                                        className="btn btn-sm btn-danger"
                                        type="button"
                                        onClick={() => onDelete(lead)}
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
