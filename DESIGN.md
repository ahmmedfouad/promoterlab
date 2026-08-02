# Design System: PromoterLab

## Overview

**Creative North Star: Clean Workbench**

PromoterLab is a single-palette instrument — light warm paper, sharp data type, and one action color (orange). The design eliminates theme toggles, dark-mode overrides, and competing CSS systems. Every surface reads as one product.

## Palette

| Token | Value | Role |
|-------|-------|------|
| `--c-bg` | `#F6F4EA` | Page ground (warm paper) |
| `--c-surface` | `#F9F7F0` | Panel/card surface |
| `--c-text` | `#14161A` | Primary text |
| `--c-muted` | `#5A6068` | Secondary text, labels |
| `--c-border` | `#D6D0C0` | Borders, dividers |
| `--c-accent` | `#FF5A1F` | Primary action (Run, CTA) |
| `--c-accent-hover` | `#E04E1A` | Hovered action |
| `--c-accent-soft` | `rgba(255,90,31,0.06)` | Subtle action tint |
| `--c-base-a` | `#3FA45B` | Adenine (green) |
| `--c-base-t` | `#E5484D` | Thymine (red) |
| `--c-base-c` | `#4C7FE0` | Cytosine (blue) |
| `--c-base-g` | `#6B7280` | Guanine (gray) |

## Typography

- **Body:** Inter, 1rem / 1.6 line-height. Weight 400.
- **Kicker / labels:** JetBrains Mono, 0.72rem, bold, uppercase, 0.06–0.12em tracking.
- **Headings:** Inter, 700–800 weight, tight letter-spacing (−0.03em).
- **Data / measurements:** JetBrains Mono, bold, 0.72–0.78rem.
- **Display:** Inter 800 at clamp scale. No display-only faces.

## Components

### Buttons
Flat, high-contrast: orange fill (#FF5A1F), white text, 6px radius, 10px 18px padding. Active state = slight scale-down (0.97). No shadow; no outline ring.

### Panels
Light (#F9F7F0) surface, 1px border (#D6D0C0), 10px radius, 20px padding. No blur, no shadow. Header bar is a muted mono label on warm paper.

### Textarea
White (#FFF) background, 1px warm-gray border, 8px radius. Focus: orange border + subtle orange glow (rgba 0.12).

### Preset Pills
Rounded 20px pill, 1px border, white background, 0.7rem bold. Active: charcoal fill, white text.

### Motif Badges
7rem bold mono, 4px 10px padding, 4px radius. Found: green fill, white text. Missing: dashed warm gray border.

### Tabs
Bottom-border strip. Active tab gets orange underline (2px). Inactive: muted color, no underline.

### Data Table
1px borders on all cells, alternating hover tint (rgba orange 0.04). Mono header, 0.68rem uppercase.

### DNA 3D Viewer
Light warm panel. Header label as mono tag. Canvas fills remaining space.

## Elevation
Flat by default. Panels use border only — no shadow. Active controls get a subtle scale transform (scale 0.97) instead of elevation change.

## Responsive
Below 768px: two-column grids collapse to single column. Station journey stacks vertically. Nav links hide behind a hamburger (not implemented — use scroll) on small screens. Sequence strings scroll horizontally rather than wrapping in textarea.

## Do's and Don'ts
- **Do** lead with the sequence-to-prediction path on every screen.
- **Do** use the orange accent only for the primary action (Run) — never for decoration.
- **Do** keep the data table readable at small widths (horizontal scroll).
- **Don't** introduce theme toggles or dark-mode CSS custom properties.
- **Don't** add backdrop-blur, shadow-2xl, or gradient decorations.
- **Don't** use neon colors, floating translucent cards, or glass effects.
- **Don't** use monospace as a costume — only for data, measurements, code, labels.