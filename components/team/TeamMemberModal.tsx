'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Quote, Mail, Award, CheckCircle2, ChevronRight } from 'lucide-react';
import { TeamMember } from '@/lib/constants';

interface TeamMemberModalProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TeamMemberModal({ member, isOpen, onClose }: TeamMemberModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!member) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-xl backdrop-saturate-150 cursor-pointer"
          />

          {/* Modal Card Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl bg-gradient-to-b from-[#FFFFFF] via-[#FDFBFB] to-[#F7EEF0] border border-ean-gold/40 rounded-2xl md:rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col"
          >
            {/* Executive Close Button Header */}
            <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4.5 bg-gradient-to-r from-[#4A0D1A] via-[#641224] to-[#3B0913] border-b border-ean-gold/30 shadow-md">
              <div className="flex items-center gap-2 text-xs uppercase font-mono tracking-widest text-ean-gold">
                <ShieldCheck className="w-4 h-4 text-ean-gold" />
                <span>Executive Bio Profile</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                aria-label="Close bio profile"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* Member Portrait Column */}
                <div className="md:col-span-4 space-y-4">
                  <div className="relative aspect-4/5 rounded-xl overflow-hidden border border-ean-gold/30 shadow-lg bg-ean-navy">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 30vw"
                      className="object-cover object-top"
                      quality={95}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                  </div>

                  <div className="p-4 bg-white border border-ean-gold/25 rounded-xl shadow-xs space-y-1">
                    <div className="text-[10px] uppercase tracking-widest text-ean-gold font-bold">
                      Department
                    </div>
                    <div className="text-sm font-bold text-[#2A070E] font-ui">
                      {member.departmentLabel}
                    </div>
                  </div>
                </div>

                {/* Member Bio Information */}
                <div className="md:col-span-8 space-y-6">
                  <div>
                    <span className="font-ui text-xs font-bold uppercase tracking-[0.25em] text-ean-gold">
                      {member.departmentLabel}
                    </span>
                    <h2 className="font-display text-3xl sm:text-4xl font-light text-[#2A070E] mt-1">
                      {member.name}
                    </h2>
                    <p className="font-ui text-base text-[#4A0D1A] font-semibold mt-1">
                      {member.role}
                    </p>
                  </div>

                  {/* Signature Quote */}
                  {member.quote && (
                    <div className="p-5 bg-gradient-to-r from-ean-gold/15 via-white to-white border-l-4 border-ean-gold rounded-r-xl shadow-xs font-display italic text-sm sm:text-base text-[#2A070E] relative overflow-hidden">
                      <Quote className="w-6 h-6 text-ean-gold/30 absolute top-3 right-3" />
                      &ldquo;{member.quote}&rdquo;
                    </div>
                  )}

                  {/* Bio Paragraphs */}
                  <div className="space-y-4 font-ui text-sm sm:text-base text-slate-700 leading-relaxed">
                    {member.bio.map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Credentials & Qualifications Tags */}
                  <div className="space-y-3 pt-2">
                    <div className="text-xs uppercase font-mono tracking-widest text-ean-gold font-bold">
                      Qualifications & Credentials
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {member.credentials.map((cred, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-full font-ui text-xs font-medium shadow-xs hover:border-ean-gold/60 transition-colors"
                        >
                          {cred}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Metric Highlights Grid */}
                  {member.highlights && member.highlights.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                      {member.highlights.map((h, hIdx) => (
                        <div key={hIdx} className="bg-gradient-to-br from-white to-[#F9EEF1] p-4 rounded-xl border border-ean-gold/30 shadow-xs">
                          <div className="font-display text-2xl font-bold text-[#641224]">{h.value}</div>
                          <div className="font-ui text-[10px] uppercase tracking-wider text-slate-600 font-semibold">{h.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Action Strip */}
            <div className="px-6 py-4.5 bg-white border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-ui hidden sm:inline-block font-medium">
                EAN Aviation Executive Leadership
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-full text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-ean-gold via-ean-gold-light to-ean-gold text-ean-navy text-xs font-bold uppercase tracking-wider rounded-full hover:shadow-lg transition-all"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Contact Leadership
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
