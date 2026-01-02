# KiTS Hub v2.0 - Modern SaaS Marketing Website

A professional, enterprise-grade SaaS marketing website built with Next.js 16, featuring a dark theme design inspired by HubSpot and premium UI patterns. This is the enhanced version of KiTS Hub with modern aesthetics, animations, and conversion-optimized design.

## 🚀 Features

### Design System
- **Dark Theme**: Premium zinc/gray color palette with orange accent colors
- **Typography**: Custom display and heading fonts for professional appearance
- **Responsive**: Mobile-first design with breakpoints for all screen sizes
- **Component Library**: Reusable UI components built with Radix UI and Tailwind CSS

### Pages & Sections
- **Homepage**: Complete marketing funnel with hero, features, testimonials, pricing, and CTA sections
- **Pricing Page**: Detailed pricing comparison with feature matrix and FAQ
- **About Page**: Company story, team, values, timeline, and press mentions
- **Resources Page**: Blog/content hub with search, filtering, and newsletter signup

### Interactive Elements
- **Animated Hero Section**: Framer Motion animations with floating particles and staggered reveals
- **Micro-interactions**: Hover effects, smooth transitions, and loading states
- **Social Proof**: Animated counters and customer testimonials
- **Navigation**: Sticky header with mobile-responsive drawer menu

### Technical Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Components**: Radix UI for accessibility
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Theme**: next-themes for dark/light mode support
- **State Management**: React 19+ with built-in state management
- **Build Tools**: PostCSS, ESLint, TypeScript Compiler
- **Package Manager**: npm (compatible with yarn, pnpm, bun)

