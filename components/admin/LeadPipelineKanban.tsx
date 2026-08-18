'use client';

import React from 'react';
import { Lead, LeadStatus, SERVICE_LABELS } from '@/lib/admin-leads-data';
import { Building2, Eye } from 'lucide-react';

export interface LeadPipelineKanbanProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onQuickStatusChange: (leadId: string, newStatus: LeadStatus) => void;
}

export function LeadPipelineKanban({
  leads,
  onSelectLead,
}: LeadPipelineKanbanProps) {
  const columns: { status: LeadStatus; title: string; color: string }[] = [
    { status: 'new', title: 'New Leads', color: 'border-sky-500 text-sky-400 bg-sky-500/10' },
    { status: 'contacted', title: 'In Contact', color: 'border-indigo-500 text-indigo-400 bg-indigo-500/10' },
    { status: 'qualified', title: 'Qualified', color: 'border-purple-500 text-purple-400 bg-purple-500/10' },
    { status: 'proposal_sent', title: 'Proposal Sent', color: 'border-amber-500 text-amber-400 bg-amber-500/10' },
    { status: 'closed_won', title: 'Closed (Won)', color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10' },
  ];

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-500 animate-pulse';
      case 'high':
        return 'bg-amber-500';
      default:
        return 'bg-blue-400';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const columnLeads = leads.filter((l) => l.status === col.status);
        const columnValue = columnLeads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0);

        return (
          <div
            key={col.status}
            className="bg-ean-black-accent/60 border border-ean-border-dark rounded-xl p-3.5 flex flex-col min-w-65 max-h-[75vh]"
          >
            {/* Column Header */}
            <div className={`p-2.5 rounded-lg border ${col.color} mb-3 flex items-center justify-between`}>
              <span className="font-semibold text-xs">{col.title}</span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 font-bold text-[10px]">
                {columnLeads.length}
              </span>
            </div>

            {/* Column Pipeline Value */}
            {columnValue > 0 && (
              <div className="text-[10px] text-ean-gold-light/80 font-mono text-center pb-2 mb-2 border-b border-ean-border-dark/50">
                Pipeline: ${columnValue.toLocaleString()}
              </div>
            )}

            {/* Lead Cards Container */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {columnLeads.length === 0 ? (
                <div className="p-4 text-center text-ean-muted-light/40 text-[11px] border border-dashed border-ean-border-dark rounded-lg">
                  No leads in this stage
                </div>
              ) : (
                columnLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="p-3.5 rounded-xl bg-ean-black-pure border border-ean-border-dark hover:border-ean-gold/50 transition-all cursor-pointer group shadow-md space-y-2 relative"
                  >
                    {/* Priority indicator dot */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-ean-gold font-semibold">
                        {lead.leadCode ?? lead.id}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] text-ean-muted-light">
                        <span className={`w-2 h-2 rounded-full ${getPriorityDot(lead.priority)}`} />
                        {lead.priority}
                      </span>
                    </div>

                    {/* Prospect Name & Company */}
                    <div>
                      <h4 className="text-xs font-bold text-ean-white group-hover:text-ean-gold transition-colors">
                        {lead.fullName}
                      </h4>
                      {lead.company && (
                        <p className="text-[11px] text-ean-muted-light flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-ean-gold/70" />
                          {lead.company}
                        </p>
                      )}
                    </div>

                    {/* Service Tag */}
                    <div className="text-[10px] font-medium text-ean-gold-light bg-ean-navy/40 px-2 py-0.5 rounded border border-ean-gold/20 inline-block">
                      {SERVICE_LABELS[lead.service]}
                    </div>

                    {/* Footer / Advance Stage */}
                    <div className="flex items-center justify-between pt-2 border-t border-ean-border-dark/60 text-[10px]">
                      <span className="text-ean-muted-light/60 font-mono">
                        {new Date(lead.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLead(lead);
                        }}
                        className="p-1 rounded bg-white/5 hover:bg-ean-gold/20 text-ean-muted-light hover:text-ean-gold"
                        title="View Lead Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
