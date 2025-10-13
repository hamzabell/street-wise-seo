import { checkoutAction } from '@/lib/payments/actions';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { SubmitButton } from './submit-button';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
  // Only fetch from Stripe if we have valid API keys
  const [prices, products] = await Promise.all([
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_dummy_key'
      ? getStripePrices().catch(() => [])
      : Promise.resolve([]),
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_dummy_key'
      ? getStripeProducts().catch(() => [])
      : Promise.resolve([]),
  ]);

  const freePlan = products.find((product) => product.name === 'Free');
  const proPlan = products.find((product) => product.name === 'Pro');

  const freePrice = prices.find((price) => price.productId === freePlan?.id);
  const proPrice = prices.find((price) => price.productId === proPlan?.id);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Start free and upgrade only when you need more topic generations. Perfect for local businesses.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <PricingCard
          name={freePlan?.name || 'Free'}
          price={0}
          interval="month"
          trialDays={0}
          features={[
            '5 SEO topics per month',
            'Local keyword analysis',
            'Competition insights',
            'Basic SEO metrics',
            'Email support',
          ]}
          priceId={freePrice?.id}
          icon={<Star className="h-8 w-8 text-blue-600" />}
          description="Perfect for getting started"
          highlighted={false}
        />
        <PricingCard
          name={proPlan?.name || 'Pro'}
          price={500}
          interval="month"
          trialDays={7}
          features={[
            'Unlimited SEO topics',
            'Advanced keyword analysis',
            'Competitor tracking',
            'Priority AI processing',
            'Export to CSV',
            'Priority support',
          ]}
          priceId={proPrice?.id}
          icon={<Crown className="h-8 w-8 text-orange-600" />}
          description="For serious local businesses"
          highlighted={true}
        />
      </div>

      {/* FAQ Section */}
      <div className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              What's the difference between Free and Pro?
            </h3>
            <p className="text-gray-600">
              Free users get 5 SEO topic generations per month with basic metrics. Pro users get unlimited topic generations,
              advanced keyword analysis, competitor tracking, and priority AI processing.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              Can I cancel anytime?
            </h3>
            <p className="text-gray-600">
              Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              Do I need SEO knowledge to use this?
            </h3>
            <p className="text-gray-600">
              No! Our tool is designed specifically for local business owners with no technical SEO knowledge. Just describe your business and get instant results.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function PricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
  priceId,
  icon,
  description,
  highlighted,
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  priceId?: string;
  icon: React.ReactNode;
  description: string;
  highlighted: boolean;
}) {
  return (
    <div className={`relative pt-8 rounded-2xl ${highlighted ? 'border-2 border-orange-600 bg-gradient-to-b from-orange-50 to-white' : 'border border-gray-200 bg-white'}`}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </div>
        </div>
      )}

      <div className="px-8">
        <div className="flex justify-center mb-4">
          {icon}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">{name}</h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          {description}
        </p>

        <div className="text-center mb-8">
          <div className="text-5xl font-bold text-gray-900">
            ${price / 100}
          </div>
          <div className="text-lg text-gray-600">
            per {interval}
          </div>
          {trialDays > 0 && (
            <div className="text-sm text-green-600 mt-2">
              {trialDays} day free trial included
            </div>
          )}
        </div>

        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${highlighted ? 'text-orange-600' : 'text-green-600'}`} />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <form action={checkoutAction} className="mb-8">
          <input type="hidden" name="priceId" value={priceId} />
          <SubmitButton highlighted={highlighted} />
        </form>
      </div>
    </div>
  );
}
