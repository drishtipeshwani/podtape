const axios = require('axios');
const Parser = require('rss-parser');
const readline = require('readline');
const { algoliasearch } = require('algoliasearch');

const appId = process.env.ALGOLIA_APPLICATION_ID;
const apiKey = process.env.ALGOLIA_WRITE_API_KEY;
const client = algoliasearch(appId, apiKey);
const indexName = 'podcast_index';
const parser = new Parser();

function cleanHtml(raw: string | undefined | null): string {
  if (!raw) return "";

  let text = raw;

  text = text.replace(/<a[^>]*>[\s\S]*?<\/a>/gi, "");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/(?:p|div|li|h[1-6])>/gi, "\n");
  text = text.replace(/<[^>]+>/g, "");

  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}

// Get the duration of the episode in minutes
function parseDuration(raw: string | number | undefined | null): number {
  if (raw == null || raw === "") return 0;

  const str = String(raw).trim();

  // Colon-separated: HH:MM:SS or MM:SS
  if (str.includes(":")) {
    const parts = str.split(":").map(Number);
    let totalSeconds = 0;
    if (parts.length === 3) {
      totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      totalSeconds = parts[0] * 60 + parts[1];
    }
    const mins = Math.round(totalSeconds / 60);
    return mins;
  }

  // Raw number (seconds)
  const seconds = Number(str);
  if (!isNaN(seconds) && seconds > 0) {
    const mins = Math.round(seconds / 60);
    return mins;
  }

  return 0;
}

async function fetchPodcastFeeds(term: string) {
  const url = `https://itunes.apple.com/search?term=${term}&media=podcast&entity=podcast&explicit=No&limit=200`;
  try {
    const response = await axios.get(url);
    const cutoff = Date.now() - 100 * 24 * 60 * 60 * 1000;
    return response.data.results
      .filter((p: any) => {
        const genres: string[] = p.genres ?? [];
        const blocked = genres.some((g: string) => /religion|spirituality/i.test(g));
        const isLatinTitle = /^[\x20-\x7E\u00C0-\u024F\s]+$/.test(p.collectionName ?? "");
        return (p.contentAdvisoryRating === "Clean" || p.collectionExplicitness === "notExplicit") && p.trackCount > 50 && new Date(p.releaseDate).getTime() > cutoff && !blocked && isLatinTitle;
      })
      .sort((a: any, b: any) => b.trackCount - a.trackCount)
      .slice(0, 50)
      .map((p: any) => ({
      appleId: p.collectionId,
      feedUrl: p.feedUrl,
      artwork: p.artworkUrl600,
      primaryGenreName: p.primaryGenreName,
      artistName: p.artistName,
      collectionName: p.collectionName,
      genres: p.genres
    }));
  } catch (error) {
    console.error('Error fetching from iTunes:', error);
    return [];
  }
}

async function parseFeed(podcast: any) {
  if (!podcast.feedUrl) return null;
  try {
    const feed = await parser.parseURL(podcast.feedUrl);
    // Index individual episodes
    let latestEpisodes = feed.items.slice(0, 5).filter((item: any) => item.pubDate).sort((a: any, b: any) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()).map((item: any) => ({
        objectID: podcast.appleId + "-" + item.guid,
        episodeName: item.title,
        episodePubDate: item.pubDate,
        episodeDuration: parseDuration(item.itunes?.duration),
        episodeType: parseDuration(item.itunes?.duration) > 20 ? "long" : "short",
        episodeSummary: cleanHtml(item.content).substring(0, 1000),
        episodeKeywords: item.itunes?.keywords ?? podcast.genres,
        // Show metadata
        podcastShowTitle: podcast.collectionName,
        podcastShowAuthor: podcast.artistName,
        podcastShowImage: podcast.artwork,
        podcastShowGenres: podcast.genres,
        podcastShowDescription: feed.description
    }));
    return latestEpisodes;
  } catch (error) {
    console.warn(`Failed to parse feed for ${podcast.appleId}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

// 4. The Main Runner
async function run() {
  console.log("Fetching podcast data...");
  
  // Fetching data across various genres
  const seedPodcasts = await fetchPodcastFeeds("science");
  console.log(`Found ${seedPodcasts.length} podcasts. Parsing RSS feeds...`);
  const rawRecords = await Promise.all(seedPodcasts.map((p: any) => parseFeed(p)));
  const validRecords = rawRecords.filter((r: any) => r !== null).flat();

  if (validRecords.length === 0) {
    console.log("No valid records found.");
    return;
  }

  const uniqueShows = [...new Set(validRecords.map((r: any) => r.podcastShowTitle))];
  console.log(`\n📋 Found ${validRecords.length} episodes from ${uniqueShows.length} podcasts:\n`);
  uniqueShows.forEach((name, i) => {
    const episodeCount = validRecords.filter((r: any) => r.podcastShowTitle === name).length;
    console.log(`  ${i + 1}. ${name} (${episodeCount} episodes)`);
  });

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise<string>((resolve) => {
    rl.question(`\nPush ${validRecords.length} episodes to Algolia index "${indexName}"? (y/n) `, resolve);
  });
  rl.close();

  if (answer.toLowerCase() !== 'y') {
    console.log("❌ Cancelled. Nothing was pushed to Algolia.");
    return;
  }

  await client.saveObjects({ indexName, objects: validRecords });
  console.log(`✅ Successfully indexed ${validRecords.length} episodes to Algolia!`);
}

run();