import { BreadcrumbItem, UseBreadcrumbsReturn, NavigationItem } from '../types';
export declare const useBreadcrumbs: (navigationItems: NavigationItem[]) => UseBreadcrumbsReturn;
export declare const useBreadcrumbContext: () => {
    breadcrumbs: BreadcrumbItem[];
    updateBreadcrumb: (id: string, updates: Partial<BreadcrumbItem>) => void;
    insertBreadcrumb: (index: number, breadcrumb: BreadcrumbItem) => void;
    replaceBreadcrumb: (id: string, breadcrumb: BreadcrumbItem) => void;
};
