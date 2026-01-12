# @kits-hub/ui

A comprehensive, accessible, and beautiful UI component library for KiTS Hub micro-frontend architecture. Built with React, TypeScript, and Tailwind CSS.

## Features

- 🎨 **Beautiful Design**: Modern, consistent design system with luxury gradients and animations
- ♿ **Accessible**: WCAG 2.1 AA compliant with proper ARIA labels and keyboard navigation
- 🔧 **TypeScript First**: Full TypeScript support with comprehensive type definitions
- 🎯 **Component Variants**: Flexible component variants using class-variance-authority
- 📱 **Responsive**: Mobile-first responsive design
- 🌙 **Dark Mode**: Built-in dark mode support
- 🎭 **Animations**: Smooth transitions and micro-interactions
- 📦 **Tree Shakable**: Optimized bundle size with tree-shaking support
- 🔄 **Module Federation Ready**: Designed for micro-frontend architecture

## Installation

```bash
npm install @kits-hub/ui
# or
yarn add @kits-hub/ui
```

## Dependencies

This package requires the following peer dependencies:

```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0"
}
```

## Usage

### Basic Setup

```tsx
import { Button, Card, Input } from '@kits-hub/ui'
import '@kits-hub/ui/styles'

function App() {
  return (
    <div className="p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="Enter your email"
          />
          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
          />
          <Button className="w-full" variant="luxury">
            Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Component Examples

#### Button

```tsx
import { Button } from '@kits-hub/ui'

// Basic button
<Button>Click me</Button>

// With variants
<Button variant="luxury">Luxury Button</Button>
<Button variant="gradient">Gradient Button</Button>
<Button variant="glass">Glass Button</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>

// With animations
<Button animation="float">Float on hover</Button>
<Button animation="glow">Glow on hover</Button>

// With icons
<Button leftIcon={<PlusIcon />} leftIcon={<ArrowRightIcon />}>
  Add Item
</Button>

// Loading state
<Button loading loadingText="Processing...">
  Submit
</Button>
```

#### Input

```tsx
import { Input } from '@kits-hub/ui'

// Basic input
<Input placeholder="Enter text..." />

// With label and helper text
<Input
  label="Email Address"
  type="email"
  placeholder="john@example.com"
  helperText="We'll never share your email."
/>

// With error state
<Input
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
/>

// With adornments
<Input
  label="Search"
  startAdornment={<SearchIcon />}
  endAdornment={<ClearIcon />}
/>
```

#### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button } from '@kits-hub/ui'

function ProductCard() {
  return (
    <Card variant="elevated" animation="hover">
      <CardHeader>
        <CardTitle>Product Name</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Product description goes here...</p>
      </CardContent>
      <CardFooter>
        <Button>Add to Cart</Button>
      </CardFooter>
    </Card>
  )
}

// Enhanced card with built-in features
<EnhancedCard
  title="Dashboard"
  description="View your analytics and insights"
  icon={<DashboardIcon />}
  badge={<Badge variant="success">New</Badge>}
  loading={false}
>
  {/* Card content */}
</EnhancedCard>
```

#### Alert

```tsx
import { Alert } from '@kits-hub/ui'

<Alert variant="success" title="Success!">
  Your changes have been saved successfully.
</Alert>

<Alert variant="warning" title="Warning" dismissible>
  Please review your changes before proceeding.
</Alert>

<Alert variant="destructive" title="Error">
  Something went wrong. Please try again.
</Alert>
```

#### Badge

```tsx
import { Badge } from '@kits-hub/ui'

// Basic badge
<Badge>Default</Badge>

// With variants
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="luxury">Premium</Badge>

// With dot indicator
<Badge dot variant="success">Active</Badge>

// With count
<Badge count={5} />
<Badge count={150} maxCount={99} />
```

## Design System

### Colors

The library uses a comprehensive color palette:

- **Primary**: Blue tones for primary actions
- **Secondary**: Neutral grays for secondary elements
- **Accent**: Purple tones for highlights
- **Success**: Green tones for success states
- **Warning**: Yellow tones for warnings
- **Error**: Red tones for errors
- **Luxury**: Purple gradient for premium features

### Typography

- **Font Family**: Inter (sans-serif), JetBrains Mono (monospace)
- **Scale**: 12px to 60px with harmonious ratios
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Spacing

- **Base Grid**: 4px base grid system
- **Scale**: Consistent spacing from 4px to 80px
- **Semantic**: Component-specific spacing utilities

## Customization

### Tailwind CSS Integration

The library uses a prefixed Tailwind configuration (`kits-`) to avoid conflicts:

```css
/* Your app can use the components without conflicts */
.kits-button { /* Component styles */ }
.kits-input { /* Component styles */ }
.kits-card { /* Component styles */ }
```

### Theme Customization

You can extend the theme in your Tailwind config:

```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './node_modules/@kits-hub/ui/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Your custom theme extensions
    }
  }
}
```

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- ✅ Proper ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Screen reader compatibility
- ✅ Color contrast compliance
- ✅ Semantic HTML structure

## Module Federation

This library is designed to work seamlessly with Module Federation:

```js
// webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      shared: {
        '@kits-hub/ui': {
          singleton: true,
          requiredVersion: require('@kits-hub/ui/package.json').version,
        },
      },
    }),
  ],
}
```

## Development

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build library
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint

# Testing
npm run test

# Storybook
npm run storybook
```

## License

MIT © KiTS Hub Team
