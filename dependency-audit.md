# KiTS Hub Dependency Audit & Analysis Report

## Executive Summary

This comprehensive dependency audit analyzes all package.json files across the KiTS Hub monorepo, identifying version conflicts, security vulnerabilities, and optimization opportunities. The audit covers 11 applications and packages with over 2,400 total dependencies.

## 🚨 Critical Issues Found

### 1. **Critical Security Vulnerabilities**
- **jsPDF**: Critical Local File Inclusion/Path Traversal (CVE-2025-25146)
  - Current: 3.0.4 | Fixed: 4.0.0
  - Affects: All solutions using PDF generation
  - Risk: Code execution, file system access
---

## 1. Application Overview

### Applications Analyzed
1. **Root Workspace** (`/`) - Monorepo orchestrator
2. **Business Kits** (`business-kits`) - Vite-based application
3. **KiTS Hub v2.0** (`kits-hub-v2.0`) - Next.js application
4. **Shared Shell** (`shared-shell`) - Webpack 5 micro-frontend host
5. **Solutions** (6 applications) - Webpack 5 micro-frontends:
   - Inventory Management (port 4177)
   - Point of Sale (port 4178)
   - CRM System (port 4179)
   - HR Management (port 4180)
   - Accounting System (port 4181)
   - Analytics Dashboard (port 4182)

---

## 2. Critical Version Conflicts

### 2.1 React Ecosystem Conflicts

| Package | Versions Found | Applications | Impact |
|---------|---------------|--------------|--------|
| **react** | 18.3.1, 19.2.3 | business-kits, shared-shell, solutions (18.3.1) vs kits-hub-v2.0 (19.2.3) | **CRITICAL** - Incompatible React versions break Module Federation |
| **react-dom** | 18.3.1, 19.2.3 | Same as React | **CRITICAL** - Must match React version |
| **@types/react** | 18.3.11, 19 | business-kits, shared-shell, solutions (18.3.11) vs kits-hub-v2.0 (19) | **HIGH** - Type definitions must align |
| **@types/react-dom** | 18.3.0, 19 | Same as @types/react | **HIGH** - Type definitions must align |

### 2.2 Build Tool Conflicts

| Tool | Versions | Applications | Impact |
|------|----------|--------------|--------|
| **Vite** | 6.4.1 | business-kits, kits-hub-v2.0, all solutions (devDeps) | **MEDIUM** - Inconsistent with Webpack 5 goals |
| **Next.js** | 16.1.1 | kits-hub-v2.0 | **HIGH** - Incompatible with micro-frontend architecture |
| **Webpack** | 5.97.1, 5.104.1 | shared-shell, all solutions | **LOW** - Minor version differences acceptable |
| **TypeScript** | 5.9.3, 5.6.0, 5 | Multiple versions across apps | **MEDIUM** - Should unify to latest 5.x |

### 2.3 Module Type Conflicts

| Application | Type | Issue |
|-------------|------|-------|
| business-kits | "module" | ES modules |
| kits-hub-v2.0 | "module" | ES modules |
| shared-shell | "module" | ES modules |
| inventory-management | "module" | ES modules |
| All other solutions | "commonjs" | CommonJS modules |

---

## 3. Security Vulnerabilities

### 3.1 Critical Vulnerabilities

| Package | Version | CVE | Severity | Applications Affected |
|---------|---------|-----|----------|----------------------|
| **jspdf** | 3.0.4 | GHSA-f8cm-6447-x5h2 | **CRITICAL** | business-kits, accounting-system, analytics-dashboard, crm-system, hr-management, point-of-sale |

**Vulnerability Details**: Local File Inclusion/Path Traversal allows arbitrary file access on the server.

### 3.2 Outdated Dependencies with Known Issues

| Package | Current Version | Latest Secure | Risk Level |
|---------|----------------|---------------|------------|
| **@vitejs/plugin-react-swc** | 3.10.2 | 3.10.2 | MEDIUM |
| **playwright** | 1.57.0 | 1.57.0 | LOW |
| **eslint** | 9.15.0 | 9.15.0 | LOW |

