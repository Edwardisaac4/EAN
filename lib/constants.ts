// ============================================================================
// Types & Interfaces
// ============================================================================

import type { MapPin } from "@/lib/maps";

export interface NavDropdownItem {
  name: string;
  href: string;
}

export interface NavItem {
  name: string;
  href: string;
  dropdownItems?: NavDropdownItem[];
}

export interface HeroSlide {
  id: number;
  eyebrow: string;
  title: string;
  /**
   * Steps the headline type ladder down one stop. The default ladder is tuned
   * for the two-or-three-word titles most slides carry; a longer one reaches the
   * container edge at `xl` and wraps into a third line. Set this per slide
   * rather than shrinking the ladder for all four.
   */
  titleScale?: "compact";
  subtitle: string;
  bullets?: string[];
  image: string;
  primaryCta: {
    text: string;
    href: string;
  };
  /**
   * Optional. A slide whose second route is already covered by the first —
   * maintenance, where hangarage sits inside the same service page — carries the
   * primary button alone rather than padding the pair out with a near-duplicate.
   */
  secondaryCta?: {
    text: string;
    href: string;
  };
}

export interface TrustStat {
  /**
   * The headline figure, rendered as text rather than counted up: every one is a
   * year, a ratio or a certification acronym, none of which is a quantity a
   * counter could meaningfully climb to.
   */
  figure: string;
  /** Short form, for the compact homepage band. */
  label: string;
  /**
   * Sentence form for the about-page metric cards, where the card has room for
   * more than the band does. Falls back to `label` when the two would match.
   */
  description?: string;
}

export interface BlogPostMock {
  title: string;
  category: string;
  excerpt: string;
  publishedAt: string;
  image: string;
  slug: string;
}

export interface ServiceRichData {
  slug: string;
  name: string;
  tabLabel?: string;
  eyebrow?: string;
  short: string;
  iconName:
    | "Plane"
    | "Wrench"
    | "BadgeCheck"
    | "UtensilsCrossed"
    | "Star"
    | "Building2";
  extendedDescription: string;
  stats?: string[];
  features: string[];
  image: string;
  /**
   * `object-position` for the homepage showcase, where the image is a
   * full-bleed background in a ~2.3:1 slot. The FBO, maintenance and charter
   * shots are 400x560 portraits: cover keeps only the middle ~30% of their
   * height, which in all three is empty sky or ceiling above the subject.
   * Anchoring low pulls the aircraft and engineers back into frame. Passed as
   * an inline style, not a Tailwind class — Tailwind cannot statically detect
   * a class name built from data.
   */
  imagePosition?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  /**
   * A request form dedicated to this service, where one exists. Rendered as the
   * leading CTA on `/services/[slug]`, ahead of the general contact-form
   * inquiry. Only Charter has one today (`/charter`); every other service is
   * served by `/contact?service=<slug>`, so leave this unset for them rather
   * than pointing it back at the contact page and duplicating that button.
   */
  requestFormHref?: string;
  requestFormText?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface OfficeInfo {
  title: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  /** Drives the contact-page map and every "get directions" link. */
  map: MapPin;
}

export interface Article {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  publishedAt: string;
  readTime: string;
  image: string;
  isFeatured?: boolean;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  category?: string;
  story?: string[];
  highlights?: string[];
  image?: string;
  /**
   * How `image` should sit in the card's picture box. Omit for photography,
   * which fills the box edge to edge. Set "contain" for a partner logo: the
   * box is portrait and the marks run from square to 6:1, so cropping one to
   * fill would blow it up and slice the wordmark in half. A contained logo also
   * drops the photo scrim, which only exists to keep white type legible.
   */
  imageFit?: "contain";
  /**
   * Off-site press coverage of the milestone, surfaced as a source link in the
   * read modal. Optional because most milestones are only documented in EAN's
   * own archives; set it where a third party published the announcement, so the
   * claim in `story` is checkable rather than asserted.
   */
  sourceUrl?: string;
  /** Overrides the modal's default link text. Name the publisher. */
  sourceLabel?: string;
}

export interface ValuePillar {
  icon: string;
  title: string;
  description: string;
  image?: string;
}

export interface CredentialItem {
  icon: string;
  title: string;
  description: string;
}

export interface CommitteeMember {
  name: string;
  role: string;
  image: string;
  bio: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department:
    | "Executive"
    | "Operations"
    | "Finance"
    | "Marketing"
    | "Maintenance"
    | "Quality and safety"
    | "Quality & Safety"
    | "IT & Business Intelligence"
    | "Facilities"
    | "Legal"
    | "Human Resources";
  departmentLabel: string;
  image: string;
  quote?: string;
  bio: string[];
  credentials: string[];
  highlights?: { label: string; value: string }[];
}

// ============================================================================
// Navigation Constants
// ============================================================================

/**
 * Primary navigation. Order is deliberate and set by the business.
 *
 * 'Insights' is a label change only: the route stays /blog, because the posts,
 * sitemap entries and every published /blog/[slug] URL live there. Renaming the
 * segment would break live links for no reader-facing gain.
 *
 * Privacy Policy and Terms of Use were dropped from the About Us dropdown and
 * are reached from the footer bottom bar instead, where legal links belong.
 */
export const NAV_ITEMS: NavItem[] = [
  { name: "Home", href: "/" },
  {
    name: "About Us",
    href: "/about",
    dropdownItems: [
      { name: "Our Team", href: "/team" },
      { name: "History", href: "/history" },
    ],
  },
  {
    name: "Services",
    href: "/services",
    dropdownItems: [
      { name: "FBO & Ground Handling", href: "/services/fbo-ground-support" },
      { name: "Aircraft Maintenance", href: "/services/aircraft-maintenance" },
      { name: "Aircraft Sales & Leasing", href: "/services/aircraft-sales-leasing" },
      { name: "Aircraft Charter", href: "/services/aircraft-charter" },
      { name: "Leased Offices", href: "/services/leased-offices" },
      { name: "Wings™ In-Flight Catering", href: "/services/wings-catering" },
      { name: "VIP Lounges", href: "/services/vip-lounge" },
    ],
  },
  { name: "The Aeroplex", href: "/the-aeroplex" },
  { name: "Pricing", href: "/pricing" },
  { name: "Insights", href: "/blog" },
  { name: "Contact Us", href: "/contact" },
];

export const NAV_CTA = {
  name: "Make an Inquiry",
  href: "/contact",
};

export const FOOTER_SERVICES_LINKS = [
  { name: "FBO & Ground Handling", href: "/services/fbo-ground-support" },
  { name: "Aircraft Maintenance", href: "/services/aircraft-maintenance" },
  { name: "Aircraft Sales & Leasing", href: "/services/aircraft-sales-leasing" },
  { name: "Aircraft Charter", href: "/services/aircraft-charter" },
  { name: "Leased Offices", href: "/services/leased-offices" },
  { name: "Wings Catering", href: "/services/wings-catering" },
  { name: "VIP Lounges", href: "/services/vip-lounge" },
  { name: "Pricing", href: "/pricing" },
];

export const FOOTER_COMPANY_LINKS = [
  { name: "About", href: "/about" },
  { name: "History", href: "/history" },
  { name: "Our Team", href: "/team" },
  { name: "The Aeroplex", href: "/the-aeroplex" },
  { name: "Insights", href: "/blog" },
  { name: "Security & Data Protection", href: "/privacy-policy" },
  { name: "Contact", href: "/contact" },
];

// ============================================================================
// Homepage & Hero Constants
// ============================================================================

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    eyebrow: "Nigeria's First Fully Integrated FBO",
    title: "Elevating Every\nJourney",
    subtitle:
      "FBO Services · Aircraft Charter · NCAA-Approved\nMaintenance · VIP Ground Handling",
    bullets: [
      "FBO Services",
      "Aircraft Charter",
      "NCAA-Approved Maintenance",
      "VIP Ground Handling",
    ],
    image: "/images/Sliders/First Slide.jpg",
    primaryCta: {
      text: "Make an Inquiry",
      href: "#contact-section",
    },
    secondaryCta: {
      text: "Explore Services",
      href: "#services-section",
    },
  },
  {
    id: 2,
    eyebrow: "Exclusive Private Flight Solutions",
    title: "Precision in Flight,\nLuxury in Detail",
    subtitle:
      "Experience bespoke jet and helicopter chartering tailored to\nyour schedule and designed for ultimate comfort.",
    image: "/images/charter-cabin.jpg",
    primaryCta: {
      text: "Request a Charter",
      // /charter now exists and takes the route, date and passenger count the
      // desk cannot quote without — none of which the contact form asks for.
      // "Request" over "Book" because the destination is still an inquiry form,
      // not a booking engine: the label has to match what the click does.
      href: "/charter",
    },
    secondaryCta: {
      text: "Our Services",
      href: "/services",
    },
  },
  {
    id: 3,
    eyebrow: "NCAA-Approved Maintenance Organisation",
    // "Documented", not "Uncompromising". Same reasoning as TRUST_STATS below:
    // an unqualified absolute has no citable basis, while the NCAA-AMO approval
    // and its audit records are a fact a visitor can check. Do not restore it.
    title: "Safety and Standards,\nDocumented",
    // Longest first line of the four ("Safety and Standards," at 21 characters).
    titleScale: "compact",
    subtitle:
      "West Africa's certified maintenance hub keeping business jets\nand commercial fleets flying safely.",
    image: "/images/Sliders/Fourth Slide.jpg",
    primaryCta: {
      text: "Maintenance Services",
      href: "/services/aircraft-maintenance",
    }
  },
  {
    id: 4,
    eyebrow: "Nigeria's Premier FBO Hangar & VIP Lounge",
    title: "The EAN Way of\nDeparture",
    subtitle:
      "Enjoy the luxury of Lagos airport's dedicated VIP private terminal,\naccompanied by Wings™ freshly prepared in-flight catering.",
    image: "/images/Sliders/Vip Lounge.jpeg",
    primaryCta: {
      text: "VIP Lounge Experience",
      href: "/services/vip-lounge",
    },
    secondaryCta: {
      text: "In-Flight Catering",
      href: "/services/wings-catering",
    },
  },
];

