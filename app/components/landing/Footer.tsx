import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
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
  );
}