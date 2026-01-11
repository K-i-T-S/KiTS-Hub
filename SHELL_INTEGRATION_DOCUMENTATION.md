# KiTS Hub Shell Integration Documentation

## Overview

The KiTS Hub Shared Shell is the central host application that orchestrates all 6 business solutions using Module Federation. It provides a unified user experience with seamless navigation between solutions while maintaining each solution's independence.

## Architecture

### Module Federation Configuration

The shell is configured as a **host** application that consumes **remote** applications:

```javascript
// webpack.config.cjs - Module Federation Setup
new ModuleFederationPlugin({
  name: 'shell',
  remotes: {
    inventoryManagement: 'inventoryManagement@http://localhost:4177/remoteEntry.js',
    pointOfSale: 'pointOfSale@http://localhost:4178/remoteEntry.js',
    crmSystem: 'crmSystem@http://localhost:4179/remoteEntry.js',
    hrManagement: 'hrManagement@http://localhost:4180/remoteEntry.js',
    accountingSystem: 'accountingSystem@http://localhost:4181/remoteEntry.js',
    analyticsDashboard: 'analyticsDashboard@http://localhost:4182/remoteEntry.js',
  },
  shared: {
    react: { singleton: true, requiredVersion: dependencies.react },
    'react-dom': { singleton: true, requiredVersion: dependencies['react-dom'] },
    '@supabase/supabase-js': { singleton: true },
    'lucide-react': { singleton: false },
    'react-router-dom': { singleton: true },
  },
})
```

### Remote Applications

Each business solution is configured as a remote application exposing its components:

| Solution | Port | Exposed Components |
|----------|------|-------------------|
| Inventory Management | 4177 | InventoryApp, InventoryDashboard, ProductsPage, SuppliersPage, LocationsPage, ReportsPage, SettingsPage |
| Point of Sale | 4178 | PosApp, PosDashboard, CheckoutPage, TransactionsPage, ReceiptsPage, SettingsPage |
| CRM System | 4179 | CrmApp, CrmDashboard, CustomersPage, CommunicationsPage, SalesPage, SettingsPage |
| HR Management | 4180 | HrApp, HrDashboard, EmployeesPage, AttendancePage, PayrollPage, SettingsPage |
| Accounting System | 4181 | AccountingApp, AccountingDashboard, TransactionsPage, InvoicesPage, ReportsPage, SettingsPage |
| Analytics Dashboard | 4182 | AnalyticsApp, AnalyticsDashboard, ReportsPage, KpiPage, TrendsPage, SettingsPage |

## Features Implemented

### 1. Remote Component Loading

```typescript
// Dynamic import with error handling
const InventoryApp = React.lazy(() => 
  import('inventoryManagement/./InventoryApp')
    .catch(() => ({ default: () => (
      <RemoteComponent remoteName="inventoryManagement" componentKey="app" />
    )}))
);
```

### 2. Error Boundaries & Fallbacks

- **Application-level ErrorBoundary**: Catches all unhandled errors
- **Remote-specific error handling**: Graceful fallbacks when remote applications fail to load
- **Loading states**: Smooth loading indicators during remote component loading

### 3. Navigation System

#### Features:
- **Active state indicators**: Visual feedback for current solution
- **Solution switching**: Seamless navigation between applications
- **Mobile responsive**: Collapsible menu for mobile devices
- **Breadcrumb navigation**: Hierarchical path indicators
- **User menu**: Profile and authentication controls

#### Navigation Structure:
```
/                    - Dashboard/Overview
/inventory/*         - Inventory Management
/pos/*               - Point of Sale
/crm/*               - CRM System
/hr/*                - HR Management
/accounting/*        - Accounting System
/analytics/*         - Analytics Dashboard
/settings            - System Configuration
```

### 4. Authentication & Tenant Context

#### AuthProvider Features:
- **Multi-tenant support**: Tenant switching and context
- **User management**: Role-based access control
- **Session persistence**: Maintains auth state across navigation
- **Mock authentication**: Demo user for development

```typescript
const { user, tenant, signIn, signOut, switchTenant } = useAuth();
```

### 5. Layout System

#### Components:
- **Tenant/User Info Bar**: Organization and user information
- **Breadcrumb Navigation**: Path tracking and navigation
- **Main Content Area**: Responsive container for remote applications
- **Footer**: Links to help, documentation, and support

### 6. Responsive Design

- **Desktop**: Full navigation with all features
- **Tablet**: Condensed navigation with collapsible menu
- **Mobile**: Hamburger menu with full-screen navigation

## File Structure

```
shared-shell/
├── src/
│   ├── components/
│   │   ├── Layout.tsx                    # Main layout wrapper
│   │   ├── Navigation.tsx                # Navigation header
│   │   ├── ErrorBoundary.tsx            # Error handling
│   │   ├── BreadcrumbNavigation.tsx      # Breadcrumb component
│   │   └── ui/                           # Reusable UI components
│   ├── contexts/
│   │   └── AuthContext.tsx               # Authentication state
│   ├── lib/
│   │   ├── remote-config.ts              # Remote configuration
│   │   ├── utils.ts                      # Utility functions
│   │   └── supabase.ts                   # Database client
│   ├── pages/
│   │   ├── Dashboard.tsx                 # Business dashboard
│   │   └── Settings.tsx                  # Settings page
│   ├── App.tsx                           # Main application
│   ├── index.tsx                         # Entry point
│   └── index.css                         # Global styles
├── public/
│   └── index.html                        # HTML template
├── webpack.config.cjs                    # Webpack configuration
├── package.json                          # Dependencies
└── README.md                             # Documentation
```

