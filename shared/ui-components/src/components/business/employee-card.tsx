import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { cn } from '../../utils/cn'
import { Mail, Phone, Briefcase, Calendar, DollarSign, MapPin } from 'lucide-react'

export interface EmployeeCardProps {
  id: string
  name: string
  email: string
  phone?: string
  position: string
  department?: string
  salary?: number
  currency?: string
  hireDate?: string
  location?: string
  status?: 'active' | 'on-leave' | 'terminated'
  avatar?: string
  performance?: number
  onClick?: () => void
  onContact?: () => void
  className?: string
  variant?: 'default' | 'compact'
}

const EmployeeCard = React.forwardRef<HTMLDivElement, EmployeeCardProps>(
  ({
    id,
    name,
    email,
    phone,
    position,
    department,
    salary,
    currency = 'USD',
    hireDate,
    location,
    status = 'active',
    avatar,
    performance,
    onClick,
    onContact,
    className,
    variant = 'default'
  }, ref) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'active': return 'success'
        case 'on-leave': return 'warning'
        case 'terminated': return 'destructive'
        default: return 'outline'
      }
    }

    const getPerformanceColor = (performance: number) => {
      if (performance >= 90) return 'success'
      if (performance >= 70) return 'default'
      if (performance >= 50) return 'warning'
      return 'destructive'
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
            <p className="text-sm text-muted-foreground truncate">{position}</p>
            {department && (
              <p className="text-xs text-muted-foreground">{department}</p>
            )}
          </div>
          
          <div className="text-right">
            {performance && (
              <Badge variant={getPerformanceColor(performance)} size="sm">
                {performance}%
              </Badge>
            )}
          </div>
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
                <p className="text-sm text-muted-foreground">{position}</p>
                {department && (
                  <Badge variant="outline" className="mt-1">
                    {department}
                  </Badge>
                )}
              </div>
            </div>
            <Badge variant={getStatusColor(status)}>
              {status.toUpperCase()}
            </Badge>
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
            
            {location && (
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{location}</span>
              </div>
            )}
            
            {hireDate && (
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Hired {hireDate}</span>
              </div>
            )}
            
            {salary && (
              <div className="flex items-center space-x-2 text-sm">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Salary: {currency} {salary.toLocaleString()}</span>
              </div>
            )}
          </div>
          
          {performance && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Performance</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        performance >= 90 && "bg-green-500",
                        performance >= 70 && performance < 90 && "bg-blue-500",
                        performance >= 50 && performance < 70 && "bg-yellow-500",
                        performance < 50 && "bg-red-500"
                      )}
                      style={{ width: `${performance}%` }}
                    />
                  </div>
                  <Badge variant={getPerformanceColor(performance)} size="sm">
                    {performance}%
                  </Badge>
                </div>
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
            Contact Employee
          </Button>
        </CardContent>
      </Card>
    )
  }
)

EmployeeCard.displayName = 'EmployeeCard'

export { EmployeeCard }
