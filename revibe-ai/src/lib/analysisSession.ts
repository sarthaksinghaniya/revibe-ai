import type { AnalyzeResponse } from "@/lib/api";

const ANALYSIS_SESSION_KEY = "revibe.latestAnalysis";

export type StoredAnalysis = {
  itemName: string;
  result: AnalyzeResponse["data"];
  createdAt: string;
};

export function saveLatestAnalysis(payload: StoredAnalysis): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ANALYSIS_SESSION_KEY, JSON.stringify(payload));
}

export function readLatestAnalysis(): StoredAnalysis | null {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(ANALYSIS_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredAnalysis;
  } catch {
    return null;
  }
}
