'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Plus, Clock, Globe, ShieldAlert } from 'lucide-react';

export interface AdminHeaderProps {
  onSearchChange?: (query: string) => void;
  onOpenCreateModal?: () => void;
  unreadCount?: number;
}

export function AdminHeader({ onSearchChange, onOpenCreateModal, unreadCount = 2 }: AdminHeaderProps) {
  const [watTime, setWatTime] = useState<string>('');
  const [utcTime, setUtcTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setWatTime(
        now.toLocaleTimeString('en-GB', {
          timeZone: 'Africa/Lagos',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setUtcTime(
        now.toLocaleTimeString('en-GB', {
          timeZone: 'UTC',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  return (
    <header className="h-16 bg-ean-black-pure/90 backdrop-blur-md border-b border-ean-border-dark px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-xs sm:max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ean-muted-light/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search leads..."
            className="w-full pl-9 pr-8 sm:pr-10 py-1.5 bg-ean-black-accent border border-ean-border-dark rounded-lg text-xs text-ean-white placeholder:text-ean-muted-light/40 focus:outline-none focus:border-ean-gold/60 focus:ring-1 focus:ring-ean-gold/30 transition-all"
          />
          <kbd className="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-white/5 border border-white/10 text-ean-muted-light px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Clocks & Quick Action */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Aviation Dual Time Display (iPad Air / iPad Pro / Desktop) */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-ean-black-accent border border-ean-border-dark text-xs">
          <div className="flex items-center gap-1.5 text-ean-muted-light">
            <Clock className="w-3.5 h-3.5 text-ean-gold" />
            <span className="font-mono text-ean-white font-medium">{watTime || '00:00:00'}</span>
            <span className="hidden lg:inline text-[10px] text-ean-gold uppercase tracking-wider font-semibold">WAT</span>
          </div>
          <div className="h-3 w-px bg-ean-border-dark" />
          <div className="flex items-center gap-1.5 text-ean-muted-light">
            <Globe className="w-3.5 h-3.5 text-ean-gold/70" />
            <span className="font-mono text-ean-white font-medium">{utcTime || '00:00'} Z</span>
            <span className="hidden lg:inline text-[10px] text-ean-muted-light uppercase tracking-wider">UTC</span>
          </div>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 text-ean-muted-light hover:text-ean-gold transition-colors"
            title="Lead Alerts & SLA Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-ean-black-pure border border-ean-gold/30 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-ean-border-dark">
                <span className="text-xs font-semibold text-ean-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-ean-gold" />
                  Lead Alerts
                </span>
                <span className="text-[10px] text-ean-gold font-bold px-2 py-0.5 rounded-full bg-ean-gold/10">
                  {unreadCount} Unprocessed
                </span>
              </div>

              <div className="py-2 space-y-2">
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs">
                  <div className="flex items-center justify-between text-rose-400 font-semibold mb-1">
                    <span>Urgent FBO Inquiry</span>
                    <span className="text-[10px] font-mono">12m ago</span>
                  </div>
                  <p className="text-ean-muted-light text-[11px] line-clamp-1">
                    Capt. Vance requested VIP ground handling for Global 7500.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs">
                  <div className="flex items-center justify-between text-amber-400 font-semibold mb-1">
                    <span>High Priority Charter Quote</span>
                    <span className="text-[10px] font-mono">1h ago</span>
                  </div>
                  <p className="text-ean-muted-light text-[11px] line-clamp-1">
                    Dr. Adeleke requested Hawker 900XP charter to Port Harcourt.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-ean-border-dark text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] text-ean-gold hover:underline font-medium"
                >
                  Close notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create Lead Button */}
        {onOpenCreateModal && (
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg bg-ean-gold hover:bg-ean-gold-light text-ean-black font-semibold text-xs transition-all shadow-[0_0_15px_rgba(196,149,42,0.3)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 stroke-3" />
            <span className="hidden sm:inline">Log Lead</span>
          </button>
        )}
      </div>
    </header>
  );
}
