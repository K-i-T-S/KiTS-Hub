# KiTS Hub - Multi-Tenant SaaS Platform

<div align="center">

![KiTS Hub](kits-logo.png)

**Modern business solutions for Lebanon and beyond**

[🚀 Architecture](./ARCHITECTURE.md) • [📚 Solutions](./solutions/) • [🔧 Integration](./shared/integration/) • [🎨 Design System](./shared/ui-components/)

</div>

## Overview

KiTS Hub is a comprehensive multi-tenant SaaS platform that provides standalone but completely integratable business solutions. Each solution operates independently while maintaining seamless integration capabilities, following industry best practices for security, scalability, and user experience.

## 🏗️ Architecture

Our platform is built on modern technologies with a focus on:

- **Multi-Tenancy**: Each customer gets a dedicated Supabase instance
- **Microservices**: Independent solutions that can operate standalone
- **API-First**: RESTful APIs for all integrations
- **Real-Time**: Live data synchronization across solutions
- **Security**: Row-level security and tenant isolation

## 📦 Solutions

### 📦 Inventory Management
Complete inventory tracking with multi-location support, batch tracking, and real-time stock management.

**Features:**
- Product catalog with variants
- Multi-location inventory tracking
- Batch and expiration tracking
- Purchase order management
- Stock transfers and adjustments
- Low stock alerts and reordering

**Location:** `solutions/inventory-management/`

### 💳 Point of Sale
Modern POS system with payment processing, receipt generation, and inventory integration.

**Features:**
- Quick sale processing
- Multiple payment methods
- Receipt and invoice generation
- Cash management
- Customer integration
- Real-time inventory updates

**Location:** `solutions/point-of-sale/`

### 👥 CRM System
Customer relationship management with communication tracking and sales pipeline management.

**Features:**
- Customer database management
- Communication history
- Sales pipeline tracking
- Customer segmentation
- Loyalty programs
- Analytics and reporting

**Location:** `solutions/crm-system/`

### 👤 HR Management
Human resources management with employee records and payroll processing.

**Features:**
- Employee database
- Attendance tracking
- Payroll management
- Performance reviews
- Document management
- Leave management

**Location:** `solutions/hr-management/`

### 🧮 Accounting System
Double-entry accounting with financial reporting and compliance management.

**Features:**
- Chart of accounts
- Invoice and expense management
- Bank reconciliation
- Financial reporting
- Tax management
- Multi-currency support

**Location:** `solutions/accounting-system/`

### 📊 Analytics Dashboard
Business intelligence and analytics with cross-solution data aggregation.

**Features:**
- Real-time dashboards
- Custom reports
- Data visualization
- KPI tracking
- Export capabilities
- Scheduled reports

**Location:** `solutions/analytics-dashboard/`

## 🔧 Integration Architecture

Our solutions communicate through multiple integration patterns:

### Direct API Integration
Solutions call each other's APIs using tenant-specific credentials with proper authentication and rate limiting.

### Shared Database Access
For solutions within the same tenant, direct database access through RLS policies ensures data isolation while enabling complex queries.

### Event-Driven Communication
Real-time updates via Supabase subscriptions and webhooks enable immediate data synchronization across solutions.

### Webhook Integration
Automated data synchronization ensures consistency when events occur in any solution.

## 🗄️ Database Template

The shared Supabase template provides:

- **Multi-tenant schema** with proper isolation
- **Industry-standard tables** for all business functions
- **Row-level security** for data protection
- **Performance optimization** with proper indexing
- **Audit logging** for compliance

**Location:** `shared/supabase-template/`

## 🎨 Design System

Consistent UI/UX across all solutions with:

- **KiTS branding** and color scheme
- **Accessibility** compliance (WCAG 2.1 AA)
- **Internationalization** support (English/Arabic)
- **Responsive design** for all devices
- **Dark/light themes** for user preference

**Location:** `shared/ui-components/`

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **Supabase** CLI and account
- **Git** for version control

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/kits-hub/kits-hub.git
   cd kits-hub
   ```

2. **Set up environment**
   ```bash
   # Copy environment templates
   cp solutions/inventory-management/.env.example solutions/inventory-management/.env
   cp solutions/point-of-sale/.env.example solutions/point-of-sale/.env
   
   # Configure your Supabase credentials
   ```

3. **Install dependencies**
   ```bash
   # Install for all solutions
   npm run install:all
   
   # Or install for specific solution
   cd solutions/inventory-management && npm install
   ```

4. **Start development**
   ```bash
   # Start specific solution
   cd solutions/inventory-management && npm run dev
   
   # Start with hot reload on port 3001
   ```

### Production Deployment

Each solution is deployed independently:

```bash
# Build for production
cd solutions/inventory-management && npm run build

