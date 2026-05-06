import React from 'react';
import ServiceCard from './ServiceCard';

export default function ServiceCardGrid({
    services,
    emptyMessage,
    emptyClassName = 'user-dashboard-placeholder',
    onCardClick,
    onPrimaryAction,
    interactiveMode = 'details',
}) {
    if (services.length === 0) {
        return <p className={emptyClassName}>{emptyMessage}</p>;
    }

    return (
        <div className="services-grid services-grid--showcase">
            {services.map((service) => (
                <ServiceCard
                    key={service.id}
                    service={service}
                    onCardClick={onCardClick}
                    onPrimaryAction={onPrimaryAction}
                    interactiveMode={interactiveMode}
                />
            ))}
        </div>
    );
}