## Development

### Prerequisites

1. All remote applications must be running on their designated ports
2. Node.js 18+ and npm/yarn installed
3. Dependencies installed in shared-shell directory

### Starting Development

```bash
# Start all remote applications (in separate terminals)
cd solutions/inventory-management && npm run dev     # Port 4177
cd solutions/point-of-sale && npm run dev            # Port 4178
cd solutions/crm-system && npm run dev               # Port 4179
cd solutions/hr-management && npm run dev           # Port 4180
cd solutions/accounting-system && npm run dev       # Port 4181
cd solutions/analytics-dashboard && npm run dev      # Port 4182

# Start the shell application
cd shared-shell && npm run dev                         # Port 3000
```

### Testing

Run the comprehensive integration test script:

```bash
./scripts/test-shell-integration.sh
```

This script tests:
- Service availability on all ports
- RemoteEntry.js accessibility
- Shell route loading
- Deep linking functionality
- Authentication context
- Error handling
- Performance metrics

## Configuration

### Environment Variables

```env
# .env.local (development)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Production
VITE_SUPABASE_URL=production_supabase_url
VITE_SUPABASE_ANON_KEY=production_supabase_anon_key
```

### Customization

#### Adding New Remote Applications

1. Update `webpack.config.cjs` remotes configuration
2. Add route in `App.tsx`
3. Update navigation items in `Navigation.tsx`
4. Add remote configuration in `remote-config.ts`

#### Modifying Navigation

Edit `src/components/Navigation.tsx`:
- Add new navigation items to the `navigationItems` array
- Update icons and descriptions
- Modify responsive behavior

#### Customizing Layout

Edit `src/components/Layout.tsx`:
- Modify tenant info bar
- Update footer content
- Adjust responsive breakpoints

## Troubleshooting

### Common Issues

#### Remote Application Not Loading
1. **Check if remote service is running**: Verify the remote application is accessible on its port
2. **Verify remoteEntry.js**: Ensure `http://localhost:PORT/remoteEntry.js` returns valid JavaScript
3. **Check console errors**: Look for Module Federation errors in browser console
4. **Network issues**: Verify CORS headers are properly configured

#### Navigation Issues
1. **Route not found**: Check if route is properly configured in `App.tsx`
2. **Active state not working**: Verify `isActivePath` logic in `Navigation.tsx`
3. **Mobile menu not working**: Check JavaScript errors and CSS styles

#### Authentication Issues
1. **User context not available**: Ensure `AuthProvider` wraps the application
2. **Tenant switching not working**: Verify tenant data structure in `AuthContext`

### Debug Mode

Enable debug logging by setting:
```typescript
// In App.tsx or components
console.log('Debug: Remote loading...', remoteName, componentKey);
```

### Performance Optimization

1. **Code Splitting**: Remote applications are automatically code-split
2. **Lazy Loading**: Components load only when needed
3. **Shared Dependencies**: React and other libraries are shared between shell and remotes
4. **Caching**: Browser caches remoteEntry.js and component chunks

## Production Deployment

### Build Process

```bash
# Build shell for production
cd shared-shell
npm run build

# Build all remote applications
for solution in inventory-management point-of-sale crm-system hr-management accounting-system analytics-dashboard; do
  cd solutions/$solution
  npm run build
  cd ../..
done
```

### Deployment Considerations

1. **Static File Serving**: Ensure all built files are served correctly
2. **Remote URLs**: Update remote URLs in webpack config to production URLs
3. **HTTPS**: Use HTTPS in production for security
4. **CDN**: Consider using CDN for better performance
5. **Monitoring**: Set up monitoring for remote application availability

## Best Practices

### Development
1. **Test locally before deploying**: Always run integration tests
2. **Version compatibility**: Ensure shared dependencies versions match
3. **Error boundaries**: Implement proper error handling in all remote applications
4. **Loading states**: Provide good UX with loading indicators

### Performance
1. **Optimize bundle sizes**: Keep remote application bundles small
2. **Use lazy loading**: Load components only when needed
3. **Implement caching**: Cache remoteEntry.js and component chunks
4. **Monitor performance**: Track loading times and error rates

### Security
1. **Validate inputs**: Sanitize all user inputs
2. **Use HTTPS**: Secure all communications
3. **Implement authentication**: Proper auth flow with secure tokens
4. **Rate limiting**: Protect against abuse

## Future Enhancements

### Planned Features
1. **Real-time updates**: WebSocket integration for live data
2. **Offline support**: Service worker for offline functionality
3. **Advanced error reporting**: Integration with error tracking services
4. **Performance monitoring**: Real-time performance metrics
5. **A/B testing**: Framework for feature experimentation

### Scalability
1. **Microservices**: Backend service decomposition
2. **Event-driven architecture**: Message queue integration
3. **Multi-region deployment**: Geographic distribution
4. **Auto-scaling**: Dynamic resource allocation

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Run integration test script
4. Check remote application logs
5. Verify network connectivity

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Maintainer**: KiTS Hub Development Team
