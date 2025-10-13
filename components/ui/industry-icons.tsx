/**
 * Industry icons for local business categories
 */

export const INDUSTRY_ICONS = {
  'plumbing-hvac': {
    icon: '🔧',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    name: 'Plumbing & HVAC'
  },
  'electrical-services': {
    icon: '⚡',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    name: 'Electrical Services'
  },
  'cleaning-services': {
    icon: '🧹',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    name: 'Cleaning Services'
  },
  'landscaping-lawn-care': {
    icon: '🌱',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    name: 'Landscaping & Lawn Care'
  },
  'roofing': {
    icon: '🏠',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    name: 'Roofing'
  },
  'painting': {
    icon: '🎨',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    name: 'Painting'
  },
  'pest-control': {
    icon: '🐛',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    name: 'Pest Control'
  },
  'home-repair': {
    icon: '🔨',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    name: 'Home Repair & Handyman'
  },
  'auto-repair': {
    icon: '🚗',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    name: 'Auto Repair'
  },
  'other': {
    icon: '🏢',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    name: 'Other Service Business'
  }
};

export interface IndustryIconProps {
  industryId: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export function IndustryIcon({
  industryId,
  size = 'md',
  showName = false,
  className = ''
}: IndustryIconProps) {
  const industry = INDUSTRY_ICONS[industryId as keyof typeof INDUSTRY_ICONS] || INDUSTRY_ICONS.other;

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} ${industry.bgColor} ${industry.color} rounded-lg flex items-center justify-center font-bold`}>
        {industry.icon}
      </div>
      {showName && (
        <span className="text-sm font-medium text-gray-700">
          {industry.name}
        </span>
      )}
    </div>
  );
}

export function getIndustryIcon(industryId: string) {
  return INDUSTRY_ICONS[industryId as keyof typeof INDUSTRY_ICONS] || INDUSTRY_ICONS.other;
}