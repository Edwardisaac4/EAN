'use client';

import React from 'react';
import { Search, Filter, RefreshCw, Download, Layers } from 'lucide-react';
import { LeadStatus, ServiceCategory, LeadPriority, SERVICE_LABELS, STATUS_LABELS } from '@/lib/admin-leads-data';

export interface LeadFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus: LeadStatus | 'all';
  onStatusChange: (status: LeadStatus | 'all') => void;
  selectedService: ServiceCategory | 'all';
  onServiceChange: (service: ServiceCategory | 'all') => void;
  selectedPriority: LeadPriority | 'all';
  onPriorityChange: (priority: LeadPriority | 'all') => void;
  onResetFilters: () => void;
  onExportCsv?: () => void;
  viewMode: 'table' | 'kanban';
  onViewModeChange: (mode: 'table' | 'kanban') => void;
}

export function LeadFilterBar({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedService,
  onServiceChange,
  selectedPriority,
  onPriorityChange,
  onResetFilters,
  onExportCsv,
  viewMode,
  onViewModeChange,
}: LeadFilterBarProps) {
  const statuses: (LeadStatus | 'all')[] = ['all', 'new', 'contacted', 'qualified', 'proposal_sent', 'closed_won', 'closed_lost'];

  return (
    <div className="bg-ean-black-accent/80 border border-ean-border-dark p-4 rounded-xl space-y-3 shadow-md">
      {/* Top Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ean-muted-light/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter leads by prospect, company, ID..."
            className="w-full pl-9 pr-4 py-2 bg-ean-black-pure border border-ean-border-dark rounded-lg text-xs text-ean-white placeholder:text-ean-muted-light/40 focus:outline-none focus:border-ean-gold/60 focus:ring-1 focus:ring-ean-gold/30 transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Service Dropdown */}
          <select
            value={selectedService}
            onChange={(e) => onServiceChange(e.target.value as ServiceCategory | 'all')}
            className="px-3 py-2 bg-ean-black-pure border border-ean-border-dark rounded-lg text-xs text-ean-white focus:outline-none focus:border-ean-gold/60 cursor-pointer"
          >
            <option value="all">All Services</option>
            {Object.entries(SERVICE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Priority Dropdown */}
          <select
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value as LeadPriority | 'all')}
            className="px-3 py-2 bg-ean-black-pure border border-ean-border-dark rounded-lg text-xs text-ean-white focus:outline-none focus:border-ean-gold/60 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent Priority</option>
            <option value="high">High Priority</option>
            <option value="normal">Standard Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Reset Filters */}
          <button
            onClick={onResetFilters}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-ean-muted-light hover:text-ean-white transition-colors"
            title="Reset Filters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* View Toggle (Table / Kanban) */}
          <div className="flex items-center bg-ean-black-pure p-1 rounded-lg border border-ean-border-dark">
            <button
              onClick={() => onViewModeChange('table')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-ean-gold text-ean-black shadow' : 'text-ean-muted-light hover:text-ean-white'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => onViewModeChange('kanban')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                viewMode === 'kanban' ? 'bg-ean-gold text-ean-black shadow' : 'text-ean-muted-light hover:text-ean-white'
              }`}
            >
              Pipeline Board
            </button>
          </div>

          {/* Export CSV CTA */}
          {onExportCsv && (
            <button
              onClick={onExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-ean-border-dark text-xs text-ean-white hover:border-ean-gold/40 transition-all font-medium"
            >
              <Download className="w-3.5 h-3.5 text-ean-gold" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Pills Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-ean-border-dark/50">
        <span className="text-[11px] font-semibold text-ean-muted-light/60 uppercase tracking-wider mr-2 flex items-center gap-1">
          <Filter className="w-3 h-3 text-ean-gold" />
          Status:
        </span>
        {statuses.map((st) => {
          const isActive = selectedStatus === st;
          const label = st === 'all' ? 'All Leads' : STATUS_LABELS[st];

          return (
            <button
              key={st}
              onClick={() => onStatusChange(st)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-ean-gold text-ean-black font-semibold shadow-md'
                  : 'bg-white/5 text-ean-muted-light hover:bg-white/10 hover:text-ean-white border border-transparent'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
