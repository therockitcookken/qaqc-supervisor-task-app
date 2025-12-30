/**
 * Patch src/components/task-table.tsx:
 * Replace: status: e.target.value as unknown
 * With:    status: e.target.value as ("" | (typeof TASK_STATUSES)[number])
 */

const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src", "components", "task-table.tsx");
if (!fs.existsSync(file)) {
  console.error("[ERR] File not found:", file);
  process.exit(1);
}

const original = fs.readFileSync(file, "utf8");

// Target the exact object literal field pattern
const pattern = /status:\s*e\.target\.value\s+as\s+unknown/g;

if (!pattern.test(original)) {
  console.error("[ERR] Target pattern not found in task-table.tsx");
  console.error("Expected: status: e.target.value as unknown");
  process.exit(1);
}

const patched = original.replace(
  pattern,
  'status: e.target.value as ("" | (typeof TASK_STATUSES)[number])'
);

const bak = file + `.bak.${Date.now()}`;
fs.writeFileSync(bak, original, "utf8");
fs.writeFileSync(file, patched, "utf8");

console.log("[OK] Patched task-table filter status cast");
console.log("Backup:", bak);
