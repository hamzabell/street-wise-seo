import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navigation() {
  return (
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
  );
}