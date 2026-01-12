import * as React from 'react';

import { cn } from '../../lib/utils';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg';
  responsive?: boolean;
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, gap = 'md', responsive = true, ...props }, ref) => {
    const colsClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      12: 'grid-cols-12',
    };

    const gapClasses = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    };

    const responsiveClasses = responsive ? {
      1: '',
      2: 'sm:grid-cols-2',
      3: 'sm:grid-cols-2 lg:grid-cols-3',
      4: 'sm:grid-cols-2 lg:grid-cols-4',
      5: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
      12: 'sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12',
    } : {};

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          colsClasses[cols],
          gapClasses[gap],
          responsiveClasses[cols],
          className
        )}
        {...props}
      />
    );
  }
);

Grid.displayName = 'Grid';

export { Grid };
