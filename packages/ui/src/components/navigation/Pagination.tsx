import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showEdges?: boolean;
  siblingCount?: number;
}

const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    className,
    showEdges = true,
    siblingCount = 1,
    ...props 
  }, ref) => {
    const range = React.useMemo<(number | string)[]>(() => {
      const delta = siblingCount;
      const range: number[] = [];
      const rangeWithDots: (number | string)[] = [];
      let l: number | undefined;

      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
          range.push(i);
        }
      }

      range.forEach((i) => {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1);
          } else if (i - l !== 1) {
            rangeWithDots.push('...');
          }
        }
        rangeWithDots.push(i);
        l = i;
      });

      return rangeWithDots;
    }, [currentPage, totalPages, siblingCount]);

    return (
      <nav
        ref={ref}
        className={cn('flex items-center space-x-1', className)}
        aria-label="Pagination"
        {...props}
      >
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            'h-8 w-8 p-0',
            'hover:bg-accent hover:text-accent-foreground'
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {range.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={cn(
                  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'h-8 w-8 p-0',
                  page === currentPage
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            'h-8 w-8 p-0',
            'hover:bg-accent hover:text-accent-foreground'
          )}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    );
  }
);
Pagination.displayName = 'Pagination';

export { Pagination };
