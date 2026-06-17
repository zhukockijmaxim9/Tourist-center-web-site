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
    const [updatingStatusLeadId, setUpdatingStatusLeadId] = useState(null);
    const [savingLead, setSavingLead] = useState(false);
    const [savingNote, setSavingNote] = useState(false);
    const [claimingLeadId, setClaimingLeadId] = useState(null);
    const [acting, setActing] = useState(false);
    const [confirmingLeadId, setConfirmingLeadId] = useState(null);
    const [assigningLeadId, setAssigningLeadId] = useState(null);

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

        setUpdatingStatusLeadId(lead.id);
        try {
            const res = await leadsApi.update(lead.id, { status });
            const updatedLead = res.data;
            replaceLead(updatedLead);

            if (editingLead?.id === lead.id) {
                setEditingLead((current) => (current ? { ...current, ...updatedLead } : current));
                setEditForm((current) => ({ ...current, status: updatedLead.status }));
            }

            notify.success('Статус заявки обновлён');
            return updatedLead;
        } catch (err) {
            notify.fromError(err, 'Не удалось обновить статус заявки');
            return null;
        } finally {
            setUpdatingStatusLeadId(null);
        }
    };

    const saveEditedLead = async (buildPayload) => {
        if (!editingLead || savingLead) return null;

        setSavingLead(true);
        try {
            const payload = buildPayload ? buildPayload(editForm, editingLead) : editForm;
            const res = await leadsApi.update(editingLead.id, payload);
            const updatedLead = res.data;
            replaceLead(updatedLead);
            closeLeadEdit();
            notify.success('Заявка сохранена');
            return updatedLead;
        } catch (err) {
            setEditError(getErrorMessage(err, 'Не удалось сохранить заявку'));
            return null;
        } finally {
            setSavingLead(false);
        }
    };

    const addLeadNote = async () => {
        if (!editingLead || !editForm.note?.trim() || savingNote) return null;

        setSavingNote(true);
        try {
            await leadsApi.addNote(editingLead.id, { note: editForm.note.trim() });
            setEditForm((current) => ({ ...current, note: '' }));
            const notes = await loadLeadNotes(editingLead.id);
            notify.success('Заметка добавлена');
            return notes;
        } catch (err) {
            setEditError(getErrorMessage(err, 'Не удалось добавить заметку'));
            return null;
        } finally {
            setSavingNote(false);
        }
    };

    const openLeadContact = async (lead) => {
        if (claimingLeadId === lead.id) return null;

        setClaimingLeadId(lead.id);
        try {
            const res = await leadsApi.claim(lead.id);
            const claimed = res.data;
            replaceLead(claimed);
            setLeadContactModal({ isOpen: true, lead: claimed });
            return claimed;
        } catch (err) {
            notify.fromError(err, 'Не удалось взять заявку в работу');
            return null;
        } finally {
            setClaimingLeadId(null);
        }
    };

    const closeLeadContact = () => setLeadContactModal({ isOpen: false, lead: null });

    const actLead = async (action) => {
        const lead = leadContactModal.lead;
        if (!lead || acting) return null;

        setActing(true);
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
        } finally {
            setActing(false);
        }
    };

    const confirmLead = async (lead) => {
        if (confirmingLeadId === lead.id) return null;

        setConfirmingLeadId(lead.id);
        try {
            const res = await leadsApi.confirm(lead.id);
            const updatedLead = res.data;
            replaceLead(updatedLead);
            notify.success('Заявка подтверждена');
            return updatedLead;
        } catch (err) {
            notify.fromError(err, 'Не удалось подтвердить заявку');
            return null;
        } finally {
            setConfirmingLeadId(null);
        }
    };

    const assignLead = async (lead, managerId) => {
        if (assigningLeadId === lead.id) return null;

        setAssigningLeadId(lead.id);
        try {
            const res = await leadsApi.assign(lead.id, {
                assigned_to_user_id: managerId ? Number(managerId) : null,
            });
            const updatedLead = res.data;
            replaceLead(updatedLead);
            notify.success('Менеджер назначен');
            return updatedLead;
        } catch (err) {
            notify.fromError(err, 'Не удалось назначить менеджера');
            return null;
        } finally {
            setAssigningLeadId(null);
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
        assignLead,
        updatingStatusLeadId,
        savingLead,
        savingNote,
        claimingLeadId,
        acting,
        confirmingLeadId,
        assigningLeadId,
    };
}
