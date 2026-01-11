# KiTS Hub Shared Shell

The host application for the KiTS Hub micro-frontend architecture using Module Federation.

## Overview

The Shared Shell serves as the main container application that loads and orchestrates multiple micro-frontend applications:

- **Inventory Management** (Port 4177)
- **Point of Sale** (Port 4178)
- **CRM System** (Port 4179)
- **HR Management** (Port 4180)
- **Accounting System** (Port 4181)
- **Analytics Dashboard** (Port 4182)

## Features

- 🏗️ **Module Federation**: Dynamic loading of remote applications
- 🎨 **Shared Design System**: Consistent UI/UX across all applications
- 🔐 **Centralized Authentication**: Single sign-on for all solutions
- 📱 **Responsive Design**: Mobile-first approach with Tailwind CSS
- ⚡ **Performance Optimized**: Lazy loading and code splitting
- 🛡️ **Error Boundaries**: Graceful error handling and recovery
- 🔧 **Developer Friendly**: Hot reload and development tools

## Quick Start

### Prerequisites

- Node.js 20.x
- All remote applications running on their respective ports

### Installation

\`\`\`bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your configuration
\`\`\`

### Development

\`\`\`bash
# Start development server
npm run dev

# Or with custom port
npm run start
\`\`\`

The shell will be available at \`http://localhost:3000\`

### Production Build

\`\`\`bash
# Build for production
npm run build

# Preview production build
npm run preview
\`\`\`

## Architecture

### Module Federation Configuration

The shell exposes itself as a host and consumes remote applications:

\`\`\`javascript
// webpack.config.js
new ModuleFederationPlugin({
  name: 'shell',
  remotes: {
    inventory: 'inventory@http://localhost:4177/remoteEntry.js',
    pos: 'pos@http://localhost:4178/remoteEntry.js',
    crm: 'crm@http://localhost:4179/remoteEntry.js',
    hr: 'hr@http://localhost:4180/remoteEntry.js',
    accounting: 'accounting@http://localhost:4181/remoteEntry.js',
    analytics: 'analytics@http://localhost:4182/remoteEntry.js',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
    'react-router-dom': { singleton: true },
    '@supabase/supabase-js': { singleton: true },
  }
})
\`\`\`

### Directory Structure

\`\`\`
shared-shell/
├── src/
│   ├── components/
│   │   ├── Layout.tsx          # Main layout wrapper
│   │   ├── Navigation.tsx      # Navigation header
│   │   ├── ErrorBoundary.tsx   # Error handling
│   │   └── ui/                 # Reusable UI components
│   ├── pages/
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   └── Settings.tsx        # Settings page
│   ├── lib/
│   │   ├── utils.ts            # Utility functions
│   │   └── supabase.ts         # Supabase client
│   ├── App.tsx                 # Main application
│   └── index.tsx               # Entry point
├── public/
│   └── index.html              # HTML template
├── webpack.config.js           # Webpack configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── Dockerfile                 # Docker configuration
\`\`\`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| \`VITE_SUPABASE_URL\` | Supabase instance URL | \`http://localhost:54321\` |
| \`VITE_SUPABASE_ANON_KEY\` | Supabase anonymous key | - |
| \`VITE_DEV_SERVER_PORT\` | Development server port | \`3000\` |
| \`VITE_ENABLE_DEBUG_MODE\` | Enable debug logging | \`false\` |

## Navigation

The shell provides a unified navigation experience:

- **Dashboard**: Overview of all business metrics
- **Inventory**: Product and stock management
- **Point of Sale**: Sales processing
- **CRM**: Customer relationship management
- **HR**: Employee management
- **Accounting**: Financial management
- **Analytics**: Business intelligence
- **Settings**: System configuration

## Error Handling

The shell includes comprehensive error boundaries:

- **Remote Loading Errors**: Handles failures when loading remote applications
- **Network Errors**: Graceful degradation for connectivity issues
- **Runtime Errors**: Catches and displays application errors
- **Recovery Mechanisms**: Retry buttons and fallback navigation

## Development Tips

### Hot Reload

The shell supports hot reload for rapid development:

\`\`\`bash
npm run dev
\`\`\`

### Debugging Remote Applications

To debug remote applications:

1. Ensure remote applications are running
2. Check browser console for Module Federation errors
3. Verify remoteEntry.js files are accessible
4. Use Network tab to inspect loading failures

### Adding New Remote Applications

1. Update \`webpack.config.js\` remotes configuration
2. Add lazy import in \`App.tsx\`
3. Add navigation item in \`Navigation.tsx\`
4. Update route configuration

## Performance Optimization

- **Lazy Loading**: Remote applications loaded on-demand
- **Code Splitting**: Shared dependencies optimized
- **Caching**: Browser caching for remote entries
- **Tree Shaking**: Unused code eliminated

## Security

- **CORS Headers**: Proper cross-origin configuration
- **Content Security Policy**: XSS protection
- **Environment Variables**: Sensitive data protected
- **Authentication**: Centralized auth system

## Docker Deployment

\`\`\`bash
# Build Docker image
docker build -t kits-shared-shell .

# Run container
docker run -p 3000:3000 kits-shared-shell
\`\`\`

## Troubleshooting

### Common Issues

1. **Remote applications not loading**
   - Check if remote servers are running
   - Verify port configurations
   - Inspect network connectivity

2. **Module Federation errors**
   - Clear browser cache
   - Check remoteEntry.js accessibility
   - Verify webpack configuration

3. **Style conflicts**
   - Ensure consistent Tailwind CSS versions
   - Check CSS isolation
   - Verify shared dependencies

### Debug Commands

\`\`\`bash
# Check remote application status
curl http://localhost:4177/remoteEntry.js

# Verify shell build
npm run build && npm run preview

# Test all connections
npm run test:connections
\`\`\`

## Contributing

1. Follow the existing code style
2. Add proper TypeScript types
3. Include error boundaries for new components
4. Update documentation for new features

## License

© 2026 KiTS Hub. All rights reserved.
