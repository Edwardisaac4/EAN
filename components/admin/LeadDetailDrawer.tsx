'use client';

import React, { useState } from 'react';
import { 
  Lead, 
  LeadStatus, 
  LeadPriority, 
  SERVICE_LABELS, 
  STATUS_LABELS 
} from '@/lib/admin-leads-data';
import { 
  X, 
  Mail, 
  Building2, 
  Clock, 
  MessageSquare, 
  Sparkles,
  Globe,
  Compass,
  Monitor,
  ExternalLink,
  Tag
} from 'lucide-react';

export interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateStatus: (leadId: string, status: LeadStatus) => void;
  onUpdatePriority: (leadId: string, priority: LeadPriority) => void;
  onAssignLead: (leadId: string, staffName: string) => void;
  onAddNote: (leadId: string, noteText: string) => void;
}

export function LeadDetailDrawer({
  lead,
  onClose,
  onUpdateStatus,
  onUpdatePriority,
  onAssignLead,
  onAddNote,
}: LeadDetailDrawerProps) {
  const [newNote, setNewNote] = useState('');
  const [copied, setCopied] = useState(false);

  if (!lead) return null;

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(lead.id, newNote.trim());
    setNewNote('');
  };

  const copyContact = () => {
    navigator.clipboard.writeText(`${lead.fullName} <${lead.email}> ${lead.phone}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const staffMembers = [
    'Unassigned',
    'Babajide S. (Sales)',
    'FBO Dispatch Desk',
    'Engr. Kayode MRO',
    'Facilities & Leasing Dept',
    'Wings™ Catering Manager',
    'Executive Office',
  ];

  const tracking = lead.tracking;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-6 md:pl-10">
        <div className="w-screen max-w-full sm:max-w-lg md:max-w-xl bg-ean-black-pure border-l border-ean-gold/30 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-ean-border-dark bg-ean-black-accent flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-ean-navy border border-ean-gold/50 flex items-center justify-center font-bold text-ean-gold text-lg">
                {lead.fullName.charAt(0)}
              </div>
              <div>
                <span className="font-mono text-[10px] text-ean-gold font-bold uppercase tracking-wider block">
                  {lead.id} · {lead.source}
                </span>
                <h2 className="text-xl font-bold font-display text-ean-white">
                  {lead.fullName}
                </h2>
                {lead.company && (
                  <p className="text-xs text-ean-muted-light flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3 text-ean-gold" />
                    {lead.company}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-ean-muted-light hover:text-ean-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Quick Actions Bar */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-ean-black-accent border border-ean-border-dark">
              <a
                href={`mailto:${lead.email}?subject=EAN Aviation Inquiry (${lead.id})`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-ean-gold hover:bg-ean-gold-light text-ean-black font-semibold text-xs transition-all"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Reply Email</span>
              </a>
              <button
                onClick={copyContact}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-ean-white text-xs font-medium border border-ean-border-dark transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-ean-gold" />
                <span>{copied ? 'Copied Details!' : 'Copy Info'}</span>
              </button>
            </div>

            {/* Status & Priority Controls */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-ean-black-accent border border-ean-border-dark">
              <div>
                <label className="text-[10px] font-semibold text-ean-muted-light/70 uppercase tracking-wider block mb-1.5">
                  Pipeline Stage
                </label>
                <select
                  value={lead.status}
                  onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                  className="w-full px-3 py-2 bg-ean-black-pure border border-ean-gold/30 rounded-lg text-xs text-ean-white font-medium focus:outline-none focus:border-ean-gold"
                >
                  {Object.entries(STATUS_LABELS).map(([stKey, label]) => (
                    <option key={stKey} value={stKey}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-ean-muted-light/70 uppercase tracking-wider block mb-1.5">
                  Lead Priority
                </label>
                <select
                  value={lead.priority}
                  onChange={(e) => onUpdatePriority(lead.id, e.target.value as LeadPriority)}
                  className="w-full px-3 py-2 bg-ean-black-pure border border-ean-border-dark rounded-lg text-xs text-ean-white font-medium focus:outline-none focus:border-ean-gold"
                >
                  <option value="urgent">Urgent (SLA &lt; 1h)</option>
                  <option value="high">High Priority</option>
                  <option value="normal">Standard Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>

            {/* Service & Staff Assignment */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-white/5 border border-ean-border-dark">
                <span className="text-[10px] text-ean-muted-light uppercase tracking-wider font-semibold block">
                  Service Category
                </span>
                <span className="text-xs font-semibold text-ean-gold mt-1 block">
                  {SERVICE_LABELS[lead.service]}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-ean-border-dark">
                <span className="text-[10px] text-ean-muted-light uppercase tracking-wider font-semibold block mb-1">
                  Assigned Team
                </span>
                <select
                  value={lead.assignedTo || 'Unassigned'}
                  onChange={(e) => onAssignLead(lead.id, e.target.value)}
                  className="w-full bg-transparent text-xs font-medium text-ean-white focus:outline-none cursor-pointer"
                >
                  {staffMembers.map((s) => (
                    <option key={s} value={s} className="bg-ean-black-pure text-ean-white">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Acquisition Intelligence Panel */}
            <div className="p-4 rounded-xl bg-linear-to-b from-ean-navy/40 to-ean-black-accent border border-ean-gold/30 space-y-3">
              <div className="flex items-center justify-between border-b border-ean-border-dark pb-2">
                <span className="text-xs font-bold text-ean-gold flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-ean-gold" />
                  Acquisition Intelligence & Tracking
                </span>
                <span className="text-[10px] font-mono text-ean-muted-light">
                  {tracking?.capturedAt ? new Date(tracking.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Session Tracked'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-ean-muted-light block">UTM Source / Medium</span>
                  <span className="font-semibold text-ean-white font-mono flex items-center gap-1 mt-0.5">
                    <Globe className="w-3 h-3 text-ean-gold shrink-0" />
                    {tracking?.utmSource || 'Direct'} / {tracking?.utmMedium || 'None'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-ean-muted-light block">UTM Campaign</span>
                  <span className="font-semibold text-ean-gold font-mono flex items-center gap-1 mt-0.5">
                    <Tag className="w-3 h-3 shrink-0" />
                    {tracking?.utmCampaign || 'None'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-ean-muted-light block">Referrer Website</span>
                  {tracking?.referrerUrl ? (
                    <a
                      href={tracking.referrerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-sky-400 hover:underline flex items-center gap-1 truncate mt-0.5"
                    >
                      {tracking.referrerDomain || 'External Link'}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="font-mono text-ean-muted-light">Direct Visit</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-ean-muted-light block">Landing → Form Page</span>
                  <span className="font-mono text-ean-white truncate block mt-0.5">
                    {tracking?.landingPage || '/'} → {tracking?.formPage || '/contact'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-ean-muted-light block">Device & Browser</span>
                  <span className="font-mono text-ean-white flex items-center gap-1 mt-0.5">
                    <Monitor className="w-3 h-3 text-ean-gold shrink-0" />
                    <span className="capitalize">{tracking?.deviceType || 'Desktop'}</span> · {tracking?.browserName || 'Browser'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-ean-muted-light block">Search Keywords</span>
                  <span className="font-mono text-ean-muted-light italic truncate block mt-0.5">
                    {tracking?.utmTerm ? `"${tracking.utmTerm}"` : 'Not provided'}
                  </span>
                </div>
              </div>
            </div>

            {/* Original Submitted Message */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-ean-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-ean-gold" />
                Submitted Inquiry Message
              </span>
              <div className="p-4 rounded-xl bg-ean-navy-mid/40 border border-ean-gold/20 text-xs text-ean-white leading-relaxed font-ui whitespace-pre-wrap">
                {`"${lead.message}"`}
              </div>
            </div>

            {/* Contact Details Grid */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-ean-white">Prospect Details</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-ean-black-accent border border-ean-border-dark">
                  <span className="text-[10px] text-ean-muted-light block mb-1">Email Address</span>
                  <a href={`mailto:${lead.email}`} className="text-ean-gold hover:underline font-mono">
                    {lead.email}
                  </a>
                </div>
                <div className="p-3 rounded-lg bg-ean-black-accent border border-ean-border-dark">
                  <span className="text-[10px] text-ean-muted-light block mb-1">Phone Number</span>
                  <a href={`tel:${lead.phone}`} className="text-ean-gold hover:underline font-mono">
                    {lead.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Internal Notes & Comments */}
            <div className="space-y-3 pt-2 border-t border-ean-border-dark">
              <span className="text-xs font-semibold text-ean-white flex items-center justify-between">
                <span>Internal Staff Notes ({lead.notes.length})</span>
              </span>

              {lead.notes.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {lead.notes.map((note, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white/5 border border-ean-border-dark text-xs text-ean-white">
                      {note}
                    </div>
                  ))}
                </div>
              )}

              {/* Add Note Form */}
              <form onSubmit={handleAddNoteSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add internal note..."
                  className="flex-1 px-3 py-1.5 bg-ean-black-accent border border-ean-border-dark rounded-lg text-xs text-ean-white focus:outline-none focus:border-ean-gold"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-ean-gold text-ean-black font-semibold text-xs rounded-lg hover:bg-ean-gold-light transition-all"
                >
                  Add Note
                </button>
              </form>
            </div>

            {/* Activity History Audit Trail */}
            <div className="space-y-3 pt-2 border-t border-ean-border-dark">
              <span className="text-xs font-semibold text-ean-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-ean-gold" />
                Audit Trail & Activity Log ({lead.activities.length})
              </span>

              <div className="space-y-3 pl-2 border-l-2 border-ean-gold/30">
                {lead.activities.map((act) => (
                  <div key={act.id} className="relative pl-3 text-xs space-y-0.5">
                    <div className="w-2 h-2 rounded-full bg-ean-gold absolute -left-4.25 top-1" />
                    <div className="flex items-center justify-between text-ean-muted-light text-[10px]">
                      <span className="font-semibold text-ean-gold-light">{act.author}</span>
                      <span className="font-mono">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-ean-white font-medium">{act.action}</p>
                    {act.note && (
                      <p className="text-ean-muted-light italic bg-white/5 p-2 rounded text-[11px] mt-1">
                        {`"${act.note}"`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
