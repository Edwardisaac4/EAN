import dynamic from 'next/dynamic';
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import TrustBar from "@/components/sections/TrustBar";

// Code-split below-the-fold client sections to optimize Total Blocking Time (TBT < 150ms)
const AboutSection = dynamic(() => import("@/components/sections/AboutSection"));
const ServicesSection = dynamic(() => import("@/components/sections/ServicesSection"));
const VIPSection = dynamic(() => import("@/components/sections/VIPSection"));
const CharterSection = dynamic(() => import("@/components/sections/CharterSection"));
const PricingSection = dynamic(() => import("@/components/sections/PricingSection"));
const PartnersStrip = dynamic(() => import("@/components/sections/PartnersStrip"));
const ContactSection = dynamic(() => import("@/components/sections/ContactSection"));

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <HeroSection />
        <TrustBar />
        <AboutSection />
        <ServicesSection />
        <VIPSection />
        <CharterSection />
        <PricingSection />
        <PartnersStrip />
        <ContactSection />
      </main>
    </>
  );
}
