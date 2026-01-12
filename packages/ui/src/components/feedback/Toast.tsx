import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

import { cn } from '../../lib/utils';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive:
          'destructive group border-destructive bg-destructive text-destructive-foreground',
        success:
          'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200',
        warning:
          'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
        info:
          'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Toast = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof toastVariants> & {
    title?: string;
    description?: string;
    onDismiss?: () => void;
  }
>(({ className, variant, title, description, onDismiss, children, ...props }, ref) => {
  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return <XCircle className="h-5 w-5" />;
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5" />;
      case 'info':
        return <Info className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <div className="grid gap-1">
        {title && (
          <div className="flex items-center space-x-2">
            {getIcon()}
            <div className="text-sm font-semibold">{title}</div>
          </div>
        )}
        {description && (
          <div className="text-sm opacity-90">
            {description}
          </div>
        )}
        {children}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
          aria-label="Dismiss"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});
Toast.displayName = 'Toast';

export { Toast, toastVariants };
