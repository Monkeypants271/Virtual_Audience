"use client";

import type { OptimizationState, Iteration } from "@/lib/types";

interface OptimizationProgressProps {
  state: OptimizationState;
  completedIterations: Iteration[];
  maxIterations: number;
  targetScore: number;
}

const PHASE_LABELS: Record<OptimizationState["phase"], string> = {
  scoring: "Evaluating personas",
  aggregating: "Aggregating scores",
  diagnosing: "Running diagnostics",
  refining: "Rewriting asset",
  done: "Complete",
};

export default function OptimizationProgress({ state, completedIterations, maxIterations, targetScore }: OptimizationProgressProps) {
  const MAX_ITERATIONS = maxIterations;
  const TARGET_SCORE = targetScore;
  const personaPercent =
    state.phase === "scoring"
      ? Math.round((state.completedPersonas / state.totalPersonas) * 100)
      : 100;

  const previousIteration = completedIterations.length > 0
    ? completedIterations[completedIterations.length - 1]
    : null;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-100 mb-1">
          Optimization Loop Running
        </h2>
        <p className="text-sm text-neutral-400">
          Iteration {state.currentIteration} of {MAX_ITERATIONS} · Target score{" "}
          <span className="text-amber-400">{TARGET_SCORE}</span>
        </p>
      </div>

      {/* Iteration progress bars */}
      <div className="flex gap-2">
        {Array.from({ length: MAX_ITERATIONS }).map((_, i) => {
          const iterNum = i + 1;
          const isPast = iterNum < state.currentIteration;
          const isCurrent = iterNum === state.currentIteration;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full h-1.5 rounded-full transition-all duration-500 ${
                  isPast ? "bg-amber-500" : isCurrent ? "bg-amber-500/40" : "bg-neutral-700"
                }`}
              />
              {isPast && completedIterations[i] && (
                <span className="text-xs text-amber-500 font-mono">
                  {completedIterations[i].averageScore.toFixed(1)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Score comparison — previous vs current */}
      <div className="grid grid-cols-2 gap-4">
        {/* Previous iteration score (left) */}
        <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4">
          <p className="text-xs text-neutral-500 mb-1">
            {previousIteration ? `Iteration ${previousIteration.iterationNumber} score` : "Previous score"}
          </p>
          {previousIteration ? (
            <p className="text-3xl font-bold font-mono text-neutral-400">
              {previousIteration.averageScore.toFixed(1)}
              <span className="text-neutral-600 text-base font-normal">/10</span>
            </p>
          ) : (
            <p className="text-2xl font-bold font-mono text-neutral-600">—</p>
          )}
        </div>

        {/* Current running average (right) */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
          <p className="text-xs text-neutral-500 mb-1">
            {state.phase === "scoring" ? "Running avg (live)" : "Iteration score"}
          </p>
          {state.runningScore > 0 ? (
            <p className="text-3xl font-bold font-mono text-amber-400">
              {state.runningScore.toFixed(1)}
              <span className="text-neutral-500 text-base font-normal">/10</span>
            </p>
          ) : (
            <p className="text-2xl font-bold font-mono text-neutral-600">—</p>
          )}
        </div>
      </div>

      {/* Current phase card */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse-slow" />
          <span className="text-sm font-medium text-neutral-200">
            {PHASE_LABELS[state.phase]}
          </span>
        </div>

        {/* Persona scoring progress */}
        {state.phase === "scoring" && (
          <div>
            <div className="flex justify-between text-xs text-neutral-500 mb-1.5">
              <span>
                {state.completedPersonas} / {state.totalPersonas} personas evaluated
              </span>
              <span>{personaPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${personaPercent}%` }}
              />
            </div>
            <p className="text-xs text-neutral-600 mt-1.5">
              Running average updates as responses arrive — stabilises when all 30 complete
            </p>
          </div>
        )}

        {(state.phase === "diagnosing" || state.phase === "refining") && (
          <div className="flex gap-1.5 items-center h-4">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>

      {/* Score target bar */}
      <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4">
        <div className="flex justify-between text-xs text-neutral-500 mb-2">
          <span>Score Progress</span>
          <span>Target: {TARGET_SCORE}</span>
        </div>
        <div className="relative w-full h-3 bg-neutral-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700"
            style={{ width: `${(state.runningScore / 10) * 100}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/30"
            style={{ left: `${TARGET_SCORE * 10}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs">
          <span className="text-neutral-600">0</span>
          <span className="text-neutral-600">10</span>
        </div>
      </div>

      {/* Previous iteration objections — quick reference */}
      {previousIteration && previousIteration.topObjections.length > 0 && (
        <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4">
          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
            Top objections from iteration {previousIteration.iterationNumber} (being addressed)
          </p>
          <ul className="space-y-1">
            {previousIteration.topObjections.slice(0, 3).map((obj, i) => (
              <li key={i} className="flex gap-2 text-xs text-neutral-500">
                <span className="text-red-400 flex-shrink-0">—</span>
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
