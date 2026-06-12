# VirtualAudience App

A multi-agent AI marketing optimization tool. Takes a marketing asset,
runs it through 30 virtual personas, scores effectiveness, diagnoses
issues, refines the asset, and iterates until a target score is reached.

## Key Concepts
- Campaign Brief: structured context about the asset's purpose and goals
- ICP: Ideal Customer Persona — the seed profile for audience generation
- Virtual Personas: 30 variations generated from the ICP
- Optimization Loop: score → diagnose → refine → repeat (max 5 iterations, target score 8.5)

## Tech
- Next.js 14 App Router, TypeScript, Tailwind CSS
- Anthropic API: claude-sonnet-4-6
- All AI calls go through /app/api/ route handlers

## Rules
- Never hardcode the API key — always use process.env.ANTHROPIC_API_KEY
- All agent prompts live in lib/prompts.ts
- All TypeScript types live in lib/types.ts
- Persona scoring calls should run in parallel with Promise.all
- Store full iteration history in React state so results display works
