import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { cn } from '../../utils/cn'
import { Mail, Phone, MapPin, Calendar } from 'lucide-react'

export interface CustomerCardProps {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  joinedDate?: string
  totalOrders?: number
  totalSpent?: number
  loyaltyPoints?: number
  status?: 'active' | 'inactive' | 'vip'
  avatar?: string
  onClick?: () => void
  onContact?: () => void
  className?: string
  variant?: 'default' | 'compact'
}

const CustomerCard = React.forwardRef<HTMLDivElement, CustomerCardProps>(
  ({
    id,
    name,
    email,
    phone,
    address,
    joinedDate,
    totalOrders,
    totalSpent,
    loyaltyPoints,
    status = 'active',
    avatar,
    onClick,
    onContact,
    className,
    variant = 'default'
  }, ref) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'vip': return 'luxury'
        case 'active': return 'default'
        case 'inactive': return 'secondary'
        default: return 'outline'
      }
    }

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
          <div className="flex-shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium truncate">{name}</h4>
              <Badge variant={getStatusColor(status)} size="sm">
                {status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">{email}</p>
            {totalOrders && (
              <p className="text-xs text-muted-foreground">
                {totalOrders} orders • {totalSpent ? `$${totalSpent.toFixed(2)}` : ''}
              </p>
            )}
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onContact?.()
            }}
          >
            Contact
          </Button>
        </div>
      )
    }

    return (
      <Card
        ref={ref}
        className={cn(
          "group hover:shadow-lg transition-all duration-300 cursor-pointer",
          className
        )}
        onClick={onClick}
        variant="elevated"
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-medium text-primary">
                    {name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <CardTitle className="text-lg">{name}</CardTitle>
                <Badge variant={getStatusColor(status)} className="mt-1">
                  {status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{email}</span>
            </div>
            
            {phone && (
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{phone}</span>
              </div>
            )}
            
            {address && (
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground truncate">{address}</span>
              </div>
            )}
            
            {joinedDate && (
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Joined {joinedDate}</span>
              </div>
            )}
          </div>
          
          {(totalOrders || totalSpent || loyaltyPoints) && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                {totalOrders && (
                  <div>
                    <div className="text-2xl font-bold text-primary">{totalOrders}</div>
                    <div className="text-xs text-muted-foreground">Orders</div>
                  </div>
                )}
                {totalSpent && (
                  <div>
                    <div className="text-2xl font-bold text-primary">${totalSpent.toFixed(0)}</div>
                    <div className="text-xs text-muted-foreground">Total Spent</div>
                  </div>
                )}
                {loyaltyPoints && (
                  <div>
                    <div className="text-2xl font-bold text-primary">{loyaltyPoints}</div>
                    <div className="text-xs text-muted-foreground">Points</div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <Button
            className="w-full"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onContact?.()
            }}
          >
            Contact Customer
          </Button>
        </CardContent>
      </Card>
    )
  }
)

CustomerCard.displayName = 'CustomerCard'

export { CustomerCard }
