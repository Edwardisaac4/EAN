'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2,
  Building2,
  AlertCircle
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Authentication failed. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 500);
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError('Unable to communicate with the authentication server.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden bg-ean-black-pure text-ean-text-light font-ui">
      {/* Ambient Radial Glowing Background Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ean-gold/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Subtle Grid Backdrop Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#C4952A_1px,transparent_1px)] [background-size:24px_24px]" 
      />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-3 group transition-transform hover:scale-105">
            <div className="relative w-12 h-12 rounded-full border border-ean-gold/50 p-1.5 bg-ean-navy/40 flex items-center justify-center shadow-[0_0_25px_rgba(196,149,42,0.25)] group-hover:border-ean-gold transition-colors">
              <Image 
                src="/icon.png" 
                alt="EAN Executive Aviation" 
                width={36} 
                height={36} 
                className="object-contain"
              />
            </div>
            <div className="text-left">
              <span className="font-display text-2xl font-bold tracking-wider text-ean-white block leading-none">
                EAN <span className="text-ean-gold">Aero</span>
              </span>
              <span className="text-[10px] font-ui tracking-widest text-ean-gold-light/80 uppercase">
                Executive Aviation
              </span>
            </div>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-semibold text-ean-white tracking-wide">
              Lead Command Hub
            </h1>
            <p className="text-xs text-ean-muted-light mt-1">
              Sign in to manage executive inquiries, CRM leads & analytics
            </p>
          </div>
        </div>

        {/* Executive Login Card */}
        <div className="bg-ean-black/80 backdrop-blur-xl border border-ean-gold/30 shadow-[0_0_60px_rgba(0,0,0,0.85)] rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
          
          {/* Top Gold Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-ean-gold to-transparent opacity-80" />

          {/* Error Callout Banner */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ean-muted-light">
                Executive Email or ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ean-gold/70">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ean.aero"
                  className="w-full pl-10 pr-4 py-3 bg-ean-black-pure/70 border border-ean-border-dark focus:border-ean-gold focus:ring-1 focus:ring-ean-gold rounded-xl text-sm text-ean-white placeholder-ean-muted-light/40 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ean-muted-light">
                  Password / Access Code
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ean-gold/70">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access code"
                  className="w-full pl-10 pr-11 py-3 bg-ean-black-pure/70 border border-ean-border-dark focus:border-ean-gold focus:ring-1 focus:ring-ean-gold rounded-xl text-sm text-ean-white placeholder-ean-muted-light/40 transition-all outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ean-muted-light hover:text-ean-gold transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-ean-border-dark bg-ean-black-pure text-ean-gold focus:ring-ean-gold focus:ring-offset-0 cursor-pointer accent-[#C4952A]"
                />
                <span className="text-xs text-ean-muted-light hover:text-ean-white transition-colors">
                  Remember executive session
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(196,149,42,0.3)] cursor-pointer ${
                isSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-ean-gold hover:bg-ean-gold-light text-ean-black font-bold active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-ean-black border-t-transparent rounded-full animate-spin" />
                  <span>Validating Credentials...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Access Granted! Redirecting...</span>
                </>
              ) : (
                <>
                  <span>Access Command Hub</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Security Badges */}
        <div className="flex items-center justify-between text-[11px] text-ean-muted-light/60 px-2">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-ean-gold" />
            256-Bit Encrypted Portal
          </span>
          <Link href="/" className="hover:text-ean-gold transition-colors flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            Return to Live Site
          </Link>
        </div>
      </div>
    </div>
  );
}
