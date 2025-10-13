'use client';

import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { formatSearchVolume, getDifficultyColor, getCompetitionColor } from '@/lib/seo/utils';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Users,
  BarChart3,
  Zap,
} from 'lucide-react';

interface MetricsBadgeProps {
  type: 'difficulty' | 'competition' | 'volume' | 'score' | 'trend';
  value: string | number;
  variant?: 'default' | 'compact' | 'detailed';
  showIcon?: boolean;
  className?: string;
}

export function MetricsBadge({
  type,
  value,
  variant = 'default',
  showIcon = true,
  className,
}: MetricsBadgeProps) {
  const getIcon = () => {
    switch (type) {
      case 'difficulty':
        return <BarChart3 className="h-3 w-3" />;
      case 'competition':
        return <Users className="h-3 w-3" />;
      case 'volume':
        return <Search className="h-3 w-3" />;
      case 'score':
        return <TrendingUp className="h-3 w-3" />;
      case 'trend':
        if (typeof value === 'string') {
          if (value.includes('up')) return <TrendingUp className="h-3 w-3" />;
          if (value.includes('down')) return <TrendingDown className="h-3 w-3" />;
        }
        return <Minus className="h-3 w-3" />;
      default:
        return <Zap className="h-3 w-3" />;
    }
  };

  const getBadgeColor = () => {
    switch (type) {
      case 'difficulty':
        return getDifficultyColor(value as 'easy' | 'medium' | 'hard');
      case 'competition':
        return getCompetitionColor(value as 'low' | 'medium' | 'high');
      case 'volume':
        const volume = typeof value === 'number' ? value : parseInt(String(value)) || 0;
        if (volume > 5000) return 'text-green-600 bg-green-100';
        if (volume > 1000) return 'text-blue-600 bg-blue-100';
        if (volume > 100) return 'text-yellow-600 bg-yellow-100';
        return 'text-gray-600 bg-gray-100';
      case 'score':
        const score = typeof value === 'number' ? value : parseInt(String(value)) || 0;
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
      case 'trend':
        if (typeof value === 'string') {
          if (value.includes('up')) return 'text-green-600 bg-green-100';
          if (value.includes('down')) return 'text-red-600 bg-red-100';
        }
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'difficulty':
        return 'Difficulty';
      case 'competition':
        return 'Competition';
      case 'volume':
        return 'Search Volume';
      case 'score':
        return 'SEO Score';
      case 'trend':
        return 'Trend';
      default:
        return 'Metric';
    }
  };

  const getDisplayValue = () => {
    switch (type) {
      case 'volume':
        return formatSearchVolume(typeof value === 'number' ? value : parseInt(String(value)) || 0);
      case 'score':
        return `${value}/100`;
      default:
        return String(value);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', getBadgeColor(), className)}>
        {showIcon && getIcon()}
        <span>{getDisplayValue()}</span>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('flex items-center gap-2 p-3 rounded-lg border', className)}>
        <div className={cn('p-2 rounded-full', getBadgeColor())}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium capitalize">{getLabel()}</div>
          <div className="text-lg font-bold">{getDisplayValue()}</div>
        </div>
      </div>
    );
  }

  return (
    <Badge className={cn('gap-1', getBadgeColor(), className)}>
      {showIcon && getIcon()}
      <span className="capitalize">{getLabel()}:</span>
      <span className="font-medium">{getDisplayValue()}</span>
    </Badge>
  );
}

interface MetricsGridProps {
  metrics: Array<{
    type: MetricsBadgeProps['type'];
    value: string | number;
    label?: string;
  }>;
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export function MetricsGrid({
  metrics,
  columns = 2,
  variant = 'default',
  className,
}: MetricsGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className={cn('grid gap-3', gridCols[columns], className)}>
      {metrics.map((metric, index) => (
        <MetricsBadge
          key={index}
          type={metric.type}
          value={metric.value}
          variant={variant}
          showIcon={true}
        />
      ))}
    </div>
  );
}

interface SEOScoreIndicatorProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function SEOScoreIndicator({
  score,
  size = 'md',
  showLabel = true,
  className,
}: SEOScoreIndicatorProps) {
  const getColor = () => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'md':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  return (
    <div className={cn('inline-flex items-center gap-2 rounded-full font-medium', getColor(), getSizeClasses(), className)}>
      <TrendingUp className="h-3 w-3" />
      <span>{score}/100</span>
      {showLabel && <span>SEO Score</span>}
    </div>
  );
}