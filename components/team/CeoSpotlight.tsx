'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Award, ShieldCheck, Crown, ChevronRight, Quote, Sparkles } from 'lucide-react';
import { TeamMember } from '@/lib/constants';
import TeamMemberModal from './TeamMemberModal';

interface CeoSpotlightProps {
  ceoMember: TeamMember;
}

export default function CeoSpotlight({ ceoMember }: CeoSpotlightProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="relative bg-gradient-to-b from-[#070103] via-[#2A050D] to-[#0D0204] py-16 sm:py-24 overflow-hidden border-b border-white/10">
        {/* Ambient Backlight Blur */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-128 h-128 rounded-full bg-ean-gold/10 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full bg-blue-950/40 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          {/* Eyebrow & Badge */}
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-ean-gold/10 text-ean-gold border border-ean-gold/30">
              <Crown className="w-3.5 h-3.5" />
              Executive Leadership Spotlight
            </span>
            <div className="h-px bg-linear-to-r from-ean-gold/40 to-transparent flex-1 max-w-xs" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* CEO Portrait Column */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-4/5 sm:aspect-square lg:aspect-4/5 rounded-xs overflow-hidden border border-ean-gold/30 shadow-2xl group bg-ean-navy-mid">
                {/* Decorative Frame Elements */}
                <div className="absolute inset-0 bg-linear-to-t from-ean-navy via-transparent to-transparent z-10 opacity-70 group-hover:opacity-50 transition-opacity duration-500" />
                <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-ean-navy/80 backdrop-blur-md rounded-xs border border-ean-gold/40 text-[10px] uppercase font-mono tracking-widest text-ean-gold">
                  Founder & CEO
                </div>

                <Image
                  src={ceoMember.image}
                  alt={ceoMember.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  quality={95}
                />

                {/* Bottom Overlay Info on Mobile */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-linear-to-t from-ean-navy via-ean-navy/80 to-transparent">
                  <div className="font-display text-2xl font-light text-white">
                    {ceoMember.name}
                  </div>
                  <div className="font-ui text-xs font-semibold text-ean-gold uppercase tracking-wider mt-1">
                    {ceoMember.role}
                  </div>
                </div>
              </div>

              {/* Decorative Accent Ring */}
              <div className="absolute -bottom-4 -right-4 w-full h-full border border-ean-gold/20 rounded-xs -z-10 pointer-events-none hidden sm:block" />
            </div>

            {/* CEO Executive Details Column */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-3">
                <span className="font-ui text-xs uppercase tracking-[0.3em] font-semibold text-ean-gold">
                  EAN Aviation Founder & Visionary
                </span>
                <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light text-white leading-tight">
                  {ceoMember.name}
                </h2>
                <p className="font-ui text-base sm:text-lg text-ean-gold/90 font-medium">
                  {ceoMember.role}
                </p>
              </div>

              {/* CEO Signature Quote Box */}
              {ceoMember.quote && (
                <div className="relative p-6 sm:p-8 bg-gradient-to-r from-white/15 via-white/[0.05] to-transparent border-l-4 border-ean-gold rounded-r-2xl backdrop-blur-md space-y-3 shadow-xl">
                  <Quote className="w-8 h-8 text-ean-gold/40 absolute top-4 right-4" />
                  <p className="font-display italic text-lg sm:text-xl text-white leading-relaxed relative z-10">
                    &ldquo;{ceoMember.quote}&rdquo;
                  </p>
                </div>
              )}

              {/* Bio Summary Excerpt */}
              <div className="space-y-4 font-ui text-sm sm:text-base text-ean-muted-light leading-relaxed">
                <p>{ceoMember.bio[0]}</p>
                <p>{ceoMember.bio[1]}</p>
              </div>

              {/* Executive Highlights Grid */}
              {ceoMember.highlights && (
                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-ean-border-dark/60">
                  {ceoMember.highlights.map((stat, sIdx) => (
                    <div key={sIdx} className="space-y-1">
                      <div className="font-display text-xl sm:text-2xl font-bold text-ean-gold">
                        {stat.value}
                      </div>
                      <div className="font-ui text-[10px] sm:text-xs uppercase tracking-wider text-ean-muted-light">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Credentials Badges & CTA */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {ceoMember.credentials.map((cred, cIdx) => (
                  <span
                    key={cIdx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ean-navy-mid border border-white/10 rounded-xs text-xs text-ean-muted-light font-ui"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-ean-gold" />
                    {cred}
                  </span>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-3 px-6 py-3.5 bg-linear-to-r from-ean-gold via-ean-gold-light to-ean-gold text-ean-navy font-ui text-xs font-semibold uppercase tracking-widest rounded-xs shadow-lg hover:shadow-ean-gold/20 hover:brightness-110 transition-all duration-300 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Read Full Executive Profile
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Drawer */}
      <TeamMemberModal
        member={ceoMember}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
