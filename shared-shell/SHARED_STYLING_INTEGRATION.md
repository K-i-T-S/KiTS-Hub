# Shared Styling Integration Guide

## Overview

The KiTS Hub platform uses a centralized shared styling system located in `@shared/ui-components` to ensure consistent design and branding across all micro-frontend applications. This guide explains how the shared shell integrates with and extends this shared design system.

## Architecture

### Shared Design System Location
```
@shared/
├── ui-components/
│   ├── src/
│   │   ├── styles/
│   │   │   └── globals.css          # Core design tokens and base styles
│   │   ├── components/             # Reusable UI components
│   │   ├── hooks/                  # Shared React hooks
│   │   └── utils/                  # Utility functions
│   ├── tailwind.config.js          # Shared Tailwind configuration
│   └── package.json
└── styles/
    └── rtl.css                     # RTL support styles
```

### Shared Shell Integration
```
shared-shell/
├── src/
│   ├── shared-styles.css          # Shell-specific extensions
│   ├── components/
│   └── pages/
└── package.json                   # Includes @kits-hub/ui-components dependency
```

## Design System Features

### 🎨 **Color System**
- **Primary Colors**: Purple-themed luxury palette
- **Semantic Colors**: Success, warning, error, info variants
- **Dark Mode**: Complete dark theme support
- **CSS Custom Properties**: Theme variables for easy customization

### 🎯 **Typography**
- **Font Stack**: System fonts with fallbacks
- **Type Scale**: Consistent sizing from xs to 6xl
- **Font Weights**: 400 (regular) to 700 (bold)
- **Line Heights**: Optimized for readability

### 📐 **Spacing System**
- **4px Base Grid**: Consistent spacing units
- **Scale**: 4px to 80px (1 to 20)
- **Semantic Spacing**: Component-specific utilities
- **Responsive Breakpoints**: Mobile-first approach

### 🎭 **Component Variants**
- **Button Variants**: default, luxury, gradient, glass, etc.
- **Card Variants**: elevated, luxury, outlined, ghost
- **Animation Variants**: float, bounce, glow, scale
- **Size Variants**: sm, default, lg, xl, 2xl

## Integration Implementation

### 1. **CSS Import Strategy**

The shared shell imports the shared design system and extends it:

```css
/* shared-styles.css */
@import url('../../shared/ui-components/src/styles/globals.css');

/* Shell-specific extensions */
.shell-layout {
  min-height: 100vh;
  background-color: oklch(var(--background));
  color: oklch(var(--foreground));
}
```

### 2. **Component Integration**

Shell components use shared design tokens:

```tsx
import { Button, Card } from '@kits-hub/ui-components';

function ShellComponent() {
  return (
    <Card variant="luxury" className="shell-card">
      <Button variant="luxury" size="lg">
        Luxury Button
      </Button>
    </Card>
  );
}
```

### 3. **Theme Variables**

The shared system uses CSS custom properties:

```css
:root {
  --background: oklch(0.09 0 0);
  --foreground: oklch(0.95 0 0);
  --primary: oklch(0.95 0 0);
  --purple-500: #a855f7;
  --radius: 0.625rem;
}
```

## Shell-Specific Extensions

### 🏗️ **Layout Classes**
```css
.shell-layout      /* Main layout container */
.shell-sidebar      /* Sidebar styling */
.shell-topbar      /* Top navigation bar */
.shell-content      /* Main content area */
```

### 🧭 **Navigation Classes**
```css
.nav-link          /* Navigation links */
.nav-link.active   /* Active navigation state */
.nav-link:hover    /* Hover state */
```

### 🎨 **Enhanced Components**
```css
.shell-card.luxury    /* Luxury card variant */
.shell-button         /* Shell-specific buttons */
.shell-search         /* Search input styling */
```

### 📊 **Stats Cards**
```css
.shell-stats-card     /* Statistics cards */
.shell-stats-card.primary
.shell-stats-card.success
```

### 🔔 **Notifications**
```css
.shell-toast          /* Toast notifications */
.shell-toast.success
.shell-toast.error
```

## Usage Examples

### **Basic Component Usage**
```tsx
import { Button, Card, Badge } from '@kits-hub/ui-components';

function Dashboard() {
  return (
    <div className="shell-layout">
      <Card variant="luxury" className="shell-stats-card primary">
        <div className="icon">
          <Package className="w-6 h-6" />
        </div>
        <h3>Total Revenue</h3>
        <p className="text-2xl font-semibold">$45,231</p>
        <Badge variant="success">+12.5%</Badge>
      </Card>
    </div>
  );
}
```

### **Navigation Integration**
```tsx
function Navigation() {
  return (
    <nav className="shell-sidebar">
      <a href="/dashboard" className="nav-link active">
        Dashboard
      </a>
      <a href="/inventory" className="nav-link">
        Inventory
      </a>
    </nav>
  );
}
```

