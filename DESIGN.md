# PromoterLab Design System

## Direction

PromoterLab is a quiet scientific instrument: a cool laboratory canvas, deep navy data ink, and one cobalt action color. The interface should feel calibrated and legible rather than decorative.

## Tokens

All color and elevation decisions live in `app/globals.css` under `:root`. Components use semantic classes and must not introduce hex, RGB, or CSS color values. The Three.js viewer reads its palette from the same CSS tokens at runtime.

## Components

- Panels: white surfaces, one quiet border, 14px radius.
- Primary actions: cobalt fill, white label, compact 8px radius.
- Secondary actions: white surface and neutral border.
- Data labels: JetBrains Mono; all other interface copy uses Inter.
- DNA base colors are semantic: A green, T red, C cobalt, G slate.

## Layout and motion

Use the shared `--page-width` container. Two-column workspaces collapse to one column below 820px. Motion communicates state only: button feedback, analysis progress, result fill, and the Three.js DNA rotation.

## Constraints

Avoid gradients, glass effects, new font families, or component-specific color declarations. Preserve clear focus states, responsive layouts, and the research-first flow from sequence input to result.
