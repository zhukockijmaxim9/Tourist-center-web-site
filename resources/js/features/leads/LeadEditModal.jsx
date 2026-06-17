import React from 'react';
import Modal from '../../components/Modal';
import LeadNotesPanel from './LeadNotesPanel';

export default function LeadEditModal({
    lead,
    notes,
    form,
    error,
    onClose,
    onSubmit,
    onNoteChange,
    onAddNote,
    isSaving = false,
    isSavingNote = false,
    title = 'Редактировать заявку',
    submitLabel = 'Сохранить',
    children,
}) {
    return (
        <Modal
            isOpen={!!lead}
            onClose={onClose}
            title={title}
            contentClassName="modal-content--elva"
        >
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={onSubmit}>
                {children}
                <LeadNotesPanel
                    notes={notes}
                    noteValue={form.note}
                    onNoteChange={onNoteChange}
                    onAddNote={onAddNote}
                    isSavingNote={isSavingNote}
                />
                <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1.5rem' }} disabled={isSaving}>
                    {isSaving ? 'Сохранение...' : submitLabel}
                </button>
            </form>
        </Modal>
    );
}
