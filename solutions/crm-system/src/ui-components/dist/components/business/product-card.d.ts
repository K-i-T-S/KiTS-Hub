import * as React from 'react';
export interface ProductCardProps {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency?: string;
    image?: string;
    category?: string;
    stock?: number;
    sku?: string;
    badge?: string;
    onClick?: () => void;
    onAddToCart?: (productId: string) => void;
    className?: string;
    variant?: 'default' | 'compact' | 'detailed';
}
declare const ProductCard: React.ForwardRefExoticComponent<ProductCardProps & React.RefAttributes<HTMLDivElement>>;
export { ProductCard };
//# sourceMappingURL=product-card.d.ts.map