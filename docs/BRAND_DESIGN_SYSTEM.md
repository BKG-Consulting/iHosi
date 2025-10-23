# iHosi Brand Design System
## Professional Healthcare Design - White, Amber, Black, Cyan

---

## 🎨 Brand Colors

### Primary Colors

**Background**
- `#FFFFFF` - Pure white background (primary)
- `#FAFAFA` - Subtle white for variation
- `#F8F8F8` - Soft white for depth

**Text**
- `#000000` - Black (primary text)
- `#1a1a1a` - Near black (secondary)
- `#404040` - Dark gray (tertiary)
- `#666666` - Medium gray (muted)
- `#999999` - Light gray (subtle)

**Amber Graphics** (Visual Elements)
- `#FFFBEB` - Amber 50 (very light)
- `#FEF3C7` - Amber 100
- `#FDE68A` - Amber 200
- `#FCD34D` - Amber 300
- `#FBBF24` - Amber 400
- `#F59E0B` - Amber 500 (primary)
- `#D97706` - Amber 600
- `#B45309` - Amber 700
- `#92400E` - Amber 800
- `#78350F` - Amber 900

**Cyan Accent** (Interactive Elements)
- `#ECFEFF` - Cyan 50 (very light)
- `#CFFAFE` - Cyan 100
- `#A5F3FC` - Cyan 200
- `#67E8F9` - Cyan 300
- `#22D3EE` - Cyan 400
- `#06B6D4` - Cyan 500 (primary accent)
- `#0891B2` - Cyan 600
- `#0E7490` - Cyan 700
- `#155E75` - Cyan 800
- `#164E63` - Cyan 900

### Color Usage Guidelines

```
✅ DO:
- Use white as the primary background
- Use black for primary text
- Use amber for visual graphics and illustrations
- Use cyan for interactive elements (buttons, links, highlights)
- Keep high contrast for accessibility

❌ DON'T:
- Mix too many colors at once
- Use low contrast text combinations
- Overwhelm with bright colors
- Use busy background patterns
```

---

## 📝 Typography System

### Font Families

**Display Font** (Headlines)
- `Space Grotesk` - Modern, geometric sans-serif
- Weight: 400, 500, 600, 700
- Usage: Headlines, titles, hero text

**Body Font** (Content)
- `Inter` - Clean, highly readable
- Weight: 300, 400, 500, 600, 700, 800
- Usage: Body text, UI elements, labels

**Monospace Font** (Code)
- `Geist Mono` - Technical content
- Usage: Code snippets, technical data

### Font Sizes

```typescript
// Display sizes (headlines)
display-2xl: 4.5rem (72px) - line-height: 1
display-xl:  3.75rem (60px) - line-height: 1.05
display-lg:  3rem (48px) - line-height: 1.1
display-md:  2.25rem (36px) - line-height: 1.2
display-sm:  1.875rem (30px) - line-height: 1.25

// Body sizes
body-xl: 1.25rem (20px)
body-lg: 1.125rem (18px)
body-md: 1rem (16px)
body-sm: 0.875rem (14px)
body-xs: 0.75rem (12px)
```

### Letter Spacing

```
tighter: -0.04em (for large display text)
tight:   -0.025em (for headlines)
normal:  -0.011em (for body text)
```

### Usage Examples

```tsx
// Hero headline
<h1 className="font-display text-display-2xl text-black">
  Transform Your Healthcare Practice
</h1>

// Section title
<h2 className="font-display text-display-lg text-black">
  Features That Matter
</h2>

// Body text
<p className="text-body-lg text-gray-700">
  Professional healthcare management.
</p>
```

---

## 🎭 Animation System

### Calm, Smooth Animations

All animations are designed to be **gentle**, **smooth**, and **non-destructive** to maintain a calm, professional feel.

### Animation Presets

```typescript
// Gentle float (8s cycle)
animate-gentle-float

// Soft pulse (4s cycle)
animate-soft-pulse

// Fade in (500ms)
animate-fade-in

// Fade in with upward movement (500ms)
animate-fade-in-up

// Scale in (400ms)
animate-scale-in

// Shimmer (3s cycle)
animate-shimmer
```

### Easing Functions

```
smooth: cubic-bezier(0.4, 0, 0.2, 1)
gentle: cubic-bezier(0.25, 0.1, 0.25, 1)
calm:   cubic-bezier(0.3, 0, 0.2, 1)
```

### Animation Guidelines

```
✅ DO:
- Keep animations subtle and smooth
- Use 300-500ms for transitions
- Apply gentle easing functions
- Respect user motion preferences

❌ DON'T:
- Use jarring or aggressive animations
- Animate too many elements at once
- Use rotation or complex transforms excessively
- Create distracting motion
```

---

## 🏗️ Component Patterns

### Background Patterns

**Subtle (Default)**
- Pure white base
- Minimal ambient glow (amber/cyan)
- Very subtle dot pattern

