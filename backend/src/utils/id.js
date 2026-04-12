export function makeId(prefix) {
  const rand = Math.random().toString(16).slice(2, 10);
  return `${prefix}_${Date.now().toString(16)}_${rand}`;
}
