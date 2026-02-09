# Pod-tape

Episode-level podcast discovery based on "vibe", powered by Algolia Agent Studio. This project indexes latest podcast episodes (episode-level records) across genres into an Algolia index and exposes a Next.js app that queries an Agent Studio agent for curated episode recommendations.

## Quick local setup

Prereqs:
- Node.js (18+ recommended)
- An Algolia account with Agent Studio access

1) Clone and install

```bash
npm install
```

2) Create Algolia resources

- Create an Algolia application (you'll get an Application ID).
- Get the Algolia API Key with WRTIE and SEARCH Access. 
- Name your episodes index `podcast_index` (this is the index used by the included fetch script).

3) Environment variables

Create a `.env.local` file at the project root with these keys:

- `ALGOLIA_APPLICATION_ID` — your Algolia Application ID
- `ALGOLIA_SEARCH_API_KEY` — a search-only API key used by the app / Agent Studio
- `ALGOLIA_AGENT_ID` — the Agent Studio agent ID you create and publish
- `ALGOLIA_WRITE_API_KEY` — a write/admin API key used by the fetch script to push records

Example `.env.local` (do not commit this file):

```bash
ALGOLIA_APPLICATION_ID=YourAppId
ALGOLIA_SEARCH_API_KEY=searchKey...
ALGOLIA_AGENT_ID=your-agent-id
ALGOLIA_WRITE_API_KEY=writeKey...
```

4) Populate the Algolia index (fetch data)

This repository includes `scripts/fetchData.ts` which:
- queries the iTunes / Apple Podcasts search API for popular feeds based on the mentioned genre (eg - tech-news, relationships, sports, personal-journals, self-improvement, travel, etc)
- parses the podcast RSS feeds (currently set to top 5 recent episodes per show)
- writes episode-level records to the `podcast_index` Algolia index

You can use the following command to run this script locally

```bash
npx tsx --env-file=.env.local scripts/fetchData.ts
```

The script will list discovered shows and prompt for confirmation before pushing records. The index name used by the script is `podcast_index`.

5) Create and publish an Agent in Algolia Agent Studio

- In the Agent Studio dashboard, create a new agent.
- Attach the `podcast_index` to the agent as a searchable data source.
- Choose an LLM / model (Agent Studio options) and publish the agent.
- In the agent configuration, paste the system instructions (from `systeminstructions.md`) into the agent's system prompt so the agent knows how to select and return recommendations.

6) Run the app

Start the Next.js dev server:

```bash
npm run dev
```

Open http://localhost:3000 and use the UI to select a vibe and get podcast episode recommendations; the app calls the local API which talks to your Agent Studio agent (make sure `ALGOLIA_APPLICATION_ID`, `ALGOLIA_SEARCH_API_KEY`, and `ALGOLIA_AGENT_ID` are set).

---
