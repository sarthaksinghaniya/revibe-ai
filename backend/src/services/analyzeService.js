import { readJsonFile } from "../utils/jsonStore.js";
import { paths } from "../utils/paths.js";
import { generateAnalysisFromGroq } from "./ai.service.js";

function normalize(text) {
  return String(text ?? "").toLowerCase();
}

let templatesCache = null;

async function getTemplates() {
  if (templatesCache) return templatesCache;
  const templates = await readJsonFile(paths.analysisTemplates());
  templatesCache = Array.isArray(templates) ? templates : [];
  return templatesCache;
}

export async function pickAnalysisTemplate({ itemName, notes }) {
  const templates = await getTemplates();
  const text = `${itemName} ${notes}`.trim();
  const key = normalize(text);

  const match =
    templates.find((t) => t.keywords.some((kw) => key.includes(kw))) ??
    templates.find((t) => t.id === "default");

  return {
    material: match?.material ?? "Electronic components (mixed)",
    confidence: match?.confidence ?? 80,
    risk: match?.risk ?? "Medium",
    sustainabilityScore: match?.sustainabilityScore ?? 76,
    ideas: match?.ideas ?? [],
    steps: match?.steps ?? [],
  };
}

export async function generateAnalysis({ itemName, notes }) {
  const fallback = await pickAnalysisTemplate({ itemName, notes });

  try {
    return await generateAnalysisFromGroq({
      itemName,
      notes,
      fallback,
    });
  } catch {
    return fallback;
  }
}
