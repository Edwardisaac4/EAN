'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { TeamMember } from '@/lib/constants';
import SectionReveal from '@/components/shared/SectionReveal';
import TeamMemberModal from './TeamMemberModal';

interface TeamDirectoryGridProps {
  members: TeamMember[];
}

export default function TeamDirectoryGrid({ members }: TeamDirectoryGridProps) {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  return (
    <>
      <section className="bg-ean-navy-mid text-ean-text-light py-20 sm:py-24 relative border-b border-ean-border-dark">
        <div className="max-w-ean mx-auto px-6 md:px-8">
          {/* Section Header */}
          <SectionReveal className="text-center max-w-3xl mx-auto mb-16 space-y-4" stagger={0.1} distance={40} duration={1}>
            <span data-reveal className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
              Management Roster
            </span>
            <h2 data-reveal className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-ean-text-light leading-tight">
              Leadership & Department Directory
            </h2>
            <p data-reveal className="font-ui text-base sm:text-lg text-ean-muted-light leading-relaxed">
              Explore the biographies and credentials of our department leaders shaping business flight in West Africa.
            </p>
          </SectionReveal>

          {/* Directory Cards Grid — one trigger, diagonal sweep. Per-card
              SectionReveals put every card in a row on the same trigger line,
              so a row landed at once rather than sequencing. */}
          <SectionReveal
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            stagger={0.06}
            grid
          >
            {members.map((member) => (
              <div key={member.id} data-reveal className="h-full">
                <div
                  onClick={() => setSelectedMember(member)}
                  className="relative h-[480px] sm:h-[520px] lg:h-[550px] w-full overflow-hidden border border-ean-border-dark bg-ean-obsidian group cursor-pointer flex flex-col justify-between transition-all duration-500 hover:border-blue-500/80 hover:shadow-[0_20px_45px_rgba(43,0,152,0.45)]"
                >
                  {/* Photo Background representing the Team Member */}
                  <Image
                    src={member.image}
                    alt={`${member.name} - EAN Aviation`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                    quality={85}
                  />

                  {/* Base Luminous Vignette Overlay - lightened so portraits remain bright & clear */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent z-10 transition-opacity duration-500" />

                  {/* Refined Royal Blue Luxury Backdrop on Hover */}
                  <div className="absolute inset-0 bg-[#080d28]/65 opacity-0 group-hover:opacity-100 backdrop-blur-[1.5px] transition-opacity duration-500 z-10" />

                  {/* Subtle Ambient Radial Glow on Hover */}
                  <div className="absolute inset-0 bg-radial-at-t from-[#2b0098]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none" />

                  {/* Card Top: Minimal Glowing Accent */}
                  <div className="relative z-20 p-6 sm:p-7 flex items-center justify-end">
                    <div className="w-2 h-2 rounded-full bg-white/30 group-hover:bg-blue-400 group-hover:shadow-[0_0_10px_#4a1fd0] transition-all duration-300" />
                  </div>

                    {/* Card Bottom: Member Name, Role, Hairline, Desktop Hover Write-Up & View Full Bio CTA */}
                    <div className="relative z-20 mt-auto p-6 sm:p-7 space-y-2.5">
                      <span className="font-ui text-[11px] font-semibold tracking-[0.25em] text-blue-300 uppercase block">
                        {member.role}
                      </span>

                      <h3 className="font-display text-2xl sm:text-2xl lg:text-[25px] font-light text-white leading-tight group-hover:text-blue-100 transition-colors duration-300">
                        {member.name}
                      </h3>

                      {/* Interactive Expanding Blue Accent Hairline */}
                      <div className="w-8 h-[2px] bg-blue-400 transition-all duration-500 ease-out group-hover:w-full group-hover:bg-blue-300 group-hover:shadow-[0_0_8px_rgba(96,165,250,0.6)]" />

                      {/* Desktop Hover Write-Up: Only expands on sm:hover */}
                      <div className="hidden sm:grid sm:grid-rows-[0fr] sm:group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
                        <div className="overflow-hidden space-y-3">
                          <p className="font-ui text-sm text-white/90 leading-relaxed pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-3">
                            {member.bio[0]}
                          </p>

                          {/* Credentials Badges */}
                          <div className="flex flex-wrap gap-1.5 pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-150">
                            {member.credentials.slice(0, 2).map((cred, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 bg-white/10 border border-white/20 text-[10px] text-white/90 font-ui backdrop-blur-xs"
                              >
                                {cred}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* View Full Bio Action Link / CTA */}
                      <div className="pt-2 flex items-center justify-between text-blue-300 group-hover:text-blue-200 font-ui text-xs font-bold uppercase tracking-widest border-t border-white/15">
                        <span className="flex items-center gap-1.5">View Full Bio</span>
                        <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300 text-blue-300" />
                      </div>
                    </div>
                </div>
              </div>
            ))}
          </SectionReveal>
        </div>
      </section>

      {/* Bio Modal */}
      <TeamMemberModal
        member={selectedMember}
        isOpen={Boolean(selectedMember)}
        onClose={() => setSelectedMember(null)}
      />
    </>
  );
}
