import React from 'react';

interface JsonLdProps {
  /** One schema object, or several to emit in a single graph. */
  schema: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * Emits JSON-LD structured data.
 *
 * Rendered as a plain <script> rather than next/script because structured data
 * must be present in the initial HTML for a crawler to see it — next/script
 * defers, and a deferred schema block is a schema block that may never be read.
 *
 * JSON.stringify is the escaping boundary here, but it leaves `<` intact. Every
 * `<` is therefore rewritten to the JSON unicode escape for it, which JSON.parse
 * reads back as the same character while making it impossible to compose
 * `</script`, `<!--` or `<script` inside the element. Targeting only the
 * `</script` sequence left the HTML-comment forms — which also terminate script
 * parsing — untouched. Every value passed in today is authored content, but
 * blog titles reach articleSchema from the database.
 */
export default function JsonLd({ schema }: JsonLdProps) {
  const payload = JSON.stringify(schema).replace(/</g, '\\u003c');

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: payload }}
    />
  );
}