### **Theme Integration**
```tsx
function ThemeToggle() {
  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <Button variant="ghost" onClick={toggleTheme}>
      Toggle Theme
    </Button>
  );
}
```

## Responsive Design

### **Mobile-First Approach**
```css
@media (max-width: 768px) {
  .shell-sidebar {
    position: fixed;
    left: -16rem;
    transition: left 0.3s ease;
  }
  
  .shell-sidebar.open {
    left: 0;
  }
}
```

### **Breakpoint System**
- **sm**: 640px and up
- **md**: 768px and up
- **lg**: 1024px and up
- **xl**: 1280px and up
- **2xl**: 1536px and up

## Animation System

### **Built-in Animations**
```css
.animate-float        /* Gentle floating effect */
.animate-bounce-subtle /* Subtle bounce */
.animate-spin-slow    /* Slow rotation */
.animate-gradient      /* Gradient animation */
```

### **Shell-Specific Animations**
```css
.shell-fade-in        /* Fade in effect */
.shell-slide-in       /* Slide in effect */
```

## Accessibility Features

### **WCAG 2.1 AA Compliance**
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Proper ARIA labels
- **Focus Management**: Visible focus indicators
- **High Contrast**: High contrast mode support
- **Reduced Motion**: Respects user preferences

### **Focus Styles**
```css
.focus-ring {
  outline: 2px solid oklch(var(--ring));
  outline-offset: 2px;
}
```

## Dark Mode Support

### **Automatic Theme Detection**
```css
@media (prefers-color-scheme: dark) {
  /* Dark mode styles */
}
```

### **Manual Theme Toggle**
```tsx
const enableDarkMode = () => {
  document.documentElement.classList.add('dark');
};

const enableLightMode = () => {
  document.documentElement.classList.remove('dark');
};
```

## Customization

### **Brand Colors**
```css
:root {
  --primary: oklch(0.95 0 0);           /* Override primary color */
  --purple-500: #your-brand-color;      /* Override purple accent */
}
```

### **Custom Components**
```css
.shell-custom-component {
  /* Use shared design tokens */
  background-color: oklch(var(--card));
  border: 1px solid oklch(var(--border));
  border-radius: var(--radius);
}
```

## Performance Optimization

### **CSS Optimization**
- **Minimal Imports**: Only import needed styles
- **Efficient Selectors**: Optimized CSS selectors
- **Critical CSS**: Above-the-fold styling prioritized

### **Bundle Optimization**
- **Tree Shaking**: Unused styles removed
- **CSS Compression**: Minified in production
- **Caching**: Proper cache headers for styles

## Best Practices

### **1. Use Shared Components**
```tsx
// ✅ Good - Use shared components
import { Button } from '@kits-hub/ui-components';

// ❌ Avoid - Custom button implementation
<button className="custom-button">Click</button>
```

### **2. Follow Design Tokens**
```css
/* ✅ Good - Use design tokens */
background-color: oklch(var(--background));

/* ❌ Avoid - Hardcoded colors */
background-color: #f8fafc;
```

### **3. Maintain Consistency**
```tsx
// ✅ Good - Consistent spacing
<div className="p-4 md:p-6 lg:p-8">

// ❌ Avoid - Inconsistent spacing
<div className="p-4 md:px-6 lg:py-8">
```

## Migration Guide

### **From Custom CSS to Shared Design System**

1. **Replace hardcoded colors** with design tokens
2. **Import shared components** instead of custom implementations
3. **Use shared utility classes** for consistent styling
4. **Update component variants** to match shared design system

### **Example Migration**
```css
/* Before */
.custom-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
}

/* After */
.custom-card {
  background-color: oklch(var(--card));
  border: 1px solid oklch(var(--border));
  border-radius: var(--radius);
  padding: 1.5rem;
}
```

## Troubleshooting

### **Common Issues**

1. **Styles Not Loading**: Check CSS import path
2. **Theme Variables Not Working**: Verify CSS custom properties
3. **Responsive Issues**: Check breakpoint usage
4. **Animation Problems**: Verify animation classes

### **Debug Tools**
```css
/* Debug mode - show all variables */
* {
  outline: 1px solid red !important;
}
```

## Future Enhancements

### **Planned Features**
- **Component Library Expansion**: More business-specific components
- **Theme Builder**: Interactive theme customization
- **Design Tokens API**: Programmatic token access
- **Performance Monitoring**: CSS performance metrics

### **Integration Roadmap**
1. **Phase 1**: Complete shared styling integration
2. **Phase 2**: Component library expansion
3. **Phase 3**: Advanced theming system
4. **Phase 4**: Performance optimization

---

This shared styling integration ensures that the KiTS Hub platform maintains consistent design and branding across all micro-frontend applications while allowing for shell-specific customizations and enhancements.
