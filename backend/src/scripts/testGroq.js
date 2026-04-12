import { sendBasicPromptToGroq } from "../services/ai.service.js";

async function main() {
  const result = await sendBasicPromptToGroq();
  // eslint-disable-next-line no-console
  console.log("[groq-test] model:", result.model);
  // eslint-disable-next-line no-console
  console.log("[groq-test] content:", result.content);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("[groq-test] failed:", error.message);
  process.exit(1);
});
