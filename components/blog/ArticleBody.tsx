import React from 'react';
import Image from 'next/image';
import type { ArticleBlock } from '@/lib/blog-content';

interface ArticleBodyProps {
  blocks: ArticleBlock[];
}

/**
 * Renders a structured article body.
 *
 * All article-body typography lives here rather than being repeated inline per
 * post, so restyling the reading experience is a single-file change. A server
 * component by design — nothing here is interactive, and the body is the bulk of
 * the page weight, so it should not reach the client bundle.
 */
export default function ArticleBody({ blocks }: ArticleBodyProps) {
  if (!blocks.length) return null;

  return (
    <div className="space-y-6 font-ui text-ean-text-dark text-base sm:text-lg leading-relaxed">
      {blocks.map((block, idx) => (
        <Block key={idx} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case 'lead':
      return (
        <p className="text-xl font-light text-ean-navy leading-relaxed border-l border-ean-gold pl-6 italic">
          {block.text}
        </p>
      );

    case 'heading':
      // Rendered as real h2/h3 so the document outline is navigable by assistive
      // technology and legible to a crawler, not just visually distinct.
      return block.level === 2 ? (
        <h2 className="font-display text-2xl sm:text-2xl text-ean-navy font-medium pt-6">
          {block.text}
        </h2>
      ) : (
        <h3 className="font-ui text-lg sm:text-xl text-ean-navy font-semibold pt-4">
          {block.text}
        </h3>
      );

    case 'paragraph':
      return <p>{block.text}</p>;

    case 'list':
      return block.ordered ? (
        <ol className="list-decimal marker:text-ean-gold marker:font-semibold pl-6 space-y-3">
          {block.items.map((item, idx) => (
            <li key={idx} className="pl-1">
              {item}
            </li>
          ))}
        </ol>
      ) : (
        <ul className="list-disc marker:text-ean-gold pl-6 space-y-3">
          {block.items.map((item, idx) => (
            <li key={idx} className="pl-1">
              {item}
            </li>
          ))}
        </ul>
      );

    case 'definitionList':
      return (
        <dl className="space-y-5">
          {block.items.map((item, idx) => (
            <div key={idx} className="border-l border-ean-border-light pl-5">
              <dt className="font-ui font-semibold text-ean-navy inline">{item.term}: </dt>
              <dd className="inline">{item.text}</dd>
            </div>
          ))}
        </dl>
      );

    case 'callout':
      return (
        <div className="bg-ean-surface border border-ean-border-light p-6 my-8 space-y-4">
          <h3 className="font-ui text-sm font-bold uppercase tracking-wider text-ean-gold">
            {block.title}
          </h3>
          <ul className="space-y-2 text-base">
            {block.items.map((item, idx) => (
              <li key={idx} className="flex gap-3">
                <span aria-hidden="true" className="text-ean-gold shrink-0">
                  —
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case 'stats':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
          {block.items.map((item, idx) => (
            <div
              key={idx}
              className="bg-ean-surface border border-ean-border-light p-6 space-y-2"
            >
              <div className="font-display text-2xl sm:text-3xl font-light text-ean-gold tracking-tight">
                {item.value}
              </div>
              <p className="font-ui text-xs text-ean-muted-dark leading-relaxed">{item.label}</p>
            </div>
          ))}
        </div>
      );

    case 'table':
      return (
        <figure className="my-8 space-y-3">
          {/*
            The horizontal scroll container is required, not cosmetic: a
            three-column comparison table cannot fit a phone viewport, and without
            it the table would force the whole page to scroll sideways.
          */}
          <div className="overflow-x-auto border border-ean-border-light">
            <table className="w-full min-w-[36rem] border-collapse text-left">
              <thead>
                <tr className="bg-ean-surface">
                  {block.headers.map((header, idx) => (
                    <th
                      key={idx}
                      scope="col"
                      className="font-ui text-xs font-bold uppercase tracking-wider text-ean-navy px-5 py-4 border-b border-ean-border-light"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="border-b border-ean-border-light/60 last:border-b-0"
                  >
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className={`px-5 py-4 text-sm align-top ${
                          cellIdx === 0
                            ? 'font-ui font-semibold text-ean-navy'
                            : 'text-ean-muted-dark'
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && (
            <figcaption className="font-ui text-xs text-ean-muted-dark italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'image':
      return (
        <figure className="my-8 space-y-3">
          {/*
            Intrinsic sizing rather than a fixed-height box: these came from
            WordPress at every aspect ratio from 4:3 to panoramic, and forcing
            them into one crop box would cut the subject out of half of them.
            quality 80 is the content-imagery value whitelisted in
            next.config.ts — anything not in that list is served as a 400.
          */}
          <Image
            src={block.src}
            alt={block.alt}
            width={block.width}
            height={block.height}
            sizes="(max-width: 896px) 100vw, 896px"
            quality={80}
            className="w-full h-auto border border-ean-border-light bg-ean-black/5"
          />
          {block.caption && (
            <figcaption className="font-ui text-xs text-ean-muted-dark italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'cta':
      return (
        <div className="bg-ean-navy text-ean-text-light p-8 my-8 relative overflow-hidden">
          <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-ean-gold/10 blur-[80px] pointer-events-none" />
          <p className="relative z-10 font-ui text-base sm:text-lg leading-relaxed text-ean-muted-light">
            {block.text}
          </p>
        </div>
      );
  }
}
