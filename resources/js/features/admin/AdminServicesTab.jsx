import React from 'react';
import DataTable from '../../components/DataTable';

export default function AdminServicesTab({ services, query, onQueryChange, onCreate, columns, onEdit, onDelete }) {
    return (
        <section className="dashboard-section">
            <div className="section-header">
                <div>
                    <h2>Услуги ({services.length})</h2>
                    <input
                        className="input input-sm"
                        placeholder="Поиск: название, категория, описание..."
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        style={{ marginTop: '0.8rem', maxWidth: 520 }}
                    />
                </div>
                <button className="btn btn-primary" onClick={onCreate}>+ Добавить</button>
            </div>
            <DataTable columns={columns} data={services} onEdit={onEdit} onDelete={onDelete} />
        </section>
    );
}
