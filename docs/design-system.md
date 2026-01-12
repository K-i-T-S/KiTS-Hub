# KiTS Hub Design System

A comprehensive design system for KiTS Hub micro-frontend architecture, ensuring consistency, accessibility, and beautiful user experiences across all applications.

## Table of Contents

1. [Principles](#principles)
2. [Colors](#colors)
3. [Typography](#typography)
4. [Spacing](#spacing)
5. [Layout](#layout)
6. [Components](#components)
7. [Accessibility](#accessibility)
8. [Animation](#animation)
9. [Dark Mode](#dark-mode)
10. [Usage Guidelines](#usage-guidelines)

## Principles

Our design system is built on four core principles:

### 1. Consistency
- Unified visual language across all applications
- Reusable components and patterns
- Predictable user interactions

### 2. Accessibility
- WCAG 2.1 AA compliance as minimum standard
- Keyboard-first navigation
- Screen reader compatibility
- High contrast ratios

### 3. Flexibility
- Component variants for different use cases
- Theme customization support
- Responsive design patterns

### 4. Performance
- Optimized bundle sizes
- Efficient CSS and animations
- Tree-shakable components

## Colors

### Primary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary 50 | `#f0f9ff` | Light backgrounds |
| Primary 500 | `#0ea5e9` | Primary actions, links |
| Primary 600 | `#0284c7` | Primary hover states |
| Primary 900 | `#0c4a6e` | Dark mode primary |

### Secondary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Secondary 50 | `#f8fafc` | Light backgrounds |
| Secondary 500 | `#64748b` | Secondary text |
| Secondary 900 | `#0f172a` | Dark mode backgrounds |

### Accent Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Accent 500 | `#a855f7` | Highlights, accents |
| Accent 600 | `#9333ea` | Accent hover states |
| Accent 900 | `#581c87` | Dark mode accents |

### Semantic Colors

| Type | Hex | Usage |
|------|-----|-------|
| Success 500 | `#22c55e` | Success states, confirmations |
| Warning 500 | `#f59e0b` | Warnings, cautions |
| Error 500 | `#ef4444` | Errors, destructive actions |
| Info 500 | `#0ea5e9` | Information, help |

### Luxury Gradient

```css
background: linear-gradient(135deg, #d946ef 0%, #7c3aed 50%, #2563eb 100%);
```

Used for premium features and special CTAs.

## Typography

### Font Families

```css
font-family-sans: 'Inter', system-ui, sans-serif;
font-family-mono: 'JetBrains Mono', Consolas, monospace;
```

### Type Scale

| Size | px | rem | Usage |
|------|----|-----|-------|
| xs | 12px | 0.75rem | Small labels, captions |
| sm | 14px | 0.875rem | Body text, small buttons |
| base | 16px | 1rem | Default body text |
| lg | 18px | 1.125rem | Large body text |
| xl | 20px | 1.25rem | Small headings |
| 2xl | 24px | 1.5rem | Section headings |
| 3xl | 30px | 1.875rem | Page headings |
| 4xl | 36px | 2.25rem | Large headings |
| 5xl | 48px | 3rem | Hero headings |
| 6xl | 60px | 3.75rem | Display headings |

### Font Weights

| Weight | Usage |
|--------|-------|
| 400 (Regular) | Body text |
| 500 (Medium) | Emphasis, buttons |
| 600 (Semibold) | Headings |
| 700 (Bold) | Strong emphasis |

## Spacing

### Base Grid

All spacing is based on a 4px grid system:

| Token | px | rem | Usage |
|-------|----|-----|-------|
| 1 | 4px | 0.25rem | Micro spacing |
| 2 | 8px | 0.5rem | Small spacing |
| 3 | 12px | 0.75rem | Default spacing |
| 4 | 16px | 1rem | Standard spacing |
| 6 | 24px | 1.5rem | Section spacing |
| 8 | 32px | 2rem | Large spacing |
| 12 | 48px | 3rem | Component spacing |
| 16 | 64px | 4rem | Page spacing |
| 20 | 80px | 5rem | Section breaks |

### Semantic Spacing

- **Component Padding**: 16px - 24px
- **Section Margins**: 48px - 80px
- **Button Padding**: 8px - 16px
- **Input Padding**: 8px - 12px

## Layout

### Container Sizes

| Breakpoint | Max Width | Usage |
|-------------|-----------|-------|
| sm | 640px | Mobile |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |
| 2xl | 1536px | Wide screens |

### Grid System

12-column grid system with responsive breakpoints:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
}

.col-span-1 { grid-column: span 1; }
.col-span-2 { grid-column: span 2; }
/* ... up to col-span-12 */
```

### Flexbox Utilities

```css
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
```

## Components

### Button Variants

| Variant | Usage |
|---------|-------|
| `default` | Primary actions |
| `secondary` | Secondary actions |
| `outline` | Bordered buttons |
| `ghost` | Minimal buttons |
| `destructive` | Destructive actions |
| `luxury` | Premium features |
| `gradient` | Special CTAs |
| `glass` | Overlay buttons |

### Card Variants

| Variant | Usage |
|---------|-------|
| `default` | Standard cards |
| `elevated` | Important content |
| `gradient` | Featured content |
| `glass` | Overlay cards |
| `luxury` | Premium cards |
| `outlined` | Bordered cards |
| `ghost` | Minimal cards |

### Alert Types

| Type | Usage |
|------|-------|
| `default` | General information |
| `success` | Success confirmations |
| `warning` | Warnings and cautions |
| `destructive` | Errors and issues |
| `info` | Help and guidance |

## Accessibility

### Color Contrast

All text and background combinations meet WCAG 2.1 AA standards:

- **Normal Text**: 4.5:1 contrast ratio minimum
- **Large Text**: 3:1 contrast ratio minimum
- **Interactive Elements**: 3:1 contrast ratio minimum

### Focus Management

- Visible focus indicators on all interactive elements
- Logical tab order
- Skip links for keyboard navigation
- Focus trapping in modals

### Screen Reader Support

- Semantic HTML elements
- Proper ARIA labels and roles
- Descriptive alt text for images
- Announcements for dynamic content

### Keyboard Navigation

- All functionality accessible via keyboard
- Consistent keyboard shortcuts
- No keyboard traps
- Clear focus indicators

## Animation

### Principles

- **Purposeful**: Animations should have meaning
- **Subtle**: Avoid overwhelming effects
- **Performant**: Use CSS transforms and opacity
- **Respectful**: Honor motion preferences

### Duration

| Type | Duration |
|------|----------|
| Micro | 150ms |
| Fast | 200ms |
| Standard | 300ms |
| Slow | 500ms |

### Easing

```css
.ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
.ease-out: cubic-bezier(0, 0, 0.2, 1);
.ease-in: cubic-bezier(0.4, 0, 1, 1);
```

### Animation Classes

```css
.animate-float { animation: float 6s ease-in-out infinite; }
.animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
.animate-pulse-slow { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
```

## Dark Mode

### Implementation

Dark mode is implemented using CSS custom properties:

```css
:root {
  --color-background: 255 255 255;
  --color-foreground: 15 23 42;
}

.dark {
  --color-background: 15 23 42;
  --color-foreground: 248 250 252;
}
```

### Color Adaptations

All colors have dark mode variants that maintain proper contrast and readability.

### Toggle Implementation

```tsx
const [darkMode, setDarkMode] = useState(false)

useEffect(() => {
  document.documentElement.classList.toggle('dark', darkMode)
}, [darkMode])
```

## Usage Guidelines

### Component Composition

```tsx
// ✅ Good: Semantic composition
<Card>
  <CardHeader>
    <CardTitle>Header</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Actions</CardFooter>
</Card>

// ❌ Avoid: Breaking component structure
<div className="kits-card">
  <h3>Not using CardTitle</h3>
</div>
```

### Variant Selection

```tsx
// ✅ Good: Appropriate variants
<Button variant="luxury">Premium Feature</Button>
<Alert variant="warning">Warning Message</Alert>

// ❌ Avoid: Inappropriate variants
<Button variant="destructive">Save Changes</Button>
<Alert variant="luxury">Error Message</Alert>
```

### Accessibility Best Practices

```tsx
// ✅ Good: Proper labeling
<Button aria-label="Close dialog" onClick={onClose}>
  <XIcon />
</Button>

// ✅ Good: Semantic HTML
<Card role="article" aria-labelledby="card-title">
  <CardTitle id="card-title">Title</CardTitle>
</Card>

// ❌ Avoid: Missing accessibility
<Button onClick={onClose}>
  <XIcon />
</Button>
```

### Performance Considerations

```tsx
// ✅ Good: Lazy loading heavy components
const HeavyChart = lazy(() => import('./HeavyChart'))

// ✅ Good: Using memo for expensive components
const ExpensiveComponent = memo(({ data }) => {
  // Component logic
})

// ❌ Avoid: Unnecessary re-renders
const BadComponent = ({ data }) => {
  const [state, setState] = useState({})
  // Component logic that re-renders unnecessarily
}
```

## Contributing

When contributing to the design system:

1. **Follow the principles** - Consistency, accessibility, flexibility, performance
2. **Test accessibility** - Use screen readers and keyboard navigation
3. **Check contrast** - Ensure all color combinations meet WCAG standards
4. **Document changes** - Update this documentation for any new patterns
5. **Test in context** - Verify components work across different applications

## Tools and Resources

### Development Tools

- **Storybook**: Component development and documentation
- **Chrome DevTools**: Accessibility audit and performance analysis
- **axe DevTools**: Automated accessibility testing
- **Color Contrast Analyzer**: Verify color combinations

### Design Tools

- **Figma**: Design system documentation and component design
- **Contrast**: Color contrast checking
- **Lighthouse**: Performance and accessibility audits

### Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Accessibility Guide](https://reactjs.org/docs/accessibility.html)
