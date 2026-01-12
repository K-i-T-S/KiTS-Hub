import * as React from 'react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { cn } from '../../utils/cn'
import { ShoppingCart, Calendar, DollarSign } from 'lucide-react'

export interface SaleItemProps {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  currency?: string
  status?: 'pending' | 'processing' | 'completed' | 'cancelled'
  timestamp?: string
  variant?: 'default' | 'compact'
  className?: string
}

const SaleItem = React.forwardRef<HTMLDivElement, SaleItemProps>(
  ({
    id,
    productName,
    quantity,
    unitPrice,
    totalPrice,
    currency = 'USD',
    status = 'pending',
    timestamp,
    variant = 'default',
    className
  }, ref) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'completed': return 'success'
        case 'processing': return 'default'
        case 'pending': return 'warning'
        case 'cancelled': return 'destructive'
        default: return 'outline'
      }
    }

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'completed': return <Package className="w-3 h-3" />
        case 'processing': return <Clock className="w-3 h-3" />
        case 'pending': return <ShoppingCart className="w-3 h-3" />
        case 'cancelled': return null
        default: return null
      }
    }

    if (variant === 'compact') {
      return (
        <div
          ref={ref}
          className={cn(
            "flex items-center justify-between p-3 border rounded-lg",
            className
          )}
        >
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            <div>
              <h4 className="font-medium text-sm">{productName}</h4>
              <p className="text-xs text-muted-foreground">
                {quantity} × {currency} {unitPrice.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">
              {currency} {totalPrice.toFixed(2)}
            </span>
            <Badge variant={getStatusColor(status)} size="sm">
              {status}
            </Badge>
          </div>
        </div>
      )
    }

    return (
      <Card
        ref={ref}
        className={cn(
          "transition-all duration-200 hover:shadow-md",
          className
        )}
        variant="default"
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <ShoppingCart className="w-4 h-4 text-primary" />
                <h4 className="font-medium">{productName}</h4>
                <Badge variant={getStatusColor(status)} className="flex items-center space-x-1">
                  {getStatusIcon(status)}
                  <span>{status}</span>
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{quantity}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Unit Price:</span>
                  <span className="font-medium">{currency} {unitPrice.toFixed(2)}</span>
                </div>
              </div>
              
              {timestamp && (
                <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{timestamp}</span>
                </div>
              )}
            </div>
            
            <div className="text-right ml-4">
              <div className="text-2xl font-bold text-primary">
                {currency} {totalPrice.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)

SaleItem.displayName = 'SaleItem'

export { SaleItem }
