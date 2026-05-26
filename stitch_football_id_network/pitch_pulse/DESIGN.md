---
name: Pitch Pulse
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#38393a'
  surface-container-lowest: '#0c0f0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#282a2b'
  surface-container-highest: '#333535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#c3c8c2'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#8d928d'
  outline-variant: '#434844'
  surface-tint: '#b8cbbe'
  primary: '#b8cbbe'
  on-primary: '#24342b'
  primary-container: '#0f1f17'
  on-primary-container: '#76887d'
  inverse-primary: '#516258'
  secondary: '#ffffff'
  on-secondary: '#283500'
  secondary-container: '#c3f400'
  on-secondary-container: '#556d00'
  tertiary: '#c8c6c5'
  on-tertiary: '#313030'
  tertiary-container: '#1c1c1c'
  on-tertiary-container: '#858484'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d4e7da'
  primary-fixed-dim: '#b8cbbe'
  on-primary-fixed: '#0f1f17'
  on-primary-fixed-variant: '#3a4b41'
  secondary-fixed: '#c3f400'
  secondary-fixed-dim: '#abd600'
  on-secondary-fixed: '#161e00'
  on-secondary-fixed-variant: '#3c4d00'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#121414'
  on-background: '#e2e2e2'
  surface-variant: '#333535'
typography:
  display-lg:
    fontFamily: Anton
    fontSize: 64px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Anton
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Anton
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  stat-value:
    fontFamily: Anton
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  container-max: 1280px
  gutter: 20px
---

## Brand & Style
The design system is built for a high-performance social ecosystem connecting football players, scouts, and fans. The brand personality is **Dynamic, Professional, and Elite**. It aims to evoke the adrenaline of a match day combined with the precision of professional scouting tools.

The visual style is a hybrid of **Modern Minimalism** and **Glassmorphism**, taking heavy inspiration from high-end sports broadcast graphics and video game interfaces (specifically Ultimate Team aesthetics). The UI utilizes translucent layers and vibrant accents to create a sense of depth and "live" energy.

**Key Stylistic Principles:**
- **High Kinetic Energy:** Use of diagonal lines and sheer angles in decorative elements.
- **Atmospheric Depth:** Deep backgrounds with localized glows (neon lime) to simulate stadium lighting.
- **Elite Presentation:** Player profiles are treated as "Premium Assets" rather than static pages, utilizing card-based layouts with glass textures.

## Colors
The palette is centered around the "Midnight Pitch" experience. 

- **Primary (Deep Pitch Green):** Used for main backgrounds and deep canvas layers. It provides a sophisticated, grounded alternative to pure black.
- **Secondary (Electric Neon Lime):** Used exclusively for highlights, call-to-actions, stats, and active states. It should be used sparingly but with high impact to represent energy and "on-pitch" action.
- **Tertiary (Charcoal):** Used for surface containers, card backgrounds, and input fields to provide subtle separation from the primary green.
- **Neutral (White/Light Gray):** Used for high-legibility body text and primary icons.

**Functional Colors:**
- **Success:** The Secondary Neon Lime doubles as the success state.
- **Surface:** A semi-transparent white (5-10% opacity) is used for the Glassmorphism effect on top of the Primary Green.

## Typography
The typography strategy creates a contrast between "Broadcast Impact" and "Data Precision."

- **Headlines:** Use **Anton** for all major headings and display text. Its condensed, bold nature mirrors sports journalism and stadium signage. Always use uppercase for display levels to maintain a commanding presence.
- **Body:** Use **Hanken Grotesk** for all long-form content, comments, and bios. It offers a contemporary, sharp look that remains legible at smaller sizes.
- **Labels & Data:** Use **JetBrains Mono** for technical data, player metrics, and timestamps. The monospaced nature emphasizes the "scouting/data" aspect of the social network.

## Layout & Spacing
The design system utilizes a **12-column fluid grid** for desktop and a **single-column fluid layout** for mobile. 

- **Rhythm:** A 4px baseline grid ensures tight, technical alignment.
- **Margins:** Desktop uses a 64px outer margin; Mobile uses a 20px outer margin.
- **Card Grids:** Content is primarily organized into "Player Card" modules. On desktop, these typically span 3 columns (4 per row). 
- **Density:** High information density is encouraged for stats sections, while social feeds utilize wider margins to emphasize media content (videos/photos).

## Elevation & Depth
Depth is created through **Glassmorphism** and **Tonal Layering** rather than traditional drop shadows.

- **Level 1 (Canvas):** The Primary Green background.
- **Level 2 (Containers):** Charcoal surface with a 1px stroke (15% white) to define edges.
- **Level 3 (Interactive/Glass):** Used for Player Cards and Modals. Features a background blur (12px - 20px) and a semi-transparent white fill.
- **Glows:** A soft, radial blur of Neon Lime (#CCFF00 at 10% opacity) is placed behind primary action items or "Verified" player cards to make them pop from the dark canvas.

## Shapes
The shape language is **Technical and Aggressive**. 

- **Corner Radius:** We use a "Soft" (0.25rem) base roundedness for standard buttons and inputs to maintain a professional, sharp edge. 
- **Component Specifics:** Player cards may use slightly larger radii (0.75rem) to differentiate them as distinct physical objects.
- **Angled Cuts:** Elements like progress bars or "Active" state indicators should use 45-degree angled ends rather than rounded caps to reinforce the sports-tech aesthetic.

## Components

### Player Cards
The core component of the system.
- **Texture:** Glassmorphism background with a subtle "carbon fiber" or "pitch" pattern overlay.
- **Header:** Large Anton-style rating number in the top left, with the player position and flag below.
- **Visuals:** High-contrast player cutouts (transparent PNGs) overlapping the card boundaries for a 3D effect.

### Interactive Stat Sliders
- **Track:** Charcoal background.
- **Fill:** Gradient from Primary Green to Neon Lime.
- **Handle:** A sharp, rectangular Neon Lime block.

### Verified Badges
- **League/DT Badges:** Circular icons with a 1px Neon Lime ring. 
- **Verification:** A custom "V" checkmark using the Neon Lime color, appearing next to the player name in headlines.

### Buttons
- **Primary:** Solid Neon Lime with Black Anton text (Uppercase). No rounded corners (0px) for a more aggressive "Pro" look.
- **Secondary:** Ghost style with Neon Lime 1px border and text.

### Radar Charts
- **Geometry:** Hexagonal charts plotting Speed, Power, Technical, Mental, Defense, and Passing.
- **Styling:** Lines in Neon Lime with a 20% opacity lime fill. Use JetBrains Mono for the axis labels.

### Input Fields
- **Style:** Dark Charcoal background with a 1px bottom-border only (Neon Lime on focus). This mimics a "digital scouting" spreadsheet feel.