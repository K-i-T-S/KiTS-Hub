# KiTS Hub UI Components Library

A comprehensive, luxury-designed React component library built for the KiTS Hub ecosystem. This shared component library provides consistent, accessible, and beautiful UI components across all KiTS Hub solutions.

## 🚀 Features

- **Framework Agnostic**: Pure React components - works with any React framework
- **TypeScript First**: Full TypeScript support with comprehensive type definitions
- **Luxury Design System**: Beautiful, modern design with purple-themed gradients and animations
- **Accessible**: Built with accessibility in mind, following WAI-ARIA guidelines
- **Theme Support**: Built-in light/dark theme support with CSS custom properties
- **Business Components**: Specialized components for inventory, CRM, HR, and sales
- **Utility Hooks**: Common hooks for API, auth, tenant management, and notifications
- **Utility Functions**: Formatters for currency, dates, barcodes, and email validation
- **Module Federation Ready**: Optimized for micro-frontend architecture

## 📦 Installation

```bash
npm install @kits-hub/ui-components
# or
yarn add @kits-hub/ui-components
# or
pnpm add @kits-hub/ui-components
```

## �� Quick Start

```tsx
import { Button, Card, ProductCard } from '@kits-hub/ui-components'

function App() {
  return (
    <div className="p-4">
      <Button variant="luxury" size="lg">
        Luxury Button
      </Button>
      
      <Card variant="elevated" className="mt-4">
        <h3>Beautiful Card</h3>
        <p>With luxury design and animations</p>
      </Card>
      
      <ProductCard
        id="1"
        name="Premium Product"
        price={99.99}
        image="/product.jpg"
        className="mt-4"
      />
    </div>
  )
}
```

## 🧩 Components

### UI Components

#### Button
Enhanced button with multiple variants, sizes, animations, and loading states.

```tsx
<Button variant="luxury" size="lg" loading={isLoading}>
  Submit
</Button>
```

**Variants**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `luxury`, `gradient`, `glass`
**Sizes**: `sm`, `default`, `lg`, `xl`, `2xl`, `icon`, `icon-sm`, `icon-lg`
**Animations**: `none`, `scale`, `bounce`, `glow`, `float`

#### Card
Advanced card component with variants, animations, and enhanced features.

```tsx
<Card variant="elevated" animation="float" interactive>
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```

**Variants**: `default`, `elevated`, `gradient`, `glass`, `luxury`, `outlined`, `ghost`
**Sizes**: `sm`, `default`, `lg`, `xl`
**Animations**: `none`, `hover`, `float`, `glow`, `scale`

#### Input, Select, Checkbox, Dialog, Alert, Table, Badge
Standard form and display components with luxury styling.

### Business Components

#### ProductCard
Specialized card for displaying products with inventory information.

```tsx
<ProductCard
  id="prod-123"
  name="Premium Widget"
  description="High-quality widget for all your needs"
  price={99.99}
  currency="USD"
  image="/widget.jpg"
  category="Electronics"
  stock={15}
  sku="WID-001"
  badge="New"
  variant="detailed"
  onAddToCart={(id) => console.log('Add to cart:', id)}
/>
```

#### CustomerCard
Customer information card with contact details and order history.

```tsx
<CustomerCard
  id="cust-456"
  name="John Doe"
  email="john@example.com"
  phone="+1234567890"
  totalOrders={12}
  totalSpent={1299.99}
  loyaltyPoints={250}
  status="vip"
  onContact={() => console.log('Contact customer')}
/>
```

#### SaleItem
Component for displaying individual sale items.

```tsx
<SaleItem
  id="sale-789"
  productName="Premium Widget"
  quantity={2}
  unitPrice={99.99}
  totalPrice={199.98}
  status="completed"
  timestamp="2024-01-15 14:30"
/>
```

#### EmployeeCard
Employee information card with performance metrics.

```tsx
<EmployeeCard
  id="emp-101"
  name="Jane Smith"
  email="jane@company.com"
  position="Senior Developer"
  department="Engineering"
  salary={85000}
  performance={92}
  status="active"
/>
```

## 🪝 Hooks

### useApi
Hook for making API requests with loading states and error handling.

```tsx
const { data, loading, error, execute } = useApi<User[]>('/api/users')

const handleSubmit = async () => {
  await execute({
    method: 'POST',
    body: { name: 'John', email: 'john@example.com' }
  })
}
```

### useAuth
Authentication hook with user management and permissions.

```tsx
const { user, login, logout, hasPermission } = useAuth()

// Login
await login('user@example.com', 'password')

// Check permissions
if (hasPermission('delete')) {
  // Show delete button
}
```

### useTenant
Tenant management for multi-tenant applications.

```tsx
const { tenant, switchTenant, updateSettings } = useTenant()

await switchTenant('new-tenant-id')
await updateSettings({ theme: 'dark' })
```

### useNotification
Notification system for user feedback.

```tsx
const { addNotification } = useNotification()

addNotification({
  type: 'success',
  title: 'Success!',
  message: 'Operation completed successfully'
})
```

## 🛠️ Utilities

### formatCurrency
Currency formatting with locale support.

```tsx
import { formatCurrency, formatCurrencyByCode } from '@kits-hub/ui-components'

formatCurrency(99.99, { currency: 'USD', locale: 'en-US' }) // "$99.99"
formatCurrencyByCode(99.99, 'EUR') // "€99.99"
```

### formatDate
Date formatting with relative time support.

```tsx
import { formatDate, formatRelativeTime } from '@kits-hub/ui-components'

formatDate(new Date(), { dateStyle: 'long' }) // "January 15, 2024"
formatRelativeTime(new Date(Date.now() - 3600000)) // "1 hour ago"
```

### generateBarcode
Barcode generation in SVG format.

```tsx
import { generateBarcodeSVG, downloadBarcode } from '@kits-hub/ui-components'

const svg = generateBarcodeSVG('123456789', { format: 'CODE128' })
downloadBarcode('123456789', 'barcode.svg')
```

### validateEmail
Advanced email validation with domain checking.

```tsx
import { validateEmail, isCorporateEmail } from '@kits-hub/ui-components'

validateEmail('user@example.com') // true
isCorporateEmail('user@company.com') // true
```

## 🎨 Theming

The library uses CSS custom properties for theming. Include the CSS in your application:

```tsx
import '@kits-hub/ui-components/styles/globals.css'
```

### Light/Dark Theme
Toggle themes by adding/removing the `dark` class to the `html` element:

```tsx
// Enable dark theme
document.documentElement.classList.add('dark')

// Enable light theme
document.documentElement.classList.remove('dark')
```

### Custom Colors
Override CSS custom properties for custom branding:

```css
:root {
  --primary: #your-brand-color;
  --purple-500: #your-purple-accent;
}
```

## 🏗️ Module Federation

This library is optimized for Module Federation. Configure your webpack:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    alias: {
      '@kits-hub/ui-components': path.resolve(__dirname, 'node_modules/@kits-hub/ui-components'),
    },
  },
}
```

## 📱 Responsive Design

All components are built with responsive design in mind. Use Tailwind's responsive utilities:

```tsx
<Card className="p-4 md:p-6 lg:p-8">
  <h2 className="text-lg md:text-xl lg:text-2xl">Responsive Title</h2>
</Card>
```

## ♿ Accessibility

Components follow WAI-ARIA guidelines and include:

- Proper semantic HTML
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- High contrast mode support
- Reduced motion support

## 🤝 Contributing

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development: `npm run dev`
4. Make your changes
5. Run tests: `npm test`
6. Build: `npm run build`

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the examples

---

Built with ❤️ for the KiTS Hub ecosystem
