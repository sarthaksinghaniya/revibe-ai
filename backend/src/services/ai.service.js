import Groq from "groq-sdk";

import { env } from "../config/env.js";

let groqClient = null;
const MAX_IDEAS = 4;
const MAX_STEPS = 6;
const MIN_IDEAS = 2;
const MIN_STEPS = 3;
const VAGUE_PATTERNS = [
  /do your own research/i,
  /consult (an )?expert/i,
  /it depends/i,
  /as needed/i,
  /etc\./i,
  /follow local laws/i,
  /be careful/i,
];

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
  const description = String(
    idea?.description ?? "A simple reuse path based on available components."
  ).trim();

  const normalizedDescription =
    description.length >= 30
      ? description
      : "Reuse existing parts with minimal cost, basic tools, and clear safety checks.";

  return {
    id: String(idea?.id ?? `idea-${index + 1}`),
    title: String(idea?.title ?? `Reuse idea ${index + 1}`).trim(),
    difficulty: normalizeDifficulty(idea?.difficulty),
    estimatedCost: String(idea?.estimatedCost ?? "Low"),
    description: normalizedDescription,
  };
}

function isVague(text) {
  const value = String(text ?? "").trim();
  if (!value) return true;
  return VAGUE_PATTERNS.some((pattern) => pattern.test(value));
}

function mergeFallbackIdeas(ideas, fallbackIdeas) {
  const next = [...ideas];
  for (const fallback of fallbackIdeas) {
    if (next.length >= MIN_IDEAS) break;
    next.push(sanitizeIdea(fallback, next.length));
  }
  return next;
}

function mergeFallbackSteps(steps, fallbackSteps) {
  const next = [...steps];
  for (const fallback of fallbackSteps) {
    if (next.length >= MIN_STEPS) break;
    const text = String(fallback ?? "").trim();
    if (text && !isVague(text)) next.push(text);
  }
  return next;
}

function sanitizeAnalysisPayload(raw, fallback) {
  const fallbackIdeas = Array.isArray(fallback?.ideas) ? fallback.ideas : [];
  const fallbackSteps = Array.isArray(fallback?.steps) ? fallback.steps : [];

  const ideasRaw = Array.isArray(raw?.ideas) ? raw.ideas : fallbackIdeas;
  const stepsRaw = Array.isArray(raw?.steps) ? raw.steps : fallbackSteps;

  let ideas = ideasRaw
    .slice(0, MAX_IDEAS)
    .map((idea, index) => sanitizeIdea(idea, index))
    .filter((idea) => !isVague(idea.title) && !isVague(idea.description));

  let steps = stepsRaw
    .slice(0, MAX_STEPS)
    .map((step) => String(step ?? "").trim())
    .filter((step) => step.length >= 15 && !isVague(step));

  ideas = mergeFallbackIdeas(ideas, fallbackIdeas);
  steps = mergeFallbackSteps(steps, fallbackSteps);

  if (ideas.length === 0) {
    ideas = fallbackIdeas.slice(0, MIN_IDEAS).map((idea, index) => sanitizeIdea(idea, index));
  }

  if (steps.length === 0) {
    steps = fallbackSteps
      .slice(0, MIN_STEPS)
      .map((step) => String(step ?? "").trim())
      .filter(Boolean);
  }

  return {
    material: String(raw?.material ?? fallback?.material ?? "Electronic components (mixed)"),
    confidence: clamp(raw?.confidence ?? fallback?.confidence ?? 80, 40, 99),
    risk: normalizeRisk(raw?.risk, fallback?.risk),
    sustainabilityScore: clamp(
      raw?.sustainabilityScore ?? fallback?.sustainabilityScore ?? 76,
      0,
      100
    ),
    ideas,
    steps,
  };
}

export async function generateAnalysisFromGroq({ itemName, notes, fallback }) {
  const client = getGroqClient();

  const systemPrompt = [
    "You are Revibe AI, an assistant for practical e-waste upcycling.",
    "You must prioritize beginner-safe, low-cost, realistic reuse ideas.",
    "Avoid vague advice, legal disclaimers, or generic sustainability slogans.",
    "Always include concrete safety-aware steps for handling electronics and batteries.",
    "Return JSON only. Do not include markdown or extra text.",
  ].join(" ");

  const userPrompt = [
    "Generate analysis JSON for this item.",
    "Context rules:",
    "- Focus on reuse/upcycling, not recycling-center redirection.",
    "- Suggestions should be doable at home with basic tools and low cost.",
    "- Keep ideas practical and specific to the item/material.",
    "- Include at least one explicit safety action in steps.",
    "- Do not use generic phrases like 'do research', 'consult expert', or 'it depends'.",
    "Return ONLY valid JSON with this exact structure and key names:",
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
    "Quality constraints:",
    "- ideas: 2 to 4 items, concise but concrete",
    "- steps: 3 to 6 short, actionable steps",
    `Item: ${itemName}`,
    `Notes: ${notes || "None"}`,
  ].join("\n");

  const completion = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  const content = completion.choices?.[0]?.message?.content ?? "";
  const parsed = parseJsonFromModel(content);
  return sanitizeAnalysisPayload(parsed, fallback);
}
