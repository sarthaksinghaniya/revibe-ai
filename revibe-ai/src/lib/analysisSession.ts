import type { AnalyzeResponse } from "@/lib/api";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

const ANALYSIS_SESSION_KEY = "revibe.latestAnalysis";

export type StoredAnalysis = {
  itemName: string;
  result: AnalyzeResponse["data"];
  createdAt: string;
};

export function saveLatestAnalysis(payload: StoredAnalysis): void {
  saveToStorage(ANALYSIS_SESSION_KEY, payload);
}

export function readLatestAnalysis(): StoredAnalysis | null {
  return loadFromStorage<StoredAnalysis | null>(ANALYSIS_SESSION_KEY, null);
}
