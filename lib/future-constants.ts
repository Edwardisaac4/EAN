// ============================================================================
// /airborne — the ten programme pages
// ============================================================================
//
// Content is transcribed from each programme's own September 2026 deck. Nothing
// here is written for the website: every figure, heading and answer is the
// line's own words, and each section keeps the `sources` line the deck printed
// under it. That is deliberate and load-bearing — most of these pages describe
// facilities that are not built yet, so the citation is what separates a
// forward-looking statement from a claim. Do not drop a `sources` string
// because a section looks self-evident, and do not edit a figure without the
// deck in front of you.
//
// Kept out of lib/constants.ts for the reason lib/aeroplex-constants.ts is:
// this is roughly two thousand lines of one route's copy, and it would bury a
// file the whole site imports from.

/** A figure and what it counts. `figure` leads; it is set in the mono face. */
export interface FutureStat {
  figure: string;
  label: string;
}

/** A titled block in a grid — capabilities, streams, partners, phases. */
export interface FutureCard {
  /** Small label above the title: a stage, a date, a category. */
  kicker?: string;
  title: string;
  body: string;
}

export interface FutureImage {
  src: string;
  alt: string;
  /** The deck's own caption, which carries the credit and the date. */
  caption: string;
  /** Short label shown above the caption where the deck used one. */
  lede?: string;
  /**
   * A photograph of people. These are never cropped.
   *
   * Every team photograph EAN has is a full-length posed group — eight Client
   * Relations staff standing under the terminal sign, sixteen ground handlers
   * in a line across the apron. Dropped into the 16:10 frame the renders use,
   * `object-cover` takes a band out of the middle and decapitates the back row.
   * So a people photograph takes the full width of its section, at its own
   * aspect ratio, with nothing cropped off any edge. `width` and `height` are
   * the intrinsic pixels, which is what lets next/image reserve the right box.
   */
  people?: boolean;
  /**
   * Stretch the image to the full width of the section container at its native
   * aspect ratio without cropping (for master site plans, architectural layouts, etc.).
   */
  fullWidth?: boolean;
  width?: number;
  height?: number;
}

/** A numbered step in a sequence the deck presents as an ordered journey. */
export interface FutureStep {
  /** "01", or a stage label where the deck used one — "Stage 1", "Opening B". */
  number: string;
  title: string;
  body: string;
}

export interface FutureMilestone {
  /** "APRIL 2025", "Q4 2027", "SEPTEMBER 2026 · NOW". */
  period: string;
  title: string;
  body: string;
  /** Marks the present. Renders the one filled marker on the timeline. */
  current?: boolean;
}

export interface FutureFaq {
  question: string;
  answer: string;
}

/** An aside the deck set apart from the prose — "HOW IT'S BILLED", "TERMS". */
export interface FutureNote {
  label: string;
  body: string;
}

export interface FutureSection {
  /** Anchor id, and the target of the in-page nav. */
  id: string;
  /** Eyebrow above the heading — "EAN today", "The market". */
  label: string;
  heading: string;
  /** Body paragraphs, in order. */
  body?: string[];
  /** The single oversized figure some sections pull out of the prose. */
  pullStat?: FutureStat;
  /**
   * Where the brief layout sets the pulled figure: after this many `body`
   * paragraphs, where the deck sets it mid-prose, or `'after-blocks'` — after
   * the section's steps, cards or timeline, where the deck closes on it.
   * Omitted, it follows the whole body.
   */
  pullStatAt?: number | 'after-blocks';
  stats?: FutureStat[];
  /**
   * A second row the deck set directly under the first, as its own grid rather
   * than a continuation — FBO's passenger counts by year. Only the brief layout
   * renders it.
   */
  secondaryStats?: FutureStat[];
  cards?: FutureCard[];
  steps?: FutureStep[];
  milestones?: FutureMilestone[];
  images?: FutureImage[];
  /** Partner and supplier marks, shown as a row of logos. */
  logos?: { src: string; alt: string }[];
  notes?: FutureNote[];
  sources?: string;
}

export interface FutureProgramme {
  slug: string;
  /**
   * `brief` renders the page as a replica of the line's own published brief —
   * dark blue ground, hairline grids, two-column sections — through
   * components/future/Brief*. Omitted, the page takes the linen layout the
   * other programmes share. Opt a line in only once its brief has been checked
   * against the page section by section.
   */
  layout?: 'brief';
  /**
   * `cinematic` gives a brief page the threedot-style motion: headings that
   * slide up from a line mask, photographs that open and close like a shutter,
   * and a masthead that shrinks away as the page scrolls over it. All of it runs
   * in both directions — whatever leaves the top of the screen arrives again on
   * the way back up, the copy included. Omitted, the page keeps the plain §19
   * rise-and-fade, once. Only read by the brief layout.
   */
  motion?: 'cinematic';
  /** Two digits. Drives the numeral, the ordering and the cross-link strip. */
  number: string;
  /**
   * The short name, as used on the tile, in the nav and in the cross-link
   * strip. Two of these differ from the deck's own title — 05 and 06 — because
   * the short name is what the campus calls the line and `title` is what the
   * company calls itself.
   */
  name: string;
  /** The deck's own title, used in the page heading and metadata. */
  title: string;
  eyebrow: string;
  /** The h1. Doubles as the tile tagline. */
  headline: string;
  lede: string;
  heroStats: FutureStat[];
  heroSources: string;
  /** Three short claims under the hero. */
  chips: string[];
  sections: FutureSection[];
  faqs: FutureFaq[];
  /** The deck's "In one paragraph" close. */
  summary: string;
  /** The heading over the cross-link strip, which differs on every page. */
  crossLinkHeading: string;
  contact: {
    heading: string;
    body: string;
    /** The desk's line, as the brief layout's call button prints and dials it. */
    phone?: { label: string; tel: string };
  };
  disclaimer: string;
  seoDescription: string;
  /**
   * The full-bleed photograph behind the page title.
   *
   * Every deck opens on one: a 640px-minimum band with the title sitting on its
   * bottom edge under a three-stop scrim, and the stat strip riding up over it.
   * Taken from each deck's own `--heroimg`, so the photograph a line opens with
   * here is the one it opens with there.
   */
  hero: {
    image: string;
    alt: string;
    /** `object-position`. Set where a centre crop would cut something. */
    imagePosition?: string;
  };
  /**
   * The photograph behind this line's band on /airborne, where it should
   * differ from the one the programme page opens on. Omitted, the band takes
   * `hero`.
   */
  band?: FutureProgramme['hero'];
  /**
   * How this programme appears in the /airborne mosaic. It lives on the
   * programme rather than in a parallel FUTURE_TILES array because everything
   * else the tile shows — the numeral, the name, the tagline — is already here,
   * and a second array meant two places to edit and two places to disagree.
   */
  tile: {
    image: string;
    alt: string;
    /**
     * Column span, which drives the aspect ratio rather than a width class.
     * `full` is landscape on desktop; `half` and `third` are portrait, and all
     * three are portrait on mobile. The row rhythm falls out of this sequence.
     */
    size: 'full' | 'half' | 'third';
    /**
     * `object-position`, for the portrait cells. A 16:9 photograph in a 46/67
     * cell loses two thirds of its width, so anything off-centre needs saying.
     */
    imagePosition?: string;
  };
}

const DISCLAIMER =
  'Indicative and for discussion. This page describes a business line of EAN Aviation and is not an offer of securities or an invitation to invest. Figures are drawn from the sources cited on this page as at 17 September 2026 and may change. Renders are concept views; the built campus may differ.';

const EYEBROW = 'EAN Aviation · September 2026 edition';

