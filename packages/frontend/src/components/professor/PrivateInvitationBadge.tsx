import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PrivateInvitationBadgeProps {
  className?: string;
  size?: 'sm' | 'default';
}

// T029: Badge component to visually distinguish private invitations
export function PrivateInvitationBadge({ className, size = 'default' }: PrivateInvitationBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1 bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200',
        size === 'sm' && 'text-xs py-0.5 px-2',
        className
      )}
    >
      <Lock className={cn('h-3 w-3', size === 'sm' && 'h-2.5 w-2.5')} />
      Private
    </Badge>
  );
}
