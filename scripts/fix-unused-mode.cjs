/**
 * scripts/fix-unused-mode.cjs
 * Fix ESLint: @typescript-eslint/no-unused-vars for `_mode`
 * by inserting `void _mode;` at top of component body if `_mode` exists.
 */

const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "src/components/task-form.tsx");
if (!fs.existsSync(file)) {
  console.error("Not found:", file);
  process.exit(1);
}

const original = fs.readFileSync(file, "utf8");
let s = original;

// Only act if `_mode` exists as an identifier
if (!/\b_mode\b/.test(s)) {
  console.log("[OK] No _mode found. Nothing to do.");
  process.exit(0);
}

// If already has `void _mode;` then no-op
if (/\bvoid\s+_mode\s*;/.test(s)) {
  console.log("[OK] void _mode already exists. Nothing to do.");
  process.exit(0);
}

// Insert `void _mode;` right after the first opening brace of the component function body.
// This is intentionally simple and safe enough for typical TSX components.
const inserted = s.replace(
  /(\)\s*=>\s*\{\s*\n)|(\)\s*\{\s*\n)/,
  (m) => m + "  void _mode;\n"
);

// If the arrow/function pattern wasn't found, fallback: insert after first `{` in file (safer than failing)
if (inserted === s) {
  s = s.replace(/\{\s*\n/, (m) => m + "  void _mode;\n");
} else {
  s = inserted;
}

// Backup + write
const bak = file + `.bak.${Date.now()}`;
fs.writeFileSync(bak, original, "utf8");
fs.writeFileSync(file, s, "utf8");

console.log("[OK] Patched task-form.tsx to satisfy no-unused-vars for _mode");
console.log("Backup:", bak);