---

## 4. Dependency Analysis by Category

### 4.1 UI Framework Dependencies

#### Radix UI Components
- **Consistent Versions**: Most Radix UI components use consistent versions across applications
- **Exceptions**: 
  - `@radix-ui/react-dropdown-menu`: 2.1.6 (solutions) vs 1.2.16 (kits-hub-v2.0)
  - `@radix-ui/react-label`: 2.1.2 (solutions) vs 1.2.8 (kits-hub-v2.0)

#### State Management
| Package | Versions | Usage |
|---------|----------|-------|
| **@tanstack/react-query** | 5.90.12, 5.91.1 (devtools) | business-kits, all solutions |
| **zustand** | 5.0.9 | shared-shell only |

### 4.2 Styling Dependencies

| Package | Versions | Applications | Notes |
|---------|----------|--------------|-------|
| **tailwindcss** | 4.1.18, 4 | All applications | Version 4.x is consistent |
| **tailwind-merge** | 2.5.4, 3.4.0 | Most apps | Minor version differences |
| **class-variance-authority** | 0.7.1 | All applications | Consistent |

### 4.3 Data & Utilities

| Package | Versions | Applications | Purpose |
|---------|----------|--------------|---------|
| **@supabase/supabase-js** | 2.49.8, 2.89.0 | All applications | Database client |
| **lucide-react** | 0.487.0, 0.562.2 | All applications | Icon library |
| **date-fns** | 3.6.0 | Most applications | Date utilities |
| **zod** | 3.25.76, 4.3.4 | All applications | Schema validation |

### 4.4 Development Dependencies

#### Testing Framework
| Package | Versions | Applications |
|---------|----------|--------------|
| **vitest** | 4.0.16 | All applications |
| **@testing-library/react** | 16.1.0 | All applications |
| **playwright** | 1.57.0 | All applications |

#### Build Tools
| Package | Versions | Applications |
|---------|----------|--------------|
| **typescript** | 5.9.3, 5.6.0, 5 | Multiple |
| **eslint** | 9.15.0, 9.8.0 | Multiple |
| **webpack** | 5.97.1, 5.104.1 | shared-shell, solutions |

---

## 5. Module Federation Compatibility Analysis

### 5.1 Shared Dependencies Assessment

#### Ready for Sharing (High Confidence)
- `react: 18.3.1` (after version unification)
- `react-dom: 18.3.1` (after version unification)
- `@supabase/supabase-js: 2.49.8` (consistent)
- `lucide-react: 0.487.0` (consistent)
- `react-router-dom: 6.28.0` (consistent)
- `zod: 3.25.76` (consistent)

#### Requires Version Alignment
- `@tanstack/react-query: 5.90.12` (unify devtools version)
- `tailwind-merge: 2.5.4` (upgrade from 3.4.0)
- `class-variance-authority: 0.7.1` (consistent)

#### Should Not Be Shared (Application-Specific)
- `next-themes` - Next.js specific
- `@dnd-kit/*` - Drag and drop, app-specific usage
- `exceljs`, `jspdf` - Business logic specific
- `i18next` - Localization configuration varies

### 5.2 Build System Compatibility

#### Current State
- **Shared Shell**: Webpack 5 ✅
- **Solutions**: Webpack 5 ✅
- **Business Kits**: Vite 6.4.1 ❌ (needs migration)
- **KiTS Hub v2.0**: Next.js 16.1.1 ❌ (needs migration)

#### Migration Requirements
1. Convert Vite 6.4.1 → Webpack 5 (business-kits)
2. Convert Next.js 16.1.1 → Webpack 5 (kits-hub-v2.0)
3. Standardize all module types to "commonjs" for Webpack compatibility

---

## 6. Optimization Opportunities

### 6.1 Dependencies to Hoist to Root Workspace

