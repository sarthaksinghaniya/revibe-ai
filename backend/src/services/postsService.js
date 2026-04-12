import { readJsonFile, writeJsonFile } from "../utils/jsonStore.js";
import { paths } from "../utils/paths.js";
import { makeId } from "../utils/id.js";

function initials(name) {
  const parts = String(name).trim().split(/\s+/).slice(0, 2);
  const letters = parts.map((p) => p[0]?.toUpperCase()).filter(Boolean);
  return (letters.join("") || "RV").slice(0, 2);
}

export async function listPosts() {
  const posts = await readJsonFile(paths.posts());
  return posts.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

export async function getPostById(id) {
  const posts = await readJsonFile(paths.posts());
  return posts.find((p) => p.id === id) ?? null;
}

export async function createPost({ userName, caption, imageSrc, progressPct }) {
  const posts = await readJsonFile(paths.posts());

  const createdAt = new Date().toISOString();
  const post = {
    id: makeId("post"),
    userName: userName.trim(),
    avatarInitials: initials(userName),
    imageSrc: imageSrc?.trim() || "/mock/ewaste-1.svg",
    caption: caption.trim(),
    likes: 0,
    comments: 0,
    progressPct: typeof progressPct === "number" ? Math.round(progressPct) : 0,
    createdAt,
  };

  posts.unshift(post);
  await writeJsonFile(paths.posts(), posts);

  return post;
}
