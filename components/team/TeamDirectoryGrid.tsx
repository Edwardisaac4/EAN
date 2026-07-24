'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
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
      <section className="bg-gradient-to-b from-[#FAF0F2] via-[#FDF6F7] to-[#F5E6E9] text-ean-text-dark py-20 sm:py-24 relative border-b border-ean-border-light">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
              Management Roster
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-medium text-ean-navy leading-tight">
              Leadership & Department Directory
            </h2>
            <p className="font-ui text-base sm:text-lg text-ean-muted-dark leading-relaxed">
              Explore the biographies and credentials of our department leaders shaping business flight in West Africa.
            </p>
          </div>

          {/* Directory Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.map((member) => (
              <motion.div
                key={member.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                onClick={() => setSelectedMember(member)}
                className="bg-ean-white border border-ean-border-light rounded-xs overflow-hidden shadow-xs hover:shadow-xl hover:border-ean-gold/40 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
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
                      quality={95}
                    />
                    {/* Services-Style Gradient Blur Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-ean-navy/90 via-ean-navy/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
                    
                    {/* Top Department Badge - Glass */}
                    <div className="absolute top-3 left-3 px-3 py-1 bg-ean-navy/80 backdrop-blur-md rounded-xs border border-ean-gold/30 font-mono text-[9px] text-ean-gold uppercase tracking-widest shadow-md">
                      {member.departmentLabel}
                    </div>

                    {/* Bottom Blur Overlay Strip */}
                    <div className="absolute bottom-2.5 left-3 right-3 px-3 py-2 bg-ean-navy/70 backdrop-blur-md border border-white/10 rounded-xs flex items-center justify-between shadow-lg opacity-95">
                      <span className="font-ui text-xs font-medium text-white/90 truncate">{member.role}</span>
                      <span className="font-mono text-[9px] text-ean-gold font-bold uppercase tracking-wider shrink-0 ml-2">EAN</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-display text-xl font-semibold text-ean-navy group-hover:text-ean-gold transition-colors">
                        {member.name}
                      </h3>
                      <p className="font-ui text-xs font-semibold uppercase tracking-wider text-ean-gold">
                        {member.role}
                      </p>
                    </div>

                    <p className="font-ui text-sm text-ean-muted-dark line-clamp-3 leading-relaxed">
                      {member.bio[0]}
                    </p>

                    {/* Credentials Preview */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {member.credentials.slice(0, 2).map((cred, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-ean-surface border border-ean-border-light text-[10px] text-ean-muted-dark rounded-xs font-ui"
                        >
                          {cred}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="px-6 py-4 bg-ean-surface/60 border-t border-ean-border-light/60 flex items-center justify-between group-hover:bg-ean-navy group-hover:text-white transition-colors duration-300">
                  <span className="font-ui text-xs font-semibold uppercase tracking-wider text-ean-navy group-hover:text-ean-gold transition-colors">
                    View Full Bio
                  </span>
                  <ChevronRight className="w-4 h-4 text-ean-gold group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
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