**Amber**
- White base with amber gradient orbs
- Gentle floating animation
- Subtle dot pattern overlay

**Cyan**
- White base with cyan gradient orbs
- Grid pattern overlay
- Soft opacity

**Elegant (Multi-color)**
- White base
- Combined amber and cyan gradients
- Noise texture for depth

### Card Styles

**Standard Card**
```tsx
<div className="bg-white rounded-3xl border border-gray-200 p-8 
                shadow-medium hover:shadow-xlarge 
                transition-elegant hover:-translate-y-1">
  {/* Content */}
</div>
```

**Accent Card (Cyan)**
```tsx
<div className="bg-brand-cyan-50 border border-brand-cyan-100 
                rounded-2xl p-4 transition-elegant 
                hover:bg-brand-cyan-100">
  {/* Content */}
</div>
```

**Accent Card (Amber)**
```tsx
<div className="bg-brand-amber-50 border border-brand-amber-100 
                rounded-2xl p-4 transition-elegant 
                hover:bg-brand-amber-100">
  {/* Content */}
</div>
```

### Button Styles

**Primary (Cyan)**
```tsx
<Button className="bg-brand-cyan-600 hover:bg-brand-cyan-700 
                   text-white shadow-medium transition-elegant">
  Get Started
</Button>
```

**Secondary (Outline)**
```tsx
<Button className="border-2 border-gray-200 
                   hover:border-brand-amber-300 
                   hover:bg-brand-amber-50 
                   text-black transition-elegant">
  Learn More
</Button>
```

### Icon Containers

**Cyan Icon**
```tsx
<div className="w-12 h-12 bg-gradient-to-br from-brand-cyan-500 
                to-brand-cyan-600 rounded-lg shadow-cyan">
  <Icon className="text-white" />
</div>
```

**Amber Icon**
```tsx
<div className="w-12 h-12 bg-gradient-to-br from-brand-amber-500 
                to-brand-amber-600 rounded-lg shadow-amber">
  <Icon className="text-white" />
</div>
```

---

## 📐 Spacing System

### Section Spacing

```
sm:  3rem (48px)
md:  5rem (80px)
lg:  8rem (128px)
xl:  12rem (192px)
```

### Component Spacing

```
xs:  0.5rem (8px)
sm:  1rem (16px)
md:  1.5rem (24px)
lg:  2rem (32px)
xl:  3rem (48px)
```

### Usage

```tsx
// Section spacing
<SectionWrapper spacing="xl"> {/* 12rem top/bottom */}

// Component spacing
<div className="space-y-8"> {/* 2rem gap */}
```

---

## 🎯 Border Radius

### Sizes

```
sm:   0.375rem (6px)
md:   0.5rem (8px)
lg:   0.75rem (12px)
xl:   1rem (16px)
2xl:  1.5rem (24px)
3xl:  2rem (32px)
full: 9999px
```

### Usage Guidelines

```
Cards:       2xl-3xl (24-32px) - Soft, modern look
Buttons:     md-lg (8-12px) - Professional
Icon boxes:  lg-xl (12-16px) - Balanced
Pills:       full - Fully rounded
```

---

## 🌈 Shadow System

### Shadow Presets

```
subtle:  Very light shadow for minimal depth
soft:    Light shadow for cards at rest
medium:  Standard shadow for elevated elements
large:   Prominent shadow for important cards
xlarge:  Maximum elevation for modals/popups
```

### Colored Shadows

```
shadow-cyan:  Subtle cyan glow for cyan elements
shadow-amber: Subtle amber glow for amber elements
```

### Usage

```tsx
// At rest
<div className="shadow-soft">

// On hover
<div className="shadow-soft hover:shadow-xlarge transition-elegant">

// With color
<div className="shadow-cyan"> {/* Cyan accent shadow */}
```

---

## 🎨 Utility Classes

### Custom Utilities

**Typography**
```
.text-display  - Display font with tight spacing
.text-body     - Body font with normal spacing
.text-mono     - Monospace font
```

**Backgrounds**
```
.bg-dot-pattern       - Subtle dot pattern
.bg-grid-pattern      - Subtle grid pattern
.bg-mesh-gradient     - Multi-color mesh
.bg-noise             - Texture overlay
```

**Glass Effects**
```
.glass       - Light glassmorphism
.glass-dark  - Dark glassmorphism
```

**Shadows**
```
.shadow-elegant  - Layered subtle shadow
.shadow-luxury   - Premium multi-layer shadow
```

**Transitions**
```
.transition-elegant  - 300ms smooth transition
.transition-smooth   - 500ms gentle transition
```

---

## 📚 Component Library

### Available Components

**Layout Components**
- `SectionWrapper` - Section container with spacing
- `SectionHeader` - Consistent section headers
- `BrandBackground` - Brand-colored backgrounds

