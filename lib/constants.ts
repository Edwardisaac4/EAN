// ============================================================================
// Types & Interfaces
// ============================================================================

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
  subtitle: string;
  image: string;
  primaryCta: {
    text: string;
    href: string;
  };
  secondaryCta: {
    text: string;
    href: string;
  };
}

export interface TrustStat {
  label: string;
  isNumeric: boolean;
  value: number;
  suffix?: string;
  staticText?: string;
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
  short: string;
  iconName: 'Plane' | 'Wrench' | 'BadgeCheck' | 'UtensilsCrossed' | 'Star' | 'Building2';
  extendedDescription: string;
  stats: string[];
  features: string[];
  image: string;
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
}

export interface ValuePillar {
  icon: string;
  title: string;
  description: string;
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
  department: 'executive' | 'operations' | 'engineering' | 'ground' | 'safety' | 'culinary';
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

export const NAV_ITEMS: NavItem[] = [
  { name: 'Home', href: '/' },
  { 
    name: 'About Us', 
    href: '/about',
    dropdownItems: [
      { name: 'History', href: '/history' },
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Terms of Use', href: '/terms-of-use' },
    ],
  },
  { name: 'Our Team', href: '/team' },
  { name: 'Services', href: '/services' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Blog', href: '/blog' },
];

export const NAV_CTA = {
  name: 'Inquiry',
  href: '/contact',
};

export const FOOTER_SERVICES_LINKS = [
  { name: 'FBO & Ground Support', href: '/services/fbo-ground-support' },
  { name: 'Aircraft Maintenance', href: '/services/aircraft-maintenance' },
  { name: 'Sales & Charter', href: '/services/aircraft-sales-charter' },
  { name: 'Wings™ Catering', href: '/services/wings-catering' },
  { name: 'VIP Lounge', href: '/services/vip-lounge' },
];

export const FOOTER_COMPANY_LINKS = [
  { name: 'About Us', href: '/about' },
  { name: 'Our Team', href: '/team' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact Us', href: '/contact' },
];

// ============================================================================
// Homepage & Hero Constants
// ============================================================================

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    eyebrow: "The Most Comprehensive Aviation Services Company in West Africa",
    title: "Elevating Every\nJourney",
    subtitle: "FBO Services · Aircraft Charter · NCAA-Approved\nMaintenance · VIP Ground Handling",
    image: "/images/hero/slide-1.png",
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
    subtitle: "Experience bespoke jet and helicopter chartering tailored to\nyour schedule and designed for ultimate comfort.",
    image: "/images/hero/slide-2.png",
    primaryCta: {
      text: "Book a Charter",
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
    title: "Uncompromising\nSafety & Standards",
    subtitle: "West Africa's certified maintenance hub keeping business jets\nand commercial fleets flying safely.",
    image: "/images/hero/slide-3.png",
    primaryCta: {
      text: "Maintenance Services",
      href: "/services/aircraft-maintenance",
    },
    secondaryCta: {
      text: "Hangar Facilities",
      href: "/services/leased-offices",
    },
  },
  {
    id: 4,
    eyebrow: "Nigeria's Premier FBO Hangar & VIP Lounge",
    title: "The EAN Way of\nDeparture",
    subtitle: "Enjoy the luxury of Lagos airport's dedicated VIP private terminal,\naccompanied by Wings™ freshly prepared in-flight catering.",
    image: "/images/hero/slide-4.png",
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

export const TRUST_STATS: TrustStat[] = [
  {
    label: 'Years of Excellence',
    isNumeric: true,
    value: 15,
    suffix: '+',
  },
  {
    label: 'NCAA Certification',
    isNumeric: false,
    value: 0,
    staticText: 'NCAA-AMO',
  },
  {
    label: 'Flight Safety Record',
    isNumeric: true,
    value: 100,
    suffix: '%',
  },
];

export interface PartnerLogo {
  name: string;
  logo: string;
}

export const PARTNER_LOGOS: PartnerLogo[] = [
  { name: 'NACC', logo: '/images/partners/nacc.jpg' },
  { name: 'NCBA', logo: '/images/partners/ncba.jpg' },
  { name: 'NGCC', logo: '/images/partners/ngcc.jpg' },
  { name: 'CFN Aviation', logo: '/images/partners/cfn.jpg' },
  { name: 'Corporate Partner 1', logo: '/images/partners/cc1.jpg' },
  { name: 'Corporate Partner 2', logo: '/images/partners/cc2.jpg' },
  { name: 'Corporate Partner 3', logo: '/images/partners/cc3.jpg' },
  { name: 'Corporate Partner 4', logo: '/images/partners/cc4.jpg' },
  { name: 'Corporate Partner 5', logo: '/images/partners/cc5.jpg' },
  { name: 'Corporate Partner 6', logo: '/images/partners/cc6.jpg' },
  { name: 'Corporate Partner 7', logo: '/images/partners/cc7.jpg' },
];

export const PARTNERS: string[] = PARTNER_LOGOS.map((p) => p.name);

// ============================================================================
// Services Data Constants
// ============================================================================

export const EAN_SERVICES = [
  {
    slug: 'fbo-ground-support',
    name: 'FBO & Ground Support',
    short: 'Aircraft passenger handling, fueling, and ramp services to the highest standard.',
    icon: 'Plane',
  },
  {
    slug: 'aircraft-maintenance',
    name: 'Aircraft Maintenance',
    short: 'NCAA-approved Maintenance Organisation (AMO) for business and commercial aircraft.',
    icon: 'Wrench',
  },
  {
    slug: 'aircraft-sales-charter',
    name: 'Aircraft Sales & Charter',
    short: 'Personalized jet and helicopter charter and bespoke aircraft sales experience.',
    icon: 'BadgeCheck',
  },
  {
    slug: 'wings-catering',
    name: 'Wings™ In-Flight Catering',
    short: 'Premium onsite catering dedicated to private jets — freshly prepared, every time.',
    icon: 'UtensilsCrossed',
  },
  {
    slug: 'vip-lounge',
    name: 'VIP Lounge Experience',
    short: "Lagos airport's premier dedicated VIP terminal — the EAN way of departure.",
    icon: 'Star',
  },
  {
    slug: 'leased-offices',
    name: 'Leased Office Spaces',
    short: 'Hangar bays and premium service-leased office spaces at MMIA, Lagos.',
    icon: 'Building2',
  },
] as const;

export const SERVICES_DATA: ServiceRichData[] = [
  {
    slug: 'fbo-ground-support',
    name: 'FBO & Ground Support',
    short: 'Aircraft passenger handling, fueling, and ramp services to the highest standard.',
    iconName: 'Plane',
    extendedDescription: 'Operating Nigeria’s first fully integrated Fixed Base Operator (FBO) at MMIA, Lagos. We provide a seamless transition from runway to terminal, delivering premier aircraft handling, fueling, and ramp dispatch 24/7/365.',
    stats: ['24/7 Dispatch Support', 'IS-BAO Stage II Aligned'],
    features: [
      'Bespoke passenger & crew handling',
      'Direct airside terminal custom clearance',
      'Aircraft fueling and ground power (GPU)',
      'Secure hangar and ramp parking'
    ],
    image: '/images/services/ean-service-banners-fbo.jpg',
  },
  {
    slug: 'aircraft-maintenance',
    name: 'Aircraft Maintenance',
    short: 'NCAA-approved Maintenance Organisation (AMO) for business and commercial aircraft.',
    iconName: 'Wrench',
    extendedDescription: 'Fully certified by the Nigerian Civil Aviation Authority (NCAA) as an Approved Maintenance Organisation. Our type-rated engineers maintain regional executive fleets with absolute safety compliance.',
    stats: ['NCAA AMO Certified', 'AOG Rapid Response'],
    features: [
      'Scheduled line maintenance & inspections',
      '24/7 AOG logistics and field support',
      'Avionics testing and minor repairs',
      'OEM part sourcing and storage'
    ],
    image: '/images/services/s1-banner-maintenance-c-2.jpg',
  },
  {
    slug: 'aircraft-sales-charter',
    name: 'Aircraft Sales & Charter',
    short: 'Personalized jet and helicopter charter and bespoke aircraft sales experience.',
    iconName: 'BadgeCheck',
    extendedDescription: 'Our private aircraft sales brokerage and charter desk coordinates executive jet acquisitions, pre-purchase technical inspections, and bespoke global charter itineraries on modern aircraft.',
    stats: ['Aircraft Sales Brokerage', 'Global Permit Desk'],
    features: [
      'Executive aircraft sales & charter advisory',
      'Private jet charter brokerage & schedules',
      'Pre-purchase inspections & evaluations',
      'Aircraft management & crew staffing'
    ],
    image: '/images/services/aircraft-sles-and-charter.jpg',
  },
  {
    slug: 'wings-catering',
    name: 'Wings™ In-Flight Catering',
    short: 'Premium onsite catering dedicated to private jets — freshly prepared, every time.',
    iconName: 'UtensilsCrossed',
    extendedDescription: 'Wings™ is EAN’s premier private kitchen dedicated entirely to executive aviation. We prepare gourmet menus right on airport grounds, delivering freshly plated cuisines straight to flight cabins.',
    stats: ['Airport On-Site Kitchen', 'Gourmet Cabin Specialists'],
    features: [
      'Custom luxury cabin menus',
      'Rigorous food safety & thermal packaging',
      'Strict dietary & allergen accommodations',
      'Direct ramp-to-aircraft delivery'
    ],
    image: '/images/services/wings-4.jpg',
  },
  {
    slug: 'vip-lounge',
    name: 'VIP Lounge Experience',
    short: "Lagos airport's premier dedicated VIP terminal — the EAN way of departure.",
    iconName: 'Star',
    extendedDescription: 'Depart and arrive in absolute peace. Our private executive terminal at MMIA, Lagos bypasses commercial congestion, housing quiet suites, premium bars, and direct airside escorts.',
    stats: ['MMIA Private Airside Entry', 'Fast-Track Escorts'],
    features: [
      'Bespoke VIP lounge suites',
      'Complimentary refreshments & drinks',
      'High-speed corporate Wi-Fi & quiet study',
      'Chauffeur-driven tarmac transfers'
    ],
    image: '/images/vip-lounge.png',
  },
  {
    slug: 'leased-offices',
    name: 'Leased Office Spaces',
    short: 'Hangar bays and premium service-leased office spaces at MMIA, Lagos.',
    iconName: 'Building2',
    extendedDescription: 'Premium commercial office spaces and executive boardrooms located right airside at Murtala Muhammed Airport. Perfect for flight departments, international operators, and logistic teams.',
    stats: ['MMIA Airside Access', 'Fully Serviced Suites'],
    features: [
      'Furnished executive offices',
      'Hangar bay leases for light aircraft',
      'Secure access-controlled building',
      'Shared boardrooms and conference amenities'
    ],
    image: '/images/services/office-space.jpg',
  },
];

// ============================================================================
// Blog & Articles Constants
// ============================================================================

export const ARTICLES_DATABASE: Article[] = [
  {
    slug: 'future-of-business-aviation-2026',
    title: 'The Future of Business Aviation: Private Jet Market Analysis',
    category: 'Business Aviation',
    excerpt: 'Key trends shaping executive air travel corridors, aircraft distribution, and fleet expansions in West Africa in 2026.',
    publishedAt: 'July 18, 2026',
    readTime: '6 min read',
    image: '/images/about-jet.png',
    isFeatured: true,
  },
  {
    slug: 'navigating-fbo-regulations-west-africa',
    title: 'Navigating FBO Ground Handling Regulations in West Africa',
    category: 'FBO Services',
    excerpt: 'An in-depth review of current regulatory compliances and key handling upgrades at major airport terminals.',
    publishedAt: 'July 15, 2026',
    readTime: '5 min read',
    image: '/images/vip-lounge.png',
  },
  {
    slug: 'safety-standards-inside-maintenance-hub',
    title: 'Uncompromising Safety Standards: Inside Our Maintenance Hub',
    category: 'Industry News',
    excerpt: 'How our NCAA-approved Aircraft Maintenance Organisation (AMO) ensures flight operations safety and precision.',
    publishedAt: 'July 10, 2026',
    readTime: '4 min read',
    image: '/images/charter-cabin.png',
  },
  {
    slug: 'bespoke-catering-in-flight-culinary',
    title: 'Bespoke Catering: Elevating the In-Flight Culinary Experience',
    category: 'General',
    excerpt: 'A sneak peek behind EAN\'s Wings™ Kitchen operations, crafting customized gourmet private jet menus.',
    publishedAt: 'July 05, 2026',
    readTime: '3 min read',
    image: '/images/charter-cabin.png',
  },
  {
    slug: 'vip-lounge-redefining-departure',
    title: 'MMIA VIP Lounge: Redefining Departure Congestion in Lagos',
    category: 'FBO Services',
    excerpt: 'A look inside the new fast-track executive terminal and lounge spaces designed for seamless travel.',
    publishedAt: 'June 28, 2026',
    readTime: '5 min read',
    image: '/images/vip-lounge.png',
  },
  {
    slug: 'choosing-right-corporate-helicopter',
    title: 'Choosing the Right Corporate Helicopter: A Purchaser\'s Guide',
    category: 'Business Aviation',
    excerpt: 'Key parameters to evaluate when selecting rotary aircraft, custom turbines, and regional ranges.',
    publishedAt: 'June 20, 2026',
    readTime: '7 min read',
    image: '/images/about-jet.png',
  },
];

export const MOCK_POSTS: BlogPostMock[] = [
  {
    title: 'Navigating FBO Ground Handling Regulations in West Africa',
    category: 'FBO Services',
    excerpt: 'An in-depth review of current regulatory compliances and key handling upgrades at major airport terminals.',
    publishedAt: 'July 18, 2026',
    image: '/images/vip-lounge.png',
    slug: 'navigating-fbo-regulations-west-africa',
  },
  {
    title: 'The Future of Business Aviation: Private Jet Market Analysis',
    category: 'Business Aviation',
    excerpt: 'Key trends shaping executive air travel corridors, aircraft distribution, and fleet expansions in 2026.',
    publishedAt: 'July 10, 2026',
    image: '/images/about-jet.png',
    slug: 'future-of-business-aviation-2026',
  },
  {
    title: 'Uncompromising Safety Standards: Inside Our Maintenance Hub',
    category: 'Industry News',
    excerpt: 'How our NCAA-approved Aircraft Maintenance Organisation (AMO) ensures flight operations safety.',
    publishedAt: 'June 28, 2026',
    image: '/images/charter-cabin.png',
    slug: 'safety-standards-inside-maintenance-hub',
  },
];

export const CATEGORIES: string[] = ['All', 'Business Aviation', 'FBO Services', 'Industry News', 'General'];

// ============================================================================
// Contact & Office Constants
// ============================================================================

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How do I arrange overflight or landing permits with EAN?',
    answer: 'Our dedicated flight support team manages permits and clearances across all West African airspace. You can coordinate directly with operations by emailing ops@ean.aero or selecting "Global Flight Support" in our contact form.',
  },
  {
    question: 'What are the hangar and FBO capabilities at MMIA, Lagos?',
    answer: 'EAN operates a fully secure, 24/7 FBO hangar at Murtala Muhammed International Airport. We support secure ramp parking, fueling, baggage handling, custom clearances, and passenger concierge services.',
  },
  {
    question: 'How far in advance should I request a private charter flight?',
    answer: 'For domestic flights within Nigeria, we can coordinate departures in 4 to 6 hours. For international routes, we recommend 24 to 48 hours to secure optimal slots, clearances, and custom approvals.',
  },
  {
    question: 'Is EAN certified to maintain foreign-registered aircraft?',
    answer: 'Yes, EAN is certified as an Approved Maintenance Organisation (AMO) under NCAA regulations. We also partner with international MRO networks to provide compliant line maintenance for foreign-registered jets.',
  },
];

export const LAGOS_HQ: OfficeInfo = {
  title: 'Lagos Headquarters & Hangar',
  address: 'EAN Aviation Hangar, Murtala Muhammed International Airport (MMIA), Ikeja, Lagos, Nigeria',
  phone: '+234 (0) 1 460 7310',
  email: 'info@ean.aero',
  hours: '24/7 Flight Support Operations',
};

// ============================================================================
// About Page Constants
// ============================================================================

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: "2009",
    title: "Founding & First Integrated FBO Hangar",
    category: "INFRASTRUCTURE & PIONEERING",
    image: "/images/hero/slide-1.png",
    description:
      "EAN Aviation was established in Lagos, launching West Africa’s first fully integrated Fixed Base Operator (FBO) hangar at Murtala Muhammed International Airport.",
    story: [
      "In 2009, EAN Aviation pioneered a new era for business aviation in West Africa by founding the region’s first fully integrated Fixed Base Operator (FBO) and private jet hangar facility at Murtala Muhammed International Airport (MMIA), Lagos.",
      "Prior to EAN's launch, business jet operators, corporate executives, and private flight crews experienced significant operational bottlenecks, delayed ground turnarounds, and lack of dedicated airside security. EAN solved this by constructing a world-class 10,000 m² private ramp and hangar enclave.",
      "This milestone laid the foundational bedrock for modern business aviation in Nigeria, establishing a high-security, luxury gateway for international VIPs, diplomats, and corporate flight departments."
    ],
    highlights: [
      "Established West Africa's first integrated FBO & private hangar terminal.",
      "Created dedicated 10,000+ m² airside ramp parking for business aircraft.",
      "Set early industry benchmarks for private passenger privacy and swift turnarounds."
    ]
  },
  {
    year: "2010",
    title: "Launched EAN Catering Limited",
    category: "LUXURY HOSPITALITY & CULINARY",
    image: "/images/services/wings-4.jpg",
    description:
      "Launched EAN Catering Limited (Wings™), establishing Nigeria's premier on-site executive aviation kitchen dedicated to gourmet in-flight dining.",
    story: [
      "Recognizing the vital importance of high-caliber culinary experiences for private jet travelers, EAN launched EAN Catering Limited (branded as Wings™) directly on airport grounds in 2010.",
      "Wings™ became the first dedicated luxury flight kitchen in Nigeria engineered exclusively for executive aircraft cabin service. Equipped with state-of-the-art thermal packaging, strict HACCP food safety protocols, and a team of international chefs, the kitchen transformed inflight dining.",
      "From custom-designed five-course menus to bespoke dietary accommodations, Wings™ ensures every meal is served at peak freshness directly onto private jet galleys moments before taxiing."
    ],
    highlights: [
      "Nigeria's first dedicated executive aviation kitchen located on MMIA grounds.",
      "Custom gourmet dining menus tailored for international flight operations.",
      "Strict thermal packaging & safety compliance for high-altitude luxury dining."
    ]
  },
  {
    year: "2011",
    title: "Obtained NCAA Maintenance Approval",
    category: "ENGINEERING & CERTIFICATION",
    image: "/images/services/s1-banner-maintenance-c-2.jpg",
    description:
      "Attained Approved Maintenance Organisation (AMO) status from the Nigerian Civil Aviation Authority (NCAA) to perform line maintenance and ground services.",
    story: [
      "In 2011, EAN achieved a major regulatory victory by securing official Approved Maintenance Organisation (AMO) status from the Nigerian Civil Aviation Authority (NCAA).",
      "This certification authorized EAN's team of certified licensed engineers to perform structured line maintenance, airworthiness inspections, and technical ground support for executive fleets operating across West Africa.",
      "By establishing local engineering expertise, EAN drastically reduced Aircraft-On-Ground (AOG) downtime for corporate operators who previously had to ferry aircraft overseas for routine maintenance."
    ],
    highlights: [
      "Official NCAA AMO certification for business and commercial aircraft types.",
      "Full line maintenance, AOG emergency response, and airworthiness support.",
      "Significantly reduced operational maintenance downtime across West Africa."
    ]
  },
  {
    year: "2012",
    title: "Cofounded African Business Aviation Association (AfBAA)",
    category: "INDUSTRY ADVOCACY",
    image: "/images/partners/nacc.jpg",
    description:
      "Co-founded AfBAA to promote international safety standards, regulatory alignment, and business aviation growth across the African continent.",
    story: [
      "In 2012, EAN Aviation co-founded the African Business Aviation Association (AfBAA), uniting leaders across the continent to promote business aviation as a catalyst for economic growth.",
      "Through AfBAA, EAN actively engaged civil aviation authorities, regional governments, and international safety bodies to advocate for harmonized airspace rules, infrastructure development, and reduced bureaucratic friction for business aircraft.",
      "EAN's leadership helped elevate African business aviation onto the global stage, attracting foreign direct investment and fostering inter-African trade."
    ],
    highlights: [
      "Co-founder of AfBAA, shaping regional business aviation policy and safety standards.",
      "Advocated for harmonized cross-border flight clearances and airport access.",
      "Strengthened connections between African flight departments and global OEMs."
    ]
  },
  {
    year: "2013",
    title: "First Exclusive Gulfstream Representative",
    category: "AIRCRAFT SALES & BROKERAGE",
    image: "/images/about-jet.png",
    description:
      "Appointed as the first exclusive sales representative for Gulfstream Aerospace in West Africa, leading executive jet acquisitions and brokerage.",
    story: [
      "EAN Aviation marked a significant milestone in 2013 by being appointed as the first exclusive sales representative for Gulfstream Aerospace in West Africa.",
      "This partnership solidified EAN’s reputation as the premier aircraft sales brokerage in the region, connecting ultra-high-net-worth individuals and corporate entities with Gulfstream's fleet of long-range executive jets.",
      "EAN provided comprehensive acquisition advisory, pre-purchase technical inspections, cabin customisation guidance, and delivery logistics for buyers across the subcontinent."
    ],
    highlights: [
      "Appointed exclusive Gulfstream Aerospace sales representative in West Africa.",
      "Advised on multi-million dollar executive jet acquisitions and fleet strategies.",
      "Delivered end-to-end pre-purchase technical inspections and delivery management."
    ]
  },
  {
    year: "2014",
    title: "Convened Nigerian Business Aviation Conference (NBAC)",
    category: "THOUGHT LEADERSHIP",
    image: "/images/partners/ncba.jpg",
    description:
      "Inaugurated the Nigerian Business Aviation Conference (NBAC), creating West Africa's premier platform for aviation stakeholders and regulators.",
    story: [
      "In 2014, EAN Aviation conceptualized and convened the inaugural Nigerian Business Aviation Conference (NBAC) in Lagos.",
      "NBAC rapidly became the most prestigious annual gathering of aviation stakeholders in West Africa, bringing together aircraft manufacturers, regulatory heads, financiers, operators, and charter clients under one roof.",
      "The conference provided a vital, transparent forum to address industry regulatory frameworks, tax policies, infrastructure investments, and safety protocols required to scale business aviation."
    ],
    highlights: [
      "Inaugurated NBAC as West Africa's leading annual business aviation summit.",
      "Brought together global OEMs, Nigerian CAA leaders, and executive fleet owners.",
      "Drove key industry policy reforms, safety dialogues, and investment initiatives."
    ]
  },
  {
    year: "2016",
    title: "First African FBO On NATA Safety Map",
    category: "SAFETY & QUALITY ASSURANCE",
    image: "/images/services/ean-service-banners-fbo.jpg",
    description:
      "Became the first FBO in Africa listed on the National Air Transportation Association (NATA) Safety 1st Map for exemplary ground safety standards.",
    story: [
      "In 2016, EAN Aviation earned global safety distinction by becoming the first Fixed Base Operator (FBO) in Africa to be featured on the National Air Transportation Association (NATA) Safety 1st Map.",
      "This international recognition validated EAN's rigorous ramp handling standards, continuous line training, fuel quality control, and zero-accident safety culture.",
      "Being listed on NATA Safety 1st gave international flight dispatchers and Fortune 500 corporate flight departments ultimate confidence when scheduling flight stops at Lagos MMIA."
    ],
    highlights: [
      "First FBO in Africa recognized on the prestigious NATA Safety 1st Map.",
      "Validated international ground handling, towing, and fuel quality standards.",
      "Enhanced global confidence for international flight departments operating to Nigeria."
    ]
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
      "This specialized facility eliminated the high cost and week-long shipping delays previously associated with sending aircraft brake assemblies abroad."
    ],
    highlights: [
      "NCAA-approved specialized workshop for aircraft wheel and brake assembly servicing.",
      "In-house Non-Destructive Testing (NDT) and precision pressure testing capabilities.",
      "Drastically reduced turnaround times from weeks to hours for corporate flight departments."
    ]
  },
  {
    year: "2019",
    title: "Achieved IS-BAO Certification Stage 2",
    category: "GLOBAL SAFETY REGISTRATION",
    image: "/images/contact-cta.png",
    description:
      "Achieved International Standard for Business Aircraft Operations (IS-BAO) Stage 2 registration, reinforcing international safety and operational compliance.",
    story: [
      "Demonstrating an unyielding commitment to operational excellence, EAN Aviation achieved IS-BAO (International Standard for Business Aircraft Operations) Stage 2 certification in 2019.",
      "IS-BAO Stage 2 requires rigorous independent safety audits verifying that an operator's Safety Management System (SMS) is actively functioning and embedded across all operational levels.",
      "This accreditation positioned EAN among an elite tier of global business aviation operators, adhering to the same safety standard required by top international corporations."
    ],
    highlights: [
      "Achieved IS-BAO Stage 2 registration following comprehensive independent audits.",
      "Embedded advanced Safety Management System (SMS) across all flight and ground operations.",
      "Re-affirmed EAN's status as a top-tier global business aviation organization."
    ]
  },
  {
    year: "2021",
    title: "First Exclusive Airbus Helicopter Distributors in Africa",
    category: "ROTARY-WING DISTRIBUTORSHIP",
    image: "/images/charter-cabin.png",
    description:
      "Appointed as exclusive distributors for Airbus Helicopters in the region, offering rotary-wing sales, MRO support, and fleet management.",
    story: [
      "In 2021, EAN Aviation expanded its rotary-wing portfolio by being appointed as the exclusive distributor for Airbus Helicopters in West Africa.",
      "This strategic milestone broadened EAN's offerings beyond fixed-wing jets to encompass corporate, VIP, and offshore utility helicopters across the region.",
      "EAN provides comprehensive helicopter sales support, customized cabin outfit advisories, factory warranties, and specialized MRO maintenance for Airbus helicopter owners."
    ],
    highlights: [
      "Exclusive Airbus Helicopters dealership for West Africa.",
      "Expanded capabilities into executive, offshore, and emergency medical rotary transport.",
      "Full-lifecycle support including sales, factory warranties, and specialized servicing."
    ]
  },
  {
    year: "2023",
    title: "Heliconia-EAN JV & EAN JETS Launch",
    category: "CHARTER & JOINT VENTURES",
    image: "/images/vip-lounge.png",
    description:
      "Formed a strategic joint venture with Heliconia and launched EAN JETS to expand offshore helicopter services and executive jet charter operations.",
    story: [
      "In 2023, EAN Aviation executed a twin expansion strategy: forming a high-impact joint venture with Heliconia and launching EAN JETS.",
      "The Heliconia-EAN joint venture expanded offshore helicopter transport and logistics for West Africa’s energy and infrastructure sectors. Concurrently, EAN JETS introduced high-capacity private jet charter management.",
      "This landmark year solidified EAN’s multi-platform capabilities across executive charter, offshore rotary transport, and fleet management."
    ],
    highlights: [
      "Formed Heliconia-EAN JV for offshore helicopter support in West Africa.",
      "Launched EAN JETS to streamline executive charter booking and aircraft management.",
      "Broadened operational reach across energy, corporate, and VIP luxury transport."
    ]
  },
  {
    year: "2024",
    title: "Partnership with Banyan (Maintenance) & Archer (eVTOL)",
    category: "FUTURE AIR MOBILITY",
    image: "/images/services/office-space.jpg",
    description:
      "Entered strategic maintenance alliances with Banyan Air Services and partnered with Archer Aviation to introduce eVTOL electric air mobility in West Africa.",
    story: [
      "Positioning West Africa for the future of flight, EAN Aviation established strategic partnerships with Banyan Air Services and Archer Aviation in 2024.",
      "The alliance with Banyan Air Services expanded MRO engineering cross-training and parts sharing. Meanwhile, the partnership with Archer Aviation laid groundwork for introducing eVTOL (electric Vertical Takeoff and Landing) aircraft into Lagos' urban mobility network.",
      "These partnerships represent EAN’s commitment to sustainable aviation, cutting-edge urban air mobility, and global engineering synergy."
    ],
    highlights: [
      "MRO engineering alliance with renowned US operator Banyan Air Services.",
      "Pioneered Urban Air Mobility partnership with Archer Aviation for eVTOL deployment.",
      "Committed to sustainable aviation and next-generation electric flight infrastructure."
    ]
  },
  {
    year: "2026",
    title: "On-Site Customs and Immigration (CIQ) Launch",
    category: "TERMINAL CIQ CLEARANCE",
    image: "/images/hero/slide-4.png",
    description:
      "Introduced dedicated on-site Customs, Immigration, and Quarantine (CIQ) facilities at the Lagos FBO for immediate, hassle-free international passenger clearance.",
    story: [
      "In 2026, EAN Aviation achieved a major milestone by establishing dedicated on-site Customs, Immigration, and Quarantine (CIQ) processing directly within the EAN Lagos FBO terminal.",
      "International passengers and flight crews no longer need to pass through commercial terminal channels. Full passport control, customs inspection, and security clearances are conducted inside EAN's private VIP lounge.",
      "This achievement delivers the ultimate seamless transition from runway to luxury ground transport in under 5 minutes."
    ],
    highlights: [
      "Dedicated airside CIQ clearance facilities inside the EAN Lagos FBO lounge.",
      "Direct runway-to-limousine international arrival and departure clearance.",
      "Eliminated commercial terminal transfer delays for HNWIs, diplomats, and flight crews."
    ]
  },
];

