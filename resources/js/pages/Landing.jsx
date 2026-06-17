import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { useAuth } from '../context/AuthContext';
import LeadFormModal from '../features/leads/LeadFormModal';
import useLeadForm from '../features/leads/useLeadForm';
import ServiceCardGrid from '../features/services/ServiceCardGrid';
import ServiceCategoryFilter from '../features/services/ServiceCategoryFilter';
import ServiceDetailsModal from '../features/services/ServiceDetailsModal';
import useServicesCatalog from '../features/services/useServicesCatalog';

export default function Landing() {
    const { user } = useAuth();
    const {
        services,
        categories,
        filteredServices,
        selectedCategory,
        setSelectedCategory,
        selectedCategoryHeading,
    } = useServicesCatalog({
        initialCategory: null,
    });
    const [selectedService, setSelectedService] = useState(null);
    const leadForm = useLeadForm({
        services,
        user,
        allowEdit: false,
        successMode: 'message',
    });

    const openBooking = (service) => {
        setSelectedService(null);
        leadForm.openCreate(service);
    };

    return (
        <div className="landing">
            <section className="hero hero--fade-white">
                <div className="hero__photo-stack" aria-hidden="true">
                    <div className="hero__photo hero__photo--light" />
                    <div className="hero__photo hero__photo--dark" />
                </div>
                <div className="hero-content">
                    <div className="hero-brand">
                        <p className="hero-brand__text">ELVA</p>
                    </div>
                    <h1 className="hero-title">
                        где время замедляется, а пространство наполняется спокойствием.
                    </h1>
                    <p className="hero-subtitle">
                        where time slows down and space becomes peaceful.
                    </p>
                    <div className="hero-actions">
                        {user ? (
                            <Link
                                href={user.role === 'admin' ? '/admin' : user.role === 'manager' ? '/manager' : '/dashboard'}
                                className="btn btn-lg btn--hero-wire"
                            >
                                Перейти в личный кабинет
                            </Link>
                        ) : (
                            <>
                                <Link href="/register" className="btn btn-lg btn--hero-wire">
                                    Начать сейчас
                                </Link>
                                <Link href="/login" className="btn btn-lg btn--hero-wire">
                                    Войти
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                <div className="hero-decoration">
                    <div className="hero-orb hero-orb-1" />
                    <div className="hero-orb hero-orb-2" />
                    <div className="hero-orb hero-orb-3" />
                </div>
            </section>

            {services.length > 0 ? (
                <section
                    className="services-section"
                    aria-labelledby={
                        categories.length > 0
                            ? 'services-heading services-filter-heading'
                            : 'services-heading'
                    }
                >
                    <div className="services-section__inner">
                        <div className="services-section__head">
                            <h2 id="services-heading" className="services-section__title">
                                Наши услуги
                            </h2>
                            <span className="services-section__rule" aria-hidden="true" />
                        </div>

                        {categories.length > 0 ? (
                            <ServiceCategoryFilter
                                categories={categories}
                                selectedCategory={selectedCategory}
                                onChange={setSelectedCategory}
                                allLabel={{ value: null, label: 'Все' }}
                                heading={selectedCategory === null ? 'Все направления' : selectedCategoryHeading ?? 'Категория'}
                                ariaLabel="Категории услуг"
                            />
                        ) : null}

                        <ServiceCardGrid
                            services={filteredServices}
                            emptyMessage="В этой категории пока нет услуг."
                            emptyClassName="services-section__empty"
                            onCardClick={setSelectedService}
                            onPrimaryAction={openBooking}
                            interactiveMode="details"
                        />
                    </div>
                </section>
            ) : null}

            {!user ? (
                <section className="section section-cta">
                    <h2>Готовы к приключениям?</h2>
                    <p>Зарегистрируйтесь и получите доступ к расширенным функциям личного кабинета</p>
                    <Link href="/register" className="btn btn-outline btn-lg">
                        Зарегистрироваться
                    </Link>
                </section>
            ) : null}

            <LeadFormModal
                isOpen={leadForm.isOpen}
                mode={leadForm.mode}
                services={services}
                initialUser={user}
                initialLead={leadForm.initialLead}
                onSubmitSuccess={null}
                onClose={leadForm.close}
                form={leadForm.form}
                error={leadForm.error}
                success={leadForm.success}
                onChange={leadForm.updateField}
                onSubmit={leadForm.submit}
                isLoading={leadForm.loading}
                variant="booking"
            />

            <ServiceDetailsModal
                isOpen={!!selectedService}
                service={selectedService}
                user={user}
                onClose={() => setSelectedService(null)}
                onBook={openBooking}
            />
        </div>
    );
}
