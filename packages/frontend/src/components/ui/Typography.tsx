/**
 * Typography Components
 * 
 * Premium typography with Spanish-inspired styling
 * Uses Playfair Display for headings, Inter for body
 */

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// Heading component
export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  gradient?: boolean;
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as: Component = 'h2', gradient = false, className, children, ...props }, ref) => {
    const baseStyles = 'font-display font-semibold tracking-tight';
    
    const sizeStyles = {
      h1: 'text-5xl md:text-6xl',
      h2: 'text-4xl md:text-5xl',
      h3: 'text-3xl md:text-4xl',
      h4: 'text-2xl md:text-3xl',
      h5: 'text-xl md:text-2xl',
      h6: 'text-lg md:text-xl',
    };

    return (
      <Component
        ref={ref}
        className={cn(
          baseStyles,
          sizeStyles[Component],
          gradient && 'bg-gradient-to-r from-spanish-red-600 to-gold-600 bg-clip-text text-transparent',
          !gradient && 'text-navy-900',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Heading.displayName = 'Heading';

// Text component
export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'primary' | 'secondary';
  as?: 'p' | 'span' | 'div';
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  (
    {
      as: Component = 'p',
      size = 'base',
      weight = 'normal',
      color = 'default',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    };

    const weightStyles = {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    };

    const colorStyles = {
      default: 'text-navy-900',
      muted: 'text-navy-600',
      primary: 'text-spanish-red-600',
      secondary: 'text-gold-600',
    };

    return (
      <Component
        ref={ref}
        className={cn(
          'font-sans',
          sizeStyles[size],
          weightStyles[weight],
          colorStyles[color],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Text.displayName = 'Text';

// Label component
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  disabled?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, disabled, className, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium text-navy-700',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
    </label>
  )
);
Label.displayName = 'Label';
