import React from 'react';

import Navbar from '@/components/layout/Navbar';
import AeroplexHero from '@/components/aeroplex/AeroplexHero';
import CampusOverview from '@/components/aeroplex/CampusOverview';

/**
 * /the-aeroplex — The EAN Aeroplex campus at MMIA Lagos.
 * Minimal, luxurious presentation with obsidian black styling.
 */
export default function TheAeroplexPage() {
  return (
    <>
      <Navbar />

      <main className="flex-1 flex flex-col bg-ean-obsidian text-ean-text-light">
        <AeroplexHero />
        <CampusOverview />
      </main>
    </>
  );
}
