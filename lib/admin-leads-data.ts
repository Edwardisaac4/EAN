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
  id: string;
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

export const INITIAL_LEADS: Lead[] = [
  {
    id: "EAN-LD-2026-089",
    fullName: "Captain Alistair Vance",
    email: "a.vance@globalaero.co.uk",
    phone: "+44 7700 900821",
    company: "Global Aviation Services UK",
    service: "fbo",
    message: "Requesting full VIP ground handling, customs clearance, and 12,000 Liters of JET A-1 for Bombardier Global 7500 arriving at MMIA Lagos (DNMM) on July 28th at 14:30 UTC.",
    status: "new",
    priority: "urgent",
    createdAt: "2026-07-25T07:15:00Z",
    updatedAt: "2026-07-25T07:15:00Z",
    source: "Google Search (Paid Ads)",
    assignedTo: "FBO Dispatch Desk",
    notes: ["High-profile diplomatic passenger on board.", "Requires tarmac limousine transfer."],
    activities: [
      {
        id: "act-1",
        timestamp: "2026-07-25T07:15:00Z",
        author: "System",
        action: "Lead automatically captured via Contact Form",
      },
    ],
    estimatedValue: 18500,
    tracking: {
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "fbo_lagos_ground_handling",
      utmContent: "vip_handling_ad",
      utmTerm: "fbo lagos airport",
      referrerUrl: "https://www.google.com/search?q=fbo+lagos+ground+handling",
      referrerDomain: "google.com",
      landingPage: "/services/fbo-ground-support",
      formPage: "/contact?service=fbo",
      formId: "contact-page-form",
      deviceType: "desktop",
      browserName: "Google Chrome",
      userLanguage: "en-GB",
      screenResolution: "1920x1080",
      capturedAt: "2026-07-25T07:14:22Z",
    },
  },
  {
    id: "EAN-LD-2026-088",
    fullName: "Dr. Folake Adeleke",
    email: "f.adeleke@primenergy.ng",
    phone: "+234 803 555 0192",
    company: "Prime Energy Ltd",
    service: "charter",
    message: "Looking for executive jet charter quote for 6 passengers from Lagos to Port Harcourt (round trip) on August 2nd. Prefer Hawker 900XP or similar mid-size cabin jet.",
    status: "contacted",
    priority: "urgent",
    createdAt: "2026-07-24T16:40:00Z",
    updatedAt: "2026-07-25T06:30:00Z",
    source: "LinkedIn Campaign",
    assignedTo: "Babajide S. (Sales)",
    notes: ["Spoke via phone. Client requested inclusion of gourmet lunch."],
    activities: [
      {
        id: "act-2",
        timestamp: "2026-07-24T16:40:00Z",
        author: "System",
        action: "Lead automatically captured via Charter Page Form",
      },
      {
        id: "act-3",
        timestamp: "2026-07-25T06:30:00Z",
        author: "Babajide S.",
        action: "Status updated to In Contact",
        note: "Initial phone call completed, drafting charter quote.",
      },
    ],
    estimatedValue: 24000,
    tracking: {
      utmSource: "linkedin",
      utmMedium: "social_paid",
      utmCampaign: "executive_charter_q3",
      utmContent: "oil_gas_charter_banner",
      utmTerm: null,
      referrerUrl: "https://www.linkedin.com/feed/",
      referrerDomain: "linkedin.com",
      landingPage: "/",
      formPage: "/contact?service=charter",
      formId: "contact-page-form",
      deviceType: "mobile",
      browserName: "Apple Safari",
      userLanguage: "en-US",
      screenResolution: "390x844",
      capturedAt: "2026-07-24T16:38:10Z",
    },
  },
  {
    id: "EAN-LD-2026-087",
    fullName: "Engr. Marcus Sterling",
    email: "msterling@westafricajets.com",
    phone: "+234 812 444 8810",
    company: "West Africa Jet Fleet Maintenance",
    service: "maintenance",
    message: "Inquiring about scheduled 100-hour inspection and avionics diagnostic check for Challenger 604 at EAN NCAA-approved MRO facility in Hangar B.",
    status: "qualified",
    priority: "urgent",
    createdAt: "2026-07-23T11:20:00Z",
    updatedAt: "2026-07-24T14:10:00Z",
    source: "Direct Referral",
    assignedTo: "Engr. Kayode MRO",
    notes: ["Aircraft logbooks reviewed.", "Slot available in Hangar B starting Aug 5."],
    activities: [
      {
        id: "act-4",
        timestamp: "2026-07-23T11:20:00Z",
        author: "System",
        action: "Lead captured via Maintenance Page Form",
      },
      {
        id: "act-5",
        timestamp: "2026-07-24T14:10:00Z",
        author: "Engr. Kayode",
        action: "Status updated to Qualified",
        note: "Technical scope verified with fleet manager.",
      },
    ],
    estimatedValue: 45000,
    tracking: {
      utmSource: "direct",
      utmMedium: "none",
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
      referrerUrl: null,
      referrerDomain: "Direct / None",
      landingPage: "/services/aircraft-maintenance",
      formPage: "/services/aircraft-maintenance",
      formId: "services-mro-form",
      deviceType: "desktop",
      browserName: "Google Chrome",
      userLanguage: "en-US",
      screenResolution: "2560x1440",
      capturedAt: "2026-07-23T11:18:45Z",
    },
  },
  {
    id: "EAN-LD-2026-086",
    fullName: "Chief Mrs. Bisi Ogunlesi",
    email: "bisi.ogunlesi@crestcapital.com",
    phone: "+234 802 111 9900",
    company: "Crest Capital Holdings",
    service: "leasing",
    message: "Interested in leasing a 250 sqm executive office suite overlooking the tarmac at EAN Executive Aviation Center for our private flight operations team.",
    status: "proposal_sent",
    priority: "urgent",
    createdAt: "2026-07-21T09:00:00Z",
    updatedAt: "2026-07-23T10:15:00Z",
    source: "Google Organic",
    assignedTo: "Facilities & Leasing Dept",
    notes: ["Commercial terms sent for Suite 3B.", "Client requested 3-year lease term."],
    activities: [
      {
        id: "act-6",
        timestamp: "2026-07-21T09:00:00Z",
        author: "System",
        action: "Lead captured via Leasing Page",
      },
      {
        id: "act-7",
        timestamp: "2026-07-23T10:15:00Z",
        author: "Facilities Team",
        action: "Proposal Sent",
        note: "Draft lease agreement delivered to client legal team.",
      },
    ],
    estimatedValue: 68000,
    tracking: {
      utmSource: "google",
      utmMedium: "organic",
      utmCampaign: null,
      utmContent: null,
      utmTerm: "office space lease mmia hangar lagos",
      referrerUrl: "https://www.google.com/",
      referrerDomain: "google.com",
      landingPage: "/services/leased-offices",
      formPage: "/contact?service=leasing",
      formId: "contact-page-form",
      deviceType: "desktop",
      browserName: "Microsoft Edge",
      userLanguage: "en-NG",
      screenResolution: "1536x864",
      capturedAt: "2026-07-21T08:55:12Z",
    },
  },
  {
    id: "EAN-LD-2026-085",
    fullName: "Jean-Luc Moreau",
    email: "jmoreau@airfrance-charter.fr",
    phone: "+33 1 42 68 55 00",
    company: "Air France Executive Services",
    service: "catering",
    message: "Pre-order VIP gourmet catering for 14 passengers on outbound flight from Lagos to Paris CDG. Requires halal menu and champagne selection.",
    status: "closed_won",
    priority: "urgent",
    createdAt: "2026-07-19T14:15:00Z",
    updatedAt: "2026-07-20T11:00:00Z",
    source: "Email Campaign",
    assignedTo: "Wings™ Catering Manager",
    notes: ["Payment confirmed.", "Menu prepared by Head Chef."],
    activities: [
      {
        id: "act-8",
        timestamp: "2026-07-19T14:15:00Z",
        author: "System",
        action: "Lead captured via Wings Catering Form",
      },
      {
        id: "act-9",
        timestamp: "2026-07-20T11:00:00Z",
        author: "Catering Admin",
        action: "Closed (Won)",
        note: "Catering order dispatched to tarmac crew.",
      },
    ],
    estimatedValue: 5200,
    tracking: {
      utmSource: "newsletter",
      utmMedium: "email",
      utmCampaign: "vip_wings_catering_july",
      utmContent: "gourmet_menu_cta",
      utmTerm: null,
      referrerUrl: "https://mail.google.com/",
      referrerDomain: "mail.google.com",
      landingPage: "/services/wings-catering",
      formPage: "/contact?service=catering",
      formId: "contact-page-form",
      deviceType: "tablet",
      browserName: "Apple Safari",
      userLanguage: "fr-FR",
      screenResolution: "810x1080",
      capturedAt: "2026-07-19T14:12:05Z",
    },
  },
  {
    id: "EAN-LD-2026-084",
    fullName: "Tunde Bakare",
    email: "tbakare@africacorp.org",
    phone: "+234 809 333 4455",
    company: "Africa Corp Ltd",
    service: "general",
    message: "Inquiry regarding partnership opportunities for corporate travel management.",
    status: "new",
    priority: "urgent",
    createdAt: "2026-07-25T05:45:00Z",
    updatedAt: "2026-07-25T05:45:00Z",
    source: "Direct Visit",
    assignedTo: "Business Dev Team",
    notes: [],
    activities: [
      {
        id: "act-10",
        timestamp: "2026-07-25T05:45:00Z",
        author: "System",
        action: "Lead captured via Contact Us Page",
      },
    ],
    estimatedValue: 0,
    tracking: {
      utmSource: "direct",
      utmMedium: "none",
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
      referrerUrl: null,
      referrerDomain: "Direct / None",
      landingPage: "/about",
      formPage: "/contact",
      formId: "contact-page-form",
      deviceType: "mobile",
      browserName: "Google Chrome",
      userLanguage: "en-NG",
      screenResolution: "360x800",
      capturedAt: "2026-07-25T05:43:00Z",
    },
  },
];

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

  return {
    totalLeads,
    newLeads,
    inProgressLeads,
    qualifiedLeads,
    closedWonLeads,
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
