import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '../../utils/cn';
import { ShoppingCart, DollarSign } from 'lucide-react';
const SaleItem = React.forwardRef(({ id, productName, quantity, unitPrice, totalPrice, currency = 'USD', status = 'pending', timestamp, variant = 'default', className }, ref) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'processing': return 'default';
            case 'pending': return 'warning';
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return _jsx(Package, { className: "w-3 h-3" });
            case 'processing': return _jsx(Clock, { className: "w-3 h-3" });
            case 'pending': return _jsx(ShoppingCart, { className: "w-3 h-3" });
            case 'cancelled': return null;
            default: return null;
        }
    };
    if (variant === 'compact') {
        return (_jsxs("div", { ref: ref, className: cn("flex items-center justify-between p-3 border rounded-lg", className), children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(ShoppingCart, { className: "w-4 h-4 text-muted-foreground" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-sm", children: productName }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [quantity, " \u00D7 ", currency, " ", unitPrice.toFixed(2)] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: "font-medium text-sm", children: [currency, " ", totalPrice.toFixed(2)] }), _jsx(Badge, { variant: getStatusColor(status), size: "sm", children: status })] })] }));
    }
    return (_jsx(Card, { ref: ref, className: cn("transition-all duration-200 hover:shadow-md", className), variant: "default", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx(ShoppingCart, { className: "w-4 h-4 text-primary" }), _jsx("h4", { className: "font-medium", children: productName }), _jsxs(Badge, { variant: getStatusColor(status), className: "flex items-center space-x-1", children: [getStatusIcon(status), _jsx("span", { children: status })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Package, { className: "w-4 h-4 text-muted-foreground" }), _jsx("span", { className: "text-muted-foreground", children: "Quantity:" }), _jsx("span", { className: "font-medium", children: quantity })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(DollarSign, { className: "w-4 h-4 text-muted-foreground" }), _jsx("span", { className: "text-muted-foreground", children: "Unit Price:" }), _jsxs("span", { className: "font-medium", children: [currency, " ", unitPrice.toFixed(2)] })] })] }), timestamp && (_jsxs("div", { className: "flex items-center space-x-2 mt-2 text-xs text-muted-foreground", children: [_jsx(Clock, { className: "w-3 h-3" }), _jsx("span", { children: timestamp })] }))] }), _jsxs("div", { className: "text-right ml-4", children: [_jsxs("div", { className: "text-2xl font-bold text-primary", children: [currency, " ", totalPrice.toFixed(2)] }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Total" })] })] }) }) }));
});
SaleItem.displayName = 'SaleItem';
export { SaleItem };
//# sourceMappingURL=sale-item.js.map