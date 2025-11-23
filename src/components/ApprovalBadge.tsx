import { Badge } from './ui/badge';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface ApprovalBadgeProps {
  status: 'pending' | 'approved' | 'rejected';
  className?: string;
}

export const ApprovalBadge = ({ status, className }: ApprovalBadgeProps) => {
  const variants = {
    pending: {
      label: 'En attente d\'approbation',
      icon: Clock,
      className: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20',
    },
    approved: {
      label: 'Approuvé',
      icon: CheckCircle,
      className: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20',
    },
    rejected: {
      label: 'Rejeté',
      icon: XCircle,
      className: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20',
    },
  };

  const variant = variants[status];
  const Icon = variant.icon;

  return (
    <Badge className={`${variant.className} ${className}`}>
      <Icon className="h-3 w-3 mr-1" />
      {variant.label}
    </Badge>
  );
};
