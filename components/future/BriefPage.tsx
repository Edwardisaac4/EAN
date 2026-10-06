import Link from 'next/link';
import DsReveal, { DsRevealScope } from '@/components/future/DsReveal';
import BriefHero from '@/components/future/BriefHero';
import BriefSection from '@/components/future/BriefSection';
import {
  BRIEF_H2,
  BRIEF_H4,
  BRIEF_LABEL,
  BRIEF_LEDE,
  BRIEF_RULE,
  BRIEF_SECTION,
  BRIEF_WRAP,
} from '@/components/future/brief-styles';
import { FUTURE_INDEX, type FutureProgramme } from '@/lib/future-constants';

/**
 * A programme page as a replica of the line's own published brief, on the blue
 * ramp. Opted into per programme with `layout: 'brief'`; see brief-styles.ts
 * for the colour mapping.
 *
 * The brief's own top bar and footer are not reproduced — the site's Navbar and
 * Footer already sit above and below this, and a second logo and a second
 * footer would be two of each. Its links survive as the section nav, which
 * scrolls away with the page: pinned under the site's fixed Navbar, it read as
 * a second bar competing with the first.
 *
 * A Server Component. The FAQ is native <details>, so it opens without JS; the
 * only client code is the DsReveal entrance.
 */
export default function BriefPage({ programme }: { programme: FutureProgramme }) {
  const { slug, title, sections, faqs, summary, crossLinkHeading, contact, disclaimer } = programme;
  const cinematic = programme.motion === 'cinematic';

  return (
    <main className="flex-1 bg-ds-afterburn font-ds-body text-[17px] leading-[1.65] text-ds-skyway/90">
      {/* Cinematic pages reveal their copy both ways, to match the photographs. */}
      <DsRevealScope twoWay={cinematic}>
        <BriefHero programme={programme} cinematic={cinematic} />

        {/* The brief hides its link row below 900px, and so does this. */}
        <nav
          aria-label={`${title} sections`}
          className="mt-[26px] hidden border-y border-ds-skyway/14 min-[901px]:block"
        >
          <div className={`${BRIEF_WRAP} flex h-16 items-center justify-between gap-4`}>
            <span className="font-ds-display text-[20px] tracking-[-0.02em] text-ds-skyway">{title}</span>
            <ul className="flex list-none gap-[22px] font-ds-body text-[14px] font-medium text-ds-skyway/68">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="border-b border-transparent whitespace-nowrap transition-colors hover:border-ds-aurum hover:text-ds-skyway"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#contact"
                  className="border-b border-transparent transition-colors hover:border-ds-aurum hover:text-ds-skyway"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {sections.map((section, index) => (
          <BriefSection key={section.id} section={section} first={index === 0} cinematic={cinematic} />
        ))}

        <section id="faq" className={`${BRIEF_SECTION} ${BRIEF_RULE}`}>
          <div className={BRIEF_WRAP}>
            <DsReveal>
              <p className={BRIEF_LABEL}>Questions</p>
              <h2 className={BRIEF_H2}>What people ask us.</h2>
            </DsReveal>

            <DsReveal stagger className="mt-[26px] border-t border-ds-skyway/14">
              {faqs.map((faq) => (
                <details key={faq.question} data-reveal className="group border-b border-ds-skyway/14">
                  <summary
                    className={`${BRIEF_H4} flex cursor-pointer list-none justify-between gap-5 py-[18px] after:font-ds-display after:text-[24px] after:leading-none after:text-ds-aurum after:content-['+'] group-open:after:content-['–'] [&::-webkit-details-marker]:hidden`}
                  >
                    {faq.question}
                  </summary>
                  <p className="mb-5 max-w-[70ch] text-[16px] leading-[1.6] text-ds-skyway/68">{faq.answer}</p>
                </details>
              ))}
            </DsReveal>
          </div>
        </section>

        {/*
          Where the brief has its full-bleed cabernet band. Here the band takes the
          black ground and only the cells are blue, so the ten lines read as
          a table standing out from the page.
        */}
        <section className={`${BRIEF_SECTION} ${BRIEF_RULE}`}>
          <div className={BRIEF_WRAP}>
            <DsReveal>
              <p className={BRIEF_LABEL}>One campus, ten lines</p>
              <h2 className={BRIEF_H2}>{crossLinkHeading}</h2>
            </DsReveal>

            <DsReveal
              stagger
              grid
              className="mt-[30px] grid grid-cols-1 gap-px border border-ds-skyway/12 bg-ds-skyway/12 min-[561px]:grid-cols-2 min-[901px]:grid-cols-5"
            >
              {FUTURE_INDEX.map((line) => {
                const isCurrent = line.slug === slug;
                const cell = 'block bg-ds-blue-deep px-[18px] pt-[18px] pb-5 text-[15px] font-semibold text-ds-skyway';
                const number = (
                  <small className="mb-1.5 block font-ds-mono text-[10.5px] font-normal tracking-[0.1em] text-ds-aurum">
                    {line.number}
                    {isCurrent && ' · this page'}
                  </small>
                );

                // The current line is text, not a link: a link to this page is a dead control.
                return isCurrent ? (
                  <p key={line.slug} data-reveal aria-current="page" className={cell}>
                    {number}
                    {line.name}
                  </p>
                ) : (
                  <Link
                    key={line.slug}
                    data-reveal
                    href={`/airborne/${line.slug}`}
                    className={`${cell} transition-colors duration-200 hover:bg-ds-blue-dark`}
                  >
                    {number}
                    {line.name}
                  </Link>
                );
              })}
            </DsReveal>
          </div>
        </section>

        <section id="contact" className={`${BRIEF_SECTION} border-t-2 border-ds-aurum`}>
          <DsReveal className={BRIEF_WRAP}>
            <p className={BRIEF_LABEL}>In one paragraph</p>
            <p className="mb-[30px] max-w-[70ch] border-l-2 border-ds-aurum py-1.5 pl-[22px] font-ds-display text-[21px] leading-[1.45] text-ds-skyway">
              {summary}
            </p>

            <h2 className={BRIEF_H2}>{contact.heading}</h2>
            <p className={BRIEF_LEDE}>{contact.body}</p>

            <div className="mt-7 flex flex-wrap gap-3.5">
              <Link
                href={`/contact?line=${slug}`}
                className="inline-flex items-center gap-2.5 rounded-full border border-ds-aurum bg-ds-aurum px-[26px] py-3 text-[15px] font-semibold text-ds-afterburn transition-colors duration-200 hover:border-ds-skyway hover:bg-ds-skyway"
              >
                Make an inquiry
              </Link>
              {contact.phone && (
                <a
                  href={`tel:${contact.phone.tel}`}
                  className="inline-flex items-center gap-2.5 rounded-full border border-ds-skyway/55 px-[26px] py-3 text-[15px] font-semibold text-ds-skyway transition-colors duration-200 hover:bg-ds-skyway hover:text-ds-blue-deep"
                >
                  Call {contact.phone.label}
                </a>
              )}
            </div>

            <p className="mt-10 max-w-[80ch] text-[12.5px] leading-[1.55] text-ds-skyway/55">{disclaimer}</p>
          </DsReveal>
        </section>
      </DsRevealScope>
    </main>
  );
}
