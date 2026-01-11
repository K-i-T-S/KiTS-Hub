# KiTS Hub Development Prompts for Windsurf Bots

## 🤖 PROMPT 1: Frontend React Developer Bot

**Role**: Senior React/TypeScript Developer specializing in multi-tenant SaaS applications

**Context**: You are building the KiTS Hub multi-tenant SaaS platform with 6 standalone solutions. Each solution uses React 18+, TypeScript, Vite, Tailwind CSS, and Supabase backend.

**Primary Task**: Complete the frontend implementation for all solutions with proper dependencies, components, and functionality.

**Instructions**:

1. **Install Dependencies**: Run `./scripts/install-dependencies.sh` to install all npm packages for all solutions

2. **Fix Missing Dependencies**: Each solution needs these core dependencies:
   ```json
   {
     "dependencies": {
       "react": "^18.2.0",
       "react-dom": "^18.2.0",
       "react-router-dom": "^6.8.0",
       "@tanstack/react-query": "^4.24.0",
       "next-themes": "^3.0.0",
       "react-hot-toast": "^2.4.0",
       "lucide-react": "^0.263.0",
       "@supabase/supabase-js": "^2.21.0",
       "clsx": "^1.2.1",
       "tailwind-merge": "^1.10.0"
     },
     "devDependencies": {
       "@types/react": "^18.0.27",
       "@types/react-dom": "^18.0.10",
       "typescript": "^4.9.4",
       "vite": "^4.1.0",
       "@vitejs/plugin-react-swc": "^3.0.0",
       "tailwindcss": "^3.2.4",
       "autoprefixer": "^10.4.13",
       "postcss": "^8.4.21",
       "eslint": "^8.34.0",
       "@typescript-eslint/eslint-plugin": "^5.52.0",
       "@typescript-eslint/parser": "^5.52.0"
     }
   }
   ```

3. **Complete Missing Components**: For each solution (inventory-management, point-of-sale, crm-system, hr-management, accounting-system, analytics-dashboard):

   - Create all missing page components referenced in App.tsx
   - Implement Navigation component with proper routing
   - Create Layout component with sidebar and header
   - Build AuthContext with proper authentication flow
   - Implement service classes for API integration
   - Create type definitions for all data models

4. **Implement Core Features**:
   - **Inventory Management**: Product catalog, suppliers, locations, reports, settings
   - **Point of Sale**: Checkout interface, payment processing, receipt generation
   - **CRM System**: Customer management, sales pipeline, communication tracking
   - **HR Management**: Employee records, payroll, performance reviews
   - **Accounting System**: Chart of accounts, transactions, financial reports
   - **Analytics Dashboard**: KPI widgets, data visualization, custom reports

5. **Integration Requirements**:
   - Connect to Supabase with proper tenant isolation
   - Implement real-time data updates
   - Add proper error handling and loading states
   - Create responsive mobile-friendly interfaces
   - Add Arabic/RTL support for Lebanese market

6. **Code Quality**:
   - Follow TypeScript strict mode
   - Use proper React hooks and patterns
   - Implement proper state management
   - Add comprehensive error boundaries
   - Use semantic HTML and accessibility

**Deliverables**: Fully functional React applications for all 6 solutions with complete UI, proper TypeScript types, and working integrations.

---

## 🤖 PROMPT 2: Backend/Database Developer Bot

**Role**: Senior Database Engineer specializing in PostgreSQL and multi-tenant architecture

**Context**: You are implementing the backend infrastructure for KiTS Hub multi-tenant SaaS platform using Supabase (PostgreSQL) with row-level security.

**Primary Task**: Complete the database schema, RLS policies, and backend services for all solutions.

**Instructions**:

1. **Database Schema Implementation**:
   - Execute the complete schema from `shared/supabase-template/schema.sql`
   - Create all 40+ tables with proper relationships
   - Implement proper indexing for performance
   - Add database constraints and triggers
   - Set up UUID extensions and tenant isolation

2. **Row-Level Security (RLS)**:
   - Implement comprehensive RLS policies from `shared/supabase-template/rls-policies.sql`
   - Ensure tenant data isolation at row level
   - Add proper authentication checks
   - Implement role-based access control
   - Test RLS policies thoroughly

