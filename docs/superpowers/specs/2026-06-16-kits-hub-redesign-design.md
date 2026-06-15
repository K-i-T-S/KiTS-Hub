# KiTS Hub — Complete Website Redesign Spec
**Date:** 2026-06-16  
**Scope:** Core pages overhaul (Scope B) — Homepage, Navbar, Footer, About, Pricing, Contact, 5 Product pages + premium shells for remaining pages  
**Author:** Ahmad Khoder / KiTS  
**Prepared by:** Claude Code

---

## 1. Project Context

KiTS (Khoder's IT Solutions) is a Lebanese full-stack technology solutions company offering:
- **Consulting & Services:** Custom apps/websites, ERP development, AI/ML, hardware supply, business consultancy
- **SaaS Platform ("Tool-KiT"):** All-in-one business platform — POS, Inventory, HR, CRM, Accounting, Finance, Monitoring, Marketing, and more. Product near MVP.

**Primary market:** Lebanon + MENA region. All business sizes, all industries.  
**Founder:** Ahmad Khoder (solo founder, the face of the brand)  
**Brand philosophy:** "The right kit for every mission" — precision tools, complete solutions, no problem too big or too small.

---

## 2. Design System

### 2.1 Color Palette
**Decision:** Move completely away from black + purple (AI SaaS cliché). KiTS gets a **Deep Midnight + Electric Teal + Warm Gold** system — sophisticated, premium, unique in the MENA tech space. Teal glows naturally in 3D lighting; gold reads luxury. Neither is overused in Lebanese/regional tech.

| Token | Value | Role |
|---|---|---|
| `--bg-base` | `#040C18` | Page background (deep midnight, navy undertone) |
| `--bg-surface` | `#081628` | Card/panel base |
| `--bg-elevated` | `#0D2040` | Elevated surfaces, hover states |
| `--brand-teal` | `#00E5CC` | Primary brand accent — glows, links, icons |
| `--brand-teal-dim` | `#00B5A3` | Teal at rest (non-hover state) |
| `--brand-gold` | `#E8A833` | Secondary accent — CTAs, highlights |
| `--brand-gold-dim` | `#C48A1E` | Gold at rest |
| `--text-primary` | `#EEF4FF` | Headlines, primary content |
| `--text-secondary` | `#7A9CC4` | Body text, descriptions |
| `--text-muted` | `#3A5070` | Timestamps, labels, captions |
| `--border` | `#1A2D4A` | Subtle dividers |
| `--border-bright` | `#2A4A70` | Highlighted borders, focus rings |
| `--glow-teal` | `rgba(0,229,204,0.15)` | Card glow, hover shadows |
| `--glow-gold` | `rgba(232,168,51,0.15)` | CTA glow |

**Light theme** (toggled by user): Inverts to near-white base (`#F5F8FF`) with deep navy text and the same teal/gold accents at full saturation.

**What to remove:** All 30+ purple CSS variables currently in `globals.css`. Replace with the token system above.

### 2.2 Typography

| Role | Font | Weight | Notes |
|---|---|---|---|
| Display (hero H1) | `Plus Jakarta Sans` | 800 | Free Google Font, geometric, premium |
| Heading (H2–H4) | `Plus Jakarta Sans` | 600–700 | Consistent family |
| Body | `Inter` | 400–500 | Already familiar, excellent readability |
| Mono / tech labels | `JetBrains Mono` | 400 | For code snippets, version tags |
| Arabic | `Noto Sans Arabic` | 400–700 | RTL support, pairs well with Inter |

**Scale:**
- Hero: `clamp(3rem, 8vw, 6rem)` — bold, dominates
- Section title: `clamp(1.75rem, 3.5vw, 2.75rem)`
- Subhead: `1.25rem`
- Body: `1rem / 1.625 line-height`
- Label/caption: `0.875rem`

### 2.3 Motion & 3D Strategy

**Philosophy:** Real depth, not decoration. Every animation must either reveal information or reduce cognitive load. No animation purely for animation's sake.

**Tools (no new installs needed):**
1. **`@paper-design/shaders-react`** (already installed) — flowing gradient mesh on hero background. Replaces the static gradient.
2. **Framer Motion** (already installed) — scroll-triggered reveals, cursor-following 3D card tilt (via `useMotionValue` + `useSpring`), staggered list animations.
3. **CSS 3D perspective transforms** — cards that tilt on hover via `perspective` + `rotateX/Y`. No JS overhead.
4. **CSS backdrop-filter** — glassmorphism surfaces. Cards float above the deep background.
5. **SVG animated paths** — connection lines, flow diagrams in the product section.

**3D card effect** (applied to all feature/product cards):
```css
.card-3d {
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
}
/* JS via Framer: rotateX/Y based on cursor position, max ±15deg */
```

**Hero 3D element:** A large, slowly rotating abstract geometric shape (CSS polygon + box-shadow layers, or a simple SVG icosahedron) centered behind the headline. Glows teal. Moves subtly on scroll (parallax). This is achievable with pure CSS + Framer Motion — no Three.js dependency needed.

**Scroll behavior:**
- Elements enter with `opacity: 0 → 1` + `translateY: 30px → 0`
- Stagger children by 80ms
- Trigger at 20% viewport entry

### 2.4 Spacing & Layout

- Base unit: `4px`
- Section padding: `120px` vertical (desktop), `80px` (tablet), `60px` (mobile)
- Container max-width: `1280px`
- Card border-radius: `16px` (large, modern)
- Button border-radius: `10px`

### 2.5 Effects Library

- **Glassmorphism:** `background: rgba(8,22,40,0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05)`
- **Teal glow:** `box-shadow: 0 0 40px rgba(0,229,204,0.1), 0 0 80px rgba(0,229,204,0.05)`
- **Gold glow:** `box-shadow: 0 0 40px rgba(232,168,51,0.15), 0 0 80px rgba(232,168,51,0.05)`
- **Text gradient (brand):** `background: linear-gradient(135deg, #00E5CC 0%, #E8A833 100%); -webkit-background-clip: text`

---

## 3. Navigation Architecture

### 3.1 Desktop Navbar
```
[K Logo + KiTS]   [Platform ▾]   [Services ▾]   [Pricing]   [About]   [Contact]      [Login]  [Get Started →]
```

**Platform mega-menu** (the Tool-KiT modules):
- CRM | POS | HR Management | Accounting | Analytics | Finance | Inventory | Marketing

**Services mega-menu:**
- Custom Development | ERP Solutions | AI & Machine Learning | Hardware Supply | Business Consultancy

**Removed from nav:** Blog, Docs, Tutorials, Webinars, Community, Partners, Press, Careers, all legal pages (footer only), Search icon (unnecessary complexity), Feature Request button (moves to footer or floating element).

### 3.2 Mobile Navbar
Clean slide-in panel with:
1. Logo at top
2. Accordion sections: Platform / Services / Company
3. Login + Get Started at bottom
**No legal links, no feature request, no 20+ flat list.**

### 3.3 Visual Treatment
- Sticky, `backdrop-blur(20px)` + subtle border at bottom
- On scroll: background darkens slightly with transition
- Active link: teal underline dot
- CTA button: gold with teal glow on hover

---

## 4. Homepage Sections

The homepage tells one story: **KiTS has a solution for every business problem, built by a Lebanese technologist who understands your market.**

### Section 1: Hero
**Headline:** `Every Business Needs the Right Kit.`  
**Subhead:** KiTS delivers full-spectrum technology solutions — from custom software and AI to the complete business platform your team actually needs.  
**CTAs:** `Explore the Platform →` (teal) | `Talk to Us` (ghost/outline)  
**Visual:** Full-viewport. Shader background (deep animated gradient). Centered large rotating geometric shape (teal glow). Hero text sits in front with high contrast.  
**Below fold indicator:** Animated scroll arrow.

### Section 2: What KiTS Does (two pillars)
Two large side-by-side panels (not cards — full-bleed panels with depth):
- **Left:** "The Tool-KiT Platform" — All-in-one SaaS. Icon: toolkit/grid. CTA: Explore Platform
- **Right:** "Technology Consulting" — Custom solutions. Icon: circuit/lightbulb. CTA: Work With Us

### Section 3: The Tool-KiT — Platform Showcase
A tabbed or scrollable horizontal "module rail" showing each SaaS module. Each module:
- Large icon (teal-colored)
- Name + one-line description
- "Coming to Tool-KiT" badge on modules not yet live
Animated: modules slide in on scroll, hover lifts with 3D tilt.

### Section 4: Why KiTS
3-column layout, each with a large number/stat + description:
- **`A–Z`** — End-to-end. We handle every layer from strategy to deployment.
- **`MENA`** — Built for Lebanon and the region. We know the market.
- **`∞ Scale`** — Startup or enterprise, we fit your size.

### Section 5: How It Works (Services Process)
4-step process flow with connecting SVG lines:
1. Understand → 2. Design → 3. Build → 4. Support

### Section 6: Social Proof / Testimonials
Honest framing: "Early Access Partners" or "Trusted by Forward-Thinking Businesses."  
3 testimonial cards (redesigned with glassmorphism). Placeholder content clearly marked — to be replaced with real quotes.

### Section 7: CTA Banner
Full-width dark panel with teal glow:  
**"Ready to equip your business?"**  
Two buttons: `Request a Demo` | `Start Free Trial`

---

## 5. Page-by-Page Spec

### 5.1 About Page
**Remove:** All fake team members (Sarah Johnson, Michael Chen, etc.)  
**Keep/Add:**
- Company story section: "Built in Lebanon, designed for the world." Ahmad's origin story.
- Founder card: Ahmad Khoder — Founder & CEO. Photo placeholder. Link to portfolio.
- Mission statement
- Values (keep the values section, update copy to feel authentic)
- **Remove:** Timeline section (nothing to put there yet), Press mentions section

### 5.2 Pricing Page
**Framing:** "Transparent Pricing — No surprises."  
Keep 3-tier structure (Free / Professional / Enterprise) but:
- Replace `$49/user/month` with honest placeholder text or "Launching soon — join the waitlist"
- Remove the Stripe checkout flow entirely
- CTA on all tiers: "Join Waitlist" → leads Supabase form (already wired)
- Add a "Need a custom solution? Talk to us." row below cards

**Payment integration:** No Stripe. Implement **PayTabs** API structure as placeholder (PayTabs is Lebanon-based, MENA-wide, fully functional). Wire the subscription table to accept PayTabs webhook events. Leave payment buttons as "Coming Soon" until live credentials are added via env vars.

### 5.3 Contact Page
**Remove:** New York, San Francisco, London offices (completely wrong)  
**Add:**
- Lebanon contact: Tripoli / Beirut area (Ahmad to provide exact address)
- Real phone: `+961` format
- Real email: `kits.tech.co@gmail.com` (from user profile)
- WhatsApp link (critical for Lebanese market — bigger than email for business)
- Instagram + Facebook links (already in footer)
- Contact form → Supabase `leads` table (already functional)
- Botpress chat widget already injected globally

### 5.4 Product Pages (/crm, /pos, /hr, /accounting, /analytics)
Each page gets same premium template:
- Hero: Module name + icon + one-line description. Teal accent.
- Feature list: 3-column grid of features (glassmorphism cards with 3D tilt)
- "Coming to Tool-KiT" progress indicator — honest about launch timeline
- CTA: "Join Waitlist for Early Access"
- Remove generic "star rating" sections and fake testimonials

### 5.5 Login / Signup Pages
Currently functional (Supabase auth wired). Needs visual redesign only:
- Full-screen split: left side = brand visual/message, right side = form
- Remove any "or continue with Google" (not wired)
- Keep the Supabase auth flow intact

### 5.6 Shell Pages (Blog, Docs, Tutorials, Webinars, Community, Partners, Press, Careers)
Each gets a premium "coming soon" shell:
- Full navbar + footer
- Centered content: Section icon + "Coming Soon" (styled, not a placeholder error)
- "Be the first to know" email capture form → Supabase leads table
- Consistent with new design system
- **NOT a 404 — these routes exist and work, content is coming**

---

## 6. Footer Redesign

**Structure:**
```
[Logo + tagline]    [Platform]    [Services]    [Company]    [Legal]
                    CRM           Development   About        Privacy
                    POS           ERP           Contact      Terms
                    HR            AI/ML         Blog         Security
                    Accounting    Hardware      Careers      
                    Analytics     Consulting    Press        

[©2025 KiTS]  [Instagram]  [Facebook]  [WhatsApp]   [All rights reserved]
```

**Visual:** Same dark background as page. Subtle teal top border. No solid background change from the page.

---

## 7. Arabic / RTL Strategy

**Approach:** Language toggle in navbar (EN | عربي). When Arabic selected:
- `<html dir="rtl" lang="ar">` applied
- `Noto Sans Arabic` loaded for Arabic content
- All layout mirrors (flex-direction, margins, padding)
- Phase 1: Translate only Homepage + Contact + Pricing (the conversion funnel)
- Phase 2: All other pages
- Implementation: `next-intl` or simple context-based toggle (simpler, fewer deps)

---

## 8. Payment Solution

**Stripe:** Not available for direct Lebanon merchant accounts.  
**Recommendation: PayTabs**
- Headquartered in Saudi Arabia, fully operational in Lebanon
- Supports credit/debit cards, bank transfers, local payment methods
- Has a REST API and webhook system compatible with the existing Stripe webhook structure in `app/api/stripe/webhook/route.ts`
- Action: Rename/refactor `app/api/stripe/` → `app/api/payments/` with PayTabs adapter
- Phase 1: Implement PayTabs test environment. All subscription/checkout UI shows "Join Waitlist" until live.
- Alternative to evaluate: `Checkout.com` (also Lebanon-compatible, larger enterprise client base)

---

## 9. What Gets Removed / Hidden

| Item | Action | Reason |
|---|---|---|
| All purple CSS variables (30+) | Delete | Replaced by new token system |
| Fake team members (About) | Remove | Ahmad is the team |
| Fake US/UK offices (Contact) | Remove | Wrong location |
| Legal links from mobile nav | Move to footer | Nav clutter |
| "Sarah Johnson" etc. testimonials | Replace with honest placeholders | Fake testimonials undermine trust |
| Feature Request modal in nav | Move to footer or dedicated page | Nav is crowded |
| `social-proof-section-backup.tsx` | Delete | Dead file |
| All AI training .md files (root level) | Move to `/docs/internal/` | Not for repo root |

---

## 10. Technical Decisions

### 10.1 New Dependencies to Add
- `plus-jakarta-sans` — via `next/font/google` (no package install needed)
- `noto-sans-arabic` — via `next/font/google`
- No Three.js, no Spline — keep bundle light

### 10.2 Dependencies to Remove / Unused Audit
- `@supabase/auth-ui-react` + `@supabase/auth-ui-shared` — currently unused, auth is custom. Remove.
- `react-resizable-panels` — not used in any current component. Remove.
- `cmdk` — command palette not implemented. Remove.

### 10.3 Performance Targets
- LCP < 2.0s (hero loads fast, shader is GPU-accelerated)
- CLS = 0 (fixed dimensions on all images and hero)
- Bundle: keep <200KB JS for initial load

### 10.4 Image Strategy
- Replace all Unsplash `photo_*` URLs for team members (removed entirely)
- Hero uses shader + CSS shapes — no image requests
- Product mockup screenshots: placeholder SVG wireframe frames until real screenshots exist

---

## 11. Subagent Execution Plan (Parallel Workstreams)

**Phase 1 — Foundation (blocks everything):** Single agent, must complete first.
- New design system tokens in `globals.css`
- Typography integration (`next/font`)
- Base component updates (Button variants, Card variants with glassmorphism)
- New Navbar + Footer

**Phase 2 — Core Pages (parallel, 3 agents):**
- Agent A: Homepage (all 7 sections)
- Agent B: About + Contact
- Agent C: Pricing + product pages (/crm, /pos, /hr, /accounting, /analytics)

**Phase 3 — Cleanup (parallel, 2 agents):**
- Agent D: Shell pages (Blog, Docs, Tutorials, Webinars, Community, Partners, Press, Careers) — premium coming-soon template
- Agent E: Auth pages (Login, Signup, Forgot Password) — visual redesign only

**Phase 4 — QA & Polish:**
- Run `npm run build` — fix any TypeScript errors
- Check mobile at 375px for all redesigned pages
- Verify Supabase auth still works
- Verify contact form still writes to `leads` table

---

## 12. Success Criteria

1. Zero fake content (no "Sarah Johnson", no "New York office", no placeholder lorem that reads as real)
2. Visual identity is unmistakably KiTS — teal/gold/midnight, not purple/black
3. Homepage hero creates genuine awe on first load
4. Mobile nav has ≤ 10 visible links
5. Every page can be visited without a 404 or blank content
6. Build passes `npm run build` with zero TypeScript errors
7. Supabase contact form still functional
8. Auth flow still functional
