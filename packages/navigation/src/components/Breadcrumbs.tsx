import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { clsx } from 'clsx';
import { BreadcrumbItem } from '../types';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHomeIcon?: boolean;
  separator?: React.ReactNode;
  maxItems?: number;
  showTooltip?: boolean;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className,
  showHomeIcon = true,
  separator = <ChevronRight className="h-4 w-4" />,
  maxItems,
  showTooltip = true,
}) => {
  // Limit items if maxItems is specified
  const displayItems = maxItems && items.length > maxItems 
    ? [
        items[0], // First item (usually Home)
        { id: 'ellipsis', label: '...', path: undefined },
        ...items.slice(-(maxItems - 1))
      ]
    : items;

  if (!items.length) {
    return null;
  }

  return (
    <nav 
      className={clsx(
        'flex items-center space-x-1 text-sm text-gray-600',
        className
      )}
      aria-label="Breadcrumb navigation"
    >
      {displayItems.map((item, index) => {
        const isLast = index === displayItems.length - 1;
        const isEllipsis = item.id === 'ellipsis';

        return (
          <React.Fragment key={item.id}>
            {index > 0 && !isEllipsis && (
              <span className="text-gray-400 mx-1" aria-hidden="true">
                {separator}
              </span>
            )}

            {!isEllipsis && (
              <div className="flex items-center">
                {item.id === 'home' && showHomeIcon && (
                  <Home className="h-4 w-4 mr-1" />
                )}
                
                {item.path && !isLast ? (
                  <Link
                    to={item.path}
                    className={clsx(
                      'hover:text-gray-900 transition-colors duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded',
                      showTooltip && 'tooltip-trigger'
                    )}
                    title={showTooltip ? item.label : undefined}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={clsx(
                      'font-medium',
                      isLast ? 'text-gray-900' : 'text-gray-600'
                    )}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </div>
            )}

            {isEllipsis && (
              <span className="text-gray-400 px-1">...</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

// Breadcrumb item component for individual items
interface BreadcrumbItemProps {
  item: BreadcrumbItem;
  isLast: boolean;
  showHomeIcon?: boolean;
  showTooltip?: boolean;
}

const BreadcrumbItemComponent: React.FC<BreadcrumbItemProps> = ({
  item,
  isLast,
  showHomeIcon = true,
  showTooltip = true,
}) => {
  const baseClasses = 'flex items-center transition-colors duration-200';
  const linkClasses = clsx(
    baseClasses,
    'hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded'
  );
  const textClasses = clsx(
    baseClasses,
    isLast ? 'font-medium text-gray-900' : 'text-gray-600'
  );

  return (
    <div className="flex items-center">
      {item.id === 'home' && showHomeIcon && (
        <Home className="h-4 w-4 mr-1" />
      )}
      
      {item.path && !isLast ? (
        <Link
          to={item.path}
          className={linkClasses}
          title={showTooltip ? item.label : undefined}
          aria-current={isLast ? 'page' : undefined}
        >
          {item.icon && <span className="mr-1">{item.icon}</span>}
          {item.label}
        </Link>
      ) : (
        <span
          className={textClasses}
          aria-current={isLast ? 'page' : undefined}
        >
          {item.icon && <span className="mr-1">{item.icon}</span>}
          {item.label}
        </span>
      )}
    </div>
  );
};

// Collapsible breadcrumbs for mobile
export const CollapsibleBreadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className,
  maxItems = 3,
  ...props
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (items.length <= maxItems) {
    return <Breadcrumbs items={items} className={className} {...props} />;
  }

  const displayItems = isExpanded ? items : [
    items[0],
    { id: 'ellipsis', label: '...', path: undefined },
    ...items.slice(-2)
  ];

  return (
    <div className="flex items-center space-x-2">
      <Breadcrumbs 
        items={displayItems} 
        className={className} 
        {...props} 
      />
      
      {items.length > maxItems && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded px-1"
          aria-label={isExpanded ? 'Collapse breadcrumbs' : 'Expand breadcrumbs'}
        >
          {isExpanded ? 'Show less' : `Show ${items.length - maxItems} more`}
        </button>
      )}
    </div>
  );
};

// Schema.org structured data for breadcrumbs
export const BreadcrumbStructuredData: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.label,
      'item': item.path || window.location.origin,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};
