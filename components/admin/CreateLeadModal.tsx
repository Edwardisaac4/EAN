'use client';

import React, { useState } from 'react';
import { Lead, ServiceCategory, LeadPriority, SERVICE_LABELS } from '@/lib/admin-leads-data';
import { X, Plus, User, Mail, Phone, Building2, MessageSquare, Tag } from 'lucide-react';

export interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLead: (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'activities' | 'notes'>) => void;
}

export function CreateLeadModal({ isOpen, onClose, onCreateLead }: CreateLeadModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [service, setService] = useState<ServiceCategory>('fbo');
  const [priority, setPriority] = useState<LeadPriority>('normal');
  const [source, setSource] = useState('Phone Call Inquiry');
  const [message, setMessage] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<number>(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !message) return;

    onCreateLead({
      fullName,
      email,
      phone,
      company: company || undefined,
      service,
      priority,
      status: 'new',
      source,
      message,
      estimatedValue: Number(estimatedValue) || 0,
      assignedTo: 'Unassigned',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-ean-black-pure border border-ean-gold/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-ean-border-dark bg-ean-black-accent flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-ean-gold" />
            <h3 className="text-base font-bold font-display text-ean-white">Log New Inquiry / Lead</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-ean-muted-light hover:text-ean-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-ean-muted-light uppercase tracking-wider block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Capt. James Wright"
                className="w-full px-3 py-2 bg-ean-black-accent border border-ean-border-dark rounded-lg text-ean-white focus:outline-none focus:border-ean-gold"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-ean-muted-light uppercase tracking-wider block mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="j.wright@charter.com"
                className="w-full px-3 py-2 bg-ean-black-accent border border-ean-border-dark rounded-lg text-ean-white focus:outline-none focus:border-ean-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-ean-muted-light uppercase tracking-wider block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full px-3 py-2 bg-ean-black-accent border border-ean-border-dark rounded-lg text-ean-white focus:outline-none focus:border-ean-gold"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-ean-muted-light uppercase tracking-wider block mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Executive Air Aviation"
                className="w-full px-3 py-2 bg-ean-black-accent border border-ean-border-dark rounded-lg text-ean-white focus:outline-none focus:border-ean-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-ean-muted-light uppercase tracking-wider block mb-1">
                Service Category
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value as ServiceCategory)}
                className="w-full px-3 py-2 bg-ean-black-accent border border-ean-border-dark rounded-lg text-ean-white focus:outline-none focus:border-ean-gold"
              >
                {Object.entries(SERVICE_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-ean-muted-light uppercase tracking-wider block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as LeadPriority)}
                className="w-full px-3 py-2 bg-ean-black-accent border border-ean-border-dark rounded-lg text-ean-white focus:outline-none focus:border-ean-gold"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Standard</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-ean-muted-light uppercase tracking-wider block mb-1">
              Inquiry / Call Notes *
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter details of client request..."
              className="w-full px-3 py-2 bg-ean-black-accent border border-ean-border-dark rounded-lg text-ean-white focus:outline-none focus:border-ean-gold resize-none"
            />
          </div>

          <div className="pt-3 border-t border-ean-border-dark flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-ean-white rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-ean-gold hover:bg-ean-gold-light text-ean-black font-semibold rounded-lg text-xs transition-all"
            >
              Save Lead Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
