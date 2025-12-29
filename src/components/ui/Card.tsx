import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'glass' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  padding = 'md',
  onClick 
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variants = {
    default: 'bg-zinc-900/50 border border-zinc-800 rounded-2xl',
    gradient: 'gradient-border p-6',
    glass: 'glass-card',
    interactive: 'glass-card glass-card-hover cursor-pointer',
  };

  if (variant === 'gradient') {
    return (
      <div className={`gradient-border ${paddingStyles[padding]} ${className}`} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <div className={`${variants[variant]} ${paddingStyles[padding]} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: ReactNode;
  trend?: { value: number; isPositive: boolean };
  loading?: boolean;
}

export function StatCard({ label, value, subValue, icon, trend, loading }: StatCardProps) {
  if (loading) {
    return (
      <Card variant="glass" padding="md">
        <div className="space-y-3">
          <div className="h-4 w-20 shimmer rounded" />
          <div className="h-8 w-32 shimmer rounded" />
          <div className="h-3 w-24 shimmer rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glass" padding="md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white number-animate">{value}</p>
          {subValue && (
            <p className="text-sm text-zinc-500 mt-1">{subValue}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend.isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              <svg 
                className={`w-4 h-4 ${trend.isPositive ? '' : 'rotate-180'}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-zinc-800 rounded-xl text-zinc-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
