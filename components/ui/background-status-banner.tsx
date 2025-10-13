'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  ExternalLink,
  Bell,
  BellOff,
} from 'lucide-react';

interface BackgroundJob {
  id: number;
  type: string;
  status: string;
  progress: number;
  currentStep: string | null;
  createdAt: string;
  startedAt: string | null;
  error: string | null;
}

interface JobNotification {
  id: number;
  jobId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl: string | null;
  actionText: string | null;
  createdAt: string;
  autoDismiss: boolean;
}

interface BackgroundStatusBannerProps {
  className?: string;
  compact?: boolean;
  debugMode?: boolean;
  forceShow?: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function BackgroundStatusBanner({
  className = '',
  compact = false,
  debugMode = false,
  forceShow = false
}: BackgroundStatusBannerProps) {
  const [activeJobs, setActiveJobs] = useState<BackgroundJob[]>([]);
  const [notifications, setNotifications] = useState<JobNotification[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Poll for updates every 3 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch active jobs
        const jobsResponse = await fetch('/api/jobs?activeOnly=true');
        let jobsData = { data: { jobs: [] } };

        if (jobsResponse.ok) {
          jobsData = await jobsResponse.json();
          setActiveJobs(jobsData.data?.jobs || []);
          setIsAuthenticated(true);
        } else if (jobsResponse.status === 401) {
          setIsAuthenticated(false);
          if (debugMode) {
            setError('Authentication required');
          }
        } else {
          throw new Error(`Jobs API returned ${jobsResponse.status}`);
        }

        // Fetch notifications
        const notifsResponse = await fetch('/api/jobs/notifications?unreadOnly=true&limit=5');
        let notifsData = { data: { notifications: [], unreadCount: 0 } };

        if (notifsResponse.ok) {
          notifsData = await notifsResponse.json();
          setNotifications(notifsData.data?.notifications || []);
          setUnreadCount(notifsData.data?.unreadCount || 0);
        } else if (notifsResponse.status === 401) {
          // Already handled above
        } else {
          throw new Error(`Notifications API returned ${notifsResponse.status}`);
        }

        // Debug logging
        if (debugMode) {
          console.log('🔍 [BANNER DEBUG] Data fetched:', {
            isAuthenticated: true,
            activeJobs: jobsData.data?.jobs?.length || 0,
            notifications: notifsData.data?.notifications?.length || 0,
            unreadCount: notifsData.data?.unreadCount || 0,
            forceShow
          });
        }
      } catch (error) {
        console.error('Error fetching background status:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [debugMode, forceShow]);

  const handleCancelJob = async (jobId: number) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refetch jobs
        const jobsResponse = await fetch('/api/jobs?activeOnly=true');
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          setActiveJobs(jobsData.data?.jobs || []);
        }
      }
    } catch (error) {
      console.error('Error cancelling job:', error);
    }
  };

  const handleMarkNotificationRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/jobs/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      const response = await fetch('/api/jobs/notifications?action=mark-all-read', {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

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
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getJobStatusColor = (status: string): string => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'job_failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'job_cancelled':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  // Only show banner if there are active jobs or notifications
  const shouldShow = activeJobs.length > 0 || notifications.length > 0;

  if (!shouldShow) {
    return null;
  }

  // Simple banner - only show when there are active jobs or notifications
  return (
    <div className={`w-full ${className}`}>
      <Card className="bg-blue-50 border-blue-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">
                {activeJobs.length} background job{activeJobs.length !== 1 ? 's' : ''} running
              </span>
              {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.href = '/dashboard?tab=jobs'}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}