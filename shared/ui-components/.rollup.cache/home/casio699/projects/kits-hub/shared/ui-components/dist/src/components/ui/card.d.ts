/**
 * Enhanced Card Component for KiTS Hub
 * Advanced card with animations, gradients, and accessibility features
 */
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const cardVariants: (props?: ({
    variant?: "default" | "ghost" | "luxury" | "gradient" | "glass" | "elevated" | "outlined" | null | undefined;
    size?: "default" | "sm" | "lg" | "xl" | null | undefined;
    animation?: "none" | "scale" | "glow" | "float" | "hover" | null | undefined;
    interactive?: boolean | null | undefined;
} & import("class-variance-authority/dist/types").ClassProp) | undefined) => string;
export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
    asChild?: boolean;
}
declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
declare const CardHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
declare const CardTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLParagraphElement>>;
declare const CardDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
declare const CardContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
declare const CardFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export interface EnhancedCardProps extends CardProps {
    header?: React.ReactNode;
    title?: string;
    description?: string;
    footer?: React.ReactNode;
    icon?: React.ReactNode;
    badge?: React.ReactNode;
    loading?: boolean;
    error?: string;
}
declare const EnhancedCard: React.ForwardRefExoticComponent<EnhancedCardProps & React.RefAttributes<HTMLDivElement>>;
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, EnhancedCard, cardVariants };
//# sourceMappingURL=card.d.ts.map