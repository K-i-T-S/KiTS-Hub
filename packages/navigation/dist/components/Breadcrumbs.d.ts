import React from 'react';
import { BreadcrumbItem } from '../types';
interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
    showHomeIcon?: boolean;
    separator?: React.ReactNode;
    maxItems?: number;
    showTooltip?: boolean;
}
export declare const Breadcrumbs: React.FC<BreadcrumbsProps>;
export declare const CollapsibleBreadcrumbs: React.FC<BreadcrumbsProps>;
export declare const BreadcrumbStructuredData: React.FC<{
    items: BreadcrumbItem[];
}>;
export {};
