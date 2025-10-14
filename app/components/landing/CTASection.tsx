import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
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
  );
}