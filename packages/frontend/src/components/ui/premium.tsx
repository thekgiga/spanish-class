/**
 * PREMIUM LIQUID GLASS COMPONENTS
 * Cutting-edge UI components with glass morphism, 3D depth, and luxury aesthetics
 */

import { cn } from "@/lib/utils";
import React, { ButtonHTMLAttributes, HTMLAttributes, forwardRef } from "react";

// ==================== GLASS CARD ====================

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "dark" | "light";
  hover?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "dark", hover = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          variant === "dark" ? "glass-card" : "glass-card-light",
          !hover && "hover:translate-y-0 hover:shadow-glass",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
GlassCard.displayName = "GlassCard";

// ==================== GOLD GRADIENT BUTTON ====================

interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg" | "xl";
  asChild?: boolean;
}

export const GoldButton = forwardRef<HTMLButtonElement, GoldButtonProps>(
  ({ className, size = "md", asChild = false, children, ...props }, ref) => {
    const sizeClasses = {
      sm: "px-4 py-2 text-sm rounded-xl",
      md: "px-6 py-3 text-base rounded-xl",
      lg: "px-8 py-4 text-lg rounded-2xl",
      xl: "px-10 py-5 text-xl rounded-2xl",
    };

    const classes = cn("gold-gradient-btn", sizeClasses[size], className);

    if (
      asChild &&
      typeof children === "object" &&
      children !== null &&
      "type" in children
    ) {
      // Clone the child element and merge the className
      return (
        <children.type
          {...children.props}
          ref={ref}
          className={cn(classes, children.props.className)}
        />
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  },
);
GoldButton.displayName = "GoldButton";

// ==================== PRIMARY BUTTON (Education Blue/Emerald) ====================

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  asChild?: boolean;
}

export const PrimaryButton = React.forwardRef<
  HTMLButtonElement,
  PrimaryButtonProps
>(
  (
    { className = "", size = "md", asChild = false, children, ...props },
    ref,
  ) => {
    const sizeClasses = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    const classes = cn(
      "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200",
      "bg-gradient-to-r from-spanish-teal-500 to-spanish-teal-600",
      "hover:from-spanish-teal-600 hover:to-spanish-teal-700",
      "text-white shadow-lg",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "focus:outline-none focus:ring-2 focus:ring-spanish-teal-400 focus:ring-offset-2",
      sizeClasses[size],
      className,
    );

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(classes, (children as any).props.className),
        ref,
      });
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  },
);
PrimaryButton.displayName = "PrimaryButton";

// ==================== PREMIUM STAT CARD ====================

interface PremiumStatProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "gold" | "purple" | "cyan" | "emerald";
}

export function PremiumStat({
  value,
  label,
  icon,
  trend,
  trendValue,
  variant = "gold",
}: PremiumStatProps) {
  const gradients = {
    gold: "from-luxury-gold-400 to-luxury-gold-600",
    purple: "from-luxury-purple-400 to-luxury-purple-600",
    cyan: "from-luxury-cyan-400 to-luxury-cyan-600",
    emerald: "from-luxury-emerald-400 to-luxury-emerald-600",
  };

  const glows = {
    gold: "shadow-gold-glow",
    purple: "shadow-purple-glow",
    cyan: "shadow-[0_8px_32px_rgba(14,165,233,0.3)]",
    emerald: "shadow-[0_8px_32px_rgba(16,185,129,0.3)]",
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/60 mb-2">{label}</p>
          <p className="text-4xl font-display font-bold text-white mb-2">
            {value}
          </p>
          {trend && trendValue && (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-sm font-semibold",
                  trend === "up" && "text-luxury-emerald-400",
                  trend === "down" && "text-red-400",
                  trend === "neutral" && "text-white/60",
                )}
              >
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}{" "}
                {trendValue}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br",
              gradients[variant],
              glows[variant],
              "animate-glow-pulse",
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

// ==================== MORPHING SHAPE DECORATION ====================

export function MorphingShape({
  className,
  color = "gold",
}: {
  className?: string;
  color?: "gold" | "purple" | "cyan" | "blue";
}) {
  const colors = {
    gold: "bg-gradient-to-br from-luxury-gold-400/10 to-luxury-gold-600/10",
    purple:
      "bg-gradient-to-br from-luxury-purple-400/10 to-luxury-purple-600/10",
    cyan: "bg-gradient-to-br from-luxury-cyan-400/10 to-luxury-cyan-600/10",
    blue: "bg-gradient-to-br from-edu-blue-400/10 to-edu-blue-600/10",
  };

  return (
    <div
      className={cn(
        "absolute -z-10 blur-3xl animate-morph pointer-events-none",
        colors[color],
        className,
      )}
      style={{ zIndex: -10 }}
    />
  );
}

// ==================== FLOATING ELEMENT ====================

export function FloatingElement({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("animate-float", className)}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

// ==================== PROGRESS BAR WITH GOLD GRADIENT ====================

interface PremiumProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
}

export function PremiumProgress({
  value,
  max = 100,
  label,
  showPercentage = true,
}: PremiumProgressProps) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className="space-y-2">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium text-white/80">{label}</span>}
          {showPercentage && (
            <span className="font-bold text-luxury-gold-400">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className="relative h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            background:
              "linear-gradient(90deg, #FBBF24 0%, #CA8A04 50%, #F59E0B 100%)",
            backgroundSize: "200% 100%",
            animation: "gradient-flow 3s ease infinite",
          }}
        />
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
    </div>
  );
}

// ==================== STREAK COUNTER (GAMIFICATION) ====================

interface StreakCounterProps {
  days: number;
  variant?: "fire" | "star" | "bolt";
}

export function StreakCounter({ days, variant = "fire" }: StreakCounterProps) {
  const icons = {
    fire: "🔥",
    star: "⭐",
    bolt: "⚡",
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-red-600 text-2xl shadow-gold-glow animate-glow-pulse">
          {icons[variant]}
        </div>
        <div>
          <p className="text-2xl font-display font-bold text-white">{days}</p>
          <p className="text-sm text-white/60">Day Streak</p>
        </div>
      </div>
    </div>
  );
}
