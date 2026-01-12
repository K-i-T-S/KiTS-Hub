import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const BreadcrumbNavigation: React.FC = () => {
  const location = useLocation();

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', path: '/' }
    ];

    const routeMap: Record<string, string> = {
      'inventory': 'Inventory Management',
      'pos': 'Point of Sale',
      'crm': 'CRM System',
      'hr': 'HR Management',
      'accounting': 'Accounting System',
      'analytics': 'Analytics Dashboard',
      'settings': 'Settings',
      'products': 'Products',
      'suppliers': 'Suppliers',
      'locations': 'Locations',
      'reports': 'Reports',
      'checkout': 'Checkout',
      'transactions': 'Transactions',
      'receipts': 'Receipts',
      'customers': 'Customers',
      'communications': 'Communications',
      'sales': 'Sales',
      'employees': 'Employees',
      'attendance': 'Attendance',
      'payroll': 'Payroll',
      'invoices': 'Invoices',
      'kpi': 'KPI',
      'trends': 'Trends',
    };

    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Skip adding if it's the same as the last breadcrumb (avoid duplicates)
      if (breadcrumbs[breadcrumbs.length - 1]?.label !== label) {
        breadcrumbs.push({ label, path: currentPath });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground py-2 px-4 border-b bg-background/50">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const isFirst = index === 0;

        return (
          <Fragment key={item.path || index}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
            )}
            
            {isFirst ? (
              <Link
                to={item.path || '/'}
                className="flex items-center space-x-1 hover:text-foreground transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ) : isLast ? (
              <span className="text-foreground font-medium">{item.label}</span>
            ) : (
              <Link
                to={item.path || '/'}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
};

export default BreadcrumbNavigation;
