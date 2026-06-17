import React from 'react';
import Modal from '../../components/Modal';

export default function LeadFormModal({
    isOpen,
    mode,
    services,
    initialUser,
    initialLead,
    onSubmitSuccess,
    onClose,
    form,
    error,
    success,
    onChange,
    onSubmit,
    isLoading = false,
    variant = 'default',
}) {
    const isBooking = variant === 'booking';
    const title = mode === 'edit' ? 'Редактировать заявку' : 'Новая заявка';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isBooking ? undefined : title}
            variant={isBooking ? 'booking' : undefined}
            contentClassName={isBooking ? '' : 'modal-content--elva'}
        >
            {success && isBooking ? (
                <div className="booking-success">
                    <h2 className="booking-success__title">Спасибо, что выбираете нас!</h2>
                    <p className="booking-success__text">
                        Наш менеджер свяжется с вами для подтверждения бронирования в течение 15–30 минут
                    </p>
                </div>
            ) : (
                <>
                    {isBooking ? (
                        <header className="booking-form__head">
                            <h2 className="booking-form__title">Бронирование</h2>
                            <p className="booking-form__subtitle">
                                Заполните форму, и мы свяжемся с вами для подтверждения бронирования в течение 15–30 минут
                            </p>
                        </header>
                    ) : null}

                    {error ? (
                        <div className={isBooking ? 'booking-form__alert booking-form__alert--error' : 'alert alert-error'}>
                            {error}
                        </div>
                    ) : null}

                    <form className={isBooking ? 'booking-form' : ''} onSubmit={onSubmit} noValidate>
                        <div className={isBooking ? 'booking-form__field' : 'form-group'}>
                            <label className={isBooking ? 'booking-form__label' : ''} htmlFor="lead-name">
                                Имя
                            </label>
                            <input
                                id="lead-name"
                                className={isBooking ? 'booking-form__control' : ''}
                                value={form.name}
                                onChange={(e) => onChange('name', e.target.value)}
                                required
                                autoComplete="name"
                            />
                        </div>

                        <div className={isBooking ? 'booking-form__field' : 'form-group'}>
                            <label className={isBooking ? 'booking-form__label' : ''} htmlFor="lead-email">
                                Email
                            </label>
                            <input
                                id="lead-email"
                                className={isBooking ? 'booking-form__control' : ''}
                                type="email"
                                value={form.email}
                                onChange={(e) => onChange('email', e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className={isBooking ? 'booking-form__field' : 'form-group'}>
                            <label className={isBooking ? 'booking-form__label' : ''} htmlFor="lead-phone">
                                Телефон
                            </label>
                            {isBooking ? (
                                <div className="booking-form__phone-row">
                                    <span className="booking-form__phone-prefix" aria-hidden="true">+7</span>
                                    <input
                                        id="lead-phone"
                                        className="booking-form__control booking-form__control--phone"
                                        value={form.phone}
                                        onChange={(e) => onChange('phone', e.target.value)}
                                        required
                                        autoComplete="tel"
                                    />
                                </div>
                            ) : (
                                <input
                                    id="lead-phone"
                                    value={form.phone}
                                    onChange={(e) => onChange('phone', e.target.value)}
                                    required
                                    autoComplete="tel"
                                />
                            )}
                        </div>

                        {!isBooking ? (
                            <div className="form-group">
                                <label htmlFor="lead-service">Услуга</label>
                                <select
                                    id="lead-service"
                                    value={form.service_id}
                                    onChange={(e) => onChange('service_id', e.target.value)}
                                    required
                                >
                                    <option value="">Выберите услугу</option>
                                    {services.map((service) => (
                                        <option key={service.id} value={service.id}>{service.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : null}

                        <div className={isBooking ? 'booking-form__field' : 'form-group'}>
                            <label className={isBooking ? 'booking-form__label' : ''} htmlFor="lead-message">
                                Комментарий
                            </label>
                            <textarea
                                id="lead-message"
                                className={isBooking ? 'booking-form__control booking-form__control--textarea' : ''}
                                value={form.message}
                                onChange={(e) => onChange('message', e.target.value)}
                                rows={isBooking ? 2 : 3}
                            />
                        </div>

                        <button type="submit" className={isBooking ? 'booking-form__submit' : 'btn btn-primary btn-block'} disabled={isLoading}>
                            {isLoading
                                ? 'Отправка...'
                                : mode === 'edit'
                                    ? 'Сохранить'
                                    : isBooking
                                        ? 'оставить заявку'
                                        : 'Отправить'}
                        </button>
                    </form>
                </>
            )}
        </Modal>
    );
}
