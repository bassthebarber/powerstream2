/**
 * PowerStream logo resolver — tries common extensions under /public/logos/{folder}/.
 *
 * @param {"tv"|"artists"|"modules"|string} type - Logical bucket (tv, artists, modules).
 * @param {string} slug - File base name (e.g. station slug).
 * @returns {string|null} First candidate URL (caller should still handle onError).
 */
export function getLogoFolder(type) {
  const t = String(type || "tv").toLowerCase();
  if (t === "artist" || t === "artists") return "artists";
  if (t === "module" || t === "modules") return "modules";
  return "tv";
}

export function getLogoUrls(type, slug) {
  const folder = getLogoFolder(type);
  const s = String(slug || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
  if (!s) return [];
  return ["png", "webp", "jpg", "jpeg"].map((ext) => `/logos/${folder}/${s}.${ext}`);
}

/**
 * Primary logo path for a type + slug (first extension guess).
 */
export function getLogo(type, slug) {
  const urls = getLogoUrls(type, slug);
  return urls[0] || null;
}

export default getLogo;
