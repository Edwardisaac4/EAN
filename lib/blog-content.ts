// =============================================================================
// Blog article bodies — structured content for the statically seeded posts
// =============================================================================
// Article bodies used to live as hand-written JSX inside a `switch (article.slug)`
// in app/blog/[slug]/page.tsx: every heading, paragraph and bullet carried its own
// Tailwind classes inline, so adding a post meant writing ~150 lines of markup and
// restyling the blog meant editing every post.
//
// Content is data here, and components/blog/ArticleBody.tsx owns the presentation.
// Adding a post is now an entry in ARTICLE_BODIES.
//
// PROVENANCE: these three posts are migrated from the live WordPress site at
// ean.aero. Copy is reproduced as published, with two deliberate exceptions,
// both noted at their article below.
//
// Two punctuation slips in the CIQ post are corrected here rather than carried
// over: a missing comma before "but" in the integrated-border-force sentence,
// and an unopened em-dash parenthetical in the "Gen Decs" sentence. Wording is
// unchanged in both — only the marks that make the sentences parse.

/** One renderable unit of an article body. */
export type ArticleBlock =
  /** Opening statement, set larger with a gold rule — one per article, first. */
  | { type: 'lead'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  /** Bulleted list where each item leads with a bold term. */
  | { type: 'definitionList'; items: Array<{ term: string; text: string }> }
  /** Boxed aside on a surface panel. */
  | { type: 'callout'; title: string; items: string[] }
  | { type: 'table'; caption?: string; headers: string[]; rows: string[][] }
  /** Figure row, e.g. "3.5 hours / Average time lost per commercial flight". */
  | { type: 'stats'; items: Array<{ value: string; label: string }> }
  /** Closing call to action, rendered as a distinct panel rather than body copy. */
  | { type: 'cta'; text: string }

// =============================================================================
// Understanding CIQ in Business Aviation
// =============================================================================

const CIQ_BODY: ArticleBlock[] = [
  {
    type: 'lead',
    text: 'When a private jet crosses an international border, the aircraft is not the hard part. The ground is.',
  },
  {
    type: 'paragraph',
    text: 'For corporate flight departments, charter operators, and frequent international travellers, CIQ (Customs, Immigration, and Quarantine) is where a well-planned journey either comes together or quietly unravels. In business aviation, it is also among the most underestimated variables in the entire operation.',
  },
  {
    type: 'paragraph',
    text: 'This is not a bureaucratic footnote. It is a core part of the flight.',
  },
  {
    type: 'heading',
    level: 2,
    text: 'CIQ: The Three Functions That Clear Every International Flight',
  },
  {
    type: 'paragraph',
    text: 'Every aircraft crossing an international border must satisfy three distinct government functions before its occupants can legally proceed. They are always present, even when they are handled well enough to feel invisible.',
  },
  {
    type: 'definitionList',
    items: [
      {
        term: 'Customs (C)',
        text: 'The government authority responsible for controlling the import and export of goods, collecting duties and taxes, and preventing the smuggling of prohibited items. In aviation, that means the aircraft itself, its cargo manifest, and anything passengers and crew have in their possession. Undeclared items, improper documentation, or goods that exceed allowable thresholds can hold an aircraft on the ramp long after the engines have cooled.',
      },
      {
        term: 'Immigration (I)',
        text: 'The authority responsible for controlling the movement of people across borders. Immigration officers review travel documents, visas, and passenger manifests. Thereafter, they make the ultimate decision on who may enter a country.',
      },
      {
        term: 'Quarantine (Q)',
        text: 'The authority responsible for preventing the introduction of plant diseases, animal diseases, and public health threats across borders. In aviation, this includes the inspection of food brought onboard, live animals, agricultural products, and — as COVID-19 made globally apparent — the health status of arriving passengers and crew.',
      },
    ],
  },
  {
    type: 'paragraph',
    text: 'These three functions may be handled by separate agencies or, at some airports, by an integrated border force, but all three must be satisfied for every international flight, without exception.',
  },
  {
    type: 'heading',
    level: 2,
    text: 'Why CIQ Is Particularly Consequential in Business Aviation',
  },
  {
    type: 'paragraph',
    text: 'Commercial airline passengers experience CIQ as a queue. Business aviation passengers should not. The commercial proposition is straightforward: clients pay a significant premium for an uninterrupted, private journey. That expectation does not end at the aircraft door, but extends through every element of the ground experience, including CIQ.',
  },
  {
    type: 'paragraph',
    text: 'Here is why that expectation creates significant operational responsibility:',
  },
  {
    type: 'heading',
    level: 3,
    text: '1. Non-Scheduled Operations Receive More Scrutiny',
  },
  {
    type: 'paragraph',
    text: 'Commercial airlines operate on predictable schedules with pre-cleared manifests. Business aviation flights are often ad-hoc, with itineraries that change at short notice. This irregularity means that customs and immigration authorities may apply higher scrutiny to general aviation arrivals.',
  },
  {
    type: 'paragraph',
    text: 'A well-briefed FBO — one that has an established relationship with the local CIQ authority and that submits accurate advance General Declarations (Gen Decs) — significantly reduces the friction associated with this scrutiny.',
  },
  {
    type: 'heading',
    level: 3,
    text: '2. Advance Notification Is Not Optional',
  },
  {
    type: 'paragraph',
    text: 'In virtually every jurisdiction, operators are required to submit a General Declaration (Gen Dec) to CIQ authorities in advance of arrival or departure. The Gen Dec contains the following:',
  },
  {
    type: 'list',
    items: [
      'Aircraft registration and operator details',
      'Flight origin and destination',
      'Complete passenger and crew manifest with passport details',
      'Cargo description and quantity',
      'Declaration of any animals, food, or restricted items onboard',
    ],
  },
  {
    type: 'paragraph',
    text: 'Failure to submit an accurate Gen Dec, or submitting it too late, can result in delayed clearance, fines, and, in serious cases, detention of the aircraft. EAN Aviation manages this process on behalf of operators, ensuring submissions are accurate, timely, and compliant with local regulatory requirements.',
  },
  {
    type: 'heading',
    level: 3,
    text: '3. Visa and Travel Document Complexity',
  },
  {
    type: 'paragraph',
    text: 'Business aviation itineraries frequently involve multiple nationalities in a single passenger manifest. The immigration requirements for each nationality at each destination vary enormously and change with geopolitical developments. A Nigerian passport holder, an EU citizen, and a US national may face entirely different documentation requirements for the same destination.',
  },
  {
    type: 'paragraph',
    text: 'An experienced FBO and ground handler proactively checks visa requirements for all nationalities on the manifest before departure, not on arrival. EAN Aviation’s operations team conducts this check as a standard part of trip planning, preventing the embarrassment and cost of a passenger being refused entry.',
  },
  {
    type: 'heading',
    level: 3,
    text: '4. Quarantine Requirements in Africa and Emerging Markets',
  },
  {
    type: 'paragraph',
    text: 'For operators flying into or within Africa, quarantine requirements carry particular importance. Many African nations have strict controls on:',
  },
  {
    type: 'list',
    items: [
      'Agricultural products and food items — restrictions vary significantly by country',
      'Animal and plant material — including seemingly innocuous items such as floral arrangements or wooden craft items',
      'Pharmaceutical and medical items — controlled substances must be declared and supported by documentation',
      'Health certificates and vaccination records — yellow fever certificates, for example, are mandatory for entry into numerous African countries',
    ],
  },
  {
    type: 'paragraph',
    text: 'EAN Aviation provides operators with destination-specific CIQ briefings that address these requirements before departure, ensuring passengers and crew are properly prepared.',
  },
  {
    type: 'heading',
    level: 2,
    text: 'The FBO’s Role in CIQ: More Than Just a Ramp',
  },
  {
    type: 'paragraph',
    text: 'A premium FBO does not merely provide fuel and a comfortable lounge. In the context of international clearance, an elite fixed base operator operates as a liaison, a documentation manager, and when things get complicated, an advocate:',
  },
  {
    type: 'definitionList',
    items: [
      {
        term: 'Advance coordination',
        text: 'Liaising with CIQ authorities before the flight arrives to confirm clearance procedures and any special requirements.',
      },
      {
        term: 'Document preparation and review',
        text: 'Reviewing Gen Decs and passenger manifests for accuracy before submission.',
      },
      {
        term: 'On-ramp CIQ facilitation',
        text: 'Where regulations permit, coordinating for CIQ officials to process passengers on the ramp or in a private terminal, avoiding the commercial terminal entirely.',
      },
      {
        term: 'Crew and passenger briefing',
        text: 'Informing crews of local CIQ procedures, restricted items, and documentation requirements specific to the destination.',
      },
      {
        term: 'Post-clearance support',
        text: 'Managing any cargo inspections, fumigation requirements, or follow-up documentation that CIQ may require after aircraft arrival.',
      },
    ],
  },
  {
    type: 'heading',
    level: 2,
    text: 'What Happens When CIQ Goes Wrong?',
  },
  {
    type: 'paragraph',
    text: 'CIQ failures in business aviation are not abstract risks. They have concrete, operational consequences, and they almost always trace back to planning gaps rather than bad luck.',
  },
  {
    type: 'paragraph',
    text: 'An aircraft can be detained on the ground until documentation is corrected or penalties are paid. A passenger refused entry must be returned to their origin, at the operator’s expense. Crew members who knowingly carry prohibited items face personal criminal liability. Charter operators who experience a visible CIQ failure in front of a high-value client rarely recover that relationship. And the financial penalties for improper documentation, late Gen Dec submission, or undeclared goods, while they vary by country, are invariably disproportionate to the oversight that caused them.',
  },
  {
    type: 'paragraph',
    text: 'None of this is inevitable. In practice, a CIQ failure is almost always preventable, which is why choosing the right ground handler matters as much as choosing the right aircraft.',
  },
  {
    type: 'heading',
    level: 2,
    text: 'CIQ and African Aviation: A Special Consideration',
  },
  {
    type: 'paragraph',
    text: 'Africa’s aviation landscape is uniquely complex. With 54 nations, each with its own regulatory framework, border control culture, and quarantine authority, operating across the continent demands a ground handler with deep regional expertise.',
  },
  {
    type: 'paragraph',
    text: 'EAN Aviation’s operational experience across African airports gives our clients an advantage that no amount of pre-flight research can replicate: relationships. Our team’s established connections with CIQ officials at key African gateways accelerate clearance processes and resolve procedural issues before they become delays.',
  },
  {
    type: 'heading',
    level: 2,
    text: 'Preparing for Your Next International Flight: A Practical Checklist',
  },
  {
    type: 'paragraph',
    text: 'Regardless of your destination, these steps will dramatically improve your CIQ experience:',
  },
  {
    type: 'list',
    ordered: true,
    items: [
      'Engage your FBO or ground handler at least 48–72 hours before departure to initiate CIQ coordination',
      'Provide accurate, complete passenger and crew manifests including full passport details and nationalities',
      'Confirm visa and entry requirements for every nationality on the manifest',
      'Declare all items of potential quarantine interest — including food, medicines, and gifts',
      'Ensure aircraft documentation (Certificate of Registration, Airworthiness Certificate, Radio Licence, Insurance) is current and accessible',
      'Brief passengers on local Customs regulations, particularly regarding currency declaration thresholds and prohibited items',
    ],
  },
  {
    type: 'heading',
    level: 2,
    text: 'Conclusion: CIQ as a Service Standard, Not an Afterthought',
  },
  {
    type: 'paragraph',
    text: 'The finest aircraft, the most experienced crew, and the most important passengers deserve a ground experience that matches the standard of the flight. CIQ management is where that promise is delivered or broken.',
  },
  {
    type: 'paragraph',
    text: 'At EAN Aviation, international clearance is a core service competency, not a peripheral one. Our dedicated CIQ facility at MMIA, Lagos, brings Customs, Immigration, and Quarantine officers on-site and exclusive to our terminal. Combined with our team’s regional expertise and established relationships with border authorities across Africa, that means one thing in practice: your passengers step off the aircraft and through the border as smoothly as they stepped aboard.',
  },
  {
    type: 'cta',
    text: 'Planning an international flight through Lagos? Contact EAN Aviation’s operations team. We handle the border — so your passengers can focus entirely on the business that brought them there.',
  },
]

// =============================================================================
// Why Top CEOs Are Choosing FBO Services Over First Class
// =============================================================================

const FBO_VS_FIRST_CLASS_BODY: ArticleBlock[] = [
  {
    type: 'lead',
    text: 'There was a time when a first-class seat was the ultimate symbol of executive travel — the flatbed, the champagne, the priority boarding. But something has shifted.',
  },
  {
    type: 'paragraph',
    text: 'Across boardrooms in Lagos, London, Dubai, and New York, C-suite leaders are quietly making a different choice. They are bypassing commercial terminals entirely and opting for Fixed Base Operator (FBO) Services — and for very good reason.',
  },
  {
    type: 'paragraph',
    text: 'This is not simply about luxury. It is about strategy, efficiency, and the very real value of time.',
  },
  {
    type: 'stats',
    items: [
      { value: '3.5 hours', label: 'Average time lost per commercial flight in airport processes' },
      { value: '40%', label: 'Of HNIs now prefer private aviation for domestic & regional travel' },
      { value: '200+', label: 'Airports globally served by top FBO networks' },
    ],
  },
  {
    type: 'heading',
    level: 2,
    text: 'Time is the Most Valuable Currency',
  },
  {
    type: 'paragraph',
    text: 'For a CEO, every hour has a measurable financial value. Commercial aviation demands significant time investment: check-in queues, security screenings, lounge waits, boarding delays, and baggage collection. A two-hour flight can easily consume five hours of the executive’s day. FBO services eliminate virtually all of this friction. Passengers arrive minutes before departure, clear formalities swiftly, and board directly. On arrival, ground transport is waiting. The time saved — often three to four hours per trip — is redirected into high-value work.',
  },
  {
    type: 'heading',
    level: 2,
    text: 'Privacy and Confidentiality',
  },
  {
    type: 'paragraph',
    text: 'First-class cabins, however elegant, are shared spaces. Sensitive board discussions, merger negotiations, or strategic planning conversations carry real risk in commercial environments. FBO lounges and private aircraft offer complete discretion, where conversations stay confidential and the passenger controls who is in the room entirely.',
  },
  {
    type: 'heading',
    level: 2,
    text: 'A Direct Route to Productivity',
  },
  {
    type: 'paragraph',
    text: 'The modern executive does not stop working at 35,000 feet. Industry research consistently shows that business aircraft function as productivity multipliers. Business jets and FBO-facilitated charters are equipped with high-speed Wi-Fi, conference capabilities, and full communication infrastructure. Unlike commercial cabins where connectivity is unreliable and workspaces are cramped, a private aircraft becomes a flying office — one where meetings can be held, presentations refined, and decisions made in real time.',
  },
  {
    type: 'heading',
    level: 2,
    text: 'Flexibility That Commercial Travel Cannot Match',
  },
  {
    type: 'paragraph',
    text: 'Schedules change. Deals evolve. Opportunities do not wait for the next available commercial flight. FBO services give executives the flexibility to depart on their timeline, adjust destinations mid-trip, and access airports that commercial airlines simply do not serve. For operations across Nigeria and West Africa — where business demands can shift rapidly — this flexibility is not a luxury; it is a competitive advantage.',
  },
  {
    type: 'heading',
    level: 2,
    text: 'The FBO vs. First Class Comparison',
  },
  {
    type: 'table',
    caption: 'How the two travel models compare across the factors executives weigh.',
    headers: ['Aspect', 'First Class (Commercial)', 'FBO Services (Private Aviation)'],
    rows: [
      ['Airport Processing', '2–4 hours', 'Arrive 15–20 minutes before departure'],
      ['Departure Schedule', 'Fixed schedules', 'Depart on your own schedule'],
      ['Space', 'Shared lounge & cabin', 'Exclusive lounge & private aircraft'],
      ['Route Flexibility', 'Limited', 'Access to regional & remote airports'],
      ['Connectivity', 'Unreliable', 'Dedicated onboard connectivity'],
      ['Privacy', 'No guarantee', 'Complete privacy & discretion'],
    ],
  },
  {
    type: 'heading',
    level: 2,
    text: 'The Africa Advantage — Why FBO Matters More Here',
  },
  {
    type: 'paragraph',
    text: 'In the Nigerian and West African business environment, the case for business aviation is even stronger. Commercial aviation infrastructure across the region presents unique challenges — delays, limited routes, and congested terminals. FBO operators offer an integrated alternative: private hangarage, single-operator ground handling, dedicated VIP lounges, on-site maintenance, and a team built around executive-level service. Nigeria’s first fully integrated FBO hangar at Murtala Muhammed International Airport in Lagos is a direct response to this demand.',
  },
  {
    type: 'heading',
    level: 2,
    text: 'The Prestige Factor — And Why It Matters to Business',
  },
  {
    type: 'paragraph',
    text: 'Beyond the practical benefits, perception matters in business. Arriving via a private FBO terminal communicates seriousness, capability, and the kind of operational excellence that builds confidence with partners, investors, and clients. It signals that your time — and theirs — is respected. In high-stakes negotiations and relationship-driven markets like West Africa, how you arrive can shape how you are received.',
  },
  {
    type: 'heading',
    level: 2,
    text: 'Conclusion',
  },
  {
    type: 'paragraph',
    text: 'The shift from first class to FBO services among executives is not a trend — it is a structural change in how high-performing leaders approach business travel. When time, productivity, privacy, and flexibility are non-negotiable, the FBO model does not just compete with first class. It wins comprehensively. For executives operating in Nigeria and across West Africa, the question is no longer whether to explore FBO services — it is how soon.',
  },
]

// =============================================================================
// In Loving Memory of Eyitayo Aiyetan
// =============================================================================
// NOTE: the live WordPress version of this tribute contains two paragraphs about
// African tourism potential and Kenyan safari charter flights, beginning "Beyond
// commerce, business aviation is unlocking Africa's vast tourism potential." They
// are plainly a copy-paste error from a different article — they are unrelated to
// the subject and interrupt the tribute mid-flow. They are omitted here rather
// than migrated. Nothing else has been altered.

const MEMORIAL_BODY: ArticleBlock[] = [
  {
    type: 'lead',
    text: 'It is with profound sadness that we remember and honour the life of Eyitayo Aiyetan, a consummate aviation professional whose impact on Nigerian business aviation will never be forgotten.',
  },
  {
    type: 'paragraph',
    text: 'As Head of FBO Operations at EAN Aviation, Tayo brought passion, professionalism, and unwavering commitment to every aspect of his work.',
  },
  {
    type: 'paragraph',
    text: 'His career spanned private jet operations, commercial aviation, cargo, ground handling, aircraft permits, regulatory liaison, safety management systems, Hajj and Umrah coordination, station setup, and airport management. Remarkably, he carried this expertise not just across Nigeria but also across West and Central Africa, including Liberia, Côte d’Ivoire, Benin Republic, Togo, Senegal, Gabon, Mali, and The Gambia, as well as the Middle East. Few professionals in the region could match the breadth and depth of his operational experience.',
  },
  {
    type: 'paragraph',
    text: 'Before joining EAN Aviation, Tayo built his foundations at Virgin Nigeria Airways, where he served as Relief Airport Manager, before progressing to Country Manager roles, Acting Head of Sales & Marketing at Air Nigeria, and Head of Ground Services at TopBrass Aviation. Each chapter sharpened the expertise and leadership he would bring to EAN.',
  },
  {
    type: 'paragraph',
    text: 'At EAN Aviation, West Africa’s first comprehensive aviation service provider, Tayo was more than a colleague; he was family. He was central to the refurbishment of the Lagos VIP lounge, a key figure during EAN’s landmark partnership with Airbus Helicopters as their first independent West African distributor, and a respected panelist at the Nigerian Business Aviation Conference. His contributions to operational efficiency, customer service excellence, and ground handling standards significantly strengthened every organisation he served.',
  },
  {
    type: 'heading',
    level: 2,
    text: 'The Man Behind the Role',
  },
  {
    type: 'paragraph',
    text: 'Beyond his impressive professional record, Tayo was known for something rarer than skill, his humanity. Colleagues and industry peers consistently described him as “warm, approachable, kind-hearted, and deeply supportive.” He was the leader who guided with wisdom, the mentor who encouraged growth, and the colleague who steadied the room when things got difficult.',
  },
  {
    type: 'paragraph',
    text: 'He was also multilingual, speaking and writing fluent French, an ability that gave him a genuine edge in Francophone West Africa and reflected his broader commitment to being a bridge-builder, not just across airport terminals, but across cultures and communities.',
  },
  {
    type: 'paragraph',
    text: 'Tayo valued integrity, teamwork, and excellence not as corporate slogans but as personal convictions. He lived them quietly, consistently, and without fanfare. That is perhaps the truest measure of a professional.',
  },
]

/**
 * Article bodies keyed by slug. A slug present in ARTICLES_DATABASE but absent
 * here renders its excerpt alone rather than failing — see ArticleBody.
 */
export const ARTICLE_BODIES: Record<string, ArticleBlock[]> = {
  'understanding-ciq-business-aviation-international-flights': CIQ_BODY,
  'why-top-ceos-are-choosing-fbo-services-over-first-class': FBO_VS_FIRST_CLASS_BODY,
  'in-loving-memory-of-eyitayo-aiyetan': MEMORIAL_BODY,
}
