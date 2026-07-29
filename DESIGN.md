---
name: PromoterLab
description: A tactile scientific atlas for promoter sequence exploration.
colors:
  canvas: "#F3F7F2"
  surface: "#FBFCF9"
  text: "#183128"
  muted-text: "#4D6255"
  accent: "#246B4A"
  accent-soft: "#DCEEE1"
  signal: "#9E4435"
  signal-soft: "#F6DFDA"
  night-canvas: "#16221C"
  night-surface: "#203127"
typography:
  display:
    fontFamily: "Haettenschweiler, Impact, sans-serif"
    fontSize: "clamp(2.75rem, 7vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  control: "4px"
  panel: "12px"
spacing:
  compact: "8px"
  standard: "16px"
  section: "72px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.control}"
    padding: "14px 20px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "14px 20px"
---

# Design System: PromoterLab

## Overview

**Creative North Star: "The Riso Lab Atlas"**

PromoterLab treats sequence prediction as a printed field expedition: overlapping spot inks trace the path from raw sequence to interpretable output. The public experience can be expressive and editorial; the workspace carries the same materials into a precise, readable operating environment.

**Key Characteristics:** tactile paper field, layered scientific annotation, flat inked controls, asymmetrical atlas grids, clear genomic data.

## Colors

Use a small semantic palette: canvas, surface, text, accent, and signal. Green is the only action color; rust is reserved for warnings and errors. Night mode uses low-glare forest surfaces with pale text, while muted text remains readable.

**The Print-Layer Rule.** Color may overlap as an intentional Riso layer, but result states always include a textual label or icon.

## Typography

The display face is compressed and declarative; the body stays neutral and readable. The mono face is reserved for sequence data, coordinates, and model output.

**The Evidence Rule.** Use monospace only where the visitor is reading biological data or measurement.

## Layout

Public pages use a route-like horizontal sequence journey with an atlas rail and varied editorial density. Workspace views use a wide, flat workbench with a clear input-to-result order. Below 768px, columns stack; sequence strings retain horizontal scroll rather than becoming illegible.

## Elevation & Depth

The system is flat by default. Separation comes from ink outlines, offset registration layers, and paper blocks; shadows appear only as small physical lifts during interaction.

## Shapes

Panels are softly squared, usually 12px. Labels and primary actions use clipped or tab-like rectangular forms. Pills are reserved for compact filters and statuses.

## Components

### Buttons

Flat, high-contrast spot-ink controls with a 2px ink outline. Hover introduces a small offset misregistration; focus uses a visible outline.

### Inputs / Fields

Paper-toned fields use an ink border, mono content where biological data is entered, and a coral focus treatment.

### Navigation

Navigation is an atlas index: compact labels, active tab as an overprinted ink block, and a practical stacked mobile version.

## Do's and Don'ts

### Do:

- **Do** lead with the sequence-to-prediction path.
- **Do** make learning illustrations and model outputs clearly distinguishable.
- **Do** honor reduced-motion preferences by locking registration layers in place.

### Don't:

- **Don't** use neon gradients or floating translucent cards.
- **Don't** fabricate performance statistics, pricing, customer proof, or biological scope.
- **Don't** let texture obscure controls, sequences, results, or error recovery.
