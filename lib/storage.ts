import type { CampaignBrief, ICP, Persona } from "./types";

const BRIEFS_KEY = "va_saved_briefs";
const AUDIENCES_KEY = "va_saved_audiences";

// ─── Briefs ───────────────────────────────────────────────────────────────────

export function listSavedBriefs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(BRIEFS_KEY);
    return data ? Object.keys(JSON.parse(data)) : [];
  } catch { return []; }
}

export function saveBrief(name: string, brief: CampaignBrief): void {
  if (typeof window === "undefined") return;
  try {
    const data = JSON.parse(localStorage.getItem(BRIEFS_KEY) || "{}");
    data[name] = brief;
    localStorage.setItem(BRIEFS_KEY, JSON.stringify(data));
  } catch { /* storage full or unavailable */ }
}

export function loadBrief(name: string): CampaignBrief | null {
  if (typeof window === "undefined") return null;
  try {
    const data = JSON.parse(localStorage.getItem(BRIEFS_KEY) || "{}");
    return data[name] ?? null;
  } catch { return null; }
}

// ─── Audiences ────────────────────────────────────────────────────────────────

export function listSavedAudiences(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(AUDIENCES_KEY);
    return data ? Object.keys(JSON.parse(data)) : [];
  } catch { return []; }
}

export function saveAudience(name: string, icp: ICP, personas: Persona[]): void {
  if (typeof window === "undefined") return;
  try {
    const data = JSON.parse(localStorage.getItem(AUDIENCES_KEY) || "{}");
    data[name] = { icp, personas };
    localStorage.setItem(AUDIENCES_KEY, JSON.stringify(data));
  } catch { /* storage full or unavailable */ }
}

export function loadAudience(name: string): { icp: ICP; personas: Persona[] } | null {
  if (typeof window === "undefined") return null;
  try {
    const data = JSON.parse(localStorage.getItem(AUDIENCES_KEY) || "{}");
    return data[name] ?? null;
  } catch { return null; }
}
