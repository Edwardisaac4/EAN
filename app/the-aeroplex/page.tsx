import { notFound } from 'next/navigation';
import { Rosario, Fustat, JetBrains_Mono } from 'next/font/google';

import Navbar from '@/components/layout/Navbar';
import BriefPage from '@/components/future/BriefPage';
import { FUTURE_BY_SLUG } from '@/lib/future-constants';

/*
 * The design system's three faces, declared as app/airborne/layout.tsx
 * declares them. BriefPage is set in them, and the variables only exist on the
 * element that carries these classes.
 */
const rosario = Rosario({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--ds-display',
  display: 'swap',
});

const fustat = Fustat({
  subsets: ['latin'],
  variable: '--ds-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--ds-mono',
  display: 'swap',
});

/**
 * /the-aeroplex — a replica of /airborne/the-aeroplex, rendered from the
 * same programme record so the two cannot drift apart. The /airborne page is
 * unchanged; edit the record in lib/future-constants.ts and both follow.
 */
export default function TheAeroplexPage() {
  const programme = FUTURE_BY_SLUG.get('the-aeroplex');

  if (!programme) notFound();

  return (
    <div className={`${rosario.variable} ${fustat.variable} ${jetbrainsMono.variable}`}>
      <Navbar hasPhotoHero />
      <BriefPage programme={programme} />
    </div>
  );
}
