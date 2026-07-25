'use client';

export interface LeadTrackingData {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  referrerUrl: string | null;
  referrerDomain: string | null;
  landingPage: string;
  formPage: string;
  formId: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browserName: string;
  userLanguage?: string;
  screenResolution?: string;
  capturedAt: string;
}

const STORAGE_KEY = 'ean_attribution_session_v1';

/**
 * Parses referrer URL to extract clean domain name (e.g. google.com, linkedin.com, direct)
 */
export function extractReferrerDomain(referrer: string | null): string {
  if (!referrer || referrer.trim() === '') return 'Direct / None';
  try {
    const url = new URL(referrer);
    // Ignore internal navigation referrer
    if (typeof window !== 'undefined' && url.hostname === window.location.hostname) {
      return 'Direct / Internal';
    }
    return url.hostname.replace(/^www\./, '');
  } catch {
    return 'Direct / External';
  }
}

/**
 * Detects device type based on user agent and screen dimensions
 */
export function detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua) || (width >= 640 && width <= 1024 && 'ontouchstart' in window)) {
    return 'tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua) || width < 640) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Detects user browser name
 */
export function detectBrowserName(): string {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('SamsungBrowser')) return 'Samsung Internet';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('Trident')) return 'Internet Explorer';
  if (ua.includes('Edge') || ua.includes('Edg')) return 'Microsoft Edge';
  if (ua.includes('Chrome')) return 'Google Chrome';
  if (ua.includes('Safari')) return 'Apple Safari';
  return 'Browser';
}

/**
 * Initializes attribution tracking on initial site entry.
 * Captures initial UTM params, referrer, and landing page into sessionStorage.
 */
export function initAttributionTracking(): void {
  if (typeof window === 'undefined') return;

  // Don't overwrite initial landing attribution if already captured in this session
  const existing = sessionStorage.getItem(STORAGE_KEY);
  if (existing) return;

  const urlParams = new URLSearchParams(window.location.search);
  const rawReferrer = document.referrer || null;

  const initialAttribution = {
    utmSource: urlParams.get('utm_source'),
    utmMedium: urlParams.get('utm_medium'),
    utmCampaign: urlParams.get('utm_campaign'),
    utmContent: urlParams.get('utm_content'),
    utmTerm: urlParams.get('utm_term'),
    referrerUrl: rawReferrer,
    referrerDomain: extractReferrerDomain(rawReferrer),
    landingPage: window.location.pathname + window.location.search,
    capturedAt: new Date().toISOString(),
  };

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initialAttribution));
}

/**
 * Retrieves tracking context at form submission time, combining stored attribution + current form page.
 */
export function getTrackingContext(formId = 'contact-form'): LeadTrackingData {
  if (typeof window === 'undefined') {
    return {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
      referrerUrl: null,
      referrerDomain: 'Direct',
      landingPage: '/',
      formPage: '/',
      formId,
      deviceType: 'desktop',
      browserName: 'Server',
      capturedAt: new Date().toISOString(),
    };
  }

  let stored: Partial<LeadTrackingData> = {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch {
    // Fallback if sessionStorage is disabled
  }

  const currentPath = window.location.pathname;

  // If no stored UTM source, infer from referrer domain or default to Direct
  let finalSource = stored.utmSource || null;
  if (!finalSource && stored.referrerDomain && stored.referrerDomain !== 'Direct / None' && stored.referrerDomain !== 'Direct / Internal') {
    finalSource = stored.referrerDomain;
  }

  return {
    utmSource: finalSource,
    utmMedium: stored.utmMedium || (stored.utmSource ? 'cpc' : null),
    utmCampaign: stored.utmCampaign || null,
    utmContent: stored.utmContent || null,
    utmTerm: stored.utmTerm || null,
    referrerUrl: stored.referrerUrl || (document.referrer || null),
    referrerDomain: stored.referrerDomain || extractReferrerDomain(document.referrer),
    landingPage: stored.landingPage || currentPath,
    formPage: currentPath,
    formId,
    deviceType: detectDeviceType(),
    browserName: detectBrowserName(),
    userLanguage: navigator.language || undefined,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    capturedAt: stored.capturedAt || new Date().toISOString(),
  };
}
