import React, { useEffect, useState } from 'react';
import Modal from '../../components/Modal';
import { leadsApi } from '../../api';
import { useNotify } from '../../context/NotifyContext';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '../../constants/leadStatus';

export default function LeadDetailsModal({ lead, isOpen, onClose }) {
    const notify = useNotify();
    const [notes, setNotes] = useState([]);
    const [loadingNotes, setLoadingNotes] = useState(false);

    useEffect(() => {
        if (!isOpen || !lead?.id) {
            setNotes([]);
            return;
        }

        let cancelled = false;
        setLoadingNotes(true);

        leadsApi.getNotes(lead.id)
            .then((res) => {
                if (!cancelled) setNotes(res.data);
            })
            .catch((err) => {
                if (!cancelled) notify.fromError(err, 'Не удалось загрузить заметки');
            })
            .finally(() => {
                if (!cancelled) setLoadingNotes(false);
            });

        return () => {
            cancelled = true;
        };
    }, [isOpen, lead, notify]);

    if (!lead) return null;

    const statusLabel = LEAD_STATUS_LABELS[lead.status] || lead.status;
    const statusColor = LEAD_STATUS_COLORS[lead.status] || 'muted';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Заявка №${lead.id}`}
            contentClassName="modal-content--elva"
        >
            <div className="lead-details">
                <div className="lead-details__header">
                    <div className="lead-details__client">
                        <div className="lead-details__name">{lead.name}</div>
                        <div className="lead-details__contacts">
                            {lead.email && <span>{lead.email}</span>}
                            {lead.phone && <span>{lead.phone}</span>}
                        </div>
                    </div>
                    <div className="lead-details__badges">
                        <span className={`badge badge-${statusColor}`}>{statusLabel}</span>
                        <span className="lead-details__date">
                            {new Date(lead.created_at).toLocaleDateString('ru-RU')}
                        </span>
                    </div>
                </div>

                <div className="lead-details__grid">
                    <div className="lead-details__field">
                        <span className="lead-details__label">Услуга</span>
                        <span className="lead-details__value">{lead.service?.name || '—'}</span>
                    </div>
                    <div className="lead-details__field">
                        <span className="lead-details__label">Автор</span>
                        <span className="lead-details__value">{lead.user?.name || 'Гость'}</span>
                    </div>
                    <div className="lead-details__field">
                        <span className="lead-details__label">Менеджер</span>
                        <span className="lead-details__value">{lead.assigned_to?.name || 'Не назначен'}</span>
                    </div>
                </div>

                {lead.message && (
                    <div className="lead-details__message">
                        <span className="lead-details__label">Сообщение клиента</span>
                        <p>{lead.message}</p>
                    </div>
                )}

                <div className="lead-details__notes">
                    <span className="lead-details__label">Внутренние заметки</span>
                    {loadingNotes ? (
                        <p className="text-muted">Загрузка...</p>
                    ) : notes.length === 0 ? (
                        <p className="text-muted">Заметок пока нет</p>
                    ) : (
                        <ul className="lead-details__notes-list">
                            {notes.map((note) => (
                                <li key={note.id}>
                                    <strong>{note.user?.name || '—'}</strong>
                                    {' '}
                                    <small className="text-muted">
                                        {new Date(note.created_at).toLocaleString('ru-RU')}
                                    </small>
                                    <p>{note.note}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="lead-details__footer">
                    <button type="button" className="btn btn-primary" onClick={onClose}>
                        Закрыть
                    </button>
                </div>
            </div>
        </Modal>
    );
}
