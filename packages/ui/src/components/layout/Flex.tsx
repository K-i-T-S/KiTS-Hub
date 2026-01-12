import * as React from 'react';

import { cn } from '../../lib/utils';

interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: number | string;
}

const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ 
    className, 
    direction = 'row', 
    align = 'start', 
    justify = 'start', 
    wrap = 'nowrap',
    gap = 0,
    ...props 
  }, ref) => {
    const directionClasses = {
      row: 'flex-row',
      col: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'col-reverse': 'flex-col-reverse',
    };

    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    };

    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    };

    const wrapClasses = {
      nowrap: 'flex-nowrap',
      wrap: 'flex-wrap',
      'wrap-reverse': 'flex-wrap-reverse',
    };

    const gapClass = typeof gap === 'number' ? `gap-${gap}` : gap;

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          directionClasses[direction],
          alignClasses[align],
          justifyClasses[justify],
          wrapClasses[wrap],
          gapClass,
          className
        )}
        {...props}
      />
    );
  }
);

Flex.displayName = 'Flex';

export { Flex };
