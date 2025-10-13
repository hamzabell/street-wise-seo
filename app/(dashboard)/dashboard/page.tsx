'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { customerPortalAction } from '@/lib/payments/actions';
import { User } from '@/lib/db/schema';
import useSWR from 'swr';
import { Suspense } from 'react';
import {
  Wand2,
  BarChart3,
  ArrowRight,
  Star,
  Zap,
  Globe,
  Search,
  PenTool,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { WebsiteAnalysisStatusCard } from '@/components/ui/website-analysis-status';
import { isFeatureEnabled } from '@/lib/utils';

interface UserWithSubscription extends User {
  subscriptionStatus: string | null;
  planName: string | null;
  stripeCustomerId: string | null;
}

type ActionState = {
  error?: string;
  success?: string;
};

interface UsageStats {
  daily: {
    generations: number;
    saves: number;
    total: number;
    limit: number;
    percentage: number;
    remaining: number;
  };
  monthly: {
    generations: number;
    saves: number;
    total: number;
    limit: number;
    percentage: number;
    remaining: number;
  };
  savedTopics: {
    count: number;
    limit: number;
    percentage: number;
    remaining: number;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SetupWizardBanner() {
  // Hide setup wizard banner - always return null
  return null;
}

function QuickStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 touch-manipulation active:scale-[0.98] transition-transform">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Local Focus</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-900">100%</p>
              <p className="text-blue-700 text-xs sm:text-sm">Tailored for your area</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-200 rounded-full hidden sm:block">
              <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 touch-manipulation active:scale-[0.98] transition-transform">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">AI Powered</p>
              <p className="text-xl sm:text-2xl font-bold text-green-900">24/7</p>
              <p className="text-green-700 text-xs sm:text-sm">Instant topic ideas</p>
            </div>
            <div className="p-2 sm:p-3 bg-green-200 rounded-full hidden sm:block">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 touch-manipulation active:scale-[0.98] transition-transform">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">SEO Optimized</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-900">Proven</p>
              <p className="text-purple-700 text-xs sm:text-sm">Rank higher results</p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-200 rounded-full hidden sm:block">
              <Search className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UsageSkeleton() {
  return (
    <Card className="mb-8 h-[200px]">
      <CardHeader>
        <CardTitle>Usage Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </CardContent>
    </Card>
  );
}

function UsageOverview() {
  const { data: usageData, error } = useSWR<{ data: { usage: UsageStats } }>('/api/seo/usage', fetcher);

  if (error || !usageData?.data?.usage) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Start generating topics to see your usage statistics.</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/seo-generator">
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Your First Topics
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { usage } = usageData.data;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Usage Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Monthly Usage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Monthly Generations</span>
              <span className="text-sm text-muted-foreground">
                {usage.monthly.generations} / {usage.monthly.limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(usage.monthly.percentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {usage.monthly.remaining} generations remaining this month
            </p>
          </div>

          {/* Saved Topics */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Saved Topics</span>
              <span className="text-sm text-muted-foreground">
                {usage.savedTopics.count} / {usage.savedTopics.limit || '∞'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(usage.savedTopics.percentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {usage.savedTopics.remaining || 'Unlimited'} topics you can save
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  const { data: user } = useSWR<UserWithSubscription>('/api/user', fetcher);
  const isPaid = user?.subscriptionStatus === 'active';

  return (
    <Card className="mb-6 sm:mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          <Button className="h-auto p-4 sm:p-6 flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4 touch-manipulation active:scale-[0.98] transition-transform" asChild>
            <Link href="/dashboard/seo-generator">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Wand2 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-base sm:text-lg">Generate Topics</h3>
                  <p className="text-sm text-muted-foreground">Create SEO-optimized topics</p>
                </div>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 mt-1 sm:mt-0" />
            </Link>
          </Button>

          <Button className="h-auto p-4 sm:p-6 flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4 touch-manipulation active:scale-[0.98] transition-transform bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" asChild>
            <Link href="/dashboard/content-generator">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PenTool className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-base sm:text-lg text-white">Generate Content</h3>
                  <p className="text-sm text-white/90">Create AI-powered content</p>
                </div>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 mt-1 sm:mt-0 text-white" />
            </Link>
          </Button>

          <Button variant="outline" className="h-auto p-4 sm:p-6 flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4 touch-manipulation active:scale-[0.98] transition-transform" asChild>
            <Link href="/dashboard/saved-topics">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-base sm:text-lg">Saved Topics</h3>
                  <p className="text-sm text-muted-foreground">Browse your topic library</p>
                </div>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 mt-1 sm:mt-0" />
            </Link>
          </Button>

          <Button variant="outline" className="h-auto p-4 sm:p-6 flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4 touch-manipulation active:scale-[0.98] transition-transform" asChild>
            <Link href="/dashboard/content-library">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-base sm:text-lg">Content Library</h3>
                  <p className="text-sm text-muted-foreground">Manage generated content</p>
                </div>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 mt-1 sm:mt-0" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function UpgradePrompt() {
  const { data: user } = useSWR<UserWithSubscription>('/api/user', fetcher);
  const isPaid = user?.subscriptionStatus === 'active';

  if (isPaid) {
    return null;
  }

  return (
    <Card className="mb-8 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-200 rounded-full">
              <Star className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-900">Upgrade to Pro</h3>
              <p className="text-sm text-orange-700">
                Get unlimited topic generations and advanced features for just $5/month
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-orange-600 text-white">Most Popular</Badge>
            <form action={customerPortalAction}>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                Upgrade Now
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Setup Wizard Banner */}
        <Suspense fallback={null}>
          <SetupWizardBanner />
        </Suspense>

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to StreetWise SEO
            </h1>
            <p className="text-lg text-muted-foreground">
              Generate AI-powered SEO topics that help your local business rank higher in search results
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStats />

        {/* Usage Overview */}
        <Suspense fallback={<UsageSkeleton />}>
          <UsageOverview />
        </Suspense>

        {/* Quick Actions */}
        <QuickActions />

        {/* Upgrade Prompt for Free Users */}
        <Suspense fallback={null}>
          <UpgradePrompt />
        </Suspense>
      </div>
    </section>
  );
}
