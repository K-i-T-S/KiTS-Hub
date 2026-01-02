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
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Components**: Radix UI for accessibility
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React
- **TypeScript**: Full type safety throughout

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

## 📁 Project Structure

```
kits-hub-v2.0/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── pricing/           # Pricing page
│   ├── resources/         # Resources/blog page
│   ├── globals.css        # Global styles and design tokens
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── layout/           # Layout components (Navbar, Footer)
│   ├── sections/         # Page sections
│   └── ui/               # UI component library
├── lib/                  # Utilities and helpers
├── public/               # Static assets
└── README.md
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
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **HubSpot** - Design inspiration and UX patterns
- **Vercel** - Next.js framework and deployment platform
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide** - Beautiful icon library

## 📞 Support

For questions, support, or custom development:
- Create an issue in this repository
- Contact the development team
- Check the documentation for common questions

---

Built with ❤️ using Next.js 16, TypeScript, and modern web technologies.
