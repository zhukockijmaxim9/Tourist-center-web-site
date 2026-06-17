import React from 'react';

export default function LeadNotesPanel({ notes, noteValue, onNoteChange, onAddNote, isSavingNote = false }) {
    return (
        <div className="notes-section" style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
            <h4>Внутренние заметки</h4>
            <div className="notes-list" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
                {notes.length === 0 && <p className="text-muted small">Заметок пока нет</p>}
                {notes.map((note) => (
                    <div
                        key={note.id}
                        className="note-item"
                        style={{ fontSize: '0.9rem', marginBottom: '0.5rem', padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px' }}
                    >
                        <div style={{ fontWeight: 'bold' }}>
                            {note.user?.name} <small style={{ fontWeight: 'normal' }}>{new Date(note.created_at).toLocaleString('ru-RU')}</small>
                        </div>
                        <div>{note.note}</div>
                    </div>
                ))}
            </div>
            <div className="form-group">
                <textarea
                    value={noteValue || ''}
                    onChange={(e) => onNoteChange(e.target.value)}
                    placeholder="Новая заметка..."
                    rows={2}
                />
                <button type="button" className="btn btn-outline btn-sm" onClick={onAddNote} disabled={isSavingNote} style={{ marginTop: '0.5rem' }}>
                    {isSavingNote ? 'Добавление...' : 'Добавить заметку'}
                </button>
            </div>
        </div>
    );
}
