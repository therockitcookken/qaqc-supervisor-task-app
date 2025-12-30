/**
 * Insert `void _mode;` right AFTER the line that introduces `_mode`.
 * Handles common patterns:
 * - `{ mode: _mode, ... }` in function params
 * - `const { mode: _mode, ... } = props`
 */

const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/components/task-form.tsx");
if (!fs.existsSync(file)) {
  console.error("Not found:", file);
  process.exit(1);
}

const original = fs.readFileSync(file, "utf8");

// If no _mode, nothing to do
if (!/\b_mode\b/.test(original)) {
  console.log("[OK] No _mode found. Nothing to do.");
  process.exit(0);
}

// If already has "void _mode;" somewhere AFTER _mode declaration, still may fail; we enforce by placing it right after declaration line.
const lines = original.split(/\r?\n/);

let changed = false;

// Helper: find first line that introduces `_mode`
function isModeDeclLine(line) {
  // destructuring mapping mode:_mode OR assignment to _mode
  return (
    /\bmode\s*:\s*_mode\b/.test(line) || // { mode: _mode }
    /\b_mode\s*=\s*/.test(line)          // _mode = ...
  );
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (isModeDeclLine(line)) {
    // If next lines already include "void _mode;" nearby, skip
    const lookahead = lines.slice(i + 1, i + 6).join("\n");
    if (/\bvoid\s+_mode\s*;/.test(lookahead)) {
      console.log("[OK] void _mode already placed after declaration. Nothing to do.");
      process.exit(0);
    }

    // Insert immediately after declaration line, keeping indentation same as that line
    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : "";
    lines.splice(i + 1, 0, `${indent}void _mode;`);
    changed = true;
    break;
  }
}

if (!changed) {
  console.log("[WARN] Could not find the _mode declaration line to patch.");
  console.log("Tip: open src/components/task-form.tsx and search for `mode: _mode`.");
  process.exit(1);
}

// Backup + write
const bak = file + `.bak.${Date.now()}`;
fs.writeFileSync(bak, original, "utf8");
fs.writeFileSync(file, lines.join("\n"), "utf8");

console.log("[OK] Patched: inserted `void _mode;` right after _mode declaration");
console.log("Backup:", bak);
