import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const freeFeatures = [
  "5 content ideas per month",
  "Choose your business type",
  "Mobile & voice optimized",
  "No credit card required"
];

const proFeatures = [
  "Unlimited content ideas",
  "All 8+ business industries",
  "Voice search optimization",
  "Local service area pages",
  "Seasonal content ideas",
  "Multiple content types",
  "Save unlimited topics"
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
          Simple Pricing for Local Businesses
        </h2>
        <p className="text-center text-gray-600 mb-16">
          No contracts, no hidden fees, just a tool that actually works for your business
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="p-8 border-2 border-gray-200">
            <CardContent className="p-0">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-gray-600 mb-6">Perfect for trying out the tool</p>
              <div className="text-4xl font-bold mb-6">
                $0<span className="text-lg text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/sign-up">Start Free</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="p-8 border-2 border-orange-600 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-orange-600 text-white">Most Popular</Badge>
            </div>
            <CardContent className="p-0">
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-gray-600 mb-6">Everything you need to attract customers</p>
              <div className="text-4xl font-bold mb-6">
                $5<span className="text-lg text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {proFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span><strong>{feature.split(' ')[0]}</strong> {feature.split(' ').slice(1).join(' ')}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-orange-600 hover:bg-orange-700" asChild>
                <Link href="/sign-up">Get Pro - $5/month</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            <strong>Save thousands vs SEO agencies</strong> • Typical agencies charge $500-2000/month for similar content planning
          </p>
        </div>
      </div>
    </section>
  );
}