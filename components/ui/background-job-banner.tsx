'use client';

import { useJobState } from '@/lib/background/job-state';
import { RefreshCw } from 'lucide-react';

export function BackgroundJobIndicator() {
  const { currentJob, isJobRunning, jobProgress, jobType } = useJobState();

  // Don't render if no active job
  if (!currentJob || !isJobRunning) {
    return null;
  }

  const getJobTypeDisplayName = (type: string): string => {
    const displayNames: Record<string, string> = {
      'website_crawl': 'Website Analysis',
      'competitor_analysis': 'Competitor Analysis',
      'performance_analysis': 'Performance Analysis',
      'content_performance_tracking': 'Content Performance',
      'serp_tracking': 'SERP Tracking',
      'report_generation': 'Report Generation',
    };
    return displayNames[type] || type;
  };

  return (
    <div className="bg-blue-600 text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-sm">
      <RefreshCw className="h-3 w-3 animate-spin" />
      <span className="font-medium truncate max-w-[120px]">
        {getJobTypeDisplayName(currentJob.type || 'Background Job')}
      </span>
      <span className="text-xs bg-blue-700 px-2 py-0.5 rounded-full">
        {jobProgress}%
      </span>
    </div>
  );
}