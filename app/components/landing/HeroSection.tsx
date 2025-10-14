import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="py-20 px-6 text-center max-w-6xl mx-auto">
      <Badge className="mb-4 bg-orange-100 text-orange-800 border-orange-200">
        🍋 Powered by LemonFox AI
      </Badge>
      <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
        The Simple SEO Tool for
        <span className="text-orange-600"> Local Service Businesses</span>
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        Generate content ideas that local customers actually search for. Perfect for plumbers,
        electricians, HVAC techs, cleaners, and contractors who want to attract more local customers
        without complex SEO tools.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-3" asChild>
          <Link href="/sign-up">Start Free - Generate Ideas in 2 Minutes</Link>
        </Button>
        <Button size="lg" variant="outline" className="text-lg px-8 py-3" asChild>
          <Link href="#how-it-works">See How It Works</Link>
        </Button>
      </div>
      <p className="text-sm text-gray-500">
        No credit card required • 5 free ideas monthly • Built for service businesses • Voice-search optimized
      </p>
    </section>
  );
}