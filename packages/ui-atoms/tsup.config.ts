import { defineConfig } from "tsup";

// Unbundled: one output file per source file, so each file's own `"use client"`
// directive is preserved by esbuild's transform and nothing is hoisted into shared
// chunks (the classic "directive lost in chunk" failure of bundled RSC libraries).
// Declarations come from `tsc -p tsconfig.build.json` (same file layout).
// `src/` holds shipped code only — every test lives in `packages/ui-atoms/__tests__/` —
// so the entry globs need no test/helper exclusions.
export default defineConfig((options) => ({
  entry: ["src/**/*.ts", "src/**/*.tsx"],
  format: ["esm"],
  bundle: false,
  splitting: false,
  sourcemap: true,
  // tsup wipes `dist/` before *every* rebuild in watch mode. Consumers (the playground's
  // vite dev server) resolve this workspace package to `dist/` through the pnpm symlink,
  // so a wipe mid-session breaks their imports — only clean for one-shot builds.
  clean: !options.watch,
  dts: false,
  target: "es2022",
  outDir: "dist",
  esbuildOptions(esbuild) {
    esbuild.jsx = "automatic";
  },
}));
