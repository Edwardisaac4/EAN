'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  getLeadStats, 
  Lead, 
  LeadStatus, 
  LeadPriority 
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
import { LeadStatCard } from '@/components/admin/LeadStatCard';
import { LeadDataTable } from '@/components/admin/LeadDataTable';
import { LeadDetailDrawer } from '@/components/admin/LeadDetailDrawer';

// Visual Graph Components
import { LeadTrendChart } from '@/components/admin/graphs/LeadTrendChart';
import { ServiceDonutChart } from '@/components/admin/graphs/ServiceDonutChart';
import { AcquisitionBarChart } from '@/components/admin/graphs/AcquisitionBarChart';

import { 
  Users, 
  Clock, 
  TrendingUp, 
  ShieldAlert, 
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
  Compass,
  Cpu
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [graphqlStatus, setGraphqlStatus] = useState<'connected' | 'loading' | 'fallback'>('loading');

  // Load leads via GraphQL Query
  const fetchLeadsGraphQL = useCallback(async (searchQuery = '') => {
    setGraphqlStatus('loading');
    try {
      const data = await graphqlQuery<{ leads: Lead[] }>(QUERY_GET_LEADS, { search: searchQuery });
      if (data && data.leads && data.leads.length > 0) {
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
  }, []);

  useEffect(() => {
    fetchLeadsGraphQL();
  }, [fetchLeadsGraphQL]);

  const stats = getLeadStats(leads);

  const filteredLeads = leads.filter((l) => {
    if (!globalSearch.trim()) return true;
    const q = globalSearch.toLowerCase();
    return (
      l.fullName.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.id.toLowerCase().includes(q) ||
      (l.company && l.company.toLowerCase().includes(q)) ||
      (l.source && l.source.toLowerCase().includes(q))
    );
  });

  const urgentLeads = leads.filter(
    (l) => l.priority === 'urgent' && l.status !== 'closed_won' && l.status !== 'closed_lost' && l.status !== 'contacted'
  );

  // GraphQL Mutation Handlers
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

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <AdminHeader
        leads={leads}
        onSearchChange={setGlobalSearch}
        onSelectLead={(leadId) => {
          const target = leads.find((l) => l.id === leadId);
          if (target) setSelectedLead(target);
        }}
        unreadCount={stats.newLeads}
      />

      <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto">
        
        {/* Welcome & GraphQL Status Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl bg-linear-to-r from-ean-navy/60 via-ean-black-accent to-ean-black border border-ean-gold/30 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-ean-gold/10 rounded-full filter blur-3xl pointer-events-none" />
          
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-ean-gold uppercase tracking-widest font-mono">
                EAN Aviation Command Center
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                GraphQL Powered ({graphqlStatus})
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-ean-white tracking-tight">
              Lead Intelligence & Analytics Visual Dashboard
            </h1>
            <p className="text-xs text-ean-muted-light max-w-xl">
              Real-time trend graphs, service interest donut charts, and acquisition channel bar graphs powered by GraphQL queries & mutations.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <Link
              href="/admin/leads"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ean-gold hover:bg-ean-gold-light text-ean-black font-semibold text-xs transition-all shadow-[0_0_20px_rgba(196,149,42,0.25)]"
            >
              <span>Manage All Leads ({stats.totalLeads})</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <LeadStatCard
            title="Total Inquiries Captured"
            value={stats.totalLeads}
            change="+22%"
            changeType="positive"
            subtitle="Auto & Manual"
            icon={Users}
          />
          <LeadStatCard
            title="Unprocessed / New Leads"
            value={stats.newLeads}
            change="Requires Action"
            changeType={stats.newLeads > 0 ? "negative" : "positive"}
            subtitle={`${stats.newLeads} pending SLA`}
            icon={ShieldAlert}
            accentColor="text-sky-400"
          />
          <LeadStatCard
            title="Avg SLA Response Time"
            value={`${stats.avgResponseSlaMinutes} mins`}
            change="-8 mins"
            changeType="positive"
            subtitle="Target: < 45 mins"
            icon={Clock}
            accentColor="text-emerald-400"
          />
          <LeadStatCard
            title="Inquiries Per Day"
            value="14 / day"
            change="+18%"
            changeType="positive"
            subtitle="7-day avg daily influx"
            icon={TrendingUp}
            accentColor="text-amber-400"
          />
        </div>

        {/* VISUAL GRAPHS SECTION 1: Lead Trend Curve Graph & Service Donut Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visual SVG Lead Volume Trend Curve */}
          <LeadTrendChart />

          {/* Visual Donut Chart for Service Category Breakdown */}
          <ServiceDonutChart distribution={stats.serviceDistribution} total={stats.totalLeads} />
        </div>

        {/* VISUAL GRAPHS SECTION 2: Acquisition Channels Bar Graph & Urgent Attention Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Urgent Leads Attention Board */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-ean-black-accent/80 border border-ean-border-dark space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-ean-border-dark">
              <span className="text-xs font-bold text-ean-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Urgent & Unprocessed Leads ({urgentLeads.length})
              </span>
              <Link href="/admin/leads" className="text-[11px] text-ean-gold hover:underline flex items-center gap-1">
                View in CRM
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {urgentLeads.length === 0 ? (
                <div className="p-6 text-center text-xs text-ean-muted-light">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  All incoming leads have been assigned and processed!
                </div>
              ) : (
                urgentLeads.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => setSelectedLead(l)}
                    className="p-3.5 rounded-xl bg-ean-black-pure border border-ean-border-dark hover:border-ean-gold/40 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-ean-white group-hover:text-ean-gold transition-colors">
                          {l.fullName}
                        </span>
                        <span className="text-[10px] font-mono text-ean-gold px-2 py-0.5 rounded bg-ean-gold/10">
                          {l.id}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40">
                          {l.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-ean-muted-light line-clamp-1">
                        {`"${l.message}"`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-ean-gold border border-ean-gold/20 px-2 py-0.5 rounded bg-ean-gold/5 flex items-center gap-1">
                        <Compass className="w-3 h-3" />
                        {l.source || l.tracking?.utmSource || 'Direct'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-ean-muted-light group-hover:text-ean-gold transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Visual Bar Graph for Referral Channels */}
          <AcquisitionBarChart sources={stats.trackingDistribution?.topSources || []} />

        </div>

        {/* Live Leads Table Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-display text-ean-white">GraphQL Live Lead Query Table</h3>
              <p className="text-xs text-ean-muted-light">Fetched using query: GetLeads($search, $status, $service, $priority)</p>
            </div>
            <Link
              href="/admin/leads"
              className="text-xs text-ean-gold hover:underline font-semibold flex items-center gap-1"
            >
              Open Full Master Lead Table
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <LeadDataTable
            leads={filteredLeads}
            onSelectLead={setSelectedLead}
            onQuickStatusChange={handleQuickStatusChange}
          />
        </div>

      </main>

      {/* Lead Inspection Drawer */}
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
