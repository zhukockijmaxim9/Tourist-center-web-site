import React from 'react';

function sameValue(left, right) {
    if (left == null || right == null) return left === right;
    return String(left) === String(right);
}

export default function ServiceCategoryFilter({
    categories,
    selectedCategory,
    onChange,
    allLabel,
    heading,
    ariaLabel = 'Категории услуг',
    className = '',
    headingClassName = '',
}) {
    return (
        <div
            className={['services-filter', className].filter(Boolean).join(' ')}
            role="toolbar"
            aria-label={ariaLabel}
        >
            <div className="services-filter__track">
                <div className="services-filter__chips">
                    <button
                        type="button"
                        className={`services-filter__chip ${sameValue(selectedCategory, allLabel.value) ? 'is-active' : ''}`}
                        onClick={() => onChange(allLabel.value)}
                        aria-pressed={sameValue(selectedCategory, allLabel.value)}
                    >
                        {allLabel.label}
                    </button>
                    {categories.map((category) => {
                        const value = category.id ?? category.value;
                        const label = category.name ?? category.label;
                        const isActive = sameValue(selectedCategory, value);
                        return (
                            <button
                                key={value}
                                type="button"
                                className={`services-filter__chip ${isActive ? 'is-active' : ''}`}
                                onClick={() => onChange(value)}
                                aria-pressed={isActive}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>
            {heading ? (
                <h3 className={['services-filter__heading', headingClassName].filter(Boolean).join(' ')} aria-live="polite">
                    {heading}
                </h3>
            ) : null}
        </div>
    );
}
