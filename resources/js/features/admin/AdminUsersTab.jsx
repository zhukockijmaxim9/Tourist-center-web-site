import React from 'react';
import DataTable from '../../components/DataTable';

export default function AdminUsersTab({ users, query, onQueryChange, onCreate, columns, onEdit, onDelete }) {
    return (
        <section className="dashboard-section">
            <div className="section-header">
                <div>
                    <h2>Пользователи ({users.length})</h2>
                    <input
                        className="input input-sm"
                        placeholder="Поиск: имя, email, телефон..."
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        style={{ marginTop: '0.8rem', maxWidth: 420 }}
                    />
                </div>
                <button className="btn btn-primary" onClick={onCreate}>+ Добавить</button>
            </div>
            <DataTable columns={columns} data={users} onEdit={onEdit} onDelete={onDelete} />
        </section>
    );
}
