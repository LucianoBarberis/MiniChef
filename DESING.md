---
version: "alpha"
name: "Modernismo Jornalístico Brasileiro"
description: "Structured and dynamic landing page for a Brazilian cultural news portal, inspired by modernism and azulejaria. Ideal for landing pages, saas. AI-ready template."
colors:
  primary: "#FFFFFF"
  secondary: "#000000"
  tertiary: "#A52A2A"
  neutral: "#87CEEB"
  surface: "#FFD700"
  accent: "#228B22"
typography:
  h1:
    fontFamily: Roboto
    fontSize: 2.5rem
    fontWeight: 700
  body-md:
    fontFamily: Roboto
    fontSize: 1rem
    fontWeight: 400
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    padding: 12px
---

## Overview

Structured and dynamic landing page for a Brazilian cultural news portal, inspired by modernism and azulejaria. Ideal for landing pages, saas. AI-ready template. Brazilian journalism never got the memo about restraint. When Folha de S.Paulo redesigned in the early 2000s, they took Müller-Brockmann's grid and ran it through São Paulo's concrete jungle — tight columns, aggressive hierarchy, but always that underlying pulse of color that Swiss purists would never allow. The result was something genuinely new: information architecture that could handle the chaos of Brazilian politics without losing its spine.

Estadão and O Globo followed different paths to similar territory. Estadão leaned conservative — serif-heavy, dense, trusting readers to navigate complexity. O Globo went warmer, rounder, more Rio in its bones. But all three understood something fundamental: Brazilian readers consume news differently. The cadência is different. Headlines hit harder, subheads do more work, and white space isn't emptiness — it's breathing room between stories that demand emotional investment.

What emerged across two decades of digital transformation is a distinct typographic voice. Not European minimalism. Not American maximalism. Something in between — structured enough to convey authority, loose enough to feel alive. The grid bends but never breaks.

- Density: 5/10 — Balanced
- Variance: 8/10 — Expressive
- Motion: 4/10 — Subtle

- **Style:** Structured, Dynamic, Informative, Cultural
- **Keywords:** news, culture, events, Brazilian, modernism, structured, dynamic, informative, artistic, engaging
- **Era:** 2026+ Cultura em Movimento
- **Light/Dark:** ✓ Full / ✗ No

## Colors

- **Branco** (#FFFFFF) — Light surface, card backgrounds
- **Preto** (#000000) — Dark surface, primary background
- **Vermelho Terra** (#A52A2A) — Error states, destructive actions
- **Azul Celeste** (#87CEEB) — Accent highlight, links and focus states
- **Amarelo Ouro** (#FFD700) — Warning states, attention indicators
- **Verde Floresta** (#228B22) — Success states, positive indicators
- **Laranja Queimado** (#CC5500) — Warm accent, call-to-action secondary
- **Cinza Escuro** (#333333) — Deep contrast surface


## Typography

- **Display / Hero:** Roboto — Weight 700, tight tracking, used for headline impact
- **Body:** Roboto — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** Roboto — 0.875rem, weight 500, slight letter-spacing
- **Monospace:** JetBrains Mono — Used for code, metadata, and technical values

Scale:
- Hero: clamp(2.5rem, 5vw, 4rem)
- H1: 2.25rem
- H2: 1.5rem
- Body: 1rem / 1.6
- Small: 0.875rem


## Layout

- **Grid:** CSS Grid primary. Max-width containment: 1280px centered with 1.5rem side padding.
- **Spacing rhythm:** Balanced. Base unit: 0.5rem (8px).
- **Section vertical gaps:** clamp(4rem, 8vw, 8rem).
- **Hero layout:** Asymmetric composition.
- **Feature sections:** Asymmetric grid with varied card sizes. No 3-equal-columns.
- **Mobile collapse:** All multi-column layouts collapse below 768px. No horizontal overflow.
- **z-index contract:** base (0) / sticky-nav (100) / overlay (200) / modal (300) / toast (500).


## Elevation & Depth

Layouts de grid com blocos de conteúdo que se assemelham a painéis de azulejos, tipografia sans-serif e serifada contrastante para hierarquia, imagens de eventos culturais em destaque, micro-interações de hover com realce de borda e sombra, transições de seção com efeito de "revelação" de conteúdo.

- **Physics:** Ease-out curves, 200-300ms duration. Smooth and predictable.
- **Entry animations:** Fade + translate-Y (16px → 0) over 420ms ease-out. Staggered cascades for lists: 80ms between items.
- **Hover states:** Subtle color shift + shadow adjustment over 200ms.
- **Page transitions:** Fade only (200ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.


## Shapes

Base corner radius: 8px. See rounded tokens in front matter for the full scale.


## Components

- **Primary Button:** Subtly rounded (0.5rem) shape. Accent color fill. Hover: 8% darken + subtle lift shadow. Active: -1px translate tactile press. Font weight 600. No outer glows.
- **Secondary / Ghost Button:** Outline variant. 1.5px border in muted color. Text in primary color. Hover: subtle background fill.
- **Cards:** Subtly rounded (0.5rem) corners. Surface background. Subtle shadow (0 2px 12px rgba(0,0,0,0.06)). 1px border stroke.
- **Inputs:** Label above input. 1px border stroke. Focus ring: 2px accent color offset 2px. Error text below in semantic red. No floating labels.
- **Navigation:** Primary surface background. Active item: accent color indicator. Font weight 500 when active.
- **Skeletons:** Shimmer animation matching component dimensions. No circular spinners.
- **Empty States:** Icon-based composition with descriptive text and action button.


## Don'ts

- No emojis in UI — use icon system only (Lucide)
- No pure black (#000000) — use off-black or charcoal variants
- No oversaturated accent colors (saturation cap: 80%)
- No 3-column equal-width feature layouts — use zig-zag or asymmetric grid
- No `h-screen` — use `min-h-[100dvh]`
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- No broken external image links — use picsum.photos or inline SVG
- No generic lorem ipsum in demos
