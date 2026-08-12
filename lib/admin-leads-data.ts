import { LeadTrackingData } from './lead-tracking';

export type { LeadTrackingData };

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'closed_won' | 'closed_lost';

export type LeadPriority = 'urgent' | 'high' | 'normal' | 'low';

export type ServiceCategory = 'fbo' | 'maintenance' | 'charter' | 'catering' | 'vip' | 'leasing' | 'general';

export interface LeadActivity {
  id: string;
  timestamp: string;
  author: string;
  action: string;
  note?: string;
}

export interface Lead {
  /** Database uuid — every mutation keys off this. */
  id: string;
  /** Human-readable sequential code, e.g. EAN-LD-2026-001. Display this, not `id`. */
  leadCode?: string;
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  service: ServiceCategory;
  message: string;
  status: LeadStatus;
  priority: LeadPriority;
  createdAt: string;
  updatedAt: string;
  source: string;
  assignedTo?: string;
  notes: string[];
  activities: LeadActivity[];
  estimatedValue?: number;
  tracking?: LeadTrackingData;
}

export interface LeadStats {
  totalLeads: number;
  newLeads: number;
  inProgressLeads: number;
  qualifiedLeads: number;
  closedWonLeads: number;
  dailyInquiryRate?: number;
  avgResponseSlaMinutes: number;
  conversionRate: number;
  totalEstimatedPipeline: number;
  serviceDistribution: Record<ServiceCategory, number>;
  trackingDistribution?: {
    topSources: Array<{ source: string; count: number; percentage: number }>;
    topLandingPages: Array<{ page: string; count: number }>;
    devices: Record<string, number>;
  };
}

export const SERVICE_LABELS: Record<ServiceCategory, string> = {
  fbo: 'FBO & Ground Support',
  maintenance: 'Aircraft Maintenance (MRO)',
  charter: 'Aircraft Sales & Charter',
  catering: 'Wings™ VIP Catering',
  vip: 'VIP Lounge & Protocol',
  leasing: 'Leased Office Spaces',
  general: 'General Inquiry',
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New Lead',
  contacted: 'In Contact',
  qualified: 'Qualified',
  proposal_sent: 'Proposal Sent',
  closed_won: 'Closed (Won)',
  closed_lost: 'Closed (Lost)',
};

export const PRIORITY_LABELS: Record<LeadPriority, string> = {
  urgent: 'Urgent (SLA < 1h)',
  high: 'High Priority',
  normal: 'Standard',
  low: 'Low',
};

export function getLeadStats(leads: Lead[]): LeadStats {
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'new').length;
  const inProgressLeads = leads.filter((l) => l.status === 'contacted' || l.status === 'qualified' || l.status === 'proposal_sent').length;
  const qualifiedLeads = leads.filter((l) => l.status === 'qualified' || l.status === 'proposal_sent').length;
  const closedWonLeads = leads.filter((l) => l.status === 'closed_won').length;

  const totalEstimatedPipeline = leads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0);

  const conversionRate = totalLeads > 0 ? Math.round((closedWonLeads / totalLeads) * 100) : 0;

  const serviceDistribution: Record<ServiceCategory, number> = {
    fbo: 0,
    maintenance: 0,
    charter: 0,
    catering: 0,
    vip: 0,
    leasing: 0,
    general: 0,
  };

  const sourcesMap: Record<string, number> = {};
  const landingMap: Record<string, number> = {};
  const devicesMap: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };

  leads.forEach((l) => {
    serviceDistribution[l.service] = (serviceDistribution[l.service] || 0) + 1;

    // Tracking metrics
    const src = l.source || l.tracking?.utmSource || 'Direct';
    sourcesMap[src] = (sourcesMap[src] || 0) + 1;

    const page = l.tracking?.landingPage || '/';
    landingMap[page] = (landingMap[page] || 0) + 1;

    const dev = l.tracking?.deviceType || 'desktop';
    devicesMap[dev] = (devicesMap[dev] || 0) + 1;
  });

  const topSources = Object.entries(sourcesMap)
    .map(([source, count]) => ({
      source,
      count,
      percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const topLandingPages = Object.entries(landingMap)
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count);

  const dailyInquiryRate = totalLeads > 0 ? Math.round((totalLeads / 7) * 10) / 10 : 0;

  return {
    totalLeads,
    newLeads,
    inProgressLeads,
    qualifiedLeads,
    closedWonLeads,
    dailyInquiryRate,
    avgResponseSlaMinutes: 24,
    conversionRate,
    totalEstimatedPipeline,
    serviceDistribution,
    trackingDistribution: {
      topSources,
      topLandingPages,
      devices: devicesMap,
    },
  };
}
