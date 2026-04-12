"use client";

import type { Phase } from "@/lib/types";

const PHASES: { id: Phase; label: string; step: number }[] = [
  { id: "brief", label: "Campaign Brief", step: 1 },
  { id: "audience", label: "Audience", step: 2 },
  { id: "optimizing", label: "Optimizing", step: 3 },
  { id: "results", label: "Results", step: 4 },
];

interface PhaseIndicatorProps {
  currentPhase: Phase;
}

export default function PhaseIndicator({ currentPhase }: PhaseIndicatorProps) {
  const currentIndex = PHASES.findIndex((p) => p.id === currentPhase);

  return (
    <div className="flex items-center gap-0">
      {PHASES.map((phase, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={phase.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                  isCompleted
                    ? "bg-amber-500 text-neutral-900"
                    : isCurrent
                    ? "bg-amber-500/20 border border-amber-500 text-amber-400"
                    : "bg-neutral-800 border border-neutral-700 text-neutral-500"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  phase.step
                )}
              </div>
              <span
                className={`mt-1.5 text-xs font-medium whitespace-nowrap transition-colors duration-300 ${
                  isCurrent ? "text-amber-400" : isCompleted ? "text-neutral-400" : "text-neutral-600"
                }`}
              >
                {phase.label}
              </span>
            </div>

            {i < PHASES.length - 1 && (
              <div
                className={`h-px w-16 mx-2 mb-5 transition-colors duration-300 ${
                  isCompleted ? "bg-amber-500" : "bg-neutral-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
