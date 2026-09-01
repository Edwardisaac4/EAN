'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { TeamMember } from '@/lib/constants';
import TeamMemberModal from './TeamMemberModal';

interface TeamDirectoryGridProps {
  members: TeamMember[];
}

export default function TeamDirectoryGrid({ members }: TeamDirectoryGridProps) {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  return (
    <>
      <section className="bg-linear-to-b from-ean-surface via-white to-ean-surface text-ean-text-light py-20 sm:py-24 relative border-b border-ean-border-light">
        <div className="max-w-ean mx-auto px-6 md:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
              Management Roster
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-ean-text-light leading-tight">
              Leadership & Department Directory
            </h2>
            <p className="font-ui text-base sm:text-lg text-ean-muted-light leading-relaxed">
              Explore the biographies and credentials of our department leaders shaping business flight in West Africa.
            </p>
          </div>

          {/* Directory Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.map((member) => (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="bg-ean-white border border-ean-border-light overflow-hidden shadow-xs hover:border-ean-blue/50 hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Card Image */}
                  <div className="relative w-full aspect-[4/3.8] bg-ean-navy overflow-hidden">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-top transition-transform duration-750 group-hover:scale-105"
                      quality={80}
                    />
                    {/* Services-Style Gradient Blur Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-ean-navy/65 via-ean-navy/20 to-transparent opacity-75 group-hover:opacity-55 transition-opacity duration-300" />
                    
                    {/* Top Department Badge - Glass */}
                    <div className="absolute top-3 left-3 px-3 py-1 bg-ean-navy/70 backdrop-blur-sm border border-ean-gold/30 font-mono text-[9px] text-ean-gold uppercase tracking-widest shadow-md">
                      {member.departmentLabel}
                    </div>

                    {/* Bottom Blur Overlay Strip */}
                    <div className="absolute bottom-2.5 left-3 right-3 px-3 py-2 bg-ean-navy/60 backdrop-blur-sm border border-ean-border-dark flex items-center justify-between shadow-lg opacity-95">
                      <span className="font-ui text-xs font-medium text-ean-text-light/90 truncate">{member.role}</span>
                      <span className="font-mono text-[9px] text-ean-gold font-bold uppercase tracking-wider shrink-0 ml-2">EAN</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-display text-xl font-semibold text-ean-text-light group-hover:text-ean-gold transition-colors">
                        {member.name}
                      </h3>
                      <p className="font-ui text-xs font-semibold uppercase tracking-wider text-ean-gold">
                        {member.role}
                      </p>
                    </div>

                    <p className="font-ui text-sm text-ean-muted-light line-clamp-3 leading-relaxed">
                      {member.bio[0]}
                    </p>

                    {/* Credentials Preview */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {member.credentials.slice(0, 2).map((cred, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-ean-surface border border-ean-border-light text-[10px] text-ean-muted-light font-ui"
                        >
                          {cred}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="px-6 py-4 bg-ean-surface/60 border-t border-ean-border-light/60 flex items-center justify-between group-hover:bg-ean-navy group-hover:text-ean-text-light transition-colors duration-300">
                  <span className="font-ui text-xs font-semibold uppercase tracking-wider text-ean-text-light group-hover:text-ean-gold transition-colors">
                    View Full Bio
                  </span>
                  <ChevronRight className="w-4 h-4 text-ean-gold group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
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
