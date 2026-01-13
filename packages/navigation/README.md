# @kits-hub/navigation

A comprehensive unified navigation system for the KiTS Hub ecosystem, providing context-aware breadcrumbs, global search, command palette, navigation history, and deep linking capabilities.

## Features

### 🧭 Context-Aware Breadcrumbs
- Automatic breadcrumb generation from navigation structure
- Customizable separators and icons
- Collapsible breadcrumbs for mobile
- Schema.org structured data support

### 🔍 Global Search (Cmd+K)
- Fuzzy search across navigation items
- Category-based result grouping
- Keyboard navigation support
- Quick actions and shortcuts

### ⌨️ Command Palette (Cmd+Shift+P)
- Extensible command system
- Contextual commands based on current page
- Keyboard shortcuts for common actions
- Custom command registration

### 📚 Navigation History
- Browser-like back/forward navigation
- Persistent history across sessions
- Frequent pages tracking
- Navigation analytics

### 🔗 Deep Linking
- URL parameter parsing and generation
- Campaign tracking support
- QR code generation
- Share functionality

## Installation

```bash
npm install @kits-hub/navigation
```

## Quick Start

```tsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { NavigationProvider, useNavigation, Breadcrumbs, GlobalSearch, CommandPalette } from '@kits-hub/navigation';

// Navigation configuration
const navigationItems = [
  {
    id: 'home',
    path: '/',
    label: 'Home',
    icon: <HomeIcon />,
    metadata: {
      description: 'Dashboard home',
      keywords: ['dashboard', 'main'],
      shortcut: 'home',
    },
  },
  {
    id: 'products',
    path: '/products',
    label: 'Products',
    icon: <PackageIcon />,
    children: [
      {
        id: 'product-list',
        path: '/products/list',
        label: 'Product List',
      },
      {
        id: 'product-create',
        path: '/products/create',
        label: 'Create Product',
      },
    ],
  },
];

function App() {
  return (
    <BrowserRouter>
      <NavigationProvider navigationItems={navigationItems}>
        <Layout />
      </NavigationProvider>
    </BrowserRouter>
  );
}

function Layout() {
  const { navigate } = useNavigation();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <Breadcrumbs items={useBreadcrumbs(navigationItems).breadcrumbs} />
      
      {/* Global Search */}
      <GlobalSearch
        isOpen={searchOpen}
        query={searchQuery}
        results={searchResults}
        onQueryChange={setSearchQuery}
        onSelect={(result) => navigate(result.path)}
        onClose={() => setSearchOpen(false)}
      />
      
      {/* Command Palette */}
      <CommandPalette
        isOpen={commandOpen}
        commands={commands}
        filteredCommands={filteredCommands}
        groupedCommands={groupedCommands}
        query={commandQuery}
        selectedCommand={selectedCommand}
        onQueryChange={setCommandQuery}
        onSelectCommand={executeCommand}
        onClose={() => setCommandOpen(false)}
      />
      
      {/* Page Content */}
      <main>
        {/* Your app content */}
      </main>
    </div>
  );
}
```

## Hooks

### useNavigation

Main navigation hook providing access to navigation state and actions.

```tsx
const {
  currentPath,
  breadcrumbs,
  canGoBack,
  canGoForward,
  navigate,
  goBack,
  goForward,
  searchQuery,
  searchResults,
  setSearchQuery,
  commandPaletteOpen,
  setCommandPaletteOpen,
  history,
  clearHistory,
  deepLinkParams,
  generateDeepLink,
  parseDeepLink,
} = useNavigation();
```

### useBreadcrumbs

Hook for breadcrumb management.

```tsx
const {
  breadcrumbs,
  setBreadcrumbs,
  addBreadcrumb,
  removeBreadcrumb,
  clearBreadcrumbs,
} = useBreadcrumbs(navigationItems);
```

### useGlobalSearch

Hook for global search functionality.

```tsx
const {
  query,
  results,
  isOpen,
  setQuery,
  setIsOpen,
  clearResults,
  executeSearch,
} = useGlobalSearch(navigationItems, additionalSearchItems);
```

### useCommandPalette

Hook for command palette functionality.

```tsx
const {
  isOpen,
  commands,
  filteredCommands,
  groupedCommands,
  query,
  selectedCommand,
  setIsOpen,
  setQuery,
  setSelectedCommand,
  executeCommand,
  registerCommand,
  unregisterCommand,
} = useCommandPalette(initialCommands);
```

### useNavigationHistory

Hook for navigation history management.

```tsx
const {
  history,
  currentIndex,
  canGoBack,
  canGoForward,
  goBack,
  goForward,
  addToHistory,
  clearHistory,
  getHistoryItem,
  getRecentHistory,
  getFrequentPages,
} = useNavigationHistory();
```

