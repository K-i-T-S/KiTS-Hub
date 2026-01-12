import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";
const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
    variants: {
        variant: {
            default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
            secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
            destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
            outline: "text-foreground",
            warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
            success: "border-transparent bg-green-500 text-white hover:bg-green-600",
            info: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
            luxury: "border-transparent bg-gradient-luxury text-white hover:opacity-90",
        },
        size: {
            default: "px-2.5 py-0.5 text-xs",
            sm: "px-2 py-0.5 text-xs",
            lg: "px-3 py-1 text-sm",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
const Badge = React.forwardRef(({ className, variant, size, ...props }, ref) => (_jsx("div", { ref: ref, className: cn(badgeVariants({ variant, size }), className), ...props })));
Badge.displayName = "Badge";
export { Badge, badgeVariants };
//# sourceMappingURL=badge.js.map