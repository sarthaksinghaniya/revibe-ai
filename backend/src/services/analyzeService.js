import { readJsonFile } from "../utils/jsonStore.js";
import { paths } from "../utils/paths.js";
import { generateAnalysisFromGroq } from "./ai.service.js";
import { logInfo, logWarn } from "../utils/logger.js";

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

export async function generateAnalysis({ itemName, notes, requestId }) {
  const fallback = await pickAnalysisTemplate({ itemName, notes });

  try {
    logInfo("analyze.groq.call.started", {
      requestId,
      itemNameLength: String(itemName ?? "").trim().length,
      notesLength: String(notes ?? "").trim().length,
    });

    const generated = await generateAnalysisFromGroq({
      itemName,
      notes,
      fallback,
      requestId,
    });

    logInfo("analyze.groq.call.succeeded", {
      requestId,
      ideaCount: Array.isArray(generated.ideas) ? generated.ideas.length : 0,
      stepCount: Array.isArray(generated.steps) ? generated.steps.length : 0,
    });

    return generated;
  } catch (error) {
    logWarn("analyze.groq.call.failed_using_fallback", {
      requestId,
      reason: error?.message ?? "Unknown error",
    });
    return fallback;
  }
}
