import { useMemo, useState } from 'react';
import { leadsApi } from '../../api';
import { getErrorMessage } from '../../context/NotifyContext';

function buildEmptyForm(serviceId = '') {
    return {
        name: '',
        email: '',
        phone: '',
        message: '',
        service_id: serviceId,
    };
}

export default function useLeadForm({
    services,
    user,
    allowEdit,
    onSuccess,
    successMode = 'close',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [form, setForm] = useState(buildEmptyForm());
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [initialLead, setInitialLead] = useState(null);

    const fallbackServiceId = useMemo(
        () => services[0]?.id || '',
        [services],
    );

    const close = () => {
        setIsOpen(false);
        setError('');
        setSuccess(false);
        setInitialLead(null);
    };

    const openCreate = (service) => {
        setMode('create');
        setInitialLead(null);
        setForm({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            message: '',
            service_id: service?.id || fallbackServiceId,
        });
        setError('');
        setSuccess(false);
        setIsOpen(true);
    };

    const openEdit = (lead) => {
        if (!allowEdit || !lead) return;
        setMode('edit');
        setInitialLead(lead);
        setForm({
            name: lead.name || '',
            email: lead.email || '',
            phone: lead.phone || '',
            message: lead.message || '',
            service_id: lead.service_id || fallbackServiceId,
        });
        setError('');
        setSuccess(false);
        setIsOpen(true);
    };

    const updateField = (key, value) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    const submit = async (e) => {
        e.preventDefault();
        setError('');

        const payload = {
            name: form.name,
            email: form.email,
            phone: form.phone,
            message: form.message.trim() || null,
            service_id: form.service_id,
        };

        try {
            if (mode === 'edit' && initialLead) {
                await leadsApi.update(initialLead.id, payload);
            } else {
                await leadsApi.create(payload);
            }

            if (successMode === 'message' && mode === 'create') {
                setSuccess(true);
                window.setTimeout(() => close(), 2000);
            } else {
                close();
            }

            await onSuccess?.({ mode, lead: initialLead, payload });
        } catch (err) {
            const message = err.response?.data?.errors;
            if (typeof message === 'object') {
                setError(Object.values(message).flat().join('. '));
            } else {
                setError(getErrorMessage(err, mode === 'edit' ? 'Ошибка сохранения заявки' : 'Ошибка при отправке'));
            }
        }
    };

    return {
        isOpen,
        mode,
        form,
        error,
        success,
        initialLead,
        openCreate,
        openEdit,
        close,
        submit,
        updateField,
    };
}
