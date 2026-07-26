'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  FileText, 
  Settings, 
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Menu,
  X,
  LogOut
} from 'lucide-react';

export interface NavMenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export const ADMIN_NAV_ITEMS: NavMenuItem[] = [
  {
    name: 'Overview',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Lead Hub',
    href: '/admin/leads',
    icon: Users,
    badge: 'LIVE',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'Blog & News CMS',
    href: '/admin/blog',
    icon: FileText,
  },
  {
    name: 'Settings & SLA',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Do not render sidebar on login screen
  if (pathname === '/admin/login') {
    return null;
  }

  return (
    <>
      {/* Mobile/Tablet Floating Hamburger Button (Visible on Phones, iPad Mini, iPad Air, iPad Pro < xl) */}
      <button
        onClick={() => setIsOpen(true)}
        className="xl:hidden fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-ean-gold text-ean-black shadow-[0_0_25px_rgba(196,149,42,0.5)] hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
        aria-label="Open Navigation Menu"
      >
        <Menu className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Backdrop for Mobile / Tablet Drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="xl:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`bg-ean-black-pure border-r border-ean-gold/20 flex flex-col h-screen select-none transition-transform duration-300 z-50 ${
          isOpen
            ? 'fixed inset-y-0 left-0 w-72 max-w-[85vw] translate-x-0 shadow-2xl'
            : 'fixed inset-y-0 left-0 w-72 -translate-x-full xl:translate-x-0 xl:static xl:w-64 xl:flex'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 sm:p-6 border-b border-ean-border-dark flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-ean-gold/40 p-1 bg-ean-navy/30 flex items-center justify-center group-hover:border-ean-gold transition-colors">
              <Image 
                src="/icon.png" 
                alt="EAN Executive Aviation" 
                width={28} 
                height={28} 
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-display text-base sm:text-lg font-semibold tracking-wider text-ean-white block leading-tight">
                EAN <span className="text-ean-gold">Aero</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-ui tracking-widest text-ean-gold-light/70 uppercase">
                Lead Command Hub
              </span>
            </div>
          </Link>

          {/* Close button for Mobile/Tablet drawer */}
          <button
            onClick={() => setIsOpen(false)}
            className="xl:hidden p-2 rounded-lg bg-white/5 text-ean-muted-light hover:text-ean-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-ean-muted-light/50 tracking-wider uppercase">
            Management Console
          </div>

          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-3 xl:py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-ean-gold/15 text-ean-gold border border-ean-gold/40 shadow-[0_0_15px_rgba(196,149,42,0.15)] font-semibold'
                    : 'text-ean-muted-light hover:text-ean-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-ean-gold' : 'text-ean-muted-light group-hover:text-ean-white'}`} />
                  <span>{item.name}</span>
                </div>
                
                {item.badge ? (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100 text-ean-gold' : 'text-ean-muted-light'}`} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Public Site Quick Link & Operator Status */}
        <div className="p-4 border-t border-ean-border-dark bg-ean-navy-mid/30 space-y-3">
          <Link 
            href="/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-md bg-white/5 hover:bg-ean-gold/10 text-xs text-ean-muted-light hover:text-ean-gold border border-ean-border-dark hover:border-ean-gold/30 transition-all"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-ean-gold" />
              Live Website
            </span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-ean-gold/20 border border-ean-gold/50 flex items-center justify-center text-ean-gold font-bold text-xs">
                EA
              </div>
              <div>
                <p className="text-xs font-medium text-ean-white leading-tight">Lead Admin</p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  Active SLA Tracking
                </p>
              </div>
            </div>
            <Link
              href="/admin/login"
              title="Sign Out of Admin Portal"
              className="p-1.5 rounded-lg text-ean-muted-light hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
