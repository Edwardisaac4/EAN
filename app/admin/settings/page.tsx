'use client';

import React, { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Settings, Mail, Clock, Check, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [fboEmail, setFboEmail] = useState('fbo-dispatch@ean.aero');
  const [charterEmail, setCharterEmail] = useState('sales-charter@ean.aero');
  const [mroEmail, setMroEmail] = useState('mro-engineering@ean.aero');
  const [urgentSlaMinutes, setUrgentSlaMinutes] = useState('30');
  const [standardSlaHours, setStandardSlaHours] = useState('2');
  const [autoResponder, setAutoResponder] = useState(true);
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader />

      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-4xl w-full mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-ean-gold" />
              <h1 className="text-2xl font-bold font-display text-ean-white">System & SLA Settings</h1>
            </div>
            <p className="text-xs text-ean-muted-light mt-0.5">
              Configure lead notification routing, target SLA thresholds, and team dispatch rules.
            </p>
          </div>

          {savedAlert && (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4" />
              Settings Saved Successfully
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          
          {/* Notification Email Routing */}
          <div className="p-6 rounded-2xl bg-ean-black-accent/90 border border-ean-border-dark space-y-4">
            <h3 className="text-sm font-bold text-ean-white flex items-center gap-2 pb-3 border-b border-ean-border-dark">
              <Mail className="w-4 h-4 text-ean-gold" />
              Lead Notification Email Dispatch Rules
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-semibold text-ean-muted-light uppercase tracking-wider block mb-1">
                  FBO & Ground Support Desk
                </label>
                <input
                  type="email"
                  value={fboEmail}
                  onChange={(e) => setFboEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-ean-black-pure border border-ean-border-dark rounded-xl text-ean-white focus:outline-none focus:border-ean-gold font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-ean-muted-light uppercase tracking-wider block mb-1">
                  Aircraft Sales & Charter Desk
                </label>
                <input
                  type="email"
                  value={charterEmail}
                  onChange={(e) => setCharterEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-ean-black-pure border border-ean-border-dark rounded-xl text-ean-white focus:outline-none focus:border-ean-gold font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-ean-muted-light uppercase tracking-wider block mb-1">
                  MRO Maintenance Desk
                </label>
                <input
                  type="email"
                  value={mroEmail}
                  onChange={(e) => setMroEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-ean-black-pure border border-ean-border-dark rounded-xl text-ean-white focus:outline-none focus:border-ean-gold font-mono"
                />
              </div>
            </div>
          </div>

          {/* SLA Response Targets */}
          <div className="p-6 rounded-2xl bg-ean-black-accent/90 border border-ean-border-dark space-y-4">
            <h3 className="text-sm font-bold text-ean-white flex items-center gap-2 pb-3 border-b border-ean-border-dark">
              <Clock className="w-4 h-4 text-ean-gold" />
              Target Lead Response Time (SLA Thresholds)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-semibold text-ean-muted-light uppercase tracking-wider block mb-1">
                  Urgent Priority SLA Target (Minutes)
                </label>
                <input
                  type="number"
                  value={urgentSlaMinutes}
                  onChange={(e) => setUrgentSlaMinutes(e.target.value)}
                  className="w-full px-3 py-2 bg-ean-black-pure border border-ean-border-dark rounded-xl text-ean-white focus:outline-none focus:border-ean-gold font-mono"
                />
                <span className="text-[10px] text-ean-muted-light/60 mt-1 block">
                  Alert sent if an urgent lead remains unassigned past this limit.
                </span>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-ean-muted-light uppercase tracking-wider block mb-1">
                  Standard Lead SLA Target (Hours)
                </label>
                <input
                  type="number"
                  value={standardSlaHours}
                  onChange={(e) => setStandardSlaHours(e.target.value)}
                  className="w-full px-3 py-2 bg-ean-black-pure border border-ean-border-dark rounded-xl text-ean-white focus:outline-none focus:border-ean-gold font-mono"
                />
              </div>
            </div>
          </div>

          {/* Auto Responder */}
          <div className="p-6 rounded-2xl bg-ean-black-accent/90 border border-ean-border-dark space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-ean-white">Automated Client Confirmation Email</h4>
                <p className="text-[11px] text-ean-muted-light mt-0.5">
                  Send immediate confirmation email to client with EAN inquiry tracking ID upon form submission.
                </p>
              </div>

              <input
                type="checkbox"
                checked={autoResponder}
                onChange={(e) => setAutoResponder(e.target.checked)}
                className="w-4 h-4 accent-ean-gold cursor-pointer"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-ean-gold hover:bg-ean-gold-light text-ean-black font-semibold text-xs transition-all shadow-[0_0_15px_rgba(196,149,42,0.3)]"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
