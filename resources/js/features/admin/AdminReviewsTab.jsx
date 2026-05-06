import React from 'react';
import DataTable from '../../components/DataTable';

export default function AdminReviewsTab({
    reviews,
    query,
    onQueryChange,
    sort,
    onSortChange,
    columns,
    onDelete,
}) {
    return (
        <section className="dashboard-section">
            <div className="section-header">
                <div>
                    <h2>Отзывы ({reviews.length})</h2>
                    <input
                        className="input input-sm"
                        placeholder="Поиск: услуга, автор, текст..."
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        style={{ marginTop: '0.8rem', maxWidth: 520 }}
                    />
                    <div className="review-sort" style={{ marginTop: '0.8rem' }}>
                        <button
                            type="button"
                            className={`review-sort__chip ${sort === 'best' ? 'is-active' : ''}`}
                            onClick={() => onSortChange('best')}
                            aria-pressed={sort === 'best'}
                        >
                            Лучшие
                        </button>
                        <button
                            type="button"
                            className={`review-sort__chip ${sort === 'worst' ? 'is-active' : ''}`}
                            onClick={() => onSortChange('worst')}
                            aria-pressed={sort === 'worst'}
                        >
                            Худшие
                        </button>
                    </div>
                </div>
            </div>
            <DataTable columns={columns} data={reviews} onDelete={onDelete} />
        </section>
    );
}
