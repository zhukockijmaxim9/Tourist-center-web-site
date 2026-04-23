import React from 'react';

const svgBase = {
    viewBox: '0 0 24 24',
    focusable: 'false',
    'aria-hidden': true,
};

export function IconThemeMoon(props) {
    const { className } = props;
    return (
        <svg {...svgBase} className={className}>
            {/* Толстая «waxing» луна — один контур, заливка currentColor */}
            <path
                fill="currentColor"
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            />
        </svg>
    );
}

export function IconThemeSun(props) {
    const { className } = props;
    return (
        <svg {...svgBase} className={className}>
            <circle cx="12" cy="12" r="3.4" fill="currentColor" />
            <g
                stroke="currentColor"
                strokeWidth="2.15"
                strokeLinecap="round"
                fill="none"
            >
                <line x1="12" y1="1.8" x2="12" y2="5" />
                <line x1="12" y1="19" x2="12" y2="22.2" />
                <line x1="4.3" y1="4.3" x2="6.55" y2="6.55" />
                <line x1="17.45" y1="17.45" x2="19.7" y2="19.7" />
                <line x1="1.8" y1="12" x2="5" y2="12" />
                <line x1="19" y1="12" x2="22.2" y2="12" />
                <line x1="4.3" y1="19.7" x2="6.55" y2="17.45" />
                <line x1="17.45" y1="6.55" x2="19.7" y2="4.3" />
            </g>
        </svg>
    );
}
