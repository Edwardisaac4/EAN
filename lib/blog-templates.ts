export interface BlogTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  iconName: string;
  defaultTitle: string;
  defaultExcerpt: string;
  defaultContent: string;
}

export function markdownToHtml(md: string): string {
  if (!md) return '';
  return md
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('## ')) {
        return `<h2>${trimmed.substring(3)}</h2>`;
      }
      if (trimmed.startsWith('### ')) {
        return `<h3>${trimmed.substring(4)}</h3>`;
      }
      if (trimmed.startsWith('> ')) {
        return `<blockquote>${trimmed.substring(2)}</blockquote>`;
      }
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const items = trimmed
          .split('\n')
          .map((line) => `<li>${line.replace(/^[*|-]\s+/, '')}</li>`)
          .join('');
        return `<ul>${items}</ul>`;
      }
      if (/^\d+\.\s+/.test(trimmed)) {
        const items = trimmed
          .split('\n')
          .map((line) => `<li>${line.replace(/^\d+\.\s+/, '')}</li>`)
          .join('');
        return `<ol>${items}</ol>`;
      }
      if (trimmed === '---') {
        return '<hr />';
      }
      let formatted = trimmed
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      return `<p>${formatted}</p>`;
    })
    .join('\n');
}

export const BLOG_TEMPLATES: BlogTemplate[] = [
  {
    id: 'press-release',
    name: 'Press Release / Corporate Announcement',
    category: 'Company News',
    description: 'Official corporate announcement format with executive quote blocks, key milestones, and media contact footer.',
    iconName: 'Building2',
    defaultTitle: 'EAN Aviation Announces Operational Milestone at Lagos Hangar',
    defaultExcerpt: 'Official announcement regarding EAN Aviation Limited expansion and corporate milestones in West Africa.',
    defaultContent: `## Official Announcement

**LAGOS, NIGERIA** — EAN Aviation Limited, West Africa's premier business aviation conglomerate, today officially announces...

### Key Highlights & Milestones
* **Operational Expansion:** Integration of upgraded aircraft maintenance infrastructure.
* **Service Excellence:** NCAA & EASA compliant ground handling standards.
* **Diplomatic & Executive Fleet Support:** Enhanced dispatch capability at DNMM Lagos.

> "Our commitment to executive safety and luxury ground support remains absolute as we continue setting the standard for business aviation across West Africa."
> — **Executive Director, EAN Aviation Limited**

### About EAN Aviation
Operating the first fully integrated FBO hangar at Murtala Muhammed International Airport (DNMM) in Lagos, Nigeria, EAN Aviation provides comprehensive business aviation solutions including FBO handling, aircraft maintenance (AMO), jet/helicopter charter, and leased office spaces.

---
*For press inquiries, contact media@ean.aero or call +234 (0) 1 234 5678.*`,
  },
  {
    id: 'industry-insights',
    name: 'Industry Insights & Regulatory Guide',
    category: 'Aviation Insights',
    description: 'Educational and thought-leadership template with key takeaways box, sub-headings, and regulatory compliance overview.',
    iconName: 'BookOpen',
    defaultTitle: 'Navigating NCAA Compliance & Aircraft Inspection Standards in West Africa',
    defaultExcerpt: 'Essential guide for business aircraft owners and operators navigating maintenance compliance standards.',
    defaultContent: `## Key Takeaways
1. **Compliance Overview:** Understanding the latest NCAA regulations for corporate aircraft operators.
2. **Maintenance Schedules:** Standardizing 100-hour and annual inspection workflows.
3. **Safety Culture:** Why certified AMO oversight is non-negotiable for fleet longevity.

---

### Executive Overview
Operating private aircraft across West Africa requires seamless navigation of local regulatory frameworks and international safety benchmarks...

### Regulatory Best Practices
* **Logbook Verification:** Maintaining accurate airframe and engine records.
* **Component Tracking:** Lifecycle management for avionics and landing gear.
* **Emergency Readiness:** Regular crew and technician audit intervals.

> "Rigorous inspection protocols are the bedrock of operational safety in corporate aviation."

### Conclusion & Fleet Support
To discuss maintenance scheduling or NCAA-certified MRO support for your aircraft, connect with the EAN Maintenance team.`,
  },
  {
    id: 'service-spotlight',
    name: 'Service & Fleet Feature Spotlight',
    category: 'Services Update',
    description: 'Promotional template showcasing a specific service (FBO, Wings Catering, VIP Lounge) with specifications and CTA banner.',
    iconName: 'Sparkles',
    defaultTitle: 'Experience the Pinnacle of Departure: EAN VIP Terminal Experience',
    defaultExcerpt: 'An exclusive look inside Lagos premier VIP aviation lounge and personalized tarmac transfer services.',
    defaultContent: `## Redefining Business Aviation Luxury

Whether traveling for executive diplomacy or private leisure, departure through the EAN VIP Lounge guarantees privacy, efficiency, and comfort...

### Key Service Features
* **Private Customs & Immigration Clearance:** Accelerated diplomatic processing.
* **Wings™ In-Flight Catering:** Freshly prepared gourmet dining tailored to dietary preferences.
* **Direct Tarmac Limousine Access:** Seamless transition from lounge to aircraft steps.

### Service Specifications & Fleet Compatibility
* **Aircraft Types:** Ultra-long-range jets, mid-size cabins, and executive helicopters.
* **Location:** EAN Hangar Complex, MMIA DNMM, Lagos.
* **Operating Hours:** 24/7 Dispatch and Flight Support Desk.

---
### Book Your Experience
Planning an upcoming flight? [Contact our dedicated VIP Services Desk](/contact?service=vip) to arrange private lounge access and tarmac handling.`,
  },
  {
    id: 'case-study',
    name: 'Client Case Study & Operational Success Story',
    category: 'Case Studies',
    description: 'Structured case study template highlighting a complex flight mission, operational solution, and client outcome.',
    iconName: 'Award',
    defaultTitle: 'Case Study: Managing High-Capacity Executive Charter Routing in West Africa',
    defaultExcerpt: 'How EAN Aviation dispatched a multi-leg corporate mission under tight turnaround schedules.',
    defaultContent: `## Mission Overview

A multinational energy firm required urgent multi-city executive travel across 3 West African countries within 48 hours for 12 corporate executives...

### The Challenge
* **Tight Turnarounds:** Less than 45 minutes ground turnaround time per leg.
* **Complex Clearance:** Multi-jurisdiction overflight permits and landing approvals.
* **On-Board Hospitality:** High-profile executive catering requirements.

### The EAN Solution
1. **Dedicated Dispatch Desk:** Secured all diplomatic permits 24 hours prior to departure.
2. **Onsite FBO Acceleration:** Rapid refueling and ground support at Lagos DNMM.
3. **Wings™ Bespoke Catering:** Delivered fresh executive meals directly to the aircraft.

### Operational Results
* **100% On-Time Departure** across all 4 flight legs.
* **Zero Delay Minutes** during ground handling and refueling.
* **Flawless Client Satisfaction** reported by the corporate travel director.

---
*Looking for customized flight dispatch or jet charter solutions? Connect with EAN Aviation today.*`,
  },
];
