'use client'

import React, { useEffect, useState } from 'react'
import { Mode } from '@/types/pricing'
import { Shield, User } from 'lucide-react'

interface ModeToggleProps {
  mode: Mode
  onChange: (mode: Mode) => void
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  const [isAdmin] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.cookie.includes('admin_session=')
    }
    return false
  })

  useEffect(() => {
    const hasAdminCookie = typeof document !== 'undefined' && document.cookie.includes('admin_session=')
    const saved = localStorage.getItem('ean_pricing_mode') as Mode | null
    if (saved === 'staff' && !hasAdminCookie) {
      // Unauthenticated users cannot enable staff mode
      localStorage.setItem('ean_pricing_mode', 'client')
      onChange('client')
    } else if (saved === 'client' || (saved === 'staff' && hasAdminCookie)) {
      onChange(saved)
    }
  }, [onChange])

  const handleToggle = (newMode: Mode) => {
    if (newMode === 'staff' && !isAdmin) {
      // Prevent staff mode selection for non-admin
      return
    }
    localStorage.setItem('ean_pricing_mode', newMode)
    onChange(newMode)
  }

  return (
    <div className="inline-flex items-center bg-ean-navy-mid/80 backdrop-blur-md p-1 rounded-full border border-ean-gold/30">
      <button
        type="button"
        onClick={() => handleToggle('client')}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-ui font-medium transition-all duration-200 ${
          mode === 'client'
            ? 'bg-ean-gold text-white shadow-md'
            : 'text-ean-muted-light hover:text-white'
        }`}
      >
        <User className="w-3.5 h-3.5" />
        Client Mode
      </button>
      <button
        type="button"
        onClick={() => handleToggle('staff')}
        disabled={!isAdmin && mode !== 'staff'}
        title={!isAdmin ? 'Staff Mode requires Admin Login' : 'Switch to Staff Mode'}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-ui font-medium transition-all duration-200 ${
          mode === 'staff'
            ? 'bg-ean-gold text-white shadow-md'
            : !isAdmin
            ? 'text-ean-muted-light/40 cursor-not-allowed'
            : 'text-ean-muted-light hover:text-white'
        }`}
      >
        <Shield className="w-3.5 h-3.5" />
        Staff Mode
      </button>
    </div>
  )
}