export const VALUE_PILLARS: ValuePillar[] = [
  {
    icon: 'ShieldCheck',
    title: 'Safety & Compliance',
    description: 'We operate to the highest international safety standards, backed by regular audits and NCAA approvals to provide absolute peace of mind.',
  },
  {
    icon: 'Crown',
    title: 'Bespoke Luxury',
    description: 'Every flight and terminal experience is tailored to the exact specifications, schedule, and lifestyle of our high-net-worth clients.',
  },
  {
    icon: 'Clock',
    title: 'Operational Precision',
    description: 'We coordinate ground support, fueling, and maintenance with meticulous efficiency to guarantee on-time, seamless departures.',
  },
  {
    icon: 'Globe',
    title: 'Regional Leadership',
    description: 'Deeply rooted in West Africa, we bridge regional aviation requirements with international flight support, MRO engineering, and luxury charter services.',
  },
];

export const CREDENTIAL_ITEMS: CredentialItem[] = [
  {
    icon: 'Building2',
    title: 'MMIA Lagos FBO Hangar',
    description: 'Secure, modern hangar facilities at Lagos airport providing private ramp access, terminal handling, and line support.',
  },
  {
    icon: 'Award',
    title: 'NCAA AMO Approval',
    description: 'Officially certified Approved Maintenance Organisation under NCAA standards, staffed by certified aviation engineers.',
  },
  {
    icon: 'CheckCircle2',
    title: 'Aircraft Sales & Charter Advisory',
    description: 'Tailored jet sales brokerage, acquisitions, and executive helicopter charter management across West Africa.',
  },
  {
    icon: 'MapPin',
    title: 'Global Flight Support',
    description: 'Comprehensive trip support, overflight permits, landing clearances, and local ground logistics across West Africa.',
  },
];

