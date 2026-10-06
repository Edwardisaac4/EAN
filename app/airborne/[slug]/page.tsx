import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

import Navbar from '@/components/layout/Navbar';
import JsonLd from '@/components/shared/JsonLd';
import BriefPage from '@/components/future/BriefPage';
import DsReveal from '@/components/future/DsReveal';
import ProgrammeHero from '@/components/future/ProgrammeHero';
import ProgrammeSection from '@/components/future/ProgrammeSection';
import ProgrammeIndex from '@/components/future/ProgrammeIndex';
import { FUTURE_PROGRAMMES, FUTURE_BY_SLUG } from '@/lib/future-constants';
import { buildMetadata, breadcrumbSchema } from '@/lib/seo';

/**
 * Every programme is known at build time and none of them reads a request, so
 * all ten prerender. Keep it that way — see AGENTS.md §4.
 */
export function generateStaticParams() {
  return FUTURE_PROGRAMMES.map((programme) => ({ slug: programme.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const programme = FUTURE_BY_SLUG.get(slug);

  if (!programme) return {};

  return buildMetadata({
    title: `${programme.title} | EAN Aviation`,
    description: programme.seoDescription,
    path: `/airborne/${programme.slug}`,
    image: programme.tile.image,
  });
}

/**
 * /airborne/[slug] — one programme, at the depth its own deck carries.
 *
 * The page is assembled from the record rather than written per line: hero,
 * then the deck's sections in order, then the questions, the one-paragraph
 * close, the cross-link strip, the contact block and the disclaimer. Ten pages,
 * one component tree, because the ten decks differ in content and never in
 * structure.
 *
 * The disclaimer is not decoration. Most of what these pages describe is not
 * built, and the deck prints that line under every page for a reason — it and
 * the per-section `sources` are what make the forward-looking figures on this
 * page defensible. Neither should be removed to tidy the layout.
 */
export default async function ProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const programme = FUTURE_BY_SLUG.get(slug);

  if (!programme) notFound();

  const { sections, faqs, summary, crossLinkHeading, contact, disclaimer, title, name } = programme;

  const breadcrumbs = (
    <JsonLd
      schema={breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Airborne', path: '/airborne' },
        { name: name, path: `/airborne/${slug}` },
      ])}
    />
  );

  // A line whose published brief has been replicated renders that instead.
  if (programme.layout === 'brief') {
    return (
      <>
        <Navbar hasPhotoHero />
        {breadcrumbs}
        <BriefPage programme={programme} />
      </>
    );
  }

  return (
    <>
      {/*
        A programme page opens on a full-bleed photograph under a dark scrim, so
        the bar takes its white palette — this is the case the prop is named for.
        The mosaic at /airborne opens on Canvas Linen and does not.
      */}
      <Navbar hasPhotoHero />

      {breadcrumbs}

      <main className="flex-1 bg-ds-canvas">
        <ProgrammeHero programme={programme} />

        {/*
          In-page nav. Sticky under the bar rather than inside the hero, so it
          survives the scroll on a page that runs to five or six sections. The
          horizontal scroll takes the system's scrollbar treatment; §20 hides it
          on mobile, which is where it is most likely to be used.
        */}
        <nav
          aria-label={`${title} sections`}
          className="ds-scroll sticky top-[66px] z-30 border-y border-ds-hairline bg-ds-canvas/95 backdrop-blur-[12px]"
        >
          <ul className="mx-auto flex max-w-ean gap-7 overflow-x-auto px-6 py-4 md:px-12">
            {sections.map((section) => (
              <li key={section.id} className="shrink-0">
                <a
                  href={`#${section.id}`}
                  className="font-ds-display text-[13px] font-semibold tracking-[0.02em] whitespace-nowrap text-ds-text-secondary transition-colors duration-[400ms] ease-ds-default hover:text-ds-blue"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {sections.map((section, index) => (
          <ProgrammeSection key={section.id} section={section} index={index} />
        ))}

        <section className="bg-ds-canvas py-20 md:py-28">
          <div className="mx-auto max-w-ean px-6 md:px-12">
            <DsReveal>
              <p className="font-ds-display text-[13px] font-semibold uppercase tracking-[0.10em] text-ds-blue">
                Questions
              </p>
              <h2 className="mt-4 font-ds-display text-[26px] leading-[1.15] font-bold tracking-[-0.02em] text-ds-afterburn md:text-[32px]">
                What people ask us.
              </h2>
            </DsReveal>

            <DsReveal stagger className="mt-10 border-t border-ds-hairline md:mt-14">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  data-reveal
                  className="grid grid-cols-1 gap-3 border-b border-ds-hairline py-7 md:grid-cols-[minmax(0,22rem)_1fr] md:gap-10"
                >
                  <h3 className="font-ds-display text-[17px] leading-[1.3] font-semibold tracking-[-0.02em] text-ds-afterburn">
                    {faq.question}
                  </h3>
                  <p className="max-w-[68ch] font-ds-body text-[15px] leading-[1.7] text-ds-text-secondary md:text-[16px]">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </DsReveal>
          </div>
        </section>

        <DsReveal className="bg-ds-canvas-deep py-16 md:py-20">
          <div className="mx-auto max-w-ean px-6 md:px-12">
            <p className="font-ds-display text-[13px] font-semibold uppercase tracking-[0.10em] text-ds-blue">
              In one paragraph
            </p>
            <p className="mt-5 max-w-[72ch] font-ds-body text-[19px] leading-[1.6] text-ds-afterburn md:text-[22px]">
              {summary}
            </p>
          </div>
        </DsReveal>

        <ProgrammeIndex currentSlug={slug} heading={crossLinkHeading} />

        <DsReveal className="bg-ds-canvas pb-20 md:pb-28">
          <div className="mx-auto max-w-ean px-6 md:px-12">
            <div className="rounded-[14px] bg-ds-blue px-7 py-12 md:px-14 md:py-16">
              <h2 className="max-w-[22ch] font-ds-display text-[26px] leading-[1.15] font-bold tracking-[-0.02em] text-ds-skyway md:text-[34px]">
                {contact.heading}
              </h2>
              <p className="mt-5 max-w-[62ch] font-ds-body text-[16px] leading-[1.7] text-ds-skyway/70 md:text-[17px]">
                {contact.body}
              </p>
              {/* Inverted, per §08: a blue button on a blue ground is 1:1. */}
              <Link href={`/contact?line=${slug}`} className="ds-btn ds-btn-invert mt-9">
                Make an inquiry
              </Link>
            </div>

            <p className="mt-10 max-w-[92ch] font-ds-mono text-[11px] leading-[1.8] text-ds-text-muted">
              {disclaimer}
            </p>
          </div>
        </DsReveal>
      </main>
    </>
  );
}
