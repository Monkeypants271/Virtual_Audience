"use client";

import { useState } from "react";
import type { Iteration } from "@/lib/types";

interface IterationCardProps {
  iteration: Iteration;
  isFirst: boolean;
  isFinal: boolean;
}

export default function IterationCard({ iteration, isFirst, isFinal }: IterationCardProps) {
  const [expanded, setExpanded] = useState(isFinal);

  const scoreColor =
    iteration.averageScore >= 8.5
      ? "text-green-400"
      : iteration.averageScore >= 6
      ? "text-amber-400"
      : "text-red-400";

  const scoreBg =
    iteration.averageScore >= 8.5
      ? "bg-green-400/10 border-green-400/20"
      : iteration.averageScore >= 6
      ? "bg-amber-400/10 border-amber-400/20"
      : "bg-red-400/10 border-red-400/20";

  return (
    <div
      className={`bg-neutral-800 rounded-xl border transition-all duration-200 ${
        isFinal ? "border-amber-500/40" : "border-neutral-700"
      }`}
    >
      {/* Card header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`px-2 py-1 rounded text-xs font-semibold border ${scoreBg} ${scoreColor}`}>
            {iteration.averageScore.toFixed(1)} / 10
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-200">
                {isFirst ? "Original Asset" : `Iteration ${iteration.iterationNumber}`}
              </span>
              {isFinal && (
                <span className="px-1.5 py-0.5 bg-amber-500 text-neutral-900 text-xs font-bold rounded">
                  FINAL
                </span>
              )}
            </div>
            <div className="flex gap-3 mt-1">
              <span className="text-xs text-neutral-500">
                <span className="text-red-400">{iteration.scoreDistribution.low}</span> low ·{" "}
                <span className="text-amber-400">{iteration.scoreDistribution.mid}</span> mid ·{" "}
                <span className="text-green-400">{iteration.scoreDistribution.high}</span> high
              </span>
            </div>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-neutral-700 pt-4 animate-fade-in">
          {/* Asset text */}
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Asset</p>
            <pre className="font-mono text-sm text-neutral-300 bg-neutral-900 rounded-lg p-4 whitespace-pre-wrap leading-relaxed border border-neutral-700">
              {iteration.assetText}
            </pre>
          </div>

          {/* Reactions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Top Objections</p>
              <ul className="space-y-1.5">
                {iteration.topObjections.map((obj, i) => (
                  <li key={i} className="flex gap-2 text-xs text-neutral-400">
                    <span className="text-red-400 flex-shrink-0">—</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Top Positives</p>
              <ul className="space-y-1.5">
                {iteration.topPositives.map((pos, i) => (
                  <li key={i} className="flex gap-2 text-xs text-neutral-400">
                    <span className="text-green-400 flex-shrink-0">+</span>
                    {pos}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Diagnostic report */}
          {iteration.diagnosticReport && (
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Diagnostic Report</p>
              <div className="text-xs text-neutral-400 bg-neutral-900 rounded-lg p-4 whitespace-pre-wrap leading-relaxed border border-neutral-700">
                {iteration.diagnosticReport}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