### Key Dependencies
- **UI Components**: @radix-ui/* (comprehensive component library)
- **Styling**: tailwindcss, tailwind-merge, clsx, tailwindcss-animate
- **Animations**: framer-motion, tw-animate-css
- **Forms**: react-hook-form, @hookform/resolvers, zod
- **Data Display**: recharts, embla-carousel-react
- **Utilities**: class-variance-authority, cmdk, sonner
- **Development**: eslint, eslint-config-next, @types/*

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kits-hub-v2.0
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

## 📁 Project Structure

```
kits-hub-v2.0/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── accounting/        # Accounting features page
│   ├── analytics/         # Analytics dashboard page
│   ├── blog/             # Blog page
│   ├── careers/          # Careers page
│   ├── community/        # Community page
│   ├── compliance/       # Compliance page
│   ├── contact/          # Contact page
│   ├── cookies/          # Cookies policy page
│   ├── crm/              # CRM features page
│   ├── demo/             # Demo page
│   ├── docs/             # Documentation page
│   ├── forgot-password/  # Password recovery page
│   ├── globals.css       # Global styles and design tokens
│   ├── hr/               # HR features page
│   ├── integrations/     # Integrations page
│   ├── layout.tsx        # Root layout
│   ├── login/            # Login page
│   ├── page.tsx          # Homepage
│   ├── partners/         # Partners page
│   ├── pos/              # POS features page
│   ├── press/            # Press page
│   ├── pricing/          # Pricing page
│   ├── privacy/          # Privacy policy page
│   ├── resources/        # Resources/blog page
│   ├── search/           # Search page
│   ├── security/         # Security page
│   ├── signup/           # Signup page
│   ├── terms/            # Terms of service page
│   ├── tutorials/        # Tutorials page
│   └── webinars/         # Webinars page
├── components/            # Reusable components
│   ├── buttons/          # Button components
│   ├── layout/           # Layout components (Navbar, Footer)
│   ├── sections/         # Page sections
│   ├── ui/               # UI component library
│   └── error-boundary.tsx # Error boundary component
├── lib/                  # Utilities and helpers
│   ├── security.ts       # Security utilities
│   └── utils.ts          # General utilities
├── public/               # Static assets
├── .gitignore            # Git ignore file
├── LICENSE               # MIT License
├── README.md             # This file
├── components.json       # shadcn/ui configuration
├── eslint.config.mjs     # ESLint configuration
├── next.config.ts        # Next.js configuration
├── package.json          # Dependencies and scripts
├── postcss.config.mjs    # PostCSS configuration
├── tsconfig.json         # TypeScript configuration
└── node_modules/         # Installed dependencies
```

## 🎨 Design System

### Color Palette
- **Primary**: Zinc-950 background with zinc-100 foreground
- **Accent**: Orange-500 for CTAs and highlights
- **Muted**: Zinc-800/600 for secondary elements
- **Border**: Zinc-800 for subtle dividers

### Typography
- **Display**: Custom heading font for hero sections
- **Heading**: Professional sans-serif for section titles
- **Body**: System fonts for optimal readability

### Components
All UI components follow the shadcn/ui pattern with variants and proper TypeScript typing:

- **Button**: Multiple variants (default, outline, ghost, etc.)
- **Card**: Flexible container with header, content, footer
- **Badge**: Status indicators and category labels
- **Input**: Form inputs with validation states
- **Accordion**: Expandable content sections

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
Create a `.env.local` file for environment-specific configuration:

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME=KiTS Hub

# Analytics & Tracking
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_GTM_ID=your-gtm-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Authentication (if implementing auth)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret

# API Configuration
NEXT_PUBLIC_API_URL=https://api.your-domain.com
API_SECRET_KEY=your-api-secret-key

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT_SUPPORT=false
```

### Next.js Configuration
The project uses Next.js 16 with the following key configurations:
- **React Compiler**: Enabled for optimal performance
- **Image Optimization**: Configured for Unsplash images
- **TypeScript**: Strict mode enabled with path aliases (`@/*`)
- **ESLint**: Next.js recommended configuration

### Vercel Deployment
The easiest deployment option is Vercel:

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy automatically on every push

### Other Platforms
This project works with any platform that supports Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Railway

## 🎯 Performance

### Optimization Features
- **Static Generation**: All pages are pre-rendered at build time
- **Image Optimization**: Next.js Image component for automatic optimization
- **Code Splitting**: Automatic route-based code splitting
- **Font Optimization**: Self-hosted fonts with proper loading strategies

### Lighthouse Scores
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

## 🔧 Customization

### Adding New Pages
1. Create a new folder in `app/`
2. Add a `page.tsx` file
3. Import and use the Navbar and Footer components
4. Add your page to the navigation

### Modifying Colors
Update the CSS variables in `app/globals.css`:

```css
:root {
  --primary: oklch(0.95 0 0);
  --accent: oklch(0.18 0 0);
  /* Add your custom colors */
}
```

### Adding Components
Follow the existing pattern in `components/ui/`:
1. Use class-variance-authority for variants
2. Include proper TypeScript typing
3. Add forwardRef for composition
4. Export component and variants

## 🌐 Browser Support

This project supports all modern browsers:
- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

### Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced experience with JavaScript enabled
- Graceful degradation for older browsers

## 🐛 Troubleshooting

### Common Issues

**Build fails with TypeScript errors:**
```bash
npm run lint -- --fix
```

**Styles not loading:**
- Ensure Tailwind CSS is properly configured
- Check `postcss.config.mjs` and `tailwind.config.js`

**Images not loading:**
- Verify image domains are in `next.config.ts`
- Check image paths and file extensions

**Performance issues:**
- Run `npm run build` to check bundle size
- Use Next.js Image component for optimization
- Enable React Compiler (already configured)

### Development Tips
- Use `npm run dev` for hot reload
- Check browser console for errors
- Use React DevTools for component inspection
- Enable Next.js debug mode: `NODE_OPTIONS='--inspect' npm run dev`

## 📊 Monitoring & Analytics

### Built-in Analytics Support
- Google Analytics integration ready
- Sentry error tracking configured
- Performance monitoring with Web Vitals

### SEO Features
- Automatic sitemap generation
- Meta tags optimization
- Structured data support
- Open Graph and Twitter cards

## 🔒 Security Features

### Built-in Security
- Content Security Policy headers
- XSS protection with React
- CSRF protection ready
- Secure headers configuration
- Input validation with Zod

### Best Practices
- Environment variable protection
- API route security patterns
- Authentication ready architecture
- Data encryption utilities in `lib/security.ts`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## � Changelog

### v2.0.0 (Latest)
- Complete rewrite with Next.js 16 and App Router
- Added comprehensive page structure (25+ pages)
- Implemented modern dark theme design system
- Added TypeScript strict mode and path aliases
- Integrated Radix UI component library
- Added Framer Motion animations
- Implemented security utilities and error boundaries
- Added comprehensive form handling with React Hook Form
- Integrated chart components with Recharts
- Added responsive design and mobile optimization

### v1.0.0
- Initial release with basic Next.js setup
- Core marketing pages and components
- Tailwind CSS styling
- Basic responsive design

## �🙏 Acknowledgments

### Design & Inspiration
- **HubSpot** - Design inspiration and UX patterns
- **Vercel** - Next.js framework and deployment platform
- **shadcn/ui** - Component library patterns and design system

### Core Technologies
- **Next.js** - React framework with App Router
- **React** - UI library with React 19+ features
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first CSS framework

### Component Libraries
- **Radix UI** - Accessible component primitives
- **Lucide** - Beautiful icon library
- **Framer Motion** - Animation library
- **React Hook Form** - Form handling with validation
- **Zod** - TypeScript-first schema validation
- **Recharts** - Chart library for data visualization

### Development Tools
- **ESLint** - Code quality and linting
- **PostCSS** - CSS processing
- **class-variance-authority** - Component variant management
- **cmdk** - Command menu components
- **sonner** - Toast notifications
- **embla-carousel-react** - Carousel components

### Special Thanks
- The open-source community for making these tools possible
- Contributors and maintainers of all dependencies
- Early adopters and feedback providers

## 📞 Support

For questions, support, or custom development:
- Create an issue in this repository
- Contact the development team
- Check the documentation for common questions

---

Built with ❤️ using Next.js 16, TypeScript, and modern web technologies.
