/* scripts/auto-fix-eslint.cjs
 * Auto-fix ESLint blockers:
 * - Replace explicit `any` with `unknown` in known files
 * - Rename unused `mode` prop to `_mode` in task-form.tsx (common pattern)
 *
 * Run: node scripts/auto-fix-eslint.cjs
 */

const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();

const targets = [
  "src/app/api/sync/route.ts",
  "src/components/task-form.tsx",
  "src/components/task-table.tsx",
];

function read(file) {
  return fs.readFileSync(path.join(projectRoot, file), "utf8");
}

function write(file, content) {
  fs.writeFileSync(path.join(projectRoot, file), content, "utf8");
}

function backup(file, content) {
  const bak = `${file}.bak.${Date.now()}`;
  fs.writeFileSync(path.join(projectRoot, bak), content, "utf8");
  return bak;
}

function replaceAnyWithUnknown(s) {
  // Replace type annotations ": any" -> ": unknown"
  s = s.replace(/:\s*any\b/g, ": unknown");

  // Replace "as any" -> "as unknown"
  s = s.replace(/\bas\s+any\b/g, "as unknown");

  // Replace generic "<any>" -> "<unknown>" (Type assertions / generics)
  s = s.replace(/<\s*any\s*>/g, "<unknown>");

  // Replace "Record<string, any>" -> "Record<string, unknown>"
  s = s.replace(/Record<\s*string\s*,\s*any\s*>/g, "Record<string, unknown>");

  return s;
}

function fixUnusedModeInTaskForm(s) {
  // Common patterns:
  // 1) function TaskForm({ mode, ...rest })  -> { mode: _mode, ...rest }
  s = s.replace(
    /(\{\s*)(mode)(\s*,)/g,
    (_, a, _mode, c) => `${a}mode: _mode${c}`
  );

  // 2) const { mode } = props -> const { mode: _mode } = props
  s = s.replace(
    /(const\s*\{\s*)(mode)(\s*\}\s*=\s*props\b)/g,
    (_, a, _mode, c) => `${a}mode: _mode${c}`
  );

  // 3) const { mode } = something -> const { mode: _mode } = something
  s = s.replace(
    /(const\s*\{\s*)(mode)(\s*\}\s*=\s*[a-zA-Z0-9_$.]+\b)/g,
    (_, a, _mode, c) => `${a}mode: _mode${c}`
  );

  return s;
}

let changed = 0;

for (const file of targets) {
  const abs = path.join(projectRoot, file);
  if (!fs.existsSync(abs)) {
    console.log(`[SKIP] Not found: ${file}`);
    continue;
  }

  const original = read(file);
  let next = original;

  next = replaceAnyWithUnknown(next);

  if (file.endsWith("task-form.tsx")) {
    next = fixUnusedModeInTaskForm(next);
  }

  if (next !== original) {
    const bak = backup(file, original);
    write(file, next);
    changed++;
    console.log(`[OK] Patched: ${file} (backup: ${bak})`);
  } else {
    console.log(`[OK] No changes needed: ${file}`);
  }
}

console.log(`Done. Files changed: ${changed}`);
