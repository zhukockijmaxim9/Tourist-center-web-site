    const handleCancelLead = async (lead) => {
        setConfirmModal({
            isOpen: true,
            title: 'Отменить заявку?',
            body: 'Вы уверены? Заявка будет удалена.',
            confirmText: 'Отменить',
            danger: true,
            onConfirm: async () => {
                setConfirmLoading(true);
                try {
                    await leadsApi.delete(lead.id);
                    setConfirmModal({ isOpen: false });
                    notify.success('Заявка отменена');
                    await loadLeads();
                } catch (err) {
                    notify.fromError(err, 'Не удалось отменить заявку');
                } finally {
                    setConfirmLoading(false);
                }
            },
        });
    };import React, { useEffect, useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { leadsApi, reviewsApi } from '../api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotifyContext';
import LeadFormModal from '../features/leads/LeadFormModal';
import useLeadForm from '../features/leads/useLeadForm';
import ReviewFormModal from '../features/reviews/ReviewFormModal';
import ServiceCardGrid from '../features/services/ServiceCardGrid';
import ServiceCategoryFilter from '../features/services/ServiceCategoryFilter';
import useServicesCatalog from '../features/services/useServicesCatalog';

const LEAD_STATUS_RU = {
    new: 'Новая',
    in_progress: 'В работе',
    done: 'Выполнено',
    cancelled: 'Отменена',
};

function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function UserDashboard() {
    const { user } = useAuth();
    const notify = useNotify();
    const [leads, setLeads] = useState([]);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false });
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [leadStatusFilter, setLeadStatusFilter] = useState('all');
    const [reviewModal, setReviewModal] = useState({ isOpen: false, lead: null });
    const {
        services,
        categories,
        filteredServices,
        selectedCategory,
        setSelectedCategory,
        query,
        setQuery,
        onlyActive,
        setOnlyActive,
        servicesShown,
        servicesTotal,
        selectedCategoryHeading,
    } = useServicesCatalog({
        enableSearch: true,
        enableOnlyActive: true,
        initialCategory: 'all',
        initialOnlyActive: true,
    });

    const loadLeads = async () => {
        try {
            const res = await leadsApi.getAll();
            setLeads(res.data);
        } catch (err) {
            notify.fromError(err, 'Ошибка загрузки данных');
        }
    };

    useEffect(() => {
        loadLeads();
    }, []);

    const leadForm = useLeadForm({
        services,
        user,
        allowEdit: true,
        onSuccess: loadLeads,
    });

    const handleOpenReview = (lead) => {
        setReviewModal({ isOpen: true, lead });
    };

    const handleCloseReview = () => {
        setReviewModal({ isOpen: false, lead: null });
    };

    const handleDelete = async (lead) => {
        setConfirmModal({
            isOpen: true,
            title: 'Удалить отзыв?',
            body: 'Вы уверены? Это действие нельзя отменить.',
            confirmText: 'Удалить',
            danger: true,
            onConfirm: async () => {
                setConfirmLoading(true);
                try {
                    const review = lead.reviews?.[0];
                    if (review) {
                        await reviewsApi.delete(review.id);
                        setConfirmModal({ isOpen: false });
                        notify.success('Отзыв удалён');
                        await loadLeads();
                    }
                } catch (err) {
                    notify.fromError(err, 'Не удалось удалить отзыв');
                } finally {
                    setConfirmLoading(false);
                }
            },
        });
    };

    const leadColumns = useMemo(() => [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Имя' },
        { key: 'phone', label: 'Телефон' },
        {
            key: 'service',
            label: 'Услуга',
            render: (value) => value?.name || '—',
        },
        {
            key: 'status',
            label: 'Статус',
            render: (value) => (
                <span className={`badge badge-${value === 'done' ? 'success' : value === 'cancelled' ? 'danger' : 'primary'}`}>
                    {LEAD_STATUS_RU[value] || value}
                </span>
            ),
        },
        {
            key: 'created_at',
            label: 'Дата',
            render: (value) => new Date(value).toLocaleDateString('ru-RU'),
        },
    ], []);

    const filteredLeads = leadStatusFilter === 'all'
        ? leads
        : leads.filter((lead) => lead.status === leadStatusFilter);

    const leadStatusLabels = [
        { id: 'all', label: 'Все' },
        { id: 'new', label: LEAD_STATUS_RU.new },
        { id: 'in_progress', label: LEAD_STATUS_RU.in_progress },
        { id: 'done', label: LEAD_STATUS_RU.done },
        { id: 'cancelled', label: LEAD_STATUS_RU.cancelled },
    ];

    const leadFilterHeading = leadStatusFilter === 'all'
        ? 'Все заявки'
        : leadStatusLabels.find((item) => item.id === leadStatusFilter)?.label ?? 'Заявки';

    const servicesEmptyMessage = servicesTotal === 0
        ? 'Услуги пока не добавлены — загляните позже.'
        : 'По выбранным фильтрам ничего не найдено.';

    return (
        <div className="dashboard dashboard--user">
            <header className="user-dashboard-hero animate-in">
                <div className="user-dashboard-hero__inner">
                    <p className="user-dashboard-eyebrow">ELVA</p>
                    <h1 className="user-dashboard-hero__title">С возвращением, {user?.name}</h1>
                    <p className="user-dashboard-hero__lead">
                        Каталог услуг и ваши заявки в одном месте. Обновите профиль или аватар в любой момент.
                    </p>
                    <div className="user-dashboard-hero__actions">
                        <Link href="/account" className="btn btn-outline user-dashboard-hero__link">
                            Личный кабинет
                        </Link>
                        <button
                            type="button"
                            className="btn btn-outline user-dashboard-hero__link"
                            onClick={() => scrollToSection('user-leads')}
                        >
                            К заявкам
                        </button>
                    </div>
                </div>
            </header>

            <nav className="user-dashboard-rail" aria-label="Переход по разделам страницы">
                <button
                    type="button"
                    className="user-dashboard-rail__btn"
                    onClick={() => scrollToSection('user-services')}
                >
                    Услуги
                </button>
                <button
                    type="button"
                    className="user-dashboard-rail__btn"
                    onClick={() => scrollToSection('user-leads')}
                >
                    Заявки
                    {leads.length > 0 ? (
                        <span className="user-dashboard-rail__count">{leads.length}</span>
                    ) : null}
                </button>
            </nav>

            <section
                id="user-services"
                className="dashboard-section user-dashboard-panel animate-in"
                style={{ animationDelay: '0.08s' }}
                aria-labelledby="user-services-heading"
            >
                <div className="user-dashboard-section-head section-header">
                    <div className="user-dashboard-section-head__titles">
                        <p className="user-dashboard-eyebrow user-dashboard-eyebrow--muted">Каталог</p>
                        <h2 className="user-dashboard-section-title" id="user-services-heading">
                            Услуги
                        </h2>
                    </div>
                    <div className="user-dashboard-toolbar">
                        <div className="service-search service-search--enhanced user-dashboard-toolbar__search">
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Название, описание, категория…"
                                aria-label="Поиск по услугам"
                            />
                        </div>
                        <button
                            type="button"
                            className={`services-filter__chip services-filter__chip--toggle ${
                                onlyActive ? 'is-active' : ''
                            }`}
                            onClick={() => setOnlyActive((value) => !value)}
                            title="Показывать только доступные"
                        >
                            {onlyActive ? 'Доступные' : 'Все статусы'}
                        </button>
                    </div>
                </div>

                {servicesTotal > 0 ? (
                    <p className="user-dashboard-services-meta" role="status">
                        Показано <strong>{servicesShown}</strong> из <strong>{servicesTotal}</strong>
                        {onlyActive ? ' (только доступные)' : ''}
                    </p>
                ) : null}

                {categories.length > 0 ? (
                    <ServiceCategoryFilter
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onChange={(value) => setSelectedCategory(String(value))}
                        allLabel={{ value: 'all', label: 'Все' }}
                        heading={selectedCategory === 'all' ? 'Все категории' : selectedCategoryHeading ?? 'Категория'}
                        ariaLabel="Категории услуг"
                        className="user-dashboard-services-filter"
                        headingClassName="user-dashboard-services-filter__heading"
                    />
                ) : null}

                <ServiceCardGrid
                    services={filteredServices}
                    emptyMessage={servicesEmptyMessage}
                    onCardClick={leadForm.openCreate}
                    onPrimaryAction={leadForm.openCreate}
                    interactiveMode="book"
                />
            </section>

            <section
                id="user-leads"
                className="dashboard-section user-dashboard-panel user-dashboard-panel--leads animate-in"
                style={{ animationDelay: '0.16s' }}
                aria-labelledby="user-leads-heading"
            >
                <div className="user-dashboard-section-head section-header">
                    <div className="user-dashboard-section-head__titles">
                        <p className="user-dashboard-eyebrow user-dashboard-eyebrow--muted">Заявки</p>
                        <h2 className="user-dashboard-section-title" id="user-leads-heading">
                            Мои заявки
                        </h2>
                        {leads.length > 0 ? (
                            <p className="user-dashboard-leads-meta">Всего в списке: {leads.length}</p>
                        ) : null}
                    </div>
                    <button type="button" className="btn btn-primary user-dashboard-btn-new" onClick={() => leadForm.openCreate()}>
                        Новая заявка
                    </button>
                </div>

                {leads.length > 0 ? (
                    <ServiceCategoryFilter
                        categories={leadStatusLabels}
                        selectedCategory={leadStatusFilter}
                        onChange={setLeadStatusFilter}
                        allLabel={{ value: 'all', label: 'Все' }}
                        heading={leadFilterHeading}
                        ariaLabel="Фильтр по статусу заявки"
                        className="user-dashboard-leads-filter"
                        headingClassName="user-dashboard-leads-filter__heading"
                    />
                ) : null}

                {leads.length === 0 ? (
                    <div className="user-dashboard-empty-leads">
                        <p className="user-dashboard-empty-leads__title">Пока нет заявок</p>
                        <p className="user-dashboard-empty-leads__text">
                            Выберите услугу выше и оформите заявку — мы свяжемся с вами по указанным контактам.
                        </p>
                        <button type="button" className="btn btn-primary" onClick={() => leadForm.openCreate()}>
                            Создать заявку
                        </button>
                    </div>
                ) : (
                    <div className="user-dashboard-table-shell">
                        {filteredLeads.length === 0 ? (
                            <p className="user-dashboard-placeholder user-dashboard-placeholder--table">
                                Нет заявок с выбранным статусом.
                            </p>
                        ) : (
                            <DataTable
                                columns={leadColumns}
                                data={filteredLeads}
                                renderActions={(lead) => (
                                    <>
                                        {lead.status === 'new' && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleCancelLead(lead)}
                                            >
                                                Отменить
                                            </button>
                                        )}
                                        {lead.status === 'done' && (
                                            lead.has_reviewed ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(lead)}
                                                >
                                                    Удалить отзыв
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => handleOpenReview(lead)}
                                                >
                                                    Оставить отзыв
                                                </button>
                                            )
                                        )}
                                    </>
                                )}
                            />
                        )}
                    </div>
                )}
            </section>

            <LeadFormModal
                isOpen={leadForm.isOpen}
                mode={leadForm.mode}
                services={services}
                initialUser={user}
                initialLead={leadForm.initialLead}
                onSubmitSuccess={loadLeads}
                onClose={leadForm.close}
                form={leadForm.form}
                error={leadForm.error}
                success={leadForm.success}
                onChange={leadForm.updateField}
                onSubmit={leadForm.submit}
                isLoading={leadForm.loading}
            />

            <ReviewFormModal
                isOpen={reviewModal.isOpen}
                lead={reviewModal.lead}
                onClose={handleCloseReview}
                onSuccess={loadLeads}
            />

            <Modal
                isOpen={!!confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false })}
                title={confirmModal.title || 'Подтверждение'}
                contentClassName="modal-content--elva"
                disableClose={confirmLoading}
            >
                <p className="user-dashboard-confirm-text">{confirmModal.body || 'Вы уверены?'}</p>
                <div className="user-dashboard-modal-actions">
                    <button className="btn btn-outline" type="button" onClick={() => setConfirmModal({ isOpen: false })}>
                        Отмена
                    </button>
                    <button
                        className={`btn ${confirmModal.danger ? 'btn-danger' : 'btn-primary'}`}
                        type="button"
                        disabled={confirmLoading}
                        onClick={async () => {
                            try {
                                await confirmModal.onConfirm?.();
                            } catch (err) {
                                notify.fromError(err, 'Ошибка');
                            }
                        }}
                    >
                        {confirmLoading ? 'Удаление...' : (confirmModal.confirmText || 'Ок')}
                    </button>
                </div>
            </Modal>
        </div>
    );
}
