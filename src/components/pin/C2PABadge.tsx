import { ShieldCheck, ShieldX, Shield } from 'lucide-react'
import { C2PAStatus } from '@/types/c2pa'
import { cn } from '@/lib/utils'

interface C2PABadgeProps {
  status: C2PAStatus
  className?: string
  size?: 'sm' | 'md'
}

const STATUS_CONFIG = {
  verified_human: {
    icon: ShieldCheck,
    label: 'Verified Human',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    iconClassName: 'text-emerald-500',
  },
  no_data: {
    icon: Shield,
    label: 'Unverified',
    className: 'bg-muted/50 text-muted-foreground border-border/50',
    iconClassName: 'text-muted-foreground',
  },
  pending: {
    icon: Shield,
    label: 'Checking...',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    iconClassName: 'text-amber-500',
  },
  rejected_ai: {
    icon: ShieldX,
    label: 'AI Detected',
    className: 'bg-red-500/10 text-red-600 border-red-500/30',
    iconClassName: 'text-red-500',
  },
}

export function C2PABadge({ status, className, size = 'sm' }: C2PABadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-full border backdrop-blur-md font-medium',
        size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
        config.className,
        className
      )}
      title={status === 'verified_human' ? 'C2PA認証済み - 人間が作成' : undefined}
    >
      <Icon
        className={cn(
          config.iconClassName,
          size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
        )}
      />
      <span>{config.label}</span>
    </div>
  )
}
