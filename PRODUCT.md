# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are people evaluating DNA sequences for promoter regions, including students, academic researchers, and biotechnology teams. They need to submit a DNA sequence, select a classifier, understand the prediction, and review saved runs.

## Product Purpose

PromoterLab is a Clerk-protected web application for predicting whether a DNA sequence contains a promoter region. Its public site demonstrates promoter concepts and directs visitors to a research workspace; the workspace submits authenticated predictions to a configured API and displays results and history.

## Positioning

PromoterLab combines a sequence-prediction workspace with an explorable promoter-learning experience, including motif inspection and an interactive DNA visualization.

## Operating Context

Visitors arrive through a public educational/product page. Signed-in users work in a browser-based research workspace, choose an SVM or XGBoost classifier, enter or select a sequence, inspect results, export JSON, and view prediction history.

## Capabilities and Constraints

- Next.js web application using Clerk authentication.
- Predictions are sent with the active session token to `NEXT_PUBLIC_API_BASE_URL`.
- The workspace supports SVM and XGBoost classifier selection, JSON export, an interactive 3D DNA view, and prediction history.
- The public page includes Vinca-focused educational and demonstration content.
- Exact supported organisms, validated accuracy claims, access limits, pricing, and commercial availability remain open decisions and must not be represented as verified product facts without confirmation.

## Brand Commitments

- Product name: PromoterLab.
- Preserve the scientific, clear, research-oriented voice and the existing DNA graphic asset at `app/dna.png` where useful.

## Evidence on Hand

- Working UI and copy in `app/page.tsx` and `app/components/dashboard.tsx`.
- Interactive DNA component at `app/components/Interactive3DDNA.tsx`.
- DNA asset at `app/dna.png`.
- No verified testimonials, customer logos, external validation, or confirmed commercial/pricing evidence is on hand.

## Product Principles

- Put real sequence analysis at the center of the experience.
- Make scientific information legible without diluting the underlying task.
- Distinguish illustrative learning content from model output.
- Keep authenticated research flows direct and auditable.
- Never overstate model performance, access, or biological scope.

## Accessibility & Inclusion

Use semantic controls, clear focus states, sufficient contrast, and responsive layouts. No more specific product accessibility standard has been confirmed.
