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
  department: 'Executive' | 'Operations' | 'Finance' | 'Marketing' | 'Maintenance' | 'Quality and safety' | 'Quality & Safety' | 'IT & Business Intelligence' | 'Facilities' | 'Legal' | 'Human Resources';
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
  { name: 'Pricing', href: '/pricing' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Blog', href: '/blog' },
];

export const NAV_CTA = {
  name: 'Get a Quote',
  href: '/pricing',
};

export const FOOTER_SERVICES_LINKS = [
  { name: 'FBO & Ground Support', href: '/services/fbo-ground-support' },
  { name: 'Aircraft Maintenance', href: '/services/aircraft-maintenance' },
  { name: 'Sales & Charter', href: '/services/aircraft-sales-charter' },
  { name: 'Wings™ Catering', href: '/services/wings-catering' },
  { name: 'VIP Lounge', href: '/services/vip-lounge' },
  { name: 'Leased Office Spaces', href: '/services/leased-offices' },
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
    image: "/images/hero/slide-1.jpg",
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
    image: "/images/hero/slide-2.jpg",
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
    image: "/images/hero/slide-3.jpg",
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
    image: "/images/hero/slide-4.jpg",
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
    image: '/images/vip-lounge.jpg',
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
    image: '/images/about-jet.jpg',
    isFeatured: true,
  },
  {
    slug: 'navigating-fbo-regulations-west-africa',
    title: 'Navigating FBO Ground Handling Regulations in West Africa',
    category: 'FBO Services',
    excerpt: 'An in-depth review of current regulatory compliances and key handling upgrades at major airport terminals.',
    publishedAt: 'July 15, 2026',
    readTime: '5 min read',
    image: '/images/vip-lounge.jpg',
  },
  {
    slug: 'safety-standards-inside-maintenance-hub',
    title: 'Uncompromising Safety Standards: Inside Our Maintenance Hub',
    category: 'Industry News',
    excerpt: 'How our NCAA-approved Aircraft Maintenance Organisation (AMO) ensures flight operations safety and precision.',
    publishedAt: 'July 10, 2026',
    readTime: '4 min read',
    image: '/images/charter-cabin.jpg',
  },
  {
    slug: 'bespoke-catering-in-flight-culinary',
    title: 'Bespoke Catering: Elevating the In-Flight Culinary Experience',
    category: 'General',
    excerpt: 'A sneak peek behind EAN\'s Wings™ Kitchen operations, crafting customized gourmet private jet menus.',
    publishedAt: 'July 05, 2026',
    readTime: '3 min read',
    image: '/images/charter-cabin.jpg',
  },
  {
    slug: 'vip-lounge-redefining-departure',
    title: 'MMIA VIP Lounge: Redefining Departure Congestion in Lagos',
    category: 'FBO Services',
    excerpt: 'A look inside the new fast-track executive terminal and lounge spaces designed for seamless travel.',
    publishedAt: 'June 28, 2026',
    readTime: '5 min read',
    image: '/images/vip-lounge.jpg',
  },
  {
    slug: 'choosing-right-corporate-helicopter',
    title: 'Choosing the Right Corporate Helicopter: A Purchaser\'s Guide',
    category: 'Business Aviation',
    excerpt: 'Key parameters to evaluate when selecting rotary aircraft, custom turbines, and regional ranges.',
    publishedAt: 'June 20, 2026',
    readTime: '7 min read',
    image: '/images/about-jet.jpg',
  },
];