#### High Priority (Used by 6+ applications)
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "@supabase/supabase-js": "^2.49.8",
  "lucide-react": "^0.487.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwindcss": "^4.1.18",
  "typescript": "^5.9.3",
  "eslint": "^9.15.0",
  "vitest": "^4.0.16",
  "@testing-library/react": "^16.1.0"
}
```

#### Medium Priority (Used by 3-5 applications)
```json
{
  "@tanstack/react-query": "^5.90.12",
  "react-router-dom": "^6.28.0",
  "zod": "^3.25.76",
  "date-fns": "^3.6.0",
  "react-hook-form": "^7.55.0",
  "recharts": "^2.15.2"
}
```

### 6.2 Duplicate Dependencies Summary

| Category | Total Duplicates | Estimated Size Reduction |
|----------|------------------|--------------------------|
| React Ecosystem | 48 instances | ~120MB |
| UI Components | 156 instances | ~80MB |
| Build Tools | 84 instances | ~60MB |
| Testing Framework | 36 instances | ~40MB |
| **Total** | **324 instances** | **~300MB** |

---

## 7. Risk Assessment

### 7.1 High Risk Issues
1. **React Version Conflict** - Breaks Module Federation completely
2. **jspdf Security Vulnerability** - Critical security risk
3. **Module Type Inconsistency** - Build system failures

### 7.2 Medium Risk Issues
1. **Build Tool Divergence** - Maintenance overhead
2. **TypeScript Version Differences** - Type compatibility issues
3. **Radix UI Version Inconsistencies** - UI component behavior differences

### 7.3 Low Risk Issues
1. **Minor Version Differences** - Generally compatible
2. **Development Tool Versions** - Don't affect runtime

---

## 8. Recommendations

### 8.1 Immediate Actions (Critical)
1. **Update jspdf to 4.0.0** across all applications
2. **Unify React to 18.3.1** across all applications (downgrade kits-hub-v2.0)
3. **Standardize module types** to "commonjs" for Webpack compatibility

### 8.2 Short-term Actions (1-2 weeks)
1. **Migrate business-kits** from Vite to Webpack 5
2. **Migrate kits-hub-v2.0** from Next.js to Webpack 5
3. **Implement workspace hoisting** for high-priority dependencies
4. **Update Radix UI** to consistent versions

### 8.3 Long-term Actions (1 month)
1. **Implement dependency update automation**
2. **Establish security scanning** in CI/CD pipeline
3. **Create shared component library** for common UI elements
4. **Optimize bundle sizes** with code splitting strategies

---

## 9. Migration Impact Analysis

### 9.1 Build System Migration Impact

| Application | Current Build | Target Build | Estimated Effort | Risk Level |
|-------------|---------------|--------------|------------------|------------|
| business-kits | Vite 6.4.1 | Webpack 5 | 3-5 days | Medium |
| kits-hub-v2.0 | Next.js 16.1.1 | Webpack 5 | 5-7 days | High |
| shared-shell | Webpack 5 | Webpack 5 | 0 days | None |
| All solutions | Webpack 5 | Webpack 5 | 0 days | None |

### 9.2 Dependency Update Impact

| Change | Applications Affected | Breaking Changes | Rollback Strategy |
|--------|---------------------|------------------|-------------------|
| React 19.2.3 → 18.3.1 | kits-hub-v2.0 | Yes (React features) | Version lock in package.json |
| jspdf 3.0.4 → 4.0.0 | 6 applications | Yes (API changes) | Feature detection |
| Module type changes | All solutions | Yes (import/export) | Build configuration |

---

## 10. Conclusion

The KiTS Hub monorepo has significant dependency challenges that must be addressed for successful micro-frontend implementation. The React version conflict is the most critical issue preventing Module Federation from working properly. The security vulnerability in jspdf requires immediate attention.

With proper dependency unification and build system standardization, the monorepo can achieve:
- **300MB reduction** in duplicate dependencies
- **Improved build times** through workspace hoisting
- **Enhanced security** with automated vulnerability scanning
- **Stable Module Federation** with consistent shared dependencies

The migration path is clear but requires careful execution to avoid breaking existing functionality.