/**
 * The four KPIs published on both the homepage band and the about-page metric
 * cards. One array feeds both so the two surfaces cannot drift apart — the
 * failure mode the August 2026 content sign-off found repeatedly, where the same
 * claim was published in three different wordings.
 *
 * Each figure is a checkable fact rather than a score: a date, a certification,
 * a coverage window, an on-site facility. "15+ Years of Excellence" and "100%
 * Flight Safety Record" were dropped for the same reason — an unqualified
 * absolute has no citable basis and becomes a published falsehood on the first
 * exception.
 */
export const TRUST_STATS: TrustStat[] = [
  {
    figure: "2011",
    label: "Founded in Lagos",
    description: "Founded in Lagos. Operating at MMIA since.",
  },
  {
    figure: "NCAA-AMO",
    label: "Approved Maintenance Organization",
  },
  {
    figure: "24/7",
    label: "Operations, Lagos and Abuja",
  },
  {
    figure: "Customs Clearance",
    label: "Customs Clearance Available",
    description: "Customs, Immigration and Quarantine, on-site",
  },
];

export interface PartnerLogo {
  name: string;
  logo: string;
}

// Order is deliberate and runs standards -> associations -> chambers of
// commerce, so the marquee reads as three groups rather than a shuffle. The
// filenames are historical and do not track the order; the names below are the
// logos' actual alt text, which is what a screen reader announces.
export const PARTNER_LOGOS: PartnerLogo[] = [
  // Safety and handling standards
  { name: "IS-BAH Registered", logo: "/images/partners/cc7.jpg" },
  { name: "Safety 1st", logo: "/images/partners/cc4.jpg" },
  { name: "NATA", logo: "/images/partners/cc2.jpg" },
  // Business aviation associations
  { name: "AfBAA", logo: "/images/partners/cc1.jpg" },
  { name: "NBAA", logo: "/images/partners/cc5.jpg" },
  { name: "EBAA", logo: "/images/partners/cc3.jpg" },
  // Bilateral chambers of commerce
  { name: "Nigerian-American Chamber of Commerce", logo: "/images/partners/nacc.jpg" },
  { name: "Nigerian Canadian Business Association", logo: "/images/partners/ncba.jpg" },
  { name: "CCI France Ghana", logo: "/images/partners/cci-france-ghana.png" },
  { name: "Nigerian-German Chamber of Commerce", logo: "/images/partners/ngcc.jpg" },
  // IBAC issues the IS-BAH standard, so on the marquee wrap it lands directly
  // before the IS-BAH seal that opens the list.
  { name: "IBAC", logo: "/images/partners/cc6.jpg" },
];

export const PARTNERS: string[] = PARTNER_LOGOS.map((p) => p.name);

// ============================================================================
// Services Data Constants
// ============================================================================

export const EAN_SERVICES = [
  {
    slug: "fbo-ground-support",
    name: "FBO & Ground Handling",
    short:
      "Operating Nigeria's first fully integrated Fixed Base Operator at MMIA, Lagos.",
    icon: "Plane",
  },
  {
    slug: "aircraft-maintenance",
    name: "Aircraft Maintenance",
    short:
      "An NCAA-approved Aircraft Maintenance Organization for business and commercial aircraft.",
    icon: "Wrench",
  },
  {
    slug: "aircraft-sales-leasing",
    name: "Aircraft Sales & Leasing",
    short:
      "Exclusive aircraft brokerage, fleet acquisitions, leasing structures, and authorized Airbus Helicopters distributorship.",
    icon: "BadgeCheck",
  },
  {
    slug: "aircraft-charter",
    name: "Aircraft Charter",
    short:
      "On-demand private jet and helicopter chartering tailored to your exact itinerary and schedule.",
    icon: "Plane",
  },
  {
    slug: "leased-offices",
    name: "Leased Offices",
    short:
      "Airside hangar bays, secured ramp parking, and fully serviced executive offices at MMIA, Lagos.",
    icon: "Building2",
  },
  {
    slug: "wings-catering",
    name: "Wings™ In-Flight Catering",
    short:
      "Our own kitchen and restaurant at the Jet Center, preparing bespoke in-flight catering.",
    icon: "UtensilsCrossed",
  },
  {
    slug: "vip-lounge",
    name: "VIP Lounges",
    short:
      "Private lounges at our Lagos terminal and Abuja location, away from the commercial concourse.",
    icon: "Star",
  },
] as const;

export const SERVICES_DATA: ServiceRichData[] = [
  {
    slug: "fbo-ground-support",
    name: "FBO & Ground Handling",
    tabLabel: "FBO & Ground Handling",
    short:
      "Operating Nigeria's first fully integrated Fixed Base Operator at MMIA, Lagos.",
    iconName: "Plane",
    extendedDescription:
      "Operating Nigeria's first fully integrated Fixed Base Operator at MMIA, Lagos. We provide direct passage from runway to terminal, delivering aircraft handling, fueling and ramp dispatch 24 hours a day.",
    stats: ["24/7 Dispatch Support", "IS-BAO Stage II Aligned"],
    features: [
      "Passenger and crew handling",
      "Direct airside terminal customs clearance",
      "Aircraft fueling and ground power (GPU)",
      "Secure hangar and ramp parking",
    ],
    image: "/images/services/fbo-jet-overwater.jpg",
    primaryButtonText: "MAKE AN INQUIRY",
    primaryButtonHref: "/contact?service=fbo-ground-support",
    secondaryButtonText: "BUILD YOUR QUOTE",
    secondaryButtonHref: "/pricing",
  },
  {
    slug: "aircraft-maintenance",
    name: "Aircraft Maintenance",
    tabLabel: "Aircraft Maintenance",
    short:
      "An NCAA-approved Aircraft Maintenance Organization for business and commercial aircraft.",
    iconName: "Wrench",
    extendedDescription:
      "An NCAA-approved Aircraft Maintenance Organization for business and commercial aircraft, operating from our integrated hangar at MMIA.",
    stats: ["NCAA AMO Certified", "AOG Rapid Response"],
    features: [
      "Scheduled line maintenance and inspections",
      "24/7 AOG logistics and field support",
      "Approved wheels and brakes workshop",
    ],
    image: "/images/services/s1-banner-maintenance-c-2.jpg",
    imagePosition: "50% 70%",
    primaryButtonText: "MAKE AN INQUIRY",
    primaryButtonHref: "/contact?service=aircraft-maintenance",
  },
  {
    slug: "aircraft-sales-leasing",
    name: "Aircraft Sales & Leasing",
    tabLabel: "Aircraft Sales & Leasing",
    short:
      "Exclusive aircraft brokerage, fleet acquisitions, leasing structures, and authorized Airbus Helicopters distributorship.",
    iconName: "BadgeCheck",
    extendedDescription:
      "Corporate aircraft sales brokerage, pre-purchase technical inspections, aircraft leasing structures, and acquisition advisory for owners entering or expanding in the region. As the exclusive distributor for Airbus Helicopters in West Africa, EAN provides end-to-end sales, leasing, and lifecycle support.",
    stats: ["Aircraft Sales & Leasing",],
    features: [
      "Executive jet and helicopter sales brokerage",
      "Bespoke aircraft leasing and financing advisory",
      "Pre-purchase technical inspections and airworthiness evaluation",
      "Authorized Airbus Helicopters dealership and factory support",
    ],
    image: "/images/services/aircraft-sles-and-charter.jpg",
    imagePosition: "50% 70%",
    primaryButtonText: "MAKE AN INQUIRY",
    primaryButtonHref: "/contact?service=aircraft-sales-leasing",
  },
  {
    slug: "aircraft-charter",
    name: "Aircraft Charter",
    tabLabel: "Aircraft Charter",
    short:
      "On-demand private jet and helicopter chartering tailored to your exact itinerary and schedule.",
    iconName: "Plane",
    extendedDescription:
      "On-demand jet and rotary-wing charter tailored to your schedule with bespoke flight solutions across West Africa and worldwide. Our dedicated flight operations team manages flight planning, overflight permits, and direct tarmac departures for HNIs, corporate leaders, and flight departments.",
    stats: ["On-Demand Charter", "24/7 Flight Dispatch"],
    features: [
      "Bespoke executive jet and helicopter charter",
      "Regional and international route planning",
      "Dedicated 24/7 flight dispatch and permit clearance",
      "Discreet VIP boarding and direct tarmac transfer",
    ],
    image: "/images/charter-cabin.jpg",
    imagePosition: "50% 50%",
    primaryButtonText: "REQUEST A CHARTER",
    primaryButtonHref: "/charter",
    requestFormHref: "/charter",
    requestFormText: "Request a Charter",
    secondaryButtonText: "MAKE AN INQUIRY",
    secondaryButtonHref: "/contact?service=aircraft-charter",
  },
  {
    slug: "leased-offices",
    name: "Leased Offices",
    tabLabel: "Leased Offices",
    short:
      "Secure, fully-equipped executive office and hangar space at Murtala Muhammed Airport.",
    iconName: "Building2",
    extendedDescription:
      "Premium office spaces and hangarage at the EAN Jet Center, designed for flight departments, charter companies, and aviation businesses.",
    stats: ["MMIA Airside Access", "Offices & Serviced Suites"],
    features: [
      "Flexible office configurations",
      "Furnished airside executive offices",
      "Secure access controlled building",
      "Shared boardrooms and conference amenities",
    ],
    image: "/images/services/office-space.jpg",
    primaryButtonText: "MAKE AN INQUIRY",
    primaryButtonHref: "/contact?service=leased-offices",
  },
  {
    slug: "wings-catering",
    name: "Wings™ In-Flight Catering",
    tabLabel: "Wings™ In-Flight Catering",
    short:
      "Our own kitchen and restaurant at the Jet Center, preparing bespoke in-flight catering.",
    iconName: "UtensilsCrossed",
    extendedDescription:
      "Our own kitchen and restaurant at the Jet Center, preparing bespoke in-flight catering for private aircraft and their crews.",
    stats: ["Airport On-Site Kitchen", "Gourmet Cabin Specialists"],
    features: [
      "Custom cabin menus",
      "Food safety controls and thermal packaging",
      "Dietary and allergen accommodation",
    ],
    image: "/images/new wings..jpg",
    primaryButtonText: "MAKE AN INQUIRY",
    primaryButtonHref: "/contact?service=wings-catering",
  },
  {
    slug: "vip-lounge",
    name: "VIP Lounges",
    tabLabel: "VIP Lounges",
    short:
      "Private lounges at our Lagos terminal and Abuja location, away from the commercial concourse.",
    iconName: "Star",
    extendedDescription:
      "Private lounges at our Lagos terminal and Abuja location, away from the commercial concourse, with ground transport arranged door to door.",
    stats: ["MMIA Private Airside Entry", "Fast-Track Escorts"],
    features: [
      "Private VIP terminal access",
      "Customs and Immigration assistance, on-site",
      "High-speed connectivity and quiet suites",
      "Chauffeur-driven tarmac transfers",
    ],
    image: "/images/vip-lounge.jpg",
    primaryButtonText: "MAKE AN INQUIRY",
    primaryButtonHref: "/contact?service=vip-lounge",
  },
];