export const MOCK_POSTS: BlogPostMock[] = [
  {
    title: 'Navigating FBO Ground Handling Regulations in West Africa',
    category: 'FBO Services',
    excerpt: 'An in-depth review of current regulatory compliances and key handling upgrades at major airport terminals.',
    publishedAt: 'July 18, 2026',
    image: '/images/vip-lounge.jpg',
    slug: 'navigating-fbo-regulations-west-africa',
  },
  {
    title: 'The Future of Business Aviation: Private Jet Market Analysis',
    category: 'Business Aviation',
    excerpt: 'Key trends shaping executive air travel corridors, aircraft distribution, and fleet expansions in 2026.',
    publishedAt: 'July 10, 2026',
    image: '/images/about-jet.jpg',
    slug: 'future-of-business-aviation-2026',
  },
  {
    title: 'Uncompromising Safety Standards: Inside Our Maintenance Hub',
    category: 'Industry News',
    excerpt: 'How our NCAA-approved Aircraft Maintenance Organisation (AMO) ensures flight operations safety.',
    publishedAt: 'June 28, 2026',
    image: '/images/charter-cabin.jpg',
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
    image: "/images/hero/slide-1.jpg",
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
    image: "/images/about-jet.jpg",
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
    image: "/images/contact-cta.jpg",
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
    image: "/images/charter-cabin.jpg",
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
    image: "/images/vip-lounge.jpg",
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
    image: "/images/hero/slide-4.jpg",
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
    image: '/images/about-jet.jpg',
    bio: [
      "Boyede Oyegbami is an accomplished aviation commercial leader with over a decade of experience driving business growth, customer acquisition, and operational excellence across leading energy and aviation fueling companies in Nigeria.",
      "Prior to joining EAN, Boyede served as Aviation Commercial Manager at Eternal Plc, leading aviation business start-up, regulatory compliance, and end-to-end jet fuel operations, achieving milestones such as first into-plane fueling within a year and onboarding five airline customers in five months.",
      "He holds an MSc in Environmental Consultancy from Newcastle University (UK) and a BSc in Microbiology from Bowen University, complemented by certifications from IATA, the British Safety Council, and IEMA. Skilled in contract negotiations, customer relationship management, and strategic sales growth.",
    ]
  }
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
      "In executive aviation, luxury is not merely an aesthetic — it is the seamless execution of uncompromising safety, total privacy, and absolute precision.",
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
      "Combining technical knowledge with a people-first approach to deliver seamless customer experiences that uphold elite standards.",
    bio: [
      "Ann Umeh is a dedicated Customer Relations professional known for building meaningful client connections and enhancing service excellence.",
      "She earned a bachelor’s degree in Computer Science from Lagos State University (LASU) and began her aviation career with a leading support service operator in Nigeria. Through her tenure as a Customer Relations Officer, Ann developed a robust foundation in client engagement and service management. She has since sharpened her skills with specialized training in project management, PLST, and leadership development.",
      "At EAN Aviation, Ann combines technical knowledge with a people-first approach to deliver seamless customer experiences that uphold the brand’s elite standards of service and responsiveness.",
    ],
    credentials: [
      "B.Sc. Computer Science (LASU)",
      "Project Management & Leadership Trained",
      "PLST Certified",
      "Customer Relations Specialist",
    ],
    highlights: [{ label: "Client Service Excellence", value: "Premium" }],
  },
  {
    id: "seye-fasuyi",
    name: "Seye Fasuyi",
    role: "Head, Human Resources",
    department: "Human Resources",
    departmentLabel: "Human Resources",
    image: "/images/leadership/seye-nbac.jpg",
    quote:
      "Empowering individuals and organizations to reach their fullest potential while delivering tangible value to stakeholders.",
    bio: [
      "Seye Fasuyi brings over a decade of experience as a dynamic HR Business Partner, specializing in talent acquisition, organizational development, and change management across sectors such as entertainment, healthcare, communications, and technology. His passion lies in empowering individuals and organizations to reach their fullest potential while delivering tangible value to stakeholders.",
      "Before joining EAN Aviation, Seye led effective HR initiatives that enhanced performance and organizational effectiveness.",
      "He holds a B.Sc. in English from the University of Ilorin. Seye’s leadership is characterized by strategic insight, stakeholder collaboration, and an unwavering commitment to cultivating a high-performance culture.",
    ],
    credentials: [
      "10+ Yrs HR Business Partner",
      "B.Sc. English (University of Ilorin)",
      "Talent Acquisition & Change Management",
      "Organizational Development Lead",
    ],
    highlights: [{ label: "HR Leadership Experience", value: "10+ Years" }],
  },
  {
    id: "bukunola-hundeyin",
    name: "Olubukunola Hundeyin",
    role: "Head of Quality & Safety",
    department: "Quality & Safety",
    departmentLabel: "Quality & Safety",
    image: "/images/leadership/bukky-nbac.jpg",
    quote:
      "World-class aviation facilities depend on seamless maintenance, security protocols, and operational readiness.",
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
      "Yuwa Abu is a technology and data leader with almost a decade of experience delivering data, analytics, and digital transformation initiatives across the telecommunications, e-commerce, FMCG, and aviation industries. He specializes in leveraging data and technology to improve decision-making, optimize business performance, and drive innovation through scalable enterprise solutions.",
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
      "Operational infrastructure must be seamless, secure, and engineered to accelerate executive movement.",
    bio: [
      "Ineh Osikhekha leads all lease, commercial strategy, aviation, and real estate infrastructure projects, facility management, and engineering functions at EAN Aviation, ensuring seamless facility management and infrastructure excellence.",
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
      "Vivian is passionate about driving ethical business practices and leveraging legal innovation to support strategic growth.",
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
    id: "omoruyi-saliu-lawal",
    name: "Omoruyi Saliu-Lawal",
    role: "Hangar Manager",
    department: "Maintenance",
    departmentLabel: "Hangar & Maintenance",
    image: "/images/leadership/Alexey Saliu-Lawal hangar Manager (1) (1).jpg",
    quote:
      "Ensuring that EAN's hangar and ground support operations run with precision, safety, and efficiency.",
    bio: [
      "Omoruyi Saliu-Lawal is an accomplished aviation engineer with over 21 years of combined experience spanning aircraft maintenance, facility management, and engineering project delivery across Nigeria's aviation and industrial sectors. Since joining EAN Aviation in 2011, first as Head, Facilities, and since 2014, as Hangar Manager, his technical leadership has ensured that EAN's hangar and ground support operations run with precision, safety, and efficiency.",
      "He holds a Nigerian Civil Aviation Authority (NCAA) Aircraft Maintenance Engineer's license with type ratings on the Challenger 601/604/605 series and GE CF-34-3B engines and completed EASA Part 66 (Category B1.1) approved training in Aircraft Maintenance Engineering at Air Service Training, Scotland. He is also a certified Level 2 Non-Destructive Testing (NDT) Inspector, trained in Penetrant, Magnetic Particle, and Eddy Current Inspection to EN4179/NAS410 standards, and holds a Wheels and Brakes qualification with Distinction from the Nigerian College of Aviation Technology, Zaria.",
      "Omoruyi oversees all aircraft maintenance, hangar, and ground service equipment operations with meticulous attention to safety, quality, and international best practice, including ICAO, NCAA, and IS-BAH standards, delivering engineering excellence that supports EAN's reputation for reliability and uncompromising service.",
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
      "His academic pedigree spans top institutions: Ahmadu Bello University, University of Lagos, Harvard Business School, MIT, and the New York Institute of Finance, where he honed world-class financial insight and analytical rigor.",
      "He is a steward of growth, guiding sustainable expansion with grace and discipline. From strategic planning to meticulous reporting, his stewardship ensures that every naira and dollar is aligned with our commitment to excellence.",
    ],
    credentials: [
      "Certified Accountant & Tax Authority",
      "Harvard Business School & MIT Alumnus",
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
    image: "/images/leadership/Okechukwu Umeh Operations Support Manager.jpg",
    quote:
      "Maintaining the highest standards of safety, regulatory compliance, and service excellence across all operational touchpoints.",
    bio: [
      "Umeh Okechukwu serves as the operations support manager at EAN Aviation Limited, Nigeria's first fully integrated Fixed Base Operator (FBO) and maintenance organization, headquartered at Murtala Muhammed International Airport in Lagos.",
      "With over twelve years of experience in aviation operations, Okechukwu oversees the full scope of EAN Aviation's ground and flight service delivery, ensuring seamless coordination across VIP terminal operations, business jet charter services, aircraft maintenance, and the company's role as the authorized Airbus Helicopters distributor for West Africa.",
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

export * from './legal-constants';
