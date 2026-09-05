// =============================================================================
// The EAN Aeroplex — all content for /the-aeroplex
// =============================================================================
// Every string, figure, image path and href the page renders lives here, so the
// components under components/aeroplex/ carry layout and interaction only.
//
// Deliberately a separate module rather than more lines in lib/constants.ts, and
// deliberately *not* re-exported from it: constants.ts is imported by client
// components across the whole site, and this data is read by exactly one route.
// See lib/AGENTS.md on not adding barrel re-exports.
//
// CONTENT DISCIPLINE — read before editing.
// The campus is under construction and nothing on it is in service. So no line
// in this file asserts an operating capability, a completion or opening date, a
// floor area per building, a bay count, or a commercial term. What is published
// is what EAN has already put in public: the airside location, an approximate
// total area, and the June 2026 commencement. Everything more specific sits
// behind the project-overview request (AEROPLEX_PARTNER) on purpose.
//
// The same rule governs the photography. See SITE_GALLERY.

import type { PageSeoInput } from "@/lib/seo";

// ============================================================================
// Types
// ============================================================================

/**
 * lucide-react icon names used by this page. A union rather than a component
 * reference so the data stays serialisable and the icon map lives with the
 * component that renders it — the pattern SERVICES_DATA already uses.
 */
export type AeroplexIconName =
  | "Warehouse"
  | "Landmark"
  | "Wrench"
  | "Fuel"
  | "UtensilsCrossed"
  | "Sofa"
  | "Package"
  | "Compass"
  | "Ruler"
  | "HardHat"
  | "Layers";

export interface AeroplexCta {
  text: string;
  href: string;
}

export interface AeroplexHeroContent {
  eyebrow: string;
  /**
   * Project reference, rendered as a mono chip beside the eyebrow. Carried over
   * from the reference design; one field to change or drop if it should not be
   * published.
   */
  badge?: string;
  title: string;
  /** Rendered as separate lines, so the break point is content, not a wrap. */
  lede: string[];
  image: string;
  imageAlt: string;
  primaryCta: AeroplexCta;
  secondaryCta?: AeroplexCta;
}

/** One row of the project spec block beside the overview copy. */
export interface AeroplexFact {
  id: string;
  /** Short uppercase key — SITE, SCALE, COMMENCED, STATUS. */
  label: string;
  value: string;
  note: string;
  image: string;
  imageAlt: string;
  iconName?: AeroplexIconName;
}

export interface AeroplexOverviewContent {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  cta: AeroplexCta;
  image?: string;
  imageAlt?: string;
  /** Caption pinned inside the image card. */
  imageCaption?: string;
}

/** One element of the campus programme. */
export interface AeroplexFacility {
  id: string;
  name: string;
  iconName: AeroplexIconName;
  description: string;
}

export interface AeroplexMilestone {
  id: string;
  /** 'Jun 2026', 'Now', 'Next' — a period, not necessarily a date. */
  period: string;
  title: string;
  description: string;
  state: "complete" | "active" | "planned";
}

export interface AeroplexGalleryItem {
  id: string;
  src: string;
  alt: string;
  caption: string;
  /** Short classification chip — where on the operation the photo was taken. */
  tag: string;
  /**
   * Column span out of 12 on the desktop mosaic. Rows must total 12 or the
   * grid leaves a gap: currently 7+5, 4+4+4, 6+6.
   */
  span: 4 | 5 | 6 | 7;
}

export interface AeroplexPartnerContent {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  /** What the project overview covers. */
  contents: string[];
  handledBy: string;
  primaryCta: AeroplexCta;
  secondaryCta: AeroplexCta;
}

export interface AeroplexSectionContent {
  eyebrow: string;
  title: string;
  standfirst: string;
}

// ============================================================================
// Route & anchors
// ============================================================================

/** Must match the NAV_ITEMS entry for The Aeroplex in lib/constants.ts. */
export const AEROPLEX_PATH = "/the-aeroplex";