// ============================================================================
// Blog & Articles Constants
// ============================================================================

/**
 * Published articles, newest first.
 *
 * These are the real posts migrated from the live WordPress site at ean.aero.
 * They replaced six placeholder entries that described articles which were never
 * written and, worse, asserted invented figures as fact — "a 24% increase in
 * point-to-point business jet movements over the past 18 months" among them.
 * Fabricated market data published under EAN's name is a liability, not filler.
 *
 * Body copy lives in lib/blog-content.ts, keyed by slug.
 */
export const ARTICLES_DATABASE: Article[] = [
  {
    slug: "understanding-ciq-business-aviation-international-flights",
    title:
      "Understanding CIQ in Business Aviation: Why It Matters for International Private Flights",
    category: "Business Aviation",
    excerpt:
      "CIQ — Customs, Immigration, and Quarantine — is the gateway to international business aviation. Understand what CIQ means, why it matters, and how EAN Aviation’s FBO services ensure your passengers clear borders efficiently and professionally.",
    publishedAt: "July 8, 2026",
    readTime: "9 min read",
    image: "/images/blog/ciq-passenger-arrival.jpg",
    isFeatured: true,
  },
  {
    slug: "in-loving-memory-of-eyitayo-aiyetan",
    title: "In Loving Memory of Eyitayo Aiyetan",
    category: "General",
    excerpt:
      "Honouring Eyitayo Aiyetan — Head of FBO Operations at EAN Aviation, a consummate aviation professional, mentor and bridge-builder across West and Central Africa.",
    publishedAt: "July 7, 2026",
    readTime: "4 min read",
    // Cut from the 2333×3500 studio original as a head-and-shoulders landscape
    // (1920×1029) rather than shipped full-height: the cover frame is landscape,
    // and a centre crop of the standing portrait framed his folded arms instead
    // of his face.
    //
    // Named -cover, not -portrait, deliberately. The first attempt replaced the
    // full-length file in place, and because images.minimumCacheTTL is a year
    // and the optimiser keys on (url, w, q), the old arms-only derivative kept
    // being served from cache. Re-crop this and you must rename it too.
    image: "/images/blog/tayo-aiyetan-cover.jpg",
  },
  {
    slug: "why-top-ceos-are-choosing-fbo-services-over-first-class",
    title: "Why Top CEOs are choosing FBO services over first class",
    category: "Business Aviation",
    excerpt:
      "Discover why top CEOs and executives are ditching first-class airline seats for FBO services. From time efficiency and privacy to productivity and prestige — here’s the business case for choosing FBO over commercial aviation.",
    publishedAt: "May 8, 2026",
    readTime: "6 min read",
    image: "/images/blog/fbo-hondajet-departure.jpg",
  },
  {
    slug: "private-jet-whole-ownership-vs-fractional-ownership-in-west-africa-which-model-makes-business-sense",
    title:
      "Private Jet Whole Ownership vs. Fractional Ownership in West Africa: Which Model Makes Business Sense?",
    category: "Business Aviation",
    excerpt:
      "In Nigeria’s high-stakes business environment, a private aircraft is no longer just a trophy asset. For executives in oil and gas, banking, and telecoms, it is a productivity multiplier.",
    publishedAt: "April 20, 2026",
    readTime: "6 min read",
    image: "/images/blog/ownership-whole.jpg",
  },
  {
    slug: "what-is-business-aviation-nigeria",
    title: "What Is Business Aviation? A Beginner’s Guide to Private Aviation in Nigeria",
    category: "Business Aviation",
    excerpt:
      "If you’ve ever seen a private jet taxi past a commercial aircraft and wondered, “How does this actually work?” you’re not alone. This guide breaks down the network of specialists, technology and logistics built to do one thing: optimise time.",
    publishedAt: "February 23, 2026",
    readTime: "8 min read",
    image: "/images/blog/business-aviation-definition.jpg",
  },
  {
    slug: "safety-innovations-business-aviation-nigeria-ean-aviation",
    title: "Safety Innovations in Business Aviation: How EAN Aviation Leads in Nigeria",
    category: "Business Aviation",
    excerpt:
      "Safety is the cornerstone of EAN Aviation’s operations, from the VIP lounge to the ramp to the hangar. How a Safety Management System aligned with ICAO recommendations underpins business aviation in Nigeria.",
    publishedAt: "December 17, 2025",
    readTime: "3 min read",
    image: "/images/blog/safety-innovations.jpg",
  },
  {
    slug: "how-business-aviation-is-fueling-economic-growth-in-africa",
    title: "How Business Aviation Is Fueling Economic Growth in Africa",
    category: "Business Aviation",
    excerpt:
      "Business aviation is more than a mode of transport. It is a catalyst for Africa’s economic transformation — connecting people, regions and opportunities that would otherwise remain isolated.",
    publishedAt: "July 1, 2025",
    readTime: "6 min read",
    image: "/images/blog/africa-growth-cover.jpg",
  },
];

/**
 * Homepage news strip. Derived rather than hand-maintained: the previous literal
 * duplicated three ARTICLES_DATABASE entries and had already drifted out of sync
 * with them — the same slug carried a different publish date in each list.
 */
export const MOCK_POSTS: BlogPostMock[] = ARTICLES_DATABASE.slice(0, 3).map(
  ({ title, category, excerpt, publishedAt, image, slug }) => ({
    title,
    category,
    excerpt,
    publishedAt,
    image,
    slug,
  }),
);

/**
 * Blog filter chips. Derived from the posts that actually exist, so the filter bar
 * can never offer a category that returns an empty list — the previous hardcoded
 * array listed 'FBO Services' and 'Industry News', both of which would now filter
 * to nothing.
 */
export const CATEGORIES: string[] = [
  "All",
  ...Array.from(new Set(ARTICLES_DATABASE.map((article) => article.category))),
];

