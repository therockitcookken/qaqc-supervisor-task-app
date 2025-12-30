/**
 * Insert:
 *   // eslint-disable-next-line @typescript-eslint/no-unused-vars
 * right above the FIRST line containing `mode: _mode` in src/components/task-form.tsx
 *
 * Run:
 *   node scripts/patch-eslint-disable-mode.cjs
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

const targetRegex = /\bmode\s*:\s*_mode\b/;
const disableLine = "// eslint-disable-next-line @typescript-eslint/no-unused-vars";

let patched = false;

for (let i = 0; i < lines.length; i++) {
  if (targetRegex.test(lines[i])) {
    // If already has the disable comment on the line above, do nothing
    const prev = i > 0 ? lines[i - 1].trim() : "";
    if (prev === disableLine) {
      console.log("[OK] Disable comment already exists. No changes.");
      process.exit(0);
    }

    // Keep indentation aligned to the target line
    const indent = (lines[i].match(/^(\s*)/) || ["", ""])[1];
    lines.splice(i, 0, indent + disableLine);
    patched = true;
    break;
  }
}

if (!patched) {
  console.error("[ERR] Could not find `mode: _mode` in task-form.tsx");
  console.error("Tip: search in file for `_mode` and confirm it exists.");
  process.exit(1);
}

// Backup then write
const bak = file + `.bak.${Date.now()}`;
fs.writeFileSync(bak, original, "utf8");
fs.writeFileSync(file, lines.join("\n"), "utf8");

console.log("[OK] Patched task-form.tsx");
console.log("Backup:", bak);
