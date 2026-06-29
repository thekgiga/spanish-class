/**
 * Dialog — blocking modal for short decisions and authentication steps.
 * AlertDialog — destructive confirmation variant.
 *
 * CONTRACT (docs/ui-system/06-component-contracts.md §Dialog):
 * - Use only for: destructive confirmation, short blocking decisions, auth steps.
 * - Do NOT use for ordinary editing — use Drawer instead.
 * - ACCESSIBILITY REQUIREMENT: every DialogContent MUST contain a visible
 *   DialogTitle, or pass `aria-label` / `aria-labelledby` explicitly.
 *   Radix will log a console warning and degrade screen-reader support
 *   when no accessible name is present. If the title is visually hidden,
 *   wrap it in a <span className="sr-only">.
 */
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from './button';

// ════════════════════════════════════════════════════════════════════════════
// Dialog
// ════════════════════════════════════════════════════════════════════════════

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
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
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
        'bg-surface rounded-ui-lg shadow-ui-3 border border-line',
        'flex flex-col gap-0 outline-none',
        'data-[state=open]:animate-in data-[state=closed]:animate-out', // uiux-allow-arbitrary: Radix data-state variant
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0', // uiux-allow-arbitrary: Radix data-state variant
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95', // uiux-allow-arbitrary: Radix data-state variant
        'duration-standard',
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-ui-xs p-1 text-ink-tertiary hover:bg-surface-muted hover:text-ink transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        <X className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-1.5 px-6 pt-6 pb-4', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center justify-end gap-2 border-t border-line px-6 py-4', className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('text-title font-semibold text-ink', className)} {...props} />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-small text-ink-secondary', className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// ════════════════════════════════════════════════════════════════════════════
// AlertDialog — destructive confirmation only
// ════════════════════════════════════════════════════════════════════════════

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
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
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
        'bg-surface rounded-ui-lg shadow-ui-3 border border-line flex flex-col gap-0 outline-none',
        'data-[state=open]:animate-in data-[state=closed]:animate-out', // uiux-allow-arbitrary: Radix data-state variant
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0', // uiux-allow-arbitrary: Radix data-state variant
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95', // uiux-allow-arbitrary: Radix data-state variant
        'duration-standard',
        className,
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-1.5 px-6 pt-6 pb-4', className)} {...props} />
);
AlertDialogHeader.displayName = 'AlertDialogHeader';

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center justify-end gap-2 border-t border-line px-6 py-4', className)} {...props} />
);
AlertDialogFooter.displayName = 'AlertDialogFooter';

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title ref={ref} className={cn('text-title font-semibold text-ink', className)} {...props} />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description ref={ref} className={cn('text-small text-ink-secondary', className)} {...props} />
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action ref={ref} className={cn(buttonVariants({ variant: 'danger' }), className)} {...props} />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel ref={ref} className={cn(buttonVariants({ variant: 'secondary' }), className)} {...props} />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  Dialog, DialogTrigger, DialogPortal, DialogOverlay, DialogClose,
  DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
  AlertDialog, AlertDialogTrigger, AlertDialogPortal, AlertDialogOverlay,
  AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
};
