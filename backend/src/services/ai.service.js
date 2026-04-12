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
