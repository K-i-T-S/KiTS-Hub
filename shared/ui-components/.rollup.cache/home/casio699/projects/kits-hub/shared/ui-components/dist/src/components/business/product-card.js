import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../../utils/cn';
const ProductCard = React.forwardRef(({ id, name, description, price, currency = 'USD', image, category, stock, sku, badge, onClick, onAddToCart, className, variant = 'default' }, ref) => {
    const isOutOfStock = stock !== undefined && stock <= 0;
    const isLowStock = stock !== undefined && stock > 0 && stock <= 5;
    if (variant === 'compact') {
        return (_jsxs("div", { ref: ref, className: cn("flex items-center space-x-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer", className), onClick: onClick, children: [image && (_jsx("img", { src: image, alt: name, className: "w-16 h-16 object-cover rounded-md" })), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "font-medium truncate", children: name }), sku && _jsxs("p", { className: "text-sm text-muted-foreground", children: ["SKU: ", sku] }), _jsxs("p", { className: "text-sm font-medium", children: [currency, " ", price.toFixed(2)] })] }), _jsxs("div", { className: "flex flex-col items-end space-y-2", children: [badge && _jsx(Badge, { variant: "secondary", children: badge }), stock !== undefined && (_jsx(Badge, { variant: isOutOfStock ? "destructive" : isLowStock ? "warning" : "default", children: isOutOfStock ? 'Out of Stock' : `${stock} left` })), _jsx(Button, { size: "sm", onClick: (e) => {
                                e.stopPropagation();
                                onAddToCart?.(id);
                            }, disabled: isOutOfStock, children: "Add" })] })] }));
    }
    return (_jsxs(Card, { ref: ref, className: cn("group hover:shadow-lg transition-all duration-300 cursor-pointer", isOutOfStock && "opacity-75", className), onClick: onClick, variant: "elevated", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsx("div", { className: "aspect-square w-full overflow-hidden rounded-md bg-muted", children: image ? (_jsx("img", { src: image, alt: name, className: "h-full w-full object-cover transition-transform group-hover:scale-105" })) : (_jsx("div", { className: "flex items-center justify-center h-full text-muted-foreground", children: "No Image" })) }), badge && (_jsx(Badge, { variant: "secondary", className: "w-fit", children: badge }))] }), _jsxs(CardContent, { className: "space-y-2", children: [_jsx(CardTitle, { className: "text-lg line-clamp-2", children: name }), description && (_jsx("p", { className: "text-sm text-muted-foreground line-clamp-2", children: description })), category && (_jsx("p", { className: "text-sm text-muted-foreground", children: category })), sku && (_jsxs("p", { className: "text-xs text-muted-foreground", children: ["SKU: ", sku] })), _jsxs("div", { className: "flex items-center justify-between pt-2", children: [_jsxs("span", { className: "text-2xl font-bold", children: [currency, " ", price.toFixed(2)] }), stock !== undefined && (_jsx(Badge, { variant: isOutOfStock ? "destructive" : isLowStock ? "warning" : "default", children: isOutOfStock ? 'Out of Stock' : `${stock} left` }))] })] }), variant === 'detailed' && (_jsx(CardFooter, { children: _jsx(Button, { className: "w-full", onClick: (e) => {
                        e.stopPropagation();
                        onAddToCart?.(id);
                    }, disabled: isOutOfStock, variant: "luxury", children: isOutOfStock ? 'Out of Stock' : 'Add to Cart' }) }))] }));
});
ProductCard.displayName = 'ProductCard';
export { ProductCard };
//# sourceMappingURL=product-card.js.map