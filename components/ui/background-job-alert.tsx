'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Activity,
  X,
  ExternalLink,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useJobState } from '@/lib/background/job-state';

export function BackgroundJobAlert() {
  const { currentJob, isJobRunning, jobProgress, jobType, jobStep } = useJobState();
  const [isVisible, setIsVisible] = useState(true);

  const getJobTypeDisplayName = (type: string): string => {
    const displayNames: Record<string, string> = {
      'website_crawl': 'Website Crawl',
      'performance_analysis': 'Performance Analysis',
      'competitor_monitoring': 'Competitor Monitoring',
      'content_performance_tracking': 'Content Performance',
      'serp_tracking': 'SERP Tracking',
    };
    return displayNames[type] || type;
  };

  const getJobStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getJobStatusColor = (status: string): string => {
    switch (status) {
      case 'running':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'completed':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'failed':
        return 'border-red-200 bg-red-50 text-red-800';
      default:
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
    }
  };

  // Don't render anything if there's no active job or it's hidden
  if (!isVisible || !currentJob || !isJobRunning) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-40 w-80">
      <Alert className={`border shadow-lg ${getJobStatusColor(currentJob.status || 'running')}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 flex-1">
            <Activity className="h-4 w-4 mt-0.5" />
            <div className="flex-1 min-w-0">
              <AlertDescription className="text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">
                    {getJobTypeDisplayName(currentJob.type || 'Background Job')}
                  </span>
                  <div className="flex items-center gap-1">
                    {getJobStatusIcon(currentJob.status || 'running')}
                    <span className="text-xs font-medium">
                      {currentJob.status || 'running'}
                    </span>
                  </div>
                </div>

                {jobStep && (
                  <p className="text-xs mb-2">{jobStep}</p>
                )}

                {typeof jobProgress === 'number' && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{jobProgress}%</span>
                    </div>
                    <Progress value={jobProgress} className="h-1" />
                  </div>
                )}

                {currentJob.error && (
                  <div className="flex items-start gap-1 text-xs mt-2">
                    <AlertCircle className="h-3 w-3 mt-0.5" />
                    <span className="text-red-700">{currentJob.error}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.href = '/dashboard?tab=jobs'}
                    className="h-7 text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </AlertDescription>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0 ml-2"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </Alert>
    </div>
  );
}