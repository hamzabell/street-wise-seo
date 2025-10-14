import { Card, CardContent } from "@/components/ui/card";

const businessTypes = [
  { icon: "🔧", name: "Plumbing & HVAC", desc: "Emergency services, maintenance tips, seasonal topics" },
  { icon: "⚡", name: "Electrical Services", desc: "Safety guides, code updates, repair tutorials" },
  { icon: "🧹", name: "Cleaning Services", desc: "Residential, commercial, specialized cleaning" },
  { icon: "🏗️", name: "Contractors", desc: "Renovation, remodeling, custom projects" },
  { icon: "🌿", name: "Landscaping", desc: "Lawn care, hardscaping, seasonal maintenance" },
  { icon: "🎨", name: "Painting", desc: "Interior, exterior, prep work, color trends" },
  { icon: "🚗", name: "Auto Repair", desc: "Maintenance, diagnostics, seasonal services" },
  { icon: "🐜", name: "Pest Control", desc: "Prevention, treatment, seasonal pest issues" }
];

export function BusinessTypesSection() {
  return (
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
          {businessTypes.map((business, index) => (
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
  );
}