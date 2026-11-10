/**
 * The certificates on /credentials.
 *
 * Every entry is a document from the set the CEO supplied for this page. Most
 * are held by EAN Aviation Limited; where one names another company — the
 * In-Flight Catering licence (EAN Catering Limited), the 2011 facility letter
 * (Evergreen Apple Nigeria) — `holder` carries that name exactly as printed, so
 * the viewer never claims a holder the document does not show. Documents from
 * outside that set, such as the Air Operator Certificate issued to Heliconia
 * EAN Aero Nigeria Limited, are not on the page.
 *
 * Content was cleared by the CEO and by Quality & Safety (November 2026),
 * certificate numbers and signatures included.
 *
 * The page is view-only. There is no download link, and each `scan` is a
 * watermarked image rather than the issued PDF. That deters casual copying; it
 * cannot stop a screenshot, which is why the watermark is baked into the pixels
 * rather than laid over them in CSS.
 *
 * Adding one:
 *   1. Export page 1 of the certificate as a watermarked WebP into
 *      public/credentials/<id>.webp, roughly 1600px on the long side.
 *   2. Add an entry below with the file's real pixel size, and the dates and
 *      number exactly as printed.
 *   3. Set `validUntil` from the certificate. The page drops an entry the day
 *      after it lapses (see `currentCertificates`), so an expired certificate
 *      never stays up waiting for someone to notice.
 */

export type IssuerId = 'ncaa' | 'faan' | 'ibac' | 'nata';

export interface IssuerLogo {
  /** Path under /public. */
  src: string;
  width: number;
  height: number;
}

/**
 * A body that issues certificates. Each one is a card on the page, and its
 * "View cert" button opens the certificates it issued.
 */
export interface Issuer {
  id: IssuerId;
  name: string;
  /** The acronym the industry uses for it. */
  shortName: string;
  logo: IssuerLogo;
}

/** In the order the cards appear. */
export const ISSUERS: Issuer[] = [
  {
    id: 'ncaa',
    name: 'Nigeria Civil Aviation Authority',
    shortName: 'NCAA',
    logo: { src: '/images/History/ncaa.png', width: 192, height: 192 },
  },

  {
    id: 'ibac',
    name: 'International Business Aviation Council',
    shortName: 'IBAC',
    // IBAC's IS-BAH mark, the one printed on its certificate to EAN. There is
    // no IBAC corporate logo in the repo.
    logo: { src: '/images/History/isbah.jpg', width: 447, height: 447 },
  },
];

const ISSUERS_BY_ID = new Map<string, Issuer>(ISSUERS.map((issuer) => [issuer.id, issuer]));

export function getIssuer(id: IssuerId): Issuer {
  const issuer = ISSUERS_BY_ID.get(id);
  if (!issuer) throw new Error(`Unknown certificate issuer: ${id}`);
  return issuer;
}

/** For a URL segment, which may name no issuer: /credentials/[issuer]. */
export function findIssuer(id: string): Issuer | undefined {
  return ISSUERS_BY_ID.get(id);
}

export interface CertificateScan {
  /** Path under /public. Watermarked, never the issued original. */
  src: string;
  /** The file's own pixel size, so the viewer reserves the right box. */
  width: number;
  height: number;
}

export interface Certificate {
  /** Stable key, and the file stem under public/credentials/. */
  id: string;
  /** The certificate's name as printed on it. */
  title: string;
  /** The body that issued it — a key into ISSUERS. */
  issuer: IssuerId;
  /**
   * The company named on it. Defaults to EAN Aviation Limited; set it only for
   * a certificate issued to another company, so the viewer never claims a
   * holder the document does not name.
   */
  holder?: string;
  /** Certificate or approval number as printed. Omit when there is none. */
  reference?: string;
  /** YYYY-MM-DD. */
  issued?: string;
  /** YYYY-MM-DD. Omit only for a credential that genuinely does not expire. */
  validUntil?: string;
  scan: CertificateScan;
  /**
   * The issuer's public register or announcement, where one exists. This is
   * what lets a client check the certificate rather than take the scan on
   * trust, so it is worth finding for every entry.
   */
  verifyUrl?: string;
  /** Overrides the default link text. Name the issuer. */
  verifyLabel?: string;
}

/**
 * Transcribed from the scans in November 2026: numbers and dates as printed.
 * Ordered by what a client comes to check: the FBO first, then maintenance,
 * then the rest, with the 2011 facility letter — the oldest, and a letter
 * rather than a certificate — last.
 *
 * No `verifyUrl` yet. The NCAA and FAAN publish no searchable register for any
 * of these, and a link to a page that does not name EAN would undercut the
 * very check it offers.
 */
