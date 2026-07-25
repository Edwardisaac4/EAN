import React from 'react';
import { Metadata } from 'next';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export const metadata: Metadata = {
  title: 'EAN Aviation Lead Command Hub | Admin Portal',
  description: 'Executive admin dashboard for EAN Aviation lead capture, inquiry triaging, and CRM analytics.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ean-black-pure text-ean-text-light flex font-ui antialiased">
      {/* Executive Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-ean-black-pure via-ean-black to-ean-black-accent min-h-screen overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
