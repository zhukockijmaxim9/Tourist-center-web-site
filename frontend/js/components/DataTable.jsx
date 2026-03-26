import React from 'react';

export default function DataTable({ columns, data, onEdit, onDelete }) {
    if (!data || data.length === 0) {
        return <div className="empty-state">Нет данных</div>;
    }

    return (
        <div className="table-wrapper">
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key}>{col.label}</th>
                        ))}
                        {(onEdit || onDelete) && <th>Действия</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={row.id}>
                            {columns.map((col) => (
                                <td key={col.key}>
                                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                                </td>
                            ))}
                            {(onEdit || onDelete) && (
                                <td className="actions-cell">
                                    {onEdit && (
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => onEdit(row)}
                                        >
                                            ✏️
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => onDelete(row)}
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
