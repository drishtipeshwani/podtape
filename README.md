# Discover Podcasts

Episode-level podcast discovery by **mood** or **outcome**, powered by [Algolia Agent Studio](https://www.algolia.com/doc/guides/algolia-ai/agent-studio).

- **Home** → **Dashboard** with two tabs: *By outcome* and *By mood*.
- Pick a suggestion chip or type your own; get episode recommendations from your Algolia index via Agent Studio.

## Getting Started

1. Copy `.env.example` to `.env.local` and set:
   - `ALGOLIA_APPLICATION_ID` – Algolia application ID
   - `ALGOLIA_API_KEY` – API key with Agent Studio access
   - `ALGOLIA_AGENT_ID` – ID of your published agent (from [Agent Studio dashboard](https://dashboard.algolia.com/generativeAi/agent-studio/agents))
2. In Agent Studio: create an agent, attach your **episode-level** Algolia index, choose an LLM, and publish.
3. Populate the episodes index (e.g. from your own Spotify → Algolia pipeline).

Then run the development server:

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