/**
 * Anchor targets. Held as constants so the in-page hrefs below and the `id`
 * attributes on the sections cannot drift apart into a link that scrolls
 * nowhere.
 */
export const AEROPLEX_SECTION_IDS = {
  campus: "the-campus",
  programme: "programme",
  gallery: "site-gallery",
  request: "request-overview",
} as const;

/**
 * The contact form maps an unrecognised ?service= slug to its general inquiry
 * option (see getServiceFromSlug in app/contact/page.tsx), so 'general' is
 * passed explicitly rather than relying on that fallback. A project inquiry is
 * not one of the six service lines.
 */
const CONTACT_HREF = "/contact?service=general";

// ============================================================================
// Hero
// ============================================================================

export const AEROPLEX_HERO: AeroplexHeroContent = {
  eyebrow: "WHAT WE ARE BUILDING",
  title: "The EAN Aeroplex.",
  lede: [
    "An integrated airside campus at Murtala Muhammed International Airport.",
    "Broke ground in June 2026.",
  ],
  image: "/images/runway.jpg",
  imageAlt:
    "Airside campus development at Murtala Muhammed International Airport Lagos",
  primaryCta: {
    text: "REQUEST THE PROJECT OVERVIEW",
    href: CONTACT_HREF,
  },
  secondaryCta: {
    text: "What is on the campus",
    href: `#${AEROPLEX_SECTION_IDS.campus}`,
  },
};

// ============================================================================
// Project facts — the spec block beside the overview copy
// ============================================================================

export const AEROPLEX_FACTS: AeroplexFact[] = [
  {
    id: "site",
    label: "SITE",
    value: "Airside, MMIA Lagos",
    note: "Within the existing international airport boundary",
    image: "/images/about-jet.jpg",
    imageAlt: "Airside operations at EAN terminal",
    iconName: "Compass",
  },
  {
    id: "scale",
    label: "SCALE",
    value: "~60,000 sqm",
    note: "Hangars, executive terminal, support facilities",
    image: "/images/services/office-space.jpg",
    imageAlt: "Serviced boardroom at EAN airside offices",
    iconName: "Ruler",
  },
  {
    id: "commenced",
    label: "JUN 2026",
    value: "Construction commenced",
    note: "Ground broken with appointed EPC contractor",
    image: "/images/services/s1-banner-maintenance-c-2.jpg",
    imageAlt: "EAN engineers in the maintenance workshop",
    iconName: "HardHat",
  },
  {
    id: "status",
    label: "STATUS",
    value: "Works in progress",
    note: "Programme updates published as milestones complete",
    image: "/images/runway.jpg",
    imageAlt: "Airside operations at Murtala Muhammed International Airport",
    iconName: "Layers",
  },
];

// ============================================================================
// Overview
// ============================================================================

export const AEROPLEX_OVERVIEW: AeroplexOverviewContent = {
  eyebrow: "THE CAMPUS",
  title: "One campus. Everything on it.",
  paragraphs: [
    "Approximately 60,000 square metres of hangars, an executive terminal, maintenance facilities, fueling, catering, lounges and cargo, planned as one campus so that aircraft, crews and principals do not need to leave it.",
    "EAN develops and hosts the campus. Detailed project information, including the specification, programme and commercial structure, is available to qualified partners and investors under confidentiality.",
  ],
  cta: {
    text: "REQUEST THE PROJECT OVERVIEW",
    href: CONTACT_HREF,
  },
  image: "/images/services/ean-service-banners-fbo.jpg",
  imageAlt: "Airside apron and integrated facilities at EAN Aviation Lagos",
  imageCaption:
    "EAN’s current operation at MMIA — the operation the campus is built around.",
};

// ============================================================================
// Campus elements
// ============================================================================

export const AEROPLEX_FACILITIES_INTRO: AeroplexSectionContent = {
  eyebrow: "Programme elements",
  title: "What the campus is planned to hold",
  // Load-bearing sentence: it is what stops the grid below being read as a list
  // of facilities already open.
  standfirst:
    "Each element below is part of the campus programme, not a facility in service. Where EAN already runs the equivalent operation at MMIA today, it is named.",
};

