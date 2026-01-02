import { Navbar } from "@/components/layout/navbar"
import { AnimatedHeroSection } from "@/components/sections/animated-hero-section"
import { SocialProofSection } from "@/components/sections/social-proof-section"
import { FeaturesGridSection } from "@/components/sections/features-grid-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { PricingSection } from "@/components/sections/pricing-section"
import { CtaSection } from "@/components/sections/cta-section"
import { Footer } from "@/components/layout/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <Navbar />
      <AnimatedHeroSection />
      <SocialProofSection />
      <FeaturesGridSection />
      <TestimonialsSection />
      <PricingSection />
      <CtaSection />
      <Footer />
    </main>
  )
}