export const FUTURE_PROGRAMMES: FutureProgramme[] = [
  // ==========================================================================
  // 01 — FBO & Lounges
  // ==========================================================================
  {
    slug: 'fbo-and-lounges',
    layout: 'brief',
    motion: 'cinematic',
    hero: {
      image: '/images/future/hero-fbo-and-lounges.jpg',
      alt: 'Concept view of the Aeroplex terminal interior, daylight through the fin facade across the lounge seating, with business jets on the apron beyond',
    },
    tile: {
      image: '/images/future/terminal-interior.jpg',
      alt: 'Concept view of the terminal interior under the canopy at the Aeroplex',
      size: 'full',
    },
    number: '01',
    name: 'FBO & Lounges',
    title: 'FBO & Lounges',
    eyebrow: EYEBROW,
    headline: 'Fifteen years of care and safety for our clients.',
    lede: "EAN handles about a third of all business-aviation movements in Lagos from our 10,000 m² at the Jet Center. The Aeroplex gives the operation the space to grow, and a private terminal for more than VVIPs.",
    heroStats: [
      {
        figure: '~35%',
        label:
          'of Lagos business-aviation movements handled by EAN, the leading operator, from the smallest of the four main sites',
      },
      {
        figure: '~430',
        label: 'aircraft movements a month today; 457 in the 30 days to 7 September 2026',
      },
      {
        figure: '2011',
        label:
          "the year EAN's VVIP lounge opened. Fifteen years of 24/7 operation, interrupted once, for the first seven days of the 2020 lockdown",
      },
      {
        figure: '141,776',
        label:
          'safe man-hours to 11 September 2026, with zero lost-time injuries and zero accidents',
      },
    ],
    heroSources:
      'EAN Business Lens data, 2025 to 2026 · FBO One movement records, 30 days to 7 September 2026 · EAN Quality and Safety KPI review, 17 September 2026 · EAN competitor review, 2025.',
    chips: [
      '24/7 at Murtala Muhammed since 2011',
      'Customs and immigration inside the building',
      '141,776 safe man-hours, zero lost-time injuries',
    ],
    sections: [
      {
        id: 'ean-today',
        label: 'EAN today',
        heading: "Nigeria's first purpose-built FBO, running at capacity.",
        body: [
          'Since 2011 EAN has met principals, crews and diplomats through every kind of arrival at Murtala Muhammed. Handling, hangarage, apron parking, trip support, in-flight catering and a Client Relations team run around the clock. Every hangar bay is full, with a waiting list for based aircraft.',
          'On-site customs and immigration at the Jet Center is approved and launching in September 2026; the same facility is built into the Aeroplex terminal from opening. The VVIP lounge upgrade is under way.',
        ],
        stats: [
          { figure: '48', label: 'operators served at the existing hangar' },
          { figure: '98%', label: 'of the current site occupied' },
          { figure: '1', label: 'lounge today, VVIP; three at the Aeroplex from opening' },
          { figure: '24/7', label: 'operation since 2011' },
          { figure: '15 yrs', label: 'on the ground at MMIA' },
        ],
        secondaryStats: [
          { figure: 'c. 12,000', label: 'passengers through the lounge, 2023' },
          { figure: 'c. 12,100', label: 'passengers, 2024' },
          { figure: 'c. 16,700', label: 'passengers, 2025, up about 4,600 on the year' },
          { figure: 'c. 40,800', label: 'passengers over the three years' },
        ],
        images: [
          {
            src: '/images/future/apron-hangar.jpg',
            width: 1400,
            height: 937,
            alt: "Business jets on EAN's apron in front of the hangar at MMIA",
            caption: 'EAN JET CENTER, MMIA · THE APRON AND HANGAR TODAY',
          },
          {
            src: '/images/future/client-relations.jpg',
            people: true,
            width: 1396,
            height: 1600,
            alt: "EAN's Client Relations team",
            caption: 'EAN CLIENT RELATIONS TEAM · MMIA',
          },
        ],
        sources:
          'Kola Oyeneyin presentation, 3 September 2026 (EAN figures) · FAAN CIQ inspection passed 21 August 2026 · EAN Client Relations passenger log, 2023 to 2025 (annual figures provisional, circa, pending Client Relations confirmation).',
      },
      {
        id: 'what-we-do',
        label: 'What we do',
        heading: 'Ten lines earning today, from one 10,000 m² site.',
        body: [
          'The FBO is the operating base every other EAN line stands on. Each service below is running now and steps up at the Aeroplex.',
        ],
        cards: [
          {
            title: 'Ground handling',
            body: 'Ramp, marshalling, towing, GPU and turnaround for business and government aircraft',
          },
          {
            title: 'Hangarage',
            body: 'Based-aircraft hangarage, full today with a waiting list',
          },
          {
            title: 'Apron parking',
            body: 'Transient parking, billed per movement and per night',
          },
          {
            title: 'Trip support',
            body: 'Permits, slots, fuel releases, credit and one point of contact per trip',
          },
          {
            title: 'Flight planning and dispatch',
            body: 'Around the clock, for based and visiting operators',
          },
          {
            title: 'VIP and VVIP lounge',
            body: 'Principals, aides and crews met at the door, cleared privately',
          },
          {
            title: 'Crew lounge and transfers',
            body: 'Crew rest, transport and hotel arrangements',
          },
          {
            title: 'In-flight catering',
            body: "Wings, EAN's own kitchen; a record year in 2025 with the momentum carried into 2026",
          },
          {
            title: 'Customs and immigration on site',
            body: 'Approved at the Jet Center, launching September 2026; built into the Aeroplex terminal from Q4 2027',
          },
          {
            title: 'NCAA-approved maintenance',
            body: 'Wheels, brakes and NDT at the same site, so aircraft are turned without a ferry flight',
          },
        ],
        notes: [
          {
            label: "How it's billed",
            body: 'A monthly fee for tenants, a fee per movement for transients, plus hangarage and parking.',
          },
        ],
        sources:
          'EAN trip-support service card, September 2026 · EAN FBO operating records · EAN Catering volume records.',
      },
      {
        id: 'the-aeroplex',
        label: 'The Aeroplex',
        heading: 'One lounge today. Three at opening, and two more designed in.',
        body: [
          'Benoy profiled every kind of passenger and partner who moves through the site, VVIP principals and their aides, oil-and-gas crews, dedicated crew, eVTOL passengers, handlers and agents among them, and designed the FBO building around all of them. Passenger movements and operational traffic are kept apart by design, with separate arrival routes for principals, for crew and staff, and for maintenance and cargo. The new spaces open from Q4 2027.',
        ],
        stats: [
          {
            figure: '12,275 m²',
            label: "FBO building, larger than EAN's whole site today and four times the largest terminal at MMIA",
          },
          {
            figure: '3',
            label: 'lounges at opening: VVIP, premium commercial and crew; oil-and-gas and eVTOL lounges follow',
          },
          { figure: '11,267 m²', label: 'three-bay hangar, seventeen aircraft inside' },
          { figure: '23,113 m²', label: 'apron, thirteen aircraft outside, heli-bays beside it' },
          { figure: '30', label: 'aircraft on the ground at once, from Globals to HondaJets' },
        ],
        images: [
          {
            src: '/images/future/terminal-interior.jpg',
            width: 1263,
            height: 751,
            alt: 'Benoy concept view of the terminal interior under the canopy at the Aeroplex',
            caption: 'BENOY CONCEPT VIEW · TERMINAL INTERIOR · AT THE AEROPLEX, FROM 2027',
          },
          {
            src: '/images/future/landside-arrival.jpg',
            width: 1400,
            height: 761,
            alt: 'Benoy render of the Aeroplex landside arrival under the canopy',
            caption: 'BENOY RENDER · LANDSIDE ARRIVAL · AT THE AEROPLEX, FROM 2027',
          },
        ],
        sources: 'Benoy Final Concept Report, June 2026 · The Aeroplex in Numbers, September 2026.',
      },
      {
        id: 'premium-service',
        label: 'The Premium Service',
        heading: 'Your protocol, built into the terminal.',
        body: [
          "A commercial first or business class passenger pays for a private path from the door to the aircraft. The model is proven at Heathrow's Windsor suite, Manchester's Aether and across the United States with Signature Aviation. The Aeroplex builds the same journey into MMIA, and gives Nigeria's protocol officers a terminal designed for the way their principals already travel.",
        ],
        steps: [
          { number: '01', title: 'Greeted', body: 'Met at the terminal door, not a departure gate' },
          {
            number: '02',
            title: 'Checked in',
            body: 'Documents and boarding formalities cleared privately',
          },
          {
            number: '03',
            title: 'Private security',
            body: 'A dedicated screening lane, away from the main terminal',
          },
          {
            number: '04',
            title: 'Premium lounge',
            body: 'A private lounge with refreshments and workspace until boarding',
          },
          {
            number: '05',
            title: 'Car across the ramp',
            body: 'Driven directly across the apron',
          },
          {
            number: '06',
            title: 'Up to the aircraft',
            body: 'Boarded planeside, no further queues',
          },
        ],
        notes: [
          {
            label: 'Arrivals, in reverse',
            body: 'Met at the aircraft, driven in, cleared, and out through the lounge. The same journey run backwards.',
          },
        ],
        sources:
          'Heathrow Windsor, Manchester Aether and Signature Aviation published service descriptions · Benoy Customer Touchpoint Service Map, Rev02.',
      },
      {
        id: 'where-it-stands',
        label: 'Where it stands',
        heading: 'The base is full. The next one is under construction.',
        milestones: [
          {
            period: '2011',
            title: 'First purpose-built FBO at MMIA',
            body: 'VVIP lounge, hangar and landside offices open. Fifteen years of continuous operation follow.',
          },
          {
            period: '2024',
            title: 'Aeroplex concession executed',
            body: '60,000 m² at MMIA under a FAAN lease to 2054, plus the adjoining parcel under reclamation.',
          },
          {
            period: 'August 2026',
            title: 'Customs and immigration approved',
            body: 'FAAN inspection passed 21 August; on-site CIQ at the Jet Center launching September 2026, and designed into the Aeroplex terminal.',
          },
          {
            period: 'September 2026 · now',
            title: 'Phase 1 site works past halfway',
            body: '54% complete at Week 17; contractual completion 29 October 2026.',
            current: true,
          },
          {
            period: 'Q4 2027',
            title: 'Opening A',
            body: 'FBO building with three lounges, hangar, apron and fuel. EAN moves its operation to the new campus.',
          },
        ],
        images: [
          {
            src: '/images/future/wings-dining.jpg',
            alt: "The dining room at Wings, EAN's restaurant and in-flight kitchen",
            lede: 'Wings, today',
            caption: 'EAN CATERING · RESTAURANT AND IN-FLIGHT KITCHEN, MMIA',
          },
          {
            src: '/images/future/apron-towing.jpg',
            alt: "A business jet being towed on EAN's apron",
            lede: 'The ramp, today',
            caption: 'EAN GROUND OPERATIONS · TOWING ON THE APRON, MMIA',
          },
          {
            src: '/images/future/apron-dusk.jpg',
            alt: 'Benoy render of the Aeroplex apron and hangar at dusk',
            lede: 'The apron, from 2027',
            caption: 'BENOY RENDER · AT THE AEROPLEX, FROM 2027',
          },
        ],
        sources:
          'Vita and EAN Weekly Progress Report, Week 17 (13 September 2026) · Deed of Lease, FAAN and EAN Aviation Hangar Ltd, 2024 · EAN Facilities records.',
      },
    ],
    faqs: [
      {
        question: 'Is there customs and immigration inside the FBO?',
        answer:
          'Yes. On-site customs and immigration at the Jet Center is approved and launching in September 2026, and the same facility is built into the Aeroplex terminal from opening in Q4 2027.',
      },
      {
        question: 'How far is the lounge from the aircraft?',
        answer:
          'At the Jet Center the lounge opens onto the apron; passengers are driven or walked to the aircraft in minutes. The Aeroplex terminal is larger and keeps the same arrangement: lounge, private screening and apron on one level.',
      },
      {
        question: 'Can my protocol officer meet me at the door?',
        answer:
          "Yes. Protocol officers work alongside EAN's Client Relations team today, and the Aeroplex terminal is designed for that way of travelling, with a private path from the door to the aircraft.",
      },
      {
        question: 'Do you handle commercial-flight passengers, or private only?',
        answer:
          'Private and government aircraft today. The Premium Service at the Aeroplex extends the private path to first and business class passengers on commercial flights, from 2027.',
      },
      {
        question: 'What changes for me when the Aeroplex opens?',
        answer:
          'The same team moves into a 12,275 m² terminal with three lounges, customs and immigration inside, a three-bay hangar and a larger apron. The address changes; the people who meet you do not.',
      },
    ],
    summary:
      'Fifteen years, about a third of Lagos business aviation, one lounge, full hangars. In 2027 the same team moves into a 12,275 m² terminal with three lounges, customs and immigration inside, and a Premium Service for commercial passengers. The way you travel through Lagos changes; the people who meet you do not.',
    crossLinkHeading: 'The FBO is the base the other nine lines stand on.',
    contact: {
      heading: 'Talk to the FBO team.',
      body: 'Trip support, based-aircraft enquiries, in-flight catering through Wings, and Premium Service partnership conversations all run through one desk.',
      phone: { label: '+234 (0)1 295 0960', tel: '+23412950960' },
    },
    disclaimer: DISCLAIMER,
    seoDescription:
      "EAN handles about a third of Lagos business-aviation movements from its 10,000 m² Jet Center at MMIA. Three lounges, customs and immigration on site and a 12,275 m² terminal at the Aeroplex from Q4 2027.",
  },

  // ==========================================================================
  // 02 — EAN Jets
  // ==========================================================================
  {
    slug: 'ean-jets',
    layout: 'brief',
    motion: 'cinematic',
    hero: {
      image: '/images/future/hero-ean-jets.jpg',
      alt: "A business jet framed in the open door of EAN's hangar at MMIA, with more aircraft on the apron beyond",
    },
    tile: {
      image: '/images/future/apron-hangar.jpg',
      alt: "Business jets on EAN's apron in front of the hangar at MMIA",
      size: 'full',
    },
    number: '02',
    name: 'EAN Jets',
    title: 'EAN Jets',
    eyebrow: EYEBROW,
    headline: 'The right aircraft for how Nigeria flies.',
    lede: "EAN Jets brings the HondaJet to Nigeria's busiest routes, with Africa's first HondaJet Authorized Service Centre programme at the Aeroplex behind it. Two aircraft at launch, operating from a base that has handled business jets at Lagos for fifteen years.",
    heroStats: [
      {
        figure: '~10,500',
        label: 'private-jet departures a year in Nigeria, the most of any African country',
      },
      { figure: '~80', label: 'business jets installed in Nigeria, alongside 119 helicopters' },
      {
        figure: '64%',
        label: 'lower fuel cost per flight hour for a HondaJet Elite than a Challenger 605',
      },
      {
        figure: '2027',
        label: 'launch window: operations from June 2027 with two HondaJets based at Lagos',
      },
    ],
    heroSources:
      'ICF Feasibility Report, 2024 · AMSTAT installed-fleet data via Ionic Insights, 2026 · EAN Jets cost review of nine sources and HondaJet Elite S product briefing, 2026 · EAN Jets business plan, approved 9 September 2026.',
    chips: [
      'The operator owns the terminal you walk through',
      'The AMO that maintains the aircraft is on the same ramp',
      'One-way pricing on Lagos to Abuja',
    ],
    sections: [
      {
        id: 'the-base',
        label: 'The base',
        heading: 'An airline built on an FBO, not the other way round.',
        body: [
          "EAN Jets Limited is promoted by EAN Aviation, which has handled business jets at Murtala Muhammed since 2011 and today handles about a third of all business-aviation movements in Lagos. The passenger walks through EAN's own terminal, the aircraft is maintained by EAN's own NCAA-approved AMO, and the fuel, catering and ground handling are EAN's. Few start-up operators anywhere begin with that much of the cost base in hand.",
        ],
        stats: [
          { figure: '2011', label: "EAN's first purpose-built FBO opens at MMIA" },
          { figure: '~35%', label: 'of Lagos business-aviation movements handled by EAN' },
          { figure: '~430', label: 'movements a month across the ramp today' },
          { figure: 'AMO', label: 'NCAA-approved maintenance organisation on site' },
          {
            figure: '141,776',
            label: 'safe man-hours to 11 September 2026, zero lost-time injuries',
          },
        ],
        images: [
          {
            src: '/images/future/apron-hangar.jpg',
            width: 1400,
            height: 937,
            alt: "Business jets on EAN's apron in front of the hangar at MMIA",
            caption: 'EAN JET CENTER · APRON AND HANGAR, MMIA',
          },
          {
            src: '/images/future/flight-dispatch.jpg',
            people: true,
            width: 1400,
            height: 1450,
            alt: "EAN's flight dispatch team",
            caption: 'EAN FLIGHT DISPATCH · AROUND THE CLOCK',
          },
        ],
        sources:
          'EAN Business Lens data, 2025 to 2026 · NCAA AMO approval · EAN Quality and Safety KPI review, 17 September 2026.',
      },
      {
        id: 'the-market',
        label: 'The market',
        heading: 'The busiest routes in West Africa, ready for a new generation of aircraft.',
        body: [
          "Abuja, Lagos and Port Harcourt generate most of Nigeria's air-transport activity, and Lagos to Abuja is the country's busiest route. Much of the private fleet flying it was delivered for a different era of fuel prices and cabin sizes, and manufacturer support for it sits offshore. That is the opening for a new-technology light jet with its service centre on the ground.",
          "Charter in Nigeria has long been sold at full round-trip fares, so clients pay for the empty return leg. At the HondaJet's operating cost, one-way pricing becomes possible on the reference route, Lagos to Abuja: about an hour in the air, from EAN's own terminal.",
        ],
        pullStatAt: 1,
        pullStat: {
          figure: '17.9m',
          label:
            "passengers through Nigeria's airports in 2025, up 5.9% on the year, with Lagos the busiest hub.",
        },
        sources:
          'FAAN traffic report, 2025 · ICF Feasibility Report, 2024 · EAN Jets business plan V3.',
      },
      {
        id: 'the-aircraft',
        label: 'The aircraft',
        heading: 'Fastest and longest range in its class, and built by Honda.',
        body: [
          "The HondaJet's over-the-wing engine mount, natural-laminar-flow wing and composite fuselage give it the highest speed, longest range and largest cabin in its class, with the lowest fuel burn: roughly 96 to 118 US gallons an hour against several hundred for a heavy jet. More than 275 have been delivered worldwide, with a 99.83% dispatch reliability across the fleet.",
        ],
        images: [
          {
            src: '/images/future/hangar-interior.jpg',
            width: 1400,
            height: 775,
            alt: 'Concept view of the Aeroplex hangar with aircraft parked inside',
            caption: "AEROPLEX HANGAR · CONCEPT VIEW · THE HONDAJET LINE'S HOME FROM 2027",
          },
        ],
        cards: [
          {
            kicker: 'Speed and range',
            title: 'In its class, the benchmark',
            body: 'The fastest and longest-range light jet in its class, already entering African fleets. More city pairs without a fuel stop.',
          },
          {
            kicker: 'Operating cost',
            title: '64% less fuel than a Challenger',
            body: 'The lowest cost per flight hour in its class, modelled by EAN Jets against the aircraft it competes with.',
          },
          {
            kicker: 'Support on the ground',
            title: "Africa's first Authorized Service Centre programme",
            body: "Line maintenance in Lagos from entry into service, with Banyan Air Service, the world's largest independent HondaJet sales and service provider, as technical partner since April 2025.",
          },
        ],
        logos: [
          { src: '/images/future/logo-hondajet.png', alt: 'HondaJet' },
          { src: '/images/future/logo-banyan-air-service.png', alt: 'Banyan Air Service' },
        ],
        sources:
          "Honda Aircraft Company, HondaJet Elite S product briefing, 2026 (class claims are the manufacturer's) · EAN Jets cost review · Banyan Air Service technical support agreement, 28 April 2025.",
      },
      {
        id: 'the-plan',
        label: 'The plan',
        heading: 'Two aircraft, one base, one route to prove it on.',
        cards: [
          {
            kicker: 'Launch fleet',
            title: 'Two HondaJets',
            body: 'Based at Lagos, operating from June 2027, with one managed aircraft added from Q3 2028.',
          },
          {
            kicker: 'Product',
            title: 'Blocks and one-way',
            body: '25-hour and 10-hour block programmes, and one-way pricing on Lagos to Abuja as the reference route.',
          },
          {
            kicker: 'Base',
            title: 'The Aeroplex',
            body: 'Hangar, FBO, fuel hydrant, catering and the AMO at one address from Opening A, Q4 2027.',
          },
          {
            kicker: 'Maintenance',
            title: 'Trained before delivery',
            body: 'EAN engineers trained at FlightSafety Greensboro and Banyan Fort Lauderdale; a HondaJet line station in Lagos.',
          },
          {
            kicker: 'Regulator',
            title: 'NCAA type acceptance',
            body: 'Type-certificate acceptance in process with the NCAA; application received 26 August 2026.',
          },
          {
            kicker: 'The region',
            title: 'One continent open',
            body: "HondaJet's authorised network spans the Americas, Europe and Asia. The Lagos line opens Africa.",
          },
        ],
        sources:
          'EAN Jets business plan, 18 August 2026 VDR, approved 9 September 2026 · NCAA type-certificate acceptance programme · Honda Aircraft Company authorised network.',
      },
      {
        id: 'where-it-stands',
        label: 'Where it stands',
        heading: 'Two steps done, two in motion, one queued.',
        milestones: [
          {
            period: 'April 2025',
            title: 'Banyan technical agreement',
            body: 'Technical support agreement with Banyan Air Service: HondaJet maintenance training, on-call AOG support and preferred parts access.',
          },
          {
            period: '2025 to 2026',
            title: 'Manufacturer engagement',
            body: 'Confidentiality agreement signed and active with Honda Aircraft Company; NCAA type-certificate acceptance funded and in process.',
          },
          {
            period: 'September 2026 · now',
            title: 'Business plan approved',
            body: "Business plan approved 9 September; purchase and deposit agreements in legal review; financing workstream with EAN's advisers.",
            current: true,
          },
          {
            period: '2026 to 2027',
            title: 'Authorized Service Centre programme',
            body: 'Representation rights process begins on completion of type acceptance. Nothing claimed ahead of its paperwork.',
          },
          {
            period: 'June 2027',
            title: 'First flights',
            body: 'Two HondaJets operating from Lagos; revenue from July 2027.',
          },
        ],
        sources:
          'EAN and Honda Aircraft engagements, 2025 to 2026 · Banyan Air Service agreement, 28 April 2025 · EAN Jets business plan, approved 9 September 2026.',
      },
    ],
    faqs: [
      {
        question: 'When does EAN Jets start flying?',
        answer:
          'Operations are planned from June 2027 with two HondaJets based at Lagos, subject to NCAA certification.',
      },
      {
        question: 'Which routes first?',
        answer:
          "Lagos to Abuja is the reference route, then Port Harcourt and the other cities Nigeria's business traffic flies most.",
      },
      {
        question: 'What is a block programme?',
        answer:
          'A prepaid block of flying hours, 25 or 10, drawn down trip by trip at an agreed rate, with priority on the aircraft.',
      },
      {
        question: 'Who maintains the aircraft and where?',
        answer:
          "EAN's own NCAA-approved AMO at Lagos, with engineers trained at FlightSafety Greensboro and Banyan Fort Lauderdale, and Banyan Air Service on call for AOG support and parts.",
      },
      {
        question: 'What is a light jet, and what does that mean for my trip?',
        answer:
          "A four to six seat jet built for one to three hour sectors. On Lagos to Abuja it means a private cabin, a departure from EAN's own terminal and about an hour in the air.",
      },
    ],
    summary:
      'Two HondaJets from June 2027, based at Lagos, on the routes Nigeria flies most, from an FBO and an AMO that have been on the ground since 2011. Book by the block, by the seat or by the trip.',
    crossLinkHeading: 'EAN Jets flies from the base the other nine lines share.',
    contact: {
      heading: 'Talk to EAN Jets.',
      body: 'Charter and block programme enquiries, aircraft acquisition and the HondaJet service centre programme all run through this desk.',
      phone: { label: '+234 (0)1 295 0960', tel: '+23412950960' },
    },
    disclaimer: DISCLAIMER,
    seoDescription:
      "EAN Jets brings the HondaJet to Nigeria's busiest routes from June 2027: two aircraft based at Lagos, block programmes, one-way pricing on Lagos to Abuja, and Africa's first HondaJet Authorized Service Centre programme.",
  },

  // ==========================================================================
  // 03 — Maintenance
  // ==========================================================================
  {
    slug: 'maintenance',
    layout: 'brief',
    motion: 'cinematic',
    hero: {
      // Deliberately the Aeroplex render rather than the deck's workshop photograph.
      image: '/images/future/render-maintenance-hangar.jpg',
      alt: 'Concept view of the Aeroplex hangar interior, with business jets in for maintenance and technicians on the floor',
      // Bottom-aligned, which keeps the floor-level scene clear of the title.
      imagePosition: '50% 100%',
    },
    tile: {
      image: '/images/future/maintenance-helicopter.jpg',
      alt: 'EAN technicians working on a helicopter on the apron',
      size: 'half',
      imagePosition: '50% 45%',
    },
    number: '03',
    name: 'Maintenance',
    title: 'EAN Maintenance',
    eyebrow: EYEBROW,
    headline: 'Wheels, brakes and NDT today. The whole aircraft next.',
    lede: "Twenty-two operators already bring their wheels, brakes and non-destructive testing to EAN's NCAA-approved AMO at Lagos. A technical agreement with America's No. 1 FBO, and a 4,300 m² service centre at the Aeroplex, take it much further.",
    heroStats: [
      {
        figure: '22',
        label: 'client operators today: seven commercial airlines and fifteen business-aviation operators',
      },
      { figure: '16', label: 'aircraft types maintained, across six airframe makers' },
      { figure: '5,142', label: 'maintenance jobs completed in 2025, up from 2,479 in 2021' },
      {
        figure: '44 yrs',
        label: "Banyan Air Service as an FAA and EASA approved repair station, EAN's technical partner since April 2025",
      },
    ],
    heroSources:
      "EAN AMO records, 2021 to 2026 · NCAA AMO approval · Banyan Air Service technical support agreement, 28 April 2025 · Professional Pilot PRASE survey (Banyan, America's No. 1 FBO).",
    chips: [
      'NCAA-approved, 22 operators',
      'Wheels, brakes and NDT in house, no ferry flight',
      "Banyan's 44 years behind the shop",
    ],
    sections: [
      {
        id: 'ean-today',
        label: 'EAN today',
        heading: 'Sixteen aircraft types, six airframe makers, one AMO.',
        body: [
          'EAN holds an NCAA-approved Aircraft Maintenance Organisation covering accessories and non-destructive testing, serving commercial airlines and business-aviation operators across sixteen types from Boeing, Airbus, Bombardier, Embraer, Gulfstream and Hawker. NDT Level 2 capability is in-house (penetrant, magnetic particle and eddy current) under an NCAA-licensed head of maintenance.',
        ],
        stats: [
          {
            figure: '7',
            label: 'commercial airlines served: Air Peace, Arik, Ibom Air and ValueJet among them',
          },
          { figure: '15', label: 'business-aviation operators served' },
          { figure: '~25', label: 'Nigerian-registered business jets through the shop a month' },
          { figure: '29', label: 'foreign-registered regulars' },
          { figure: '2011', label: 'EAN on the ground at MMIA' },
        ],
        images: [
          {
            src: '/images/future/maintenance-team.jpg',
            people: true,
            width: 1400,
            height: 934,
            alt: "EAN's maintenance team",
            caption: 'EAN MAINTENANCE TEAM · MMIA LAGOS',
          },
          {
            src: '/images/future/maintenance-helicopter.jpg',
            width: 1400,
            height: 788,
            alt: 'EAN technicians working on a helicopter on the apron',
            caption: 'LINE WORK ON THE APRON · MMIA',
          },
        ],
        sources: 'EAN AMO records, 2021 to 2026 · NCAA approval documents.',
      },
      {
        id: 'capabilities',
        label: 'Capabilities',
        heading: 'The work that keeps an aircraft airworthy between heavier checks.',
        cards: [
          {
            kicker: 'Today',
            title: 'Wheels and brakes',
            body: 'Overhaul and repair for commercial and business aircraft wheel and brake assemblies. Nigeria’s leading shop by operators served.',
          },
          {
            kicker: 'Today',
            title: 'Non-destructive testing',
            body: 'Level 2 penetrant, magnetic particle and eddy current inspection, without disassembling the aircraft.',
          },
          {
            kicker: 'Started, scaling',
            title: 'Line maintenance',
            body: 'Scheduled and unscheduled checks for Nigerian-registered business jets, stepping up at the Aeroplex.',
          },
          {
            kicker: 'Today',
            title: 'AOG support',
            body: 'On-call response for aircraft on the ground at Lagos.',
          },
          {
            kicker: 'Expansion',
            title: 'Aircraft detailing',
            body: 'Exterior and interior detailing alongside the hangar.',
          },
          {
            kicker: 'From 2028',
            title: 'OEM-level work',
            body: 'HondaJet Authorized Service Centre programme, at the Aeroplex service centre.',
          },
        ],
        sources: 'EAN AMO capability list, 2026 · EAN management, July 2026.',
      },
      {
        id: 'the-opportunity',
        label: 'The opportunity',
        heading: 'The movements are here. The maintenance money is booked in South Africa.',
        body: [
          "Africa's business-jet maintenance houses cluster around Lanseria, near Johannesburg. About US$293m a year of business-aviation maintenance is booked there, and Banyan's repair-station coverage reaches about 90% of that fleet: Challenger, Hawker, Falcon, Citation, Learjet, King Air, Pilatus and HondaJet. Across the northern half of the continent, Nigeria included, base and OEM-level work still means a ferry flight.",
          'The Aeroplex service centre keeps that work closer to the fleet: a 4,300 m² building with workshops, technical stores and a training academy, beside a three-bay hangar that takes a Global 7500 in each bay.',
        ],
        pullStatAt: 1,
        pullStat: {
          figure: '~300',
          label: 'man-hours a jet kept in Lagos when the work is done locally instead of flown abroad.',
        },
        sources:
          'ICF analysis of WingX traffic data, 2024 · South African maintenance house public filings · Banyan Air Service repair-station capability list · Benoy Final Concept Report, June 2026.',
      },
      {
        id: 'whats-next',
        label: "What's next",
        heading: "A technical agreement with America's No. 1 FBO.",
        body: [
          'Banyan Air Service, voted America’s No. 1 FBO and an FAA and EASA approved repair station of 44 years, signed a technical support agreement with EAN on 28 April 2025: HondaJet maintenance training, on-call AOG support and preferred parts access. Two EAN engineers train at FlightSafety Greensboro with supervised practical work at Banyan Fort Lauderdale.',
        ],
        images: [
          {
            src: '/images/future/hangar-interior.jpg',
            width: 1400,
            height: 775,
            alt: 'Concept view of the Aeroplex hangar interior',
            caption: 'AEROPLEX THREE-BAY HANGAR · CONCEPT VIEW · FROM 2027',
          },
          {
            src: '/images/future/apron-helicopters.jpg',
            width: 1400,
            height: 788,
            alt: "Helicopters on EAN's apron at MMIA",
            caption: 'ROTARY WORK ON THE APRON · MMIA TODAY',
          },
        ],
        steps: [
          { number: 'Stage 1', title: 'Wheels, brakes and NDT', body: "Today's core scope, serving 22 operators" },
          { number: 'Stage 2', title: 'Line maintenance', body: 'Started; scaling for Nigerian-registered jets' },
          { number: 'Stage 3', title: 'EAN Jets and foreign fleet', body: "EAN Jets' own HondaJets and foreign-registered regulars" },
          { number: 'Stage 4', title: 'OEM service centre', body: "Africa's first HondaJet Authorized Service Centre programme" },
          { number: 'Opening B', title: 'Q2 2028', body: '4,300 m² service centre and training academy' },
          { number: 'Beyond', title: 'Base maintenance', body: 'Heavier checks in the three-bay hangar' },
        ],
        logos: [
          { src: '/images/future/logo-banyan-air-service.png', alt: 'Banyan Air Service' },
          { src: '/images/future/logo-hondajet.png', alt: 'HondaJet' },
        ],
        sources:
          'Banyan Air Service agreement, 28 April 2025 · Professional Pilot PRASE survey · Benoy Final Concept Report.',
      },
      {
        id: 'where-it-stands',
        label: 'Where it stands',
        heading: 'Approved, partnered, and building the next shop.',
        milestones: [
          {
            period: '2011',
            title: 'EAN opens at MMIA',
            body: "FBO, hangar and the wheels and brakes shop that grew into today's AMO.",
          },
          {
            period: '2025 to 2028',
            title: 'NCAA AMO approval current',
            body: 'Aircraft Maintenance Organisation approval, accessories and NDT, valid to 2028.',
          },
          {
            period: 'April 2025',
            title: 'Banyan technical agreement',
            body: 'Technical support agreement signed 28 April 2025; engineer training under way.',
          },
          {
            period: 'August 2026 · now',
            title: 'HondaJet type acceptance in process',
            body: 'NCAA type-certificate acceptance application received 26 August 2026; new operator onboarded in September.',
            current: true,
          },
          {
            period: 'Q2 2028',
            title: 'Opening B',
            body: 'The service centre opens at the Aeroplex; the AMO moves to scale.',
          },
        ],
        sources:
          'NCAA AMO approval documents · Banyan Air Service agreement · NCAA type-certificate acceptance programme · EAN AMO records, September 2026.',
      },
    ],
    faqs: [
      {
        question: 'Which aircraft types do you hold approval for?',
        answer:
          "Sixteen types across Boeing, Airbus, Bombardier, Embraer, Gulfstream and Hawker, for accessories and non-destructive testing under EAN's NCAA AMO approval.",
      },
      {
        question: 'Do you do line maintenance today or only wheels, brakes and NDT?',
        answer:
          'Wheels, brakes and NDT are the core scope. Line maintenance for Nigerian-registered business jets has started and steps up at the Aeroplex.',
      },
      {
        question: 'How do I open an account as an airline?',
        answer:
          'Email the maintenance team with your fleet and the components you turn most; the AMO issues a rate card and a service agreement.',
      },
      {
        question: 'When does the HondaJet service centre open?',
        answer:
          'The Authorized Service Centre programme is under way with Banyan Air Service; the 4,300 m² Aeroplex service centre opens in Q2 2028.',
      },
      {
        question: 'Can you support an AOG at Lagos tonight?',
        answer:
          'Yes. On-call AOG support runs from the Lagos shop, with Banyan Air Service behind it for HondaJet parts and technical advice.',
      },
    ],
    summary:
      "Twenty-two operators already send wheels, brakes and NDT to EAN. Line maintenance is started. Banyan's agreement and the 2028 service centre take the shop to OEM level, and keep the work that flies to Johannesburg today in Lagos.",
    crossLinkHeading: 'The AMO keeps the other nine lines flying.',
    contact: {
      heading: 'Bring your maintenance to EAN.',
      body: 'AMO enquiries, line maintenance contracts and the HondaJet service centre programme.',
      phone: { label: '+234 (0)1 295 0960', tel: '+23412950960' },
    },
    disclaimer: DISCLAIMER,
    seoDescription:
      "EAN's NCAA-approved AMO at Lagos serves 22 operators across 16 aircraft types, with wheels, brakes and NDT in house, Banyan Air Service as technical partner and a 4,300 m² service centre at the Aeroplex from Q2 2028.",
  },

  // ==========================================================================
  // 04 — Aircraft Leasing & Brokerage
  // ==========================================================================
  {
    slug: 'aircraft-leasing-and-brokerage',
    layout: 'brief',
    motion: 'cinematic',
    hero: {
      // Deliberately the Aeroplex render rather than the deck's apron photograph.
      image: '/images/future/render-hangar-boarding.jpg',
      alt: 'Concept view of an Aeroplex hangar, with passengers boarding a large-cabin business jet by its airstair',
      // Bottom-aligned, which keeps the floor-level scene clear of the title.
      imagePosition: '50% 100%',
    },
    tile: {
      image: '/images/future/apron-towing.jpg',
      alt: "A business jet under tow on EAN's ramp",
      size: 'half',
    },
    number: '04',
    name: 'Aircraft Leasing & Brokerage',
    title: 'Aircraft Leasing & Brokerage',
    eyebrow: EYEBROW,
    headline: 'Aircraft sales and brokerage, reintroduced.',
    lede: 'Not a new venture. EAN has held OEM representation mandates with Airbus Helicopters and Gulfstream, and its transaction team now operates a dedicated leasing and sales brokerage desk. IATA-designed, launching now out of Lagos.',
    heroStats: [
      {
        figure: '58%',
        label: "of the world's commercial fleet is leased, not owned, up from about 10% in the 1970s",
      },
      {
        figure: '1,568',
        label:
          'aircraft active in Africa in 2025; 54% of the West African fleet is leased, and 51% of those fly in Nigeria',
      },
      {
        figure: '1,200+',
        label: 'new aircraft due for delivery to Africa by 2044, more than doubling the fleet to 1,680',
      },
      {
        figure: '6%',
        label: 'forecast annual growth in African air traffic to 2044, among the fastest of any region',
      },
    ],
    heroSources:
      'IATA, More Aircraft Are Leased Than Owned by Airlines Globally, April 2024 · Cirium Fleet Forecast, October 2025 · Boeing Commercial Market Outlook: Africa, December 2025 · IATA Consulting business plan for EAN, 2026.',
    chips: [
      'Fifteen years of OEM and transaction work',
      'Structured with IATA Consulting',
      'First mandates in execution',
    ],
    sections: [
      {
        id: 'track-record',
        label: 'Track record',
        heading: 'Former OEM mandates with Gulfstream and Airbus Helicopters, one desk.',
        body: [
          'Over fifteen years in aviation EAN has held OEM representation mandates with Airbus Helicopters and Gulfstream and provided transaction support alongside Bombardier. The relationships and the transaction skills behind that work now sit inside one dedicated team, covering valuation, sourcing, inspection, negotiation, documentation and delivery.',
        ],
        images: [
          {
            src: '/images/future/apron-jets.jpg',
            width: 1200,
            height: 900,
            alt: "Business jets on EAN's apron at MMIA",
            caption: 'EAN JET CENTER · THE APRON TODAY',
          },
          {
            src: '/images/future/apron-towing.jpg',
            width: 1400,
            height: 744,
            alt: "A business jet under tow on EAN's ramp",
            caption: 'EAN GROUND OPERATIONS · MMIA',
          },
        ],
        cards: [
          {
            kicker: 'Airbus Helicopters · former',
            title: 'Exclusive distributor, Africa · 2011 to 2014',
            body: 'The first exclusive Airbus Helicopters distributor in Africa. Rotary representation into oil and gas and private operators.',
          },
          {
            kicker: 'Gulfstream · former',
            title: 'Exclusive representative, region · 2013 to 2014',
            body: 'The first exclusive Gulfstream representative in the region. Business jets sold and supported into the Nigerian market.',
          },
          {
            kicker: 'Bombardier',
            title: 'Transaction support',
            body: 'Aircraft transaction support for Nigerian owners, alongside the OEM.',
          },
        ],
        notes: [
          {
            label: 'The desk',
            body: 'The desk sits on the apron it sells from. A buyer can see the aircraft, meet the AMO that will inspect it and sign in the same building, the same afternoon.',
          },
          {
            label: 'The ambition',
            body: "The continent's premier aircraft brokerage, acquisition and leasing advisory firm: West Africa first, pan-African by 2029.",
          },
        ],
        sources: 'EAN corporate record · IATA Consulting business plan, September 2026.',
      },
      {
        id: 'the-market',
        label: 'The market',
        heading: 'Africa’s fleet doubles by 2044. Most of it will be leased.',
        body: [
          "Leasing is how the world's airlines grow, and Africa is the fastest-growing region in the forecast. Nigeria is the largest single market in West Africa, with more than half the region's leased aircraft flying here. The regional desk sits where the demand is.",
        ],
        pullStat: {
          figure: '$3.4tn',
          label: 'value of the 46,500 new commercial aircraft due for delivery worldwide through 2044.',
        },
        sources:
          'Cirium Fleet Forecast, October 2025 · Boeing Commercial Market Outlook: Africa, December 2025.',
      },
      {
        id: 'services',
        label: 'Services',
        heading: 'Five business streams, eleven services, end to end.',
        cards: [
          {
            kicker: 'Stream 1',
            title: 'Dry-lease placement',
            body: 'Lessor and lessee representation on operating-lease transactions for commercial aircraft.',
          },
          {
            kicker: 'Stream 2',
            title: 'ACMI narrow-body',
            body: 'Wet-lease capacity sourced and placed for short-haul fleets.',
          },
          {
            kicker: 'Stream 3',
            title: 'ACMI wide-body',
            body: 'Wet-lease capacity for long-haul and high-density routes, Hajj and Umrah among them.',
          },
          {
            kicker: 'Stream 4',
            title: 'Business aviation',
            body: 'Acquisition and sales mandates for corporate and private owners; the HondaJet line through EAN Jets.',
          },
          {
            kicker: 'Stream 5',
            title: 'Commercial aircraft sales and asset management',
            body: 'Remarketing, records and asset management for owners and financiers.',
          },
          {
            kicker: 'Across all five',
            title: 'One transaction team',
            body: 'Valuation, sourcing, inspection, negotiation, documentation and delivery.',
          },
        ],
        sources:
          'IATA Consulting business plan for EAN Aircraft Leasing and Brokerage, September 2026.',
      },
      {
        id: 'how-a-mandate-runs',
        label: 'How a mandate runs',
        heading: "From the client's brief to aircraft delivery.",
        body: [
          'Every mandate follows the same path. Timelines vary with aircraft type, inspection findings and financing, but most pre-owned transactions complete within a few months of a signed letter of intent.',
        ],
        steps: [
          {
            number: '01',
            title: 'Mandate and compliance',
            body: 'Engagement terms agreed; client requirements, KYC and sanctions screening completed',
          },
          {
            number: '02',
            title: 'Market search and shortlist',
            body: 'Aircraft or lessees sourced against the brief, with indicative pricing',
          },
          {
            number: '03',
            title: 'Valuation and LOI',
            body: 'Commercial terms agreed, a letter of intent signed and a deposit placed in escrow',
          },
          {
            number: '04',
            title: 'Inspection and records',
            body: 'Pre-purchase inspection and maintenance status review at an agreed facility',
          },
          {
            number: '05',
            title: 'Documentation and closing',
            body: 'Purchase or lease agreement executed, funds released, title transferred',
          },
          { number: '06', title: 'Delivery', body: 'Aircraft delivered and entered into service' },
        ],
        pullStatAt: 'after-blocks',
        pullStat: {
          figure: '3 to 6 months',
          label:
            'typical time from signed mandate to aircraft delivery for a pre-owned transaction, in line with standard industry timelines.',
        },
        notes: [
          {
            label: 'Terms',
            body: 'Fees are agreed at mandate, in writing, before the search starts.',
          },
        ],
        sources: 'IATA Consulting business plan, 2026 · standard industry transaction timelines.',
      },
      {
        id: 'where-it-stands',
        label: 'Where it stands',
        heading: 'Structured with IATA Consulting. First mandates in execution.',
        milestones: [
          {
            period: 'April 2026',
            title: 'IATA Consulting engaged',
            body: 'Engagement CON-IATA-1052720: opportunity and threat assessment, business plan, financial models across two transaction scenarios, and a ramp-up plan.',
          },
          {
            period: 'May 2026',
            title: 'Opportunity and Threat Report',
            body: 'Market assessment delivered.',
          },
          {
            period: 'August 2026',
            title: 'Business plan and rate card',
            body: 'Full business plan and rate card delivered; final business plan submitted 2 September.',
          },
          {
            period: 'September 2026 · now',
            title: 'Launch',
            body: 'Desk launched at Aviation Africa, Nairobi, with meetings across 25 airlines and lessors. First mandates in execution, including E-Jet family sourcing for a West African carrier.',
            current: true,
          },
          { period: '2029', title: 'Pan-African', body: 'West Africa first, then the continent.' },
        ],
        logos: [{ src: '/images/future/logo-iata-consulting.png', alt: 'IATA Consulting' }],
        sources:
          'IATA Consulting engagement record and disclosure side letter, 16 September 2026 · EAN Aviation Africa 2026 meeting register.',
      },
    ],
    faqs: [
      {
        question: 'What does a mandate cost and when is it payable?',
        answer:
          'Fees are agreed at mandate, in writing, before the search starts. The structure depends on the transaction; the desk sends a term sheet on request.',
      },
      {
        question: 'Do you represent buyers, sellers or both?',
        answer:
          'Both, never on the same transaction. Lessor and lessee, buyer and seller representation are separate mandates.',
      },
      {
        question: 'Can you source a wet-lease for Hajj?',
        answer:
          'Yes. ACMI wide-body capacity for Hajj and Umrah is one of the five business streams.',
      },
      {
        question: 'How long from mandate to delivery?',
        answer:
          'Three to six months for a typical pre-owned transaction, from signed mandate to aircraft delivery.',
      },
      {
        question: 'Do you handle business jets or only airliners?',
        answer:
          'Both. Business-aviation acquisition and sales sit alongside commercial dry-lease, ACMI and asset management.',
      },
    ],
    summary:
      'Not a new venture. OEM mandates behind it, an IATA-designed desk in front of it, and first mandates in execution out of Lagos.',
    crossLinkHeading: 'The desk sits on the same campus as the other nine lines.',
    contact: {
      heading: 'Send the desk a mandate brief.',
      body: 'Speak to the desk about a mandate, a specific aircraft requirement, or a current opportunity.',
      phone: { label: '+234 (0)1 295 0960', tel: '+23412950960' },
    },
    disclaimer: DISCLAIMER,
    seoDescription:
      "EAN's leasing and sales brokerage desk, structured with IATA Consulting and launching from Lagos: dry-lease placement, ACMI narrow and wide-body, business-aviation acquisition and asset management.",
  },

  // ==========================================================================
  // 05 — EAN Fuels (Evergreen Energy · Jet A-1)
  // ==========================================================================
  {
    slug: 'ean-fuels',
    layout: 'brief',
    motion: 'cinematic',
    hero: {
      image: '/images/future/apron-dusk.jpg',
      alt: 'Render of the Aeroplex apron and hangar at dusk',
    },
    tile: {
      image: '/images/future/aeroplex-night.jpg',
      alt: 'Aerial concept view of the Aeroplex at night',
      size: 'full',
    },
    number: '05',
    name: 'EAN Fuels',
    title: 'Evergreen Energy · Jet A-1 Fuel',
    eyebrow: EYEBROW,
    headline: '1.08 million litres of Jet A-1, from our depot to the wing, by hydrant.',
    lede: "Evergreen Energy (Jet A-1 Fuel), the EAN Group's fuel company, is building a 1,080,000-litre Jet A-1 depot at the Aeroplex, six 180,000-litre tanks, with an underground hydrant to the apron and into-plane service from day one. Fuel stored on site, delivered under the apron, metered at the wing, to ICAO, JIG and NMDPRA standards. The ramp it serves already uplifts about 330,000 litres a month.",
    heroStats: [
      {
        figure: '1,080,000 L',
        label:
          "Jet A-1 depot on Evergreen Energy's plot at the Aeroplex: six 180,000-litre horizontal tanks, hydrant to the apron",
      },
      {
        figure: '~330,000 L',
        label:
          "a month already uplifted on EAN's own ramp: 328,257 litres in the 30 days 2 to 31 August 2026, measured daily",
      },
      {
        figure: '77.8%',
        label: "share of Nigeria's Jet A-1 volume that moves through Lagos: MMIA, MMA2 and NAF",
      },
      {
        figure: '~78%',
        label: "of modelled fuel volume is aircraft already parked on EAN's own apron",
      },
    ],
    heroSources:
      'Mangrove Hills Consulting viability study, June 2026 · EAN Daily Fuel Upload (Quality and Safety): 328,257 litres and 457 movements, 2 to 31 August 2026; 271,569 litres dispensed 27 August to 16 September 2026, September tracking above 400,000 litres · NMDPRA and industry marketer volumes.',
    chips: [
      'Our own depot, our own hydrant',
      'About 330,000 litres a month already on our ramp, measured daily',
      'Designed by the technical lead on JUHI-2',
    ],
    sections: [
      {
        id: 'ean-today',
        label: 'EAN today',
        heading: 'Four hundred and thirty movements a month, fueled on our ramp.',
        body: [
          "Fuel is 50 to 70% of a typical FBO's revenue. EAN's apron already turns about 430 movements a month, and about 330,000 litres of Jet A-1 go into wings on it, measured daily. At the Aeroplex, Evergreen Energy earns from that fuel on EAN's own ramp, through its own depot and hydrant.",
        ],
        stats: [
          { figure: '~430', label: 'aircraft movements a month today' },
          { figure: '~718 L', label: 'average uplift per movement' },
          { figure: '2011', label: 'EAN on the ground at MMIA' },
          { figure: 'Q4 2027', label: 'Opening A: depot and hydrant live with the apron' },
        ],
        images: [
          {
            src: '/images/future/apron-jets.jpg',
            width: 1200,
            height: 900,
            alt: "Business jets on EAN's apron at MMIA",
            caption: 'EAN JET CENTER · THE APRON TODAY',
          },
          {
            src: '/images/future/aeroplex-night.jpg',
            width: 1400,
            height: 624,
            alt: 'Aerial concept view of the Aeroplex at night',
            caption: 'THE AEROPLEX · AERIAL CONCEPT VIEW · FROM 2027',
          },
        ],
        sources:
          'EAN Daily Fuel Upload, 2 to 31 August 2026 (Quality and Safety) · industry FBO revenue analyses (fuel 50 to 70% of FBO revenue).',
      },
      {
        id: 'why-now',
        label: 'Why now',
        heading: 'The apron opens in 2027. The depot opens with it.',
        body: [
          "Lagos moves the large majority of Nigeria's jet fuel, and MMIA's traffic grew 11.8% in the first half of 2026, the fastest among Africa's top airports. Road bridging adds 15 to 20% to delivered fuel prices in Lagos; a hydrant under the apron removes it. Once the apron opens, Evergreen Energy's storage, hydrant and into-plane service extend to the wider airport.",
        ],
        pullStat: {
          figure: '15 to 20%',
          label:
            'added to delivered fuel prices in Lagos by road bridging, the cost a hydrant under the apron removes.',
        },
        sources:
          'Mangrove Hills Consulting viability study, June 2026 · FAAN traffic data, first half 2026.',
      },
      {
        id: 'the-approach',
        label: 'The approach',
        heading: 'Stored on site, delivered under the apron, metered at the wing.',
        body: [
          "Supply-flexible: Dangote direct, independent importers, or partner supply agreements. A 1,080,000-litre depot of six 180,000-litre horizontal tanks on Evergreen Energy's plot at the Aeroplex, built to NCAA and NMDPRA rules. An underground hydrant line to six apron pit valves, into-plane from day one, no road bridging on the apron. A dedicated 28-person fuel team will run bowser and hydrant together.",
        ],
        images: [
          {
            src: '/images/future/site-layout.jpg',
            width: 1400,
            height: 1404,
            alt: 'Crownfield Architects master site layout, 14 September 2026, with the aviation fuel storage beside the hangar and the apron',
            caption:
              'CROWNFIELD ARCHITECTS · MASTER SITE LAYOUT · ISSUED 14 SEPTEMBER 2026 · AVIATION FUEL STORAGE BESIDE THE HANGAR WITH THE HYDRANT LINE INTO THE APRON',
            fullWidth: true,
          },
          {
            src: '/images/future/apron-dusk.jpg',
            width: 1303,
            height: 733,
            alt: 'Benoy render of the Aeroplex apron and hangar at dusk',
            caption: 'BENOY RENDER · THE APRON THE HYDRANT SERVES · FROM 2027',
          },
        ],
        cards: [
          {
            kicker: 'Depot',
            title: 'Six tanks, 1,080,000 litres',
            body: 'Six 180,000-litre horizontal Jet A-1 tanks in a concrete bund, receiving, settling and dispensing kept separate so only settled, tested fuel reaches the hydrant.',
          },
          {
            kicker: 'Hydrant',
            title: 'Six pit valves in the apron',
            body: 'Pressure and shutoffs run remotely from the depot; hydrant-ready from day one. No bowser queue, no road bridging: fuel at the stand the moment the aircraft is on chocks.',
          },
          {
            kicker: 'Bowser fleet',
            title: 'Contingency and reach',
            body: 'Mobile into-plane refueling backs the hydrant network and covers contingency uptime.',
          },
          {
            kicker: 'Into-plane',
            title: 'Jet A-1 to the wing',
            body: "Metered, quality-controlled into-plane service on EAN's ramp, then the wider airport.",
          },
        ],
        notes: [
          {
            label: 'Design, construction and commissioning',
            body: "Dr Olasimbo Betiku, Mangrove Hills Consulting, leads the design: technical lead on JUHI-2, Lagos's second jet-fuel hydrant system, and former COO of CITA Group, where he grew the business to fifteen jet-fuel depots, Nigeria's largest.",
          },
          { label: 'Fuel partner', body: 'To be announced.' },
        ],
        logos: [
          { src: '/images/future/logo-mangrove-hills-consulting.png', alt: 'Mangrove Hills Consulting' },
        ],
        sources:
          'Mangrove Hills Consulting, viability study Vol. 1 and design Vol. 2, 2026 · EAN management decision, July 2026.',
      },
      {
        id: 'built-to-standard',
        label: 'Built to standard',
        heading: 'Nine permits, eleven external standards, and a dedicated team.',
        body: [
          'A dedicated fuel team runs bowser and hydrant together, working to eleven external standards and four NCAA-approved EAN manuals, behind nine permits. The organisation is designed before the steel.',
        ],
        cards: [
          {
            kicker: 'ICAO Doc 9977',
            title: 'Civil aviation jet fuel supply',
            body: 'The manual on civil aviation jet fuel supply: quality, handling and custody from receipt to wing.',
          },
          {
            kicker: 'API 650',
            title: 'Welded tanks for oil storage',
            body: 'Design, fabrication and testing of the six welded horizontal storage tanks.',
          },
          {
            kicker: 'EI 1540 · 1542 · 1584',
            title: 'Fueling facilities and hydrant systems',
            body: 'Design and markings of fueling facilities, and four-inch hydrant systems.',
          },
          {
            kicker: 'JIG 1 and 2, Issue 13',
            title: 'Into-plane and depot operations',
            body: 'Fuel quality and operating standards for into-plane service and the depot.',
          },
          {
            kicker: 'NMDPRA guidelines',
            title: 'Bulk petroleum storage in Nigeria',
            body: "The regulator's requirements for bulk storage facilities and their permits.",
          },
          {
            kicker: 'Eurocodes 2 and 3 · ISO',
            title: 'Concrete, steel and drawings',
            body: 'Structural design of the bund, tank bases and steelwork; ISO drawing standards.',
          },
          {
            kicker: 'NCAR Part 12 Vol. 1',
            title: 'Nigeria Civil Aviation Regulations, aerodromes (2023)',
            body: 'Aerodrome rules governing a fuel installation inside the airport fence.',
          },
          {
            kicker: 'Safeguards, as designed',
            title: 'Built into the drawings',
            body: 'Floating suction, so fuel is drawn only from the cleanest upper layer. Interlocks and bonding: automatic high-level shutoffs and mandatory grounding on every bowser load. Remote hydrant control: pit valves clear of jet blast, pressure and shutoffs run from the depot. A bunded, low-permeability floor, so a spill stays in the bund, not the ground.',
          },
          {
            kicker: 'The organisation',
            title: 'Eleven standards, four manuals, nine permits',
            body: 'One crew for bowser and hydrant, working to the eleven external standards above and four NCAA-approved EAN manuals, behind nine permits. The compliance case is written before the first litre is sold: ICAO and JIG audit passed before go-live, weekly drills, a dedicated safety officer.',
          },
        ],
        sources:
          'Aviation Fuel, The Compliance and Safety Case, 17 July 2026 · Mangrove Hills Consulting design dossier, 2026.',
      },
      {
        id: 'where-it-stands',
        label: 'Where it stands',
        heading: 'Committed inside Phase 1, designed, partner in negotiation.',
        milestones: [
          {
            period: 'July 2026',
            title: 'Fuel programme committed',
            body: 'The depot and hydrant committed inside Phase 1 construction.',
          },
          {
            period: 'August 2026',
            title: 'Design volume delivered',
            body: 'Mangrove Hills Consulting Vol. 2: depot, hydrant and into-plane design.',
          },
          {
            period: 'September 2026 · now',
            title: 'Depot upsized, partner and entity',
            body: "Depot upsized to 1,080,000 litres in six 180,000-litre horizontal tanks, Mangrove Hills design in progress. A leading international fuel marketer has asked EAN to be its Nigeria partner; Evergreen Energy Limited, the EAN Group's fuel company, in incorporation; terms in negotiation.",
            current: true,
          },
          {
            period: '2027',
            title: 'Construction',
            body: 'Depot, bund and hydrant line built with the apron.',
          },
          {
            period: 'Q4 2027',
            title: 'Opening A',
            body: 'Depot and hydrant live on the day the apron opens.',
          },
        ],
        sources:
          'EAN management decision, July 2026 · Mangrove Hills Consulting, August 2026 · EAN executive deck, 14 September 2026.',
      },
    ],
    faqs: [
      {
        question: 'When does the depot open?',
        answer:
          'With the apron, at Opening A in Q4 2027. Depot and hydrant are built inside Phase 1.',
      },
      {
        question: 'Where does the fuel come from?',
        answer:
          'Supply-flexible: Dangote direct, independent importers, or partner supply agreements.',
      },
      {
        question: "Can operators outside EAN's ramp uplift?",
        answer:
          'Yes, once the apron opens: storage, hydrant and into-plane service extend to the wider airport.',
      },
      {
        question: 'What standards is the depot built to?',
        answer:
          'ICAO Doc 9977, API 650, EI 1540, 1542 and 1584, JIG 1 and 2, NMDPRA guidelines, Eurocodes 2 and 3 and NCAR Part 12, eleven external standards in all.',
      },
      {
        question: 'Who runs it?',
        answer:
          "Evergreen Energy, the EAN Group's fuel company, with a dedicated team of about 28 running bowser and hydrant together; the operating partner to be announced.",
      },
    ],
    summary:
      "Fuel is half to two thirds of an FBO's income and it already flows across our ramp. From Q4 2027 it flows from Evergreen Energy's 1,080,000-litre depot, through our hydrant, on our meter, to eleven external standards.",
    crossLinkHeading: 'Fuel is the first catalyst built on the base the other lines share.',
    contact: {
      heading: 'Talk to Evergreen Energy about supply.',
      body: "Standby access, into-plane service, or captive demand from EAN's own ramp at MMIA.",
      phone: { label: '+234 (0)1 295 0960', tel: '+23412950960' },
    },
    disclaimer: DISCLAIMER,
    seoDescription:
      "Evergreen Energy, the EAN Group's fuel company, is building a 1,080,000-litre Jet A-1 depot at the Aeroplex with an underground hydrant to the apron and into-plane service from Q4 2027.",
  },

  // ==========================================================================
  // 06 — Cargo Terminal (EAN Aerocargo)
  // ==========================================================================
  {
    slug: 'cargo-terminal',
    layout: 'brief',
    motion: 'cinematic',
    hero: {
      image: '/images/future/hero-cargo.jpg',
      alt: 'Aerial concept render of the Aeroplex campus showing the cargo warehouse, the apron and the stands',
    },
    tile: {
      image: '/images/future/cargo-terminal.jpg',
      alt: 'Concept render of the bonded cargo terminal at the Aeroplex',
      size: 'third',
      imagePosition: '50% 45%',
    },
    number: '06',
    name: 'Cargo Terminal',
    title: 'EAN Aerocargo · Bonded Cargo Terminal, Lagos',
    eyebrow: EYEBROW,
    headline: "Set to be West Africa's first certified pharma gateway, built at Lagos.",
    lede: "Nairobi, Addis Ababa, Dar es Salaam and Cairo each have one. EAN Aerocargo, the EAN Group's cargo company, is building the customs-bonded, temperature-controlled terminal that gives Lagos its own: about 5,000 m² of warehouse on a 9,000 m² allocation at the Aeroplex, designed to CEIV standard from the first drawing.",
    heroStats: [
      {
        figure: 'US$643m',
        label: "Nigeria's pharmaceutical import market in 2024, growing about 9.5% a year",
      },
      {
        figure: '+34.4%',
        label: "Lagos MMIA cargo growth in 2025, the fastest of Africa's top ten cargo airports",
      },
      { figure: '0', label: 'CEIV-certified pharma cargo stations in Nigeria today' },
      { figure: '~50,000 t', label: 'a year design capacity; about 12,000 tonnes in year one' },
    ],
    heroSources:
      'UN Comtrade 2024 via Brickstone Africa, August 2026 · WorldACD and IATA air-cargo data, 2026 · IATA CEIV Pharma registry · EAN design brief to Brickstone, September 2026.',
    chips: [
      'Bonded, temperature-controlled, CEIV from the first drawing',
      'Pharma the anchor line',
      'Fifteen years inside the fence at MMIA',
    ],
    sections: [
      {
        id: 'the-opportunity',
        label: 'The opportunity',
        heading: 'Certified capacity is a solved problem, everywhere but here.',
        body: [
          'More than seventy percent of the medicines consumed in Nigeria are imported, so the demand is structural, not seasonal. Lagos pharma air imports run 9,000 to 21,000 tonnes a year. West Africa still has no certified pharma corridor, so shipments route around Lagos to reach one.',
          'Pharmaceuticals are about four percent of air-cargo tonnage worldwide but around eleven percent of its value, the highest-quality freight revenue in aviation.',
        ],
        pullStat: {
          figure: '11%',
          label:
            'of global air-cargo value comes from pharmaceuticals, against roughly 4% of the tonnage.',
        },
        images: [
          {
            src: '/images/future/cargo-terminal.jpg',
            width: 1400,
            height: 710,
            alt: 'Concept render of the bonded cargo terminal at the Aeroplex',
            caption: 'BONDED CARGO TERMINAL · CONCEPT RENDER · AT THE AEROPLEX, FROM 2029',
          },
          {
            src: '/images/future/campus-massing.jpg',
            width: 1200,
            height: 622,
            alt: 'Concept massing of the Aeroplex campus from above',
            caption: 'CAMPUS MASSING · CONCEPT VIEW',
          },
        ],
        sources:
          'Brickstone Africa market assessment, August 2026 · IATA and WorldACD, 2026 · IATA CEIV Pharma registry.',
      },
      {
        id: 'product-lines',
        label: 'Product lines',
        heading: 'One bonded envelope, pharma as the anchor, every line designed to certify.',
        body: [
          'Designed to certify against the full stack: NAFDAC GSDP · CEIV Pharma · CEIV Fresh · ISO 9001 · HACCP.',
        ],
        cards: [
          {
            kicker: '01',
            title: 'CEIV Fresh',
            body: 'Fresh produce, seafood and flowers for export, chilled holding and rapid transfer.',
          },
          {
            kicker: '02',
            title: 'CEIV Pharma',
            body: '2 to 8°C and 15 to 25°C cold chain with time-and-temperature custody; the anchor line.',
          },
          {
            kicker: '03',
            title: 'E-commerce',
            body: 'Dedicated sortation and bonded staging for cross-border online retail.',
          },
          {
            kicker: '04',
            title: 'CEIV Lithium Batteries',
            body: 'Dangerous-goods store and handling for battery shipments.',
          },
          {
            kicker: '05',
            title: 'Transhipment',
            body: 'Bonded transfer between flights and onward carriers.',
          },
          {
            kicker: '06',
            title: 'Courier',
            body: 'Express consolidation and domestic onward distribution.',
          },
          {
            kicker: '07',
            title: 'Project cargo',
            body: 'Oversize and heavy-lift for energy and infrastructure.',
          },
          {
            kicker: '08',
            title: 'Valuables',
            body: 'Strongroom handling for high-value consignments, minerals among them.',
          },
          {
            kicker: '09',
            title: 'General cargo',
            body: 'Import and export build-up and breakdown.',
          },
        ],
        sources:
          'EAN cargo product lines, canonical order, 16 September 2026 · EAN certification brief, September 2026.',
      },
      {
        id: 'the-building',
        label: 'The building',
        heading: 'Designed around temperature integrity and bonded throughput.',
        body: [
          'Seven-level very-narrow-aisle racking in 16 m halls, offices on a mezzanine, ten dock doors onto a 41 to 46 m truck court, a dangerous-goods store and no basement, on reclaimed ground beside the canal. The warehouse sits between the fuel plot and the apron, with a landside truck court of ten dock doors, separated from the passenger side of the campus.',
        ],
        stats: [
          { figure: '~5,000 m²', label: 'warehouse gross floor area in the current site layout' },
          { figure: '9,000 m²', label: 'allocation within the expanded Aeroplex' },
          { figure: '16 m', label: 'clear halls, seven-level racking' },
          { figure: '10', label: 'dock doors' },
          {
            figure: '65 / 35',
            label: 'capacity on long-term contracts against spot, the commercial split',
          },
        ],
        images: [
          {
            src: '/images/future/site-layout.jpg',
            width: 1400,
            height: 1404,
            alt: 'Crownfield Architects master site layout, 14 September 2026, with the cargo warehouse on the adjoining reclamation beside the fuel storage and the apron',
            caption:
              'CROWNFIELD ARCHITECTS · MASTER SITE LAYOUT · ISSUED 14 SEPTEMBER 2026 · CARGO WAREHOUSE ON THE ADJOINING RECLAMATION, LANDSIDE TRUCK COURT, AIRSIDE ONTO THE APRON',
            fullWidth: true,
          },
          {
            src: '/images/future/cargo-apron.jpg',
            width: 1400,
            height: 659,
            alt: 'Concept render of the cargo terminal and apron',
            caption: 'BONDED CARGO TERMINAL · CONCEPT RENDER',
          },
        ],
        sources:
          'Crownfield revised site layout, 14 September 2026 · EAN design brief to Brickstone, 3 September 2026 · EAN commercial strategy, September 2026.',
      },
      {
        id: 'the-model',
        label: 'The model',
        heading: 'EAN Aerocargo develops and manages the terminal. Specialist partners operate each line.',
        body: [
          'EAN Aerocargo is an infrastructure company, not a cargo handler. It funds and delivers the site, the bonded envelope, power and utilities, and the regulatory workstreams, drawing on fifteen years serving the airfield at MMIA. Specialist international partners operate each product line and lead certification, with a licensed ground-handling capability behind the terminal. The terminal will operate under a customs bonded licence, to be obtained from the Nigeria Customs Service.',
        ],
        cards: [
          {
            kicker: 'EAN Aerocargo',
            title: 'The building and the envelope',
            body: 'Develops and owns the terminal on land held by EAN Aeroplex Limited: customs-bonded structure, power, utilities and the regulatory workstreams.',
          },
          {
            kicker: 'Operating partners · to be announced',
            title: 'Systems, operations and certification',
            body: 'Handling-system design, terminal operations, staff and the lead on CEIV certification, line by line.',
          },
          {
            kicker: 'Brickstone Africa',
            title: 'The business plan',
            body: 'Mandated end to end; preliminary information memorandum and cargo financial model delivered 16 September 2026.',
          },
        ],
        notes: [
          {
            label: 'The design rule',
            body: 'Designed to CEIV standard from the first drawing, with the operating partner engaged at design stage.',
          },
        ],
        logos: [{ src: '/images/future/logo-brickstone-africa.png', alt: 'Brickstone Africa' }],
        sources: 'EAN management decision, September 2026 · Brickstone Africa mandate.',
      },
      {
        id: 'where-it-stands',
        label: 'Where it stands',
        heading: 'From allocated site to a live, certified terminal.',
        body: [
          'The pathway is sequential, and certification is fastest when the operating partner is engaged at the design stage rather than after the building is complete.',
        ],
        milestones: [
          {
            period: '2026',
            title: 'Site and allocation',
            body: '9,000 m² secured within the expanded Aeroplex; adjoining parcel under reclamation with the canal realignment.',
          },
          {
            period: 'September 2026 · now',
            title: 'Business plan and operator',
            body: 'Brickstone Africa delivers the preliminary information memorandum and model; operating partner conversations opened at Aviation Africa, Nairobi.',
            current: true,
          },
          {
            period: '2027',
            title: 'Design and bonded envelope',
            body: 'Terminal and cold-chain systems designed to CEIV standard; bonded structure, power and utilities built.',
          },
          {
            period: '2028',
            title: 'Fit-out and commissioning',
            body: 'Handling systems, cold rooms and security installed, tested and staffed.',
          },
          {
            period: 'Q1 2029',
            title: 'Opening D, certification and go-live',
            body: 'CEIV certification achieved; the terminal opens to traffic. Realistic certification timeline: 18 to 24 months from operator engagement.',
          },
        ],
        sources:
          'EAN cargo programme, September 2026 · Brickstone Africa, 16 September 2026 · Revised phase flow, 12 July 2026.',
      },
    ],
    faqs: [
      {
        question: 'When does the terminal open?',
        answer:
          'Opening D, Q1 2029, with certification targeted 18 to 24 months from operator engagement.',
      },
      {
        question: 'Which certifications will it hold?',
        answer:
          'Designed to certify against NAFDAC GSDP, CEIV Pharma, CEIV Fresh, ISO 9001 and HACCP.',
      },
      {
        question: 'Who operates the pharma line?',
        answer:
          'A specialist international partner, to be announced, engaged at design stage. EAN Aerocargo develops and manages the terminal.',
      },
      {
        question: 'Can a forwarder reserve capacity now?',
        answer:
          'Yes. About 65% of capacity is planned for long-term contracts; EAN Aerocargo takes expressions of interest now.',
      },
      {
        question: 'How is the terminal different from what Lagos has today?',
        answer:
          'It is customs-bonded and temperature-controlled from the first drawing, with cold chain custody recorded end to end, designed for certification rather than retrofitted for it.',
      },
    ],
    summary:
      "West Africa's first certified pharma gateway, set to open at Lagos in 2029, designed to CEIV from the first drawing, developed and managed by EAN Aerocargo with specialist partners on each line. Space follows signed demand.",
    crossLinkHeading: 'The terminal is the second catalyst built on the base the other lines share.',
    contact: {
      heading: 'Get the EAN Aerocargo brief.',
      body: 'Site plan, certification pathway and the operating-partner structure, in one document.',
      phone: { label: '+234 (0)1 295 0960', tel: '+23412950960' },
    },
    disclaimer: DISCLAIMER,
    seoDescription:
      "EAN Aerocargo is building West Africa's first certified pharma gateway at Lagos: a customs-bonded, temperature-controlled terminal of about 5,000 m² at the Aeroplex, designed to CEIV standard, opening Q1 2029.",
  },

  // ==========================================================================
  // 07 — Commercial & Retail
  // ==========================================================================
  {
    slug: 'commercial-and-retail',
    layout: 'brief',
    motion: 'cinematic',
    hero: {
      // Deliberately the atrium render rather than the deck's landside arrival.
      image: '/images/future/render-commercial-atrium.jpg',
      alt: 'Concept view of the Aeroplex commercial building atrium, with café seating, a planted lounge and boutiques',
      // Bottom-aligned, which keeps the floor-level scene clear of the title.
      imagePosition: '50% 100%',
    },
    tile: {
      image: '/images/future/landside-aerial.jpg',
      alt: "Aerial photograph of EAN's landside offices and hangar today",
      size: 'third',
      imagePosition: '50% 55%',
    },
    number: '07',
    name: 'Commercial & Retail',
    title: 'Commercial & Retail',
    eyebrow: EYEBROW,
    headline: 'Building a working hub for the aviation community at Lagos.',
    lede: "EAN's facilities book at the airport has grown from 8 clients in 2015 to 23 today, with the rate per square metre up 82%. The Aeroplex adds an 11,069 m² commercial building, retail, an operator-run hotel and training space to it from 2028.",
    heroStats: [
      {
        figure: '10,784 m²',
        label: 'under management across hangar, office, suites and concessions',
      },
      {
        figure: '+82%',
        label: 'growth in the naira lease rate per square metre per year, 2015 to 2026',
      },
      { figure: '23', label: 'active lease clients today, up from 8 in 2015' },
      { figure: '11,069 m²', label: 'new commercial building, Opening C, Q4 2028' },
    ],
    heroSources:
      'EAN Aviation Facilities management accounts and client portfolio, 2015 to 2026 · revised phase flow, 12 July 2026 · Benoy Final Concept Report, June 2026.',
    chips: [
      '23 clients, rate up 82% since 2015',
      'Aviation companies, telecoms and helicopter operators already in the book',
      'An 11,069 m² building with a fifteen-year tenant base behind it',
    ],
    sections: [
      {
        id: 'the-book',
        label: 'The book',
        heading: 'Pricing power, with retention.',
        body: [
          'The lease rate per square metre has risen 82% since 2015 while the client base nearly tripled, across aviation handling, maintenance, logistics, telecoms, healthcare, retail and lifestyle operators. 10,784 m² are under management across hangar, office, suites and concessions on site.',
        ],
        stats: [
          { figure: '8 → 23', label: 'lease clients, 2015 to 2026; a high of 25' },
          { figure: '2,100 m²', label: 'lettable office and suite space, hangar counted separately' },
          { figure: '1,598 m²', label: 'let today, 76% of lettable space' },
          { figure: '₦300,000', label: 'rate per m² a year today, up 82% since 2015' },
        ],
        images: [
          {
            src: '/images/future/offices-interior.jpg',
            width: 1400,
            height: 788,
            alt: 'Leased office interiors at EAN, MMIA',
            caption: 'EAN LANDSIDE OFFICES · LEASED SUITES, MMIA',
          },
          {
            src: '/images/future/offices-reception.jpg',
            width: 640,
            height: 480,
            alt: "The main reception at EAN's landside offices",
            caption: 'EAN LANDSIDE OFFICES · RECEPTION',
          },
        ],
        sources:
          'EAN Facilities book, 2015 to 2026 · Facilities figures from Ineh Osikhekha, 17 September 2026.',
      },
      {
        id: 'on-site-today',
        label: 'On site today',
        heading:
          'Twenty-three clients: aviation companies, telecoms and helicopter operators, already in the book.',
        body: [
          'Aviation management companies, telecom hosting, helicopter and medevac operators, maintenance firms and lifestyle brands share the landside today. The Aeroplex offices are let to the same sector first.',
        ],
        logos: [
          { src: '/images/future/logo-mtn.png', alt: 'MTN' },
          { src: '/images/future/logo-airtel.png', alt: 'Airtel' },
          { src: '/images/future/logo-heliconia.png', alt: 'Heliconia' },
          { src: '/images/future/logo-kasi-healthcare.png', alt: 'Kasi Healthcare' },
          { src: '/images/future/logo-anap-jets.png', alt: 'Anap Jets' },
          { src: '/images/future/logo-topbrass-aviation.png', alt: 'TopBrass Aviation' },
          { src: '/images/future/logo-triton-aviation.png', alt: 'Triton Aviation' },
          { src: '/images/future/logo-silverkuun-group.png', alt: 'Silverkuun Group' },
        ],
        sources: 'EAN Facilities client portfolio, 2026.',
      },
      {
        id: 'what-the-aeroplex-adds',
        label: 'What the Aeroplex adds',
        heading: 'From office leasing to a full precinct.',
        body: [
          'The landside is a precinct, not a car park: an 11,069 m² commercial building at its centre, the FBO on one side, the hangar on the other, and a canopy over the arrival that Benoy drew from Jewel Changi. Today’s book is mostly office space and telecom hosting, with advertising placements already sold. Opening C, in Q4 2028, adds the landside commercial building and the lines a precinct earns from: retail, an operator-run hotel and short stay, training and meeting rooms, expanded office leasing, EV charging and advertising at scale. Benoy designed it around the Changi model, where non-aeronautical income rivals the aeronautical.',
        ],
        images: [
          {
            src: '/images/future/landside-precinct.jpg',
            width: 1260,
            height: 748,
            alt: 'Benoy concept view of the landside precinct under the canopy',
            caption: 'BENOY CONCEPT VIEW · LANDSIDE PRECINCT · AT THE AEROPLEX, FROM 2028',
          },
          {
            src: '/images/future/terminal-interior.jpg',
            width: 1263,
            height: 751,
            alt: 'Benoy concept view under the canopy with landscaping',
            caption: 'BENOY CONCEPT VIEW · UNDER THE CANOPY · FROM 2028',
          },
        ],
        cards: [
          {
            kicker: 'Opening C · Q4 2028',
            title: 'Retail leasing',
            body: 'Landside and airside concessions across the precinct, duty-free included.',
          },
          {
            kicker: 'Opening C · Q4 2028',
            title: 'Hotel and short stay',
            body: 'An operator-run hotel for crew, passengers and visitors to the campus.',
          },
          {
            kicker: 'Opening C · Q4 2028',
            title: 'Training and meeting rooms',
            body: 'Aviation training and corporate meeting space beside the terminal.',
          },
          {
            kicker: 'Opening C · Q4 2028',
            title: 'Office leasing, expanded',
            body: '11,069 m² of commercial building, offices on the upper floors.',
          },
          {
            kicker: 'From 2027',
            title: 'EV charging and ground transport',
            body: 'Charging across the campus and an electric ground-transport fleet, app-booked.',
          },
          {
            kicker: 'Today, scaling',
            title: 'Advertising',
            body: 'Placements sold today; a campus of screens and sites from 2027.',
          },
          {
            kicker: 'Opening C · Q4 2028',
            title: 'Showrooms',
            body: 'Aircraft cabin design, motor and marine brands, by appointment.',
          },
          {
            kicker: 'On the concept plan',
            title: 'Aircraft gallery',
            body: "The campus's public face, on the Benoy concept plan.",
          },
        ],
        sources:
          'EAN stand offering list, 11 August 2026 · Operations briefing, 8 September 2026 · Benoy Final Concept Report, June 2026.',
      },
      {
        id: 'where-it-stands',
        label: 'Where it stands',
        heading: 'The landside today, and the precinct it becomes.',
        images: [
          {
            src: '/images/future/landside-aerial.jpg',
            width: 1400,
            height: 788,
            alt: "Aerial photograph of EAN's landside offices and hangar today",
            lede: 'The landside, today',
            caption: 'EAN JET CENTER · LANDSIDE OFFICES AND HANGAR · MMIA, 2026',
          },
          {
            src: '/images/future/offices-corridor.jpg',
            width: 1400,
            height: 788,
            alt: 'Corridor of leased client offices at EAN',
            lede: 'Inside the book, today',
            caption: 'EAN LANDSIDE OFFICES · CLIENT SUITES',
          },
          {
            src: '/images/future/landside-arrival.jpg',
            width: 1400,
            height: 761,
            alt: 'Benoy render of the Aeroplex landside arrival under the canopy',
            lede: 'The precinct, from 2028',
            caption: 'BENOY RENDER · LANDSIDE ARRIVAL · AT THE AEROPLEX',
          },
        ],
        milestones: [
          {
            period: 'Opening A · Q4 2027',
            title: 'Hangar, apron, FBO and fuel',
            body: 'Advertising and EV charging switch on.',
          },
          {
            period: 'Opening B · Q2 2028',
            title: 'Service centre',
            body: 'Service centre and training academy.',
          },
          {
            period: 'Opening C · Q4 2028',
            title: 'Commercial building',
            body: 'Offices, retail, hotel, training, events.',
          },
          {
            period: 'Opening D · Q1 2029',
            title: 'Bonded cargo terminal',
            body: 'Bonded cargo terminal on the adjoining parcel.',
          },
        ],
        sources:
          'Revised phase flow, 12 July 2026 · Vita and EAN Weekly Progress Report, Week 17.',
      },
    ],
    faqs: [
      {
        question: 'What space is available today?',
        answer:
          'Office and suite space at the Jet Center landside as it turns over; the Facilities team keeps the current list.',
      },
      {
        question: 'When can I take space in the new building?',
        answer:
          'Opening C, Q4 2028. Pre-letting conversations for offices, retail and the hotel start now.',
      },
      {
        question: 'What is the rate basis?',
        answer: 'Naira per square metre per year, ₦300,000 today, reviewed annually.',
      },
      {
        question: 'Can a non-aviation brand take a retail unit?',
        answer: 'Yes. Retail, dining and lifestyle brands are part of the precinct plan.',
      },
      {
        question: 'Who runs the hotel?',
        answer: 'An operator, not EAN. The hotel is operator-run under a management agreement.',
      },
    ],
    summary:
      'From 8 clients to 23, rate up 82%, 76% of lettable space let, and an 11,069 m² building opening in 2028 with retail, an operator-run hotel, training rooms and offices. The tenants are already on site; the precinct is next.',
    crossLinkHeading: 'The precinct earns from the traffic the other nine lines create.',
    contact: {
      heading: 'Lease space at the Aeroplex.',
      body: 'Office, retail, hotel and concession opportunities across the campus, and space in the current book today.',
      phone: { label: '+234 (0)1 295 0960', tel: '+23412950960' },
    },
    disclaimer: DISCLAIMER,
    seoDescription:
      "EAN's facilities book at Lagos MMIA has grown from 8 clients to 23 with the rate per m² up 82%. The Aeroplex adds an 11,069 m² commercial building with retail, an operator-run hotel and training space from Q4 2028.",
  },

  // ==========================================================================
  // 08 — GSA Services
  // ==========================================================================
  {
    slug: 'gsa-services',
    layout: 'brief',
    motion: 'cinematic',
    hero: {
      // Deliberately the landside render rather than the deck's aerial photograph.
      image: '/images/future/render-aeroplex-landside.jpg',
      alt: 'Concept view of the Aeroplex from the landside road, under its green canopy roof, with an airliner climbing out overhead',
    },
    tile: {
      image: '/images/future/ground-operations.jpg',
      alt: "EAN's ground operations team on the apron",
      size: 'third',
      imagePosition: '50% 40%',
    },
    number: '08',
    name: 'GSA Services',
    title: 'GSA Services',
    eyebrow: EYEBROW,
    headline: "Nigeria's biggest diaspora corridor goes direct in 2027.",
    lede: 'The Canada-Nigeria Air Transport Agreement, signed 6 August 2026, opens the first direct flights between the two countries, and a North American flag carrier has announced Lagos service for 2027. EAN GSA Services represents carriers entering or expanding in Nigeria: passenger sales, cargo and the airport station, from fifteen years airside at Lagos.',
    heroStats: [
      { figure: '0', label: 'nonstop carriers serving Lagos to Toronto today' },
      {
        figure: '115,000',
        label: 'round-trip passengers a year on the Toronto-Lagos corridor, 2025 industry estimate',
      },
      {
        figure: '25,000+',
        label: 'valid Canadian study permits held by Nigerians, March 2026',
      },
      {
        figure: '14 + 10',
        label: 'weekly passenger frequencies newly permitted per side, plus ten all-cargo',
      },
    ],
    heroSources:
      'Canada-Nigeria Air Transport Agreement, 6 August 2026 · IRCC study-permit data, March 2026 · industry estimates, 2025.',
    chips: [
      'Fifteen years airside at Lagos',
      'NCAA Agent of Foreign Airlines certificate, renewed September 2026',
      'Passenger, cargo and station from one desk',
    ],
    sections: [
      {
        id: 'the-desk',
        label: 'The desk',
        heading: 'Passenger GSA, cargo GSSA and the station, from one resident team.',
        body: [
          'A carrier entering Nigeria needs three things on the ground: a sales organisation, a cargo sales agent and a station manager who knows the airport. EAN GSA Services provides all three, backed by an NCAA Agent of Foreign Airlines certificate renewed in September 2026 and an international GSA partner.',
        ],
        cards: [
          {
            kicker: 'Passenger GSA',
            title: 'Sales and reservations',
            body: 'Ticket sales and reservations for the carrier in the Nigerian market, corporate and trade.',
          },
          {
            kicker: 'Passenger GSA',
            title: 'Agent oversight',
            body: 'Oversight of the 1,000-plus IATA-accredited agency head offices in Nigeria, already wired into every major GDS.',
          },
          {
            kicker: 'Passenger GSA',
            title: 'Marketing and launch',
            body: 'Route launch, local campaigns and diaspora and corporate channels.',
          },
          {
            kicker: 'Cargo GSSA',
            title: 'Cargo sales',
            body: "Belly and all-cargo capacity sold into Nigeria's forwarders and shippers, with the Aeroplex bonded terminal from 2029.",
          },
          {
            kicker: 'Station',
            title: 'Airport representation',
            body: 'A station manager coordinating the incumbents, NAHCO and SAHCOL, and FAAN, from an office fifteen years inside the fence, in daily contact with customs and immigration.',
          },
          {
            kicker: 'Governance',
            title: 'Reporting',
            body: "Reporting to the carrier's country manager, to international standard, on EAN's Salesforce.",
          },
        ],
        sources:
          'NCAA Agent of Foreign Airlines certificate, EAN Aviation, renewed 14 September 2026 · IATA agency data, Nigeria · Threedot GSA proposition, September 2026.',
      },
      {
        id: 'ean-today',
        label: 'EAN today',
        heading: 'Fifteen years airside at Murtala Muhammed.',
        body: [
          'The strongest asset a GSA can offer an entering carrier is presence at the airport. EAN has run Nigeria’s first purpose-built FBO at MMIA since 2011, handles about a third of Lagos business-aviation movements, and works daily with FAAN, customs, immigration and the ground handlers a new station depends on.',
        ],
        stats: [
          { figure: '2011', label: 'on the ground at MMIA' },
          { figure: '~430', label: 'aircraft movements a month handled today' },
          { figure: '24/7', label: 'operation, fifteen years' },
          {
            figure: 'CIQ',
            label: 'customs and immigration on site, approved, launching September 2026',
          },
        ],
        images: [
          {
            src: '/images/future/client-relations.jpg',
            people: true,
            width: 1396,
            height: 1600,
            alt: "EAN's Client Relations team",
            caption: 'EAN CLIENT RELATIONS · MMIA',
          },
          {
            src: '/images/future/ground-operations.jpg',
            people: true,
            width: 1400,
            height: 843,
            alt: "EAN's ground operations team on the apron",
            caption: 'EAN GROUND OPERATIONS · MMIA',
          },
        ],
        sources: 'EAN Business Lens data, 2025 to 2026 · FAAN CIQ inspection, 21 August 2026.',
      },
      {
        id: 'the-route',
        label: 'The route',
        heading: 'A confirmed corridor, and no carrier serving it yet.',
        body: [
          'The expanded Canada-Nigeria Air Transport Agreement, signed 6 August 2026, provides multiple designation, fourteen weekly passenger frequencies per side and fifth-freedom rights for cargo. A North American flag carrier announced Lagos service for 2027 the same day and has begun regulatory approvals.',
          "Nigeria's pattern is consistent: established carriers self-handle, while entrants and returning carriers appoint a General Sales Agent. The window for a resident GSA is the twelve months before the first flight.",
        ],
        pullStat: {
          figure: '2027',
          label:
            'first scheduled nonstop service between Nigeria and Canada, announced on the day the agreement was signed.',
        },
        sources:
          'Canada-Nigeria Air Transport Agreement, 6 August 2026 · carrier press release, 6 August 2026.',
      },
      {
        id: 'the-groundwork',
        label: 'The groundwork',
        heading: 'The route case, researched and presented.',
        milestones: [
          {
            period: '2022',
            title: 'Route feasibility study',
            body: 'Commissioned by EAN on IATA origin-and-destination data, ahead of any bilateral agreement.',
          },
          {
            period: 'December 2022',
            title: "Presented to Canada's High Commissioner",
            body: "The route case put to Canada's High Commissioner to Nigeria.",
          },
          {
            period: 'January 2023',
            title: 'GSA proposition presented',
            body: "The resident-GSA case presented to the carrier's international affairs and network leadership.",
          },
          {
            period: 'August 2026',
            title: 'Air Transport Agreement signed',
            body: 'First direct flights permitted; Lagos service announced for 2027.',
          },
          {
            period: 'September 2026 · now',
            title: 'Desk assembled',
            body: 'International GSA partner in discussion; NCAA certificate renewed; station model with the ground handlers mapped.',
            current: true,
          },
        ],
        notes: [{ label: 'Toronto to Lagos', body: 'On one ticket, from 2027.' }],
        sources:
          'EAN route study and correspondence, 2022 to 2023 · Canada-Nigeria Air Transport Agreement, 6 August 2026.',
      },
      {
        id: 'beyond-nigeria',
        label: 'Beyond Nigeria',
        heading: 'A platform, built once and ready to repeat.',
        body: [
          'No dominant regional GSA platform serves West Africa today. Accra, Abidjan and Dakar sit as natural extensions of the same model, and the region is conflict-free for carrier entry. The desk is built to represent more than one carrier, and more than one country.',
        ],
        sources: 'Threedot GSA market paper, September 2026 · EAN management.',
      },
    ],
    faqs: [
      {
        question: 'What is a GSA and why would a carrier appoint one in Nigeria?',
        answer:
          'A General Sales Agent sells and represents a carrier in a market it does not staff itself. Entrants and returning carriers in Nigeria typically appoint one before the first flight.',
      },
      {
        question: 'Which carriers do you represent?',
        answer: 'Conversations are in progress and none is named until the agreement is signed.',
      },
      {
        question: 'Do you handle cargo sales as well?',
        answer:
          'Yes. Cargo GSSA sits alongside passenger GSA, with the Aeroplex bonded terminal from 2029.',
      },
      {
        question: 'Can you set up an airport station before the first flight?',
        answer:
          'Yes. Station representation, coordinating FAAN, customs, immigration and the ground handlers, is part of the desk.',
      },
      {
        question: 'Which other West African markets?',
        answer: 'Accra, Abidjan and Dakar are the natural extensions of the same model.',
      },
    ],
    summary:
      'A confirmed route, no carrier serving it yet, and the research already done. Passenger sales, cargo sales and the airport station from one team, fifteen years inside the fence.',
    crossLinkHeading: 'The GSA desk sells the airport the other nine lines are built on.',
    contact: {
      heading: 'Talk to EAN GSA Services.',
      body: 'The commercial case, the desk structure and the route economics behind representing an international carrier in Nigeria.',
      phone: { label: '+234 (0)1 295 0960', tel: '+23412950960' },
    },
    disclaimer: DISCLAIMER,
    seoDescription:
      'EAN GSA Services represents carriers entering or expanding in Nigeria: passenger sales, cargo GSSA and airport station management from fifteen years airside at Lagos MMIA.',
  },

  // ==========================================================================
  // 09 — eVTOL Vertiport
  // ==========================================================================
  {
    slug: 'evtol-vertiport',
    layout: 'brief',
    motion: 'cinematic',
    hero: {
      // Swapped with The Aeroplex's; the deck itself opens on the night render.
      image: '/images/future/apron-dusk-2.jpg',
      alt: 'Render of the Aeroplex apron and three-bay hangar at dusk',
    },
    tile: {
      image: '/images/future/apron-dusk.jpg',
      alt: 'Render of the Aeroplex apron and hangar at dusk',
      size: 'full',
    },
    number: '09',
    name: 'eVTOL Vertiport',
    title: 'eVTOL Vertiport',
    eyebrow: EYEBROW,
    headline: "Nigeria's first electric air taxi network, based at the Aeroplex.",
    lede: 'EAN and Archer, the NYSE-listed maker of the all-electric Midnight aircraft, signed a memorandum of understanding in December 2024 to bring Lagos its first air taxi corridor, with an NCAA pre-certification pathway agreed. The vertiport, the charging and the maintenance are designed into the campus.',
    heroStats: [
      {
        figure: '8 min',
        label: 'flight time from Lagos Airport to Victoria Island, against about 1 hour 40 by road',
      },
      {
        figure: 'Dec 2024',
        label: "MOU signed for Nigeria's eVTOL network, with an NCAA pre-certification pathway agreed",
      },
      {
        figure: '3',
        label: 'cities on the planned network: Lagos, then Abuja and Port Harcourt',
      },
      {
        figure: '1',
        label: 'campus in the country designed with a vertiport, a maintenance bay and an FBO together',
      },
    ],
    heroSources:
      'EAN and Archer Aviation memorandum of understanding, December 2024 · Archer Nigeria launch programme materials, 2025 · Benoy Final Concept Report, June 2026.',
    chips: [
      'Memorandum of understanding with Archer, December 2024',
      'FBO, pad and maintenance under one roof',
      'EV-ready from the day the campus opens',
    ],
    sections: [
      {
        id: 'the-plan-for-lagos',
        label: 'The plan for Lagos',
        heading: 'Not one aircraft. A city network, with EAN as its operating base.',
        body: [
          "Archer's plan treats EAN as the network's operating base for Nigeria: FBO, vertiport and maintenance together at the Aeroplex, launching on the Lagos Airport to Victoria Island corridor before expanding to Abuja and Port Harcourt. The route runs on infrastructure that already exists, helipads at the airport, Victoria Island and the Lekki Free Trade Zone, so the first network does not wait for new ground to be built.",
        ],
        images: [
          {
            src: '/images/future/masterplan.jpg',
            width: 1200,
            height: 1186,
            alt: 'Aeroplex masterplan showing the apron, hangar and campus',
            caption: 'AEROPLEX MASTERPLAN · THE PAD SITS IN THE CAMPUS PLAN',
          },
          {
            src: '/images/future/apron-dusk.jpg',
            width: 1303,
            height: 733,
            alt: 'Benoy render of the Aeroplex apron and hangar at dusk',
            caption: 'BENOY RENDER · THE APRON THE PAD SITS BESIDE · FROM 2027',
          },
        ],
        cards: [
          {
            kicker: 'FBO',
            title: 'Ground and passenger handling',
            body: "Running at EAN's FBO today, designed into the Aeroplex from Opening A.",
          },
          {
            kicker: 'Vertiport',
            title: 'Take-off, landing and charging',
            body: 'A dedicated pad with charging and a vertiport lounge, in the campus plan from opening.',
          },
          {
            kicker: 'Maintenance',
            title: 'Line support',
            body: 'Technical support for the fleet under the same roof, from the AMO.',
          },
        ],
        logos: [{ src: '/images/future/logo-archer-aviation.png', alt: 'Archer Aviation' }],
        sources:
          'Archer Nigeria launch programme, 2025 · Benoy Final Concept Report · Operations briefing, 8 September 2026.',
      },
      {
        id: 'ean-today',
        label: 'EAN today',
        heading: 'EV-ready from the day the campus opens.',
        body: [
          "The Aeroplex opens with the pad, the charging and the maintenance bay designed in, so the first electric aircraft arrives at a campus built for it. The use cases develop alongside Archer's certification path: airport to island, then the intercity network. EAN's FBO has handled passengers at Lagos for fifteen years; the vertiport is the next aircraft on the same ramp.",
        ],
        stats: [
          { figure: '2011', label: 'EAN on the ground at MMIA' },
          { figure: '~430', label: 'aircraft movements a month today' },
          { figure: '~35%', label: 'of Lagos business-aviation movements' },
          { figure: 'EV-ready', label: 'pad, charging and maintenance bay from opening' },
          { figure: '15 yrs', label: 'of 24/7 operation' },
        ],
        sources: 'EAN Business Lens data, 2025 to 2026 · Benoy Final Concept Report.',
      },
      {
        id: 'the-aircraft',
        label: 'The aircraft',
        heading: 'Midnight: all-electric, and moving through certification.',
        body: [
          'Archer, founded in 2018 and listed on the NYSE, builds Midnight, an all-electric vertical take-off and landing aircraft that completed a transition flight above 100 miles an hour in June 2024. United Airlines is an investor and operating partner; Stellantis built the high-volume factory at Covington, Georgia.',
          "Since July 2026, on the public record: a restricted type certificate from the UAE's GCAA; an FAA certification path targeting the Los Angeles 2028 Olympics; selection in the US eIPP pilot programme in Florida, New York and Texas; and, in August 2026, the acquisition of Boeing's Wisk Aero, Insitu and SkyGrid with Boeing investing in Archer.",
          "A second track: in August 2026 Archer's general manager for Africa endorsed an offshore cargo VTOL programme with oil majors, with deliveries around 2030.",
        ],
        sources:
          'Archer Aviation public disclosures and press releases, July to August 2026 · Archer Nigeria launch programme, 2025.',
      },
      {
        id: 'where-it-stands',
        label: 'Where it stands',
        heading: 'MOU signed, second track endorsed, aircraft agreement next.',
        milestones: [
          {
            period: 'December 2024',
            title: 'MOU signed',
            body: "EAN and Archer memorandum of understanding for Nigeria's eVTOL network, with an NCAA pre-certification pathway agreed.",
          },
          {
            period: 'July 2026',
            title: 'Farnborough',
            body: 'Programme review with Archer at the Farnborough International Airshow.',
          },
          {
            period: 'August 2026',
            title: 'Second track endorsed',
            body: "Archer's general manager for Africa endorsed the offshore cargo VTOL programme.",
          },
          {
            period: 'September 2026 · now',
            title: 'Campus design',
            body: 'The pad, charging and vertiport lounge in the Aeroplex plan; Phase 1 site works past halfway.',
            current: true,
          },
          {
            period: 'Next',
            title: 'Aircraft purchase agreement',
            body: 'Purchase agreement, NCAA type-certification capacity and the financing route.',
          },
        ],
        sources:
          'EAN and Archer engagement record, 2024 to 2026 · Vita and EAN Weekly Progress Report, Week 17.',
      },
    ],
    faqs: [
      {
        question: 'When will the first eVTOL flights operate in Lagos?',
        answer:
          "After NCAA type-certification capacity and Archer's certification path align; the pad and charging are designed into the Aeroplex from opening.",
      },
      {
        question: 'Where will they fly?',
        answer:
          'Lagos Airport to Victoria Island first, on helipads that already exist, then Abuja and Port Harcourt.',
      },
      {
        question: 'How long is the flight to Victoria Island?',
        answer: 'About eight minutes, against about an hour and forty minutes by road.',
      },
      {
        question: 'Is the aircraft certified?',
        answer:
          "Midnight holds a restricted type certificate from the UAE's GCAA and is on an FAA certification path targeting 2028. NCAA acceptance follows.",
      },
      {
        question: 'How do I register interest?',
        answer:
          'Contact the vertiport team from this page; the FBO team holds the list for the first Lagos flights.',
      },
    ],
    summary:
      "The helipads exist, the operating base exists, and the campus opens EV-ready. Archer's plan puts Nigeria's first electric air taxi network at the Aeroplex.",
    crossLinkHeading: 'The vertiport adds an aircraft to the campus the other nine lines run on.',
    contact: {
      heading: 'Partner on the Lagos vertiport.',
      body: 'Network development, ground infrastructure and early operator conversations, and a list for the first Lagos flights.',
      phone: { label: '+234 (0)1 295 0960', tel: '+23412950960' },
    },
    disclaimer: DISCLAIMER,
    seoDescription:
      "EAN and Archer Aviation signed an MOU in December 2024 for Nigeria's first electric air taxi network, based at the Aeroplex: eight minutes from Lagos Airport to Victoria Island, then Abuja and Port Harcourt.",
  },

  // ==========================================================================
  // 10 — The Aeroplex
  // ==========================================================================
  {
    slug: 'the-aeroplex',
    layout: 'brief',
    motion: 'cinematic',
    hero: {
      // Swapped with the eVTOL Vertiport's; the deck itself opens on the dusk render.
      image: '/images/future/hero-evtol.jpg',
      alt: 'Night concept render of the Aeroplex commercial building and terminal under floodlight',
    },
    tile: {
      image: '/images/future/landside-arrival-2.jpg',
      alt: 'Render of the Aeroplex landside arrival under the timber canopy',
      size: 'full',
    },
    number: '10',
    name: 'The Aeroplex',
    title: 'The Aeroplex',
    eyebrow: EYEBROW,
    headline:
      'Built for business aviation by those who know business aviation. All you need, in one location.',
    lede: 'Designed by Benoy (Changi, Heathrow) and Crownfield Architects. Fifteen years of business aviation at Lagos. Now under one roof, built for it.',
    heroStats: [
      {
        figure: '60,000 m²',
        label:
          'concession at MMIA, executed 2024, term to 2054, plus an adjoining parcel under reclamation for fuel and cargo',
      },
      {
        figure: '39,700 m²',
        label: 'of building across five buildings: FBO, hangar, commercial, service centre and utility',
      },
      {
        figure: '30',
        label: 'aircraft on the ground at once: seventeen in the three-bay hangar, thirteen on a 23,113 m² apron',
      },
      {
        figure: 'Q4 2027',
        label:
          'Opening A: hangar, apron, FBO building with three lounges, and the fuel depot with hydrant to the apron',
      },
    ],
    heroSources:
      'Deed of Lease, FAAN and EAN Aviation Hangar Ltd, 2024 · Benoy Final Concept Report, June 2026 · Benoy concept design Rev02, November 2025 · Vita and EAN Weekly Progress Report, Week 17, 13 September 2026.',
    chips: [
      'Fifteen years on the ground at MMIA',
      '60,000 m² concession to 2054',
      'One site for the principal, the crew and the consignment',
    ],
    sections: [
      {
        id: 'ean-today',
        label: 'EAN today',
        heading: 'Fifteen years on the ground at the EAN Jet Center, Murtala Muhammed.',
        body: [
          "Since 2011, EAN has run Nigeria's first purpose-built FBO on 10,000 m² at MMIA: handling, hangarage, lounge, line maintenance, in-flight catering and trip support, around the clock. The hangar is full and new demand for based aircraft sits on a waiting list. The Aeroplex is that operation, six times over, with the lines the site could never hold.",
        ],
        stats: [
          { figure: '2011', label: "Nigeria's first purpose-built FBO opens at MMIA" },
          {
            figure: '~35%',
            label: 'of Lagos business-aviation movements handled by EAN, the leading operator',
          },
          {
            figure: '~430',
            label: 'aircraft movements a month today; 457 in the 30 days to 7 September 2026',
          },
          {
            figure: '141,776',
            label: 'safe man-hours to 11 September 2026, with zero lost-time injuries and zero accidents',
          },
          {
            figure: '24/7',
            label:
              'fifteen years of continuous operation, interrupted once, for the first seven days of the 2020 lockdown',
          },
        ],
        images: [
          {
            src: '/images/future/apron-hangar-2.jpg',
            width: 1200,
            height: 900,
            alt: "Business jets on EAN's apron at the existing Jet Center, MMIA Lagos",
            caption: 'EAN JET CENTER, MMIA · THE APRON TODAY',
          },
          {
            src: '/images/future/hangar-jet.jpg',
            width: 1200,
            height: 542,
            alt: "A business jet inside EAN's hangar at MMIA",
            caption: 'EAN JET CENTER · THE HANGAR, RUNNING FULL',
          },
        ],
        sources:
          'EAN Business Lens data, 2025 to 2026 · FBO One movement records, 30 days to 7 September 2026 · EAN Quality and Safety KPI review, 17 September 2026.',
      },
      {
        id: 'the-opportunity',
        label: 'The opportunity',
        heading: 'The flying has outgrown the ground it lands on.',
        body: [
          'Nigeria flies more business-aviation movements a year than any other African country, and Africa is the fastest-growing region in the world for it. Lagos is the busiest hub in that market.',
          "The city has seven private hangars. Johannesburg and Lanseria alone have twenty-three. Every one of EAN's hangars is full, with new demand on a waiting list. The shortfall is sharpest for the large, intercontinental jets that Nigeria's demand concentrates in.",
        ],
        pullStat: {
          figure: '+19.3%',
          label:
            "Africa's business-jet activity in the first five months of 2026, year on year, the fastest of any region and accelerating from +15% in 2025.",
        },
        sources:
          'WingX Advance business-jet activity, 2025 and January to May 2026 · Ionic Insights annual movements (Nigeria 11,647; South Africa 11,242) · EAN BI hangar census, 2026.',
      },
      {
        id: 'the-campus',
        label: 'The campus',
        heading: 'One site, every capability, revenue airside and landside.',
        body: [
          'The masterplan places aeronautical and non-aeronautical revenue side by side, the way the world’s best airports run: infrastructure earns rent, operations earn fees, services earn margins. Buildings open in sequence, hangar, apron, FBO and fuel first, then the rest of the campus through early 2029. 39,700 m² of building across five buildings, on the largest private allocation at the airport.',
        ],
        images: [
          {
            src: '/images/future/masterplan-benoy.jpg',
            width: 1200,
            height: 1186,
            alt: 'Benoy masterplan of the EAN Aeroplex showing hangar, FBO, service centre, commercial building and apron',
            caption: 'BENOY CONCEPT LAYOUT · 60,000 m² CONCESSION AND THE ADJOINING PARCEL TO THE EAST',
          },
          {
            src: '/images/future/site-layout-2.jpg',
            width: 1596,
            height: 1600,
            alt: 'Crownfield Architects master site layout, 14 September 2026: FBO building, hangar, service centre, commercial building, apron, aviation fuel storage and cargo warehouse',
            caption:
              'CROWNFIELD ARCHITECTS · MASTER SITE LAYOUT · ISSUED 14 SEPTEMBER 2026 · FBO, HANGAR, SERVICE CENTRE AND COMMERCIAL BUILDING ON THE CONCESSION; FUEL STORAGE AND CARGO WAREHOUSE ON THE ADJOINING RECLAMATION; APRON ONTO THE EXISTING TAXIWAY',
            fullWidth: true,
          },
        ],
        cards: [
          {
            kicker: '11,267 m²',
            title: 'Three-bay hangar',
            body: 'Three 54 m bays under a 26 m structure cleared by the NCAA, 120 m of Butzbach door. One Global 7500 per bay, or two Challengers side by side.',
          },
          {
            kicker: '12,275 m²',
            title: 'FBO building',
            body: 'Private terminal with three lounges (VVIP, premium commercial, crew), customs and immigration on site, crew facilities and offices. Four times the size of the largest terminal at MMIA today.',
          },
          {
            kicker: '23,113 m²',
            title: 'Apron',
            body: "Concrete apron, 280 mm thick, with taxilanes onto FAAN's taxiway, thirteen stands and dedicated heli-bays.",
          },
          {
            kicker: '1,080,000 L',
            title: 'Fuel depot and hydrant',
            body: "Six 180,000-litre Jet A-1 tanks on the adjoining reclamation, operated by Evergreen Energy, the EAN Group's fuel company, hydrant to six apron points from day one. Designed by the technical lead on JUHI-2.",
          },
          {
            kicker: '4,300 m²',
            title: 'Service centre',
            body: 'The AMO at scale: workshops, technical stores and the training academy, with the HondaJet Authorized Service Centre programme behind it. Opening B, Q2 2028.',
          },
          {
            kicker: '11,069 m²',
            title: 'Commercial building',
            body: 'Offices, retail, an operator-run hotel, training and meeting rooms, telecom and data hosting. Opening C, Q4 2028.',
          },
          {
            kicker: '~5,000 m²',
            title: 'Bonded cargo terminal',
            body: 'Customs-bonded, temperature-controlled, on the adjoining parcel, designed to certify against CEIV Pharma and CEIV Fresh. Opening D, Q1 2029.',
          },
          {
            kicker: '4 MW',
            title: 'Power and sustainability',
            body: 'Embedded power under an independent power agreement being concluded, with a solar canopy and battery storage. LEED Gold target.',
          },
          {
            kicker: '1 pad',
            title: 'eVTOL vertiport',
            body: 'A dedicated take-off and landing pad with charging, designed into the campus from the concept stage with Archer Aviation.',
          },
        ],
        sources:
          'Benoy Final Concept Report area schedule, June 2026 · AIPQS priced bill of quantities, August 2026 · Crownfield revised master site layout, 14 September 2026 · Mangrove Hills Consulting viability study, 2026.',
      },
      {
        id: 'the-design',
        label: 'The design',
        heading: 'Designed by Benoy, the designers of Changi, on the same commercial earning model.',
        body: [
          'Changi is consistently rated the world’s best airport and among the most commercially successful, where non-aeronautical income rivals the aeronautical. Benoy designed Jewel and Terminal 4 around that model: design, flow, dwell, spend. The Aeroplex is designed around the same model.',
          'Before a line was drawn, every kind of user of the campus, VVIP passengers and their aides, oil-and-gas crews, cargo handlers, hotel guests, was profiled in workshops and mapped kerb to aircraft. Each profile drives a flow, a set of spaces and a revenue line. Passenger movements and operational traffic are kept apart by design, with separate arrival routes for principals, for crew and staff, and for maintenance and cargo. Security and cybersecurity design is by Control Risks with CCP.',
        ],
        images: [
          {
            src: '/images/future/landside-arrival-2.jpg',
            width: 1600,
            height: 900,
            alt: 'Benoy render of the Aeroplex landside arrival under the timber canopy',
            caption: 'BENOY RENDER · LANDSIDE ARRIVAL · AT THE AEROPLEX, FROM 2027',
          },
        ],
        cards: [
          {
            kicker: 'Benoy',
            title: 'Masterplan and architecture',
            body: 'Concept design for the full campus, by the practice behind Jewel Changi, Changi Terminal 4 and the Heathrow masterplan.',
          },
          {
            kicker: 'Crownfield Architects',
            title: 'Architect of record',
            body: 'Detailed design, site layout and construction documentation in Lagos, with CCP as programme manager.',
          },
          {
            kicker: 'Vita Construction',
            title: 'Main contractor',
            body: "Selected through a five-bidder tender, 4.77% below the consultant's estimate. On site since May 2026. 850 projects since 1981; ISO 9001, 14001 and 45001.",
          },
        ],
        notes: [
          {
            label: 'The design principle',
            body: 'Every capability our customers need, designed in from the first drawing.',
          },
          {
            label: 'Ground operations',
            body: 'Reliability from the vehicles, dependability from the drivers: EAN cars and EAN drivers carry the passenger from kerb to aircraft, timed to the flight.',
          },
        ],
        logos: [
          { src: '/images/future/logo-benoy.png', alt: 'Benoy' },
          { src: '/images/future/logo-crownfield-architects.png', alt: 'Crownfield Architects' },
          { src: '/images/future/logo-ccp.png', alt: 'CCP' },
          { src: '/images/future/logo-vita-construction.png', alt: 'Vita Construction' },
          { src: '/images/future/logo-control-risks.png', alt: 'Control Risks' },
        ],
      },
      {
        id: 'where-it-stands',
        label: 'Where it stands',
        heading: 'Land secured. Design complete. Site works past the halfway mark.',
        body: [
          'Vita Construction has been on site since May 2026 on Phase 1: clearance, bulk excavation to about eight metres, imported filling and canal diversion. At Week 17 the works stood at 54% complete, with imported filling at 77% against 69% planned. Contractual completion is 29 October 2026, and the platform then hands over to the hangar, apron and FBO.',
        ],
        milestones: [
          {
            period: '2024',
            title: 'Land and concession',
            body: '60,000 m² at MMIA under a FAAN lease to 2054, executed and on record. FAAN construction approval obtained.',
          },
          {
            period: 'November 2025',
            title: 'Design complete',
            body: 'Benoy concept design finalised at Rev02; every user of the campus mapped. Final Concept Report, June 2026.',
          },
          {
            period: 'April 2026',
            title: 'Contractor appointed',
            body: 'Vita Construction selected from five bidders; letter of award 28 April. Fully costed against the AIPQS priced bill of quantities.',
          },
          {
            period: 'May 2026 · now',
            title: 'Phase 1 on site',
            body: 'Site preparation and canal diversion, 54% complete at Week 17 (13 September 2026). The realigned canal creates the adjoining reclamation parcel.',
            current: true,
          },
          {
            period: 'Q4 2027',
            title: 'Opening A',
            body: 'Hangar, apron, utility building, FBO with three lounges, fuel depot and hydrant. EAN relocates; the hangar fills from the waiting list.',
          },
        ],
        images: [
          {
            src: '/images/future/site-satellite.jpg',
            width: 1600,
            height: 899,
            alt: 'Google Earth view of MMIA showing EAN today, the 60,000 m² Aeroplex site and the adjoining parcel',
            lede: 'The site, from above',
            caption:
              'MMIA, LAGOS · GOOGLE EARTH, 2026 · EAN TODAY, THE 60,000 m² CONCESSION AND THE ADJOINING RECLAMATION',
          },
          {
            src: '/images/future/site-works.jpg',
            width: 653,
            height: 400,
            alt: 'Excavator on the cleared and filled Aeroplex site, week 15',
            lede: 'The site, this quarter',
            caption:
              'VITA CONSTRUCTION · BULK EXCAVATION AND IMPORTED FILLING · WEEKS 14 TO 15, AUGUST 2026',
          },
          {
            src: '/images/future/apron-dusk-2.jpg',
            width: 1303,
            height: 733,
            alt: 'Benoy render of the Aeroplex apron and three-bay hangar at dusk',
            lede: 'The site, from 2027',
            caption: 'BENOY RENDER · APRON AND THREE-BAY HANGAR · AT THE AEROPLEX, FROM 2027',
          },
        ],
        sources:
          'Vita and EAN Weekly Progress Report, Week 17 (13 September 2026) · CCP Interim Certificate 02 (14 September 2026) · EAN Tender Analysis Report (April 2026) · Google Earth imagery, 2026 · Benoy Final Concept Report.',
      },
    ],
    faqs: [
      {
        question: 'What is the Aeroplex?',
        answer:
          "EAN's new aviation campus at Murtala Muhammed International Airport, Lagos: a 60,000 m² concession with a private terminal, three-bay hangar, apron, fuel depot and hydrant, service centre, commercial building and a bonded cargo terminal, opening in stages from Q4 2027.",
      },
      {
        question: 'When does it open?',
        answer:
          'Opening A in Q4 2027: hangar, apron, terminal and fuel. The service centre follows in Q2 2028, the commercial building in Q4 2028 and the cargo terminal in Q1 2029.',
      },
      {
        question: "What is EAN's track record?",
        answer:
          "Nigeria's first purpose-built FBO, on the ground at MMIA since 2011, handling about a third of Lagos business-aviation movements, with an NCAA-approved AMO, in-flight catering and 141,776 safe man-hours to September 2026.",
      },
      {
        question: 'Who designed it and who is building it?',
        answer:
          'Benoy on the masterplan and architecture, Crownfield Architects as architect of record, CCP on programme management, Vita Construction as main contractor, Control Risks on security.',
      },
      {
        question: 'How do I get the investment memorandum?',
        answer:
          "Contact the Aeroplex team from this page. The memorandum is issued under NDA through EAN's financial adviser.",
      },
    ],
    summary:
      'Fifteen years of operations, a 60,000 m² concession to 2054, a Benoy design around the full mix of people who use an airport campus, Vita Construction on site since May 2026, first buildings open Q4 2027. Ten businesses on one site at Lagos.',
    crossLinkHeading: 'The Aeroplex is the ground under nine more businesses.',
    contact: {
      heading: 'Request the Aeroplex investment memorandum.',
      body: "The full Aeroplex deck covers the masterplan, the financing structure and the ten-year forecast in detail, under NDA through EAN's financial adviser.",
      phone: { label: '+234 (0)1 295 0960', tel: '+23412950960' },
    },
    disclaimer:
      'Indicative and for discussion. This page describes a development programme of EAN Aviation Hangar Limited and is not an offer of securities or an invitation to invest. Figures are drawn from the sources cited on this page as at 16 September 2026 and may change. Renders are concept views by Benoy; the built campus may differ.',
    seoDescription:
      "The EAN Aeroplex: a 60,000 m² aviation campus at Lagos MMIA designed by Benoy, with 39,700 m² of building across five buildings, 30 aircraft on the ground at once, opening in stages from Q4 2027.",
  },
];

/** Slug lookup for the dynamic route. */
export const FUTURE_BY_SLUG = new Map(FUTURE_PROGRAMMES.map((p) => [p.slug, p]));

/**
 * The cross-link strip every programme page closes with, in campus order.
 * Derived rather than repeated: the decks print all ten on each page, and a
 * hand-written copy per page would be ten places to forget an eleventh line.
 */
export const FUTURE_INDEX = FUTURE_PROGRAMMES.map(({ slug, number, name }) => ({
  slug,
  number,
  name,
}));