export const COMMITTEE_MEMBERS: CommitteeMember[] = [
  {
    name: 'Boyede Oyegbami',
    role: 'Aviation Commercial Leader',
    image: '/images/about-jet.png',
    bio: [
      'Boyede Oyegbami is an accomplished aviation commercial leader with over a decade of experience driving business growth, customer acquisition, and operational excellence across leading energy and aviation fueling companies in Nigeria.',
      'Prior to joining EAN, Boyede served as Aviation Commercial Manager at Eterna Plc, leading aviation business start-up, regulatory compliance, and end-to-end jet fuel operations, achieving milestones such as first into-plane fueling within a year and onboarding five airline customers in five months.',
      'He holds an MSc in Environmental Consultancy from Newcastle University (UK) and a BSc in Microbiology from Bowen University, complemented by certifications from IATA, the British Safety Council, and IEMA. Skilled in contract negotiations, customer relationship management, and strategic sales growth.'
    ]
  }
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'segun-demuren',
    name: 'Segun Demuren',
    role: 'Founder & Chief Executive Officer',
    department: 'executive',
    departmentLabel: 'Executive Office',
    image: '/images/Leadership/sd-nbac.jpg',
    quote: 'In executive aviation, luxury is not merely an aesthetic — it is the seamless execution of uncompromising safety, total privacy, and absolute precision.',
    bio: [
      'Segun Demuren is a pioneering Nigerian aviation entrepreneur, visionary leader, and the Founder & CEO of EAN Aviation — West Africa’s first fully integrated Fixed Base Operator (FBO) hangar and business jet maintenance facility located at Murtala Muhammed International Airport (MMIA), Lagos.',
      'With over two decades of executive experience across international aviation, energy, and corporate finance, Segun recognized the critical infrastructure gap in West African business flight. Under his leadership, EAN Aviation transformed from a groundbreaking vision into a world-class aviation conglomerate encompassing FBO ground handling, NCAA-approved maintenance (AMO), luxury VIP lounge operations, and jet charter services.',
      'A respected advocate for regional aviation governance, Segun actively serves on international business aviation advisory boards and continues to champion higher safety benchmarks, regulatory alignment, and infrastructural investment across the African continent.'
    ],
    credentials: ['Founder & CEO', 'Pioneer FBO Lagos', '20+ Yrs Executive Leadership', 'NBAA & AfBAA Member'],
    highlights: [
      { label: 'Years of Aviation Vision', value: '20+' },
      { label: '1st Integrated FBO Hangar', value: 'MMIA Lagos' },
      { label: 'NCAA AMO Hangar', value: 'MMIA Lagos' }
    ]
  },
  {
    id: 'boyede-oyegbami',
    name: 'Boyede Oyegbami',
    role: 'Commercial & Business Development Director',
    department: 'executive',
    departmentLabel: 'Commercial Leadership',
    image: '/images/about-jet.png',
    quote: 'Sustainable growth in aviation relies on rigorous contract discipline, trusted client relationships, and flawless fuel & flight operations.',
    bio: [
      'Boyede Oyegbami is an accomplished aviation commercial leader with over a decade of experience driving strategic business expansion, corporate client acquisition, and operational excellence across leading energy and aviation fueling enterprises in Nigeria.',
      'Prior to joining EAN, Boyede served as Aviation Commercial Manager at Eterna Plc, leading aviation business start-ups, regulatory compliance, and into-plane fueling operations, achieving milestones such as onboarding five major airline customers within five months.',
      'He holds an MSc in Environmental Consultancy from Newcastle University (UK) and a BSc in Microbiology from Bowen University, complemented by certifications from IATA, the British Safety Council, and IEMA.'
    ],
    credentials: ['MSc Newcastle Univ', 'IATA Certified', '10+ Yrs Aviation Commercial', 'Contract Negotiation'],
    highlights: [
      { label: 'Corporate Client Retention', value: '98%' },
      { label: 'Fueling Operational Audits', value: '100% Passed' }
    ]
  },
  {
    id: 'adewale-coker',
    name: 'Capt. Adewale Coker',
    role: 'Director of Flight Operations & Chief Pilot',
    department: 'operations',
    departmentLabel: 'Flight Operations',
    image: '/images/hero/slide-2.png',
    quote: 'Every flight plan begins long before engine start — precision weather tracking, aircrew discipline, and total situational readiness define our standard.',
    bio: [
      'Captain Adewale Coker brings over 18 years of command experience across corporate jets and international charter operations. As Director of Flight Operations, he oversees pilot crew training, flight crew scheduling, and operational compliance under NCAA and ICAO regulations.',
      'With over 9,500 flight hours logged on Bombardier Global, Gulfstream, and Hawker platforms, Captain Coker leads EAN’s flight operations team with an unwavering emphasis on safety management systems (SMS) and passenger comfort.'
    ],
    credentials: ['ATPL (NCAA & FAA)', 'Bombardier & Gulfstream Type Rated', '9,500+ Flight Hours', 'SMS Auditor'],
    highlights: [
      { label: 'Flight Command Hours', value: '9,500+' },
      { label: 'Safety Record', value: '100% Zero Incident' }
    ]
  },
  {
    id: 'tunde-adeleke',
    name: 'Engr. Tunde Adeleke',
    role: 'Head of Aircraft Maintenance (NCAA AMO)',
    department: 'engineering',
    departmentLabel: 'Maintenance & Engineering',
    image: '/images/hero/slide-3.png',
    quote: 'A mechanical component never lies. Airworthiness demands rigorous diagnostics, OEM precision, and zero tolerance for short-cuts.',
    bio: [
      'Engineer Tunde Adeleke leads EAN Aviation’s NCAA-certified Approved Maintenance Organisation (AMO) hangar facility at MMIA Lagos. He commands a multidisciplinary engineering team responsible for line maintenance, avionics troubleshooting, and scheduled inspections for business aircraft.',
      'Having completed specialized OEM training at Gulfstream, Bombardier, and Pratt & Whitney, Engr. Adeleke ensures every aircraft entering EAN hangars meets stringent international airworthiness directives.'
    ],
    credentials: ['NCAA Licensed Engineer', 'Gulfstream & Bombardier Certified', 'B1/B2 Avionics Specialist', '20 Yrs MRO Experience'],
    highlights: [
      { label: 'NCAA AMO Audit Pass Rate', value: '100%' },
      { label: 'Turnaround Efficiency', value: '< 24 Hours' }
    ]
  },
  {
    id: 'amina-ibrahim',
    name: 'Amina Ibrahim',
    role: 'Head of FBO Terminal & VIP Concierge',
    department: 'ground',
    departmentLabel: 'FBO & Concierge',
    image: '/images/vip-lounge.png',
    quote: 'The airport experience for executive travelers should be entirely effortless — discreet, instantaneous, and tailored to individual preference.',
    bio: [
      'Amina Ibrahim directs all ground handling, VIP lounge hospitality, and passenger protocol services at EAN’s private terminal in Lagos. She curates bespoke VIP itineraries for diplomats, executive charter clients, and international dignitaries.',
      'With a background in international luxury hospitality and protocol management, Amina has elevated EAN’s FBO terminal to be recognized as West Africa’s premier private gateway.'
    ],
    credentials: ['Protocol & Diplomatic Handling', 'IATA Passenger Ground Services', 'Luxury Hospitality Directorship'],
    highlights: [
      { label: 'VIP Passengers Accommodated', value: '12,000+' },
      { label: 'Average Customs/Lounge Time', value: '< 7 Mins' }
    ]
  },
  {
    id: 'samuel-oladipo',
    name: 'Capt. Samuel Oladipo',
    role: 'Head of Safety, Quality & Compliance',
    department: 'safety',
    departmentLabel: 'Safety & Compliance',
    image: '/images/hero/slide-1.png',
    quote: 'Safety is not a department — it is the operational culture that dictates every action from hangar floor to flight deck.',
    bio: [
      'Capt. Samuel Oladipo oversees EAN Aviation’s integrated Safety Management System (SMS), risk assessments, and regulatory audit compliance. He works directly with the NCAA, IATA, and international aviation safety bodies to maintain EAN’s flawless safety record.',
      'A former air transport safety inspector, Capt. Oladipo conducts routine emergency response drills, ramp safety checks, and continuous quality assurance monitoring.'
    ],
    credentials: ['ICAO SMS Manager', 'NCAA Certified Auditor', 'IS-BAO Lead Inspector', 'Flight Safety Specialist'],
    highlights: [
      { label: 'Operational Safety Audit Score', value: '100%' },
      { label: 'Continuous SMS Reviews', value: 'Quarterly' }
    ]
  },
  {
    id: 'jean-luc-laurent',
    name: 'Chef Jean-Luc Laurent',
    role: 'Executive Culinary Director, Wings™ Catering',
    department: 'culinary',
    departmentLabel: 'Wings™ Catering',
    image: '/images/hero/slide-4.png',
    quote: 'Dining at 40,000 feet requires culinary science — adjusting flavor profiles, precision cabin packaging, and uncompromised freshness.',
    bio: [
      'Chef Jean-Luc Laurent heads Wings™ Catering, EAN Aviation’s dedicated in-flight gourmet culinary unit. Trained in Michelin-starred French kitchens and corporate jet catering, Chef Jean-Luc crafts bespoke menus designed specifically for altitude flight performance.',
      'He oversees a state-of-the-art kitchen facility located adjacent to the FBO ramp, guaranteeing farm-to-cabin freshness for private charter operations.'
    ],
    credentials: ['Le Cordon Bleu Master Chef', 'HACCP Food Safety Certified', 'Ex-International Airlines Executive Chef'],
    highlights: [
      { label: 'Gourmet In-Flight Meals Delivered', value: '8,500+' },
      { label: 'Custom Menu Turnaround', value: '2 Hours' }
    ]
  },
  {
    id: 'olufemi-bakare',
    name: 'Olufemi Bakare',
    role: 'Head of Avionics & Technical Systems',
    department: 'engineering',
    departmentLabel: 'Maintenance & Engineering',
    image: '/images/contact-cta.png',
    quote: 'Modern flight decks depend on flawless digital integrity — satellite nav, radar, and telemetry must function with absolute fidelity.',
    bio: [
      'Olufemi Bakare leads EAN Aviation’s avionics engineering department. He specializes in flight management systems (FMS), satellite communications (Satcom), and radar diagnostics across business aircraft models including Honeywell Primus and Collins Pro Line suites.',
      'Olufemi brings 15 years of technical engineering experience in real-time troubleshooting and line maintenance updates for private jet fleets.'
    ],
    credentials: ['Avionics Systems Specialist', 'Honeywell & Collins Certified', 'NCAA Licensed B2 Engineer'],
    highlights: [
      { label: 'Avionics Diagnostic Accuracy', value: '99.8%' }
    ]
  },
  {
    id: 'blessing-nwachukwu',
    name: 'Blessing Nwachukwu',
    role: 'Head of Executive Customer Experience',
    department: 'ground',
    departmentLabel: 'Customer Experience',
    image: '/images/vip-lounge.png',
    quote: 'True service is anticipating needs before they are articulated, ensuring absolute privacy, comfort, and peace of mind.',
    bio: [
      'Blessing Nwachukwu directs customer relationship management, charter client concierge services, and executive account operations at EAN Aviation. She oversees client communications from initial flight inquiry through to ground arrival.',
      'Blessing has established long-standing partnerships with multinational corporate travel desks, HNWI family offices, and diplomatic missions across Africa.'
    ],
    credentials: ['Customer Centricity Leadership', 'Diplomatic Protocol Specialist', 'BA Mass Communications'],
    highlights: [
      { label: 'Client Satisfaction Index', value: '99.4%' }
    ]
  },
  {
    id: 'babatunde-lawal',
    name: 'Babatunde Lawal',
    role: 'Head of Ramp Operations & Ground Handling',
    department: 'ground',
    departmentLabel: 'FBO & Ramp Logistics',
    image: '/images/hero/slide-1.png',
    quote: 'On the tarmac, timing is everything. Fueling, baggage, GPU power, and marshaling must execute like clockwork.',
    bio: [
      'Babatunde Lawal commands EAN Aviation’s aircraft marshaling, aircraft tug, GPU ground power, and Into-Plane fueling teams on the MMIA Lagos apron.',
      'With over 14 years of heavy ramp management experience, Babatunde has safely coordinated turnaround ground handling for thousands of business jets and transient international aircraft.'
    ],
    credentials: ['IATA Ramp Operations Manager', 'NCAA Apron Safety Certified', 'Heavy Tug & Tow Specialist'],
    highlights: [
      { label: 'Ramp Turnarounds Executed', value: '15,000+' },
      { label: 'Ramp Safety Incident Rate', value: '0.00%' }
    ]
  },
  {
    id: 'chioma-okonkwo',
    name: 'Chioma Okonkwo',
    role: 'Head of Finance & Corporate Governance',
    department: 'executive',
    departmentLabel: 'Finance & Governance',
    image: '/images/about-jet.png',
    quote: 'Financial discipline and transparent corporate governance build the foundation that supports ambitious infrastructure expansion.',
    bio: [
      'Chioma Okonkwo leads financial planning, fiscal risk management, charter revenue accounting, and corporate governance at EAN Aviation.',
      'A Fellow of the Institute of Chartered Accountants of Nigeria (FCA), Chioma holds an MBA in Finance and oversees multi-currency flight invoicing, vendor contracts, and international audit compliance.'
    ],
    credentials: ['FCA Chartered Accountant', 'MBA Finance', '16+ Yrs Corporate Governance'],
    highlights: [
      { label: 'Fiscal Audit Accuracy', value: '100%' }
    ]
  },
  {
    id: 'david-vance',
    name: 'David Vance',
    role: 'Head of Aircraft Sales & Acquisitions',
    department: 'executive',
    departmentLabel: 'Aircraft Sales & Charter',
    image: '/images/hero/slide-2.png',
    quote: 'Acquiring an aircraft is an asset management strategy — matching performance profiles, pre-buy inspections, and total cost of ownership.',
    bio: [
      'David Vance manages EAN Aviation’s aircraft brokerage, pre-owned jet sales, and turbine helicopter acquisition deals across West Africa.',
      'With a background in global aircraft transaction advisory, David assists corporate entities and private individuals with aircraft sourcing, pre-purchase inspections, registration, and delivery.'
    ],
    credentials: ['International Aircraft Dealers Association (IADA) Specialist', 'Private Jet Acquisition Advisor'],
    highlights: [
      { label: 'Aircraft Transactions Closed', value: '$120M+' }
    ]
  },
  {
    id: 'victoria-adebayo',
    name: 'Victoria Adebayo',
    role: 'Head of Human Capital & Talent Development',
    department: 'executive',
    departmentLabel: 'Human Capital',
    image: '/images/contact-cta.png',
    quote: 'Our competitive advantage is our people — nurturing top-tier aviation talent, continuous technical training, and leadership development.',
    bio: [
      'Victoria Adebayo oversees talent acquisition, aviation crew training programs, employee relations, and organizational development across EAN Aviation.',
      'She ensures all operational personnel, engineers, flight dispatchers, and concierge staff undergo continuous international certification and safety training.'
    ],
    credentials: ['MCIPM Human Resource Professional', 'SHRM-SCP', 'Aviation Talent Strategist'],
    highlights: [
      { label: 'Staff Training Hours / Year', value: '4,500+' }
    ]
  },
  {
    id: 'ibrahim-bello',
    name: 'Ibrahim Bello',
    role: 'Head of Flight Dispatch & Overflight Logistics',
    department: 'operations',
    departmentLabel: 'Flight Operations',
    image: '/images/hero/slide-3.png',
    quote: 'Navigating international airspace requires precision clearance timing, real-time NOTAM updates, and instant diplomatic coordination.',
    bio: [
      'Ibrahim Bello manages EAN Aviation’s 24/7 flight dispatch unit, responsible for flight plan filings, overflight & landing permits across Africa, slot coordination, and diplomatic clearances.',
      'Ibrahim’s team maintains direct communication lines with civil aviation authorities across 40+ African and Middle Eastern nations.'
    ],
    credentials: ['NCAA Licensed Flight Dispatcher', 'ICAO Flight Plan Specialist', '24/7 Ops Coordinator'],
    highlights: [
      { label: 'Permit Approval Rate', value: '99.9%' },
      { label: 'Global Airspace Coverage', value: '40+ Countries' }
    ]
  },
  {
    id: 'temitope-alabi',
    name: 'Temitope Alabi',
    role: 'Head of Aviation IT & Digital Infrastructure',
    department: 'operations',
    departmentLabel: 'IT & Digital Systems',
    image: '/images/hero/slide-4.png',
    quote: 'Cybersecurity, real-time aircraft telemetry, and seamless digital booking platforms power modern aviation excellence.',
    bio: [
      'Temitope Alabi directs IT infrastructure, cybersecurity, flight tracking networks, and digital customer interfaces across EAN Aviation.',
      'Temitope leads the technical integration of EAN’s FBO management software, charter quote booking systems, and hangar security monitoring.'
    ],
    credentials: ['CISSP Cybersecurity Specialist', 'Aviation Tech Lead', 'MSc Information Systems'],
    highlights: [
      { label: 'System Uptime Rate', value: '99.99%' }
    ]
  }
];

export * from './legal-constants';
