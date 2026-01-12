import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Enhanced Card Component for KiTS Hub
 * Advanced card with animations, gradients, and accessibility features
 */
import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
const cardVariants = cva("rounded-lg border bg-card text-card-foreground shadow-sm", {
    variants: {
        variant: {
            default: 'border-border',
            elevated: 'border-border shadow-purple-glow',
            gradient: 'border-transparent bg-gradient-primary shadow-purple-glow',
            glass: 'border-white/20 bg-white/10 backdrop-blur-md shadow-luxury',
            luxury: 'border-purple-500/30 bg-gradient-luxury shadow-luxury',
            outlined: 'border-2 border-purple-500 bg-transparent',
            ghost: 'border-transparent bg-transparent shadow-none',
        },
        size: {
            sm: 'p-4',
            default: 'p-6',
            lg: 'p-8',
            xl: 'p-10',
        },
        animation: {
            none: '',
            hover: 'transition-all duration-300 hover:shadow-purple-glow hover:scale-105',
            float: 'transition-all duration-300 hover:shadow-purple-glow-lg hover:-translate-y-1',
            glow: 'transition-all duration-300 hover:shadow-purple-glow-lg',
            scale: 'transition-all duration-300 hover:scale-105',
        },
        interactive: {
            false: '',
            true: 'cursor-pointer active:scale-95',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
        animation: 'hover',
        interactive: false,
    },
});
const Card = React.forwardRef(({ className, variant, size, animation, interactive, asChild = false, ...props }, ref) => {
    return (_jsx("div", { ref: ref, className: cn(cardVariants({ variant, size, animation, interactive, className })), ...props }));
});
Card.displayName = 'Card';
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('flex flex-col space-y-1.5 p-6', className), ...props })));
CardHeader.displayName = 'CardHeader';
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (_jsx("h3", { ref: ref, className: cn('font-semibold leading-none tracking-tight', className), ...props })));
CardTitle.displayName = 'CardTitle';
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (_jsx("p", { ref: ref, className: cn('text-sm text-muted-foreground', className), ...props })));
CardDescription.displayName = 'CardDescription';
const CardContent = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('p-6 pt-0', className), ...props })));
CardContent.displayName = 'CardContent';
const CardFooter = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('flex items-center p-6 pt-0', className), ...props })));
CardFooter.displayName = 'CardFooter';
const EnhancedCard = React.forwardRef(({ className, variant, size, animation, interactive, header, title, description, footer, icon, badge, loading = false, error, children, ...props }, ref) => {
    return (_jsxs(Card, { ref: ref, className: cn('relative overflow-hidden', className), variant: variant, size: size, animation: animation, interactive: interactive, ...props, children: [loading && (_jsx("div", { className: "absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10", children: _jsx("div", { className: "animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" }) })), error && (_jsx("div", { className: "absolute inset-0 bg-destructive/10 border border-destructive/20 flex items-center justify-center z-10", children: _jsx("div", { className: "text-center p-4", children: _jsx("div", { className: "text-destructive text-sm font-medium", children: error }) }) })), (header || title || description || icon || badge) && (_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [icon && (_jsx("div", { className: "flex-shrink-0 text-primary", children: icon })), _jsxs("div", { children: [title && _jsx(CardTitle, { children: title }), description && _jsx(CardDescription, { children: description })] })] }), badge && (_jsx("div", { className: "flex-shrink-0", children: badge }))] }), header] })), children && _jsx(CardContent, { children: children }), footer && _jsx(CardFooter, { children: footer })] }));
});
EnhancedCard.displayName = 'EnhancedCard';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, EnhancedCard, cardVariants };
//# sourceMappingURL=card.js.map