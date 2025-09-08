import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { AppSection } from "@/components/app-section"
import { FeaturesSection } from "@/components/features-section"
import { PricingSection } from "@/components/pricing-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
        <HeroSection />
        <AppSection />
        <FeaturesSection />
        <PricingSection />
    </main>
  )
}
