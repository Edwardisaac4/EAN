'use client';

import React from 'react';
import {
  buildLeadMailtoHref,
  Lead,
  LeadStatus,
  LeadPriority,
  SERVICE_LABELS,
  STATUS_LABELS
} from '@/lib/admin-leads-data';
import { 
  Eye, 
  Mail, 
  Building2, 
  Clock, 
  AlertCircle, 
  Globe
} from 'lucide-react';

export interface LeadDataTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onQuickStatusChange: (leadId: string, newStatus: LeadStatus) => void;
}

export function LeadDataTable({ leads, onSelectLead, onQuickStatusChange }: LeadDataTableProps) {
  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'contacted':
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      case 'qualified':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'proposal_sent':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'closed_won':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'closed_lost':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityBadge = (priority: LeadPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse';
      case 'high':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'normal':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'low':
        return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
    }
  };

  const getSourceBadge = (source: string, tracking?: Lead['tracking']) => {
    const s = (source || tracking?.utmSource || 'direct').toLowerCase();
    if (s.includes('google') || s.includes('ad')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (s.includes('linkedin') || s.includes('social')) {
      return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    }
    if (s.includes('email') || s.includes('newsletter')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    return 'bg-white/5 text-ean-gold/80 border-white/10';
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (leads.length === 0) {
    return (
      <div className="p-12 text-center bg-ean-black-accent/60 border border-ean-border-dark rounded-xl">
        <AlertCircle className="w-10 h-10 text-ean-gold/50 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-ean-white">No Leads Found</h4>
        <p className="text-xs text-ean-muted-light mt-1">
          No inquiry records matched your active filter criteria. Try clearing search or status filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-ean-black-accent/90 border border-ean-border-dark rounded-xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-ean-black-pure/80 border-b border-ean-border-dark text-ean-muted-light/70 uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-4">Lead ID & Prospect</th>
              <th className="py-3.5 px-4">Service Category</th>
              <th className="py-3.5 px-4">Referral Source</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Submitted</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ean-border-dark/60 text-ean-white font-ui">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className="hover:bg-white/3 transition-colors cursor-pointer group"
              >
                {/* ID & Prospect */}
                <td className="py-4 px-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-ean-navy/60 border border-ean-gold/30 flex items-center justify-center font-bold text-ean-gold text-xs shrink-0 group-hover:border-ean-gold transition-colors">
                      {lead.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ean-white text-sm group-hover:text-ean-gold transition-colors">
                          {lead.fullName}
                        </span>
                        <span className="font-mono text-[10px] text-ean-muted-light/60">
                          {lead.leadCode ?? lead.id}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-ean-muted-light">
                        {lead.company && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-ean-gold/70" />
                            {lead.company}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-ean-muted-light/70" />
                          {lead.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Service */}
                <td className="py-4 px-4 font-medium">
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-ean-gold-light text-[11px]">
                    {SERVICE_LABELS[lead.service]}
                  </span>
                </td>

                {/* Referral Source */}
                <td className="py-4 px-4 font-medium">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border ${getSourceBadge(lead.source, lead.tracking)}`}>
                    <Globe className="w-3 h-3 opacity-70" />
                    {lead.source || lead.tracking?.utmSource || 'Direct Visit'}
                  </span>
                </td>

                {/* Priority */}
                <td className="py-4 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getPriorityBadge(lead.priority)}`}>
                    {lead.priority}
                  </span>
                </td>

                {/* Status Selector */}
                <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={lead.status}
                    onChange={(e) => onQuickStatusChange(lead.id, e.target.value as LeadStatus)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer focus:outline-none transition-colors ${getStatusBadge(lead.status)}`}
                  >
                    {Object.entries(STATUS_LABELS).map(([stKey, label]) => (
                      <option key={stKey} value={stKey} className="bg-ean-black-pure text-ean-white">
                        {label}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Date */}
                <td className="py-4 px-4 text-ean-muted-light text-[11px]">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3 h-3 text-ean-muted-light/60" />
                    {formatDate(lead.createdAt)}
                  </div>
                </td>

                {/* Actions */}
                <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onSelectLead(lead)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-ean-gold/20 text-ean-muted-light hover:text-ean-gold transition-colors"
                      title="Inspect Full Lead Details & Acquisition Intelligence"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={buildLeadMailtoHref(lead, { reply: true })}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-ean-gold/20 text-ean-muted-light hover:text-ean-gold transition-colors"
                      title="Email Lead"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