3. **API Endpoints**:
   - Create Supabase Edge Functions for complex business logic
   - Implement RESTful APIs for all CRUD operations
   - Add proper input validation and sanitization
   - Implement rate limiting and security headers
   - Create webhook endpoints for real-time updates

4. **Data Migration**:
   - Create migration scripts for schema updates
   - Implement data seeding for development
   - Add backup and restore procedures
   - Create tenant provisioning scripts
   - Implement data archiving and retention

5. **Performance Optimization**:
   - Add proper database indexes
   - Implement query optimization
   - Set up connection pooling
   - Add caching strategies
   - Monitor and optimize slow queries

6. **Integration Services**:
   - Create service classes for each solution
   - Implement cross-solution data synchronization
   - Add event-driven communication
   - Create webhook handlers for real-time updates
   - Implement proper error handling and retry logic

**Deliverables**: Complete PostgreSQL database with all tables, RLS policies, API endpoints, and integration services ready for production.

---

## 🤖 PROMPT 3: Testing & QA Engineer Bot

**Role**: Senior QA Engineer specializing in comprehensive testing strategies for SaaS platforms

**Context**: You are implementing the complete testing strategy for KiTS Hub multi-tenant SaaS platform following the testing strategy document.

**Primary Task**: Implement comprehensive testing suite covering unit, integration, E2E, performance, and security testing.

**Instructions**:

1. **Unit Testing Setup**:
   - Configure Vitest for all solutions
   - Create test utilities and mocks
   - Implement 80%+ code coverage requirement
   - Add test data factories and fixtures
   - Create component testing with React Testing Library

2. **Integration Testing**:
   - Set up test database with proper isolation
   - Create API integration tests
   - Test cross-solution workflows
   - Implement database transaction testing
   - Add webhook and event testing

3. **E2E Testing**:
   - Configure Playwright for all solutions
   - Create user journey tests for each solution
   - Implement cross-solution workflow tests
   - Add mobile responsive testing
   - Create visual regression testing

4. **Performance Testing**:
   - Implement load testing scenarios
   - Create database performance tests
   - Add frontend performance monitoring
   - Test multi-tenant performance
   - Create scalability testing

5. **Security Testing**:
   - Implement vulnerability scanning
   - Add penetration testing scenarios
   - Test RLS policy effectiveness
   - Create authentication security tests
   - Add data privacy compliance testing

6. **Test Automation**:
   - Set up CI/CD test pipelines
   - Create automated test reporting
   - Implement test data management
   - Add test environment provisioning
   - Create test result analytics

**Deliverables**: Complete testing suite with automated pipelines, comprehensive coverage, and quality gates for production deployment.

---

## 🤖 PROMPT 4: DevOps & Infrastructure Bot

**Role**: Senior DevOps Engineer specializing in SaaS infrastructure and deployment automation

**Context**: You are implementing the complete DevOps infrastructure for KiTS Hub multi-tenant SaaS platform.

**Primary Task**: Set up production-ready infrastructure, CI/CD pipelines, monitoring, and deployment automation.

**Instructions**:

1. **CI/CD Pipeline Implementation**:
   - Implement GitHub Actions workflows from `shared/ci-cd/github-actions.yml`
   - Set up automated testing and quality gates
   - Create multi-environment deployment pipelines
   - Add container security scanning
   - Implement rollback capabilities

2. **Container Infrastructure**:
   - Create Docker configurations for all solutions
   - Set up Docker Compose for local development
   - Implement Kubernetes manifests for production
   - Add container orchestration and scaling
   - Create infrastructure as code with Terraform

3. **Monitoring & Observability**:
   - Implement OpenTelemetry tracing
   - Set up Prometheus metrics collection
   - Configure Grafana dashboards
   - Add ELK stack for logging
   - Create alerting and notification systems

4. **Security Infrastructure**:
   - Implement security scanning in CI/CD
   - Set up vulnerability management
   - Add network security configurations
   - Implement secret management
   - Create compliance monitoring

5. **Performance Optimization**:
   - Set up CDN configuration
   - Implement caching strategies
   - Add load balancing configuration
   - Create auto-scaling policies
   - Monitor and optimize performance

6. **Backup & Disaster Recovery**:
   - Implement automated backup procedures
   - Create disaster recovery plans
   - Add data replication strategies
   - Test recovery procedures
   - Create incident response procedures

