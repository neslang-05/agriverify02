import { Badge } from '@/components/ui/badge';
import { RiskLevel } from '@/types/complaints';

interface RiskLevelBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskLevelBadge({ level, size = 'md' }: RiskLevelBadgeProps) {
  const styles = {
    normal: {
      container: 'bg-green-100 text-green-700 border-green-700',
      label: 'Normal',
    },
    suspicious: {
      container: 'bg-orange-100 text-orange-700 border-orange-700',
      label: 'Suspicious',
    },
    high_risk: {
      container: 'bg-red-100 text-red-700 border-red-700',
      label: 'High Risk',
    },
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const style = styles[level];

  return (
    <Badge
      className={`rounded-none border ${style.container} ${sizeClasses[size]} font-semibold hover:${style.container}`}
    >
      {style.label}
    </Badge>
  );
}
