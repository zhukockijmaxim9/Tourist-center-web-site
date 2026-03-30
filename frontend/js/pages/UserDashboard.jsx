import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { servicesApi, leadsApi } from '../api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

export default function UserDashboard() {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [leads, setLeads] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', service_id: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [sRes, lRes] = await Promise.all([
                servicesApi.getAll(),
                leadsApi.getAll(),
            ]);
            setServices(sRes.data);
            setLeads(lRes.data);
        } catch (err) {
            alert('Ошибка загрузки данных: ' + (err.response?.data?.message || err.message));
        }
    };

    const openCreate = () => {
        setEditingLead(null);
        setForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            message: '',
            service_id: services.length > 0 ? services[0].id : '',
        });
        setError('');
        setShowModal(true);
    };

    const openEdit = (lead) => {
        setEditingLead(lead);
        setForm({
            name: lead.name,
            email: lead.email || '',
            phone: lead.phone,
            message: lead.message || '',
            service_id: lead.service_id || '',
        });
        setError('');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingLead) {
                await leadsApi.update(editingLead.id, form);
            } else {
                await leadsApi.create(form);
            }
            setShowModal(false);
            loadData();
        } catch (err) {
            const msg = err.response?.data?.errors;
            if (typeof msg === 'object') {
                setError(Object.values(msg).flat().join('. '));
            } else {
                setError(err.response?.data?.message || 'Ошибка');
            }
        }
    };

    const handleDelete = async (lead) => {
        if (!confirm('Удалить заявку?')) return;
        await leadsApi.delete(lead.id);
        loadData();
    };

    const update = (key, val) => setForm({ ...form, [key]: val });

    const leadColumns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Имя' },
        { key: 'phone', label: 'Телефон' },
        {
            key: 'service',
            label: 'Услуга',
            render: (val) => val?.name || '—',
        },
        {
            key: 'status',
            label: 'Статус',
            render: (val) => (
                <span className={`badge badge-${val === 'done' ? 'success' : val === 'cancelled' ? 'danger' : 'primary'}`}>
                    {val}
                </span>
            ),
        },
        { key: 'created_at', label: 'Дата', render: (val) => new Date(val).toLocaleDateString('ru-RU') },
    ];

    return (
        <div className="dashboard">
            <div className="welcome-banner animate-in">
                <div className="welcome-content">
                    <h1>С возвращением, {user?.name}! 👋</h1>
                    <p>
                        Рады видеть вас снова. Здесь вы можете просмотреть доступные услуги 
                        и управлять вашими заявками.
                    </p>
                </div>
            </div>

            {/* Services */}
            <section className="dashboard-section animate-in" style={{ animationDelay: '0.1s' }}>
                <h2>Доступные услуги</h2>
                <div className="services-grid">
                    {services.map((s) => (
                        <div key={s.id} className="service-card service-card-sm">
                            <h3>{s.name}</h3>
                            <p>{s.description || '—'}</p>
                            {s.price && <div className="service-price">{Number(s.price).toLocaleString('ru-RU')} ₽</div>}
                        </div>
                    ))}
                    {services.length === 0 && <p className="text-muted">Услуги пока не добавлены</p>}
                </div>
            </section>

            {/* Leads */}
            <section className="dashboard-section animate-in" style={{ animationDelay: '0.2s' }}>
                <div className="section-header">
                    <h2>Мои заявки</h2>
                    <button className="btn btn-primary" onClick={openCreate}>+ Новая заявка</button>
                </div>
                <DataTable
                    columns={leadColumns}
                    data={leads}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                />
            </section>

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingLead ? 'Редактировать заявку' : 'Новая заявка'}
            >
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Имя</label>
                        <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Телефон</label>
                        <input value={form.phone} onChange={(e) => update('phone', e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Услуга</label>
                        <select value={form.service_id} onChange={(e) => update('service_id', e.target.value)} required>
                            <option value="">Выберите услугу</option>
                            {services.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Сообщение</label>
                        <textarea value={form.message} onChange={(e) => update('message', e.target.value)} rows={3} />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">
                        {editingLead ? 'Сохранить' : 'Отправить'}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
