import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export default function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }[size];

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn('spinner', sizeClass)} />
      {label && <p className="text-sm text-slate-500 font-medium">{label}</p>}
    </div>
  );
}