// ============================================================================
// Contact & Office Constants
// ============================================================================

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How do I arrange overflight or landing permits with EAN?",
    answer:
      'Our dedicated flight support team manages permits and clearances across all West African airspace. You can coordinate directly with operations by emailing ops@ean.aero or selecting "Global Flight Support" in our contact form.',
  },
  {
    question: "What are the hangar and FBO capabilities at MMIA, Lagos?",
    answer:
      "EAN operates a fully secure, 24/7 FBO hangar at Murtala Muhammed International Airport. We support secure ramp parking, fueling, baggage handling, custom clearances, and passenger concierge services.",
  },
  {
    question: "How far in advance should I request a private charter flight?",
    answer:
      "For domestic flights within Nigeria, we can coordinate departures in 4 to 6 hours. For international routes, we recommend 24 to 48 hours to secure optimal slots, clearances, and custom approvals.",
  },
  {
    question: "Is EAN certified to maintain foreign-registered aircraft?",
    answer:
      "Yes, EAN is certified as an Approved Maintenance Organisation (AMO) under NCAA regulations. We also partner with international MRO networks to provide compliant line maintenance for foreign-registered jets.",
  },
];

export const LAGOS_HQ: OfficeInfo = {
  title: "Lagos Headquarters & Hangar",
  address:
    "EAN Aviation Hangar, Murtala Muhammed International Airport (MMIA), Ikeja, Lagos, Nigeria",
  phone: "+234 (0) 805 033 3410",
  email: "info@ean.aero",
  hours: "24/7 Flight Support Operations",
  map: {
    /*
     * Everything here comes from the real Google Business listing rather than
     * from geocoding, which never resolved: "FAAN Transit Camp Road" is in
     * neither Google's index nor OpenStreetMap as a searchable street.
     *
     * `embedUrl` is the listing's own Share -> Embed string with three fields
     * corrected, and it is the only reason the pin reads "EAN Aviation, FBO
     * (DNMM/LOS)" instead of a coordinate -- see lib/maps.ts for the field map.
     * As Google handed it over it was unusable: `1d` framed 16km of Lagos, and
     * the `2d` viewport centre sat ~2km west of the marker, so simply zooming
     * in would have pushed the pin off the frame. Re-centred on the marker and
     * pulled in to a 900m span.
     */
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d900!2d3.3254101" +
      "!3d6.5758589!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2" +
      "!1s0x103b910049e541a5%3A0xcbd0255dc73bdb8" +
      "!2sEAN%20Aviation%2C%20FBO%20(DNMM%2FLOS)!5e1!3m2!1sen!2sng" +
      "!4v1788439011454!5m2!1sen!2sng",
    /*
     * The marker coordinate Google resolves the listing to. Note it is ~38m
     * from where `plusCode` decodes: Google publishes one code in the address
     * text and pins the marker slightly off it. Both land on the same building.
     * Do not "reconcile" them -- each is authoritative for its own source, and
     * this pair is what the listing actually returns.
     */
    lat: 6.5758589,
    lng: 3.3254101,
    plusCode: "6FR5H8GG+C7R",
    label: "EAN Aviation, FBO (DNMM/LOS)",
    formattedAddress:
      "H8GG+C7R FAAN Transit Camp, Airport Rd, Ikeja 102214, Lagos",
    zoom: 17,
  },
};

