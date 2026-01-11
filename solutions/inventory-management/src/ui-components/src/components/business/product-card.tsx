import * as React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { cn } from '../../utils/cn'

export interface ProductCardProps {
  id: string
  name: string
  description?: string
  price: number
  currency?: string
  image?: string
  category?: string
  stock?: number
  sku?: string
  badge?: string
  onClick?: () => void
  onAddToCart?: (productId: string) => void
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
}

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({
    id,
    name,
    description,
    price,
    currency = 'USD',
    image,
    category,
    stock,
    sku,
    badge,
    onClick,
    onAddToCart,
    className,
    variant = 'default'
  }, ref) => {
    const isOutOfStock = stock !== undefined && stock <= 0
    const isLowStock = stock !== undefined && stock > 0 && stock <= 5

    if (variant === 'compact') {
      return (
        <div
          ref={ref}
          className={cn(
            "flex items-center space-x-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer",
            className
          )}
          onClick={onClick}
        >
          {image && (
            <img
              src={image}
              alt={name}
              className="w-16 h-16 object-cover rounded-md"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{name}</h4>
            {sku && <p className="text-sm text-muted-foreground">SKU: {sku}</p>}
            <p className="text-sm font-medium">
              {currency} {price.toFixed(2)}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            {badge && <Badge variant="secondary">{badge}</Badge>}
            {stock !== undefined && (
              <Badge variant={isOutOfStock ? "destructive" : isLowStock ? "warning" : "default"}>
                {isOutOfStock ? 'Out of Stock' : `${stock} left`}
              </Badge>
            )}
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onAddToCart?.(id)
              }}
              disabled={isOutOfStock}
            >
              Add
            </Button>
          </div>
        </div>
      )
    }

    return (
      <Card
        ref={ref}
        className={cn(
          "group hover:shadow-lg transition-all duration-300 cursor-pointer",
          isOutOfStock && "opacity-75",
          className
        )}
        onClick={onClick}
        variant="elevated"
      >
        <CardHeader className="pb-3">
          <div className="aspect-square w-full overflow-hidden rounded-md bg-muted">
            {image ? (
              <img
                src={image}
                alt={name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No Image
              </div>
            )}
          </div>
          {badge && (
            <Badge variant="secondary" className="w-fit">
              {badge}
            </Badge>
          )}
        </CardHeader>
        
        <CardContent className="space-y-2">
          <CardTitle className="text-lg line-clamp-2">{name}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
          {category && (
            <p className="text-sm text-muted-foreground">{category}</p>
          )}
          {sku && (
            <p className="text-xs text-muted-foreground">SKU: {sku}</p>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-2xl font-bold">
              {currency} {price.toFixed(2)}
            </span>
            {stock !== undefined && (
              <Badge variant={isOutOfStock ? "destructive" : isLowStock ? "warning" : "default"}>
                {isOutOfStock ? 'Out of Stock' : `${stock} left`}
              </Badge>
            )}
          </div>
        </CardContent>
        
        {variant === 'detailed' && (
          <CardFooter>
            <Button
              className="w-full"
              onClick={(e) => {
                e.stopPropagation()
                onAddToCart?.(id)
              }}
              disabled={isOutOfStock}
              variant="luxury"
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </CardFooter>
        )}
      </Card>
    )
  }
)

ProductCard.displayName = 'ProductCard'

export { ProductCard }
