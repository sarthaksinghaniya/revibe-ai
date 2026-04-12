import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");

export const paths = {
  dataDir: () => dataDir,
  posts: () => path.join(dataDir, "posts.json"),
  analysisTemplates: () => path.join(dataDir, "analysisTemplates.json"),
};
