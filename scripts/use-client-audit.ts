#!/usr/bin/env tsx
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const HOOK = /\buse[A-Z][A-Za-z0-9]*\s*\(/;
const BROWSER =
  /\b(window|document|navigator|localStorage|sessionStorage|matchMedia|requestAnimationFrame)\b/;
const HANDLER = /\son[A-Z][A-Za-z]*=\{\s*(\(|function\b|[A-Za-z_$][\w$]*\s*=>)/;
const CONTEXT = /createContext\s*\(/;

/**
 * Modules whose runtime is client-only but which ship **no** `"use client"`
 * directive of their own. The four rules above only read the file's own text,
 * so without this list a hook-free wrapper around one of these lands in
 * `server` and a consumer importing it from a React Server Component fails at
 * import — `createContext is not supported in Server Components` — or throws
 * on the first hook. A directive the rule cannot derive must never be dropped
 * silently, so the dependency is part of the rule.
 *
 * Verified at the versions this package pins (2026-09-20):
 * - `@daypicker/react` (react-day-picker 10.0.1) — no directive anywhere in
 *   `dist/`; `dist/esm/useDayPicker.js` calls `createContext` at module scope.
 * - `react-resizable-panels` 3.0.6 — no directive in `dist/`; two module-scope
 *   `createContext` calls.
 * - `motion` (framer-motion 12) — `motion` is re-exported from
 *   `dist/es/render/components/motion/proxy.mjs`, which carries no directive
 *   (the `context/*` siblings that do are not what `motion` comes from).
 * - `embla-carousel-react` 8.6.0 — a hook library, no directive in `dist/`.
 *
 * `@base-ui/react` is deliberately absent: it ships `'use client'` on every
 * client part, so importing it says nothing about which side of the boundary
 * the importing file belongs on. `@headless-tree/core` is absent too — it is
 * framework-agnostic logic, and its only consumer (`tree`) is client by the
 * hook rule.
 */
const CLIENT_ONLY_MODULES: readonly string[] = [
  "@daypicker/react",
  "embla-carousel-react",
  "motion",
  "react-resizable-panels",
];

/** `from "x"` in a value import, plus bare side-effect `import "x"`. */
const VALUE_IMPORT = /\bimport\s+(type\s+)?[^;]*?\bfrom\s*["']([^"']+)["']/g;
const SIDE_EFFECT_IMPORT = /\bimport\s*["']([^"']+)["']/g;

function stripComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

/** Module specifiers the file pulls into the *runtime* graph. */
export function runtimeImports(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(VALUE_IMPORT))
    if (!m[1] && m[2]) out.push(m[2]); // `import type …` is erased
  for (const m of text.matchAll(SIDE_EFFECT_IMPORT)) if (m[1]) out.push(m[1]);
  return out;
}

function importsClientOnlyModule(text: string): boolean {
  return runtimeImports(text).some((spec) =>
    CLIENT_ONLY_MODULES.some((m) => spec === m || spec.startsWith(`${m}/`)),
  );
}

export function needsClientDirective(text: string): boolean {
  const t = stripComments(text);
  return (
    HOOK.test(t) ||
    BROWSER.test(t) ||
    HANDLER.test(t) ||
    CONTEXT.test(t) ||
    importsClientOnlyModule(t)
  );
}

export function auditUseClient(
  files: readonly { path: string; text: string }[],
) {
  return files.map((f) => ({
    path: f.path,
    needsClient: needsClientDirective(f.text),
    hasDirective: /^\s*["']use client["'];/.test(f.text),
  }));
}

function main(): void {
  const root = resolve(import.meta.dirname, "..");
  const pkg = join(root, "packages", "ui-atoms");
  const paths = execFileSync(
    "git",
    ["-C", root, "ls-files", "-z", "packages/ui-atoms/src"],
    { encoding: "utf8" },
  )
    .split("\0")
    .filter((p) => /\.tsx?$/.test(p)); // `src` is shipped code only — tests live in packages/ui-atoms/__tests__
  const result = auditUseClient(
    paths.map((p) => ({
      path: relative(pkg, join(root, p)),
      text: readFileSync(join(root, p), "utf8"),
    })),
  );
  const wrong = result.filter((r) => r.needsClient !== r.hasDirective);
  const classification = {
    client: result
      .filter((r) => r.needsClient)
      .map((r) => r.path)
      .sort(),
    server: result
      .filter((r) => !r.needsClient)
      .map((r) => r.path)
      .sort(),
  };
  const jsonPath = join(pkg, "use-client.json");
  if (process.argv.includes("--write")) {
    writeFileSync(jsonPath, `${JSON.stringify(classification, null, 2)}\n`);
    console.log(
      `use-client-audit: wrote ${jsonPath} (${classification.client.length} client, ${classification.server.length} server)`,
    );
  }
  for (const w of wrong) {
    console.error(
      `${w.path}: ${w.needsClient ? 'needs "use client"' : 'must NOT carry "use client"'}`,
    );
  }
  if (process.argv.includes("--check")) {
    const committed = JSON.parse(readFileSync(jsonPath, "utf8"));
    if (JSON.stringify(committed) !== JSON.stringify(classification)) {
      console.error(
        "use-client-audit: use-client.json is stale — run `pnpm exec tsx scripts/use-client-audit.ts --write` and review the diff",
      );
      process.exit(1);
    }
  }
  if (wrong.length > 0) process.exit(1);
  console.log(`use-client-audit: ${result.length} files consistent`);
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(import.meta.filename)
)
  main();
