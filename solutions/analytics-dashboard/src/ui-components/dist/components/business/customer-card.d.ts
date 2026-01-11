import * as React from 'react';
export interface CustomerCardProps {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    joinedDate?: string;
    totalOrders?: number;
    totalSpent?: number;
    loyaltyPoints?: number;
    status?: 'active' | 'inactive' | 'vip';
    avatar?: string;
    onClick?: () => void;
    onContact?: () => void;
    className?: string;
    variant?: 'default' | 'compact';
}
declare const CustomerCard: React.ForwardRefExoticComponent<CustomerCardProps & React.RefAttributes<HTMLDivElement>>;
export { CustomerCard };
//# sourceMappingURL=customer-card.d.ts.map