// ============================================================================
// About Page Constants
// ============================================================================

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: "2011",
    // The founding and Wings™ are two cards but one year. The year is the part
    // that must not move: these were once dated 2009 and 2010, which put the
    // catering launch before the company existed. Keep both on 2011.
    title: "Founding & Nigeria's First Integrated FBO Hangar",
    category: "FOUNDING & FBO",
    image: "/images/EAN-Logo.png",
    imageFit: "contain",
    description:
      "EAN Aviation was established in Lagos, launching Nigeria’s first fully integrated Fixed Base Operator (FBO) hangar at Murtala Muhammed International Airport.",
    story: [
      "In 2011, EAN Aviation pioneered a new era for business aviation in West Africa by founding Nigeria’s first fully integrated Fixed Base Operator (FBO) and private jet hangar facility at Murtala Muhammed International Airport (MMIA), Lagos.",
      "Prior to EAN's launch, business jet operators, corporate executives, and private flight crews experienced significant operational bottlenecks, delayed ground turnarounds, and lack of dedicated airside security. EAN solved this by constructing a world-class 10,000 m² private ramp and hangar enclave, establishing a high-security, luxury gateway for international VIPs, diplomats, and corporate flight departments.",
    ],
    highlights: [
      "Established Nigeria's first integrated FBO & private hangar terminal.",
      "Created dedicated 10,000+ m² airside ramp parking for business aircraft.",
      "Set early industry benchmarks for private passenger privacy and swift turnarounds.",
    ],
  },
  {
    year: "2011",
    title: "Launched Wings™ In-flight Catering",
    category: "CATERING & HOSPITALITY",
    image: "/images/History/new wings.jpg",
    imageFit: "contain",
    description:
      "EAN Catering Limited — branded as Wings™ — opened as Nigeria’s first dedicated executive flight kitchen, on airport grounds at Murtala Muhammed International Airport.",
    story: [
      "EAN Catering Limited — branded as Wings™ — launched in 2011, the same year as the FBO, directly on airport grounds.",
      "Wings™ became the first dedicated luxury flight kitchen in Nigeria engineered exclusively for executive aircraft cabin service. Equipped with state-of-the-art thermal packaging, strict HACCP food safety protocols, and a team of international chefs, it serves custom menus onto private jet galleys moments before taxiing.",
    ],
    highlights: [
      "Launched Wings™, Nigeria's first dedicated executive aviation kitchen on MMIA grounds.",
      "HACCP food safety protocols and thermal packaging built for private jet galleys.",
      "Custom menus plated on airport grounds and loaded moments before taxi.",
    ],
  },
  {
    year: "2011",
    title: "Obtained NCAA Maintenance Approval",
    category: "ENGINEERING & CERTIFICATION",
    image: "/images/History/ncaa.png",
    imageFit: "contain",
    description:
      "Attained Approved Maintenance Organisation (AMO) status from the Nigerian Civil Aviation Authority (NCAA) to perform line maintenance and ground services.",
    story: [
      "In 2011, EAN achieved a major regulatory victory by securing official Approved Maintenance Organisation (AMO) status from the Nigerian Civil Aviation Authority (NCAA).",
      "This certification authorized EAN's team of certified licensed engineers to perform structured line maintenance, airworthiness inspections, and technical ground support for executive fleets operating across West Africa.",
      "By establishing local engineering expertise, EAN drastically reduced Aircraft-On-Ground (AOG) downtime for corporate operators who previously had to ferry aircraft overseas for routine maintenance.",
    ],
    highlights: [
      "Official NCAA AMO certification for business and commercial aircraft types.",
      "Full line maintenance, AOG emergency response, and airworthiness support.",
      "Significantly reduced operational maintenance downtime across West Africa.",
    ],
  },
  {
    year: "2012",
    title: "Cofounded African Business Aviation Association (AfBAA)",
    category: "INDUSTRY ADVOCACY",
    image: "/images/partners/afbaa.jpg",
    imageFit: "contain",
    description:
      "Co-founded AfBAA to promote international safety standards, regulatory alignment, and business aviation growth across the African continent.",
    story: [
      "In 2012, EAN Aviation co-founded the African Business Aviation Association (AfBAA), uniting leaders across the continent to promote business aviation as a catalyst for economic growth.",
      "Through AfBAA, EAN actively engaged civil aviation authorities, regional governments, and international safety bodies to advocate for harmonized airspace rules, infrastructure development, and reduced bureaucratic friction for business aircraft.",
      "EAN's leadership helped elevate African business aviation onto the global stage, attracting foreign direct investment and fostering inter-African trade.",
    ],
    highlights: [
      "Co-founder of AfBAA, shaping regional business aviation policy and safety standards.",
      "Advocated for harmonized cross-border flight clearances and airport access.",
      "Strengthened connections between African flight departments and global OEMs.",
    ],
  },
  {
    year: "2013",
    title: "First Exclusive Gulfstream Representative",
    category: "AIRCRAFT SALES & BROKERAGE",
    image: "/images/History/gulfstream.webp",
    imageFit: "contain",
    description:
      "Appointed as the first exclusive sales representative for Gulfstream Aerospace in West Africa, leading executive jet acquisitions and brokerage.",
    story: [
      "EAN Aviation marked a significant milestone in 2013 by being appointed as the first exclusive sales representative for Gulfstream Aerospace in West Africa.",
      "This partnership solidified EAN’s reputation as the premier aircraft sales brokerage in the region, connecting ultra-high-net-worth individuals and corporate entities with Gulfstream's fleet of long-range executive jets.",
      "EAN provided comprehensive acquisition advisory, pre-purchase technical inspections, cabin customisation guidance, and delivery logistics for buyers across the subcontinent.",
    ],
    highlights: [
      "Appointed exclusive Gulfstream Aerospace sales representative in West Africa.",
      "Advised on multi-million dollar executive jet acquisitions and fleet strategies.",
      "Delivered end-to-end pre-purchase technical inspections and delivery management.",
    ],
  },
  {
    year: "2014",
    title: "Convened Nigerian Business Aviation Conference (NBAC)",
    category: "THOUGHT LEADERSHIP",
    image: "/images/History/nbac.jpg",
    imageFit: "contain",
    description:
      "Inaugurated the Nigerian Business Aviation Conference (NBAC), creating West Africa's premier platform for aviation stakeholders and regulators.",
    story: [
      "In 2014, EAN Aviation conceptualized and convened the inaugural Nigerian Business Aviation Conference (NBAC) in Lagos.",
      "NBAC rapidly became the most prestigious annual gathering of aviation stakeholders in West Africa, bringing together aircraft manufacturers, regulatory heads, financiers, operators, and charter clients under one roof.",
      "The conference provided a vital, transparent forum to address industry regulatory frameworks, tax policies, infrastructure investments, and safety protocols required to scale business aviation.",
    ],
    highlights: [
      "Inaugurated NBAC as West Africa's leading annual business aviation summit.",
      "Brought together global OEMs, Nigerian CAA leaders, and executive fleet owners.",
      "Drove key industry policy reforms, safety dialogues, and investment initiatives.",
    ],
  },
  {
    year: "2016",
    title: "First African FBO On NATA Safety Map",
    category: "SAFETY & QUALITY ASSURANCE",
    image: "/images/History/Nata.jpg",
    imageFit: "contain",
    description:
      "Became the first FBO in Africa listed on the National Air Transportation Association (NATA) Safety 1st Map for exemplary ground safety standards.",
    story: [
      "In 2016, EAN Aviation earned global safety distinction by becoming the first Fixed Base Operator (FBO) in Africa to be featured on the National Air Transportation Association (NATA) Safety 1st Map.",
      "This international recognition validated EAN's rigorous ramp handling standards, continuous line training, fuel quality control, and zero-accident safety culture.",
      "Being listed on NATA Safety 1st gave international flight dispatchers and Fortune 500 corporate flight departments ultimate confidence when scheduling flight stops at Lagos MMIA.",
    ],
    highlights: [
      "First FBO in Africa recognized on the prestigious NATA Safety 1st Map.",
      "Validated international ground handling, towing, and fuel quality standards.",
      "Enhanced global confidence for international flight departments operating to Nigeria.",
    ],
  },
  {
    year: "2018",
    title: "Established Wheels and Brakes Maintenance Workshop",
    category: "MRO & WORKSHOP EXPANSION",
    image: "/images/services/s1-banner-maintenance-c-2.jpg",
    description:
      "Expanded engineering capabilities with an approved wheels and brakes workshop, delivering specialized component maintenance and rapid overhaul.",
    story: [
      "To deepen its Maintenance, Repair, and Overhaul (MRO) capabilities, EAN established a dedicated, NCAA-approved Wheels and Brakes Workshop at its MMIA facility in 2018.",
      "Equipped with specialized testing machinery, non-destructive testing (NDT) apparatus, and OEM spare parts inventory, the workshop enabled rapid turnaround times for tire changes, brake overhauls, and hub inspections.",
      "This specialized facility eliminated the high cost and week-long shipping delays previously associated with sending aircraft brake assemblies abroad.",
    ],
    highlights: [
      "NCAA-approved specialized workshop for aircraft wheel and brake assembly servicing.",
      "In-house Non-Destructive Testing (NDT) and precision pressure testing capabilities.",
      "Drastically reduced turnaround times from weeks to hours for corporate flight departments.",
    ],
  },
  {
    year: "2019",
    title: "Achieved IS-BAO Certification Stage 2",
    category: "GLOBAL SAFETY REGISTRATION",
    image: "/images/History/isbao.png",
    imageFit: "contain",
    description:
      "Achieved International Standard for Business Aircraft Operations (IS-BAO) Stage 2 registration, reinforcing international safety and operational compliance.",
    story: [
      "Demonstrating an unyielding commitment to operational excellence, EAN Aviation achieved IS-BAO (International Standard for Business Aircraft Operations) Stage 2 certification in 2019.",
      "IS-BAO Stage 2 requires rigorous independent safety audits verifying that an operator's Safety Management System (SMS) is actively functioning and embedded across all operational levels.",
      "This accreditation positioned EAN among an elite tier of global business aviation operators, adhering to the same safety standard required by top international corporations.",
    ],
    highlights: [
      "Achieved IS-BAO Stage 2 registration following comprehensive independent audits.",
      "Embedded advanced Safety Management System (SMS) across all flight and ground operations.",
      "Re-affirmed EAN's status as a top-tier global business aviation organization.",
    ],
  },
  {
    year: "2021",
    title: "First Exclusive Airbus Helicopter Distributors in Africa",
    category: "ROTARY-WING DISTRIBUTORSHIP",
    image: "/images/History/airbus.png",
    imageFit: "contain",
    description:
      "Appointed as exclusive distributors for Airbus Helicopters in the region, offering rotary-wing sales, MRO support, and fleet management.",
    story: [
      "In 2021, EAN Aviation expanded its rotary-wing portfolio by being appointed as the exclusive distributor for Airbus Helicopters in West Africa.",
      "This strategic milestone broadened EAN's offerings beyond fixed-wing jets to encompass corporate, VIP, and offshore utility helicopters across the region.",
      "EAN provides comprehensive helicopter sales support, customized cabin outfit advisories, factory warranties, and specialized MRO maintenance for Airbus helicopter owners.",
    ],
    highlights: [
      "Exclusive Airbus Helicopters dealership for West Africa.",
      "Expanded capabilities into executive, offshore, and emergency medical rotary transport.",
      "Full-lifecycle support including sales, factory warranties, and specialized servicing.",
    ],
    sourceUrl:
      "https://punchng.com/airbus-helicopters-nigerian-company-ink-partnership-deal/",
    sourceLabel: "Read The Punch’s report on the Airbus partnership",
  },
  {
    year: "2023",
    title: "Heliconia-EAN JV",
    category: "CHARTER & JOINT VENTURES",
    image: "/images/History/Heliconia.png",
    imageFit: "contain",
    description:
      "Formed a strategic joint venture with Heliconia to expand offshore helicopter transport and logistics across West Africa.",
    story: [
      "In 2023, EAN Aviation formed a joint venture with Heliconia, adding offshore rotary-wing capability alongside its fixed-wing operation.",
      "The Heliconia-EAN joint venture expanded offshore helicopter transport and logistics for West Africa’s energy and infrastructure sectors.",
      "The venture extended EAN’s capability beyond fixed-wing charter into offshore support flying, where the client is an operator rather than a passenger.",
    ],
    highlights: [
      "Formed Heliconia-EAN JV for offshore helicopter support in West Africa.",
      "Added offshore rotary transport and logistics to EAN’s operations.",
      "Extended operational reach into the energy and infrastructure sectors.",
    ],
    // The NCAA notice is dated 1 December 2025 and records the AOC award, not
    // the 2023 formation this card describes. It is the only third-party
    // documentation of the venture, so it is cited here as evidence the JV
    // operates — the label says what it covers rather than implying it
    // sources the 2023 date. Move it to a 2025 AOC milestone if one is added.
    sourceUrl:
      "https://ncaa.gov.ng/media/news/ncaa-presents-air-operator-certificate-to-heliconia-ean-aero-nigeria-limited/",
    sourceLabel: "NCAA: Air Operator Certificate awarded, December 2025",
  },
  {
    year: "2023",
    title: "EAN JETS",
    category: "CHARTER & JOINT VENTURES",
    image: "/images/History/new ean jets.jpg",
    imageFit: "contain",
    description:
      "Launched EAN JETS to bring executive jet charter booking and aircraft management under one operation.",
    story: [
      "In 2023, EAN Aviation launched EAN JETS, its executive charter and aircraft management arm.",
      "EAN JETS introduced high-capacity private jet charter management, giving owners one point of contact for booking, crewing and fleet oversight.",
      "The launch consolidated EAN’s charter capability across corporate and VIP luxury transport.",
    ],
    highlights: [
      "Launched EAN JETS to streamline executive charter booking and aircraft management.",
      "One point of contact for owners across booking, crewing and fleet oversight.",
      "Broadened operational reach across corporate and VIP luxury transport.",
    ],
  },
  {
    year: "2024",
    title: "Partnership with Banyan Air (Maintenance)",
    category: "MRO & ENGINEERING ALLIANCE",
    image: "/images/History/new banyan.png",
    imageFit: "contain",
    description:
      "EAN partners with Florida's award-winning Banyan Air Service to raise FBO service standards in Nigeria.",
    story: [
      "Announced at NBAA, Evergreen Apple Nigeria (EAN) has entered a partnership with Banyan Air Service",
      "Florida's award-winning FBO operator. Banyan will share its knowledge, resources and industry contacts to help EAN refine its systems, processes and customer service offering. Banyan has already completed an audit of EAN's operations, and EAN's operations and facilities leads will train at Banyan in January. A formal MoU is expected within the month.",
    ],
    highlights: [
      "AMO engineering alliance with renowned US operator Banyan Air Services.",
      "Training and technical exchange for EAN's maintenance and ground operations teams.",
      "Enhanced maintenance procedures and ground handling protocols.",
    ],
    sourceUrl:
      "https://www.banyanair.com/ean-nigerias-first-fbo-to-partner-with-banyan-air-service-in-florida/",
    sourceLabel: "Read Banyan Air Service's announcement",
  },

  // Split out of the combined 2024 "Banyan (Maintenance) & Archer (eVTOL)" card.
  // The copy below is the Archer half of that entry, carried over unchanged.
  // `docs/reviews/2026-08-18-content-signoff-brief.md` §45.6 holds an open
  // objection to it — Archer Aviation is NYSE-listed, and "partnered ... to
  // introduce eVTOL" claims more than a memorandum of understanding supports.
  // Tighten the wording here once the arrangement's status is confirmed.
  {
    year: "2024",
    title: "Partnership with Archer Aviation (eVTOL)",
    category: "FUTURE AIR MOBILITY",
    image: "/images/History/Archer.jpg",
    imageFit: "contain",
    description:
      "Partnered with Archer Aviation to introduce eVTOL electric air mobility in West Africa.",
    story: [
      "Positioning West Africa for the future of flight, EAN Aviation established a partnership with Archer Aviation in 2024.",
      "The partnership laid groundwork for introducing eVTOL (electric Vertical Takeoff and Landing) aircraft into Lagos' urban mobility network.",
      "It represents EAN’s commitment to sustainable aviation, urban air mobility, and next-generation electric flight infrastructure.",
    ],
    highlights: [
      "Urban Air Mobility partnership with Archer Aviation for eVTOL deployment.",
      "Committed to sustainable aviation and next-generation electric flight infrastructure.",
    ],
  },

  {
    year: "2026",
    title: "On-Site Customs and Immigration (CIQ) Launch",
    category: "TERMINAL CIQ CLEARANCE",
    image: "/images/vip-lounge.jpg",
    description:
      "Introduced dedicated on-site Customs, Immigration, and Quarantine (CIQ) facilities at the Lagos FBO for immediate, hassle-free international passenger clearance.",
    story: [
      "In 2026, EAN Aviation achieved a major milestone by establishing dedicated on-site Customs, Immigration, and Quarantine (CIQ) processing directly within the EAN Lagos FBO terminal.",
      "International passengers and flight crews no longer need to pass through commercial terminal channels. Full passport control, customs inspection, and security clearances are conducted inside EAN's private VIP lounge.",
      "This achievement takes passengers from runway to ground transport in under 5 minutes.",
    ],
    highlights: [
      "Dedicated airside CIQ clearance facilities inside the EAN Lagos FBO lounge.",
      "Direct runway-to-limousine international arrival and departure clearance.",
      "Eliminated commercial terminal transfer delays for HNWIs, diplomats, and flight crews.",
    ],
  },
];