export const AEROPLEX_FACILITIES: AeroplexFacility[] = [
  {
    id: "hangars",
    name: "Hangars",
    iconName: "Warehouse",
    description:
      "Hangar space for based and transient aircraft, the largest element of the programme by area.",
  },
  {
    id: "executive-terminal",
    name: "Executive terminal",
    iconName: "Landmark",
    description:
      "A dedicated terminal for departing and arriving principals and crews, planned to carry Customs, Immigration and Quarantine on the campus as the current FBO terminal does.",
  },
  {
    id: "maintenance",
    name: "Maintenance facilities",
    iconName: "Wrench",
    description:
      "Workshops and bays for EAN’s NCAA-approved maintenance organisation, which today works out of the existing hangar.",
  },
  {
    id: "fueling",
    name: "Fueling",
    iconName: "Fuel",
    description:
      "Fuel provision on the campus, so a turnaround does not depend on moving the aircraft off it.",
  },
  {
    id: "catering",
    name: "Catering",
    iconName: "UtensilsCrossed",
    description:
      "A flight kitchen for Wings™, EAN’s on-airport catering operation, which has prepared cabin service at MMIA since 2011.",
  },
  {
    id: "lounges",
    name: "Lounges",
    iconName: "Sofa",
    description:
      "Lounge and quiet-work space for principals and crews between legs, alongside the terminal.",
  },
  {
    id: "cargo",
    name: "Cargo",
    iconName: "Package",
    description:
      "Cargo handling within the campus footprint, on the same airside access as the hangars.",
  },
];

// ============================================================================
// Programme
// ============================================================================

export const AEROPLEX_PROGRAMME_INTRO: AeroplexSectionContent = {
  eyebrow: "Programme",
  title: "Where the works stand",
  standfirst:
    "This page is the record. Each milestone is published here once it is complete, rather than a schedule being published in advance of one.",
};

export const AEROPLEX_MILESTONES: AeroplexMilestone[] = [
  {
    id: "commenced",
    period: "Jun 2026",
    title: "Construction commenced",
    description:
      "Ground broken on the airside site with the appointed EPC contractor.",
    state: "complete",
  },
  {
    id: "in-progress",
    period: "Now",
    title: "Works in progress",
    description:
      "Construction is under way. The site remains inside the airport boundary.",
    state: "active",
  },
  {
    id: "next",
    period: "Next",
    title: "Milestone updates",
    description:
      "The next update is published here when the milestone it reports is complete.",
    state: "planned",
  },
];

// ============================================================================
// Photography
// ============================================================================

/**
 * These are photographs of EAN's **existing** operation at MMIA, not of the
 * campus under construction — the standfirst says so, every caption says so, and
 * they must keep saying so. A photograph of the current FBO published under an
 * Aeroplex-progress caption is a fabricated record, which is precisely the class
 * of claim the August 2026 content sign-off exists to catch.
 *
 * To publish real site photography: drop the files into
 * `public/images/aeroplex/`, replace the entries below, and rewrite
 * `SITE_GALLERY_INTRO.standfirst` to match. Nothing in the component changes.
 * Keep the `span` values summing to 12 per row (7+5, 4+4+4, 6+6).
 */
export const SITE_GALLERY_INTRO: AeroplexSectionContent = {
  eyebrow: "Photography",
  title: "The operation the campus grows out of",
  standfirst:
    "Site photography is published as the programme progresses. Until then, these are EAN’s existing facilities at Murtala Muhammed International Airport — the operation the Aeroplex is designed to house at scale.",
};

