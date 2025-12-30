/**
 * Patch src/components/task-form.tsx:
 * Replace: e.target.value as unknown
 * With:    e.target.value as (typeof TASK_CATEGORIES)[number]
 *
 * This matches the union of allowed categories derived from TASK_CATEGORIES.
 */

const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src", "components", "task-form.tsx");
if (!fs.existsSync(file)) {
  console.error("[ERR] File not found:", file);
  process.exit(1);
}

const original = fs.readFileSync(file, "utf8");

// We target the exact problematic pattern in onChange for category
// onChange={(e) => update("category", e.target.value as unknown)}
const pattern = /update\("category",\s*e\.target\.value\s+as\s+unknown\)/g;

if (!pattern.test(original)) {
  console.error("[ERR] Target pattern not found. task-form.tsx may differ.");
  console.error('Expected to find: update("category", e.target.value as unknown)');
  process.exit(1);
}

const patched = original.replace(
  pattern,
  'update("category", e.target.value as (typeof TASK_CATEGORIES)[number])'
);

const bak = file + `.bak.${Date.now()}`;
fs.writeFileSync(bak, original, "utf8");
fs.writeFileSync(file, patched, "utf8");

console.log("[OK] Patched category onChange cast");
console.log("Backup:", bak);
