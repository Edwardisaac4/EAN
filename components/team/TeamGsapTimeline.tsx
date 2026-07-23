'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles,
  Users
} from 'lucide-react';
import { TeamMember } from '@/lib/constants';
import TeamMemberModal from './TeamMemberModal';

interface TeamGsapTimelineProps {
  members: TeamMember[];
}

export default function TeamGsapTimeline({ members }: TeamGsapTimelineProps) {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [modalMember, setModalMember] = useState<TeamMember | null>(null);

  // References for GSAP timeline animations
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const roleRef = useRef<HTMLParagraphElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);
  const credsRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const activeMember = members[activeIdx] || members[0];

  // GSAP Timeline animation trigger on manager switch
  useGSAP(
    () => {
      if (!stageRef.current) return;

      // Create a master GSAP Timeline using official GSAP Timeline standards
      const tl = gsap.timeline({
        defaults: { duration: 0.5, ease: 'power3.out' },
      });

      // 1. Progress Bar animation corresponding to position
      const progressPercent = ((activeIdx + 1) / members.length) * 100;
      gsap.to(progressBarRef.current, {
        width: `${progressPercent}%`,
        duration: 0.6,
        ease: 'power2.out',
      });

      // 2. Add Label for timeline choreography
      tl.addLabel('start', 0);

      // 3. Stage content reveal sequence using position parameters
      tl.fromTo(
        imageRef.current,
        { opacity: 0, scale: 1.06, filter: 'blur(8px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.7 },
        'start'
      );

      tl.fromTo(
        nameRef.current,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.5 },
        '<0.1'
      );

      tl.fromTo(
        roleRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4 },
        '-=0.3'
      );

      if (quoteRef.current) {
        tl.fromTo(
          quoteRef.current,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.5 },
          '-=0.2'
        );
      }

      if (bioRef.current) {
        tl.fromTo(
          bioRef.current.children,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 },
          '-=0.3'
        );
      }

      if (credsRef.current) {
        tl.fromTo(
          credsRef.current.children,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.3, stagger: 0.05 },
          '-=0.2'
        );
      }
    },
    { dependencies: [activeIdx], scope: stageRef }
  );

  // Automatic continuous autoplay cycle through all 15 managers
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % members.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [members.length]);

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % members.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + members.length) % members.length);
  };

  return (
    <section id="gsap-team-timeline" className="bg-gradient-to-b from-[#2B050D] via-[#1A0307] to-[#2D060F] text-white py-20 sm:py-24 relative overflow-hidden border-b border-white/10">
      {/* Background Lighting Gradients */}
      <div className="absolute top-0 right-1/3 w-128 h-128 bg-ean-gold/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="space-y-3 max-w-2xl">
            <h2 className="font-display text-4xl sm:text-5xl font-light text-white leading-tight">
              Department Heads & Bios
            </h2>
            <p className="font-ui text-base text-ean-muted-light leading-relaxed">
              Discover our 15 department leaders steering EAN Aviation toward new frontiers of growth, safety, and operational excellence in West Africa.
            </p>
          </div>

          {/* Minimal Navigation Arrows */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrev}
              className="p-3 bg-ean-navy-mid border border-ean-border-dark hover:bg-ean-gold hover:text-ean-navy text-white rounded-xs transition-colors cursor-pointer"
              aria-label="Previous Department Leader"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-3 bg-ean-navy-mid border border-ean-border-dark hover:bg-ean-gold hover:text-ean-navy text-white rounded-xs transition-colors cursor-pointer"
              aria-label="Next Department Leader"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* GSAP Continuous Progress Line */}
        <div className="relative w-full h-1 bg-ean-navy-mid rounded-full overflow-hidden mb-10">
          <div
            ref={progressBarRef}
            className="h-full bg-linear-to-r from-ean-gold-dark via-ean-gold to-ean-gold-light w-0 transition-all duration-300"
          />
        </div>

        {/* GSAP Timeline Spotlight Stage */}
        <div
          ref={stageRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-ean-navy-mid/60 border border-ean-gold/20 p-8 sm:p-10 rounded-xs shadow-2xl relative"
        >
          {/* Active Manager Image */}
          <div className="lg:col-span-5 relative">
            <div
              ref={imageRef}
              className="relative aspect-4/5 rounded-xs overflow-hidden border border-ean-border-dark bg-ean-navy shadow-xl group"
            >
              <Image
                src={activeMember.image}
                alt={activeMember.name}
                fill
                sizes="(max-width: 1024px) 100vw, 35vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                quality={95}
              />
              <div className="absolute inset-0 bg-linear-to-t from-ean-navy via-transparent to-transparent opacity-60" />
              <div className="absolute top-4 left-4 px-3 py-1 bg-ean-navy/90 backdrop-blur-md rounded-xs border border-ean-gold/30 font-mono text-[10px] text-ean-gold uppercase tracking-widest">
                {activeMember.departmentLabel}
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-xs font-mono text-ean-muted-light uppercase tracking-wider">
                Leader {activeIdx + 1} of {members.length}
              </div>
            </div>
          </div>

          {/* Active Manager Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="font-ui text-xs font-semibold uppercase tracking-[0.25em] text-ean-gold">
                {activeMember.departmentLabel}
              </span>
              <h3
                ref={nameRef}
                className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-white"
              >
                {activeMember.name}
              </h3>
              <p
                ref={roleRef}
                className="font-ui text-base sm:text-lg font-medium text-ean-gold/90"
              >
                {activeMember.role}
              </p>
            </div>

            {/* Signature Quote */}
            {activeMember.quote && (
              <div
                ref={quoteRef}
                className="p-5 bg-ean-navy/70 border-l-2 border-ean-gold rounded-r-xs font-display italic text-sm sm:text-base text-ean-muted-light"
              >
                &ldquo;{activeMember.quote}&rdquo;
              </div>
            )}

            {/* Bio Paragraphs */}
            <div
              ref={bioRef}
              className="space-y-3 font-ui text-sm sm:text-base text-ean-muted-light leading-relaxed max-h-48 overflow-y-auto pr-2"
            >
              {activeMember.bio.map((para, pIdx) => (
                <p key={pIdx}>{para}</p>
              ))}
            </div>

            {/* Credentials Pills */}
            <div ref={credsRef} className="flex flex-wrap gap-2 pt-2">
              {activeMember.credentials.map((cred, cIdx) => (
                <span
                  key={cIdx}
                  className="px-3 py-1 bg-ean-navy border border-white/10 rounded-xs text-xs text-ean-muted-light font-ui flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-ean-gold" />
                  {cred}
                </span>
              ))}
            </div>

            {/* Action Row */}
            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={() => setModalMember(activeMember)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-ean-gold text-ean-navy font-ui text-xs font-semibold uppercase tracking-widest rounded-xs hover:bg-ean-gold-light transition-all cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                Read Full Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Drawer */}
      <TeamMemberModal
        member={modalMember}
        isOpen={Boolean(modalMember)}
        onClose={() => setModalMember(null)}
      />
    </section>
  );
}
