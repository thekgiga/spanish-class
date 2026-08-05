/**
 * StatusBadge — the ONLY approved way to render booking/slot lifecycle status.
 * Maps UiLifecycleStatus to localized label, icon, semantic surface/border/foreground.
 * Status is never communicated by color alone (icon + text always present).
 */
import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  CalendarPlus, Clock3, CalendarCheck2, Lock,
  CircleCheck, CircleX, Ban, TimerOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UiLifecycleStatus } from "@/lib/ui-system/status";
import { uiStatusDefinition } from "@/lib/ui-system/status";

// Icon map keyed by the icon name string stored in uiStatusDefinition
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  CalendarPlus,
  Clock3,
  CalendarCheck2,
  Lock,
  CircleCheck,
  CircleX,
  Ban,
  TimerOff,
};

// Tone → Tailwind semantic class sets (surface / border / foreground)
const TONE_CLASSES: Record<UiLifecycleStatus, string> = {
  available: "bg-status-available-surface border-status-available-border text-status-available-foreground",
  requested: "bg-status-requested-surface border-status-requested-border text-status-requested-foreground",
  confirmed: "bg-status-confirmed-surface border-status-confirmed-border text-status-confirmed-foreground",
  blocked:   "bg-status-blocked-surface border-status-blocked-border text-status-blocked-foreground",
  completed: "bg-status-completed-surface border-status-completed-border text-status-completed-foreground",
  cancelled: "bg-status-cancelled-surface border-status-cancelled-border text-status-cancelled-foreground",
};

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: UiLifecycleStatus;
  /** "pill" (default) = compact inline badge; "tag" = slightly larger with label */
  variant?: "pill" | "tag";
}

export function StatusBadge({ status, variant = "pill", className, ...props }: StatusBadgeProps) {
  const { t } = useTranslation("booking");
  const def = uiStatusDefinition[status];
  const Icon = ICON_MAP[def.icon] ?? CircleCheck;
  const label = t(def.labelKey, { defaultValue: status });

  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-1 rounded-ui-full border font-medium",
        variant === "pill" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-small",
        TONE_CLASSES[def.tone],
        className,
      )}
      {...props}
    >
      <Icon className={variant === "pill" ? "h-3 w-3 shrink-0" : "h-3.5 w-3.5 shrink-0"} aria-hidden="true" />
      {label}
    </span>
  );
}
