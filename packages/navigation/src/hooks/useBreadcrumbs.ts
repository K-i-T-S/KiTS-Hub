import { useCallback, useMemo } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { useNavigationStore } from '../store';
import { BreadcrumbItem, UseBreadcrumbsReturn, NavigationItem } from '../types';

export const useBreadcrumbs = (navigationItems: NavigationItem[]): UseBreadcrumbsReturn => {
  const location = useLocation();
  const { breadcrumbs, setBreadcrumbs, config } = useNavigationStore();

  // Generate breadcrumbs from current path and navigation items
  const generateBreadcrumbs = useCallback((path: string, items: NavigationItem[]): BreadcrumbItem[] => {
    const crumbs: BreadcrumbItem[] = [];
    
    // Add home breadcrumb if enabled
    if (config.breadcrumbs.showHome && path !== '/') {
      crumbs.push({
        id: 'home',
        label: 'Home',
        path: '/',
        icon: null,
      });
    }

    // Parse path segments
    const segments = path.split('/').filter(Boolean);
    let currentPath = '';

    // Find matching navigation items for each segment
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Try to find a matching navigation item
      const matchedItem = findNavigationItem(currentPath, items);
      
      if (matchedItem) {
        crumbs.push({
          id: matchedItem.id,
          label: matchedItem.label,
          path: index === segments.length - 1 ? undefined : currentPath,
          icon: matchedItem.icon,
        });
      } else {
        // Create breadcrumb from path segment
        crumbs.push({
          id: segment,
          label: formatSegmentLabel(segment),
          path: index === segments.length - 1 ? undefined : currentPath,
        });
      }
    });

    // Limit breadcrumbs to max items
    if (crumbs.length > config.breadcrumbs.maxItems) {
      const startIndex = crumbs.length - config.breadcrumbs.maxItems;
      return crumbs.slice(startIndex);
    }

    return crumbs;
  }, [config.breadcrumbs.showHome, config.breadcrumbs.maxItems]);

  // Find navigation item by path
  const findNavigationItem = (path: string, items: NavigationItem[]): NavigationItem | null => {
    for (const item of items) {
      if (item.path === path) {
        return item;
      }
      
      // Check children
      if (item.children) {
        const childMatch = findNavigationItem(path, item.children);
        if (childMatch) {
          return childMatch;
        }
      }
      
      // Check for pattern matching (e.g., /products/:id)
      if (matchPath(item.path, path)) {
        return item;
      }
    }
    return null;
  };

  // Format path segment into readable label
  const formatSegmentLabel = (segment: string): string => {
    // Convert kebab-case to Title Case
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Memoized breadcrumbs based on current path
  const computedBreadcrumbs = useMemo(() => {
    if (!config.breadcrumbs.enabled) {
      return [];
    }
    return generateBreadcrumbs(location.pathname, navigationItems);
  }, [location.pathname, navigationItems, generateBreadcrumbs, config.breadcrumbs.enabled]);

  // Update breadcrumbs when path changes
  const addBreadcrumb = useCallback((breadcrumb: BreadcrumbItem) => {
    const newBreadcrumbs = [...breadcrumbs, breadcrumb];
    setBreadcrumbs(newBreadcrumbs);
  }, [breadcrumbs, setBreadcrumbs]);

  const removeBreadcrumb = useCallback((id: string) => {
    const newBreadcrumbs = breadcrumbs.filter(crumb => crumb.id !== id);
    setBreadcrumbs(newBreadcrumbs);
  }, [breadcrumbs, setBreadcrumbs]);

  const clearBreadcrumbs = useCallback(() => {
    setBreadcrumbs([]);
  }, [setBreadcrumbs]);

  return {
    breadcrumbs: computedBreadcrumbs,
    setBreadcrumbs,
    addBreadcrumb,
    removeBreadcrumb,
    clearBreadcrumbs,
  };
};

// Hook for breadcrumb context provider
export const useBreadcrumbContext = () => {
  const { breadcrumbs, setBreadcrumbs } = useNavigationStore();

  const updateBreadcrumb = useCallback((id: string, updates: Partial<BreadcrumbItem>) => {
    const newBreadcrumbs = breadcrumbs.map(crumb => 
      crumb.id === id ? { ...crumb, ...updates } : crumb
    );
    setBreadcrumbs(newBreadcrumbs);
  }, [breadcrumbs, setBreadcrumbs]);

  const insertBreadcrumb = useCallback((index: number, breadcrumb: BreadcrumbItem) => {
    const newBreadcrumbs = [...breadcrumbs];
    newBreadcrumbs.splice(index, 0, breadcrumb);
    setBreadcrumbs(newBreadcrumbs);
  }, [breadcrumbs, setBreadcrumbs]);

  const replaceBreadcrumb = useCallback((id: string, breadcrumb: BreadcrumbItem) => {
    const newBreadcrumbs = breadcrumbs.map(crumb => 
      crumb.id === id ? breadcrumb : crumb
    );
    setBreadcrumbs(newBreadcrumbs);
  }, [breadcrumbs, setBreadcrumbs]);

  return {
    breadcrumbs,
    updateBreadcrumb,
    insertBreadcrumb,
    replaceBreadcrumb,
  };
};
