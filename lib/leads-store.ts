import { INITIAL_LEADS, Lead, LeadStatus, LeadPriority } from './admin-leads-data';

const STORAGE_KEY = 'ean_admin_leads_v1';

/**
 * Gets all leads from storage, initializing with INITIAL_LEADS if empty.
 */
export function getAllLeadsFromStore(): Lead[] {
  if (typeof window === 'undefined') {
    return INITIAL_LEADS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LEADS));
      return INITIAL_LEADS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LEADS));
    return INITIAL_LEADS;
  } catch (err) {
    console.error('Failed to read leads from localStorage:', err);
    return INITIAL_LEADS;
  }
}

/**
 * Saves leads array to storage.
 */
export function saveLeadsToStore(leads: Lead[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch (err) {
    console.error('Failed to save leads to localStorage:', err);
  }
}

/**
 * Generates next unique Lead ID format: EAN-LD-2026-XXX
 */
export function generateNextLeadId(existingLeads: Lead[]): string {
  const year = new Date().getFullYear();
  const nextNum = existingLeads.length + 90;
  return `EAN-LD-${year}-${String(nextNum).padStart(3, '0')}`;
}

/**
 * Adds a new lead to the store.
 */
export function addLeadToStore(newLead: Lead): Lead[] {
  const current = getAllLeadsFromStore();
  const updated = [newLead, ...current];
  saveLeadsToStore(updated);
  return updated;
}

/**
 * Updates an existing lead in the store.
 */
export function updateLeadInStore(leadId: string, updates: Partial<Lead>): Lead | null {
  const current = getAllLeadsFromStore();
  let updatedLead: Lead | null = null;

  const updatedList = current.map((l) => {
    if (l.id === leadId) {
      updatedLead = {
        ...l,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return updatedLead;
    }
    return l;
  });

  if (updatedLead) {
    saveLeadsToStore(updatedList);
  }

  return updatedLead;
}

/**
 * Derives a human-readable referral source label from tracking context.
 */
export function deriveSourceLabel(tracking?: Lead['tracking']): string {
  if (!tracking) return 'Website Form';
  
  if (tracking.utmSource) {
    const src = tracking.utmSource.toLowerCase();
    if (src.includes('google')) return tracking.utmMedium === 'cpc' ? 'Google Ads' : 'Google Organic';
    if (src.includes('linkedin')) return 'LinkedIn Campaign';
    if (src.includes('facebook') || src.includes('instagram')) return 'Social Media';
    if (src.includes('newsletter') || src.includes('email')) return 'Email Marketing';
    return `${tracking.utmSource} (${tracking.utmMedium || 'campaign'})`;
  }

  if (tracking.referrerDomain && tracking.referrerDomain !== 'Direct / None' && tracking.referrerDomain !== 'Direct / Internal') {
    return `Referral (${tracking.referrerDomain})`;
  }

  return 'Direct Visit';
}
