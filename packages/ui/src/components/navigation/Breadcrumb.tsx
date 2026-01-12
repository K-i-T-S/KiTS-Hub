import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ReactNode;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, className, separator = <ChevronRight className="h-4 w-4" />, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}
        aria-label="Breadcrumb"
        {...props}
      >
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="flex items-center">{separator}</span>}
            {item.href ? (
              <a
                href={item.href}
                className={cn(
                  'transition-colors hover:text-foreground',
                  item.active && 'text-foreground font-medium'
                )}
                aria-current={item.active ? 'page' : undefined}
              >
                {item.label}
              </a>
            ) : (
              <span
                className={cn(
                  'transition-colors',
                  item.active && 'text-foreground font-medium'
                )}
                aria-current={item.active ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  }
);
Breadcrumb.displayName = 'Breadcrumb';

export { Breadcrumb };