export const SITE_GALLERY: AeroplexGalleryItem[] = [
  {
    id: "ciq-terminal",
    src: "/images/hero/slide-4.jpg",
    alt: "Passenger and escort at the Federal Republic of Nigeria Premium CIQ Services desk inside the EAN terminal at Lagos, with customs and immigration officers behind the counter",
    caption:
      "On-site Customs, Immigration and Quarantine at the current EAN terminal. The campus is planned to carry the same clearance.",
    tag: "Terminal",
    span: 7,
  },
  {
    id: "vip-lounge",
    src: "/images/vip-lounge.jpg",
    alt: "EAN Aviation VIP lounge at Lagos with orange leather armchairs, timber-clad walls and a reception desk at the far end",
    caption: "The VIP lounge at the existing terminal.",
    tag: "Lounge",
    span: 5,
  },
  {
    id: "maintenance-workshop",
    src: "/images/services/s1-banner-maintenance-c-2.jpg",
    alt: "Two EAN engineers in high-visibility shirts inspecting an aircraft main wheel and brake assembly in the workshop",
    caption:
      "Wheels and brakes work in the NCAA-approved maintenance workshop.",
    tag: "Maintenance",
    span: 4,
  },
  {
    id: "wings-kitchen",
    src: "/images/new wings..jpg",
    // The alt and caption move with the photograph. The frame this replaced was
    // the kitchen's dining room on airport grounds; this one is a laid cabin
    // table, so the old text described something no longer in the picture — and
    // the caption asserted a location the new frame cannot support.
    alt: "A private jet cabin table laid for service, with sushi, a salmon and quinoa salad, edamame and chilled wine",
    caption: "Wings™ in-flight catering, plated for the cabin.",
    tag: "Catering",
    span: 4,
  },
  {
    id: "airside-offices",
    src: "/images/services/office-space.jpg",
    alt: "Serviced boardroom in EAN’s airside offices at Lagos, with a long table, mesh chairs and a whiteboard",
    caption: "A serviced boardroom in the airside offices.",
    tag: "Offices",
    span: 4,
  },
  {
    id: "apron-tow",
    src: "/images/hero/slide-3.jpg",
    alt: "EAN ground crew towing a business jet with a tug on the apron at Murtala Muhammed International Airport",
    caption: "Ground handling on the apron at Lagos.",
    tag: "Airside",
    span: 6,
  },
  {
    id: "hangar-interior",
    src: "/images/hero/slide-2.jpg",
    alt: "Three business aircraft parked inside the EAN Aviation hangar at Lagos under a lit steel roof structure",
    caption: "Three aircraft under one roof in the existing hangar.",
    tag: "Hangar",
    span: 6,
  },
];

// ============================================================================
// Partners & investors
// ============================================================================

export const AEROPLEX_PARTNER: AeroplexPartnerContent = {
  eyebrow: "Partners & investors",
  title: "The detail is released under confidentiality.",
  paragraphs: [
    "EAN develops and hosts the campus. The project overview is released to qualified partners and investors under confidentiality, which is why the figures on this page stop where they do.",
  ],
  contents: [
    "Specification and campus layout",
    "Programme and construction sequence",
    "Commercial structure",
  ],
  // Grounded in the PMO role in TEAM_MEMBERS, which covers aviation
  // infrastructure development.
  handledBy: "Requests are handled by EAN’s Project Management Office.",
  primaryCta: {
    text: "Request the project overview",
    href: CONTACT_HREF,
  },
  secondaryCta: {
    text: "How EAN operates today",
    href: "/about",
  },
};

// ============================================================================
// SEO
// ============================================================================

/**
 * Kept here beside the copy it describes rather than in PAGE_SEO, so the whole
 * page reads from one file. `satisfies` still enforces the buildMetadata input
 * shape, and the type import is erased at compile time — no runtime coupling to
 * lib/seo.ts.
 */
export const AEROPLEX_SEO = {
  title: "The EAN Aeroplex | Integrated Airside Campus at Lagos MMIA",
  description:
    "EAN is building the Aeroplex, an integrated airside campus at Murtala Muhammed International Airport, Lagos — around 60,000 sqm of hangars, executive terminal, maintenance, catering and cargo. Under construction since June 2026.",
  path: AEROPLEX_PATH,
  image: "/images/runway.jpg",
} satisfies PageSeoInput;
