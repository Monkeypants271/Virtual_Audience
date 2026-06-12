"use client";

// Small "what models power this app" badge, shown on the landing screen.
// Mirrors the StoryGecko style: MODELS | <model> <stage> → <model> <stage>
export default function ModelBadge() {
  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg border border-neutral-800 bg-neutral-900/40 font-mono text-xs">
      <span className="text-neutral-500 tracking-widest">MODELS</span>
      <span className="w-px h-4 bg-neutral-700" aria-hidden />
      <span className="flex items-center gap-1.5">
        <span className="text-amber-400 font-semibold">Claude Sonnet 4.6</span>
        <span className="text-neutral-500">scoring</span>
        <span className="text-neutral-600">→</span>
        <span className="text-amber-400 font-semibold">Claude Sonnet 4.6</span>
        <span className="text-neutral-500">refinement</span>
      </span>
    </div>
  );
}
