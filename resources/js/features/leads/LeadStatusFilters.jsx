import React from 'react';
import { LEAD_STATUS_COLORS, LEAD_STATUS_LABELS, LEAD_STATUSES } from '../../constants/leadStatus';

export default function LeadStatusFilters({ currentFilter, onChange, getCount, totalCount }) {
    return (
        <div className="lead-filters">
            <button
                className={`lead-filter-btn ${currentFilter === 'all' ? 'active' : ''}`}
                onClick={() => onChange('all')}
                type="button"
            >
                Все <span className="lead-filter-count">{totalCount}</span>
            </button>
            {LEAD_STATUSES.map((status) => (
                <button
                    key={status}
                    className={`lead-filter-btn lead-filter-${LEAD_STATUS_COLORS[status]} ${currentFilter === status ? 'active' : ''}`}
                    onClick={() => onChange(status)}
                    type="button"
                >
                    {LEAD_STATUS_LABELS[status]} <span className="lead-filter-count">{getCount(status)}</span>
                </button>
            ))}
        </div>
    );
}
