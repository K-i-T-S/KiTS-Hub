import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
    variants: {
        variant: {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-purple-glow',
            destructive: 'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
            outline: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
            link: 'text-primary underline-offset-4 hover:underline',
            luxury: 'bg-gradient-luxury text-white hover:opacity-90 shadow-luxury',
            gradient: 'bg-gradient-primary text-white hover:opacity-90 shadow-purple-glow',
            glass: 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20',
        },
        size: {
            default: 'h-9 px-4 py-2 has-[>svg]:px-3',
            sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
            lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
            icon: 'size-9',
            'icon-sm': 'size-8',
            'icon-lg': 'size-10',
            xl: 'h-12 rounded-lg px-8 text-base has-[>svg]:px-6',
            '2xl': 'h-14 rounded-xl px-10 text-lg has-[>svg]:px-8',
        },
        animation: {
            none: '',
            scale: 'hover:scale-105 active:scale-95',
            bounce: 'hover:animate-bounce-subtle',
            glow: 'hover:shadow-purple-glow-lg',
            float: 'hover:animate-float',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
        animation: 'scale',
    },
});
const Button = React.forwardRef(({ className, variant, size, animation, asChild = false, loading = false, loadingText, leftIcon, rightIcon, fullWidth = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (_jsxs(Comp, { className: cn(buttonVariants({ variant, size, animation, className }), fullWidth && 'w-full', loading && 'cursor-not-allowed'), ref: ref, disabled: disabled || loading, ...props, children: [loading && (_jsxs("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", "aria-hidden": "true", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] })), !loading && leftIcon && (_jsx("span", { className: "inline-flex items-center", "aria-hidden": "true", children: leftIcon })), _jsx("span", { className: "truncate", children: loading ? (loadingText || 'Loading...') : children }), !loading && rightIcon && (_jsx("span", { className: "inline-flex items-center", "aria-hidden": "true", children: rightIcon }))] }));
});
Button.displayName = 'Button';
export { Button, buttonVariants };
//# sourceMappingURL=button.js.map