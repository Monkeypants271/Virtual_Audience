"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  Phase,
  ChatMessage,
  CampaignBrief,
  ICP,
  Persona,
  Iteration,
  PersonaScore,
  ScoreAggregation,
  OptimizationState,
  AssetImage,
} from "@/lib/types";

import PhaseIndicator from "@/components/PhaseIndicator";
import ChatInterface from "@/components/ChatInterface";
import AssetInput from "@/components/AssetInput";
import OptimizationProgress from "@/components/OptimizationProgress";
import ResultsDisplay from "@/components/ResultsDisplay";

const MAX_ITERATIONS = 8;
const TARGET_SCORE = 8.0;

type BriefSubPhase = "landing" | "chat" | "review";
type AudienceSubPhase = "choice" | "chat" | "generating" | "review" | "asset";

function extractTopItems(reasons: string[], count = 5): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const r of reasons) {
    const key = r.toLowerCase().slice(0, 40);
    if (!seen.has(key) && result.length < count) {
      seen.add(key);
      result.push(r);
    }
  }
  return result;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Small reusable UI bits ───────────────────────────────────────────────────

function BriefSummaryCard({ brief }: { brief: CampaignBrief }) {
  const rows: [string, string][] = [
    ["Asset Type", brief.assetType],
    ["Objective", brief.objective],
    ["Call to Action", brief.callToAction],
    ["Product", brief.product],
    ["Unique Value", brief.uniqueValue],
    ["Tone", brief.tone],
    ["Success", brief.successDefinition],
  ];
  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-5 space-y-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex gap-3">
          <span className="text-xs text-neutral-500 w-28 flex-shrink-0 pt-0.5">{label}</span>
          <span className="text-sm text-neutral-200">{value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Home() {
  const [phase, setPhase] = useState<Phase>("brief");
  const [briefSubPhase, setBriefSubPhase] = useState<BriefSubPhase>("landing");
  const [audienceSubPhase, setAudienceSubPhase] = useState<AudienceSubPhase>("choice");

  // Brief
  const [briefMessages, setBriefMessages] = useState<ChatMessage[]>([]);
  const [briefLoading, setBriefLoading] = useState(false);
  const [brief, setBrief] = useState<CampaignBrief | null>(null);
  const [briefChatComplete, setBriefChatComplete] = useState(false);
  const [savedBriefNames, setSavedBriefNames] = useState<string[]>([]);
  const [briefSaveName, setBriefSaveName] = useState("");
  const [briefSaving, setBriefSaving] = useState(false);
  const [briefSaved, setBriefSaved] = useState(false);

  // Audience
  const [audienceMessages, setAudienceMessages] = useState<ChatMessage[]>([]);
  const [audienceLoading, setAudienceLoading] = useState(false);
  const [icp, setIcp] = useState<ICP | null>(null);
  const [audienceChatComplete, setAudienceChatComplete] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [generatingPersonas, setGeneratingPersonas] = useState(false);
  const [savedAudienceNames, setSavedAudienceNames] = useState<string[]>([]);
  const [audienceSaveName, setAudienceSaveName] = useState("");
  const [audienceSaving, setAudienceSaving] = useState(false);
  const [audienceSaved, setAudienceSaved] = useState(false);

  // Asset
  const [assetImages, setAssetImages] = useState<AssetImage[]>([]);

  // Optimization
  const [optState, setOptState] = useState<OptimizationState>({
    currentIteration: 1,
    currentPersonaIndex: 0,
    totalPersonas: 30,
    phase: "scoring",
    runningScore: 0,
    completedPersonas: 0,
  });
  const [iterations, setIterations] = useState<Iteration[]>([]);
  const [optimizationError, setOptimizationError] = useState<string | null>(null);

  // ─── Load saved names on landing ────────────────────────────────────────────

  useEffect(() => {
    fetch("/api/saved-briefs")
      .then((r) => r.json())
      .then((d) => setSavedBriefNames(d.names ?? []))
      .catch(() => {});
  }, []);

  const loadSavedAudienceNames = useCallback(() => {
    fetch("/api/saved-audiences")
      .then((r) => r.json())
      .then((d) => setSavedAudienceNames(d.names ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (phase === "audience") loadSavedAudienceNames();
  }, [phase, loadSavedAudienceNames]);

  // ─── Brief Agent ─────────────────────────────────────────────────────────────

  const startBriefAgent = useCallback(async () => {
    setBriefSubPhase("chat");
    setBriefLoading(true);
    const init: ChatMessage = { role: "user", content: "Start" };
    const res = await fetch("/api/brief-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [init] }),
    });
    const data = await res.json();
    setBriefMessages([{ role: "assistant", content: data.reply }]);
    setBriefLoading(false);
  }, []);

  const sendBriefMessage = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = { role: "user", content: text };
      const updated = [...briefMessages, userMsg];
      setBriefMessages(updated);
      setBriefLoading(true);
      const res = await fetch("/api/brief-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      setBriefMessages([...updated, { role: "assistant", content: data.reply }]);
      if (data.complete && data.brief) {
        setBrief(data.brief);
        setBriefChatComplete(true);
        setBriefSaveName(data.brief.product || "");
      }
      setBriefLoading(false);
    },
    [briefMessages]
  );

  const loadSavedBrief = useCallback(async (name: string) => {
    const res = await fetch(`/api/saved-briefs/${encodeURIComponent(name)}`);
    const data = await res.json();
    if (data.brief) {
      setBrief(data.brief);
      setBriefSaveName(name);
      setBriefSubPhase("review");
    }
  }, []);

  const saveBrief = useCallback(async () => {
    if (!brief || !briefSaveName.trim()) return;
    setBriefSaving(true);
    await fetch("/api/saved-briefs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: briefSaveName.trim(), brief }),
    });
    setBriefSaving(false);
    setBriefSaved(true);
    setSavedBriefNames((prev) =>
      prev.includes(briefSaveName.trim()) ? prev : [...prev, briefSaveName.trim()]
    );
  }, [brief, briefSaveName]);

  const acceptBrief = useCallback(() => {
    setBriefSubPhase("review");
  }, []);

  const proceedToAudience = useCallback(async () => {
    if (!brief) return;
    setPhase("audience");
    setAudienceSubPhase("choice");
  }, [brief]);

  // ─── Audience Agent ──────────────────────────────────────────────────────────

  const startAudienceAgent = useCallback(async () => {
    if (!brief) return;
    setAudienceSubPhase("chat");
    setAudienceLoading(true);
    const init: ChatMessage = { role: "user", content: "Start" };
    const res = await fetch("/api/audience-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [init], brief }),
    });
    const data = await res.json();
    setAudienceMessages([{ role: "assistant", content: data.reply }]);
    setAudienceLoading(false);
  }, [brief]);

  const sendAudienceMessage = useCallback(
    async (text: string) => {
      if (!brief) return;
      const userMsg: ChatMessage = { role: "user", content: text };
      const updated = [...audienceMessages, userMsg];
      setAudienceMessages(updated);
      setAudienceLoading(true);
      const res = await fetch("/api/audience-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, brief }),
      });
      const data = await res.json();
      setAudienceMessages([...updated, { role: "assistant", content: data.reply }]);
      if (data.complete && data.icp) {
        setIcp(data.icp);
        setAudienceChatComplete(true);
        setAudienceSaveName(brief.product ? `${brief.product} Audience` : "");
      }
      setAudienceLoading(false);
    },
    [audienceMessages, brief]
  );

  const generatePersonas = useCallback(async (icpData: ICP) => {
    if (!brief) return;
    setAudienceSubPhase("generating");
    setGeneratingPersonas(true);
    const res = await fetch("/api/generate-personas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ icp: icpData, brief }),
    });
    const data = await res.json();
    setPersonas(data.personas);
    setGeneratingPersonas(false);
    setAudienceSubPhase("review");
  }, [brief]);

  const loadSavedAudience = useCallback(async (name: string) => {
    const res = await fetch(`/api/saved-audiences/${encodeURIComponent(name)}`);
    const data = await res.json();
    if (data.icp && data.personas) {
      setIcp(data.icp);
      setPersonas(data.personas);
      setAudienceSaveName(name);
      setAudienceSubPhase("asset");
    }
  }, []);

  const saveAudience = useCallback(async () => {
    if (!icp || personas.length === 0 || !audienceSaveName.trim()) return;
    setAudienceSaving(true);
    await fetch("/api/saved-audiences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: audienceSaveName.trim(), icp, personas }),
    });
    setAudienceSaving(false);
    setAudienceSaved(true);
    setSavedAudienceNames((prev) =>
      prev.includes(audienceSaveName.trim()) ? prev : [...prev, audienceSaveName.trim()]
    );
  }, [icp, personas, audienceSaveName]);

  // ─── Optimization Loop ───────────────────────────────────────────────────────

  const runOptimizationLoop = useCallback(
    async (initialAsset: string, images: AssetImage[]) => {
      if (!brief || personas.length === 0) return;

      setPhase("optimizing");
      setIterations([]);
      let currentAsset = initialAsset;
      let bestAsset = initialAsset;
      let bestScore = -Infinity;
      const allIterations: Iteration[] = [];

      // Shuffle personas to avoid systematic bias in running average
      const shuffledPersonas = shuffle(personas);

      for (let iterNum = 1; iterNum <= MAX_ITERATIONS; iterNum++) {
        setOptState((s) => ({
          ...s,
          currentIteration: iterNum,
          phase: "scoring",
          completedPersonas: 0,
          runningScore: 0,
        }));

        // ── Score all personas in parallel ──
        let completedCount = 0;
        let runningTotal = 0;

        const scorePromises = shuffledPersonas.map(async (persona) => {
          const res = await fetch("/api/score-persona", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ persona, brief, assetText: currentAsset, images }),
          });
          const data = await res.json();
          completedCount++;
          runningTotal += data.score;
          setOptState((s) => ({
            ...s,
            completedPersonas: completedCount,
            runningScore: runningTotal / completedCount,
          }));
          return { personaId: persona.id, score: data.score, reason: data.reason } as PersonaScore;
        });

        const personaScores = await Promise.all(scorePromises);

        // ── Aggregate ──
        setOptState((s) => ({ ...s, phase: "aggregating" }));
        const total = personaScores.reduce((sum, ps) => sum + ps.score, 0);
        const avg = total / personaScores.length;

        const lowReasons = personaScores.filter((ps) => ps.score <= 3).map((ps) => ps.reason);
        const highReasons = personaScores.filter((ps) => ps.score >= 7).map((ps) => ps.reason);

        const aggregation: ScoreAggregation = {
          averageScore: avg,
          scoreDistribution: {
            low: personaScores.filter((ps) => ps.score <= 3).length,
            mid: personaScores.filter((ps) => ps.score >= 4 && ps.score <= 6).length,
            high: personaScores.filter((ps) => ps.score >= 7).length,
          },
          topObjections: extractTopItems(lowReasons),
          topPositives: extractTopItems(highReasons),
        };

        // Update running score to actual final average
        setOptState((s) => ({ ...s, runningScore: avg }));

        // Track the best-scoring version so we always refine from a strong base
        if (avg > bestScore) {
          bestScore = avg;
          bestAsset = currentAsset;
        }

        // ── Diagnostics ──
        setOptState((s) => ({ ...s, phase: "diagnosing" }));
        const diagRes = await fetch("/api/diagnostics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assetText: currentAsset,
            brief,
            personaScores,
            personas: shuffledPersonas,
            aggregation,
            iterationNumber: iterNum,
            images,
          }),
        });
        const diagData = await diagRes.json();
        const diagnosticReport: string = diagData.report;

        const iteration: Iteration = {
          iterationNumber: iterNum,
          assetText: currentAsset,
          averageScore: avg,
          scoreDistribution: aggregation.scoreDistribution,
          topObjections: aggregation.topObjections,
          topPositives: aggregation.topPositives,
          diagnosticReport,
          personaScores,
        };
        allIterations.push(iteration);
        setIterations([...allIterations]);

        // ── Stop conditions ──
        if (avg >= TARGET_SCORE || iterNum === MAX_ITERATIONS) {
          setOptState((s) => ({ ...s, phase: "done" }));
          setPhase("results");
          return;
        }

        // ── Refine from best-scoring version (not necessarily the last one) ──
        setOptState((s) => ({ ...s, phase: "refining" }));
        const refineRes = await fetch("/api/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assetText: bestAsset, brief, diagnosticReport, previousScore: bestScore }),
        });
        const refineData = await refineRes.json();
        currentAsset = refineData.refinedAsset;
      }
    },
    [brief, personas]
  );

  const handleAssetSubmit = useCallback(
    async (text: string, images: AssetImage[]) => {
      setAssetImages(images);
      await runOptimizationLoop(text, images);
    },
    [runOptimizationLoop]
  );

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-neutral-900 font-black text-sm">VA</span>
          </div>
          <span className="font-semibold text-neutral-100 text-sm tracking-tight">VirtualAudience</span>
          <span className="text-neutral-600 text-xs hidden sm:block">AI Marketing Optimizer</span>
        </div>
        <PhaseIndicator currentPhase={phase} />
      </header>

      <main className="flex-1 flex flex-col items-center justify-start px-4 py-10 max-w-3xl mx-auto w-full">

        {/* ═══════════════════════════════════════════════════════════════ BRIEF */}
        {phase === "brief" && (
          <div className="w-full animate-fade-in">

            {/* ── Landing ── */}
            {briefSubPhase === "landing" && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-neutral-100 mb-3">Optimize any marketing asset</h1>
                <p className="text-neutral-400 text-sm max-w-md mx-auto mb-10 leading-relaxed">
                  A virtual audience of 30 personas will score your asset, identify what&apos;s working
                  and what isn&apos;t, then iteratively refine it — before you spend a dollar on real ads.
                </p>

                <div className="flex flex-col items-center gap-6 w-full max-w-sm">
                  <button
                    onClick={startBriefAgent}
                    className="w-full px-8 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-semibold rounded-xl transition-colors text-sm"
                  >
                    Start New Campaign Brief →
                  </button>

                  {/* Load existing — always visible */}
                  <div className="w-full">
                    <p className="text-xs text-neutral-500 mb-2 text-center">— or open an existing Campaign Brief —</p>
                    {savedBriefNames.length > 0 ? (
                      <div className="space-y-2">
                        {savedBriefNames.map((name) => (
                          <button
                            key={name}
                            onClick={() => loadSavedBrief(name)}
                            className="w-full px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 text-sm rounded-lg transition-colors text-left flex items-center justify-between"
                          >
                            <span>{name}</span>
                            <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-600 text-center">
                        No saved briefs yet. After creating one, use the <span className="text-neutral-500">Save Brief</span> option to store it.
                      </p>
                    )}
                    <p className="text-xs text-neutral-700 mt-2 text-center font-mono">
                      saved-briefs/ → VirtualAudience-app/saved-briefs/
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Chat ── */}
            {briefSubPhase === "chat" && (
              <div className="flex flex-col h-[620px]">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-neutral-100">Campaign Brief</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">Tell us about your marketing asset</p>
                </div>
                <div className="flex-1 min-h-0">
                  <ChatInterface
                    messages={briefMessages}
                    onSend={sendBriefMessage}
                    isLoading={briefLoading}
                    disabled={briefChatComplete}
                  />
                </div>
                {briefChatComplete && brief && (
                  <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl animate-slide-up">
                    <p className="text-xs text-amber-400 font-semibold mb-2">Brief captured</p>
                    <p className="text-sm text-neutral-300 mb-3">Review your brief summary, or keep editing to add detail.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={acceptBrief}
                        className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-semibold text-sm rounded-lg transition-colors"
                      >
                        Review Brief →
                      </button>
                      <button
                        onClick={() => { setBriefChatComplete(false); }}
                        className="px-5 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 text-sm rounded-lg transition-colors"
                      >
                        Keep editing
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Review ── */}
            {briefSubPhase === "review" && brief && (
              <div className="space-y-6 animate-slide-up">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-100 mb-1">Review Your Campaign Brief</h2>
                  <p className="text-xs text-neutral-500">Confirm these details are correct before building your audience.</p>
                </div>

                <BriefSummaryCard brief={brief} />

                {/* Save brief — prominent */}
                <div className="p-4 bg-neutral-800 border border-neutral-700 rounded-xl">
                  <p className="text-xs text-neutral-400 font-medium mb-3">
                    Save this brief for later use
                    <span className="text-neutral-600 font-normal ml-1">(recommended — reuse it without going through setup again)</span>
                  </p>
                  <div className="flex gap-2 items-center">
                    <input
                      value={briefSaveName}
                      onChange={(e) => { setBriefSaveName(e.target.value); setBriefSaved(false); }}
                      placeholder="Give this brief a name..."
                      className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/50"
                    />
                    <button
                      onClick={saveBrief}
                      disabled={!briefSaveName.trim() || briefSaving}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
                        briefSaved
                          ? "bg-green-500/20 border border-green-500/30 text-green-400"
                          : "bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-400 disabled:opacity-40"
                      }`}
                    >
                      {briefSaving ? "Saving..." : briefSaved ? "Saved ✓" : "Save Brief"}
                    </button>
                  </div>
                  {briefSaved && (
                    <p className="text-xs text-neutral-600 mt-2 font-mono">
                      Saved to: VirtualAudience-app/saved-briefs/{briefSaveName}.json
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={proceedToAudience}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-semibold text-sm rounded-lg transition-colors"
                  >
                    Accept & Build Audience →
                  </button>
                  {briefSubPhase === "review" && briefMessages.length > 0 && (
                    <button
                      onClick={() => { setBriefChatComplete(false); setBriefSubPhase("chat"); }}
                      className="px-5 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 text-sm rounded-lg transition-colors"
                    >
                      ← Edit Brief
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ AUDIENCE */}
        {phase === "audience" && (
          <div className="w-full animate-fade-in">

            {/* ── Choice ── */}
            {audienceSubPhase === "choice" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-100 mb-1">Virtual Audience</h2>
                  <p className="text-xs text-neutral-500">
                    Build a new ICP-based audience, or load one you&apos;ve saved before.
                  </p>
                </div>

                <div className="grid gap-3">
                  <button
                    onClick={startAudienceAgent}
                    className="w-full p-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-left transition-colors"
                  >
                    <p className="text-sm font-semibold text-amber-400 mb-0.5">Build New Audience</p>
                    <p className="text-xs text-neutral-500">
                      Answer a few questions about your ideal customer. We&apos;ll generate 30 distinct personas.
                    </p>
                  </button>
                </div>

                {savedAudienceNames.length > 0 && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-2">— or load a saved audience —</p>
                    <div className="space-y-2">
                      {savedAudienceNames.map((name) => (
                        <button
                          key={name}
                          onClick={() => loadSavedAudience(name)}
                          className="w-full px-4 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 text-sm rounded-lg transition-colors text-left flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium">{name}</p>
                            <p className="text-xs text-neutral-500">Saved audience · 30 personas</p>
                          </div>
                          <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-neutral-600 mt-2">
                      Save audience files to <code className="text-neutral-500">saved-audiences/</code> in the project root.
                      Format: <code className="text-neutral-500">{"{ name, icp, personas }"}</code>
                    </p>
                  </div>
                )}

                {savedAudienceNames.length === 0 && (
                  <p className="text-xs text-neutral-600">
                    No saved audiences yet. After building one you can save it for reuse.
                    You can also manually create audience files in{" "}
                    <code className="text-neutral-500">saved-audiences/</code>.
                  </p>
                )}
              </div>
            )}

            {/* ── Chat ── */}
            {audienceSubPhase === "chat" && (
              <div className="flex flex-col h-[640px]">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-neutral-100">Audience Builder</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">Define your ideal customer — we&apos;ll generate 30 personas from it</p>
                </div>
                <div className="flex-1 min-h-0">
                  <ChatInterface
                    messages={audienceMessages}
                    onSend={sendAudienceMessage}
                    isLoading={audienceLoading}
                    disabled={audienceChatComplete}
                  />
                </div>
                {audienceChatComplete && icp && personas.length === 0 && !generatingPersonas && (
                  <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl animate-slide-up">
                    <p className="text-xs text-amber-400 font-semibold mb-2">ICP captured</p>
                    <p className="text-sm text-neutral-300 mb-3">Ready to generate your 30 virtual personas?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => generatePersonas(icp)}
                        className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-semibold text-sm rounded-lg transition-colors"
                      >
                        Generate 30 Personas →
                      </button>
                      <button
                        onClick={() => setAudienceChatComplete(false)}
                        className="px-5 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 text-sm rounded-lg transition-colors"
                      >
                        Keep editing
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Generating ── */}
            {audienceSubPhase === "generating" && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-neutral-400">Generating 30 virtual personas...</p>
              </div>
            )}

            {/* ── Review (after generation) ── */}
            {audienceSubPhase === "review" && personas.length > 0 && icp && (
              <div className="space-y-6 animate-slide-up">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-100 mb-1">Your Virtual Audience</h2>
                  <p className="text-xs text-neutral-500">{personas.length} personas generated · ready to evaluate your asset</p>
                </div>

                {/* ICP summary */}
                <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-5">
                  <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-3">ICP Profile</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {[
                      ["Age", icp.ageRange],
                      ["Context", icp.professionalContext],
                      ["Problems", icp.problemsFrustrations],
                      ["Motivators", icp.motivators],
                      ["Objections", icp.objections],
                      ["Familiarity", icp.categoryFamiliarity],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <span className="text-xs text-neutral-500">{label}</span>
                        <p className="text-sm text-neutral-300 mt-0.5 line-clamp-2">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Persona distribution */}
                <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-5">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">Audience Distribution</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {(["low", "medium", "high"] as const).map((level) => (
                      <div key={level}>
                        <p className="text-2xl font-bold font-mono text-neutral-200">
                          {personas.filter((p) => p.skepticismLevel === level).length}
                        </p>
                        <p className="text-xs text-neutral-500 capitalize">{level} skepticism</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-neutral-700 grid grid-cols-3 gap-4 text-center">
                    {(["low", "medium", "high"] as const).map((level) => (
                      <div key={level}>
                        <p className="text-2xl font-bold font-mono text-neutral-200">
                          {personas.filter((p) => p.motivationLevel === level).length}
                        </p>
                        <p className="text-xs text-neutral-500 capitalize">{level} motivation</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-neutral-700">
                    <p className="text-xs text-neutral-500 mb-2">Sample personas</p>
                    <div className="flex flex-wrap gap-2">
                      {personas.slice(0, 6).map((p) => (
                        <span key={p.id} className="px-2 py-1 bg-neutral-700 text-neutral-300 text-xs rounded-lg">
                          {p.name}, {p.age}
                        </span>
                      ))}
                      <span className="px-2 py-1 text-neutral-600 text-xs">+{personas.length - 6} more</span>
                    </div>
                  </div>
                </div>

                {/* Save audience */}
                <div className="flex gap-2 items-center">
                  <input
                    value={audienceSaveName}
                    onChange={(e) => { setAudienceSaveName(e.target.value); setAudienceSaved(false); }}
                    placeholder="Save audience as..."
                    className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/50"
                  />
                  <button
                    onClick={saveAudience}
                    disabled={!audienceSaveName.trim() || audienceSaving}
                    className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-40 text-neutral-300 text-sm rounded-lg transition-colors whitespace-nowrap"
                  >
                    {audienceSaving ? "Saving..." : audienceSaved ? "Saved ✓" : "Save Audience"}
                  </button>
                </div>

                <button
                  onClick={() => setAudienceSubPhase("asset")}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-semibold text-sm rounded-xl transition-colors"
                >
                  Accept & Paste Your Asset →
                </button>
              </div>
            )}

            {/* ── Asset input ── */}
            {audienceSubPhase === "asset" && (
              <AssetInput brief={brief!} onSubmit={handleAssetSubmit} />
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════ OPTIMIZING */}
        {phase === "optimizing" && (
          <div className="w-full max-w-xl mx-auto animate-fade-in">
            <OptimizationProgress state={optState} completedIterations={iterations} maxIterations={MAX_ITERATIONS} targetScore={TARGET_SCORE} />
            {optimizationError && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-sm text-red-400">{optimizationError}</p>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ RESULTS */}
        {phase === "results" && (
          <div className="w-full animate-fade-in">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-neutral-100 mb-1">Optimization Complete</h2>
              <p className="text-sm text-neutral-400">
                {iterations.length} iteration{iterations.length !== 1 ? "s" : ""} completed ·{" "}
                {Math.max(...iterations.map((it) => it.averageScore)) >= TARGET_SCORE
                  ? "Target score reached"
                  : "Maximum iterations reached"}
              </p>
            </div>
            <ResultsDisplay iterations={iterations} personas={personas} brief={brief!} />
          </div>
        )}

      </main>
    </div>
  );
}
