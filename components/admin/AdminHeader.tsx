'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Plus, Clock, Globe, ShieldAlert, ChevronRight, Menu, CheckCheck } from 'lucide-react';
import { Lead } from '@/lib/admin-leads-data';

export interface AdminHeaderProps {
  onSearchChange?: (query: string) => void;
  onOpenCreateModal?: () => void;
  onSelectLead?: (leadId: string) => void;
  onToggleSidebar?: () => void;
  leads?: Lead[];
  unreadCount?: number;
}

const READ_STORAGE_KEY = 'ean_read_notifications_v1';

export function AdminHeader({
  onSearchChange,
  onOpenCreateModal,
  onSelectLead,
  onToggleSidebar,
  leads = [],
}: AdminHeaderProps) {
  const [watTime, setWatTime] = useState<string>('');
  const [utcTime, setUtcTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [readIds, setReadIds] = useState<string[]>([]);

  // Load read notification IDs from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(READ_STORAGE_KEY);
        if (stored) {
          setReadIds(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load read notification IDs:', e);
      }
    }
  }, []);

  // Update clocks every second
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

  // Derive notifications from actual urgent/high/new leads
  const activeAlertLeads = leads.filter(
    (l) => l.status === 'new' || l.priority === 'urgent' || l.priority === 'high'
  );

  // Unread items are active alert leads whose ID is NOT in readIds
  const unreadAlertLeads = activeAlertLeads.filter((l) => !readIds.includes(l.id));
  const unreadBadgeCount = unreadAlertLeads.length;

  const markAsRead = (leadId: string) => {
    if (!readIds.includes(leadId)) {
      const nextRead = [...readIds, leadId];
      setReadIds(nextRead);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(nextRead));
        } catch (e) {
          console.error('Failed to save read notification IDs:', e);
        }
      }
    }
  };

  const handleMarkAllAsRead = () => {
    const allIds = activeAlertLeads.map((l) => l.id);
    const nextRead = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(nextRead);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(nextRead));
      } catch (e) {
        console.error('Failed to save read notification IDs:', e);
      }
    }
  };

  const handleNotificationClick = (leadId: string) => {
    markAsRead(leadId);
    setShowNotifications(false);
    if (onSelectLead) {
      onSelectLead(leadId);
    }
  };

  return (
    <header className="h-16 bg-ean-black-pure/90 backdrop-blur-md border-b border-ean-border-dark px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 min-w-0">
      {/* Mobile Sidebar Hamburger Toggle & Search Input */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xs sm:max-w-md min-w-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="xl:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-ean-muted-light hover:text-ean-gold transition-colors shrink-0 cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="relative w-full min-w-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ean-muted-light/60 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search leads..."
            className="w-full pl-9 pr-7 sm:pr-10 py-1.5 bg-ean-black-accent border border-ean-border-dark rounded-lg text-xs text-ean-white placeholder:text-ean-muted-light/40 focus:outline-none focus:border-ean-gold/60 focus:ring-1 focus:ring-ean-gold/30 transition-all"
          />
          <kbd className="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-white/5 border border-white/10 text-ean-muted-light px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Clocks & Quick Action */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Aviation Dual Time Display (Hidden on phone screens) */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-ean-black-accent border border-ean-border-dark text-xs">
          <div className="flex items-center gap-1.5 text-ean-muted-light">
            <Clock className="w-3.5 h-3.5 text-ean-gold shrink-0" />
            <span className="font-mono text-ean-white font-medium">{watTime || '00:00:00'}</span>
            <span className="hidden lg:inline text-[10px] text-ean-gold uppercase tracking-wider font-semibold">WAT</span>
          </div>
          <div className="h-3 w-px bg-ean-border-dark" />
          <div className="flex items-center gap-1.5 text-ean-muted-light">
            <Globe className="w-3.5 h-3.5 text-ean-gold/70 shrink-0" />
            <span className="font-mono text-ean-white font-medium">{utcTime || '00:00'} Z</span>
            <span className="hidden lg:inline text-[10px] text-ean-muted-light uppercase tracking-wider">UTC</span>
          </div>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 text-ean-muted-light hover:text-ean-gold transition-colors cursor-pointer"
            title="Lead Alerts & SLA Notifications"
          >
            <Bell className="w-4.5 h-4.5 sm:w-4 sm:h-4" />
            {unreadBadgeCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center animate-pulse shadow-md">
                {unreadBadgeCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-76 sm:w-88 bg-ean-black-pure border border-ean-gold/40 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-ean-border-dark">
                <span className="text-xs font-semibold text-ean-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-ean-gold" />
                  Live Lead Alerts
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-ean-gold font-bold px-2 py-0.5 rounded-full bg-ean-gold/10">
                    {unreadBadgeCount} Unread
                  </span>
                  {unreadBadgeCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] text-ean-muted-light hover:text-ean-gold transition-colors flex items-center gap-1 font-medium cursor-pointer"
                      title="Mark all notifications as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-ean-gold" />
                      <span>Read All</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="py-2 space-y-2 max-h-80 overflow-y-auto">
                {activeAlertLeads.length > 0 ? (
                  activeAlertLeads.slice(0, 8).map((item) => {
                    const isRead = readIds.includes(item.id);
                    const isUrgent = item.priority === 'urgent';
                    const isHigh = item.priority === 'high';

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNotificationClick(item.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer group relative ${
                          isRead
                            ? 'bg-white/2 border-ean-border-dark/60 opacity-60 hover:opacity-100 hover:bg-white/5'
                            : isUrgent
                            ? 'bg-rose-500/10 border-rose-500/40 hover:bg-rose-500/20 shadow-xs'
                            : isHigh
                            ? 'bg-amber-500/10 border-amber-500/40 hover:bg-amber-500/20 shadow-xs'
                            : 'bg-ean-gold/10 border-ean-gold/30 hover:bg-ean-gold/20'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold mb-1 text-xs">
                          <span className="flex items-center gap-1.5">
                            {!isRead && (
                              <span className="w-2 h-2 rounded-full bg-ean-gold animate-pulse shrink-0" />
                            )}
                            <span className={isUrgent ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-ean-gold'}>
                              {isUrgent ? '🚨 Urgent Lead' : isHigh ? '⚡ High Priority' : '📋 New Inquiry'}
                            </span>
                          </span>

                          <span className="flex items-center gap-1 text-[10px] font-mono text-ean-muted-light">
                            {isRead && <span className="text-emerald-400 font-sans text-[9px] font-bold">✓ Read</span>}
                            <span>{item.id}</span>
                          </span>
                        </div>

                        <p className={`font-medium text-xs truncate ${isRead ? 'text-ean-muted-light' : 'text-ean-white'}`}>
                          {item.fullName}
                        </p>
                        <p className="text-ean-muted-light text-[11px] line-clamp-1 mt-0.5">
                          {item.message || 'Click to view full inquiry details.'}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[10px] text-ean-gold group-hover:underline">
                          <span>{isRead ? 'Re-open Details' : 'View Prospect Details'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-ean-muted-light">
                    No urgent or unhandled lead alerts at this time.
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-ean-border-dark flex items-center justify-between text-[11px]">
                <span className="text-ean-muted-light text-[10px]">
                  {readIds.length} read in session
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-ean-gold hover:underline font-medium cursor-pointer"
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
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg bg-ean-gold hover:bg-ean-gold-light text-ean-black font-semibold text-xs transition-all shadow-[0_0_15px_rgba(196,149,42,0.3)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-3" />
            <span className="hidden sm:inline">Log Lead</span>
          </button>
        )}
      </div>
    </header>
  );
}
