import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import TrustBar from "@/components/sections/TrustBar";
import AboutSection from "@/components/sections/AboutSection";
import ServicesSection from "@/components/sections/ServicesSection";
import CharterSection from "@/components/sections/CharterSection";
import VIPSection from "@/components/sections/VIPSection";
import PartnersStrip from "@/components/sections/PartnersStrip";
import ContactSection from "@/components/sections/ContactSection";

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
        <PartnersStrip />
        <ContactSection />
      </main>
    </>
  );
}

