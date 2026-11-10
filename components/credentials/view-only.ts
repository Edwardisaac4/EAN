import type React from 'react';

/**
 * Spread onto every certificate image. View-only, as agreed with Quality &
 * Safety: no drag, and no long-press or right-click "Save image". None of that
 * stops a screenshot — the watermark baked into each scan is what does the
 * real work — but it keeps the page from offering the file.
 *
 * In its own module so the hero thumbnails can use it without importing the
 * viewer, whose code loads only when someone opens a certificate.
 */
export const VIEW_ONLY_PROPS = {
  draggable: false,
  onContextMenu: (event: React.MouseEvent) => event.preventDefault(),
} as const;
