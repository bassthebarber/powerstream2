/**
 * Pre-build guard: required VITE_* vars must be set (merged like Vite: later files override).
 * Exits 1 if missing or placeholder — stops `npm run build`.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const MODE = process.env.VITE_BUILD_VALIDATE_MODE || "production";

function parseEnvFile(content) {
  const out = {};
  if (!content) return out;
  for (const line of content.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

function loadMergedFileEnv() {
  /** Vite priority: .env.[mode].local > .env.[mode] > .env.local > .env */
  const names = [
    ".env",
    ".env.local",
    `.env.${MODE}`,
    `.env.${MODE}.local`,
  ];
  const merged = {};
  for (const name of names) {
    const p = path.join(root, name);
    if (fs.existsSync(p)) {
      Object.assign(merged, parseEnvFile(fs.readFileSync(p, "utf8")));
    }
  }
  return merged;
}

const fileEnv = loadMergedFileEnv();
const url = (process.env.VITE_SUPABASE_URL || fileEnv.VITE_SUPABASE_URL || "").trim();
const key = (process.env.VITE_SUPABASE_ANON_KEY || fileEnv.VITE_SUPABASE_ANON_KEY || "").trim();

const errors = [];
if (!url) errors.push("VITE_SUPABASE_URL is missing (set in .env, .env.local, or process env)");
if (!key) errors.push("VITE_SUPABASE_ANON_KEY is missing (set in .env, .env.local, or process env)");
if (key === "PASTE_REAL_KEY_HERE") {
  errors.push(
    "VITE_SUPABASE_ANON_KEY is still placeholder PASTE_REAL_KEY_HERE — set your real anon key in .env or .env.local"
  );
}

if (errors.length) {
  console.error("\n[validate-env] Build aborted — fix Supabase env:\n");
  for (const e of errors) console.error("  •", e);
  console.error("\n");
  process.exit(1);
}

console.log("[validate-env] VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY present — OK");
