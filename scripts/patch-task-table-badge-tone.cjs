/**
 * Patch src/components/task-table.tsx:
 * Replace:
 *   <Badge tone={toneStatus as unknown}>
 *   <Badge tone={tonePrio as unknown}>
 * With casts to Badge tone union type.
 */

const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src", "components", "task-table.tsx");
if (!fs.existsSync(file)) {
  console.error("[ERR] File not found:", file);
  process.exit(1);
}

const original = fs.readFileSync(file, "utf8");

const toneType = '("neutral" | "success" | "warn" | "danger" | "info" | undefined)';

let patched = original;
let changed = 0;

if (/\btoneStatus\s+as\s+unknown\b/.test(patched)) {
  patched = patched.replace(/\btoneStatus\s+as\s+unknown\b/g, `toneStatus as ${toneType}`);
  changed++;
}
if (/\btonePrio\s+as\s+unknown\b/.test(patched)) {
  patched = patched.replace(/\btonePrio\s+as\s+unknown\b/g, `tonePrio as ${toneType}`);
  changed++;
}

if (changed === 0) {
  console.error("[ERR] Did not find `toneStatus as unknown` or `tonePrio as unknown`.");
  process.exit(1);
}

const bak = file + `.bak.${Date.now()}`;
fs.writeFileSync(bak, original, "utf8");
fs.writeFileSync(file, patched, "utf8");

console.log(`[OK] Patched Badge tone casts (${changed} replacement group(s))`);
console.log("Backup:", bak);
