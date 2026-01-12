import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../../utils/cn';
import { Mail, Phone, Calendar, MapPin } from 'lucide-react';
const CustomerCard = React.forwardRef(({ id, name, email, phone, address, joinedDate, totalOrders, totalSpent, loyaltyPoints, status = 'active', avatar, onClick, onContact, className, variant = 'default' }, ref) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'vip': return 'luxury';
            case 'active': return 'default';
            case 'inactive': return 'secondary';
            default: return 'outline';
        }
    };
    if (variant === 'compact') {
        return (_jsxs("div", { ref: ref, className: cn("flex items-center space-x-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer", className), onClick: onClick, children: [_jsx("div", { className: "flex-shrink-0", children: avatar ? (_jsx("img", { src: avatar, alt: name, className: "w-10 h-10 rounded-full object-cover" })) : (_jsx("div", { className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center", children: _jsx("span", { className: "text-sm font-medium text-primary", children: name.split(' ').map(n => n[0]).join('').toUpperCase() }) })) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("h4", { className: "font-medium truncate", children: name }), _jsx(Badge, { variant: getStatusColor(status), size: "sm", children: status })] }), _jsx("p", { className: "text-sm text-muted-foreground truncate", children: email }), totalOrders && (_jsxs("p", { className: "text-xs text-muted-foreground", children: [totalOrders, " orders \u2022 ", totalSpent ? `$${totalSpent.toFixed(2)}` : ''] }))] }), _jsx(Button, { size: "sm", variant: "outline", onClick: (e) => {
                        e.stopPropagation();
                        onContact?.();
                    }, children: "Contact" })] }));
    }
    return (_jsxs(Card, { ref: ref, className: cn("group hover:shadow-lg transition-all duration-300 cursor-pointer", className), onClick: onClick, variant: "elevated", children: [_jsx(CardHeader, { children: _jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex items-center space-x-3", children: [avatar ? (_jsx("img", { src: avatar, alt: name, className: "w-12 h-12 rounded-full object-cover" })) : (_jsx("div", { className: "w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center", children: _jsx("span", { className: "text-lg font-medium text-primary", children: name.split(' ').map(n => n[0]).join('').toUpperCase() }) })), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: name }), _jsx(Badge, { variant: getStatusColor(status), className: "mt-1", children: status.toUpperCase() })] })] }) }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [_jsx(Mail, { className: "w-4 h-4 text-muted-foreground" }), _jsx("span", { className: "text-muted-foreground", children: email })] }), phone && (_jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [_jsx(Phone, { className: "w-4 h-4 text-muted-foreground" }), _jsx("span", { className: "text-muted-foreground", children: phone })] })), address && (_jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [_jsx(MapPin, { className: "w-4 h-4 text-muted-foreground" }), _jsx("span", { className: "text-muted-foreground truncate", children: address })] })), joinedDate && (_jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [_jsx(Calendar, { className: "w-4 h-4 text-muted-foreground" }), _jsxs("span", { className: "text-muted-foreground", children: ["Joined ", joinedDate] })] }))] }), (totalOrders || totalSpent || loyaltyPoints) && (_jsx("div", { className: "border-t pt-4", children: _jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [totalOrders && (_jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-primary", children: totalOrders }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Orders" })] })), totalSpent && (_jsxs("div", { children: [_jsxs("div", { className: "text-2xl font-bold text-primary", children: ["$", totalSpent.toFixed(0)] }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Total Spent" })] })), loyaltyPoints && (_jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-primary", children: loyaltyPoints }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Points" })] }))] }) })), _jsx(Button, { className: "w-full", variant: "outline", onClick: (e) => {
                            e.stopPropagation();
                            onContact?.();
                        }, children: "Contact Customer" })] })] }));
});
CustomerCard.displayName = 'CustomerCard';
export { CustomerCard };
//# sourceMappingURL=customer-card.js.map