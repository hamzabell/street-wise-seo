import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <img src="/logo.svg" alt="StreetWise SEO" className="h-8 w-auto" />
        <div className="flex gap-4">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700" asChild>
            <Link href="/sign-up">Get Started Free</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
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

      {/* Built For Local Businesses Section */}
      <section id="built-for-local" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built Specifically for Local Service Businesses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stop wasting time on complex SEO tools. Get content ideas that actually bring local customers to your door.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {[
              { icon: "🔧", name: "Plumbing & HVAC", desc: "Emergency services, maintenance tips, seasonal topics" },
              { icon: "⚡", name: "Electrical Services", desc: "Safety guides, code updates, repair tutorials" },
              { icon: "🧹", name: "Cleaning Services", desc: "Residential, commercial, specialized cleaning" },
              { icon: "🏗️", name: "Contractors", desc: "Renovation, remodeling, custom projects" },
              { icon: "🌿", name: "Landscaping", desc: "Lawn care, hardscaping, seasonal maintenance" },
              { icon: "🎨", name: "Painting", desc: "Interior, exterior, prep work, color trends" },
              { icon: "🚗", name: "Auto Repair", desc: "Maintenance, diagnostics, seasonal services" },
              { icon: "🐜", name: "Pest Control", desc: "Prevention, treatment, seasonal pest issues" }
            ].map((business, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow border-0">
                <CardContent className="p-0">
                  <div className="text-4xl mb-4">{business.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{business.name}</h3>
                  <p className="text-sm text-gray-600">{business.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            Everything You Need to Attract Local Customers
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Industry-Specific Content</h3>
                <p className="text-gray-600 mb-4">
                  Get topic ideas tailored to your specific service business.
                  We understand what local customers actually search for when they need your services.
                </p>
                <div className="text-sm text-gray-500">
                  <strong>Examples:</strong> "24/7 emergency plumber near me", "AC repair before summer", "electrical safety inspection"
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Mobile & Voice Search Optimized</h3>
                <p className="text-gray-600 mb-4">
                  All topics are optimized for how customers search on their phones and speak to smart assistants.
                  80% of local searches happen on mobile devices.
                </p>
                <div className="text-sm text-gray-500">
                  <strong>Optimized for:</strong> "Hey Google, find a reliable electrician", "Best HVAC service near me", voice queries
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🏠</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Service Area Pages</h3>
                <p className="text-gray-600 mb-4">
                  Generate location-specific content that helps you rank in the neighborhoods you actually serve.
                  Perfect for multi-location businesses or service areas.
                </p>
                <div className="text-sm text-gray-500">
                  <strong>Covers:</strong> Individual neighborhoods, zip codes, surrounding cities, service radius areas
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Generate Ideas in 2 Minutes</h3>
                <p className="text-gray-600 mb-4">
                  No technical knowledge required. Just pick your business type, enter your services, and get ready-to-use content ideas instantly.
                </p>
                <div className="text-sm text-gray-500">
                  <strong>Process:</strong> Select industry → Add your services → Get 10-15 targeted topics → Start creating content
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Multiple Content Types</h3>
                <p className="text-gray-600 mb-4">
                  Create different types of content for every platform. Blog posts, social media, Google Business Profile updates, and more.
                </p>
                <div className="text-sm text-gray-500">
                  <strong>Types:</strong> Blog posts (800-1500 words), Social media (150-300 words), GBP posts (100-200 words), Website pages
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Affordable for Small Business</h3>
                <p className="text-gray-600 mb-4">
                  Just $5/month for unlimited content ideas. Compare that to expensive SEO agencies that charge $500-2000/month for similar work.
                </p>
                <div className="text-sm text-gray-500">
                  <strong>Value:</strong> Save thousands on SEO costs • Generate unlimited ideas • Cancel anytime • Built for business owners
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Content Types Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Create Content for Every Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              One topic idea becomes multiple pieces of content. Reach customers wherever they search.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center border-2 border-gray-200 hover:border-orange-400 transition-colors">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-blue-500 text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Blog Posts</h3>
                <p className="text-gray-600 mb-4">
                  In-depth articles that establish your expertise and rank on Google
                </p>
                <div className="text-sm text-blue-600 font-medium">
                  800-1500 words • SEO optimized • Authority building
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 text-center border-2 border-gray-200 hover:border-orange-400 transition-colors">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-pink-500 text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Social Media</h3>
                <p className="text-gray-600 mb-4">
                  Engaging content for Facebook, Instagram, and LinkedIn
                </p>
                <div className="text-sm text-pink-600 font-medium">
                  150-300 words • Mobile friendly • Shareable
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 text-center border-2 border-gray-200 hover:border-orange-400 transition-colors">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-orange-500 text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📍</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Google Business Profile</h3>
                <p className="text-gray-600 mb-4">
                  Local-focused posts that attract customers in your service area
                </p>
                <div className="text-sm text-orange-600 font-medium">
                  100-200 words • Local SEO • Customer attraction
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            Get Content Ideas in 3 Simple Steps
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-lg mb-2">Select Your Business Type</h3>
              <p className="text-gray-600">
                Choose from 8+ local service industries or describe your business
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-lg mb-2">Get AI-Powered Ideas</h3>
              <p className="text-gray-600">
                Receive 10-15 content ideas that local customers actually search for
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-lg mb-2">Start Attracting Customers</h3>
              <p className="text-gray-600">
                Copy ideas and create content that brings local customers to your business
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
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
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>5 content ideas per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Choose your business type</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Mobile & voice optimized</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>No credit card required</span>
                  </li>
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
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span><strong>Unlimited content ideas</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span><strong>All 8+ business industries</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span><strong>Voice search optimization</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span><strong>Local service area pages</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span><strong>Seasonal content ideas</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span><strong>Multiple content types</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span><strong>Save unlimited topics</strong></span>
                  </li>
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

  
      {/* CTA Section */}
      <section className="py-20 px-6 bg-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Attract More Local Customers?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join hundreds of plumbers, electricians, and contractors who are getting more calls from local customers
          </p>
          <div className="flex justify-center mb-8">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-3" asChild>
              <Link href="/sign-up">Generate Your First Ideas - It's Free</Link>
            </Button>
          </div>
          <p className="text-orange-100">
            No credit card required • 5 free ideas monthly • Built for service businesses • Results in 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="StreetWise SEO" className="h-8 w-auto" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              AI-powered content ideas for local service businesses that want to attract more customers.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="text-orange-500">🍋</span>
              <span>Powered by LemonFox AI</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="md:col-span-1">
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#features" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm">
                  Get Started Free
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="md:col-span-1">
            <h3 className="text-white font-semibold mb-4">Get Started</h3>
            <div className="space-y-3">
              <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                <Link href="/sign-up">Start Free Trial</Link>
              </Button>
              <p className="text-xs text-gray-500 text-center">
                No credit card required • 5 free topics
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              &copy; 2024 StreetWise SEO. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>Built with ❤️ for local service businesses</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </div>
  );
}