"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { DISCOVERY_TAGS } from "@/lib/constants";
import type { DiscoveryTag } from "@/lib/constants";
import type { EpisodeRecommendation } from "@/lib/types";

function PodcastCover({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="w-full aspect-square bg-plum-mid/40 flex items-center justify-center text-4xl">
        🎧
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={260}
      height={260}
      className="w-full aspect-square object-cover"
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}

const DASHBOARD_LAYOUT: Record<string, [number, number]> = {
  "boost-dopamine":        [2, 2],
  "make-me-laugh":         [1, 1],
  "brain-food":            [1, 1],
  "main-character-energy": [2, 1],
  "strolling-around":      [2, 1],
  "girl-talk":             [1, 1],
  "mealtime-watch":        [1, 1],
  "finance-101":           [1, 1],
  "whats-new":             [2, 1],
  "literal-chills":        [1, 1],
  "long-drives":           [2, 1],
  "before-sleep":          [1, 1],
  "quick-listen":          [1, 1],
};

export default function DashboardPage() {
  const [activeTag, setActiveTag] = useState<DiscoveryTag | null>(null);
  const [episodes, setEpisodes] = useState<EpisodeRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTagTap = useCallback(
    async (tag: DiscoveryTag) => {
      if (loading) return;

      if (activeTag?.id === tag.id) {
        setActiveTag(null);
        setEpisodes([]);
        return;
      }
      setActiveTag(tag);
      setError(null);
      setLoading(true);
      setEpisodes([]);

      try {
        const params = new URLSearchParams({ query: tag.query });
        const res = await fetch(`/api/recommend?${params.toString()}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            data.error || res.statusText || "Failed to get recommendations"
          );
        }
        const data = await res.json();
        setEpisodes(data.episodes ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
    [activeTag, loading]
  );

  return (
    <main className="min-h-screen px-4 py-8 max-w-4xl mx-auto bg-background">
      <nav className="mb-10">
        <Link
          href="/"
          className="text-plum-light hover:text-blush transition-colors"
        >
          ← Home
        </Link>
      </nav>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-blush mb-2">
          What are you in the mood for?
        </h1>
        <p className="text-plum-light">Tap a vibe to get episode recommendations.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 auto-rows-[85px] gap-3 mb-12" style={{ gridAutoFlow: "dense" }}>
        {DISCOVERY_TAGS.map((tag) => {
          const isActive = activeTag?.id === tag.id;
          const [colSpan, rowSpan] = DASHBOARD_LAYOUT[tag.id] ?? [1, 1];

          const spanClasses = [
            colSpan === 2 ? "col-span-2" : "col-span-1",
            rowSpan === 2 ? "row-span-2" : "row-span-1",
          ].join(" ");

          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleTagTap(tag)}
              className={`
                ${spanClasses}
                relative flex flex-col items-center justify-center gap-2
                rounded-2xl border p-4
                transition-all duration-200 ease-out
                cursor-pointer select-none
                hover:scale-[1.03] active:scale-[0.97]
                ${
                  isActive
                    ? "border-blush bg-blush text-plum-dark shadow-lg"
                    : "border-plum-mid bg-plum-mid/30 text-blush hover:border-plum-light hover:bg-plum-mid/50"
                }
              `}
            >
              <span className={`${rowSpan === 2 || colSpan === 2 ? "text-4xl" : "text-3xl"}`} role="img" aria-hidden="true">
                {tag.emoji}
              </span>
              <span className={`font-medium leading-tight text-center ${rowSpan === 2 || colSpan === 2 ? "text-base" : "text-sm"}`}>
                {tag.label}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mb-6 text-center text-red-300" role="alert">
          {error}
        </p>
      )}

      <section aria-label="Recommended episodes">
        {loading && (
          <p className="text-center text-plum-light">
            Finding episodes for <strong className="text-blush">{activeTag?.label}</strong>…
          </p>
        )}

        {!loading && episodes.length === 0 && !error && !activeTag && (
          <p className="text-center text-plum-light">
            Pick a vibe above to discover episodes.
          </p>
        )}

        {!loading && episodes.length === 0 && !error && activeTag && (
          <p className="text-center text-plum-light">
            No episodes found. Try another vibe!
          </p>
        )}

        {!loading && episodes.length > 0 && (() => {
          const firstRow = episodes.slice(0, 3);
          const secondRow = episodes.slice(3);

          const renderCard = (ep: EpisodeRecommendation) => (
            <li
              key={ep.id}
              className="flex flex-col rounded-xl border border-plum-mid bg-plum-mid/20 overflow-hidden w-full max-w-[260px]"
            >
              <PodcastCover
                src={ep.image || ""}
                alt={`${ep.showName} cover`}
              />
              <div className="p-3 flex flex-col gap-1">
                <h2 className="font-semibold text-blush text-sm leading-snug line-clamp-2">
                  {ep.episodeTitle}
                </h2>
                <p className="text-xs text-plum-light truncate">{ep.showName}</p>
                {ep.duration && (
                  <p className="text-xs text-plum-light/80">{ep.duration}</p>
                )}
              </div>
            </li>
          );

          return (
            /** Podcast Episode Recommendations */
            <div className="space-y-5">
              <ul className="flex justify-center gap-4 flex-wrap">
                {firstRow.map(renderCard)}
              </ul>
              {secondRow.length > 0 && (
                <ul className="flex justify-center gap-4 flex-wrap">
                  {secondRow.map(renderCard)}
                </ul>
              )}
            </div>
          );
        })()}
      </section>
    </main>
  );
}
