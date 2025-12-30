/**
 * Patch src/app/api/sync/route.ts:
 * Replace the failing line:
 *   (data ?? []).map((row: unknown) => row.payload as Task)
 * with a safe mapping that type-narrows `unknown`.
 */

const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src", "app", "api", "sync", "route.ts");
if (!fs.existsSync(file)) {
  console.error("[ERR] File not found:", file);
  process.exit(1);
}

const original = fs.readFileSync(file, "utf8");

// Insert a small type-guard helper near top (after imports) if not present
const guardName = "asRecord";
let patched = original;

if (!new RegExp(`function\\s+${guardName}\\b`).test(patched)) {
  // place after the last import line
  const lines = patched.split(/\r?\n/);
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*import\s/.test(lines[i])) lastImport = i;
  }
  if (lastImport >= 0) {
    lines.splice(
      lastImport + 1,
      0,
      "",
      `function ${guardName}(v: unknown): Record<string, unknown> | null {`,
      `  return typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : null;`,
      `}`,
      ""
    );
    patched = lines.join("\n");
  }
}

// Replace the specific failing map line robustly
// We match ".map((row: unknown) => row.payload as Task)" with whitespace tolerance
const mapPattern = /\.map\(\(row:\s*unknown\)\s*=>\s*row\.payload\s+as\s+Task\s*\)/;

if (!mapPattern.test(patched)) {
  console.error("[ERR] Target map pattern not found. route.ts may differ from expected.");
  console.error("Search for: map((row: unknown) => row.payload as Task)");
  process.exit(1);
}

patched = patched.replace(mapPattern, `.flatMap((row: unknown) => {
    const r = ${guardName}(row);
    const payload = r ? (r["payload"] as unknown) : null;
    return payload ? [payload as Task] : [];
  })`);

// Backup + write
const bak = file + `.bak.${Date.now()}`;
fs.writeFileSync(bak, original, "utf8");
fs.writeFileSync(file, patched, "utf8");

console.log("[OK] Patched route.ts unknown row handling");
console.log("Backup:", bak);
