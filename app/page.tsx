import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { AppSection } from "@/components/app-section"
import { FeaturesSection } from "@/components/features-section"
import { PricingSection } from "@/components/pricing-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <AppSection />
        <FeaturesSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}
