import { Navbar } from "./Navbar";
import { HeroSection } from "./HeroSection";
import { BenefitsSection } from "./BenefitsSection";
import { Features } from "./Features";
import { IntegrationsSection } from "./IntegrationsSection";
import { Pricing } from "./Pricing";
import { FAQ } from "./FAQ";
import { Footer } from "./Footer";
import { HeroSection as HowItWorksSection } from "./HowItWorks";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050818] text-white">
      <Navbar />
      <HeroSection />
      <BenefitsSection />
      <Features />
      <HowItWorksSection />
      <IntegrationsSection />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}
