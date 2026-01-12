import * as React from 'react';
export interface SaleItemProps {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    currency?: string;
    status?: 'pending' | 'processing' | 'completed' | 'cancelled';
    timestamp?: string;
    variant?: 'default' | 'compact';
    className?: string;
}
declare const SaleItem: React.ForwardRefExoticComponent<SaleItemProps & React.RefAttributes<HTMLDivElement>>;
export { SaleItem };
//# sourceMappingURL=sale-item.d.ts.map