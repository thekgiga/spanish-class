/**
 * Drawer — right-side panel on desktop; bottom sheet on mobile.
 *
 * Contract (docs/ui-system/06-component-contracts.md):
 * - default width 420 px, wide 520 px (named Tailwind tokens)
 * - sticky header + action footer when content scrolls
 * - Escape closes unless an unsafe mutation is in progress
 * - focus trapped; returned to trigger on close
 * - mobile: full-width bottom sheet (max-h-sheet = 90dvh)
 */
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Drawer = DialogPrimitive.Root;
const DrawerTrigger = DialogPrimitive.Trigger;
const DrawerClose = DialogPrimitive.Close;
const DrawerPortal = DialogPrimitive.Portal;

// ── Overlay ───────────────────────────────────────────────────────────────

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-surface-inverse/40 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out', // uiux-allow-arbitrary: Radix data-state variant
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0', // uiux-allow-arbitrary: Radix data-state variant
      className,
    )}
    {...props}
  />
));
DrawerOverlay.displayName = 'DrawerOverlay';

// ── Panel ─────────────────────────────────────────────────────────────────

export interface DrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** 'default' uses --ui-drawer-width; 'wide' uses --ui-drawer-wide */
  size?: 'default' | 'wide';
  /**
   * When true, Escape and outside-click are suppressed so an in-flight
   * mutation is not interrupted. Show a visual busy indicator alongside.
   */
  busy?: boolean;
}

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(({ className, children, size = 'default', busy = false, onEscapeKeyDown, onPointerDownOutside, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DialogPrimitive.Content
      ref={ref}
      onEscapeKeyDown={(e) => { if (busy) { e.preventDefault(); return; } onEscapeKeyDown?.(e); }}
      onPointerDownOutside={(e) => { if (busy) { e.preventDefault(); return; } onPointerDownOutside?.(e); }}
      className={cn(
        // Desktop: right panel — named width tokens
        'fixed right-0 top-0 z-50 h-full bg-surface shadow-ui-3 focus:outline-none',
        'flex flex-col',
        size === 'wide' ? 'w-drawer-wide' : 'w-drawer',
        // Radix enter/exit
        'data-[state=open]:animate-in data-[state=closed]:animate-out', // uiux-allow-arbitrary: Radix data-state variant
        'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right', // uiux-allow-arbitrary: Radix data-state variant
        'duration-spatial',
        // Mobile: bottom sheet
        'max-sm:right-0 max-sm:bottom-0 max-sm:top-auto max-sm:w-full max-sm:max-h-sheet',
        'max-sm:rounded-t-ui-xl',
        'max-sm:data-[state=closed]:slide-out-to-bottom max-sm:data-[state=open]:slide-in-from-bottom', // uiux-allow-arbitrary: Radix data-state variant
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = 'DrawerContent';

// ── Sub-components ────────────────────────────────────────────────────────

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex shrink-0 items-center justify-between border-b border-line px-6 py-4', className)} {...props} />
);
DrawerHeader.displayName = 'DrawerHeader';

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('text-title font-semibold text-ink', className)} {...props} />
));
DrawerTitle.displayName = 'DrawerTitle';

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-small text-ink-secondary', className)} {...props} />
));
DrawerDescription.displayName = 'DrawerDescription';

const DrawerBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex-1 overflow-y-auto px-6 py-4', className)} {...props} />
);
DrawerBody.displayName = 'DrawerBody';

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex shrink-0 items-center justify-end gap-2 border-t border-line px-6 py-4', className)} {...props} />
);
DrawerFooter.displayName = 'DrawerFooter';

const DrawerCloseButton = ({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <DialogPrimitive.Close
    className={cn(
      'rounded-ui-xs p-1 text-ink-tertiary transition-colors duration-micro',
      'hover:bg-surface-muted hover:text-ink',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
      className,
    )}
    {...props}
  >
    <X className="h-5 w-5" aria-hidden="true" />
    <span className="sr-only">Close</span>
  </DialogPrimitive.Close>
);
DrawerCloseButton.displayName = 'DrawerCloseButton';

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  DrawerCloseButton,
};