**Content Components**
- `HeroSection` - Main landing hero
- `BentoGrid` - Feature showcase grid
- `SolutionsSection` - Solutions display
- `TestimonialSection` - Customer testimonials
- `CTASection` - Call to action

**UI Components**
- `LandingNav` - Navigation bar
- `LandingFooter` - Page footer
- `FeatureCard` - Feature display cards
- `TestimonialCard` - Testimonial cards
- `GlassCard` - Glassmorphism cards

---

## 🚀 Implementation Guide

### 1. Import Brand System

```tsx
import { brandSystem } from '@/lib/brand-system';
```

### 2. Use Tailwind Classes

```tsx
// Brand colors
className="bg-white text-black"
className="bg-brand-amber-50 text-brand-amber-600"
className="bg-brand-cyan-600 text-white"

// Typography
className="font-display text-display-xl"
className="text-body-lg text-gray-700"

// Animations
className="animate-gentle-float"
className="transition-elegant hover:scale-105"
```

### 3. Component Composition

```tsx
import { SectionWrapper, BrandBackground } from '@/components/landing';

<SectionWrapper spacing="xl" className="relative">
  <BrandBackground variant="elegant" />
  <div className="relative z-10">
    {/* Your content */}
  </div>
</SectionWrapper>
```

---

## ✨ Design Principles

### 1. Calm & Composed
- White space is your friend
- Gentle, non-distracting animations
- Subtle background elements
- Clean, uncluttered layouts

### 2. Professional & Trustworthy
- High contrast for readability
- Consistent typography hierarchy
- Security badges prominently displayed
- Clean, modern aesthetic

### 3. Scalable & Maintainable
- Reusable component patterns
- Consistent design tokens
- Modular architecture
- Easy to extend

### 4. Healthcare-Focused
- Warm amber for care and approachability
- Cool cyan for trust and professionalism
- Clean white for cleanliness and clarity
- Black for authority and readability

---

## 📊 Color Combinations

### Recommended Pairings

**Primary Content**
```
Background: #FFFFFF (white)
Text: #000000 (black)
Accent: #06B6D4 (cyan-500)
Graphics: #F59E0B (amber-500)
```

**Interactive Elements**
```
Button BG: #06B6D4 (cyan-600)
Button Hover: #0891B2 (cyan-700)
Button Text: #FFFFFF (white)
Border: #E5E5E5 (gray-200)
```

**Cards & Surfaces**
```
Background: #FFFFFF (white)
Border: #E5E5E5 (gray-200)
Shadow: subtle/soft
Hover Border: #22D3EE (cyan-400) or #FCD34D (amber-300)
```

---

## 🎯 Accessibility

### WCAG 2.1 AA Compliance

**Text Contrast**
- Black (#000000) on White (#FFFFFF): 21:1 ✅
- Gray-700 (#404040) on White: 11:1 ✅
- Cyan-600 (#0891B2) on White: 3.5:1 ✅
- White on Cyan-600: 4.5:1 ✅

**Interactive Elements**
- Minimum touch target: 44x44px ✅
- Focus indicators: 2px solid cyan ✅
- Hover states: Clear visual feedback ✅

**Motion**
- Respect `prefers-reduced-motion` ✅
- Gentle, non-distracting animations ✅
- Optional: Can be disabled ✅

---

## 📝 Quick Reference

### Tailwind Color Classes

```
// Amber
bg-brand-amber-50   border-brand-amber-200   text-brand-amber-600

// Cyan
bg-brand-cyan-50    border-brand-cyan-200    text-brand-cyan-600

// Text
text-black    text-gray-700    text-gray-600

// Backgrounds
bg-white    bg-gray-50    bg-gray-100
```

### Common Patterns

```tsx
// Section with background
<SectionWrapper spacing="xl" className="relative bg-white">
  <BrandBackground variant="subtle" />
  <div className="relative z-10">{/* Content */}</div>
</SectionWrapper>

// Feature card
<FeatureCard
  icon={Icon}
  title="Feature"
  description="Description"
  colorScheme="cyan"
  size="large"
/>

// Button with hover
<Button className="bg-brand-cyan-600 hover:bg-brand-cyan-700 
                   text-white shadow-medium transition-elegant">
  Click Me
</Button>
```

---

## 🎉 Summary

The iHosi brand design system provides:

✅ **Clean, Professional Aesthetic**
- White backgrounds for clarity
- Black text for readability
- Amber for warm visual graphics
- Cyan for interactive accents

✅ **Calm, Composed Interactions**
- Gentle animations (300-500ms)
- Smooth easing functions
- Non-distracting motion
- Respect for user preferences

✅ **Scalable Architecture**
- Reusable components
- Consistent design tokens
- Modular patterns
- Easy maintenance

✅ **Healthcare-First Design**
- Trust and professionalism
- Warmth and approachability
- Cleanliness and clarity
- Security emphasis

**Result**: A sophisticated, understated UI that inspires confidence and provides an excellent user experience for healthcare professionals and patients alike.

