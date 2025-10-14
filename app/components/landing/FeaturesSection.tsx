import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: "🎯",
    title: "Industry-Specific Content",
    description: "Get topic ideas tailored to your specific service business. We understand what local customers actually search for when they need your services.",
    examples: "Examples: \"24/7 emergency plumber near me\", \"AC repair before summer\", \"electrical safety inspection\""
  },
  {
    icon: "📱",
    title: "Mobile & Voice Search Optimized",
    description: "All topics are optimized for how customers search on their phones and speak to smart assistants. 80% of local searches happen on mobile devices.",
    examples: "Optimized for: \"Hey Google, find a reliable electrician\", \"Best HVAC service near me\", voice queries"
  },
  {
    icon: "🏠",
    title: "Service Area Pages",
    description: "Generate location-specific content that helps you rank in the neighborhoods you actually serve. Perfect for multi-location businesses or service areas.",
    examples: "Covers: Individual neighborhoods, zip codes, surrounding cities, service radius areas"
  },
  {
    icon: "⚡",
    title: "Generate Ideas in 2 Minutes",
    description: "No technical knowledge required. Just pick your business type, enter your services, and get ready-to-use content ideas instantly.",
    examples: "Process: Select industry → Add your services → Get 10-15 targeted topics → Start creating content"
  },
  {
    icon: "📄",
    title: "Multiple Content Types",
    description: "Create different types of content for every platform. Blog posts, social media, Google Business Profile updates, and more.",
    examples: "Types: Blog posts (800-1500 words), Social media (150-300 words), GBP posts (100-200 words), Website pages"
  },
  {
    icon: "💰",
    title: "Affordable for Small Business",
    description: "Just $5/month for unlimited content ideas. Compare that to expensive SEO agencies that charge $500-2000/month for similar work.",
    examples: "Value: Save thousands on SEO costs • Generate unlimited ideas • Cancel anytime • Built for business owners"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
          Everything You Need to Attract Local Customers
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="text-sm text-gray-500">
                  <strong>{feature.examples.split(':')[0]}:</strong> {feature.examples.split(':')[1]}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}