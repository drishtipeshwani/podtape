import { NextRequest, NextResponse } from "next/server";
import { createCompletion } from "@/lib/agent-studio";
import type { EpisodeRecommendation } from "@/lib/types";

const appId = process.env.ALGOLIA_APPLICATION_ID;
const apiKey = process.env.ALGOLIA_SEARCH_API_KEY;
const agentId = process.env.ALGOLIA_AGENT_ID;


export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  return handleRecommend(query);
}

export async function POST(request: NextRequest) {
  let query: string | null = request.nextUrl.searchParams.get("query");
  try {
    const body = await request.json();
    if (body.query != null) query = body.query;
  } catch {
    
  }
  return handleRecommend(query);
}

async function handleRecommend(query: string | null) {

  if (!appId || !apiKey || !agentId) {
    return NextResponse.json(
      {
        error:
          "Agent Studio not configured. Set ALGOLIA_APPLICATION_ID, ALGOLIA_SEARCH_API_KEY, and ALGOLIA_AGENT_ID in .env.local and create an agent in the Algolia Agent Studio dashboard.",
        episodes: [],
      },
      { status: 503 }
    );
  }

  if (!query?.trim()) {
    return NextResponse.json(
      { error: "Missing query" },
      { status: 400 }
    );
  }

 try {
    const content = await createCompletion({
      agentId,
      message: query,
      appId,
      apiKey,
      stream: false
    });

    const episodes = parseEpisodesFromResponse(content);
    return NextResponse.json({ episodes });
  } catch (err) {
    console.error("[recommend] error:", err);
    const message = err instanceof Error ? err.message : "Agent Studio request failed";
    return NextResponse.json(
      { error: message, episodes: [] },
      { status: 502 }
    );
  }
}

function parseEpisodesFromResponse(content: string): EpisodeRecommendation[] {
  if (!content?.trim()) return [];

  let raw = content.trim();
  const codeBlock = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) raw = codeBlock[1].trim();
  const firstBracket = raw.indexOf("[");
  if (firstBracket !== -1) {
    const lastBracket = raw.lastIndexOf("]");
    if (lastBracket > firstBracket) raw = raw.slice(firstBracket, lastBracket + 1);
  }
  try {
    raw = raw.replace(/"(?:[^"\\]|\\.|\n|\r)*"/g, (match) => {
      return match
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\\(?!["\\/bfnrtu])/g, "");
    });

    const arr = JSON.parse(raw) as unknown[];

    if (!Array.isArray(arr)) return [];

    const mapped = arr.map((item) => normalizeEpisode(item));
    const filtered = mapped.filter((ep): ep is EpisodeRecommendation => ep != null && Boolean(ep.id && ep.episodeTitle));

    return filtered;
  } catch (e) {
    console.error("Parse Episodes From Response FAILED:", e instanceof Error ? e.message : e);
    return [];
  }
}

function normalizeEpisode(item: unknown): EpisodeRecommendation | null {
  if (!item || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;

  const id =
    (o.objectID as string) ?? (o.id as string) ?? "";
  const episodeTitle =
    (o.episodeName as string) ?? (o.episodeTitle as string) ?? (o.title as string) ?? (o.name as string) ?? "";
  const showName =
    (o.podcastShowTitle as string) ?? (o.showName as string) ?? "";
  const image =
    (o.podcastShowImage as string) ?? (o.image as string) ?? (o.showImage as string) ?? "";
  const description =
    (o.episodeSummary as string) ?? (o.description as string) ?? "";
  const duration =
    typeof o.episodeDuration === "number"
      ? `${o.episodeDuration} min`
      : (o.episodeDuration as string) ?? (o.duration as string) ?? "";
  const link =
    (o.episodeLink as string) ?? (o.link as string) ?? "";

  if (!id && !episodeTitle) return null;
  return {
    id: (id || episodeTitle.slice(0, 50)) || "unknown",
    episodeTitle,
    showName,
    image,
    description,
    duration,
    link,
    releaseDate: (o.episodePubDate as string) ?? (o.releaseDate as string) ?? undefined,
  };
}
