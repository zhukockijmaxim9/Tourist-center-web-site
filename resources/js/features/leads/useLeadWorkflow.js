import { useState } from 'react';
import { leadsApi } from '../../api';
import { useNotify, getErrorMessage } from '../../context/NotifyContext';

const DEFAULT_EDIT_FORM = {
    name: '',
    email: '',
    phone: '',
    message: '',
    service_id: '',
    status: 'new',
    note: '',
};

export default function useLeadWorkflow({ createEditForm } = {}) {
    const notify = useNotify();
    const [leads, setLeads] = useState([]);
    const [leadNotes, setLeadNotes] = useState([]);
    const [editingLead, setEditingLead] = useState(null);
    const [editForm, setEditForm] = useState(DEFAULT_EDIT_FORM);
    const [editError, setEditError] = useState('');
    const [leadContactModal, setLeadContactModal] = useState({ isOpen: false, lead: null });

    const buildEditForm = (lead) => {
        if (createEditForm) {
            return createEditForm(lead);
        }

        return {
            name: lead.name,
            email: lead.email || '',
            phone: lead.phone || '',
            message: lead.message || '',
            service_id: lead.service_id || '',
            status: lead.status || 'new',
            note: '',
        };
    };

    const replaceLead = (updatedLead) => {
        setLeads((current) => current.map((item) => (
            item.id === updatedLead.id ? { ...item, ...updatedLead } : item
        )));
    };

    const reloadLeads = async () => {
        const res = await leadsApi.getAll();
        setLeads(res.data);
        return res.data;
    };

    const loadLeadNotes = async (leadId) => {
        const res = await leadsApi.getNotes(leadId);
        setLeadNotes(res.data);
        return res.data;
    };

    const openLeadEdit = async (lead) => {
        setEditingLead(lead);
        setEditForm(buildEditForm(lead));
        setEditError('');

        try {
            await loadLeadNotes(lead.id);
        } catch (err) {
            notify.fromError(err, 'Не удалось загрузить заметки');
            setLeadNotes([]);
        }
    };

    const closeLeadEdit = () => {
        setEditingLead(null);
        setEditError('');
        setLeadNotes([]);
    };

    const updateLeadStatus = async (lead, status) => {
        if (lead.status === status) return null;

        try {
            const res = await leadsApi.update(lead.id, { status });
            const updatedLead = res.data;
            replaceLead(updatedLead);

            if (editingLead?.id === lead.id) {
                setEditingLead((current) => (current ? { ...current, ...updatedLead } : current));
                setEditForm((current) => ({ ...current, status: updatedLead.status }));
            }

            return updatedLead;
        } catch (err) {
            notify.fromError(err, 'Не удалось обновить статус заявки');
            return null;
        }
    };

    const saveEditedLead = async (buildPayload) => {
        if (!editingLead) return null;

        try {
            const payload = buildPayload ? buildPayload(editForm, editingLead) : editForm;
            const res = await leadsApi.update(editingLead.id, payload);
            const updatedLead = res.data;
            replaceLead(updatedLead);
            closeLeadEdit();
            return updatedLead;
        } catch (err) {
            setEditError(getErrorMessage(err, 'Не удалось сохранить заявку'));
            return null;
        }
    };

    const addLeadNote = async () => {
        if (!editingLead || !editForm.note?.trim()) return null;

        try {
            await leadsApi.addNote(editingLead.id, { note: editForm.note.trim() });
            setEditForm((current) => ({ ...current, note: '' }));
            return await loadLeadNotes(editingLead.id);
        } catch (err) {
            setEditError(getErrorMessage(err, 'Не удалось добавить заметку'));
            return null;
        }
    };

    const openLeadContact = async (lead) => {
        try {
            const res = await leadsApi.claim(lead.id);
            const claimed = res.data;
            replaceLead(claimed);
            setLeadContactModal({ isOpen: true, lead: claimed });
            return claimed;
        } catch (err) {
            notify.fromError(err, 'Не удалось взять заявку в работу');
            return null;
        }
    };

    const closeLeadContact = () => setLeadContactModal({ isOpen: false, lead: null });

    const actLead = async (action) => {
        const lead = leadContactModal.lead;
        if (!lead) return null;

        try {
            if (action === 'postpone') {
                await leadsApi.release(lead.id);
                notify.info('Заявка отложена');
            }

            if (action === 'reject') {
                const res = await leadsApi.update(lead.id, { status: 'cancelled' });
                await leadsApi.release(lead.id);
                replaceLead(res.data);
                notify.success('Заявка отклонена');
            }

            if (action === 'done') {
                const res = await leadsApi.update(lead.id, { status: 'done' });
                await leadsApi.release(lead.id);
                replaceLead(res.data);
                notify.success('Заявка отмечена как выполненная');
            }

            closeLeadContact();
            await reloadLeads();
            return true;
        } catch (err) {
            notify.fromError(err, 'Не удалось обновить заявку');
            return false;
        }
    };

    const confirmLead = async (lead) => {
        try {
            const res = await leadsApi.confirm(lead.id);
            const updatedLead = res.data;
            replaceLead(updatedLead);
            return updatedLead;
        } catch (err) {
            notify.fromError(err, 'Не удалось подтвердить заявку');
            return null;
        }
    };

    return {
        leads,
        setLeads,
        leadNotes,
        editingLead,
        editForm,
        editError,
        leadContactModal,
        setEditForm,
        setEditError,
        reloadLeads,
        loadLeadNotes,
        openLeadEdit,
        closeLeadEdit,
        updateLeadStatus,
        saveEditedLead,
        addLeadNote,
        openLeadContact,
        closeLeadContact,
        actLead,
        confirmLead,
    };
}
