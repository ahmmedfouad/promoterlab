# PromoterLab

A research-first web interface for promoter prediction and DNA sequence analysis. Built with Next.js, Three.js, and a calibrated laboratory design system.

## Tech Stack

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS v4
- Three.js
- Lucide React

## Features

- DNA sequence analysis via XGBoost prediction API
- Interactive 3D DNA visualization
- Base composition statistics
- Sequence history with JSON export
- Promoter strength prediction with confidence scores
- Copy-to-clipboard and download workflows

## Getting Started

```bash
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=your_backend_url
NEXT_PUBLIC_API_KEY=optional_api_key
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Design System

The interface follows a quiet laboratory aesthetic: deep navy surfaces, cobalt action color, and semantic DNA base colors (A green, T red, C cobalt, G slate). All design tokens live in `app/globals.css`. See `DESIGN.md` for the full specification.
