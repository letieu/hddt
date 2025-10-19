import { FeaturesSection } from "@/components/features-section";
import { HeroSection } from "@/components/hero-section";
import { PricingSection } from "@/components/pricing-section";
import TestimonialsSection from "@/components/testimonials-section";
import dynamic from "next/dynamic";

const AppSection = dynamic(() =>
  import("@/components/app-section").then((mod) => mod.AppSection),
);

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <AppSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
    </main>
  );
}
