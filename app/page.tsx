import { HeroSection } from "@/components/hero-section";
import { AppSection } from "@/components/app-section";
import { FeaturesSection } from "@/components/features-section";
import { PricingSection } from "@/components/pricing-section";
import TestimonialsSection from "@/components/testimonials-section";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <AppSection className="bg-background-alt" />
      <FeaturesSection />
      <TestimonialsSection className="bg-background-alt" />
      <PricingSection />
    </main>
  );
}
