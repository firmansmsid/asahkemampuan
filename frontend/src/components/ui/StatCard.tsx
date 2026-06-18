import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: number; label: string; positive?: boolean };
  className?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-100',
  trend,
  className,
}: StatCardProps) {
  return (
    <div className={cn('card animate-fade-in', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1 leading-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'text-xs font-semibold',
                  trend.positive ? 'text-emerald-600' : 'text-red-500'
                )}
              >
                {trend.positive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-slate-400">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn('stat-icon', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>
    </div>
  );
}
