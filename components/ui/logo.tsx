import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export function Logo({ size = 'lg', className, showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Logo Icon */}
      <div className={cn('relative', sizeClasses[size])}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Outer circle with gradient */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
            <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FED7AA" />
              <stop offset="100%" stopColor="#FB923C" />
            </linearGradient>
          </defs>

          {/* Outer ring */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#logoGradient)"
            strokeWidth="8"
            fill="none"
          />

          {/* Inner stylized S shape */}
          <path
            d="M 30 35 Q 50 25, 70 35 T 70 65 Q 50 75, 30 65 T 30 35"
            fill="url(#centerGradient)"
            stroke="url(#logoGradient)"
            strokeWidth="2"
          />

          {/* Highlight dots */}
          <circle cx="35" cy="45" r="3" fill="#EA580C" opacity="0.8" />
          <circle cx="65" cy="55" r="3" fill="#EA580C" opacity="0.8" />
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            'font-bold text-gray-900',
            textSizeClasses[size]
          )}>
            SEO Genius
          </span>
          <span className="text-xs text-gray-600 leading-tight">
            Content Intelligence
          </span>
        </div>
      )}
    </div>
  );
}

// Simplified version for smaller spaces
export function LogoIcon({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>

        {/* Simplified logo icon */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#iconGradient)"
          strokeWidth="8"
          fill="none"
        />

        <path
          d="M 30 35 Q 50 25, 70 35 T 70 65 Q 50 75, 30 65 T 30 35"
          fill="url(#iconGradient)"
        />
      </svg>
    </div>
  );
}