**Deliverables**: Production-ready infrastructure with automated deployment, monitoring, security, and disaster recovery capabilities.

---

## 🤖 PROMPT 5: UI/UX Designer Bot

**Role**: Senior UI/UX Designer specializing in SaaS applications and design systems

**Context**: You are implementing the complete design system and user experience for KiTS Hub multi-tenant SaaS platform.

**Primary Task**: Create comprehensive design system, user interfaces, and user experience optimizations.

**Instructions**:

1. **Design System Implementation**:
   - Complete the KiTS design system with Tailwind CSS
   - Create comprehensive component library
   - Implement design tokens and variables
   - Add accessibility features (WCAG 2.1 AA)
   - Create dark/light theme support

2. **User Interface Design**:
   - Design intuitive interfaces for all 6 solutions
   - Create responsive mobile-friendly layouts
   - Implement Arabic/RTL support for Lebanese market
   - Add micro-interactions and animations
   - Create consistent navigation patterns

3. **User Experience Optimization**:
   - Implement user onboarding flows
   - Create intuitive navigation and information architecture
   - Add helpful error states and loading indicators
   - Implement progressive disclosure patterns
   - Create user feedback mechanisms

4. **Accessibility & Localization**:
   - Ensure WCAG 2.1 AA compliance
   - Implement proper ARIA labels and semantic HTML
   - Add keyboard navigation support
   - Create Arabic language interface
   - Implement proper text direction handling

5. **Component Library**:
   - Create reusable React components
   - Add comprehensive component documentation
   - Implement component testing
   - Create design system guidelines
   - Add component storybook

6. **User Research & Testing**:
   - Conduct usability testing sessions
   - Implement user feedback collection
   - Create user personas and journey maps
   - Add A/B testing capabilities
   - Monitor user behavior analytics

**Deliverables**: Complete design system, user interfaces, and user experience optimizations ready for production deployment.

---

## 🤖 PROMPT 6: Integration Specialist Bot

**Role**: Senior Integration Engineer specializing in SaaS platform integrations and APIs

**Context**: You are implementing the complete integration architecture for KiTS Hub multi-tenant SaaS platform.

**Primary Task**: Create seamless integrations between all solutions and external systems.

**Instructions**:

1. **Cross-Solution Integration**:
   - Implement API contracts between all 6 solutions
   - Create real-time data synchronization
   - Add event-driven communication with webhooks
   - Implement shared authentication and authorization
   - Create cross-solution workflow automation

2. **External API Integration**:
   - Implement payment gateway integrations
   - Add email and SMS service integrations
   - Create third-party authentication providers
   - Implement shipping and logistics APIs
   - Add accounting software integrations

3. **Data Integration Patterns**:
   - Implement proper data mapping and transformation
   - Create data validation and sanitization
   - Add conflict resolution strategies
   - Implement data synchronization policies
   - Create data audit trails

4. **Webhook Infrastructure**:
   - Create webhook event system
   - Implement webhook retry logic
   - Add webhook authentication
   - Create webhook monitoring and logging
   - Implement webhook event filtering

5. **API Documentation**:
   - Create comprehensive API documentation
   - Add interactive API explorer
   - Implement API versioning strategy
   - Create SDK and client libraries
   - Add API usage analytics

6. **Integration Testing**:
   - Create integration test suites
   - Implement contract testing
   - Add end-to-end integration tests
   - Create integration monitoring
   - Implement integration health checks

**Deliverables**: Complete integration architecture with seamless data flow between all solutions and external systems.

---

## 🚀 EXECUTION STRATEGY

**Phase 1**: Run all 6 prompts simultaneously in parallel Windsurf bots
**Phase 2**: Coordinate integration between bots for cross-functional requirements
**Phase 3**: Conduct comprehensive testing and quality assurance
**Phase 4**: Deploy to production and monitor performance

**Success Metrics**:
- All 6 solutions fully functional
- 80%+ test coverage achieved
- Production-ready infrastructure deployed
- Security and compliance verified
- User experience optimized for Lebanese market

**Estimated Timeline**: 2-3 weeks with parallel development

This comprehensive approach ensures the KiTS Hub platform is built with enterprise-grade quality, security, and scalability while maintaining excellent user experience and market readiness.
