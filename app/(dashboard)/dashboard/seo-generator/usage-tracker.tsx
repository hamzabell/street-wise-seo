'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MetricsGrid } from '@/components/ui/metrics-badge';
import {
  Zap,
  TrendingUp,
  Calendar,
  Users,
  Crown,
  Rocket,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { USAGE_LIMITS } from '@/lib/seo/utils';

interface UsageTrackerProps {
  usageStats: {
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
  };
  userPlan?: 'FREE' | 'PRO' | 'ENTERPRISE';
  onUpgrade?: () => void;
  showDetails?: boolean;
  className?: string;
}

export function UsageTracker({
  usageStats,
  userPlan = 'FREE',
  onUpgrade,
  showDetails = false,
  className,
}: UsageTrackerProps) {
  const [showMonthly, setShowMonthly] = useState(false);
  const limits = USAGE_LIMITS[userPlan];

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 70) return 'text-orange-600 bg-orange-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const isNearLimit = usageStats.daily.percentage >= 80;
  const isAtLimit = usageStats.daily.remaining === 0;

  const currentPeriod = showMonthly ? usageStats.monthly : usageStats.daily;
  const periodLabel = showMonthly ? 'This Month' : 'Today';

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Usage Tracking
            </CardTitle>
            <CardDescription>
              Monitor your SEO topic generation and usage limits
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={userPlan === 'FREE' ? 'secondary' : 'default'} className="gap-1">
              {userPlan === 'FREE' && <Users className="h-3 w-3" />}
              {userPlan === 'PRO' && <Crown className="h-3 w-3" />}
              {userPlan === 'ENTERPRISE' && <Rocket className="h-3 w-3" />}
              {userPlan}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Usage Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{periodLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUsageColor(currentPeriod.percentage)}`}>
                {currentPeriod.remaining}/{currentPeriod.limit}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Progress
                value={Math.min(currentPeriod.percentage, 100)}
                className="h-2"
              />
              <div
                className="absolute top-0 left-0 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(currentPeriod.percentage, 100)}%`,
                  backgroundColor: currentPeriod.percentage >= 90 ? '#ef4444' :
                                   currentPeriod.percentage >= 70 ? '#f97316' :
                                   currentPeriod.percentage >= 50 ? '#eab308' : '#22c55e'
                }}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{currentPeriod.generations} generations</span>
              <span>{currentPeriod.percentage}% used</span>
            </div>
          </div>

          {/* Toggle Period */}
          <div className="flex gap-2">
            <Button
              variant={!showMonthly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowMonthly(false)}
            >
              Daily
            </Button>
            <Button
              variant={showMonthly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowMonthly(true)}
            >
              Monthly
            </Button>
          </div>
        </div>

        {/* Status Messages */}
        {isAtLimit && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">
                You've reached your {showMonthly ? 'monthly' : 'daily'} limit
              </p>
              <p className="text-xs text-red-600">
                Upgrade to Pro for unlimited generations
              </p>
            </div>
          </div>
        )}

        {isNearLimit && !isAtLimit && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">
                Running low on generations
              </p>
              <p className="text-xs text-orange-600">
                {currentPeriod.remaining} remaining for {showMonthly ? 'this month' : 'today'}
              </p>
            </div>
          </div>
        )}

        {!isNearLimit && !isAtLimit && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                Plenty of generations available
              </p>
              <p className="text-xs text-green-600">
                {currentPeriod.remaining} remaining for {showMonthly ? 'this month' : 'today'}
              </p>
            </div>
          </div>
        )}

        {/* Detailed Stats */}
        {showDetails && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-sm">Detailed Statistics</h4>

            <MetricsGrid
              metrics={[
                {
                  type: 'volume',
                  value: currentPeriod.generations,
                  label: 'Generations',
                },
                {
                  type: 'trend',
                  value: currentPeriod.saves,
                  label: 'Saved Topics',
                },
                {
                  type: 'score',
                  value: usageStats.savedTopics.count,
                  label: 'Total Saved',
                },
              ]}
              columns={3}
              variant="compact"
            />

            {/* Limits Overview */}
            <div className="space-y-2 pt-4 border-t">
              <h4 className="font-medium text-sm">Plan Limits</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Generations</span>
                  <span className="font-medium">
                    {limits.dailyGenerations === -1 ? 'Unlimited' : limits.dailyGenerations}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Generations</span>
                  <span className="font-medium">
                    {limits.monthlyGenerations === -1 ? 'Unlimited' : limits.monthlyGenerations}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saved Topics</span>
                  <span className="font-medium">
                    {limits.savedTopics === -1 ? 'Unlimited' : limits.savedTopics}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Topics/Generation</span>
                  <span className="font-medium">{limits.maxTopicsPerGeneration}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade CTA */}
        {userPlan === 'FREE' && onUpgrade && (
          <div className="pt-4 border-t">
            <Button
              onClick={onUpgrade}
              className="w-full"
              size="lg"
            >
              <Crown className="mr-2 h-4 w-4" />
              Upgrade to Pro
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Get unlimited generations and advanced features
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface UsageCompactProps {
  usageStats: {
    daily: { remaining: number; limit: number; percentage: number };
    monthly: { remaining: number; limit: number; percentage: number };
  };
  userPlan?: 'FREE' | 'PRO' | 'ENTERPRISE';
  className?: string;
}

export function UsageCompact({ usageStats, userPlan = 'FREE', className }: UsageCompactProps) {
  const isNearLimit = usageStats.daily.percentage >= 80;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-muted">
        <Zap className="h-3 w-3" />
        <span>{usageStats.daily.remaining}/{usageStats.daily.limit}</span>
      </div>

      {isNearLimit && (
        <Badge variant="destructive" className="text-xs">
          Low
        </Badge>
      )}

      <Badge variant="outline" className="text-xs">
        {userPlan}
      </Badge>
    </div>
  );
}