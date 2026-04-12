"use client";

import type { Iteration, Persona, CampaignBrief } from "@/lib/types";
import IterationCard from "./IterationCard";
import ScoreChart from "./ScoreChart";

interface ResultsDisplayProps {
  iterations: Iteration[];
  personas: Persona[];
  brief: CampaignBrief;
}

export default function ResultsDisplay({ iterations, personas, brief }: ResultsDisplayProps) {
  if (iterations.length === 0) return null;

  const lastIteration = iterations[iterations.length - 1];
  // Show the best-scoring iteration's asset, not necessarily the last one
  const bestIteration = iterations.reduce((best, iter) =>
    iter.averageScore > best.averageScore ? iter : best, iterations[0]);
  const scores = iterations.map((it) => it.averageScore);

  // Audience summary stats
  const skepticismCounts = { low: 0, medium: 0, high: 0 };
  const motivationCounts = { low: 0, medium: 0, high: 0 };
  personas.forEach((p) => {
    skepticismCounts[p.skepticismLevel]++;
    motivationCounts[p.motivationLevel]++;
  });

  const scoreImprovement = bestIteration.averageScore - iterations[0].averageScore;
  const targetReached = bestIteration.averageScore >= 8.5;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Summary header */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
          <p className="text-xs text-neutral-500 mb-1">Best Score</p>
          <p className={`text-3xl font-bold font-mono ${targetReached ? "text-green-400" : "text-amber-400"}`}>
            {bestIteration.averageScore.toFixed(1)}
            <span className="text-neutral-600 text-lg font-normal">/10</span>
          </p>
          {targetReached && (
            <p className="text-xs text-green-400 mt-1">Target reached</p>
          )}
          {bestIteration.iterationNumber !== lastIteration.iterationNumber && (
            <p className="text-xs text-neutral-500 mt-1">Iter {bestIteration.iterationNumber}</p>
          )}
        </div>
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
          <p className="text-xs text-neutral-500 mb-1">Score Improvement</p>
          <p className="text-3xl font-bold font-mono text-amber-400">
            {scoreImprovement >= 0 ? "+" : ""}{scoreImprovement.toFixed(1)}
          </p>
          <p className="text-xs text-neutral-500 mt-1">over {iterations.length} iteration{iterations.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
          <p className="text-xs text-neutral-500 mb-1">Personas Evaluated</p>
          <p className="text-3xl font-bold font-mono text-neutral-200">
            {personas.length}
          </p>
          <p className="text-xs text-neutral-500 mt-1">virtual audience members</p>
        </div>
      </div>

      {/* Score chart */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-5">
        <p className="text-sm font-medium text-neutral-300 mb-4">Score Progression</p>
        <ScoreChart scores={scores} />
      </div>

      {/* Best asset — prominent */}
      <div className="bg-neutral-800 border border-amber-500/30 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Best Optimized Asset</p>
            {bestIteration.iterationNumber !== lastIteration.iterationNumber && (
              <p className="text-xs text-neutral-500 mt-0.5">
                Iteration {bestIteration.iterationNumber} scored highest — used instead of the final version
              </p>
            )}
          </div>
          <span className="px-2 py-1 bg-amber-500 text-neutral-900 text-xs font-bold rounded">
            {bestIteration.averageScore.toFixed(1)} / 10
          </span>
        </div>
        <pre className="font-mono text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed">
          {bestIteration.assetText}
        </pre>
      </div>

      {/* Diagnostic for best iteration */}
      {bestIteration.diagnosticReport && (
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-5">
          <p className="text-sm font-medium text-neutral-300 mb-3">Diagnostic Report</p>
          <div className="text-sm text-neutral-400 whitespace-pre-wrap leading-relaxed">
            {bestIteration.diagnosticReport}
          </div>
        </div>
      )}

      {/* Audience summary */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-5">
        <p className="text-sm font-medium text-neutral-300 mb-4">Audience Summary</p>
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div>
            <p className="text-xs text-neutral-500 mb-2">Skepticism Distribution</p>
            {Object.entries(skepticismCounts).map(([level, count]) => (
              <div key={level} className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-neutral-400 w-12 capitalize">{level}</span>
                <div className="flex-1 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(count / personas.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-neutral-500 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-2">Motivation Distribution</p>
            {Object.entries(motivationCounts).map(([level, count]) => (
              <div key={level} className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-neutral-400 w-12 capitalize">{level}</span>
                <div className="flex-1 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(count / personas.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-neutral-500 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-2">Sample Personas</p>
            <div className="space-y-1.5">
              {personas.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-neutral-400">{p.name.charAt(0)}</span>
                  </div>
                  <span className="text-xs text-neutral-400 truncate">{p.name}, {p.age} · {p.occupation}</span>
                </div>
              ))}
              {personas.length > 5 && (
                <p className="text-xs text-neutral-600">+{personas.length - 5} more</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Iteration history */}
      <div>
        <p className="text-sm font-medium text-neutral-300 mb-3">Iteration History</p>
        <div className="space-y-3">
          {iterations.map((iter, i) => (
            <IterationCard
              key={iter.iterationNumber}
              iteration={iter}
              isFirst={i === 0}
              isFinal={i === iterations.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
