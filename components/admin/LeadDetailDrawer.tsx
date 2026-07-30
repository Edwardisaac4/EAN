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
  Tag,
  Share2,
  Send,
  CheckCircle2,
  UserCheck,
  AlertTriangle
} from 'lucide-react';

export interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateStatus: (leadId: string, status: LeadStatus) => void;
  onUpdatePriority: (leadId: string, priority: LeadPriority) => void;
  onAssignLead: (leadId: string, staffName: string) => void;
  onAddNote: (leadId: string, noteText: string) => void;
}

interface StaffPreset {
  name: string;
  email: string;
}

const STAFF_PRESETS: StaffPreset[] = [
  { name: 'Sales & Charter Desk', email: 'sales@ean.aero' },
  { name: 'FBO Ground Dispatch', email: 'fbo@ean.aero' },
  { name: 'Engr. Kayode (MRO Dept)', email: 'mro@ean.aero' },
  { name: 'Wings™ Catering Manager', email: 'catering@ean.aero' },
  { name: 'Leasing & Hangar Office', email: 'leasing@ean.aero' },
  { name: 'Executive Operations Desk', email: 'ops@ean.aero' },
];

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
  
  // Forward / Redirect Modal Form State
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [selectedStaffEmail, setSelectedStaffEmail] = useState(STAFF_PRESETS[0].email);
  const [customRecipientEmail, setCustomRecipientEmail] = useState('');
  const [redirectNote, setRedirectNote] = useState('');
  const [isForwarding, setIsForwarding] = useState(false);
  const [forwardSuccessMessage, setForwardSuccessMessage] = useState<string | null>(null);
  const [forwardErrorMessage, setForwardErrorMessage] = useState<string | null>(null);

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

  // Handle Lead Forwarding via POST /api/admin/leads/forward
  const handleExecuteForward = async (e: React.FormEvent) => {
    e.preventDefault();
    const recipientEmail = customRecipientEmail.trim() || selectedStaffEmail;
    if (!recipientEmail) return;

    setIsForwarding(true);
    setForwardSuccessMessage(null);
    setForwardErrorMessage(null);

    const presetMatch = STAFF_PRESETS.find((s) => s.email === recipientEmail);
    const recipientName = presetMatch ? presetMatch.name : recipientEmail;

    try {
      const response = await fetch('/api/admin/leads/forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          leadCode: lead.id,
          clientName: lead.fullName,
          clientEmail: lead.email,
          clientPhone: lead.phone,
          clientCompany: lead.company,
          serviceName: SERVICE_LABELS[lead.service] || lead.service,
          message: lead.message,
          recipientEmail,
          recipientName,
          note: redirectNote.trim() || undefined,
          senderName: 'Admin Desk',
        }),
      });

      const resData = await response.json().catch(() => null);

      if (!response.ok || !resData?.success) {
        const errorMsg = resData?.error || `Request failed (${response.status})`;
        setForwardErrorMessage(errorMsg);
        return;
      }

      onAssignLead(lead.id, recipientName);
      onAddNote(
        lead.id,
        `Lead redirected & forwarded email to ${recipientName} (${recipientEmail})${
          redirectNote ? `. Note: "${redirectNote.trim()}"` : ''
        }`
      );
      setForwardSuccessMessage(`Lead summary forwarded to ${recipientName}`);
      setTimeout(() => {
        setShowRedirectModal(false);
        setForwardSuccessMessage(null);
        setRedirectNote('');
        setCustomRecipientEmail('');
      }, 2000);
    } catch (err) {
      console.error('Error forwarding lead email:', err);
      setForwardErrorMessage('Network error forwarding lead email.');
    } finally {
      setIsForwarding(false);
    }
  };

  const tracking = lead.tracking;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-6 md:pl-10">
        <div className="w-screen max-w-full sm:max-w-xl md:max-w-2xl bg-ean-black-pure border-l border-ean-gold/30 shadow-2xl flex flex-col justify-between overflow-hidden">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-ean-border-dark bg-ean-black-accent flex items-start justify-between min-w-0">
            <div className="flex items-center gap-3 min-w-0 pr-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-ean-navy border border-ean-gold/50 flex items-center justify-center font-bold text-ean-gold text-lg shrink-0">
                {lead.fullName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] text-ean-gold font-bold uppercase tracking-wider block">
                    {lead.id}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-ean-muted-light">
                    {lead.source}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-display text-ean-white truncate mt-0.5">
                  {lead.fullName}
                </h2>
                {lead.company && (
                  <p className="text-xs text-ean-muted-light flex items-center gap-1 mt-0.5 truncate">
                    <Building2 className="w-3 h-3 text-ean-gold shrink-0" />
                    <span className="truncate">{lead.company}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-ean-muted-light hover:text-ean-white transition-colors shrink-0"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 min-w-0">
            
            {/* Quick Actions Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-2.5 rounded-xl bg-ean-black-accent border border-ean-border-dark">
              <a
                href={`mailto:${lead.email}?subject=EAN Aviation Inquiry (${lead.id})`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-ean-gold hover:bg-ean-gold-light text-ean-black font-semibold text-xs transition-all text-center"
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>Reply Email</span>
              </a>

              <button
                onClick={() => setShowRedirectModal(!showRedirectModal)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-semibold text-xs border border-indigo-500/40 transition-all text-center"
              >
                <Share2 className="w-3.5 h-3.5 shrink-0" />
                <span>Redirect / Forward</span>
              </button>

              <button
                onClick={copyContact}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-ean-white text-xs font-medium border border-ean-border-dark transition-all text-center"
              >
                <Sparkles className="w-3.5 h-3.5 text-ean-gold shrink-0" />
                <span>{copied ? 'Copied Details!' : 'Copy Info'}</span>
              </button>
            </div>

            {/* Redirect / Forward Panel */}
            {showRedirectModal && (
              <form onSubmit={handleExecuteForward} className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/40 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-indigo-400" />
                    Redirect & Forward Lead Email to Staff / Sales
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRedirectModal(false)}
                    className="text-xs text-indigo-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-indigo-200/70 font-semibold uppercase block mb-1">
                      Select Department / Staff Preset
                    </label>
                    <select
                      value={selectedStaffEmail}
                      onChange={(e) => {
                        setSelectedStaffEmail(e.target.value);
                        setCustomRecipientEmail('');
                      }}
                      className="w-full px-3 py-2 bg-ean-black-pure border border-indigo-500/40 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-400"
                    >
                      {STAFF_PRESETS.map((s) => (
                        <option key={s.email} value={s.email}>
                          {s.name} ({s.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-indigo-200/70 font-semibold uppercase block mb-1">
                      Or Custom Recipient Email
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. rep@ean.aero"
                      value={customRecipientEmail}
                      onChange={(e) => setCustomRecipientEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-ean-black-pure border border-indigo-500/40 rounded-lg text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-indigo-200/70 font-semibold uppercase block mb-1">
                    Internal Handoff Note for Recipient
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Client requested urgent Global 7500 charter quote for Friday..."
                    value={redirectNote}
                    onChange={(e) => setRedirectNote(e.target.value)}
                    className="w-full px-3 py-2 bg-ean-black-pure border border-indigo-500/40 rounded-lg text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-400"
                  />
                </div>

                {forwardSuccessMessage ? (
                  <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{forwardSuccessMessage}</span>
                  </div>
                ) : forwardErrorMessage ? (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{forwardErrorMessage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForwardErrorMessage(null)}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 text-white/70 text-xs rounded-lg transition-all cursor-pointer"
                    >
                      Dismiss & Retry
                    </button>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={isForwarding}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isForwarding ? (
                      <span>Dispatching Lead Email via Resend...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Forward Lead Notification & Reassign</span>
                      </>
                    )}
                  </button>
                )}
              </form>
            )}

            {/* Status & Priority Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-ean-black-accent border border-ean-border-dark">
              <div>
                <label className="text-[10px] font-semibold text-ean-muted-light/70 uppercase tracking-wider block mb-1.5">
                  Pipeline Stage
                </label>
                <select
                  value={lead.status}
                  onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                  className="w-full px-3 py-2 bg-ean-black-pure border border-ean-gold/40 rounded-lg text-xs text-ean-white font-medium focus:outline-none focus:border-ean-gold cursor-pointer"
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
                  className="w-full px-3 py-2 bg-ean-black-pure border border-ean-border-dark rounded-lg text-xs text-ean-white font-medium focus:outline-none focus:border-ean-gold cursor-pointer"
                >
                  <option value="urgent">Urgent (SLA &lt; 1h)</option>
                  <option value="high">High Priority</option>
                  <option value="normal">Standard Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>

            {/* Service & Staff Assignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-white/5 border border-ean-border-dark min-w-0">
                <span className="text-[10px] text-ean-muted-light uppercase tracking-wider font-semibold block">
                  Service Category
                </span>
                <span className="text-xs font-semibold text-ean-gold mt-1 block truncate">
                  {SERVICE_LABELS[lead.service] || lead.service}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-ean-border-dark min-w-0">
                <span className="text-[10px] text-ean-muted-light uppercase tracking-wider font-semibold block mb-1 flex items-center justify-between">
                  <span>Assigned Team</span>
                  <UserCheck className="w-3 h-3 text-ean-gold" />
                </span>
                <span className="text-xs font-medium text-ean-white block truncate">
                  {lead.assignedTo || 'Unassigned (Marketing Desk)'}
                </span>
              </div>
            </div>

            {/* Original Submitted Message */}
            <div className="space-y-2 min-w-0">
              <span className="text-xs font-semibold text-ean-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-ean-gold shrink-0" />
                Submitted Inquiry Message
              </span>
              <div className="p-4 rounded-xl bg-ean-navy-mid/40 border border-ean-gold/20 text-xs text-ean-white leading-relaxed font-ui whitespace-pre-wrap break-words overflow-hidden">
                {lead.message ? `"${lead.message}"` : 'No message body provided.'}
              </div>
            </div>

            {/* Contact Details Grid */}
            <div className="space-y-2 min-w-0">
              <span className="text-xs font-semibold text-ean-white">Prospect Details</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-ean-black-accent border border-ean-border-dark min-w-0">
                  <span className="text-[10px] text-ean-muted-light block mb-1">Email Address</span>
                  <a 
                    href={`mailto:${lead.email}`} 
                    className="text-ean-gold hover:underline font-mono break-all block"
                  >
                    {lead.email}
                  </a>
                </div>
                <div className="p-3 rounded-lg bg-ean-black-accent border border-ean-border-dark min-w-0">
                  <span className="text-[10px] text-ean-muted-light block mb-1">Phone Number</span>
                  <a 
                    href={`tel:${lead.phone}`} 
                    className="text-ean-gold hover:underline font-mono break-all block"
                  >
                    {lead.phone || 'Not provided'}
                  </a>
                </div>
              </div>
            </div>

            {/* Acquisition Intelligence Panel */}
            <div className="p-4 rounded-xl bg-linear-to-b from-ean-navy/40 to-ean-black-accent border border-ean-gold/30 space-y-3 min-w-0">
              <div className="flex items-center justify-between border-b border-ean-border-dark pb-2">
                <span className="text-xs font-bold text-ean-gold flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-ean-gold shrink-0" />
                  Acquisition Intelligence & Tracking
                </span>
                <span className="text-[10px] font-mono text-ean-muted-light shrink-0">
                  {tracking?.capturedAt ? new Date(tracking.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Tracked'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs min-w-0">
                <div className="min-w-0">
                  <span className="text-[10px] text-ean-muted-light block">UTM Source / Medium</span>
                  <span className="font-semibold text-ean-white font-mono flex items-center gap-1 mt-0.5 truncate">
                    <Globe className="w-3 h-3 text-ean-gold shrink-0" />
                    <span className="truncate">{tracking?.utmSource || 'Direct'} / {tracking?.utmMedium || 'None'}</span>
                  </span>
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] text-ean-muted-light block">UTM Campaign</span>
                  <span className="font-semibold text-ean-gold font-mono flex items-center gap-1 mt-0.5 truncate">
                    <Tag className="w-3 h-3 shrink-0" />
                    <span className="truncate">{tracking?.utmCampaign || 'None'}</span>
                  </span>
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] text-ean-muted-light block">Referrer Website</span>
                  {tracking?.referrerUrl ? (
                    <a
                      href={tracking.referrerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-sky-400 hover:underline flex items-center gap-1 truncate mt-0.5"
                    >
                      <span className="truncate">{tracking.referrerDomain || 'External Link'}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="font-mono text-ean-muted-light block">Direct Visit</span>
                  )}
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] text-ean-muted-light block">Landing → Form Page</span>
                  <span className="font-mono text-ean-white truncate block mt-0.5">
                    {tracking?.landingPage || '/'} → {tracking?.formPage || '/contact'}
                  </span>
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] text-ean-muted-light block">Device & Browser</span>
                  <span className="font-mono text-ean-white flex items-center gap-1 mt-0.5 truncate">
                    <Monitor className="w-3 h-3 text-ean-gold shrink-0" />
                    <span className="capitalize truncate">{tracking?.deviceType || 'Desktop'} · {tracking?.browserName || 'Browser'}</span>
                  </span>
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] text-ean-muted-light block">Search Keywords</span>
                  <span className="font-mono text-ean-muted-light italic truncate block mt-0.5">
                    {tracking?.utmTerm ? `"${tracking.utmTerm}"` : 'Not provided'}
                  </span>
                </div>
              </div>
            </div>

            {/* Internal Notes & Comments */}
            <div className="space-y-3 pt-2 border-t border-ean-border-dark min-w-0">
              <span className="text-xs font-semibold text-ean-white flex items-center justify-between">
                <span>Internal Staff Notes ({lead.notes?.length || 0})</span>
              </span>

              {lead.notes && lead.notes.length > 0 && (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {lead.notes.map((note, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white/5 border border-ean-border-dark text-xs text-ean-white break-words">
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
                  className="flex-1 px-3 py-2 bg-ean-black-accent border border-ean-border-dark rounded-lg text-xs text-ean-white focus:outline-none focus:border-ean-gold placeholder:text-white/30"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-ean-gold text-ean-black font-semibold text-xs rounded-lg hover:bg-ean-gold-light transition-all shrink-0 cursor-pointer"
                >
                  Add Note
                </button>
              </form>
            </div>

            {/* Activity History Audit Trail */}
            <div className="space-y-3 pt-2 border-t border-ean-border-dark min-w-0">
              <span className="text-xs font-semibold text-ean-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-ean-gold shrink-0" />
                Audit Trail & Activity Log ({lead.activities?.length || 0})
              </span>

              <div className="space-y-3 pl-3 border-l-2 border-ean-gold/30 ml-1">
                {(lead.activities || []).map((act) => (
                  <div key={act.id} className="relative pl-3 text-xs space-y-0.5 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-ean-gold absolute -left-4.25 top-1" />
                    <div className="flex items-center justify-between text-ean-muted-light text-[10px]">
                      <span className="font-semibold text-ean-gold-light truncate max-w-[60%]">{act.author}</span>
                      <span className="font-mono shrink-0">
                        {act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                    </div>
                    <p className="text-ean-white font-medium break-words">{act.action}</p>
                    {act.note && (
                      <p className="text-ean-muted-light italic bg-white/5 p-2 rounded text-[11px] mt-1 break-words">
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
