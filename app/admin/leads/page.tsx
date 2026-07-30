'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Lead, 
  LeadStatus, 
  LeadPriority, 
  ServiceCategory, 
  SERVICE_LABELS 
} from '@/lib/admin-leads-data';
import { getAllLeadsFromStore, updateLeadInStore, addLeadToStore } from '@/lib/leads-store';
import { 
  graphqlQuery, 
  QUERY_GET_LEADS, 
  MUTATION_UPDATE_LEAD_STATUS, 
  MUTATION_UPDATE_LEAD_PRIORITY, 
  MUTATION_ASSIGN_LEAD, 
  MUTATION_ADD_LEAD_NOTE 
} from '@/lib/graphql-client';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { LeadFilterBar } from '@/components/admin/LeadFilterBar';
import { LeadDataTable } from '@/components/admin/LeadDataTable';
import { LeadPipelineKanban } from '@/components/admin/LeadPipelineKanban';
import { LeadDetailDrawer } from '@/components/admin/LeadDetailDrawer';
import { Users, Cpu } from 'lucide-react';

export default function MasterLeadHubPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'all'>('all');
  const [selectedService, setSelectedService] = useState<ServiceCategory | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<LeadPriority | 'all'>('all');
  const [graphqlStatus, setGraphqlStatus] = useState<'connected' | 'loading' | 'fallback'>('loading');

  // Load leads via GraphQL query
  const loadLeadsGraphQL = useCallback(async () => {
    setGraphqlStatus('loading');
    try {
      const data = await graphqlQuery<{ leads: Lead[] }>(QUERY_GET_LEADS, {
        search: searchQuery,
        status: selectedStatus,
        service: selectedService,
        priority: selectedPriority,
      });

      if (data && data.leads) {
        setLeads(data.leads);
        setGraphqlStatus('connected');
        return;
      }
      setLeads(getAllLeadsFromStore());
      setGraphqlStatus('connected');
    } catch (err) {
      console.warn('GraphQL Query fallback to local store:', err);
      setLeads(getAllLeadsFromStore());
      setGraphqlStatus('fallback');
    }
  }, [searchQuery, selectedStatus, selectedService, selectedPriority]);

  useEffect(() => {
    loadLeadsGraphQL();
  }, [loadLeadsGraphQL]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedService('all');
    setSelectedPriority('all');
  };

  const handleQuickStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const updatedLocally = updateLeadInStore(leadId, { status: newStatus });
    if (updatedLocally) {
      setLeads(getAllLeadsFromStore());
      if (selectedLead?.id === leadId) setSelectedLead(updatedLocally);
    }

    try {
      await graphqlQuery(MUTATION_UPDATE_LEAD_STATUS, { id: leadId, status: newStatus });
    } catch (err) {
      console.error('GraphQL status mutation failed:', err);
    }
  };

  const handleUpdatePriority = async (leadId: string, priority: LeadPriority) => {
    const updatedLocally = updateLeadInStore(leadId, { priority });
    if (updatedLocally) {
      setLeads(getAllLeadsFromStore());
      if (selectedLead?.id === leadId) setSelectedLead(updatedLocally);
    }

    try {
      await graphqlQuery(MUTATION_UPDATE_LEAD_PRIORITY, { id: leadId, priority });
    } catch (err) {
      console.error('GraphQL priority mutation failed:', err);
    }
  };

  const handleAssignLead = async (leadId: string, staffName: string) => {
    const updatedLocally = updateLeadInStore(leadId, { assignedTo: staffName });
    if (updatedLocally) {
      setLeads(getAllLeadsFromStore());
      if (selectedLead?.id === leadId) setSelectedLead(updatedLocally);
    }

    try {
      await graphqlQuery(MUTATION_ASSIGN_LEAD, { id: leadId, staffName });
    } catch (err) {
      console.error('GraphQL assign lead mutation failed:', err);
    }
  };

  const handleAddNote = async (leadId: string, noteText: string) => {
    const currentTarget = leads.find((l) => l.id === leadId);
    if (!currentTarget) return;

    const newActivity = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: 'Lead Admin',
      action: 'Added internal note',
      note: noteText,
    };

    const updatedLocally = updateLeadInStore(leadId, {
      notes: [noteText, ...currentTarget.notes],
      activities: [newActivity, ...currentTarget.activities],
    });

    if (updatedLocally) {
      setLeads(getAllLeadsFromStore());
      if (selectedLead?.id === leadId) setSelectedLead(updatedLocally);
    }

    try {
      await graphqlQuery(MUTATION_ADD_LEAD_NOTE, { id: leadId, note: noteText });
    } catch (err) {
      console.error('GraphQL note mutation failed:', err);
    }
  };

  const handleExportCsv = () => {
    const headers = ['Lead ID', 'Full Name', 'Email', 'Phone', 'Company', 'Service', 'Referral Source', 'Priority', 'Status', 'Submitted At'];
    const rows = leads.map((l) => [
      l.id,
      `"${l.fullName}"`,
      l.email,
      l.phone,
      `"${l.company || ''}"`,
      SERVICE_LABELS[l.service],
      `"${l.source || l.tracking?.utmSource || 'Direct'}"`,
      l.priority,
      l.status,
      l.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EAN_Aero_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Top Bar Header */}
      <AdminHeader
        leads={leads}
        onSearchChange={setSearchQuery}
        onSelectLead={(leadId) => {
          const target = leads.find((l) => l.id === leadId);
          if (target) setSelectedLead(target);
        }}
      />

      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        
        {/* Page Title */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-ean-gold" />
              <h1 className="text-2xl font-bold font-display text-ean-white">Master Lead Hub</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                GraphQL Query API ({graphqlStatus})
              </span>
            </div>
            <p className="text-xs text-ean-muted-light mt-0.5">
              Comprehensive GraphQL-driven CRM triaging, referral source tracking, and inquiry pipeline table for EAN Aviation.
            </p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <LeadFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedService={selectedService}
          onServiceChange={setSelectedService}
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
          onResetFilters={handleResetFilters}
          onExportCsv={handleExportCsv}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Lead View (Table or Kanban) */}
        {viewMode === 'table' ? (
          <LeadDataTable
            leads={leads}
            onSelectLead={setSelectedLead}
            onQuickStatusChange={handleQuickStatusChange}
          />
        ) : (
          <LeadPipelineKanban
            leads={leads}
            onSelectLead={setSelectedLead}
            onQuickStatusChange={handleQuickStatusChange}
          />
        )}

      </main>

      {/* Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateStatus={handleQuickStatusChange}
        onUpdatePriority={handleUpdatePriority}
        onAssignLead={handleAssignLead}
        onAddNote={handleAddNote}
      />
    </div>
  );
}
