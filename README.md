# Running `api.py`

1. Install dependencies:

```bash
python -m pip install -r requirements.txt
```

2. Set your API key (do NOT hardcode it):

PowerShell:

```powershell
$env:OPENAI_API_KEY='sk-...'
$env:OPENAI_BASE_URL='https://api.tokenrouter.com/v1' # optional
python api.py
```

Unix/macOS:

```bash
export OPENAI_API_KEY='sk-...'
export OPENAI_BASE_URL='https://api.tokenrouter.com/v1' # optional
python api.py
```

The script will exit with an error if `OPENAI_API_KEY` is not set. The `OPENAI_BASE_URL` environment variable can be used to override the default `https://api.tokenrouter.com/v1`.
# PromoterLab web app

Clerk-protected Next.js dashboard for the Promoter Prediction API.

## Setup

Copy `.env.example` to `.env.local`, set the Clerk keys and API URL, then run:

```bash
npm install
npm run dev
```

The dashboard sends the active Clerk session token directly to `NEXT_PUBLIC_API_BASE_URL` when a prediction is requested.

## Next.js reference

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
