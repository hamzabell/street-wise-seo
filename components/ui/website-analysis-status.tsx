'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Globe,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Search,
  TrendingUp,
  Clock,
  Info,
  BarChart3,
  Zap,
  Users
} from 'lucide-react';
import { useJobButtonState } from '@/lib/background/use-job-button-state';

interface WebsiteAnalysisStatus {
  hasPrimaryWebsite: boolean;
  primaryWebsiteUrl: string | null;
  hasBeenAnalyzed: boolean;
  lastAnalysisDate: Date | null;
  analysisCount: number;
}

interface WebsiteAnalysisStatusCardProps {
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
  showAnalysisButton?: boolean;
}

export function WebsiteAnalysisStatusCard({
  className = '',
  variant = 'default',
  showAnalysisButton = true
}: WebsiteAnalysisStatusCardProps) {
  const [status, setStatus] = useState<WebsiteAnalysisStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { getButtonProps, isJobRunning, currentJob } = useJobButtonState();

  useEffect(() => {
    fetchWebsiteStatus();
  }, []);

  const fetchWebsiteStatus = async () => {
    try {
      const response = await fetch('/api/user/website-status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching website status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return null;
  }

  const getAnalysisStatusIcon = () => {
    if (!status.hasPrimaryWebsite) {
      return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    }
    if (!status.hasBeenAnalyzed) {
      return <Clock className="h-5 w-5 text-blue-600" />;
    }
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

  const getAnalysisStatusText = () => {
    if (!status.hasPrimaryWebsite) {
      return 'Primary Website Required';
    }
    if (!status.hasBeenAnalyzed) {
      return 'Website Analysis Needed';
    }
    return 'Analysis Complete';
  };

  const getAnalysisStatusBadge = () => {
    if (!status.hasPrimaryWebsite) {
      return <Badge variant="outline" className="text-orange-600 border-orange-200">Setup Required</Badge>;
    }
    if (!status.hasBeenAnalyzed) {
      return <Badge variant="outline" className="text-blue-600 border-blue-200">Ready to Analyze</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Analyzed</Badge>;
  };

  const getPrimaryCTA = () => {
    if (!status.hasPrimaryWebsite) {
      return {
        text: 'Set Your Website URL',
        href: '/dashboard/security',
        description: 'Add your primary website URL to enable competitor analysis features'
      };
    }
    if (!status.hasBeenAnalyzed) {
      return {
        text: 'Analyze My Website',
        href: '/dashboard/security?action=analyze',
        description: 'Start with a comprehensive analysis of your website',
        jobType: 'website_crawl'
      };
    }
    return {
      text: 'View Analysis Results',
      href: '/dashboard/performance',
      description: 'Review your website analysis and insights'
    };
  };

  const primaryCTA = getPrimaryCTA();
  const analysisButtonProps = primaryCTA.jobType ? getButtonProps(primaryCTA.jobType) : {};
  const competitorButtonProps = getButtonProps('competitor_analysis');
  const reportButtonProps = getButtonProps('report_generation');

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {getAnalysisStatusIcon()}
        <span className="text-sm font-medium">{getAnalysisStatusText()}</span>
        {getAnalysisStatusBadge()}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getAnalysisStatusIcon()}
              <div>
                <p className="text-sm font-medium">{getAnalysisStatusText()}</p>
                {status.primaryWebsiteUrl && (
                  <p className="text-xs text-muted-foreground">{status.primaryWebsiteUrl}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getAnalysisStatusBadge()}
              <Button size="sm" asChild {...analysisButtonProps}>
                <Link href={primaryCTA.href}>
                  {primaryCTA.text}
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} border-l-4 ${
      !status.hasPrimaryWebsite ? 'border-l-orange-500' :
      !status.hasBeenAnalyzed ? 'border-l-blue-500' : 'border-l-green-500'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5" />
            Website Analysis Status
          </CardTitle>
          {getAnalysisStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          {getAnalysisStatusIcon()}
          <div className="flex-1">
            <p className="font-medium">{getAnalysisStatusText()}</p>
            <p className="text-sm text-muted-foreground">{primaryCTA.description}</p>
          </div>
        </div>

        {/* Website Information */}
        {status.hasPrimaryWebsite && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Primary Website:</span>
              <span className="font-medium">{status.primaryWebsiteUrl}</span>
            </div>

            {status.hasBeenAnalyzed && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Analysis:</span>
                  <span className="font-medium">
                    {status.lastAnalysisDate
                      ? new Date(status.lastAnalysisDate).toLocaleDateString()
                      : 'Never'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Analyses:</span>
                  <span className="font-medium">{status.analysisCount}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Why Analysis is Needed */}
        {!status.hasBeenAnalyzed && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Why analyze your website first?</strong> Competitor analysis works best when we understand your current content, keywords, and SEO performance. This helps us identify meaningful gaps and opportunities.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {showAnalysisButton && (
            <Button className="flex-1" asChild {...analysisButtonProps}>
              <Link href={primaryCTA.href}>
                <Zap className="mr-2 h-4 w-4" />
                {primaryCTA.text}
              </Link>
            </Button>
          )}

          {status.hasBeenAnalyzed && (
            <>
              <Button variant="outline" asChild {...competitorButtonProps}>
                <Link href="/dashboard/competitors">
                  <Users className="mr-2 h-4 w-4" />
                  Analyze Competitors
                </Link>
              </Button>
              <Button variant="outline" asChild {...reportButtonProps}>
                <Link href="/dashboard/reports">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generate Reports
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Job Status Indicator */}
        {isJobRunning && (
          <Alert className="bg-blue-50 border-blue-200">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Job in Progress:</strong> {currentJob?.type || 'Background task'} is currently running.
              {currentJob?.currentStep && ` Current step: ${currentJob.currentStep}`}
              {currentJob?.progress !== undefined && ` (${currentJob.progress}% complete)`}
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Setup Progress</span>
            <span>
              {!status.hasPrimaryWebsite ? '0%' :
               !status.hasBeenAnalyzed ? '50%' : '100%'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                !status.hasPrimaryWebsite ? 'w-0 bg-orange-500' :
                !status.hasBeenAnalyzed ? 'w-1/2 bg-blue-500' : 'w-full bg-green-500'
              }`}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              {status.hasPrimaryWebsite ? <CheckCircle className="h-3 w-3 text-green-600" /> : <div className="h-3 w-3 rounded-full border border-gray-300" />}
              Website URL
            </span>
            <span className="flex items-center gap-1">
              {status.hasBeenAnalyzed ? <CheckCircle className="h-3 w-3 text-green-600" /> : <div className="h-3 w-3 rounded-full border border-gray-300" />}
              Analysis Complete
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}