### useDeepLinking

Hook for deep linking functionality.

```tsx
const {
  params,
  generateLink,
  parseLink,
  navigateToLink,
  shareLink,
  generateQRCode,
  validateParams,
} = useDeepLinking();
```

## Components

### Breadcrumbs

Context-aware breadcrumb component.

```tsx
<Breadcrumbs
  items={breadcrumbs}
  showHomeIcon={true}
  separator={<ChevronRight />}
  maxItems={5}
  showTooltip={true}
/>
```

### GlobalSearch

Global search overlay component.

```tsx
<GlobalSearch
  isOpen={searchOpen}
  query={searchQuery}
  results={searchResults}
  onQueryChange={setSearchQuery}
  onSelect={(result) => navigate(result.path)}
  onClose={() => setSearchOpen(false)}
  placeholder="Search..."
  maxResults={10}
  showShortcuts={true}
/>
```

### CommandPalette

Command palette overlay component.

```tsx
<CommandPalette
  isOpen={commandOpen}
  commands={commands}
  filteredCommands={filteredCommands}
  groupedCommands={groupedCommands}
  query={commandQuery}
  selectedCommand={selectedCommand}
  onQueryChange={setCommandQuery}
  onSelectCommand={executeCommand}
  onClose={() => setCommandOpen(false)}
  placeholder="Type a command..."
/>
```

### NavigationHistory

Navigation history component.

```tsx
<NavigationHistory
  history={history}
  currentIndex={currentIndex}
  canGoBack={canGoBack}
  canGoForward={canGoForward}
  onGoBack={goBack}
  onGoForward={goForward}
  onNavigateToItem={(item) => navigate(item.path)}
  onClearHistory={clearHistory}
  maxItems={10}
  showTimestamps={true}
  showActions={true}
/>
```

## Configuration

The navigation system can be configured through the `NavigationProvider`:

```tsx
const config = {
  breadcrumbs: {
    enabled: true,
    maxItems: 5,
    showHome: true,
    separator: ' / ',
  },
  search: {
    enabled: true,
    shortcut: 'cmd+k',
    placeholder: 'Search...',
    maxResults: 10,
    fuzzySearch: true,
    searchIn: ['title', 'description', 'keywords', 'path'],
  },
  commandPalette: {
    enabled: true,
    shortcut: 'cmd+shift+p',
    placeholder: 'Type a command...',
    maxResults: 10,
    categories: ['navigation', 'actions', 'settings'],
  },
  history: {
    enabled: true,
    maxItems: 50,
    persistAcrossSessions: true,
  },
  deepLinking: {
    enabled: true,
    baseUrl: 'https://your-app.com',
    routeParams: ['id', 'view', 'tab'],
  },
};

<NavigationProvider navigationItems={navigationItems} config={config}>
  {/* Your app */}
</NavigationProvider>
```

## Navigation Items Structure

```tsx
interface NavigationItem {
  id: string;
  path: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
  children?: NavigationItem[];
  permissions?: UserRole[];
  metadata?: {
    category?: string;
    description?: string;
    keywords?: string[];
    shortcut?: string;
  };
}
```

## Examples

### Adding Custom Commands

```tsx
const customCommands = [
  {
    id: 'create-invoice',
    title: 'Create Invoice',
    description: 'Create a new invoice',
    icon: <FileTextIcon />,
    shortcut: 'invoice',
    category: 'actions',
    action: () => navigate('/invoices/create'),
    keywords: ['invoice', 'create', 'new'],
  },
];

const { registerCommand } = useCommandPalette();

// Register commands
useEffect(() => {
  customCommands.forEach(registerCommand);
}, [registerCommand]);
```

### Deep Linking Example

```tsx
const { generateLink, shareLink } = useDeepLinking();

// Generate a deep link
const link = generateLink('/products/123', {
  view: 'details',
  tab: 'inventory',
});

// Share the link
await shareLink('/products/123', {
  view: 'details',
  tab: 'inventory',
});
```

### Search Integration

```tsx
const additionalSearchItems = [
  {
    id: 'product-123',
    title: 'Premium Widget',
    description: 'High-quality widget for industrial use',
    path: '/products/123',
    category: 'products',
    keywords: ['widget', 'industrial', 'premium'],
  },
];

const { query, results, setQuery } = useGlobalSearch(
  navigationItems,
  additionalSearchItems
);
```

## TypeScript Support

The package is fully typed with TypeScript. All components and hooks accept proper type definitions and provide excellent IDE support.

## Accessibility

- All components follow ARIA guidelines
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- High contrast mode support

## Performance

- Optimized search with fuzzy matching
- Efficient history management
- Minimal re-renders
- Lazy loading of components
- Memory leak prevention

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

MIT License - see LICENSE file for details.
