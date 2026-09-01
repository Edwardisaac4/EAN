import React from 'react';
import { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

/*
 * Admin's own fonts, requested here rather than in the root layout.
 *
 * The public site sets in Archivo with IBM Plex Mono labels; admin is explicitly
 * out of that scope and must keep rendering in Cormorant + Inter. Loading them
 * from this layout means the two extra faces are fetched on /admin routes only
 * and cost a public page load nothing.
 *
 * These expose --admin-display / --admin-ui, which the `.admin-theme` block in
 * globals.css points --font-display / --font-ui at. Admin components keep using
 * the plain `font-display` / `font-ui` utilities and never learn about the
 * indirection.
 */
const cormorant = Cormorant_Garamond({
  variable: '--admin-display',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--admin-ui',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EAN Aviation Lead Command Hub | Admin Portal',
  description: 'Executive admin dashboard for EAN Aviation lead capture, inquiry triaging, and CRM analytics.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  /*
   * `admin-theme` is load-bearing, not cosmetic: it redeclares the pre-v7
   * indigo/gold token values so the 1,013 token references across these 26
   * files keep resolving to the palette they were designed against. Custom
   * properties inherit and a nearer ancestor beats :root, so this one class on
   * the one div that wraps every admin route — /admin/login included — is the
   * whole of the pin. See app/globals.css and
   * docs/specs/2026-08-31-v7-ink-brass-redesign.md §4.5.
   */
  return (
    <div className={`admin-theme ${cormorant.variable} ${inter.variable} min-h-screen bg-ean-black-pure text-ean-text-light flex font-ui antialiased`}>
      {/* Executive Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-linear-to-b from-ean-black-pure via-ean-black to-ean-black-accent min-h-screen overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
