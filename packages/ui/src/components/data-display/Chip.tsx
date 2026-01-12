import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const chipVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success:
          'border-transparent bg-green-100 text-green-800 hover:bg-green-200',
        warning:
          'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        info:
          'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chipVariants> {
  avatar?: React.ReactNode;
  label?: string;
  onRemove?: () => void;
}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, variant, size, avatar, label, onRemove, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(chipVariants({ variant, size }), className)}
        {...props}
      >
        {avatar && (
          <div className="mr-1 flex-shrink-0">
            {avatar}
          </div>
        )}
        <span className="truncate">
          {label || children}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 flex-shrink-0 rounded-full p-0.5 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Remove"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Chip.displayName = 'Chip';

export { Chip, chipVariants };
