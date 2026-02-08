import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-background">
      <span className="text-5xl mb-2" role="img" aria-label="cassette tape">📼</span>
      <h1 className="text-4xl font-bold tracking-tight text-blush mb-3">
        pod-tape
      </h1>
      <p className="text-lg text-plum-light max-w-md mb-8">
        Pick a vibe. Get episode recommendations that match exactly how you feel
        right now.
      </p>
      <Link
        href="/dashboard"
        className="rounded-lg bg-blush text-plum-dark px-6 py-3 font-medium hover:opacity-90 transition-opacity"
      >
        Pick your vibe
      </Link>
    </main>
  );
}
