import { Card, CardContent } from "@/components/ui/card";

const contentTypes = [
  {
    icon: "📝",
    title: "Blog Posts",
    description: "In-depth articles that establish your expertise and rank on Google",
    details: "800-1500 words • SEO optimized • Authority building",
    bgColor: "bg-blue-500"
  },
  {
    icon: "📱",
    title: "Social Media",
    description: "Engaging content for Facebook, Instagram, and LinkedIn",
    details: "150-300 words • Mobile friendly • Shareable",
    bgColor: "bg-pink-500"
  },
  {
    icon: "📍",
    title: "Google Business Profile",
    description: "Local-focused posts that attract customers in your service area",
    details: "100-200 words • Local SEO • Customer attraction",
    bgColor: "bg-orange-500"
  }
];

export function ContentTypesSection() {
  return (
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
          {contentTypes.map((contentType, index) => (
            <Card key={index} className="p-6 text-center border-2 border-gray-200 hover:border-orange-400 transition-colors">
              <CardContent className="p-0">
                <div className={`w-16 h-16 ${contentType.bgColor} text-white rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-2xl">{contentType.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{contentType.title}</h3>
                <p className="text-gray-600 mb-4">{contentType.description}</p>
                <div className={`text-sm ${contentType.bgColor.replace('bg-', 'text-')} font-medium`}>
                  {contentType.details}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}