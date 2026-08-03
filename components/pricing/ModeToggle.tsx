'use client'

import React, { useEffect } from 'react'
import { Mode } from '@/types/pricing'
import { Shield, User } from 'lucide-react'

interface ModeToggleProps {
  mode: Mode
  onChange: (mode: Mode) => void
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  useEffect(() => {
    const saved = localStorage.getItem('ean_pricing_mode') as Mode | null
    if (saved === 'client' || saved === 'staff') {
      onChange(saved)
    }
  }, [onChange])

  const handleToggle = (newMode: Mode) => {
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
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-ui font-medium transition-all duration-200 ${
          mode === 'staff'
            ? 'bg-ean-gold text-white shadow-md'
            : 'text-ean-muted-light hover:text-white'
        }`}
      >
        <Shield className="w-3.5 h-3.5" />
        Staff Mode
      </button>
    </div>
  )
}
