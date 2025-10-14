import { Navigation } from "./components/landing/Navigation";
import { HeroSection } from "./components/landing/HeroSection";
import { BusinessTypesSection } from "./components/landing/BusinessTypesSection";
import { FeaturesSection } from "./components/landing/FeaturesSection";
import { ContentTypesSection } from "./components/landing/ContentTypesSection";
import { HowItWorksSection } from "./components/landing/HowItWorksSection";
import { PricingSection } from "./components/landing/PricingSection";
import { CTASection } from "./components/landing/CTASection";
import { Footer } from "./components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <BusinessTypesSection />
      <FeaturesSection />
      <ContentTypesSection />
      <HowItWorksSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}