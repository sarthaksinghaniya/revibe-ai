import fs from "node:fs/promises";
import path from "node:path";

async function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

export async function readJsonFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (err && err.code === "ENOENT") return [];
    throw err;
  }
}

export async function writeJsonFile(filePath, value) {
  await ensureDir(filePath);
  const tmp = `${filePath}.tmp`;
  const json = JSON.stringify(value, null, 2);
  await fs.writeFile(tmp, `${json}\n`, "utf8");
  await fs.rename(tmp, filePath);
}