export const VALUE_PILLARS: ValuePillar[] = [
  {
    icon: "ShieldCheck",
    title: "Safety & Compliance",
    description:
      "We operate to the highest international safety standards, backed by regular audits and NCAA approvals to provide absolute peace of mind.",
    image: "/images/about cards/about card4.jpg",
  },
  {
    icon: "Crown",
    title: "Tailored Service",
    description:
      "Every flight and terminal experience is tailored to the exact specifications, schedule, and lifestyle of our high-net-worth clients.",
    image: "/images/about cards/about card1.jpg",
  },
  {
    icon: "Clock",
    title: "Operational Precision",
    description:
      "We coordinate ground support, fueling, and maintenance with meticulous efficiency to guarantee on-time departures.",
    image: "/images/about cards/about card2.jpg",
  },
  {
    icon: "Globe",
    title: "Regional Leadership",
    description:
      "Deeply rooted in West Africa, we bridge regional aviation requirements with international flight support, AMO engineering, and charter services.",
    image: "/images/about cards/about card3.jpg",
  },
];

export const CREDENTIAL_ITEMS: CredentialItem[] = [
  {
    icon: "Building2",
    title: "MMIA Lagos FBO Hangar",
    description:
      "Secure, modern hangar facilities at Lagos airport providing private ramp access, terminal handling, and line support.",
  },
  {
    icon: "Award",
    title: "NCAA AMO Approval",
    description:
      "Officially certified Approved Maintenance Organisation under NCAA standards, staffed by certified aviation engineers.",
  },
  {
    icon: "CheckCircle2",
    title: "Aircraft Sales & Charter Advisory",
    description:
      "Tailored jet sales brokerage, acquisitions, and executive helicopter charter management across West Africa.",
  },
  {
    icon: "MapPin",
    title: "Global Flight Support",
    description:
      "Comprehensive trip support, overflight permits, landing clearances, and local ground logistics across West Africa.",
  },
];

