const steps = [
  {
    number: 1,
    title: "Select Your Business Type",
    description: "Choose from 8+ local service industries or describe your business"
  },
  {
    number: 2,
    title: "Get AI-Powered Ideas",
    description: "Receive 10-15 content ideas that local customers actually search for"
  },
  {
    number: 3,
    title: "Start Attracting Customers",
    description: "Copy ideas and create content that brings local customers to your business"
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
          Get Content Ideas in 3 Simple Steps
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {step.number}
              </div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}