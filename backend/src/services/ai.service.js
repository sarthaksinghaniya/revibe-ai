import Groq from "groq-sdk";

import { env } from "../config/env.js";

let groqClient = null;

function getGroqClient() {
  if (!env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY. Add it to backend/.env before using Groq.");
  }

  if (!groqClient) {
    groqClient = new Groq({
      apiKey: env.GROQ_API_KEY,
    });
  }

  return groqClient;
}

export async function sendBasicPromptToGroq(
  prompt = "Reply in one short line: Groq backend connection is working."
) {
  const client = getGroqClient();

  const completion = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.2,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return {
    model: completion.model,
    content: completion.choices?.[0]?.message?.content?.trim() ?? "",
  };
}

function clamp(value, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.max(min, Math.min(max, Math.round(num)));
}

function normalizeRisk(risk, fallbackRisk) {
  const raw = String(risk ?? fallbackRisk ?? "Medium").toLowerCase();
  if (raw === "low") return "Low";
  if (raw === "high") return "High";
  return "Medium";
}

function normalizeDifficulty(difficulty) {
  const raw = String(difficulty ?? "Medium").toLowerCase();
  if (raw === "easy") return "Easy";
  if (raw === "hard") return "Hard";
  return "Medium";
}

function parseJsonFromModel(text) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) throw new Error("Groq returned empty content.");

  try {
    return JSON.parse(trimmed);
  } catch {
    // Try fenced JSON: ```json ... ```
    const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
    if (fenced?.[1]) return JSON.parse(fenced[1]);

    // Try extracting the first JSON object block
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const maybeJson = trimmed.slice(firstBrace, lastBrace + 1);
      return JSON.parse(maybeJson);
    }

    throw new Error("Could not parse JSON from Groq response.");
  }
}

function sanitizeIdea(idea, index) {
  return {
    id: String(idea?.id ?? `idea-${index + 1}`),
    title: String(idea?.title ?? `Reuse Idea ${index + 1}`),
    difficulty: normalizeDifficulty(idea?.difficulty),
    estimatedCost: String(idea?.estimatedCost ?? "Low"),
    description: String(
      idea?.description ?? "A simple reuse path based on available components."
    ),
  };
}

function sanitizeAnalysisPayload(raw, fallback) {
  const fallbackIdeas = Array.isArray(fallback?.ideas) ? fallback.ideas : [];
  const fallbackSteps = Array.isArray(fallback?.steps) ? fallback.steps : [];

  const ideasRaw = Array.isArray(raw?.ideas) ? raw.ideas : fallbackIdeas;
  const stepsRaw = Array.isArray(raw?.steps) ? raw.steps : fallbackSteps;

  const ideas = ideasRaw.slice(0, 4).map((idea, index) => sanitizeIdea(idea, index));
  const steps = stepsRaw
    .slice(0, 6)
    .map((step) => String(step ?? "").trim())
    .filter(Boolean);

  return {
    material: String(raw?.material ?? fallback?.material ?? "Electronic components (mixed)"),
    confidence: clamp(raw?.confidence ?? fallback?.confidence ?? 80, 40, 99),
    risk: normalizeRisk(raw?.risk, fallback?.risk),
    sustainabilityScore: clamp(
      raw?.sustainabilityScore ?? fallback?.sustainabilityScore ?? 76,
      0,
      100
    ),
    ideas: ideas.length > 0 ? ideas : fallbackIdeas,
    steps: steps.length > 0 ? steps : fallbackSteps,
  };
}

export async function generateAnalysisFromGroq({ itemName, notes, fallback }) {
  const client = getGroqClient();

  const prompt = [
    "You are helping an e-waste reuse assistant.",
    "Return ONLY valid JSON with this exact structure:",
    "{",
    '  "material": "string",',
    '  "confidence": 0-100 integer,',
    '  "risk": "Low|Medium|High",',
    '  "sustainabilityScore": 0-100 integer,',
    '  "ideas": [',
    '    { "id": "idea-1", "title": "string", "difficulty": "Easy|Medium|Hard", "estimatedCost": "Low|Medium|High", "description": "string" }',
    "  ],",
    '  "steps": ["string"]',
    "}",
    "Use concise beginner-friendly recommendations.",
    `Item: ${itemName}`,
    `Notes: ${notes || "None"}`,
  ].join("\n");

  const completion = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.2,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = completion.choices?.[0]?.message?.content ?? "";
  const parsed = parseJsonFromModel(content);
  return sanitizeAnalysisPayload(parsed, fallback);
}