# Deploy to Vercel (example)
vercel --prod
```

## 📋 Subscription Plans

### Starter (Free)
- Basic inventory management
- Up to 100 products
- Single location
- Basic reporting

### Basic ($29/month)
- Full inventory management
- Point of Sale system
- Customer management
- Multi-location support
- Advanced reporting

### Professional ($99/month)
- All Basic features
- Advanced CRM
- Batch tracking
- Expiration tracking
- Custom reports
- API access

### Enterprise ($299/month)
- All Professional features
- HR Management
- Accounting System
- Advanced analytics
- Custom integrations
- Priority support

## 🔐 Security

### Multi-Tenant Isolation
- **Row-Level Security** policies enforce data isolation
- **Tenant-specific** authentication and authorization
- **API key** management per solution
- **Audit logging** for all operations

### Data Protection
- **Encryption at rest** and in transit
- **Regular backups** with point-in-time recovery
- **Access controls** with role-based permissions
- **Compliance** with data protection regulations

## 🌍 Localization

Built for Lebanon with international support:

- **Arabic/RTL** support throughout
- **LBP currency** formatting
- **Local compliance** and regulations
- **Multi-language** interface
- **Cultural adaptation** for business practices

## 📊 Monitoring & Analytics

### System Health
- **Performance metrics** for all solutions
- **Error tracking** and alerting
- **Resource usage** monitoring
- **API response times** tracking

### Business Intelligence
- **Cross-solution analytics** and reporting
- **Customer behavior** tracking
- **Revenue analytics** and forecasting
- **Operational metrics** and KPIs

## 🤝 Contributing

We welcome contributions! Please follow our guidelines:

### Development Process
1. **Fork** the repository
2. **Create** feature branch
3. **Implement** changes with tests
4. **Document** new features
5. **Submit** pull request

### Code Standards
- **TypeScript** for all new code
- **ESLint** configuration must pass
- **Tests** required for new features
- **Documentation** for public APIs
- **Accessibility** compliance for UI components

### Commit Convention
```
feat: add new feature
fix: resolve bug
docs: update documentation
style: code formatting
refactor: code restructuring
test: add/update tests
chore: build process or dependencies
```

## 📚 Documentation

### Core Documentation
- [Architecture Overview](./ARCHITECTURE.md)
- [Integration Guide](./shared/integration/integration-architecture.md)
- [Database Schema](./shared/supabase-template/schema.sql)
- [Migration Guide](./shared/supabase-template/migration-guide.md)

### Solution Documentation
- [Inventory Management](./solutions/inventory-management/README.md)
- [Point of Sale](./solutions/point-of-sale/README.md)
- [CRM System](./solutions/crm-system/README.md)
- [HR Management](./solutions/hr-management/README.md)
- [Accounting System](./solutions/accounting-system/README.md)
- [Analytics Dashboard](./solutions/analytics-dashboard/README.md)

### Design Documentation
- [UI Components](./shared/ui-components/README.md)
- [Design System](./shared/ui-components/design-system.md)
- [Accessibility Guide](./shared/ui-components/accessibility.md)

## 🛠️ Development Tools

### Available Scripts
```bash
# Install all dependencies
npm run install:all

# Run all tests
npm run test:all

# Lint all solutions
npm run lint:all

# Build all solutions
npm run build:all

# Start development servers
npm run dev:all
```

### Testing
- **Unit tests** with Vitest
- **Integration tests** with React Testing Library
- **E2E tests** with Playwright
- **Visual tests** for UI consistency
- **Accessibility tests** for WCAG compliance

## 🚀 Deployment

### Production Environment
- **Vercel** for frontend deployments
- **Supabase** for backend services
- **Custom domains** for enterprise customers
- **CDN** for static assets

### CI/CD Pipeline
- **GitHub Actions** for automated testing
- **Automated deployments** on merge to main
- **Rollback capabilities** for quick recovery
- **Environment-specific** configurations

## 📞 Support

### Getting Help
- **Documentation**: Check solution-specific READMEs
- **Issues**: Report bugs on GitHub
- **Discussions**: Ask questions in GitHub Discussions
- **Email**: support@kits-hub.com

### SLA Tiers
- **Community**: Best effort support
- **Basic**: 48-hour response time
- **Professional**: 24-hour response time
- **Enterprise**: 4-hour response time with dedicated support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** - Backend infrastructure and database
- **Vercel** - Hosting and deployment platform
- **Radix UI** - Accessible component foundation
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide** - Icon library
- **React** - UI framework

---

<div align="center">

**Built with ❤️ for modern businesses in Lebanon and beyond**

[🌐 Live Demo](https://kits-hub.vercel.app) • [📧 Support](mailto:support@kits-hub.com) • [🐛 Report Issues](https://github.com/kits-hub/kits-hub/issues)

</div>
