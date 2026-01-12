import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check } from 'lucide-react';

import { cn } from '../../lib/utils';

const checkboxVariants = cva(
  'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
  {
    variants: {
      variant: {
        default: 'border-primary',
        destructive: 'border-destructive data-[state=checked]:bg-destructive data-[state=checked]:text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'checked'>,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, variant, label, error, helperText, id, checked, onCheckedChange, ...props }, ref) => {
    const checkboxId = id || `checkbox-${React.useId()}`;
    const [isChecked, setIsChecked] = React.useState(checked || false);
    
    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked);
      }
    }, [checked]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setIsChecked(event.target.checked);
      if (onCheckedChange) {
        onCheckedChange(event.target.checked);
      }
      if (props.onChange) {
        props.onChange(event);
      }
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="checkbox"
              id={checkboxId}
              className="sr-only"
              checked={isChecked}
              onChange={handleChange}
              ref={ref}
              {...props}
            />
            <div
              className={cn(
                checkboxVariants({ variant }),
                className,
                isChecked && 'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
                error && 'border-destructive'
              )}
              data-state={isChecked ? 'checked' : 'unchecked'}
              onClick={() => {
                const newState = !isChecked;
                setIsChecked(newState);
                if (onCheckedChange) {
                  onCheckedChange(newState);
                }
              }}
            >
              {isChecked && (
                <Check className="h-3 w-3" />
              )}
            </div>
          </div>
          {label && (
            <label
              htmlFor={checkboxId}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox, checkboxVariants };
