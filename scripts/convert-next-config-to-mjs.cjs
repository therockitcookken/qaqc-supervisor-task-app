/**
 * Convert next.config.ts -> next.config.mjs for Vercel compatibility.
 * Assumptions:
 * - next.config.ts exports default object or `nextConfig`.
 * - File contains no TS-only syntax except type annotations.
 */

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const tsPath = path.join(root, "next.config.ts");
const mjsPath = path.join(root, "next.config.mjs");

if (!fs.existsSync(tsPath)) {
  console.error("[ERR] next.config.ts not found");
  process.exit(1);
}

let src = fs.readFileSync(tsPath, "utf8");

// Remove simple TS type annotations patterns that may appear
src = src
  .replace(/:\s*import\(["'][^"']+["']\)\.[A-Za-z0-9_]+/g, "") // : import("next").NextConfig
  .replace(/:\s*[A-Za-z0-9_.<>\[\]\|& ]+/g, (m) => {
    // VERY conservative: only strip if it looks like a config type annotation on const nextConfig
    return m.includes("NextConfig") ? "" : m;
  });

// Replace `export default` to ESM export default remains same for .mjs
// Ensure we have a JSDoc type for NextConfig
if (!src.includes("@type {import(\"next\").NextConfig}")) {
  src = `/** @type {import("next").NextConfig} */\n` + src;
}

// Write .mjs
fs.writeFileSync(mjsPath, src, "utf8");
console.log("[OK] Created next.config.mjs");

// Optionally keep ts file but Vercel will still pick .mjs;
// safest is to remove/rename ts file to avoid confusion.
const bak = tsPath + `.bak.${Date.now()}`;
fs.copyFileSync(tsPath, bak);
fs.unlinkSync(tsPath);
console.log("[OK] Renamed next.config.ts -> backup:", bak);
