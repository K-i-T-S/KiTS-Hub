import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../../utils/cn';
import { Mail, Phone, Calendar } from 'lucide-react';
const EmployeeCard = React.forwardRef(({ id, name, email, phone, position, department, salary, currency = 'USD', hireDate, location, status = 'active', avatar, performance, onClick, onContact, className, variant = 'default' }, ref) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'on-leave': return 'warning';
            case 'terminated': return 'destructive';
            default: return 'outline';
        }
    };
    const getPerformanceColor = (performance) => {
        if (performance >= 90)
            return 'success';
        if (performance >= 70)
            return 'default';
        if (performance >= 50)
            return 'warning';
        return 'destructive';
    };
    if (variant === 'compact') {
        return (_jsxs("div", { ref: ref, className: cn("flex items-center space-x-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer", className), onClick: onClick, children: [_jsx("div", { className: "flex-shrink-0", children: avatar ? (_jsx("img", { src: avatar, alt: name, className: "w-10 h-10 rounded-full object-cover" })) : (_jsx("div", { className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center", children: _jsx("span", { className: "text-sm font-medium text-primary", children: name.split(' ').map(n => n[0]).join('').toUpperCase() }) })) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("h4", { className: "font-medium truncate", children: name }), _jsx(Badge, { variant: getStatusColor(status), size: "sm", children: status })] }), _jsx("p", { className: "text-sm text-muted-foreground truncate", children: position }), department && (_jsx("p", { className: "text-xs text-muted-foreground", children: department }))] }), _jsx("div", { className: "text-right", children: performance && (_jsxs(Badge, { variant: getPerformanceColor(performance), size: "sm", children: [performance, "%"] })) })] }));
    }
    return (_jsxs(Card, { ref: ref, className: cn("group hover:shadow-lg transition-all duration-300 cursor-pointer", className), onClick: onClick, variant: "elevated", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [avatar ? (_jsx("img", { src: avatar, alt: name, className: "w-12 h-12 rounded-full object-cover" })) : (_jsx("div", { className: "w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center", children: _jsx("span", { className: "text-lg font-medium text-primary", children: name.split(' ').map(n => n[0]).join('').toUpperCase() }) })), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: name }), _jsx("p", { className: "text-sm text-muted-foreground", children: position }), department && (_jsx(Badge, { variant: "outline", className: "mt-1", children: department }))] })] }), _jsx(Badge, { variant: getStatusColor(status), children: status.toUpperCase() })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [_jsx(Mail, { className: "w-4 h-4 text-muted-foreground" }), _jsx("span", { className: "text-muted-foreground", children: email })] }), phone && (_jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [_jsx(Phone, { className: "w-4 h-4 text-muted-foreground" }), _jsx("span", { className: "text-muted-foreground", children: phone })] })), location && (_jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [_jsx(MapPin, { className: "w-4 h-4 text-muted-foreground" }), _jsx("span", { className: "text-muted-foreground", children: location })] })), hireDate && (_jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [_jsx(Calendar, { className: "w-4 h-4 text-muted-foreground" }), _jsxs("span", { className: "text-muted-foreground", children: ["Hired ", hireDate] })] })), salary && (_jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [_jsx(DollarSign, { className: "w-4 h-4 text-muted-foreground" }), _jsxs("span", { className: "text-muted-foreground", children: ["Salary: ", currency, " ", salary.toLocaleString()] })] }))] }), performance && (_jsx("div", { className: "border-t pt-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Performance" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-24 bg-muted rounded-full h-2", children: _jsx("div", { className: cn("h-2 rounded-full transition-all duration-300", performance >= 90 && "bg-green-500", performance >= 70 && performance < 90 && "bg-blue-500", performance >= 50 && performance < 70 && "bg-yellow-500", performance < 50 && "bg-red-500"), style: { width: `${performance}%` } }) }), _jsxs(Badge, { variant: getPerformanceColor(performance), size: "sm", children: [performance, "%"] })] })] }) })), _jsx(Button, { className: "w-full", variant: "outline", onClick: (e) => {
                            e.stopPropagation();
                            onContact?.();
                        }, children: "Contact Employee" })] })] }));
});
EmployeeCard.displayName = 'EmployeeCard';
export { EmployeeCard };
//# sourceMappingURL=employee-card.js.map