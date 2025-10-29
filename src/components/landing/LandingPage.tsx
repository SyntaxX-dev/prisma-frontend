import { Navbar } from "./Navbar";
import { VideoHero } from "./VideoHero";
import { BenefitsSection } from "./BenefitsSection";
import { Features } from "./Features";
import { IntegrationsSection } from "./IntegrationsSection";
import { Pricing } from "./Pricing";
import { FAQ } from "./FAQ";
import { Footer } from "./Footer";
import { HeroSection } from "./HowItWorks";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050818] text-white">
      <Navbar />
      <VideoHero />
      <BenefitsSection />
      <Features />
      <HeroSection />
      <IntegrationsSection />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}