export const CERTIFICATES: Certificate[] = [
  {
    id: 'ncaa-amo',
    title: 'Approved Maintenance Organisation Certificate',
    issuer: 'ncaa',
    reference: 'AMO/5N/EAN',
    // Date of current issue. The approval was first issued on 8 January 2019.
    issued: '2025-01-24',
    validUntil: '2028-01-07',
    scan: { src: '/credentials/ncaa-amo.webp', width: 1131, height: 1600 },
  },
  {
    id: 'ncaa-agent-of-foreign-airlines',
    title: 'Certificate of Registration as Agent of Foreign Airlines',
    issuer: 'ncaa',
    reference: 'NCAA/ATR/AS/AFA.092',
    issued: '2026-09-25',
    validUntil: '2028-09-24',
    scan: { src: '/credentials/ncaa-agent-of-foreign-airlines.webp', width: 1600, height: 1132 },
  },
  {
    id: 'ncaa-pncf',
    title: 'Permit for Non-Commercial Flight, Issue 3',
    issuer: 'ncaa',
    // Issue 3, varied 23 February 2026 to add 3B-OGT. Issue 2 follows it.
    reference: 'NCAA/ATR66/NCF68',
    issued: '2024-01-28',
    validUntil: '2027-01-27',
    scan: { src: '/credentials/ncaa-pncf.webp', width: 1132, height: 1600 },
  },
  {
    id: 'ncaa-inflight-catering',
    title: 'In-Flight Catering Services Providers Licence',
    issuer: 'ncaa',
    holder: 'EAN Catering Limited',
    reference: 'NCAA/ATR/AS/IFCS.010',
    issued: '2024-11-25',
    validUntil: '2029-11-24',
    scan: { src: '/credentials/ncaa-inflight-catering.webp', width: 1131, height: 1600 },
  },
  {
    id: 'ncaa-facility-approval-2011',
    title: 'Approval for Use of the EAN Hangar Jet Center',
    issuer: 'ncaa',
    // As named in the letter. Kept verbatim rather than modernised to EAN
    // Aviation Limited: the viewer shows the holder the document shows.
    holder: 'Evergreen Apple Nigeria (EAN)',
    reference: 'NCAA/DAWS.002/Vol.II/11/172',
    issued: '2011-07-20',
    scan: { src: '/credentials/ncaa-facility-approval-2011.webp', width: 1132, height: 1600 },
  },
  {
    id: 'ibac-isbah',
    title: 'IS-BAH Certificate of Registration, Stage 2',
    issuer: 'ibac',
    holder: 'EAN Jet Center',
    reference: 'IS-BAH Location ID 70',
    // Date of initial issue, as printed. The current term runs to March 2027.
    issued: '2017-03-31',
    validUntil: '2027-03-31',
    scan: { src: '/credentials/ibac-isbah.webp', width: 1132, height: 1600 },
  },
];

/** Today in Lagos as YYYY-MM-DD, so expiry turns over at local midnight. */
function lagosToday(now: Date): string {
  // en-CA formats as YYYY-MM-DD, which compares correctly as a string.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/**
 * The certificates still in force. A certificate is valid through its
 * `validUntil` date, so it is dropped from the day after.
 */
export function currentCertificates(now: Date = new Date()): Certificate[] {
  const today = lagosToday(now);
  return CERTIFICATES.filter(
    (certificate) => !certificate.validUntil || certificate.validUntil >= today,
  );
}

/**
 * The certificates in the bottom-right corner of each /services/[slug] hero,
 * keyed by service slug, in the order the corner deals them. Chosen by the CEO
 * in November 2026. A service with no entry shows no corner.
 */
export const SERVICE_CERTIFICATES: Record<string, string[]> = {
  'aircraft-maintenance': ['ncaa-amo'],
  'wings-catering': ['ncaa-inflight-catering'],
  'fbo-ground-support': [
    'ncaa-pncf',
    'ncaa-agent-of-foreign-airlines',
    'ncaa-facility-approval-2011',
  ],
  'aircraft-charter': ['ncaa-agent-of-foreign-airlines'],
};

/**
 * Services whose hero corner also says "View certificate" under the sheet.
 * Every other corner is the bare certificate alone.
 */
export const SERVICES_WITH_CERTIFICATE_LABEL: ReadonlySet<string> = new Set([
  'wings-catering',
  'aircraft-charter',
  'aircraft-maintenance',
]);

/**
 * A service's corner certificates that are still in force, in order. An id
 * that names no certificate at all throws, so a typo fails the build rather
 * than quietly emptying a corner; one that has merely lapsed drops out.
 */
export function certificatesForService(slug: string, now: Date = new Date()): Certificate[] {
  const inForce = new Map(currentCertificates(now).map((certificate) => [certificate.id, certificate]));
  return (SERVICE_CERTIFICATES[slug] ?? []).flatMap((id) => {
    if (!CERTIFICATES.some((certificate) => certificate.id === id)) {
      throw new Error(`Unknown certificate in SERVICE_CERTIFICATES['${slug}']: ${id}`);
    }
    return inForce.get(id) ?? [];
  });
}

/** "2027-03-31" → "31 March 2027". Parsed as UTC so no timezone shifts the day. */
export function formatCertificateDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