export const COMMITTEE_MEMBERS: CommitteeMember[] = [
  {
    name: "Boyede Oyegbami",
    role: "Aviation Commercial Leader",
    image: "/images/about-jet.jpg",
    bio: [
      "Boyede Oyegbami is an accomplished aviation commercial leader with over a decade of experience driving business growth, customer acquisition, and operational excellence across leading energy and aviation fueling companies in Nigeria.",
      "Prior to joining EAN, Boyede served as Aviation Commercial Manager at Eternal Plc, leading aviation business start-up, regulatory compliance, and end-to-end jet fuel operations, achieving milestones such as first into-plane fueling within a year and onboarding five airline customers in five months.",
      "He holds an MSc in Environmental Consultancy from Newcastle University (UK) and a BSc in Microbiology from Bowen University, complemented by certifications from IATA, the British Safety Council, and IEMA. Skilled in contract negotiations, customer relationship management, and strategic sales growth.",
    ],
  },
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "segun-demuren",
    name: "Segun Demuren",
    role: "Founder & Chief Executive Officer",
    department: "Executive",
    departmentLabel: "CEO",
    image: "/images/leadership/sd-nbac.jpg",
    quote:
      "In executive aviation, luxury is not merely an aesthetic — it is the disciplined execution of uncompromising safety, total privacy, and absolute precision.",
    bio: [
      "Olusegun Demuren brings visionary leadership and strategic expertise to EAN Aviation, driving its evolution as a leading force in Africa’s private aviation sector.",
      "He holds a B.Sc. in Information Systems from Marist College, New York, and has completed executive programs at Lagos Business School and the International Air Transport Association (IATA) in Singapore.",
      "His professional journey began as a Systems Analyst with renowned Wall Street firms Sanford C. Bernstein Inc. and Alliance Capital LLC, where he developed strong capabilities in investment strategy and systems integration.",
      "Combining technological insight with a deep understanding of the aviation industry, he has positioned EAN Aviation at the forefront of innovation, service excellence, and operational precision, establishing it as a trusted name across the continent.",
    ],
    credentials: [
      "Founder & CEO",
      "Pioneer FBO Lagos",
      "20+ Yrs Executive Leadership",
      "NBAA & AfBAA Member",
    ],
    highlights: [
      { label: "Years of Aviation Vision", value: "20+" },
      { label: "1st Integrated FBO Hangar", value: "MMIA Lagos" },
      { label: "NCAA AMO Hangar", value: "MMIA Lagos" },
    ],
  },
  {
    id: "boyede-oyegbami",
    name: "Boyede Oyegbami",
    role: "Head, Sales",
    department: "Executive",
    departmentLabel: "Sales",
    image: "/images/leadership/boyede-nbac.jpg",
    quote:
      "Sustainable growth in aviation relies on rigorous contract discipline, trusted client relationships, and flawless fuel & flight operations.",
    bio: [
      "Boyede Oyegbami is an accomplished aviation commercial leader with over a decade of experience driving business growth, customer acquisition, and operational excellence across leading energy and aviation fueling companies in Nigeria.",
      "Prior to joining EAN, Boyede served as Aviation Commercial Manager at Eternal Plc, leading aviation business start-up, regulatory compliance, and end-to-end jet fuel operations, achieving milestones such as first into-plane fueling within a year and onboarding five airline customers in five months.",
      "He holds an MSc in Environmental Consultancy from Newcastle University (UK) and a BSc in Microbiology from Bowen University, complemented by certifications from IATA, the British Safety Council, and IEMA. Skilled in contract negotiations, customer relationship management, and strategic sales growth.",
    ],
    credentials: [
      "MSc Newcastle Univ",
      "IATA Certified",
      "10+ Yrs Aviation Commercial",
      "Contract Negotiation",
    ],
    highlights: [
      { label: "Corporate Client Retention", value: "98%" },
      { label: "Fueling Operational Audits", value: "100% Passed" },
    ],
  },
  {
    id: "josephine-kolawole",
    name: "Josephine Kolawole",
    role: "Head, Marketing",
    department: "Marketing",
    departmentLabel: "Marketing",
    image: "/images/leadership/Josephine Kolawole Head Marketing.jpg",
    quote:
      "Every marketing strategy begins with brand clarity — articulating our commitment to safety, luxury, and unmatched service in business aviation.",
    bio: [
      "Josephine Kolawole is a marketing leader with nearly a decade of experience driving brand growth across the technology and aviation sectors. As Head of Marketing at EAN Aviation, she leads brand strategy, integrated marketing communications, digital marketing, and public relations, delivering initiatives that strengthen brand visibility and support business growth.",
      "Prior to this, she led regional marketing initiatives across Central Africa at HP, overseeing multi-market campaigns, go-to-market strategies, and channel marketing. Josephine is passionate about building brands that create measurable business impact through strategic thinking, stakeholder engagement, and data-driven execution. She is currently pursuing a PhD, reflecting her commitment to continuous learning and leadership.",
    ],
    credentials: [
      "Brand Strategy Specialist",
      "Digital Marketing Director",
      "Corporate Communications",
    ],
    highlights: [
      { label: "Brand Reach Growth", value: "150%" },
      { label: "Media Engagement", value: "Top Tier" },
    ],
  },
  {
    id: "tunde-awe",
    name: "Tunde Awe",
    role: "Head, Project Management Office",
    department: "Executive",
    departmentLabel: "P.M.O",
    image: "/images/leadership/tunde-awe.jpg",
    quote:
      "Strategic project delivery in aviation relies on rigorous governance, cross-functional precision, and uncompromising quality control.",
    bio: [
      "Tunde oversees a multi-programme portfolio at EAN Aviation Group spanning aviation infrastructure development, charter operations, digital transformation, and new business development. He is building the PMO’s maturity as a strategic function within EAN.",
      "His strengths lie in critical thinking, stakeholder management, and problem-solving, aligning consultants, regulators, and internal teams toward shared outcomes. He brings hands-on execution to corporate goals, closing the gap between strategy and delivery.",
      "Tunde holds a BSc in Geology and is PRINCE2 Practitioner certified, with executive education in Systems Thinking (MIT), Developing and Financing Infrastructure Projects (Brickstone Africa), and AI Infrastructure & Operations (NVIDIA). He is currently completing the Senior Management Programme at Lagos Business School.",
    ],
    credentials: [
      "Head of PMO",
      "PRINCE2 Practitioner",
      "Aviation Infrastructure Specialist",
    ],
    highlights: [
      { label: "Project On-Time Delivery", value: "99%" },
      { label: "Capital Infrastructure Quality", value: "World Class" },
    ],
  },
  {
    id: "ann-umeh",
    name: "Ann Umeh",
    role: "Customer Relations Manager",
    department: "Operations",
    departmentLabel: "Customer Relations",
    image: "/images/leadership/Ann Umeh Client Relations Manager.jpg",
    quote:
      "Combining technical knowledge with a people-first approach to deliver consistent customer experiences that uphold elite standards.",
    bio: [
      "Ann Umeh is a dedicated Customer Relations professional known for building meaningful client connections and enhancing service excellence.",
      "She earned a bachelor’s degree in Computer Science from Lagos State University (LASU) and began her aviation career with a leading support service operator in Nigeria. Through her tenure as a Customer Relations Officer, Ann developed a strong foundation in client engagement and service management. She has since sharpened her skills with specialized training in project management, PLST, and leadership development.",
      "At EAN Aviation, Ann combines technical knowledge with a people-first approach to deliver consistent customer experiences that uphold the brand’s elite standards of service and responsiveness.",
    ],
    credentials: [
      "B.Sc. Computer Science (LASU)",
      "Project Management & Leadership Trained",
      "PLST Certified",
      "Customer Relations Specialist",
    ],
    highlights: [{ label: "Client Service Excellence", value: "Premium" }]
  },
  {
    id: "bukunola-hundeyin",
    name: "Olubukunola Hundeyin",
    role: "Head of Quality & Safety",
    department: "Quality & Safety",
    departmentLabel: "Quality & Safety",
    image: "/images/leadership/bukky-nbac.jpg",
    quote:
      "World-class aviation facilities depend on disciplined maintenance, security protocols, and operational readiness.",
    bio: [
      "Olubukunola Hundeyin is an accomplished Quality, Safety, and Compliance executive with nearly a decade of progressive leadership experience driving operational excellence, regulatory compliance, and continuous improvement within the aviation industry. As Head of Quality & Safety, she provides strategic leadership in quality assurance, safety management, compliance monitoring, and organizational performance, ensuring alignment with the Nigerian Civil Aviation Regulations (Nig. CARs), ICAO Standards and Recommended Practices (SARPs), and internationally recognized best practices.",
      "She holds a Bachelor's degree in Chemical Engineering from the University of Lagos and a Postgraduate Diploma in Quality Management from Robert Gordon University, Aberdeen, Scotland. A full member of the Nigerian Society of Engineers (NSE), Olubukunola combines technical expertise with strategic leadership to deliver sustainable business improvements and strengthen organizational resilience.",
      "Throughout her career, Olubukunola has led and contributed to high-impact quality, safety, and compliance initiatives across aviation operations. She has successfully driven the implementation and continual improvement of Quality Management Systems (QMS), strengthened compliance monitoring programmes, enhanced operational processes, and partnered with multidisciplinary teams to embed a culture of quality, safety, and accountability.",
      "Among her notable achievements is leading the successful maintenance of the International Standard for Business Aircraft Handling (IS-BAH) Stage II Certification through two consecutive certification cycles, demonstrating her commitment to operational excellence and international best practices. She also leads the implementation and continual enhancement of ISO-based Quality Management Systems, supporting improved organizational performance, customer satisfaction, and regulatory compliance.",
      "An American Society for Quality (ASQ) Certified Quality Auditor (CQA) and Certified Quality Improvement Associate (CQIA), Olubukunola also holds certifications in NEBOSH International General Certificate in Occupational Health and Safety, ISO 9001:2015 Lead Auditor, Quality Management Systems in Aviation, QMS Auditor/Lead Auditor, and Internal Auditing, reflecting her commitment to continuous professional development.",
      "Recognized for her collaborative leadership, integrity, and results-driven approach, Olubukunola is passionate about building high-performing teams, fostering a proactive safety culture, and implementing management systems that deliver measurable value. She remains committed to advancing quality and safety standards, strengthening regulatory compliance, and helping organizations achieve operational excellence in an evolving global aviation industry.",
    ],
    credentials: [
      "ASQ Certified Quality Auditor (CQA)",
      "ISO 9001:2015 Lead Auditor",
      "NEBOSH IGC Certified",
      "QMS & Safety Management Lead",
    ],
    highlights: [{ label: "Hangar & Terminal Uptime", value: "99.9%" }],
  },
  {
    id: "osayuwamen-abu",
    name: "Osayuwamen Abu",
    role: "Head, Business Intelligence & Revenue Controller",
    department: "IT & Business Intelligence",
    departmentLabel: "IT & BI",
    image: "/images/leadership/Yuwa.jpg",
    quote:
      "Data-driven insights and real-time revenue analytics empower strategic growth and operational efficiency.",
    bio: [
      "Yuwa Abu is a technology and data leader with almost a decade of experience delivering data, analytics, and digital transformation initiatives across the telecommunications, e-commerce, FMCG, and aviation industries. He specializes in using data and technology to improve decision-making, optimize business performance, and drive innovation through scalable enterprise solutions.",
      "He holds a Bachelor’s degree in Economics and Statistics from the University of Benin and is a Member of the Chartered Institute of Statisticians of Nigeria (CISON).",
    ],
    credentials: [
      "BSc Economics & Statistics (Uniben)",
      "Member, CISON",
      "Business Intelligence & Analytics Leader",
    ],
    highlights: [{ label: "Revenue Analytics Precision", value: "99.5%" }],
  },
  {
    id: "ineh-osikhekha",
    name: "Ineh Osikhekha",
    role: "Head, Facilities",
    department: "Facilities",
    departmentLabel: "Facilities",
    image: "/images/leadership/Ineh Osikhekha facilities manager (2) (1).jpg",
    quote:
      "Operational infrastructure must be reliable, secure, and engineered to accelerate executive movement.",
    bio: [
      "Ineh Osikhekha leads all lease, commercial strategy, aviation, and real estate infrastructure projects, facility management, and engineering functions at EAN Aviation, ensuring reliable facility management and infrastructure excellence.",
      "With over 15 years of expertise spanning civil construction, office planning, infrastructure management, energy management, transport & logistics, service charge management, health, safety, and security, he plays a pivotal role in sustaining operational integrity both within and beyond company premises. Ineh holds a Bachelor’s degree in Electrical & Electronic Engineering from the University of Benin and a Master’s in Facility Management from the University of Lagos.",
      "He is a member of the Nigeria Society of Engineers (MNSE) and the Council for the Regulation of Engineering in Nigeria (COREN). Ineh is also certified from the International Project Management Institute (PMI). He also holds certification in Systems Thinking from the Massachusetts Institute of Technology (MIT) and Developing Project Infrastructure from Brickstone Africa. Ineh’s leadership is defined by his technical precision and commitment to operational excellence, ensuring every facility reflects the company’s elite standards.",
    ],
    credentials: [
      "B.Eng Electrical & Electronic Engineering",
      "M.Sc. Facility Management",
      "MNSE & COREN Registered Engineer",
      "PMI & MIT Certified",
    ],
    highlights: [
      { label: "Operational Safety Audit Score", value: "100%" },
      { label: "Infrastructure Excellence", value: "15+ Yrs" },
    ],
  },
  {
    id: "vivian-okoh-olutunfese",
    name: "Vivian Okoh-Olutunfese",
    role: "Head, Legal Services",
    department: "Legal",
    departmentLabel: "Legal Services",
    image: "/images/leadership/Vivian Okoh-Olutunfese Head Legal Services.jpg",
    quote:
      "Navigating the complexities of international aviation demands precision, proactive engagement, and absolute regulatory alignment.",
    bio: [
      "Vivian is an experienced legal business partner with over 15 years of experience spanning private legal practice, in-house advisory, and corporate leadership within multinational organizations.",
      "Prior to joining EAN, Vivian served as Lead Corporate & Commercial Counsel at Baywood Holdings Limited, a pan-African conglomerate with interests across Oil & gas, financial services, and aviation. She has also held key legal roles at Hayat Kimya Nigeria Limited and CWAY Group, where she strengthened compliance frameworks and governance standards.",
      "Vivian holds a Master of Laws (LL.M.) from the University of Lagos, a Bachelor of Laws (LL.B.) from Olabisi Onabanjo University, and is a Barrister and Solicitor of the Supreme Court of Nigeria. She is also an Associate of the Chartered Institute of Secretaries and Administrators of Nigeria (ICSAN) and a member of the Nigerian Institute of Management (Chartered).",
      "Vivian is passionate about driving ethical business practices and using legal innovation to support strategic growth.",
    ],
    credentials: [
      "LL.M. (Unilag), LL.B., BL",
      "Associate, ICSAN",
      "Member, NIM (Chartered)",
      "15+ Yrs Corporate & Commercial Law",
    ],
    highlights: [
      { label: "Governance Compliance", value: "100%" },
      { label: "Corporate Advisory Experience", value: "15+ Years" },
    ],
  },
  {
    id: "alexey-saliu-lawal",
    name: "Alexey “Alyosha” Saliu-Lawal",
    role: "Hangar Manager",
    department: "Maintenance",
    departmentLabel: "Hangar & Maintenance",
    image: "/images/leadership/alexey-saliu-lawal.jpg",
    quote:
      "Ensuring that EAN's hangar and ground support operations run with precision, safety, and efficiency.",
    bio: [
      "Alexey Saliu-Lawal is an accomplished aviation engineer with over 21 years of combined experience spanning aircraft maintenance, facility management, and engineering project delivery across Nigeria's aviation and industrial sectors. Since joining EAN Aviation in 2011, first as Head, Facilities, and since 2014, as Hangar Manager, his technical leadership has ensured that EAN's hangar and ground support operations run with precision, safety, and efficiency.",
      "He holds a Nigerian Civil Aviation Authority (NCAA) Aircraft Maintenance Engineer's license with type ratings on the Challenger 601/604/605 series and GE CF-34-3B engines and completed EASA Part 66 (Category B1.1) approved training in Aircraft Maintenance Engineering at Air Service Training, Scotland. He is also a certified Level 2 Non-Destructive Testing (NDT) Inspector, trained in Penetrant, Magnetic Particle, and Eddy Current Inspection to EN4179/NAS410 standards, and holds a Wheels and Brakes qualification with Distinction from the Nigerian College of Aviation Technology, Zaria.",
      "Alexey oversees all aircraft maintenance, hangar, and ground service equipment operations with meticulous attention to safety, quality, and international best practice, including ICAO, NCAA, and IS-BAH standards, delivering engineering excellence that supports EAN's reputation for reliability and uncompromising service.",
    ],
    credentials: [
      "NCAA AME License (Challenger 601/604/605)",
      "EASA Part 66 (Cat B1.1) Training",
      "Certified Level 2 NDT Inspector",
      "21+ Yrs Aviation Engineering",
    ],
    highlights: [{ label: "Engineering Leadership", value: "21+ Years" }],
  },
  {
    id: "tomilara-adewale",
    name: "Oluwatomilara Adewale",
    role: "Manager, Human Resources",
    department: "Human Resources",
    departmentLabel: "Human Resources",
    image: "/images/leadership/Tomilara Adewale HR Manager.jpg",
    quote:
      "Bridging the gap between employee engagement and business objectives to maintain a culture of excellence and growth.",
    bio: [
      "Oluwatomilara Adewale is a seasoned Human Capital Practitioner and Change Leader, driving employee development and organizational growth with dedication and agility.",
      "She holds a B.Sc. in Management from the University of Nigeria (UNN) and is a certified and licensed HR Practitioner (HRPL). Oluwatomilara is also an associate member of the Chartered Institute of Personnel Management of Nigeria (ACIPM). Her career began in the Nigerian financial sector as a Customer Service Executive, where her commitment and expertise quickly earned her promotion to Customer Experience Manager.",
      "With over seven years of specialized experience in customer relations and human resources, she expertly bridges the gap between employee engagement and business objectives, maintaining a culture of excellence and growth at EAN Aviation.",
    ],
    credentials: [
      "B.Sc. Management (UNN)",
      "Certified HR Practitioner (HRPL)",
      "Associate Member, CIPM (ACIPM)",
      "7+ Yrs HR & Customer Experience",
    ],
    highlights: [{ label: "Specialized HR Experience", value: "7+ Years" }],
  },
  {
    id: "ahmed-kazeem",
    name: "Ahmed Kazeem",
    role: "Head, Finance",
    department: "Finance",
    departmentLabel: "Finance & Governance",
    image: "/images/leadership/Ahmed Kazeem Head Finance.jpg",
    quote:
      "Ensuring that EAN's financial engine runs with the same sophistication as our premium aviation services.",
    bio: [
      "Ahmed Kazeem is the financial architect behind EAN Aviation’s operational excellence. He has over 15 years of strategic financial leadership, bringing sharp acumen with refined precision to every balance sheet, investment decision, and fiscal strategy. A certified accountant and tax authority, Ahmed’s expertise ensures that EAN’s financial engine runs with the same sophistication as our premium aviation services.",
      "His academic pedigree spans top institutions: Ahmadu Bello University, University of Lagos,",
      "He is a steward of growth, guiding sustainable expansion with grace and discipline. From strategic planning to meticulous reporting, his stewardship ensures that every naira and dollar is aligned with our commitment to excellence.",
    ],
    credentials: [
      "Certified Accountant & Tax Authority",
      "ABU, Unilag & NYIF Alumnus",
      "15+ Yrs Strategic Financial Leadership",
    ],
    highlights: [{ label: "Financial Leadership", value: "15+ Years" }],
  },
  {
    id: "okechukwu-umeh",
    name: "Okechukwu Umeh",
    role: "Manager, Operations Support",
    department: "Operations",
    departmentLabel: "Operations Support",
    image: "/images/leadership/Okechukwu Umeh Operations Support Manager 2026.jpg",
    quote:
      "Maintaining the highest standards of safety, regulatory compliance, and service excellence across all operational touchpoints.",
    bio: [
      "Umeh Okechukwu serves as the operations support manager at EAN Aviation Limited, Nigeria's first fully integrated Fixed Base Operator (FBO) and maintenance organization, headquartered at Murtala Muhammed International Airport in Lagos.",
      "With over twelve years of experience in aviation operations, Okechukwu oversees the full scope of EAN Aviation's ground and flight service delivery, ensuring close coordination across VIP terminal operations, business jet charter services, aircraft maintenance, and the company's role as the authorized Airbus Helicopters distributor for West Africa.",
      "In this role, Okechukwu is responsible for maintaining the highest standards of safety, regulatory compliance, and service excellence across all operational touchpoints, from passenger and crew handling at the VIP terminal to charter flight logistics and maintenance turnaround. Okechukwu's leadership has been instrumental in positioning EAN Aviation as a benchmark for private and business aviation services in Nigeria and the broader West African region, supporting a growing base of corporate, government, and high-net-worth clients who rely on the company for discreet, efficient, and world-class aviation solutions.",
      "Drawing on a career built across various facets of aviation operations, Okechukwu combines technical expertise with a strong operational management background, driving continuous improvement in service delivery while ensuring EAN Aviation's operations align with international aviation safety and quality standards.",
    ],
    credentials: [
      "12+ Yrs Aviation Operations Management",
      "FBO & VIP Terminal Operations Lead",
      "Airbus Helicopters Distribution Operations",
    ],
    highlights: [{ label: "Operations Excellence", value: "12+ Years" }],
  },
  {
    id: "tosin-taiwo",
    name: "Oluwatosin Taiwo",
    role: "Ramp Manager",
    department: "Operations",
    departmentLabel: "Ramp Operations",
    image: "/images/leadership/Oluwatosin Taiwo Ramp Manager.jpg",
    quote:
      "Overseeing ground operations with a sharp focus on safety, efficiency, and resource optimization.",
    bio: [
      "Oluwatosin Taiwo is a skilled ramp manager, responsible for overseeing ground operations with a sharp focus on safety, efficiency, and resource optimization.",
      "He holds a bachelor’s degree in chemical engineering from Ladoke Akintola University of Technology and an MBA in finance management. Complemented by certifications in IATA Ground Operations Management, IATA Safety Management Systems, Workplace Safety & Health, and ISO 45001 Occupational Health & Safety, Oluwatosin brings comprehensive expertise to his role. He advises executive leadership on operational matters while serving as a human factors and ramp safety trainer.",
      "His leadership ensures that ground operations run smoothly, meeting the highest standards of safety and service excellence, reinforcing EAN Aviation’s commitment to impeccable operational precision.",
    ],
    credentials: [
      "B.Tech Chemical Engineering (LAUTECH)",
      "MBA Finance Management",
      "IATA Ground Operations & SMS Certified",
      "ISO 45001 Certified",
    ],
    highlights: [{ label: "Ramp Safety Record", value: "100%" }],
  },
];

export * from "./legal-constants";
