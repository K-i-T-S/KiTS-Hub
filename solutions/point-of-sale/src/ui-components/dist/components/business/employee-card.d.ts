import * as React from 'react';
export interface EmployeeCardProps {
    id: string;
    name: string;
    email: string;
    phone?: string;
    position: string;
    department?: string;
    salary?: number;
    currency?: string;
    hireDate?: string;
    location?: string;
    status?: 'active' | 'on-leave' | 'terminated';
    avatar?: string;
    performance?: number;
    onClick?: () => void;
    onContact?: () => void;
    className?: string;
    variant?: 'default' | 'compact';
}
declare const EmployeeCard: React.ForwardRefExoticComponent<EmployeeCardProps & React.RefAttributes<HTMLDivElement>>;
export { EmployeeCard };
//# sourceMappingURL=employee-card.d.ts.map