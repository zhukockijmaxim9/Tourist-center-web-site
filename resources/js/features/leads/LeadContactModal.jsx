import React from 'react';
import Modal from '../../components/Modal';

export default function LeadContactModal({ lead, isOpen, onClose, onPostpone, onReject, onDone }) {
    return (
        <Modal
            isOpen={!!isOpen}
            onClose={onClose}
            title="Связаться по телефону"
            contentClassName="modal-content--elva"
        >
            <div style={{ display: 'grid', gap: '1.2rem' }}>
                <div className="alert" style={{ margin: 0 }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>
                        {lead?.name || 'Клиент'}
                    </div>
                    <div style={{ fontSize: '1.7rem', letterSpacing: '0.02em' }}>
                        {lead?.phone || lead?.user?.phone || 'Телефон недоступен'}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-outline" onClick={onPostpone}>
                        Отложить
                    </button>
                    <button type="button" className="btn btn-danger" onClick={onReject}>
                        Отклонить
                    </button>
                    <button type="button" className="btn btn-primary" onClick={onDone}>
                        Выполнено
                    </button>
                </div>
            </div>
        </Modal>
    );
}
