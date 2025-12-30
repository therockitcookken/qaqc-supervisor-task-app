/**
 * Remove stray `void _mode;` statements from src/components/task-form.tsx
 * (they can break TypeScript if inserted into a scope where _mode doesn't exist).
 *
 * Run: node scripts/remove-void-mode.cjs
 */

const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src", "components", "task-form.tsx");
if (!fs.existsSync(file)) {
  console.error("[ERR] File not found:", file);
  process.exit(1);
}

const original = fs.readFileSync(file, "utf8");
const lines = original.split(/\r?\n/);

const kept = [];
let removed = 0;

for (const line of lines) {
  if (/^\s*void\s+_mode\s*;\s*$/.test(line)) {
    removed++;
    continue;
  }
  kept.push(line);
}

if (removed === 0) {
  console.log("[OK] No `void _mode;` found. Nothing to remove.");
  process.exit(0);
}

const patched = kept.join("\n");
const bak = file + `.bak.${Date.now()}`;
fs.writeFileSync(bak, original, "utf8");
fs.writeFileSync(file, patched, "utf8");

console.log(`[OK] Removed ${removed} line(s) of \`void _mode;\``);
console.log("Backup:", bak);
