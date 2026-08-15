'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Lead, 
  LeadStatus, 
  LeadPriority, 
  ServiceCategory, 
  SERVICE_LABELS 
} from '@/lib/admin-leads-data';
import {
  graphqlQuery,
  QUERY_GET_LEADS,
  MUTATION_UPDATE_LEAD_STATUS,
  MUTATION_UPDATE_LEAD_PRIORITY,
  MUTATION_ASSIGN_LEAD,
  MUTATION_ADD_LEAD_NOTE,
  type LeadsQueryResult,
} from '@/lib/graphql-client';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { LeadFilterBar } from '@/components/admin/LeadFilterBar';
import { LeadDataTable } from '@/components/admin/LeadDataTable';
import { LeadPipelineKanban } from '@/components/admin/LeadPipelineKanban';
import { LeadDetailDrawer } from '@/components/admin/LeadDetailDrawer';
import { Users, Cpu, ShieldAlert } from 'lucide-react';

const SEARCH_DEBOUNCE_MS = 350;

/**
 * Serialises one CSV cell: quotes it, escapes embedded quotes, and neutralises
 * values a spreadsheet would evaluate as a formula.
 */
const csvCell = (value: string | number | null | undefined): string => {
  const text = value === null || value === undefined ? '' : String(value);
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

export default function MasterLeadHubPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'all'>('all');
  const [selectedService, setSelectedService] = useState<ServiceCategory | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<LeadPriority | 'all'>('all');
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  // Search runs server-side, so keystrokes are debounced into a single query
  // rather than one request per character.
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Leads come from Supabase via the admin lead API. There is deliberately no
  // local fallback: showing stale or mock rows in a CRM is worse than showing the
  // error, because the team cannot tell the difference.
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      try {
        const data = await graphqlQuery<LeadsQueryResult>(
          QUERY_GET_LEADS,
          {
            search: debouncedSearch,
            status: selectedStatus,
            service: selectedService,
            priority: selectedPriority,
          },
          { signal: controller.signal }
        );
        if (cancelled) return;

        const fetched = data.leads ?? [];
        setLeads(fetched);
        setLoadState('ready');
        setLoadError(null);
        // Keep an open detail drawer in sync with the refreshed record.
        setSelectedLead((current) =>
          current ? fetched.find((l) => l.id === current.id) ?? current : current
        );
      } catch (err) {
        if (cancelled) return;
        setLeads([]);
        setLoadState('error');
        setLoadError(err instanceof Error ? err.message : 'Could not load leads.');
      }
    }

    load();

    // Guards against out-of-order responses when filters change rapidly, and
    // drops the in-flight request so a superseded query cannot land late.
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [debouncedSearch, selectedStatus, selectedService, selectedPriority, refreshToken]);

  /**
   * Runs a mutation against the database, then triggers a refetch so the table
   * reflects what was actually persisted rather than an optimistic guess.
   */
  const runMutation = useCallback(
    async (document: string, variables: Record<string, unknown>) => {
      try {
        await graphqlQuery(document, variables);
        setRefreshToken((token) => token + 1);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Update failed.');
      }
    },
    []
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedService('all');
    setSelectedPriority('all');
  };

  const handleQuickStatusChange = (leadId: string, newStatus: LeadStatus) =>
    runMutation(MUTATION_UPDATE_LEAD_STATUS, { id: leadId, status: newStatus });

  const handleUpdatePriority = (leadId: string, priority: LeadPriority) =>
    runMutation(MUTATION_UPDATE_LEAD_PRIORITY, { id: leadId, priority });

  const handleAssignLead = (leadId: string, staffName: string) =>
    runMutation(MUTATION_ASSIGN_LEAD, { id: leadId, staffName });

  const handleAddNote = (leadId: string, noteText: string) =>
    runMutation(MUTATION_ADD_LEAD_NOTE, { id: leadId, note: noteText });

  const handleExportCsv = () => {
    const headers = ['Lead Code', 'Full Name', 'Email', 'Phone', 'Company', 'Service', 'Referral Source', 'Priority', 'Status', 'Submitted At'];
    const rows = leads.map((l) => [
      l.leadCode ?? l.id,
      l.fullName,
      l.email,
      l.phone,
      l.company || '',
      SERVICE_LABELS[l.service],
      l.source || l.tracking?.utmSource || 'Direct',
      l.priority,
      l.status,
      l.createdAt,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(csvCell).join(','))
      .join('\r\n');

    // A Blob URL keeps commas, quotes, and non-ASCII names intact; encodeURI on
    // a data: URI mangled them and broke on larger exports.
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EAN_Aero_Leads_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
                Live database ({loadState})
              </span>
            </div>
            <p className="text-xs text-ean-muted-light mt-0.5">
              CRM triaging, referral source tracking, and inquiry pipeline for EAN Aviation — read live from the leads database.
            </p>
          </div>
        </div>

        {loadError && (
          <div
            role="alert"
            className="flex items-start gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs text-rose-300"
          >
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Could not reach the leads database</p>
              <p className="text-rose-300/80 mt-0.5">{loadError}</p>
            </div>
          </div>
        )}

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
