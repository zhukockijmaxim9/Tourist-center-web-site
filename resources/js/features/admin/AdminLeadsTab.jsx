import React from 'react';
import LeadBoard from '../leads/LeadBoard';
import LeadStatusFilters from '../leads/LeadStatusFilters';

export default function AdminLeadsTab({
    leads,
    filteredLeads,
    query,
    onQueryChange,
    statusFilter,
    onStatusFilterChange,
    getLeadCountByStatus,
    managers,
    onStatusChange,
    onOpenContact,
    onOpenEdit,
    onConfirm,
    onDelete,
    onAssignManager,
    updatingStatusLeadId,
    claimingLeadId,
    confirmingLeadId,
    assigningLeadId,
    onOpenDetails,
}) {
    return (
        <section className="dashboard-section">
            <div className="section-header">
                <div>
                    <h2>Заявки ({filteredLeads.length})</h2>
                    <input
                        className="input input-sm"
                        placeholder="Поиск: имя, телефон, услуга..."
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        style={{ marginTop: '0.8rem', maxWidth: 520 }}
                    />
                </div>
            </div>

            <LeadStatusFilters
                currentFilter={statusFilter}
                onChange={onStatusFilterChange}
                getCount={getLeadCountByStatus}
                totalCount={leads.length}
            />

            {filteredLeads.length === 0 ? (
                <div className="empty-state">Нет заявок</div>
            ) : (
                <LeadBoard
                    leads={filteredLeads}
                    onStatusChange={onStatusChange}
                    onOpenContact={onOpenContact}
                    onOpenEdit={onOpenEdit}
                    onConfirm={onConfirm}
                    onDelete={onDelete}
                    onAssignManager={onAssignManager}
                    managers={managers}
                    showManagerInfo
                    updatingStatusLeadId={updatingStatusLeadId}
                    claimingLeadId={claimingLeadId}
                    confirmingLeadId={confirmingLeadId}
                    assigningLeadId={assigningLeadId}
                    onOpenDetails={onOpenDetails}
                />
            )}
        </section>
    );
}
