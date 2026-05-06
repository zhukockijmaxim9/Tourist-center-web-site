import React from 'react';
import { getServicePhotoUrl, serviceImageOnError } from '../../utils/serviceCardImage';

export default function ServiceCard({
    service,
    onCardClick,
    onPrimaryAction,
    interactiveMode = 'details',
}) {
    const isActive = service.status === 'active';
    const cardIsInteractive = interactiveMode === 'details' || (interactiveMode === 'book' && isActive);
    const cardClassName = [
        'service-showcase',
        interactiveMode === 'book' && !isActive ? 'service-showcase--inactive-dash' : '',
    ].filter(Boolean).join(' ');

    const handleCardClick = () => {
        if (!cardIsInteractive) return;
        onCardClick?.(service);
    };

    const handleKeyDown = (e) => {
        if (!cardIsInteractive) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onCardClick?.(service);
        }
    };

    return (
        <article
            className={cardClassName}
            onClick={handleCardClick}
            onKeyDown={handleKeyDown}
            role={cardIsInteractive ? 'button' : undefined}
            tabIndex={cardIsInteractive ? 0 : undefined}
            aria-label={cardIsInteractive ? service.name : undefined}
        >
            <div className="service-showcase__media service-showcase__media--photo">
                <img
                    className="service-showcase__photo"
                    src={getServicePhotoUrl(service)}
                    alt=""
                    loading="lazy"
                    onError={serviceImageOnError}
                />
                <span
                    className={`service-showcase__badge service-showcase__badge--overlay ${
                        isActive ? 'service-showcase__badge--on' : 'service-showcase__badge--off'
                    }`}
                >
                    {isActive ? 'Доступно' : 'Недоступно'}
                </span>
                <span className="service-showcase__category">
                    {service.category?.name || 'Без категории'}
                </span>
            </div>
            <h3 className="service-showcase__title">{service.name}</h3>
            <p className="service-showcase__desc">
                {service.description || 'Описание скоро появится'}
            </p>
            <div className="service-showcase__bottom">
                {service.price ? (
                    <p className="service-showcase__price">
                        {Number(service.price).toLocaleString('ru-RU')} ₽
                    </p>
                ) : (
                    <p className="service-showcase__price service-showcase__price--muted">
                        Цена по запросу
                    </p>
                )}
                <div className="service-showcase__actions">
                    {isActive && onPrimaryAction ? (
                        <button
                            type="button"
                            className="btn btn-primary btn-sm btn--service-showcase"
                            onClick={(e) => {
                                e.stopPropagation();
                                onPrimaryAction(service);
                            }}
                        >
                            Заказать
                        </button>
                    ) : null}
                </div>
            </div>
        </article>
    );
}
